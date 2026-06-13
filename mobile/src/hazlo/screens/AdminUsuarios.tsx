import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { asignarRol, getUsuariosAdmin, type UsuarioAdmin } from '@/lib/services/admin';
import type { Rol } from '@/lib/types';
import { Icon } from '../icons';
import { C, F, FG, MUTED, R } from '../theme';

const ROLES: Rol[] = ['cliente', 'embajador', 'negocio', 'admin'];

function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '··';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[1][0]).toUpperCase();
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
              return (
                <Pressable
                  key={r}
                  onPress={() => toggle(r)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: R.md, borderWidth: 1, borderColor: on ? C.primary : 'rgba(0,0,0,0.1)', backgroundColor: on ? `${C.primary}10` : '#fff' }}>
                  <View style={{ width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? C.primary : '#fff', borderWidth: on ? 0 : 1, borderColor: 'rgba(0,0,0,0.15)' }}>
                    {on && <Icon name="check" size={14} color="#fff" sw={2.6} />}
                  </View>
                  <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG, textTransform: 'capitalize' }}>{r}</Text>
                </Pressable>
              );
            })}
          </View>

          {error && (
            <Text style={{ fontFamily: F.base, fontSize: 12, color: C.accent, marginTop: 12 }}>{error}</Text>
          )}

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

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} tintColor={C.primary} />}>
      <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginBottom: 18 }}>Usuarios</Text>

      {loading && (
        <View style={{ paddingVertical: 48, alignItems: 'center' }}>
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
              <View style={{ width: 42, height: 42, borderRadius: 999, backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: F.bold, fontSize: 14, color: C.primary }}>{iniciales(u.nombre)}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{u.nombre}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 2 }}>{u.roles.join(' · ') || 'sin rol'}</Text>
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
