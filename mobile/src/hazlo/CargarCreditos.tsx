import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, View } from 'react-native';

import { useAtras } from '@/lib/atras';
import { invalidar } from '@/lib/datos/cache';
import { K } from '@/lib/datos/consultas';
import { solicitarRecarga } from '@/lib/services/recargas';
import type { BusinessAdmin, SolicitudRecarga } from '@/lib/types';
import { Icon } from './icons';
import { Fade, PressableScale, STAGGER } from './motion';
import { BG, C, F, FG, MUTED, R } from './theme';
import { CajaCampo } from './ui';

/**
 * Cargar créditos por transferencia. Dos pasos en un solo Modal (contenido
 * intercambiable, nunca desmontar el Modal):
 *   1) ¿Cuántos créditos quieres cargar? → crea la solicitud con su referencia.
 *   2) Instrucciones para transferir. El admin la acepta cuando ve llegar el
 *      dinero: por ahora la verificación es humana, sin conciliación.
 * Si ya hay una solicitud pendiente, abre directo en el paso 2.
 */

// Cuenta para recibir transferencias. DATOS DE EJEMPLO: cambiar por la cuenta
// real de Hazlo Cash antes de que un negocio transfiera de verdad.
const CUENTA = {
  banco: 'Banco por confirmar',
  beneficiario: 'HAZLO CASH, S.A. de C.V.',
  clabe: '000 000 0000000000 0',
};

const MONTOS = [500, 1000, 2000, 5000];
const MINIMO = 100;
const MAXIMO = 100_000;

const money = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

function FilaCopiable({ label, valor, copiar }: { label: string; valor: string; copiar?: string }) {
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 1600);
    return () => clearTimeout(t);
  }, [copiado]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,13,0.08)' }}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>{label}</Text>
        <Text selectable style={{ fontFamily: F.semi, fontSize: 15, color: FG, marginTop: 2, letterSpacing: copiar ? 0.4 : 0 }}>
          {valor}
        </Text>
      </View>
      {copiar !== undefined && (
        <PressableScale
          onPress={async () => {
            await Clipboard.setStringAsync(copiar);
            setCopiado(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Copiar ${label}`}
          hitSlop={6}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 11, borderRadius: 999, backgroundColor: copiado ? 'rgba(0,168,150,0.14)' : `${C.primary}14` }}>
          <Icon name={copiado ? 'check' : 'copy'} size={13} color={copiado ? '#00806F' : C.accent} sw={2.2} />
          <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: copiado ? '#00806F' : C.accent }}>{copiado ? 'Copiado' : 'Copiar'}</Text>
        </PressableScale>
      )}
    </View>
  );
}

function PasoMonto({ negocio, onCreada }: { negocio: BusinessAdmin; onCreada: (s: SolicitudRecarga) => void }) {
  const [texto, setTexto] = useState('1000');
  const [foco, setFoco] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monto = Number(texto.replace(/[^\d.]/g, '')) || 0;
  const fijo = negocio.comision_tipo === 'fijo' && Number(negocio.comision_valor) > 0;
  const ventas = fijo ? Math.floor(monto / Number(negocio.comision_valor)) : null;

  const continuar = async () => {
    if (monto < MINIMO) return setError(`El mínimo es ${money(MINIMO)}.`);
    if (monto > MAXIMO) return setError(`El máximo por recarga es ${money(MAXIMO)}.`);
    setError(null);
    setEnviando(true);
    const r = await solicitarRecarga(monto);
    setEnviando(false);
    if (!r.ok || !r.solicitud) return setError(r.error ?? 'No pudimos crear tu recarga. Inténtalo de nuevo.');
    onCreada(r.solicitud);
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
      <Fade desde={10}>
        <Text style={{ fontFamily: F.bold, fontSize: 24, color: FG, letterSpacing: -0.5, lineHeight: 30 }}>¿Cuántos créditos quieres cargar?</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 19 }}>
          Con tus créditos se pagan las comisiones de cada venta recomendada. 1 crédito = $1.
        </Text>
      </Fade>

      <Fade delay={STAGGER} desde={10} style={{ marginTop: 22 }}>
        <CajaCampo activo={foco}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 30, color: MUTED }}>$</Text>
            <TextInput
              value={texto}
              onChangeText={(t) => {
                setTexto(t.replace(/[^\d]/g, '').slice(0, 6));
                setError(null);
              }}
              onFocus={() => setFoco(true)}
              onBlur={() => setFoco(false)}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={MUTED}
              accessibilityLabel="Créditos a cargar"
              style={{ flex: 1, fontFamily: F.bold, fontSize: 30, color: FG, padding: 0, letterSpacing: -0.8 }}
            />
            <Text style={{ fontFamily: F.semi, fontSize: 13, color: MUTED }}>MXN</Text>
          </View>
        </CajaCampo>
        {/* Alto fijo: el cálculo cambia sin empujar lo de abajo. */}
        <View style={{ height: 22, justifyContent: 'center', marginTop: 6 }}>
          {ventas !== null && monto > 0 && (
            <Text style={{ fontFamily: F.base, fontSize: 12, color: MUTED }}>
              Alcanzan para {ventas} {ventas === 1 ? 'venta' : 'ventas'} con tu comisión de {money(Number(negocio.comision_valor))}
            </Text>
          )}
        </View>
      </Fade>

      <Fade delay={STAGGER * 2} desde={10} style={{ marginTop: 6 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {MONTOS.map((m) => {
            const sel = monto === m;
            return (
              <PressableScale
                key={m}
                onPress={() => {
                  setTexto(String(m));
                  setError(null);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: sel }}
                style={{ paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999, backgroundColor: sel ? FG : '#fff', borderWidth: 1, borderColor: sel ? FG : 'rgba(0,0,0,0.08)' }}>
                <Text style={{ fontFamily: F.semi, fontSize: 13, color: sel ? '#fff' : FG }}>{money(m)}</Text>
              </PressableScale>
            );
          })}
        </View>
      </Fade>

      {error && (
        <Fade key={error}>
          <View style={{ backgroundColor: 'rgba(235,78,0,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 16 }}>
            <Text style={{ fontFamily: F.base, fontSize: 12, color: C.accent }}>{error}</Text>
          </View>
        </Fade>
      )}

      <Fade delay={STAGGER * 3} desde={10} style={{ marginTop: 24 }}>
        <PressableScale
          onPress={continuar}
          disabled={enviando}
          accessibilityRole="button"
          style={{ height: 52, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center', opacity: enviando ? 0.7 : 1 }}>
          {enviando ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Ver cómo transferir</Text>}
        </PressableScale>
      </Fade>
    </ScrollView>
  );
}

function PasoTransferencia({ solicitud, onListo }: { solicitud: SolicitudRecarga; onListo: () => void }) {
  const pasos = [
    'Desde la app de tu banco, transfiere el monto exacto a la cuenta de abajo.',
    'En el concepto escribe tu referencia: así sabemos que es tuya.',
    'Cuando veamos llegar tu transferencia, cargamos tus créditos y te avisamos.',
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
      <Fade desde={10}>
        <Text style={{ fontFamily: F.bold, fontSize: 24, color: FG, letterSpacing: -0.5 }}>Transfiere {money(solicitud.monto)}</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 19 }}>
          Tu recarga queda esperando a que llegue el dinero. No se cobra comisión por recargar.
        </Text>
        <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(235,78,0,0.09)' }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent }} />
          <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.accent }}>Prueba · la cuenta es de ejemplo, no transfieras</Text>
        </View>
      </Fade>

      <Fade delay={STAGGER} desde={12} style={{ marginTop: 20 }}>
        <View style={{ borderRadius: R.lg, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 2, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: MUTED, marginBottom: 4 }}>Datos para transferir</Text>
          <FilaCopiable label="Monto exacto" valor={`${money(solicitud.monto)} MXN`} copiar={String(solicitud.monto)} />
          <FilaCopiable label="Referencia (va en el concepto)" valor={solicitud.referencia} copiar={solicitud.referencia} />
          <FilaCopiable label="CLABE" valor={CUENTA.clabe} copiar={CUENTA.clabe.replace(/\s/g, '')} />
          <FilaCopiable label="Beneficiario" valor={CUENTA.beneficiario} />
          <FilaCopiable label="Banco" valor={CUENTA.banco} />
        </View>
      </Fade>

      <Fade delay={STAGGER * 2} desde={12} style={{ marginTop: 18 }}>
        {pasos.map((p, i) => (
          <View key={p} style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: `${C.primary}1A`, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: C.accent }}>{i + 1}</Text>
            </View>
            <Text style={{ flex: 1, fontFamily: F.reg, fontSize: 13, color: FG, lineHeight: 19 }}>{p}</Text>
          </View>
        ))}
      </Fade>

      <Fade delay={STAGGER * 3} desde={10} style={{ marginTop: 8 }}>
        <PressableScale
          onPress={onListo}
          accessibilityRole="button"
          style={{ height: 52, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Listo, ya transferí</Text>
        </PressableScale>
      </Fade>
    </ScrollView>
  );
}

export function CargarCreditos({
  negocio,
  pendiente,
  visible,
  onClose,
}: {
  negocio: BusinessAdmin;
  pendiente: SolicitudRecarga | null;
  visible: boolean;
  onClose: () => void;
}) {
  const [creada, setCreada] = useState<SolicitudRecarga | null>(null);
  const solicitud = creada ?? pendiente;

  // Al cerrar, la próxima apertura parte de lo que diga el servidor.
  const cerrar = () => {
    setCreada(null);
    onClose();
  };
  useAtras(visible, cerrar);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={cerrar} presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: BG }}>
        <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <PressableScale
            onPress={cerrar}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            hitSlop={8}
            style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}>
            <Icon name="x" size={17} color={FG} sw={2} />
          </PressableScale>
          <View>
            <Text style={{ fontFamily: F.semi, fontSize: 10, color: C.primary, textTransform: 'uppercase', letterSpacing: 1 }}>{negocio.nombre}</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4 }}>Cargar créditos</Text>
          </View>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Fade key={solicitud ? solicitud.id : 'monto'} style={{ flex: 1 }} desde={8}>
            {solicitud ? (
              <PasoTransferencia solicitud={solicitud} onListo={cerrar} />
            ) : (
              <PasoMonto
                negocio={negocio}
                onCreada={(s) => {
                  setCreada(s);
                  invalidar(K.misRecargas);
                }}
              />
            )}
          </Fade>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
