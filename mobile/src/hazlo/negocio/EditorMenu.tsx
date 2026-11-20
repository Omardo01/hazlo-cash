import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput, View } from 'react-native';

import type { ItemMenu, ItemMenuNuevo } from '@/lib/services/menu';

import { Fade, PressableScale } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';

/** Un renglón mientras se edita: el precio es texto hasta guardar. */
export interface RenglonMenu {
  clave: string;
  nombre: string;
  descripcion: string;
  precio: string;
}

let siguiente = 0;
const clave = () => `r-${Date.now().toString(36)}-${siguiente++}`;

export const MAX_MENU = 80;

export function aRenglones(menu: ItemMenu[]): RenglonMenu[] {
  return menu.map((i) => ({ clave: i.id, nombre: i.nombre, descripcion: i.descripcion ?? '', precio: i.precio === null ? '' : String(i.precio) }));
}

/** Renglones listos para guardar, o el error que hay que enseñar. Los vacíos se ignoran. */
export function aItems(renglones: RenglonMenu[]): { items: ItemMenuNuevo[] } | { error: string } {
  const items: ItemMenuNuevo[] = [];
  for (const r of renglones) {
    const nombre = r.nombre.trim();
    const textoPrecio = r.precio.trim().replace(/[$\s,]/g, '');
    if (!nombre && !textoPrecio && !r.descripcion.trim()) continue;
    if (!nombre) return { error: 'A una cosa del menú le falta el nombre.' };
    let precio: number | null = null;
    if (textoPrecio) {
      precio = Number(textoPrecio);
      if (!Number.isFinite(precio) || precio < 0) return { error: `Revisa el precio de «${nombre}».` };
    }
    items.push({ nombre, descripcion: r.descripcion.trim() || null, precio });
  }
  return { items };
}

/** Clave para saber si el menú cambió desde que se abrió. */
export const firmaMenu = (r: RenglonMenu[]) => JSON.stringify(r.map((x) => [x.nombre.trim(), x.descripcion.trim(), x.precio.trim()]));

export function EditorMenu({ renglones, alCambiar }: { renglones: RenglonMenu[]; alCambiar: (r: RenglonMenu[]) => void }) {
  const cambiar = (k: string, cambio: Partial<RenglonMenu>) => alCambiar(renglones.map((r) => (r.clave === k ? { ...r, ...cambio } : r)));
  const borde = { borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#fff' } as const;

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Menú o servicios</Text>
      <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginBottom: 10 }}>Lo ven quienes te recomiendan. El precio es opcional.</Text>

      {renglones.map((r, i) => (
        <Fade key={r.clave} desde={6} style={{ ...borde, padding: 10, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput
              value={r.nombre}
              onChangeText={(t) => cambiar(r.clave, { nombre: t })}
              placeholder={i === 0 ? 'Ej. Taco de pastor' : 'Nombre'}
              placeholderTextColor={MUTED}
              maxLength={60}
              accessibilityLabel="Nombre"
              style={{ flex: 1, fontFamily: F.semi, fontSize: 14, color: FG, padding: 0 }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', width: 86, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(13,13,13,0.04)' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 13, color: MUTED }}>$</Text>
              <TextInput
                value={r.precio}
                onChangeText={(t) => cambiar(r.clave, { precio: t.replace(/[^0-9.,]/g, '') })}
                placeholder="—"
                placeholderTextColor={MUTED}
                keyboardType="decimal-pad"
                maxLength={9}
                accessibilityLabel={`Precio de ${r.nombre || 'esta cosa'}`}
                style={{ flex: 1, fontFamily: F.semi, fontSize: 13, color: FG, padding: 0, marginLeft: 3 }}
              />
            </View>
            <PressableScale onPress={() => alCambiar(renglones.filter((x) => x.clave !== r.clave))} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Quitar ${r.nombre || 'esta cosa'} del menú`} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={16} color={MUTED} />
            </PressableScale>
          </View>
          <TextInput
            value={r.descripcion}
            onChangeText={(t) => cambiar(r.clave, { descripcion: t })}
            placeholder="Descripción corta (opcional)"
            placeholderTextColor={MUTED}
            maxLength={120}
            accessibilityLabel="Descripción"
            style={{ fontFamily: F.reg, fontSize: 12, color: FG, padding: 0, marginTop: 6 }}
          />
        </Fade>
      ))}

      {renglones.length < MAX_MENU && (
        <PressableScale
          onPress={() => alCambiar([...renglones, { clave: clave(), nombre: '', descripcion: '', precio: '' }])}
          accessibilityRole="button"
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: R.md, borderWidth: 1, borderStyle: 'dashed', borderColor: `${C.primary}66`, backgroundColor: `${C.primary}08` }}>
          <Ionicons name="add" size={17} color={C.accent} />
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.accent }}>{renglones.length === 0 ? 'Agregar lo primero que vendes' : 'Agregar otra cosa'}</Text>
        </PressableScale>
      )}
    </View>
  );
}
