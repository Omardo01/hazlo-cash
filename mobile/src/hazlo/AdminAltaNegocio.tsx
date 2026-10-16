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

import { crearNegocio } from '@/lib/services/businesses';
import type { ComisionTipo } from '@/lib/types';
import { Icon } from './icons';
import { BG, C, F, FG, MUTED, R } from './theme';
import { PressableScale } from './motion';

const CATEGORIAS = [
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
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>{label}</Text>
      <View style={{ borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 12 }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={MUTED}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          style={{ fontFamily: F.reg, fontSize: 14, color: FG, padding: 0, minHeight: multiline ? 64 : undefined, textAlignVertical: multiline ? 'top' : 'center' }}
        />
      </View>
    </View>
  );
}

export function AdminAltaNegocio({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [direccion, setDireccion] = useState('');
  const [oferta, setOferta] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [comisionTipo, setComisionTipo] = useState<ComisionTipo>('fijo');
  const [comisionValor, setComisionValor] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const reset = () => {
    setNombre('');
    setCategoria('');
    setDireccion('');
    setOferta('');
    setDescripcion('');
    setComisionTipo('fijo');
    setComisionValor('10');
    setError(null);
    setExito(null);
  };

  const cerrar = () => {
    reset();
    onClose();
  };

  const guardar = async () => {
    if (!nombre.trim()) return setError('Escribe el nombre del negocio.');
    if (!categoria) return setError('Selecciona una categoría.');
    const valor = parseFloat(comisionValor.replace(',', '.'));
    if (isNaN(valor) || valor < 0) return setError('Define una comisión válida.');
    if (comisionTipo === 'porcentaje' && valor > 100) return setError('El porcentaje no puede ser mayor a 100.');
    setError(null);
    setLoading(true);
    const r = await crearNegocio({ nombre, categoria, direccion, oferta, descripcion, comision_tipo: comisionTipo, comision_valor: valor });
    setLoading(false);
    if (r.ok) setExito(nombre.trim());
    else setError(r.error ?? 'No se pudo dar de alta el negocio.');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={cerrar} presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: BG }}>
        {/* Header */}
        <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <PressableScale onPress={cerrar} hitSlop={8} style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}>
            <Icon name="chevR" size={18} color={FG} sw={2} />
          </PressableScale>
          <View>
            <Text style={{ fontFamily: F.semi, fontSize: 10, color: C.primary, textTransform: 'uppercase', letterSpacing: 1 }}>Admin</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4 }}>Dar de alta negocio</Text>
          </View>
        </View>

        {exito ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <View style={{ width: 80, height: 80, borderRadius: 999, backgroundColor: `${C.primary}18`, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Icon name="check" size={40} color={C.primary} sw={2.4} />
            </View>
            <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, textAlign: 'center' }}>¡Negocio registrado!</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 8, textAlign: 'center', lineHeight: 19 }}>
              <Text style={{ fontFamily: F.semi, color: FG }}>{exito}</Text> ya aparece en el catálogo de Hazlo Cash.
            </Text>
            <PressableScale onPress={reset} style={{ marginTop: 28, alignSelf: 'stretch', height: 52, borderRadius: R.md, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Registrar otro</Text>
            </PressableScale>
            <PressableScale onPress={cerrar} style={{ marginTop: 10, alignSelf: 'stretch', height: 50, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Listo</Text>
            </PressableScale>
          </View>
        ) : (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={20}>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Campo label="Nombre del negocio *" value={nombre} onChangeText={setNombre} placeholder="Ej. Tacos El Güero" />

              {/* Categoría — chips */}
              <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>Categoría *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {CATEGORIAS.map((c) => {
                  const sel = categoria === c;
                  return (
                    <PressableScale
                      key={c}
                      onPress={() => setCategoria(c)}
                      style={{ height: 36, paddingHorizontal: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: sel ? 0 : 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: sel ? C.primary : '#fff' }}>
                      <Text style={{ fontFamily: F.base, fontSize: 12.5, color: sel ? '#fff' : FG }}>{c}</Text>
                    </PressableScale>
                  );
                })}
              </View>

              <Campo label="Dirección / Ciudad" value={direccion} onChangeText={setDireccion} placeholder="Villahermosa, Tabasco" />
              <Campo label="Oferta Hazlo Cash" value={oferta} onChangeText={setOferta} placeholder="Ej. Refresco gratis con tu primer pedido" />
              <Campo label="Descripción" value={descripcion} onChangeText={setDescripcion} placeholder="Breve descripción del negocio…" multiline />

              {/* Comisión al recomendador */}
              <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>Comisión al recomendador</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                {(['fijo', 'porcentaje'] as ComisionTipo[]).map((t) => {
                  const sel = comisionTipo === t;
                  return (
                    <PressableScale
                      key={t}
                      onPress={() => setComisionTipo(t)}
                      style={{ flex: 1, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', borderWidth: sel ? 0 : 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: sel ? C.primary : '#fff' }}>
                      <Text style={{ fontFamily: F.semi, fontSize: 13, color: sel ? '#fff' : FG }}>{t === 'fijo' ? 'Monto fijo' : 'Porcentaje'}</Text>
                    </PressableScale>
                  );
                })}
              </View>
              <View style={{ borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 50, marginBottom: 4 }}>
                {comisionTipo === 'fijo' && <Text style={{ fontFamily: F.semi, fontSize: 16, color: MUTED, marginRight: 4 }}>$</Text>}
                <TextInput
                  value={comisionValor}
                  onChangeText={setComisionValor}
                  placeholder={comisionTipo === 'fijo' ? '10.00' : '10'}
                  placeholderTextColor={MUTED}
                  keyboardType="decimal-pad"
                  style={{ flex: 1, fontFamily: F.semi, fontSize: 16, color: FG, padding: 0 }}
                />
                {comisionTipo === 'porcentaje' && <Text style={{ fontFamily: F.semi, fontSize: 16, color: MUTED, marginLeft: 4 }}>%</Text>}
              </View>
              <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginBottom: 16, lineHeight: 16 }}>
                {comisionTipo === 'fijo'
                  ? 'Se paga este monto por cada venta confirmada, descontado de los créditos del negocio.'
                  : 'Se paga este porcentaje del monto de cada venta, descontado de los créditos del negocio.'}
              </Text>

              {error && (
                <View style={{ backgroundColor: 'rgba(235,78,0,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6 }}>
                  <Text style={{ fontFamily: F.base, fontSize: 12.5, color: C.accent }}>{error}</Text>
                </View>
              )}

              <PressableScale
                onPress={guardar}
                disabled={loading}
                style={{ marginTop: 8, height: 52, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Dar de alta</Text>}
              </PressableScale>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
    </Modal>
  );
}
