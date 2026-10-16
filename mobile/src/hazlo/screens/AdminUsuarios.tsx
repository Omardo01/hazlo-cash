import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { mutar } from '@/lib/datos/cache';
import { K, useAdminUsuarios } from '@/lib/datos/consultas';
import {
  adminGenerarCodigo,
  asignarRol,
  cambiarPasswordAdmin,
  crearUsuarioAdmin,
  type UsuarioAdmin,
} from '@/lib/services/admin';
import { getNegociosActivos } from '@/lib/services/businesses';
import type { Business, Rol } from '@/lib/types';
import { HazloMark } from '../HazloMark';
import { Icon, IconName } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { ListaSkeleton } from '../Skeleton';
import { C, F, FG, MUTED, R } from '../theme';
import { Glass, SectionHeader } from '../ui';

const ROLES: Rol[] = ['cliente', 'embajador', 'negocio', 'admin'];

const ROLE_COLOR: Record<Rol, string> = {
  cliente: '#6B7280',
  embajador: C.primary,
  negocio: '#00A896',
  admin: '#2D2B8F',
};

function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '··';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[1][0]).toUpperCase();
}

function RolePill({ rol }: { rol: Rol }) {
  const c = ROLE_COLOR[rol];
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: `${c}1A` }}>
      <Text style={{ fontFamily: F.semi, fontSize: 10, color: c, textTransform: 'capitalize' }}>{rol}</Text>
    </View>
  );
}

// Crea el código de un embajador sin entrar con su cuenta: indispensable para
// armar pruebas. Pasa por admin_generar_codigo (security definer + es_admin).
function GenerarCodigo({ usuario }: { usuario: UsuarioAdmin }) {
  const [negocios, setNegocios] = useState<Business[]>([]);
  const [generando, setGenerando] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    getNegociosActivos()
      .then((n) => vivo && setNegocios(n))
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, []);

  const generar = async (negocio: Business) => {
    setError(null);
    setGenerando(negocio.id);
    const r = await adminGenerarCodigo(negocio.id, usuario.id);
    setGenerando(null);
    if (r.ok && r.codigo) setResultado(r.codigo);
    else setError(r.error);
  };

  return (
    <View style={{ marginTop: 18, borderTopWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', paddingTop: 16 }}>
      <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        Código de referido
      </Text>

      {resultado ? (
        <Fade key={resultado}>
          <View style={{ borderRadius: R.md, padding: 14, backgroundColor: '#0D0D0D', alignItems: 'center' }}>
            <Text style={{ fontFamily: F.bold, fontSize: 20, color: '#fff', letterSpacing: 1.5 }}>{resultado}</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
              Ya puedes crear órdenes con este código.
            </Text>
          </View>
        </Fade>
      ) : (
        <View style={{ gap: 6 }}>
          {negocios.map((n) => (
            <PressableScale
              key={n.id}
              onPress={() => generar(n)}
              disabled={generando !== null}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11, borderRadius: R.sm, backgroundColor: '#F7F7F6' }}>
              <Text style={{ flex: 1, fontFamily: F.base, fontSize: 12.5, color: FG }}>{n.nombre}</Text>
              {generando === n.id ? (
                <ActivityIndicator size="small" color={C.primary} />
              ) : (
                <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: C.primary }}>Generar</Text>
              )}
            </PressableScale>
          ))}
        </View>
      )}

      {error && (
        <Text style={{ fontFamily: F.base, fontSize: 12, color: C.accent, marginTop: 8 }}>{error}</Text>
      )}
    </View>
  );
}

// Alta de cuenta desde el panel. Es la única vía para crear una cuenta con rol
// 'negocio' o 'admin': el registro público sólo puede nacer cliente/embajador.
function NuevoUsuario({ onClose, onCreado }: { onClose: () => void; onCreado: () => void }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sel, setSel] = useState<Rol[]>(['cliente']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (r: Rol) => setSel((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const guardar = async () => {
    if (!nombre.trim()) return setError('Escribe el nombre.');
    if (!email.includes('@')) return setError('Escribe un correo válido.');
    if (password.length < 6) return setError('La contraseña necesita al menos 6 caracteres.');
    if (sel.length === 0) return setError('Selecciona al menos un rol.');

    setError(null);
    setLoading(true);
    const r = await crearUsuarioAdmin({ nombre, email, password, telefono, roles: sel });
    setLoading(false);
    if (!r.ok) return setError(r.error);
    onCreado();
    onClose();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: '#fff', borderRadius: 24, padding: 22, maxHeight: '90%' }}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={{ fontFamily: F.bold, fontSize: 18, color: FG, letterSpacing: -0.3 }}>Nueva cuenta</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 4, marginBottom: 16 }}>
              Nace con el correo ya confirmado: puede entrar de inmediato.
            </Text>

            <CampoModal label="Nombre" value={nombre} onChangeText={setNombre} placeholder="Ej. Tacos El Güero" />
            <CampoModal label="Correo" value={email} onChangeText={setEmail} placeholder="negocio@ejemplo.com" autoCapitalize="none" keyboardType="email-address" />
            <CampoModal label="Contraseña" value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" autoCapitalize="none" />
            <CampoModal label="Teléfono (opcional)" value={telefono} onChangeText={setTelefono} placeholder="993 123 4567" keyboardType="phone-pad" />

            <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 4 }}>Roles</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ROLES.map((r) => {
                const on = sel.includes(r);
                const c = ROLE_COLOR[r];
                return (
                  <PressableScale
                    key={r}
                    onPress={() => toggle(r)}
                    style={{ paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: on ? c : 'rgba(0,0,0,0.1)', backgroundColor: on ? `${c}12` : '#fff' }}>
                    <Text style={{ fontFamily: F.semi, fontSize: 12, color: on ? c : FG, textTransform: 'capitalize' }}>{r}</Text>
                  </PressableScale>
                );
              })}
            </View>

            {error && <Text style={{ fontFamily: F.base, fontSize: 12, color: C.accent, marginTop: 14 }}>{error}</Text>}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
              <PressableScale onPress={onClose} style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: '#F2F4F7', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Cancelar</Text>
              </PressableScale>
              <PressableScale onPress={guardar} disabled={loading} style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Crear cuenta</Text>}
              </PressableScale>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CampoModal({
  label,
  ...input
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</Text>
      <View style={{ borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 13, paddingVertical: 11 }}>
        <TextInput placeholderTextColor={MUTED} autoCorrect={false} style={{ fontFamily: F.reg, fontSize: 14, color: FG, padding: 0 }} {...input} />
      </View>
    </View>
  );
}

// Contraseña nueva para una cuenta: soporte y armado de pruebas sin correo.
function CambiarPassword({ usuario }: { usuario: UsuarioAdmin }) {
  const [abierto, setAbierto] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const guardar = async () => {
    if (password.length < 6) return setError('Mínimo 6 caracteres.');
    setError(null);
    setLoading(true);
    const r = await cambiarPasswordAdmin(usuario.id, password);
    setLoading(false);
    if (!r.ok) return setError(r.error);
    setAviso('Contraseña actualizada.');
    setPassword('');
  };

  if (!abierto) {
    return (
      <PressableScale
        onPress={() => setAbierto(true)}
        style={{ marginTop: 14, height: 44, borderRadius: R.md, backgroundColor: '#F2F4F7', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>Cambiar contraseña</Text>
      </PressableScale>
    );
  }

  return (
    <View style={{ marginTop: 14, padding: 14, borderRadius: R.md, backgroundColor: '#F7F8FA' }}>
      <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Contraseña nueva</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1, borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#fff', paddingHorizontal: 12, justifyContent: 'center' }}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={MUTED}
            autoCapitalize="none"
            autoCorrect={false}
            style={{ fontFamily: F.reg, fontSize: 13.5, color: FG, padding: 0, height: 44 }}
          />
        </View>
        <PressableScale
          onPress={guardar}
          disabled={loading}
          style={{ paddingHorizontal: 18, height: 44, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Guardar</Text>}
        </PressableScale>
      </View>
      {aviso && <Text style={{ fontFamily: F.base, fontSize: 12, color: '#00806F', marginTop: 8 }}>{aviso}</Text>}
      {error && <Text style={{ fontFamily: F.base, fontSize: 12, color: C.accent, marginTop: 8 }}>{error}</Text>}
    </View>
  );
}

// Editor de roles de un usuario (modal). Guarda vía Edge Function.
function EditorRoles({ usuario, onClose, onGuardado }: { usuario: UsuarioAdmin; onClose: () => void; onGuardado: (roles: Rol[]) => void }) {
  const [sel, setSel] = useState<Rol[]>(usuario.roles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (r: Rol) => setSel((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const guardar = async () => {
    if (sel.length === 0) return setError('Selecciona al menos un rol.');
    setError(null);
    setLoading(true);
    const res = await asignarRol(usuario.id, sel);
    setLoading(false);
    if (res.ok) onGuardado(sel);
    else setError(res.error);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 28 }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: '#fff', borderRadius: 24, padding: 22 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 18, color: FG, letterSpacing: -0.3 }}>Roles de {usuario.nombre}</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 4, marginBottom: 16 }}>Toca para activar o desactivar.</Text>

          <View style={{ gap: 8 }}>
            {ROLES.map((r) => {
              const on = sel.includes(r);
              const c = ROLE_COLOR[r];
              return (
                <PressableScale
                  key={r}
                  onPress={() => toggle(r)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: R.md, borderWidth: 1, borderColor: on ? c : 'rgba(0,0,0,0.1)', backgroundColor: on ? `${c}10` : '#fff' }}>
                  <View style={{ width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c : '#fff', borderWidth: on ? 0 : 1, borderColor: 'rgba(0,0,0,0.15)' }}>
                    {on && <Icon name="check" size={14} color="#fff" sw={2.6} />}
                  </View>
                  <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG, textTransform: 'capitalize' }}>{r}</Text>
                </PressableScale>
              );
            })}
          </View>

          {error && <Text style={{ fontFamily: F.base, fontSize: 12, color: C.accent, marginTop: 12 }}>{error}</Text>}

          {/* Con rol embajador guardado, el admin puede crearle su código aquí
              mismo para armar una prueba sin entrar con su cuenta. */}
          {usuario.roles.includes('embajador') && <GenerarCodigo usuario={usuario} />}

          <CambiarPassword usuario={usuario} />

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            <PressableScale onPress={onClose} style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: '#F2F4F7', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Cancelar</Text>
            </PressableScale>
            <PressableScale onPress={guardar} disabled={loading} style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Guardar</Text>}
            </PressableScale>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function AdminUsuariosScreen() {
  const { datos: usuarios = [], cargando: loading, error, refrescar: cargar } = useAdminUsuarios();
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);
  const [creando, setCreando] = useState(false);

  const cuenta = (r: Rol) => usuarios.filter((u) => u.roles.includes(r)).length;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} tintColor={C.primary} />}>
      {/* Saludo */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <View>
          <Text style={{ fontFamily: F.base, fontSize: 13, color: MUTED }}>Panel admin</Text>
          <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginTop: 2 }}>Usuarios</Text>
        </View>
        <PressableScale
          onPress={() => setCreando(true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 16, borderRadius: 999, backgroundColor: C.primary }}>
          <Icon name="plus" size={16} color="#fff" sw={2.4} />
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Nuevo</Text>
        </PressableScale>
      </View>

      {/* Hero */}
      <View style={{ position: 'relative', overflow: 'hidden', borderRadius: R.lg, padding: 20, marginBottom: 22, shadowColor: '#1A1840', shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 18 }, elevation: 8 }}>
        <LinearGradient colors={['#1A1840', '#2D2B8F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ position: 'absolute', right: -30, top: -30, opacity: 0.16 }}>
          <HazloMark size={180} primary="#fff" secondary="#fff" />
        </View>
        <Text style={{ fontFamily: F.base, fontSize: 12, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.24, textTransform: 'uppercase' }}>Usuarios registrados</Text>
        <Text style={{ fontFamily: F.bold, fontSize: 44, color: '#fff', letterSpacing: -1.5, marginTop: 2 }}>{usuarios.length}</Text>
        <Text style={{ fontFamily: F.base, fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>en toda la plataforma</Text>
      </View>

      {/* Stats por rol */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 26 }}>
        {[
          { v: cuenta('embajador'), l: 'Embajadores', icon: 'send' as IconName },
          { v: cuenta('negocio'), l: 'Negocios', icon: 'home' as IconName },
          { v: cuenta('admin'), l: 'Admins', icon: 'settings' as IconName },
        ].map((s) => (
          <Glass key={s.l} style={{ flex: 1, padding: 12, borderRadius: R.md }}>
            <View style={{ marginBottom: 6 }}>
              <Icon name={s.icon} size={18} color={C.primary} />
            </View>
            <Text style={{ fontFamily: F.bold, fontSize: 18, color: FG, letterSpacing: -0.36 }}>{s.v}</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 10, color: MUTED, marginTop: 1 }}>{s.l}</Text>
          </Glass>
        ))}
      </View>

      <SectionHeader title="Todos los usuarios" />

      {loading && (
        <View style={{ borderRadius: R.md, paddingHorizontal: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
          <ListaSkeleton filas={4} />
        </View>
      )}

      {!loading && error && (
        <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, paddingVertical: 16 }}>No se pudieron cargar. Desliza para reintentar.</Text>
      )}

      {!loading && !error && (
        <View style={{ gap: 10 }}>
          {usuarios.map((u, i) => (
            <Fade key={u.id} delay={Math.min(i, 8) * STAGGER} desde={10}>
            <PressableScale
              onPress={() => setEditando(u)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
              <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#fff' }}>{iniciales(u.nombre)}</Text>
              </LinearGradient>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{u.nombre}</Text>
                {u.email && (
                  <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>{u.email}</Text>
                )}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
                  {u.roles.length > 0 ? u.roles.map((r) => <RolePill key={r} rol={r} />) : <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>sin rol</Text>}
                </View>
              </View>
              <Icon name="chevR" size={16} color={MUTED} />
            </PressableScale>
            </Fade>
          ))}
        </View>
      )}

      {creando && <NuevoUsuario onClose={() => setCreando(false)} onCreado={cargar} />}

      {editando && (
        <EditorRoles
          usuario={editando}
          onClose={() => setEditando(null)}
          onGuardado={(roles) => {
            mutar<UsuarioAdmin[]>(K.adminUsuarios, (prev) =>
              prev.map((x) => (x.id === editando.id ? { ...x, roles } : x)),
            );
            setEditando(null);
          }}
        />
      )}
    </ScrollView>
  );
}
