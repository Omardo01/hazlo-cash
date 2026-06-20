import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName } from './icons';
import { C, F, FG, MUTED, R } from './theme';

export interface Experiencia {
  key: string;
  label: string;
  icon: IconName;
}

// Selector flotante para alternar entre las experiencias (Admin / Negocio /
// Cliente·Embajador) cuando la cuenta tiene varios roles. Pensado para QA y demos:
// permite recorrer el flujo completo con una sola cuenta, sin cerrar sesión.
export function RoleSwitcher({
  exps,
  actual,
  onChange,
}: {
  exps: Experiencia[];
  actual: string;
  onChange: (k: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const act = exps.find((e) => e.key === actual);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{ position: 'absolute', top: insets.top + 6, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, height: 30, paddingHorizontal: 12, borderRadius: 999, backgroundColor: 'rgba(13,13,13,0.88)', zIndex: 50 }}>
        <Icon name={act?.icon ?? 'user'} size={13} color="#fff" />
        <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: '#fff' }}>Prueba · {act?.label ?? ''}</Text>
        <Icon name="chevR" size={13} color="rgba(255,255,255,0.7)" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', paddingTop: insets.top + 42, alignItems: 'center' }}>
          <Pressable onPress={() => {}} style={{ width: 280, borderRadius: R.lg, backgroundColor: '#fff', padding: 8 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.6, paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 }}>Cambiar vista de prueba</Text>
            {exps.map((e) => {
              const on = e.key === actual;
              return (
                <Pressable
                  key={e.key}
                  onPress={() => {
                    onChange(e.key);
                    setOpen(false);
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: R.md, backgroundColor: on ? `${C.primary}12` : 'transparent' }}>
                  <View style={{ width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? C.primary : '#F2F4F7' }}>
                    <Icon name={e.icon} size={17} color={on ? '#fff' : FG} />
                  </View>
                  <Text style={{ flex: 1, fontFamily: F.semi, fontSize: 14, color: FG }}>{e.label}</Text>
                  {on && <Icon name="check" size={16} color={C.primary} sw={2.4} />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
