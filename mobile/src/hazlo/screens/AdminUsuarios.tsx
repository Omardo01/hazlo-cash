import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { asignarRol, getUsuariosAdmin, type UsuarioAdmin } from '@/lib/services/admin';
import type { Rol } from '@/lib/types';
import { HazloMark } from '../HazloMark';
import { Icon, IconName } from '../icons';
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
                <Pressable
                  key={r}
                  onPress={() => toggle(r)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: R.md, borderWidth: 1, borderColor: on ? c : 'rgba(0,0,0,0.1)', backgroundColor: on ? `${c}10` : '#fff' }}>
                  <View style={{ width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c : '#fff', borderWidth: on ? 0 : 1, borderColor: 'rgba(0,0,0,0.15)' }}>
                    {on && <Icon name="check" size={14} color="#fff" sw={2.6} />}
                  </View>
                  <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG, textTransform: 'capitalize' }}>{r}</Text>
                </Pressable>
              );
            })}
          </View>

          {error && <Text style={{ fontFamily: F.base, fontSize: 12, color: C.accent, marginTop: 12 }}>{error}</Text>}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            <Pressable onPress={onClose} style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: '#F2F4F7', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={guardar} disabled={loading} style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Guardar</Text>}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function AdminUsuariosScreen() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setUsuarios(await getUsuariosAdmin());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cuenta = (r: Rol) => usuarios.filter((u) => u.roles.includes(r)).length;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} tintColor={C.primary} />}>
      {/* Saludo */}
      <View style={{ marginBottom: 18 }}>
        <Text style={{ fontFamily: F.base, fontSize: 13, color: MUTED }}>Panel admin</Text>
        <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginTop: 2 }}>Usuarios</Text>
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
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator color={C.primary} />
        </View>
      )}

      {!loading && error && (
        <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, paddingVertical: 16 }}>No se pudieron cargar. Desliza para reintentar.</Text>
      )}

      {!loading && !error && (
        <View style={{ gap: 10 }}>
          {usuarios.map((u) => (
            <Pressable
              key={u.id}
              onPress={() => setEditando(u)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
              <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#fff' }}>{iniciales(u.nombre)}</Text>
              </LinearGradient>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{u.nombre}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
                  {u.roles.length > 0 ? u.roles.map((r) => <RolePill key={r} rol={r} />) : <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>sin rol</Text>}
                </View>
              </View>
              <Icon name="chevR" size={16} color={MUTED} />
            </Pressable>
          ))}
        </View>
      )}

      {editando && (
        <EditorRoles
          usuario={editando}
          onClose={() => setEditando(null)}
          onGuardado={(roles) => {
            setUsuarios((prev) => prev.map((x) => (x.id === editando.id ? { ...x, roles } : x)));
            setEditando(null);
          }}
        />
      )}
    </ScrollView>
  );
}
