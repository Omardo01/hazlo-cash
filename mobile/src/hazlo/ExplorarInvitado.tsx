import { useState } from 'react';
import { Text, View } from 'react-native';

import { HazloMark } from './HazloMark';
import { Icon } from './icons';
import { Fade, PressableScale } from './motion';
import { PuertaCuenta, type MotivoCuenta } from './PuertaCuenta';
import { TabBar, type TabItem } from './TabBar';
import { C, F, FG } from './theme';
import { DiscoverScreen } from './screens/Discover';
import type { Tab } from './screens/types';

// El mismo menú que ve el recomendador, para que se sepa qué hay adentro.
const TABS: TabItem<Tab>[] = [
  { k: 'home', label: 'Inicio', icon: 'home' },
  { k: 'discover', label: 'Descubre', icon: 'search' },
  { k: 'balance', label: 'Actividad', icon: 'activity' },
  { k: 'profile', label: 'Perfil', icon: 'user' },
];

const MOTIVO_DE_TAB: Partial<Record<Tab, MotivoCuenta>> = {
  home: { k: 'inicio' },
  balance: { k: 'actividad' },
  profile: { k: 'perfil' },
};

/**
 * Landing → "Quiero buscar": la app sin cuenta. Se ve el menú completo, pero
 * solo Descubre (el catálogo) está abierto; lo demás —y las promociones—
 * abre la hoja que invita a registrarse o entrar.
 */
export function ExplorarInvitado({
  onVolver,
  onRegistrarse,
  onEntrar,
}: {
  onVolver: () => void;
  onRegistrarse: () => void;
  onEntrar: () => void;
}) {
  const [motivo, setMotivo] = useState<MotivoCuenta | null>(null);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <PressableScale
          onPress={onVolver}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={8}
          style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(13,13,13,0.06)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <Icon name="chevR" size={16} color={FG} sw={2.2} />
          </View>
        </PressableScale>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <HazloMark size={20} />
          <Text style={{ fontFamily: F.bold, fontSize: 14, color: FG, letterSpacing: -0.2 }}>
            Hazlo <Text style={{ color: C.primary }}>Cash</Text>
          </Text>
        </View>
        <Fade>
          <PressableScale
            onPress={onEntrar}
            accessibilityRole="button"
            style={{ height: 34, paddingHorizontal: 14, borderRadius: 999, backgroundColor: FG, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="user" size={13} color="#fff" sw={2.2} />
            <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: '#fff' }}>Entrar</Text>
          </PressableScale>
        </Fade>
      </View>

      <View style={{ flex: 1 }}>
        <DiscoverScreen invitado onPromoBloqueada={(negocio) => setMotivo({ k: 'promo', negocio })} />
      </View>

      <TabBar
        tabs={TABS}
        active="discover"
        onSelect={(t) => {
          const m = MOTIVO_DE_TAB[t];
          if (m) setMotivo(m);
        }}
        onPlus={() => setMotivo({ k: 'recomendar' })}
      />

      {motivo && <PuertaCuenta motivo={motivo} onClose={() => setMotivo(null)} onRegistrarse={onRegistrarse} onEntrar={onEntrar} />}
    </View>
  );
}
