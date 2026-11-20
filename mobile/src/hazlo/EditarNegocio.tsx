import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { invalidar } from '@/lib/datos/cache';
import { K, useMenu } from '@/lib/datos/consultas';
import { actualizarNegocio } from '@/lib/services/businesses';
import { guardarMenu } from '@/lib/services/menu';
import type { BusinessAdmin, Ubicacion } from '@/lib/types';
import { Icon } from './icons';
import { CampoUbicacion } from './mapa/SelectorUbicacion';
import { EditorMenu, aItems, aRenglones, firmaMenu, type RenglonMenu } from './negocio/EditorMenu';
import { Fade, PressableScale, STAGGER } from './motion';
import { BG, C, F, FG, MUTED, R } from './theme';

export const CATEGORIAS = [
  'Comida',
  'Restaurante',
  'Servicios',
  'Salud',
  'Belleza',
  'Mecánica',
  'Electricidad',
  'Plomería',
  'Educación',
  'Otro',
];

function Campo({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>
        {label}
      </Text>
      <View style={{ borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 12 }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={MUTED}
          multiline={multiline}
          style={{
            fontFamily: F.reg,
            fontSize: 14,
            color: FG,
            padding: 0,
            minHeight: multiline ? 64 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
        />
      </View>
    </View>
  );
}

function Formulario({
  negocio,
  onClose,
  onGuardado,
}: {
  negocio: BusinessAdmin;
  onClose: () => void;
  onGuardado: (n: BusinessAdmin) => void;
}) {
  const [nombre, setNombre] = useState(negocio.nombre);
  const [categoria, setCategoria] = useState(negocio.categoria);
  const [direccion, setDireccion] = useState(negocio.direccion ?? '');
  const [oferta, setOferta] = useState(negocio.oferta ?? '');
  const [descripcion, setDescripcion] = useState(negocio.descripcion ?? '');
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(negocio.lat != null && negocio.lng != null ? { lat: negocio.lat, lng: negocio.lng } : null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // El menú llega de la red; se copia una sola vez para editarlo aquí.
  const menu = useMenu(negocio.id);
  const [renglones, setRenglones] = useState<RenglonMenu[] | null>(null);
  const [firmaInicial, setFirmaInicial] = useState('');
  if (renglones === null && menu.datos) {
    const r = aRenglones(menu.datos);
    setRenglones(r);
    setFirmaInicial(firmaMenu(r));
  }

  const guardar = async () => {
    setError(null);
    const listo = renglones ? aItems(renglones) : null;
    if (listo && 'error' in listo) return setError(listo.error);
    setGuardando(true);
    const r = await actualizarNegocio(negocio.id, { nombre, categoria, direccion, oferta, descripcion, ubicacion });
    if (!r.ok) {
      setGuardando(false);
      return setError(r.error ?? 'No se pudo guardar.');
    }
    if (listo && renglones && firmaMenu(renglones) !== firmaInicial) {
      const m = await guardarMenu(negocio.id, listo.items);
      if (!m.ok) {
        setGuardando(false);
        return setError(m.error ?? 'La ficha se guardó, pero el menú no.');
      }
      invalidar(`${K.menu}:${negocio.id}`);
    }
    setGuardando(false);

    onGuardado({
      ...negocio,
      nombre: nombre.trim(),
      categoria,
      direccion: direccion.trim() || null,
      oferta: oferta.trim() || null,
      descripcion: descripcion.trim() || null,
      lat: ubicacion?.lat ?? null,
      lng: ubicacion?.lng ?? null,
    });
    onClose();
  };

  return (
    <>
      <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <PressableScale
          onPress={onClose}
          hitSlop={8}
          style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}>
          <Icon name="x" size={17} color={FG} sw={2} />
        </PressableScale>
        <View>
          <Text style={{ fontFamily: F.semi, fontSize: 10, color: C.primary, textTransform: 'uppercase', letterSpacing: 1 }}>Mi negocio</Text>
          <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4 }}>Editar ficha</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Fade desde={10}>
            <Campo label="Nombre del negocio *" value={nombre} onChangeText={setNombre} placeholder="Ej. Tacos El Güero" />
          </Fade>

          <Fade delay={STAGGER} desde={10}>
            <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>
              Categoría *
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {CATEGORIAS.map((c) => {
                const sel = categoria === c;
                return (
                  <PressableScale
                    key={c}
                    onPress={() => setCategoria(c)}
                    style={{
                      paddingHorizontal: 13,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: sel ? C.primary : '#fff',
                      borderWidth: sel ? 0 : 1,
                      borderColor: 'rgba(0,0,0,0.1)',
                    }}>
                    <Text style={{ fontFamily: F.semi, fontSize: 12, color: sel ? '#fff' : FG }}>{c}</Text>
                  </PressableScale>
                );
              })}
            </View>
          </Fade>

          <Fade delay={STAGGER * 2} desde={10}>
            <Campo label="Dirección / Ciudad" value={direccion} onChangeText={setDireccion} placeholder="Villahermosa, Tabasco" />
            <CampoUbicacion valor={ubicacion} alCambiar={setUbicacion} titulo={nombre} />
            <Campo label="Oferta Hazlo Cash" value={oferta} onChangeText={setOferta} placeholder="Ej. Refresco gratis con tu primer pedido" />
            <Campo label="Descripción" value={descripcion} onChangeText={setDescripcion} placeholder="Breve descripción del negocio…" multiline />
          </Fade>

          <Fade delay={STAGGER * 3} desde={10}>
            {renglones ? (
              <EditorMenu renglones={renglones} alCambiar={setRenglones} />
            ) : (
              <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginBottom: 16 }}>
                {menu.error ? 'No pudimos cargar el menú; los demás datos sí se pueden guardar.' : 'Cargando el menú…'}
              </Text>
            )}
          </Fade>

          {error && (
            <Fade>
              <View style={{ backgroundColor: 'rgba(235,78,0,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }}>
                <Text style={{ fontFamily: F.base, fontSize: 12.5, color: C.accent }}>{error}</Text>
              </View>
            </Fade>
          )}

          <PressableScale
            onPress={guardar}
            disabled={guardando}
            style={{ height: 52, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center', opacity: guardando ? 0.7 : 1 }}>
            {guardando ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Guardar cambios</Text>}
          </PressableScale>

          <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, textAlign: 'center', marginTop: 14, lineHeight: 17 }}>
            Los créditos y el porcentaje de comisión los administra Hazlo Cash.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

/**
 * Edición de la ficha del negocio. La usan el dueño (desde Mi negocio) y el
 * admin (desde el panel). Sólo toca los datos públicos: créditos y comisión
 * se gestionan aparte y el trigger de la base los rechaza para el dueño.
 */
export function EditarNegocio({
  negocio,
  visible,
  onClose,
  onGuardado,
}: {
  negocio: BusinessAdmin | null;
  visible: boolean;
  onClose: () => void;
  onGuardado: (n: BusinessAdmin) => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: BG }}>
        {visible && negocio && (
          <Formulario key={negocio.id} negocio={negocio} onClose={onClose} onGuardado={onGuardado} />
        )}
      </View>
    </Modal>
  );
}
