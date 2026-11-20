import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useMenu } from '@/lib/datos/consultas';

import { Fade, STAGGER } from '../motion';
import { ListaSkeleton } from '../Skeleton';
import { F, FG, MUTED, R } from '../theme';

/** «$1,200» o «$18.50». */
export function formatearPrecio(precio: number): string {
  const entero = Number.isInteger(precio);
  return `$${precio.toLocaleString('es-MX', { minimumFractionDigits: entero ? 0 : 2, maximumFractionDigits: 2 })}`;
}

/**
 * Lo que vende un negocio. Se usa en la ficha de Descubre y en la del mapa.
 * Se pide al abrir la ficha y queda en la caché: volver a abrirla es inmediato.
 */
export function MenuNegocio({ negocioId, delay = 0 }: { negocioId: string; delay?: number }) {
  const { datos: menu, cargando, error } = useMenu(negocioId);

  if (cargando) {
    return (
      <View style={{ borderRadius: R.md, paddingHorizontal: 12, backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(13,13,13,0.07)' }}>
        <ListaSkeleton filas={3} conAvatar={false} />
      </View>
    );
  }

  if (!menu || menu.length === 0) {
    return (
      <Fade delay={delay} desde={8} style={{ alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16, borderRadius: R.md, backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(13,13,13,0.07)' }}>
        <Ionicons name="restaurant-outline" size={24} color={MUTED} />
        <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG, marginTop: 6, textAlign: 'center' }}>
          {error ? 'No pudimos cargar el menú' : 'Este negocio aún no sube su menú'}
        </Text>
        <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 2, textAlign: 'center' }}>
          {error ? 'Revisa tu conexión e inténtalo otra vez.' : 'Igual lo puedes recomendar: tu código vale en todo lo que vende.'}
        </Text>
      </Fade>
    );
  }

  return (
    <View style={{ borderRadius: R.md, backgroundColor: '#fff', overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(13,13,13,0.07)' }}>
      {menu.map((item, i) => (
        <Fade key={item.id} delay={delay + Math.min(i, 7) * STAGGER} desde={6}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: 'rgba(13,13,13,0.08)' }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: FG }}>{item.nombre}</Text>
              {item.descripcion && <Text style={{ fontFamily: F.reg, fontSize: 11.5, lineHeight: 16, color: MUTED, marginTop: 2 }}>{item.descripcion}</Text>}
            </View>
            <Text style={{ fontFamily: item.precio === null ? F.reg : F.bold, fontSize: item.precio === null ? 11.5 : 13.5, color: item.precio === null ? MUTED : FG }}>
              {item.precio === null ? 'Pregunta' : formatearPrecio(item.precio)}
            </Text>
          </View>
        </Fade>
      ))}
    </View>
  );
}
