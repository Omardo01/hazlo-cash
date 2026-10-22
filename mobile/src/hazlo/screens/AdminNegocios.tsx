import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { mutar } from '@/lib/datos/cache';
import { K, useAdminNegocios } from '@/lib/datos/consultas';
import { getUsuariosAdmin, type UsuarioAdmin } from '@/lib/services/admin';
import { asignarDuenoNegocio, recargarCreditos, setComisionNegocio, setNegocioActivo } from '@/lib/services/businesses';
import type { BusinessAdmin, ComisionTipo } from '@/lib/types';
import { AdminAltaNegocio } from '../AdminAltaNegocio';
import { EditarNegocio } from '../EditarNegocio';
import { HazloMark } from '../HazloMark';
import { Icon, IconName } from '../icons';
import { BG, C, F, FG, MUTED, R } from '../theme';
import { ListaSkeleton } from '../Skeleton';
import { Glass, SectionHeader } from '../ui';
import { Fade, PressableScale, STAGGER } from '../motion';

const money = (n: number) => `$${n.toFixed(2)}`;
const ATAJOS = [50, 100, 200, 500];

function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[1][0]).toUpperCase();
}

function comisionLabel(n: BusinessAdmin): string {
  return n.comision_tipo === 'porcentaje' ? `${n.comision_valor}% por venta` : `${money(n.comision_valor)} por venta`;
}

// Modal de gestión de un negocio: recargar créditos + configurar comisión.
function GestionNegocio({
  negocio,
  onClose,
  onUpdated,
  onEditar,
}: {
  negocio: BusinessAdmin;
  onClose: () => void;
  onUpdated: (n: BusinessAdmin) => void;
  onEditar: () => void;
}) {
  const [monto, setMonto] = useState('');
  const [recargando, setRecargando] = useState(false);
  const [tipo, setTipo] = useState<ComisionTipo>(negocio.comision_tipo);
  const [valor, setValor] = useState(String(negocio.comision_valor));
  const [guardandoComision, setGuardandoComision] = useState(false);
  const [candidatos, setCandidatos] = useState<UsuarioAdmin[]>([]);
  const [asignando, setAsignando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Candidatos a dueño = usuarios con rol 'negocio'.
  useEffect(() => {
    let activo = true;
    getUsuariosAdmin()
      .then((us) => activo && setCandidatos(us.filter((u) => u.roles.includes('negocio'))))
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  const asignarDueno = async (userId: string) => {
    // Tocar el dueño actual lo desasigna (toggle).
    const nuevo = negocio.owner_id === userId ? null : userId;
    setError(null);
    setAsignando(userId);
    const r = await asignarDuenoNegocio(negocio.id, nuevo);
    setAsignando(null);
    if (r.ok) {
      setAviso(nuevo ? 'Negocio asignado. Ya puede operarlo desde su cuenta.' : 'Se quitó el dueño del negocio.');
      onUpdated({ ...negocio, owner_id: nuevo });
    } else {
      setError(r.error ?? 'No se pudo asignar el dueño.');
    }
  };

  const recargar = async () => {
    const m = parseFloat(monto.replace(',', '.'));
    if (isNaN(m) || m <= 0) return setError('Escribe un monto mayor a 0.');
    setError(null);
    setRecargando(true);
    const r = await recargarCreditos(negocio.id, m);
    setRecargando(false);
    if (r.ok && r.saldo != null) {
      setMonto('');
      setAviso(`Se activaron ${money(m)} en créditos.`);
      onUpdated({ ...negocio, creditos: r.saldo });
    } else {
      setError(r.error ?? 'No se pudo recargar.');
    }
  };

  const guardarComision = async () => {
    const v = parseFloat(valor.replace(',', '.'));
    if (isNaN(v) || v < 0) return setError('Define una comisión válida.');
    if (tipo === 'porcentaje' && v > 100) return setError('El porcentaje no puede ser mayor a 100.');
    setError(null);
    setGuardandoComision(true);
    const r = await setComisionNegocio(negocio.id, tipo, v);
    setGuardandoComision(false);
    if (r.ok) {
      setAviso('Comisión actualizada.');
      onUpdated({ ...negocio, comision_tipo: tipo, comision_valor: v });
    } else {
      setError(r.error ?? 'No se pudo guardar.');
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={{ backgroundColor: BG, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%' }}>
          <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 36 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={{ width: 40, height: 4, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.12)', alignSelf: 'center', marginBottom: 18 }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: F.bold, fontSize: 16, color: '#fff' }}>{iniciales(negocio.nombre)}</Text>
              </LinearGradient>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontFamily: F.bold, fontSize: 18, color: FG, letterSpacing: -0.36 }}>{negocio.nombre}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED }}>{negocio.categoria}</Text>
              </View>
            </View>

            {/* Saldo de créditos */}
            <View style={{ position: 'relative', overflow: 'hidden', borderRadius: R.lg, padding: 20, marginBottom: 20 }}>
              <LinearGradient colors={['#1A1840', '#2D2B8F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
              <View style={{ position: 'absolute', right: -26, top: -26, opacity: 0.16 }}>
                <HazloMark size={150} mono="#fff" />
              </View>
              <Text style={{ fontFamily: F.base, fontSize: 12, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 0.24 }}>Créditos disponibles</Text>
              <Text style={{ fontFamily: F.bold, fontSize: 38, color: '#fff', letterSpacing: -1.2, marginTop: 2 }}>{money(negocio.creditos)}</Text>
            </View>

            {/* Recargar */}
            <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Activar créditos</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              {ATAJOS.map((a) => (
                <PressableScale key={a} onPress={() => setMonto(String(a))} style={{ flex: 1, height: 40, borderRadius: R.sm, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>${a}</Text>
                </PressableScale>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
              <View style={{ flex: 1, borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 50 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 17, color: MUTED, marginRight: 4 }}>$</Text>
                <TextInput value={monto} onChangeText={setMonto} placeholder="0.00" placeholderTextColor={MUTED} keyboardType="decimal-pad" style={{ flex: 1, fontFamily: F.semi, fontSize: 17, color: FG, padding: 0 }} />
              </View>
              <PressableScale onPress={recargar} disabled={recargando} style={{ paddingHorizontal: 20, height: 50, borderRadius: R.md, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', opacity: recargando ? 0.7 : 1 }}>
                {recargando ? <ActivityIndicator color="#fff" /> : <><Icon name="plus" size={16} color="#fff" sw={2.4} /><Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Activar</Text></>}
              </PressableScale>
            </View>

            {/* Dueño del negocio */}
            <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Dueño del negocio</Text>
            {candidatos.length === 0 ? (
              <View style={{ borderRadius: R.md, padding: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', marginBottom: 22 }}>
                <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, lineHeight: 18 }}>
                  No hay cuentas con rol Negocio. Asigna primero el rol <Text style={{ fontFamily: F.semi, color: FG }}>Negocio</Text> a un usuario en la pestaña Usuarios.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 8, marginBottom: 22 }}>
                {candidatos.map((u) => {
                  const sel = negocio.owner_id === u.id;
                  return (
                    <PressableScale
                      key={u.id}
                      onPress={() => asignarDueno(u.id)}
                      disabled={asignando !== null}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: R.md, borderWidth: 1, borderColor: sel ? C.primary : 'rgba(0,0,0,0.1)', backgroundColor: sel ? `${C.primary}10` : '#fff' }}>
                      <View style={{ width: 22, height: 22, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? C.primary : '#fff', borderWidth: sel ? 0 : 1, borderColor: 'rgba(0,0,0,0.15)' }}>
                        {asignando === u.id ? <ActivityIndicator size="small" color={sel ? '#fff' : MUTED} /> : sel ? <Icon name="check" size={13} color="#fff" sw={2.6} /> : null}
                      </View>
                      <Text style={{ flex: 1, fontFamily: F.semi, fontSize: 14, color: FG }}>{u.nombre}</Text>
                      {sel && <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.primary }}>Dueño</Text>}
                    </PressableScale>
                  );
                })}
                <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, lineHeight: 16, paddingHorizontal: 2 }}>
                  La cuenta dueña verá las solicitudes de este negocio y podrá confirmar ventas. Toca de nuevo para quitarla.
                </Text>
              </View>
            )}

            {/* Comisión */}
            <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Comisión al recomendador</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              {(['fijo', 'porcentaje'] as ComisionTipo[]).map((t) => {
                const sel = tipo === t;
                return (
                  <PressableScale key={t} onPress={() => setTipo(t)} style={{ flex: 1, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', borderWidth: sel ? 0 : 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: sel ? C.primary : '#fff' }}>
                    <Text style={{ fontFamily: F.semi, fontSize: 13, color: sel ? '#fff' : FG }}>{t === 'fijo' ? 'Monto fijo' : 'Porcentaje'}</Text>
                  </PressableScale>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
              <View style={{ flex: 1, borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 50 }}>
                {tipo === 'fijo' && <Text style={{ fontFamily: F.semi, fontSize: 16, color: MUTED, marginRight: 4 }}>$</Text>}
                <TextInput value={valor} onChangeText={setValor} placeholder={tipo === 'fijo' ? '10.00' : '10'} placeholderTextColor={MUTED} keyboardType="decimal-pad" style={{ flex: 1, fontFamily: F.semi, fontSize: 16, color: FG, padding: 0 }} />
                {tipo === 'porcentaje' && <Text style={{ fontFamily: F.semi, fontSize: 16, color: MUTED, marginLeft: 4 }}>%</Text>}
              </View>
              <PressableScale onPress={guardarComision} disabled={guardandoComision} style={{ paddingHorizontal: 20, height: 50, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)', alignItems: 'center', justifyContent: 'center', opacity: guardandoComision ? 0.7 : 1 }}>
                {guardandoComision ? <ActivityIndicator color={FG} /> : <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Guardar</Text>}
              </PressableScale>
            </View>

            {aviso && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,168,150,0.12)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }}>
                <Icon name="check" size={16} color="#00A896" sw={2.4} />
                <Text style={{ flex: 1, fontFamily: F.semi, fontSize: 12.5, color: '#00786C' }}>{aviso}</Text>
              </View>
            )}
            {error && (
              <View style={{ backgroundColor: 'rgba(235,78,0,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }}>
                <Text style={{ fontFamily: F.base, fontSize: 12.5, color: C.accent }}>{error}</Text>
              </View>
            )}

            <PressableScale
              onPress={onEditar}
              style={{ height: 50, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 10 }}>
              <Icon name="settings" size={15} color="#fff" />
              <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Editar ficha del negocio</Text>
            </PressableScale>

            <PressableScale onPress={onClose} style={{ height: 50, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Listo</Text>
            </PressableScale>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function AdminNegociosScreen() {
  const { datos: negocios = [], cargando: loading, error, refrescar: cargar } = useAdminNegocios();
  const [altaVisible, setAltaVisible] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [gestion, setGestion] = useState<BusinessAdmin | null>(null);
  const [editando, setEditando] = useState<BusinessAdmin | null>(null);

  const toggle = async (n: BusinessAdmin) => {
    setToggling(n.id);
    const { ok } = await setNegocioActivo(n.id, !n.activo);
    if (ok)
      mutar<BusinessAdmin[]>(K.adminNegocios, (prev) =>
        prev.map((b) => (b.id === n.id ? { ...b, activo: !b.activo } : b)),
      );
    setToggling(null);
  };

  const aplicarUpdate = (n: BusinessAdmin) => {
    mutar<BusinessAdmin[]>(K.adminNegocios, (prev) => prev.map((b) => (b.id === n.id ? n : b)));
    setGestion(n);
  };

  const activos = negocios.filter((n) => n.activo).length;
  const totalCreditos = negocios.reduce((s, n) => s + n.creditos, 0);
  // Lo que pide atención del admin: negocios que no pueden operar todavía.
  const sinDueno = negocios.filter((n) => !n.owner_id).length;
  const sinCreditos = negocios.filter((n) => n.activo && n.creditos <= 0).length;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} tintColor={C.primary} />}>
      {/* Saludo */}
      <Fade desde={8}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <View>
          <Text style={{ fontFamily: F.base, fontSize: 13, color: MUTED }}>Panel admin</Text>
          <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginTop: 2 }}>Negocios</Text>
        </View>
        <PressableScale
          onPress={() => setAltaVisible(true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 16, borderRadius: 999, backgroundColor: C.primary }}>
          <Icon name="plus" size={16} color="#fff" sw={2.4} />
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Nuevo</Text>
        </PressableScale>
      </View>
      </Fade>

      {/* Hero */}
      <Fade delay={STAGGER} desde={12}>
      <View style={{ position: 'relative', overflow: 'hidden', borderRadius: R.lg, padding: 20, marginBottom: 22, shadowColor: '#1A1840', shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 18 }, elevation: 8 }}>
        <LinearGradient colors={['#1A1840', '#2D2B8F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ position: 'absolute', right: -30, top: -30, opacity: 0.16 }}>
          <HazloMark size={180} mono="#fff" />
        </View>
        <Text style={{ fontFamily: F.base, fontSize: 12, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.24, textTransform: 'uppercase' }}>Negocios en la plataforma</Text>
        <Text style={{ fontFamily: F.bold, fontSize: 44, color: '#fff', letterSpacing: -1.5, marginTop: 2 }}>{negocios.length}</Text>
        <Text style={{ fontFamily: F.base, fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>{activos} activos · {negocios.length - activos} inactivos</Text>
      </View>
      </Fade>

      {/* Lo que requiere atención (el total ya está en el hero) */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 26 }}>
        {[
          { v: String(sinDueno), l: 'Sin dueño', icon: 'user' as IconName, alerta: sinDueno > 0 },
          { v: String(sinCreditos), l: 'Sin créditos', icon: 'bell' as IconName, alerta: sinCreditos > 0 },
          { v: money(totalCreditos), l: 'Créditos', icon: 'wallet' as IconName, alerta: false },
        ].map((s, i) => (
          <Fade key={s.l} delay={STAGGER * (2 + i)} desde={10} style={{ flex: 1 }}>
            <Glass style={{ padding: 12, borderRadius: R.md }}>
              <View style={{ marginBottom: 6 }}>
                <Icon name={s.icon} size={18} color={s.alerta ? C.accent : C.primary} />
              </View>
              <Text numberOfLines={1} style={{ fontFamily: F.bold, fontSize: 16, color: s.alerta ? C.accent : FG, letterSpacing: -0.32 }}>{s.v}</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 10, color: MUTED, marginTop: 1 }}>{s.l}</Text>
            </Glass>
          </Fade>
        ))}
      </View>

      <SectionHeader title="Todos los negocios" />

      {loading && (
        <View style={{ borderRadius: R.md, paddingHorizontal: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
          <ListaSkeleton filas={4} />
        </View>
      )}

      {!loading && error && (
        <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, paddingVertical: 16 }}>No se pudieron cargar. Desliza para reintentar.</Text>
      )}

      {!loading && !error && (
        <View style={{ gap: 12 }}>
          {negocios.map((n, i) => (
            <Fade key={n.id} delay={STAGGER * Math.min(i, 8)} desde={12}>
            <PressableScale
              onPress={() => setGestion(n)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
              <LinearGradient colors={n.activo ? [C.primary, C.accent] : ['#C9C9C9', '#A8A8A8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: F.bold, fontSize: 15, color: '#fff', letterSpacing: -0.3 }}>{iniciales(n.nombre)}</Text>
              </LinearGradient>
              <View style={{ flex: 1, minWidth: 0, paddingRight: 6 }}>
                <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>{n.nombre}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>{n.categoria} · {comisionLabel(n)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
                  <Icon name="wallet" size={12} color={n.creditos > 0 ? C.primary : MUTED} sw={2} />
                  <Text style={{ fontFamily: F.semi, fontSize: 11, color: n.creditos > 0 ? C.primary : MUTED }}>{money(n.creditos)} en créditos</Text>
                  {!n.owner_id && (
                    <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, backgroundColor: 'rgba(235,78,0,0.1)' }}>
                      <Text style={{ fontFamily: F.semi, fontSize: 9.5, color: C.accent }}>Sin dueño</Text>
                    </View>
                  )}
                </View>
              </View>
              <PressableScale
                onPress={() => toggle(n)}
                disabled={toggling === n.id}
                style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: n.activo ? 'rgba(0,168,150,0.15)' : 'rgba(13,13,13,0.06)', minWidth: 82, alignItems: 'center' }}>
                {toggling === n.id ? (
                  <ActivityIndicator size="small" color={MUTED} />
                ) : (
                  <Text style={{ fontFamily: F.semi, fontSize: 11, color: n.activo ? '#00A896' : MUTED }}>{n.activo ? 'Activo' : 'Inactivo'}</Text>
                )}
              </PressableScale>
            </PressableScale>
            </Fade>
          ))}
        </View>
      )}

      <AdminAltaNegocio visible={altaVisible} onClose={() => { setAltaVisible(false); cargar(); }} />
      {gestion && (
        <GestionNegocio
          negocio={gestion}
          onClose={() => setGestion(null)}
          onUpdated={aplicarUpdate}
          onEditar={() => {
            // Una hoja a la vez: se cierra gestión y se abre la edición.
            setEditando(gestion);
            setGestion(null);
          }}
        />
      )}
      <EditarNegocio
        negocio={editando}
        visible={editando !== null}
        onClose={() => setEditando(null)}
        onGuardado={aplicarUpdate}
      />
    </ScrollView>
  );
}
