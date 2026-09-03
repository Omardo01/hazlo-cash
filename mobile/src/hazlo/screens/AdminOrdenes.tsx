import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {
  confirmarOrdenAdmin,
  crearOrdenPrueba,
  eliminarOrdenAdmin,
  rechazarOrdenAdmin,
  type CodigoAdmin,
  type OrdenAdmin,
  type UsuarioAdmin,
} from '@/lib/services/admin';
import { useAdminCodigos, useAdminOrdenes, useAdminUsuarios } from '@/lib/datos/consultas';
import { linkReferido, linkVisita } from '@/lib/services/referrals';
import { Icon } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { ListaSkeleton } from '../Skeleton';
import { BG, C, F, FG, MUTED, R } from '../theme';

type Filtro = 'todas' | 'pendiente' | 'confirmado' | 'rechazado';

const FILTROS: { k: Filtro; l: string }[] = [
  { k: 'todas', l: 'Todas' },
  { k: 'pendiente', l: 'Pendientes' },
  { k: 'confirmado', l: 'Confirmadas' },
  { k: 'rechazado', l: 'Rechazadas' },
];

const COLOR_ESTADO: Record<string, { c: string; bg: string; l: string }> = {
  pendiente: { c: C.primary, bg: `${C.primary}15`, l: 'Pendiente' },
  confirmado: { c: '#00A896', bg: 'rgba(0,168,150,0.12)', l: 'Confirmada' },
  rechazado: { c: C.accent, bg: 'rgba(235,78,0,0.10)', l: 'Rechazada' },
};

function fecha(iso: string): string {
  const d = new Date(iso);
  const hoy = d.toDateString() === new Date().toDateString();
  const hora = d.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
  return hoy ? `Hoy · ${hora}` : `${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} · ${hora}`;
}

// ── Modal genérico de hoja inferior para los flujos del admin ────────────────
function Hoja({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <PressableScale style={{ flex: 1 }} onPress={onClose}>
          <View style={{ flex: 1 }} />
        </PressableScale>
        <Fade desde={24}>
          <View style={{ backgroundColor: BG, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 40, maxHeight: '86%' }}>
            <View style={{ width: 36, height: 5, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.18)', alignSelf: 'center', marginBottom: 16 }} />
            {children}
          </View>
        </Fade>
      </View>
    </Modal>
  );
}

// ── QR de prueba ──────────────────────────────────────────────────────────────
// Dos QR distintos y es importante no confundirlos:
//  · el de la ORDEN (/v/<id>) lo escanea el negocio para cerrar esa venta;
//  · el del CÓDIGO (/r/HAZLO-XXXX) es el que reparte el embajador.
function QrPrueba({ orden, onClose }: { orden: OrdenAdmin | null; onClose: () => void }) {
  const [tipo, setTipo] = useState<'orden' | 'codigo'>('orden');
  if (!orden) return null;
  const valor = tipo === 'orden' ? linkVisita(orden.id) : linkReferido(orden.codigo);

  return (
    <Hoja visible onClose={onClose}>
      <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4 }}>QR de prueba</Text>
      <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 3, marginBottom: 16 }}>
        Escanéalo desde el otro teléfono con la cuenta del negocio.
      </Text>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {([
          ['orden', `Orden #${orden.folio}`],
          ['codigo', orden.codigo],
        ] as const).map(([k, l]) => {
          const on = tipo === k;
          return (
            <PressableScale
              key={k}
              onPress={() => setTipo(k)}
              style={{ flex: 1, height: 40, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? FG : '#fff', borderWidth: on ? 0 : 0.5, borderColor: 'rgba(0,0,0,0.08)' }}>
              <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 12.5, color: on ? '#fff' : FG }}>{l}</Text>
            </PressableScale>
          );
        })}
      </View>

      <Fade key={tipo} style={{ alignItems: 'center' }}>
        <View style={{ padding: 18, borderRadius: R.lg, backgroundColor: '#fff' }}>
          <QRCode value={valor} size={210} color="#0D0D0D" backgroundColor="#fff" ecl="M" />
        </View>
        <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 12, textAlign: 'center', lineHeight: 16 }}>
          {tipo === 'orden'
            ? 'El negocio escanea esto para confirmar esta venta exacta.'
            : 'Este es el QR que reparte el embajador para generar nuevas órdenes.'}
        </Text>
      </Fade>

      <PressableScale onPress={onClose} style={{ marginTop: 18, height: 50, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Cerrar</Text>
      </PressableScale>
    </Hoja>
  );
}

// ── Crear orden de prueba ─────────────────────────────────────────────────────
function CrearOrden({
  codigos,
  usuarios,
  onClose,
  onCreada,
}: {
  codigos: CodigoAdmin[];
  usuarios: UsuarioAdmin[];
  onClose: () => void;
  onCreada: (folio: string) => void;
}) {
  const [codigoId, setCodigoId] = useState<string | null>(codigos[0]?.id ?? null);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = async () => {
    if (!codigoId || !clienteId) return setError('Elige el código y el cliente.');
    setError(null);
    setGuardando(true);
    const r = await crearOrdenPrueba(codigoId, clienteId);
    setGuardando(false);
    if (r.ok && r.folio) onCreada(r.folio);
    else setError(r.error);
  };

  return (
    <Hoja visible onClose={onClose}>
      <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4 }}>Crear orden de prueba</Text>
      <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 3, marginBottom: 16 }}>
        Simula que un cliente reclamó un código, sin usar los dos teléfonos.
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Código del embajador</Text>
        {codigos.length === 0 ? (
          <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginBottom: 16 }}>
            No hay códigos activos. Genera uno desde la pestaña Usuarios.
          </Text>
        ) : (
          <View style={{ gap: 6, marginBottom: 18 }}>
            {codigos.map((c) => {
              const on = codigoId === c.id;
              return (
                <PressableScale
                  key={c.id}
                  onPress={() => setCodigoId(c.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: R.md, backgroundColor: '#fff', borderWidth: on ? 1 : 0.5, borderColor: on ? C.primary : 'rgba(0,0,0,0.08)' }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>{c.codigo}</Text>
                    <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>
                      {c.embajador} · {c.negocio}
                    </Text>
                  </View>
                  {on && <Icon name="check" size={16} color={C.primary} sw={2.4} />}
                </PressableScale>
              );
            })}
          </View>
        )}

        <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Cliente que reclama</Text>
        <View style={{ gap: 6, marginBottom: 16 }}>
          {usuarios.map((u) => {
            const on = clienteId === u.id;
            return (
              <PressableScale
                key={u.id}
                onPress={() => setClienteId(u.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: R.md, backgroundColor: '#fff', borderWidth: on ? 1 : 0.5, borderColor: on ? C.primary : 'rgba(0,0,0,0.08)' }}>
                <Text style={{ flex: 1, fontFamily: F.base, fontSize: 13, color: FG }}>{u.nombre}</Text>
                {on && <Icon name="check" size={16} color={C.primary} sw={2.4} />}
              </PressableScale>
            );
          })}
        </View>

        {error && (
          <Fade key={error}>
            <View style={{ backgroundColor: 'rgba(235,78,0,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }}>
              <Text style={{ fontFamily: F.base, fontSize: 12.5, color: C.accent }}>{error}</Text>
            </View>
          </Fade>
        )}
      </ScrollView>

      <PressableScale
        onPress={crear}
        disabled={guardando}
        style={{ marginTop: 12, height: 52, borderRadius: R.md, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', opacity: guardando ? 0.7 : 1 }}>
        {guardando ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Crear orden</Text>}
      </PressableScale>
    </Hoja>
  );
}

// ── Confirmar venta ───────────────────────────────────────────────────────────
function ConfirmarVenta({ orden, onClose, onHecho }: { orden: OrdenAdmin; onClose: () => void; onHecho: () => void }) {
  const [monto, setMonto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const confirmar = async () => {
    setError(null);
    setEnviando(true);
    const valor = monto.trim() ? Number(monto.replace(',', '.')) : undefined;
    const r = await confirmarOrdenAdmin(orden.id, Number.isFinite(valor) ? valor : undefined);
    setEnviando(false);
    if (r.ok) onHecho();
    else setError(r.error);
  };

  return (
    <Hoja visible onClose={onClose}>
      <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4 }}>Confirmar venta</Text>
      <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 6, marginBottom: 16, lineHeight: 18 }}>
        Orden #{orden.folio} de {orden.negocio}. Se descuenta la comisión de los créditos del negocio y se abona al wallet de {orden.embajador}.
      </Text>

      <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>
        Monto de la venta (solo si el negocio cobra %)
      </Text>
      <View style={{ borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 50 }}>
        <Text style={{ fontFamily: F.semi, fontSize: 16, color: MUTED, marginRight: 4 }}>$</Text>
        <TextInput
          value={monto}
          onChangeText={setMonto}
          placeholder="Opcional"
          placeholderTextColor={MUTED}
          keyboardType="decimal-pad"
          style={{ flex: 1, fontFamily: F.semi, fontSize: 16, color: FG, padding: 0 }}
        />
      </View>

      {error && (
        <Fade key={error}>
          <View style={{ backgroundColor: 'rgba(235,78,0,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12 }}>
            <Text style={{ fontFamily: F.base, fontSize: 12.5, color: C.accent }}>{error}</Text>
          </View>
        </Fade>
      )}

      <PressableScale
        onPress={confirmar}
        disabled={enviando}
        style={{ marginTop: 16, height: 52, borderRadius: R.md, backgroundColor: '#00A896', alignItems: 'center', justifyContent: 'center', opacity: enviando ? 0.7 : 1 }}>
        {enviando ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Confirmar y pagar comisión</Text>}
      </PressableScale>
    </Hoja>
  );
}

// ── Pantalla ──────────────────────────────────────────────────────────────────
export function AdminOrdenesScreen() {
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [creando, setCreando] = useState(false);
  const [qr, setQr] = useState<OrdenAdmin | null>(null);
  const [confirmando, setConfirmando] = useState<OrdenAdmin | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Las órdenes se refrescan solas al entrar una nueva (el canal global las
  // invalida). Códigos y usuarios cambian poco y viven más en caché.
  const { datos: ordenes = [], cargando, refrescar: refrescarOrdenes } = useAdminOrdenes();
  const { datos: codigosTodos = [], refrescar: refrescarCodigos } = useAdminCodigos();
  const { datos: usuarios = [], refrescar: refrescarUsuarios } = useAdminUsuarios();
  const codigos = useMemo(() => codigosTodos.filter((x) => x.activo), [codigosTodos]);

  const refrescar = useCallback(() => {
    refrescarOrdenes();
    refrescarCodigos();
    refrescarUsuarios();
  }, [refrescarOrdenes, refrescarCodigos, refrescarUsuarios]);

  const visibles = useMemo(
    () => (filtro === 'todas' ? ordenes : ordenes.filter((o) => o.estado === filtro)),
    [ordenes, filtro],
  );

  const rechazar = async (o: OrdenAdmin) => {
    const r = await rechazarOrdenAdmin(o.id);
    setAviso(r.ok ? `Orden #${o.folio} rechazada.` : r.error);
    refrescar();
  };

  // Solo para limpiar pruebas: las confirmadas no se pueden borrar (ya movieron
  // dinero) y la base las protege aunque la UI lo intentara.
  const eliminar = (o: OrdenAdmin) => {
    Alert.alert('Eliminar orden', `Se borrará la orden #${o.folio}. Úsalo solo para limpiar pruebas.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const r = await eliminarOrdenAdmin(o.id);
          setAviso(r.ok ? `Orden #${o.folio} eliminada.` : r.error);
          refrescar();
        },
      },
    ]);
  };

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refrescar} tintColor={C.primary} />}>
        <Fade desde={8}>
          <Text style={{ fontFamily: F.semi, fontSize: 10, color: C.primary, textTransform: 'uppercase', letterSpacing: 1 }}>Admin</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44 }}>Órdenes</Text>
            <Text style={{ fontFamily: F.semi, fontSize: 12, color: MUTED }}>{ordenes.length} en total</Text>
          </View>
        </Fade>

        <Fade delay={STAGGER} desde={8}>
          <PressableScale
            onPress={() => setCreando(true)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: R.md, backgroundColor: C.primary, marginBottom: 16 }}>
            <Icon name="plus" size={18} color="#fff" sw={2.2} />
            <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Crear orden de prueba</Text>
          </PressableScale>
        </Fade>

        {aviso && (
          <Fade key={aviso}>
            <View style={{ backgroundColor: `${C.primary}12`, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }}>
              <Text style={{ fontFamily: F.base, fontSize: 12.5, color: FG }}>{aviso}</Text>
            </View>
          </Fade>
        )}

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }} style={{ marginBottom: 14 }}>
          {FILTROS.map((f) => {
            const on = filtro === f.k;
            const n = f.k === 'todas' ? ordenes.length : ordenes.filter((o) => o.estado === f.k).length;
            return (
              <PressableScale
                key={f.k}
                onPress={() => setFiltro(f.k)}
                style={{ height: 34, paddingHorizontal: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: on ? 0 : 1, borderColor: 'rgba(0,0,0,0.08)', backgroundColor: on ? C.primary : '#fff' }}>
                <Text style={{ fontFamily: F.base, fontSize: 12, color: on ? '#fff' : FG }}>{f.l} · {n}</Text>
              </PressableScale>
            );
          })}
        </ScrollView>

        {cargando && (
          <View style={{ borderRadius: R.md, paddingHorizontal: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
            <ListaSkeleton filas={4} />
          </View>
        )}

        {!cargando && visibles.length === 0 && (
          <View style={{ borderRadius: R.md, padding: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
            <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, lineHeight: 19 }}>
              No hay órdenes con ese filtro.
            </Text>
          </View>
        )}

        {visibles.map((o, i) => {
          const e = COLOR_ESTADO[o.estado] ?? COLOR_ESTADO.pendiente;
          return (
            <Fade key={o.id} delay={Math.min(i, 8) * STAGGER} desde={12}>
              <View style={{ borderRadius: R.md, padding: 14, marginBottom: 10, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: F.bold, fontSize: 14, color: FG, letterSpacing: 0.5 }}>#{o.folio}</Text>
                    <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 2 }}>
                      {o.negocio} · {o.codigo}
                    </Text>
                    <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 1 }}>
                      {o.embajador} → {o.cliente}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: e.bg }}>
                      <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: e.c }}>{e.l}</Text>
                    </View>
                    {o.comision != null && (
                      <Text style={{ fontFamily: F.semi, fontSize: 12, color: '#00A896' }}>${o.comision.toFixed(2)}</Text>
                    )}
                    <Text style={{ fontFamily: F.reg, fontSize: 10, color: MUTED }}>{fecha(o.creada)}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <PressableScale
                    onPress={() => setQr(o)}
                    style={{ flex: 1, height: 38, borderRadius: R.sm, backgroundColor: '#F2F4F7', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Icon name="qr" size={14} color={FG} />
                    <Text style={{ fontFamily: F.semi, fontSize: 12, color: FG }}>Ver QR</Text>
                  </PressableScale>
                  {o.estado !== 'confirmado' && (
                    <PressableScale
                      onPress={() => eliminar(o)}
                      style={{ width: 38, height: 38, borderRadius: R.sm, backgroundColor: '#F2F4F7', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="refresh" size={14} color={MUTED} sw={2} />
                    </PressableScale>
                  )}
                  {o.estado === 'pendiente' && (
                    <>
                      <PressableScale
                        onPress={() => setConfirmando(o)}
                        style={{ flex: 1, height: 38, borderRadius: R.sm, backgroundColor: 'rgba(0,168,150,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: F.semi, fontSize: 12, color: '#00A896' }}>Confirmar</Text>
                      </PressableScale>
                      <PressableScale
                        onPress={() => rechazar(o)}
                        style={{ flex: 1, height: 38, borderRadius: R.sm, backgroundColor: 'rgba(235,78,0,0.08)', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.accent }}>Rechazar</Text>
                      </PressableScale>
                    </>
                  )}
                </View>
              </View>
            </Fade>
          );
        })}
      </ScrollView>

      {creando && (
        <CrearOrden
          codigos={codigos}
          usuarios={usuarios}
          onClose={() => setCreando(false)}
          onCreada={(folio) => {
            setCreando(false);
            setAviso(`Orden #${folio} creada. Ya aparece como pendiente.`);
            setFiltro('pendiente');
            refrescar();
          }}
        />
      )}

      {qr && <QrPrueba orden={qr} onClose={() => setQr(null)} />}

      {confirmando && (
        <ConfirmarVenta
          orden={confirmando}
          onClose={() => setConfirmando(null)}
          onHecho={() => {
            setAviso(`Orden #${confirmando.folio} confirmada. Comisión abonada.`);
            setConfirmando(null);
            refrescar();
          }}
        />
      )}
    </>
  );
}
