import { RefreshControl, ScrollView, Text, View } from 'react-native';

import { useEmbajadoresNegocio } from '@/lib/datos/consultas';
import type { EmbajadorNegocio } from '@/lib/services/businesses';
import { Icon } from '../icons';
import { Fade, STAGGER } from '../motion';
import { ListaSkeleton } from '../Skeleton';
import { C, F, FG, MUTED, R } from '../theme';

const money = (n: number) => `$${n.toFixed(2)}`;

function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '··';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[1][0]).toUpperCase();
}

// Los tres primeros llevan medalla: el ranking es el incentivo del embajador
// y el negocio necesita ver de un vistazo quién le trae clientes.
const MEDALLA = ['#F5A623', '#9AA0A6', '#C67C43'];

function desde(iso: string | null): string {
  if (!iso) return 'Sin actividad';
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  if (dias < 30) return `Hace ${dias} días`;
  const meses = Math.floor(dias / 30);
  return `Hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
}

function Fila({ e, pos, delay }: { e: EmbajadorNegocio; pos: number; delay: number }) {
  const medalla = pos < 3 && e.confirmadas > 0 ? MEDALLA[pos] : null;

  return (
    <Fade delay={delay} desde={12}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', marginBottom: 10 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: medalla ? `${medalla}22` : 'rgba(13,13,13,0.05)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.bold, fontSize: 14, color: medalla ?? FG, letterSpacing: -0.3 }}>{iniciales(e.nombre)}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }} numberOfLines={1}>
              {e.nombre}
            </Text>
            {medalla && <Icon name="star" size={12} color={medalla} fill={medalla} sw={1} />}
          </View>
          <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 2 }}>
            {e.codigo} · {desde(e.ultima)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 7 }}>
            <Text style={{ fontFamily: F.base, fontSize: 11, color: FG }}>
              {e.confirmadas} {e.confirmadas === 1 ? 'venta' : 'ventas'}
            </Text>
            {e.pendientes > 0 && (
              <Text style={{ fontFamily: F.base, fontSize: 11, color: C.primary }}>{e.pendientes} pendiente{e.pendientes === 1 ? '' : 's'}</Text>
            )}
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: F.bold, fontSize: 15, color: FG, letterSpacing: -0.3 }}>{money(e.comisionPagada)}</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: MUTED, marginTop: 1 }}>pagado</Text>
        </View>
      </View>
    </Fade>
  );
}

export function EmbajadoresNegocioScreen() {
  const { datos, cargando, refrescar } = useEmbajadoresNegocio();
  const lista = datos ?? [];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refrescar} tintColor={C.primary} />}>
      <Fade desde={8}>
        <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44 }}>Quién te recomienda</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 4, marginBottom: 18 }}>
          Tus embajadores, ordenados por ventas que te trajeron.
        </Text>
      </Fade>

      {cargando ? (
        <ListaSkeleton filas={4} />
      ) : lista.length === 0 ? (
        <Fade delay={STAGGER} desde={12}>
          <View style={{ borderRadius: R.lg, padding: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', alignItems: 'center' }}>
            <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: `${C.primary}14`, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Icon name="share" size={23} color={C.primary} />
            </View>
            <Text style={{ fontFamily: F.semi, fontSize: 16, color: FG, textAlign: 'center' }}>Nadie te recomienda todavía</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, textAlign: 'center', marginTop: 8, lineHeight: 19 }}>
              Cuando alguien genere su código para tu negocio va a aparecer aquí, con las ventas
              que te trajo y lo que le has pagado.
            </Text>
          </View>
        </Fade>
      ) : (
        lista.map((e, i) => <Fila key={e.codigoId} e={e} pos={i} delay={i * STAGGER} />)
      )}
    </ScrollView>
  );
}
