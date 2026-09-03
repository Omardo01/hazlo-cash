import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  agregarCuenta,
  bancoPorClabe,
  eliminarCuenta,
  estadoRetiro,
  etiquetaCuenta,
  getCuentas,
  getRetiros,
  marcarPredeterminada,
  type CuentaBancaria,
  type Retiro,
} from '@/lib/simulacion/retiros';
import { Icon } from './icons';
import { Fade, PressableScale, STAGGER } from './motion';
import { BG, C, F, FG, MUTED, R } from './theme';

type Vista = 'historial' | 'cuentas';

function fecha(iso: string): string {
  const d = new Date(iso);
  const hoy = d.toDateString() === new Date().toDateString();
  const hora = d.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
  return hoy ? `Hoy · ${hora}` : `${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} · ${hora}`;
}

// ── Alta de cuenta ────────────────────────────────────────────────────────────
function FormularioCuenta({ onListo, onCancelar }: { onListo: () => void; onCancelar: () => void }) {
  const [alias, setAlias] = useState('');
  const [titular, setTitular] = useState('');
  const [clabe, setClabe] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // El banco se revela en cuanto hay prefijo: da confianza de que el número es
  // el correcto antes de terminar de escribir los 18 dígitos.
  const banco = clabe.length >= 3 ? bancoPorClabe(clabe) : null;

  const guardar = async () => {
    setError(null);
    setGuardando(true);
    const r = await agregarCuenta({ alias, titular, clabe });
    setGuardando(false);
    if (r.ok) onListo();
    else setError(r.error);
  };

  return (
    <Fade key="alta" desde={10}>
      <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>Titular de la cuenta</Text>
      <View style={{ borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 13, marginBottom: 16 }}>
        <TextInput
          value={titular}
          onChangeText={setTitular}
          placeholder="Como aparece en tu banco"
          placeholderTextColor={MUTED}
          autoCapitalize="words"
          style={{ fontFamily: F.reg, fontSize: 14, color: FG, padding: 0 }}
        />
      </View>

      <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>CLABE interbancaria</Text>
      <View style={{ borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 13 }}>
        <TextInput
          value={clabe}
          onChangeText={(t) => setClabe(t.replace(/\D/g, '').slice(0, 18))}
          placeholder="18 dígitos"
          placeholderTextColor={MUTED}
          keyboardType="number-pad"
          style={{ fontFamily: F.semi, fontSize: 16, color: FG, padding: 0, letterSpacing: 1.5 }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 7, marginBottom: 16 }}>
        <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>{clabe.length}/18</Text>
        {banco && (
          <Fade key={banco}>
            <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.primary }}>{banco}</Text>
          </Fade>
        )}
      </View>

      <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>Alias (opcional)</Text>
      <View style={{ borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 13, marginBottom: 16 }}>
        <TextInput
          value={alias}
          onChangeText={setAlias}
          placeholder="Ej. Mi cuenta de nómina"
          placeholderTextColor={MUTED}
          style={{ fontFamily: F.reg, fontSize: 14, color: FG, padding: 0 }}
        />
      </View>

      {error && (
        <Fade key={error}>
          <View style={{ backgroundColor: 'rgba(235,78,0,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }}>
            <Text style={{ fontFamily: F.base, fontSize: 12.5, color: C.accent }}>{error}</Text>
          </View>
        </Fade>
      )}

      <View style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', gap: 10 }}>
        <Icon name="settings" size={15} color={MUTED} />
        <Text style={{ flex: 1, fontFamily: F.reg, fontSize: 11.5, color: MUTED, lineHeight: 17 }}>
          Solo guardamos el banco y los últimos 4 dígitos en tu teléfono. La CLABE completa no se almacena.
        </Text>
      </View>

      <PressableScale
        onPress={guardar}
        disabled={guardando}
        style={{ height: 52, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center', opacity: guardando ? 0.7 : 1 }}>
        {guardando ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Guardar cuenta</Text>}
      </PressableScale>
      <PressableScale onPress={onCancelar} style={{ height: 48, marginTop: 10, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: F.semi, fontSize: 13, color: MUTED }}>Cancelar</Text>
      </PressableScale>
    </Fade>
  );
}

// ── Tarjeta de cuenta ─────────────────────────────────────────────────────────
function TarjetaCuenta({
  cuenta,
  delay,
  onPredeterminada,
  onEliminar,
}: {
  cuenta: CuentaBancaria;
  delay: number;
  onPredeterminada: () => void;
  onEliminar: () => void;
}) {
  return (
    <Fade delay={delay} desde={12}>
      <View style={{ borderRadius: R.lg, padding: 16, marginBottom: 10, backgroundColor: '#fff', borderWidth: cuenta.predeterminada ? 1 : 0.5, borderColor: cuenta.predeterminada ? C.primary : 'rgba(0,0,0,0.06)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="wallet" size={20} color={C.primary} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>{cuenta.banco}</Text>
              {cuenta.predeterminada && (
                <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, backgroundColor: `${C.primary}18` }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 9.5, color: C.primary }}>PREDETERMINADA</Text>
                </View>
              )}
            </View>
            <Text style={{ fontFamily: F.bold, fontSize: 13, color: FG, letterSpacing: 1.2, marginTop: 3 }}>•••• {cuenta.ultimos4}</Text>
            <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 2 }}>
              {cuenta.titular}
              {cuenta.alias !== cuenta.banco ? ` · ${cuenta.alias}` : ''}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          {!cuenta.predeterminada && (
            <PressableScale
              onPress={onPredeterminada}
              style={{ flex: 1, height: 40, borderRadius: R.sm, backgroundColor: '#F2F4F7', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: FG }}>Usar por defecto</Text>
            </PressableScale>
          )}
          <PressableScale
            onPress={onEliminar}
            style={{ flex: 1, height: 40, borderRadius: R.sm, backgroundColor: 'rgba(235,78,0,0.08)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: C.accent }}>Quitar</Text>
          </PressableScale>
        </View>
      </View>
    </Fade>
  );
}

// ── Pantalla ──────────────────────────────────────────────────────────────────
export function Retiros({
  visible,
  onClose,
  vistaInicial = 'historial',
}: {
  visible: boolean;
  onClose: () => void;
  vistaInicial?: Vista;
}) {
  const [vista, setVista] = useState<Vista>(vistaInicial);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [retiros, setRetiros] = useState<Retiro[]>([]);
  const [alta, setAlta] = useState(false);
  const [cargando, setCargando] = useState(true);
  // Redibuja mientras haya retiros "en camino" para que el estado avance solo.
  const [, setTick] = useState(0);
  // Se incrementa tras cada cambio (alta, baja, predeterminada) para releer.
  const [recarga, setRecarga] = useState(0);
  const cargar = useCallback(() => setRecarga((n) => n + 1), []);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [c, r] = await Promise.all([getCuentas(), getRetiros()]);
      if (!vivo) return;
      setCuentas(c);
      setRetiros(r);
      setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [recarga]);

  useEffect(() => {
    if (!retiros.some((r) => estadoRetiro(r) === 'procesando')) return;
    const t = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, [retiros]);

  const confirmarBorrado = (c: CuentaBancaria) => {
    Alert.alert('Quitar cuenta', `Se quitará ${etiquetaCuenta(c)} de tus destinos de retiro.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: async () => {
          await eliminarCuenta(c.id);
          cargar();
        },
      },
    ]);
  };

  const total = retiros.reduce((s, r) => s + r.monto, 0);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: BG }}>
        {/* Header */}
        <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <PressableScale
            onPress={onClose}
            style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}>
            <Icon name="chevR" size={18} color={FG} sw={2} />
          </PressableScale>
          <View>
            <Text style={{ fontFamily: F.semi, fontSize: 10, color: C.primary, textTransform: 'uppercase', letterSpacing: 1 }}>Tu dinero</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4 }}>Retiros</Text>
          </View>
        </View>

        {/* Selector de vista */}
        {!alta && (
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 }}>
            {(['historial', 'cuentas'] as Vista[]).map((v) => {
              const on = vista === v;
              return (
                <PressableScale
                  key={v}
                  onPress={() => setVista(v)}
                  style={{ flex: 1, height: 42, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? FG : '#fff', borderWidth: on ? 0 : 0.5, borderColor: 'rgba(0,0,0,0.08)' }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 13, color: on ? '#fff' : FG }}>
                    {v === 'historial' ? 'Historial' : `Cuentas${cuentas.length ? ` · ${cuentas.length}` : ''}`}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        )}

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={20}>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {cargando && (
              <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                <ActivityIndicator color={C.primary} />
              </View>
            )}

            {/* ── Alta de cuenta ── */}
            {!cargando && alta && (
              <FormularioCuenta
                onCancelar={() => setAlta(false)}
                onListo={() => {
                  setAlta(false);
                  cargar();
                }}
              />
            )}

            {/* ── Historial ── */}
            {!cargando && !alta && vista === 'historial' && (
              <Fade key="historial">
                {retiros.length === 0 ? (
                  <View style={{ borderRadius: R.lg, padding: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
                    <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>Todavía no has retirado</Text>
                    <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 19 }}>
                      Cuando saques dinero a tu cuenta, cada movimiento aparecerá aquí con su estado.
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={{ borderRadius: R.lg, padding: 18, marginBottom: 16, backgroundColor: '#0D0D0D' }}>
                      <Text style={{ fontFamily: F.semi, fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>Total retirado</Text>
                      <Text style={{ fontFamily: F.bold, fontSize: 32, color: '#fff', letterSpacing: -1, marginTop: 4 }}>${total.toFixed(2)}</Text>
                      <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                        {retiros.length} {retiros.length === 1 ? 'movimiento' : 'movimientos'}
                      </Text>
                    </View>

                    {retiros.map((r, i) => {
                      const estado = estadoRetiro(r);
                      const enCamino = estado === 'procesando';
                      return (
                        <Fade key={r.id} delay={i * STAGGER} desde={12}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 8, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
                            <View style={{ width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: enCamino ? `${C.primary}15` : 'rgba(0,168,150,0.12)' }}>
                              {enCamino ? <ActivityIndicator size="small" color={C.primary} /> : <Icon name="check" size={18} color="#00A896" sw={2.4} />}
                            </View>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>−${r.monto.toFixed(2)}</Text>
                                <Text style={{ fontFamily: F.semi, fontSize: 11, color: enCamino ? C.primary : '#00A896' }}>
                                  {enCamino ? 'En camino' : 'Enviado'}
                                </Text>
                              </View>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                                <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, flex: 1, paddingRight: 6 }}>{r.cuenta}</Text>
                                <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>{fecha(r.creada)}</Text>
                              </View>
                            </View>
                          </View>
                        </Fade>
                      );
                    })}
                  </>
                )}

                <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: MUTED, textAlign: 'center', marginTop: 16, lineHeight: 16 }}>
                  Simulación · aún no hay dispersión bancaria real.
                </Text>
              </Fade>
            )}

            {/* ── Cuentas ── */}
            {!cargando && !alta && vista === 'cuentas' && (
              <Fade key="cuentas">
                {cuentas.length === 0 ? (
                  <View style={{ borderRadius: R.lg, padding: 22, marginBottom: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
                    <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>Sin cuentas registradas</Text>
                    <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 19 }}>
                      Registra la cuenta donde quieres recibir tu dinero. Puedes tener varias y elegir cuál usar por defecto.
                    </Text>
                  </View>
                ) : (
                  cuentas.map((c, i) => (
                    <TarjetaCuenta
                      key={c.id}
                      cuenta={c}
                      delay={i * STAGGER}
                      onPredeterminada={async () => {
                        await marcarPredeterminada(c.id);
                        cargar();
                      }}
                      onEliminar={() => confirmarBorrado(c)}
                    />
                  ))
                )}

                <PressableScale
                  onPress={() => setAlta(true)}
                  style={{ height: 52, borderRadius: R.md, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                  <Icon name="plus" size={18} color="#fff" sw={2.2} />
                  <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Registrar cuenta</Text>
                </PressableScale>
              </Fade>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
