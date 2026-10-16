import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState, type ComponentProps } from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { grupoPorSlug } from '../categorias/catalogo';
import { ETIQUETADO_VACIO, SelectorGiros, type Etiquetado } from '../categorias/SelectorGiros';
import { Icon } from '../icons';
import { DUR, EASE, Fade, PressableScale, STAGGER, useReduceMotion } from '../motion';
import { BG, C, F, FG, MUTED, R } from '../theme';
import { CajaCampo, hueColors } from '../ui';

/**
 * /registro-negocio — alta de un negocio, etiquetado con un grupo y sus giros
 * del catálogo del Excel (categorias/catalogo.ts).
 *
 * Por ahora es solo la vista: valida y enseña un resumen local, no escribe en
 * Supabase. Ver el comentario en `registrar` para dónde se conecta.
 */

interface DatosNegocio {
  nombre: string;
  descripcion: string;
  etiquetado: Etiquetado;
  direccion: string;
  ciudad: string;
  responsable: string;
  telefono: string;
  correo: string;
  oferta: string;
}

type Campo = keyof DatosNegocio;
type Errores = Partial<Record<Campo, string>>;

const VACIO: DatosNegocio = {
  nombre: '',
  descripcion: '',
  etiquetado: ETIQUETADO_VACIO,
  direccion: '',
  ciudad: '',
  responsable: '',
  telefono: '',
  correo: '',
  oferta: '',
};

const MAX_DESCRIPCION = 140;
const IDEAS_OFERTA = ['Refresco gratis', '10% de descuento', 'Postre de cortesía', 'Envío gratis', '2×1 en la primera visita'];

// Sección donde vive cada campo: con errores, se hace scroll a la primera.
const SECCION: Record<Campo, number> = {
  nombre: 0,
  descripcion: 0,
  etiquetado: 1,
  direccion: 2,
  ciudad: 2,
  responsable: 3,
  telefono: 3,
  correo: 3,
  oferta: 4,
};

/** 10 dígitos, sin espacios ni lada +52. */
function soloDigitos(t: string) {
  return t.replace(/\D/g, '').replace(/^52(?=\d{10}$)/, '');
}

function formatearTelefono(t: string) {
  const d = soloDigitos(t);
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : t.trim();
}

// Mensajes cortos: se pintan en el renglón de la etiqueta, en lugar del hint.
function validar(d: DatosNegocio): Errores {
  const e: Errores = {};
  if (d.nombre.trim().length < 2) e.nombre = 'Escribe el nombre';
  if (!d.etiquetado.grupo) e.etiquetado = 'Elige grupo y al menos un giro';
  else if (d.etiquetado.giros.length === 0) e.etiquetado = 'Elige al menos un giro';
  if (!d.direccion.trim()) e.direccion = 'Escribe calle y colonia';
  if (!d.ciudad.trim()) e.ciudad = 'Escribe la ciudad';
  if (!d.responsable.trim()) e.responsable = 'Escribe quién atiende';
  if (soloDigitos(d.telefono).length !== 10) e.telefono = 'Debe tener 10 dígitos';
  if (d.correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim())) e.correo = 'Revisa el correo';
  if (d.oferta.trim().length < 3) e.oferta = 'Escribe el beneficio';
  return e;
}

// ── Piezas del formulario ──────────────────────────────────────────────────────

function CampoTexto({
  label,
  hint,
  error,
  multiline,
  maxLength,
  ...input
}: {
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  multiline?: boolean;
  maxLength?: number;
}) {
  const [foco, setFoco] = useState(false);
  const derecha = [hint, multiline && maxLength ? `${input.value.length}/${maxLength}` : undefined].filter(Boolean).join(' · ');

  return (
    <View style={{ marginBottom: 14 }}>
      {/* El error reemplaza al hint en el mismo renglón: aparecer no empuja nada. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
        <Text style={{ fontFamily: F.base, fontSize: 12, color: FG }}>{label}</Text>
        {error ? (
          <Fade key={error} style={{ flexShrink: 1 }}>
            <Text numberOfLines={1} style={{ fontFamily: F.base, fontSize: 11, color: C.accent }}>
              {error}
            </Text>
          </Fade>
        ) : (
          !!derecha && <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>{derecha}</Text>
        )}
      </View>
      <CajaCampo activo={foco} style={error && !foco ? { borderColor: 'rgba(235,78,0,0.55)' } : undefined}>
        <TextInput
          placeholderTextColor={MUTED}
          autoCorrect={false}
          multiline={multiline}
          maxLength={maxLength}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          style={{
            fontFamily: F.reg,
            fontSize: 14,
            color: FG,
            padding: 0,
            minHeight: multiline ? 60 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
          {...input}
        />
      </CajaCampo>
    </View>
  );
}

function Seccion({
  n,
  titulo,
  nota,
  refSeccion,
  children,
}: {
  n: number;
  titulo: string;
  nota?: string;
  refSeccion: (n: number, v: View | null) => void;
  children: React.ReactNode;
}) {
  return (
    <View ref={(v) => refSeccion(n, v)} style={{ marginTop: 26 }}>
      <Fade delay={(n + 1) * STAGGER} desde={10}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: `${C.primary}1A`, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.accent }}>{n + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 16, color: FG, letterSpacing: -0.2 }}>{titulo}</Text>
            {nota && <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 1, lineHeight: 16 }}>{nota}</Text>}
          </View>
        </View>
        {children}
      </Fade>
    </View>
  );
}

/** Cómo verá la oferta quien llega recomendado. Se actualiza mientras se escribe. */
function VistaOferta({ nombre, oferta }: { nombre: string; oferta: string }) {
  const vacia = !oferta.trim();
  return (
    <View style={{ borderRadius: R.lg, overflow: 'hidden', padding: 16, marginTop: 4 }}>
      <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={{ position: 'absolute', right: -16, bottom: -24, opacity: 0.16 }}>
        <Ionicons name="gift" size={110} color="#fff" />
      </View>
      <Text style={{ fontFamily: F.semi, fontSize: 10, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.8 }}>ASÍ LO VE QUIEN LLEGA RECOMENDADO</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="gift" size={20} color="#fff" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
            En {nombre.trim() || 'tu negocio'} te toca
          </Text>
          <Text numberOfLines={2} style={{ fontFamily: F.bold, fontSize: 17, lineHeight: 22, color: vacia ? 'rgba(255,255,255,0.55)' : '#fff', letterSpacing: -0.3 }}>
            {vacia ? 'Tu beneficio aparece aquí' : oferta.trim()}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── Formulario ─────────────────────────────────────────────────────────────────

function Formulario({
  datos,
  errores,
  set,
  onEtiquetado,
  onRegistrar,
}: {
  datos: DatosNegocio;
  errores: Errores;
  set: (campo: Exclude<Campo, 'etiquetado'>, valor: string) => void;
  onEtiquetado: (v: Etiquetado) => void;
  onRegistrar: (scrollA: (seccion: number) => void) => void;
}) {
  const scroll = useRef<ScrollView>(null);
  const marco = useRef<View>(null);
  const secciones = useRef<(View | null)[]>([]);
  const desplazado = useRef(0);
  const reduce = useReduceMotion();
  const refSeccion = useCallback((n: number, v: View | null) => {
    secciones.current[n] = v;
  }, []);

  // Se mide al momento: cuando la sección de giros crece, las de abajo se
  // mueven y en web onLayout no avisa de un cambio de posición.
  const scrollA = (seccion: number) => {
    const nodo = secciones.current[seccion];
    if (!nodo || !marco.current) return;
    marco.current.measureInWindow((_x, yMarco) => {
      nodo.measureInWindow((_x2, ySeccion) => {
        const y = desplazado.current + ySeccion - yMarco - 8;
        scroll.current?.scrollTo({ y: Math.max(0, y), animated: !reduce });
      });
    });
  };
  const faltan = Object.values(errores).filter(Boolean).length;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View ref={marco} style={{ flex: 1 }}>
        <ScrollView
          ref={scroll}
          onScroll={(e) => {
            desplazado.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48 }}>
          <Fade desde={10}>
            <View style={{ alignItems: 'center' }}>
              <LinearGradient
                colors={[C.primary, C.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 60, height: 60, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 13 }}>
                <Ionicons name="storefront" size={28} color="#fff" />
              </LinearGradient>
              <Text style={{ fontFamily: F.bold, fontSize: 23, color: FG, letterSpacing: -0.5 }}>Registra tu negocio</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 4, textAlign: 'center', lineHeight: 19 }}>
                Te llegan clientes recomendados y solo pagas comisión cuando vendes.
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  marginTop: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 999,
                  backgroundColor: `${C.primary}14`,
                }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary }} />
                <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.accent }}>Vista previa · todavía no se guarda</Text>
              </View>
            </View>
          </Fade>

          <Seccion n={0} titulo="Tu negocio" refSeccion={refSeccion}>
            <CampoTexto
              label="Nombre del negocio"
              value={datos.nombre}
              onChangeText={(t) => set('nombre', t)}
              placeholder="Ej. Tacos El Güero"
              autoCapitalize="words"
              error={errores.nombre}
            />
            <CampoTexto
              label="Descripción corta"
              hint="opcional"
              value={datos.descripcion}
              onChangeText={(t) => set('descripcion', t)}
              placeholder="Qué vendes y qué te hace distinto…"
              autoCapitalize="sentences"
              multiline
              maxLength={MAX_DESCRIPCION}
            />
          </Seccion>

          <Seccion n={1} titulo="¿A qué se dedica?" nota="Un grupo principal y hasta 5 giros: así te encuentran en el catálogo." refSeccion={refSeccion}>
            <SelectorGiros valor={datos.etiquetado} onCambio={onEtiquetado} error={errores.etiquetado} />
          </Seccion>

          <Seccion n={2} titulo="Dónde está" refSeccion={refSeccion}>
            <CampoTexto
              label="Dirección y colonia"
              value={datos.direccion}
              onChangeText={(t) => set('direccion', t)}
              placeholder="Ej. Av. Gregorio Méndez 123, Col. Atasta"
              autoCapitalize="sentences"
              error={errores.direccion}
            />
            <CampoTexto
              label="Ciudad"
              value={datos.ciudad}
              onChangeText={(t) => set('ciudad', t)}
              placeholder="Ej. Villahermosa, Tabasco"
              autoCapitalize="words"
              error={errores.ciudad}
            />
          </Seccion>

          <Seccion n={3} titulo="Contacto" nota="No se muestra a los clientes: el contacto pasa por Hazlo Cash." refSeccion={refSeccion}>
            <CampoTexto
              label="Nombre del responsable"
              value={datos.responsable}
              onChangeText={(t) => set('responsable', t)}
              placeholder="Quién atiende el negocio"
              autoCapitalize="words"
              error={errores.responsable}
            />
            <CampoTexto
              label="Teléfono"
              hint="10 dígitos"
              value={datos.telefono}
              onChangeText={(t) => set('telefono', t)}
              placeholder="993 123 4567"
              keyboardType="phone-pad"
              maxLength={16}
              error={errores.telefono}
            />
            <CampoTexto
              label="Correo electrónico"
              hint="opcional"
              value={datos.correo}
              onChangeText={(t) => set('correo', t)}
              placeholder="negocio@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errores.correo}
            />
          </Seccion>

          <Seccion n={4} titulo="Oferta Hazlo Cash" nota="El beneficio para quien llega con un código de recomendación." refSeccion={refSeccion}>
            <CampoTexto
              label="¿Qué le das?"
              value={datos.oferta}
              onChangeText={(t) => set('oferta', t)}
              placeholder="Ej. Refresco gratis en tu primera visita"
              autoCapitalize="sentences"
              maxLength={60}
              error={errores.oferta}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: -4, marginBottom: 14 }}>
              {IDEAS_OFERTA.map((idea) => (
                <PressableScale
                  key={idea}
                  onPress={() => set('oferta', idea)}
                  accessibilityRole="button"
                  accessibilityLabel={`Usar «${idea}»`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingLeft: 9, paddingRight: 12, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }}>
                  <Icon name="plus" size={12} color={MUTED} />
                  <Text style={{ fontFamily: F.base, fontSize: 12, color: FG }}>{idea}</Text>
                </PressableScale>
              ))}
            </View>
            <VistaOferta nombre={datos.nombre} oferta={datos.oferta} />
          </Seccion>

          <Fade delay={6 * STAGGER} desde={10} style={{ marginTop: 22 }}>
            {/* Alto fijo: el aviso entra y sale sin mover el botón. */}
            <View style={{ height: 20, justifyContent: 'center', marginBottom: 6 }}>
              {faltan > 0 && (
                <Fade key={faltan}>
                  <Text style={{ fontFamily: F.base, fontSize: 12, color: C.accent, textAlign: 'center' }}>
                    {faltan === 1 ? 'Falta un dato: lo marcamos arriba.' : `Faltan ${faltan} datos: los marcamos arriba.`}
                  </Text>
                </Fade>
              )}
            </View>
            <PressableScale
              onPress={() => onRegistrar(scrollA)}
              accessibilityRole="button"
              style={{ height: 52, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Registrar negocio</Text>
            </PressableScale>
          </Fade>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Resumen ────────────────────────────────────────────────────────────────────

function Palomita() {
  const p = useState(() => new Animated.Value(0))[0];
  const reduce = useReduceMotion();

  useEffect(() => {
    if (reduce) {
      p.setValue(1);
      return;
    }
    Animated.timing(p, { toValue: 1, duration: DUR.slow, easing: EASE.out, useNativeDriver: true }).start();
  }, [p, reduce]);

  return (
    <Animated.View style={{ opacity: p, transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }}>
      <LinearGradient
        colors={[C.primary, C.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="check" size={30} color="#fff" />
      </LinearGradient>
    </Animated.View>
  );
}

type NombreIcono = ComponentProps<typeof Ionicons>['name'];

interface Fila {
  icono: NombreIcono;
  label: string;
  valor: string;
}

function TarjetaDatos({ titulo, icono, filas }: { titulo: string; icono: NombreIcono; filas: Fila[] }) {
  return (
    <View style={{ borderRadius: R.lg, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
        <Ionicons name={icono} size={13} color={MUTED} />
        <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: MUTED }}>{titulo}</Text>
      </View>
      {filas.map((f, i) => (
        <View
          key={f.label}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 11,
            paddingHorizontal: 16,
            borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
            borderTopColor: 'rgba(13,13,13,0.08)',
          }}>
          <Ionicons name={f.icono} size={17} color={MUTED} />
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, width: 84 }}>{f.label}</Text>
          <Text style={{ flex: 1, fontFamily: F.base, fontSize: 13, color: FG, textAlign: 'right' }}>{f.valor}</Text>
        </View>
      ))}
    </View>
  );
}

function Resumen({ datos, onEditar, onOtro }: { datos: DatosNegocio; onEditar: () => void; onOtro: () => void }) {
  const grupo = grupoPorSlug(datos.etiquetado.grupo ?? undefined);
  const hue = grupo?.hue ?? 26;
  const [a, b, c] = hueColors(hue);
  const tinte = `hsla(${hue}, 70%, 45%, 0.10)`;
  const tono = `hsl(${hue + 8}, 52%, 38%)`;

  const ubicacion: Fila[] = [
    { icono: 'location-outline', label: 'Dirección', valor: datos.direccion.trim() },
    { icono: 'business-outline', label: 'Ciudad', valor: datos.ciudad.trim() },
  ];
  const contacto: Fila[] = [
    { icono: 'person-outline', label: 'Responsable', valor: datos.responsable.trim() },
    { icono: 'call-outline', label: 'Teléfono', valor: formatearTelefono(datos.telefono) },
  ];
  if (datos.correo.trim()) contacto.push({ icono: 'mail-outline', label: 'Correo', valor: datos.correo.trim() });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 }}>
      <View style={{ alignItems: 'center' }}>
        <Palomita />
        <Fade delay={STAGGER} desde={8} style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: F.bold, fontSize: 23, color: FG, letterSpacing: -0.5, marginTop: 14 }}>¡Listo! Así quedó</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 4, textAlign: 'center', lineHeight: 19 }}>
            Revisa que todo esté bien. Es una vista previa: todavía no se guarda en Hazlo Cash.
          </Text>
        </Fade>
      </View>

      {/* Tarjeta del negocio */}
      <Fade delay={STAGGER * 2} desde={14} style={{ marginTop: 22 }}>
        <View style={{ borderRadius: R.lg, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)' }}>
          <View style={{ height: 120, padding: 16, justifyContent: 'flex-end' }}>
            <LinearGradient colors={[a, b, c]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']} start={{ x: 0.1, y: 0 }} end={{ x: 0.7, y: 0.6 }} style={StyleSheet.absoluteFill} />
            {grupo && (
              <View style={{ position: 'absolute', right: -16, bottom: -26, opacity: 0.14 }}>
                <Ionicons name={grupo.icono} size={130} color="#fff" />
              </View>
            )}
            <Text numberOfLines={2} style={{ fontFamily: F.bold, fontSize: 22, lineHeight: 27, color: '#fff', letterSpacing: -0.5 }}>
              {datos.nombre.trim()}
            </Text>
            {grupo && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <Ionicons name={grupo.icono} size={13} color="rgba(255,255,255,0.9)" />
                <Text style={{ fontFamily: F.base, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>{grupo.nombre}</Text>
              </View>
            )}
          </View>

          <View style={{ padding: 16, gap: 14 }}>
            {!!datos.descripcion.trim() && (
              <Text style={{ fontFamily: F.reg, fontSize: 13, color: FG, lineHeight: 19 }}>{datos.descripcion.trim()}</Text>
            )}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {datos.etiquetado.giros.map((giro) => (
                <View key={giro} style={{ paddingVertical: 5, paddingHorizontal: 11, borderRadius: 999, backgroundColor: tinte }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: tono }}>{giro}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: R.md, backgroundColor: '#FFF1E6' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="gift" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: F.reg, fontSize: 11, color: C.accent }}>Para quien llega recomendado</Text>
                <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG, marginTop: 1 }}>{datos.oferta.trim()}</Text>
              </View>
            </View>
          </View>
        </View>
      </Fade>

      <Fade delay={STAGGER * 3} desde={14} style={{ marginTop: 14 }}>
        <TarjetaDatos titulo="Dónde está" icono="map-outline" filas={ubicacion} />
      </Fade>
      {/* El contacto es privado (anti-bypass): el cliente escribe por la app. */}
      <Fade delay={STAGGER * 4} desde={14} style={{ marginTop: 14 }}>
        <TarjetaDatos titulo="Contacto · solo lo ve Hazlo Cash" icono="lock-closed-outline" filas={contacto} />
      </Fade>

      <Fade delay={STAGGER * 5} desde={10} style={{ marginTop: 20 }}>
        <PressableScale
          onPress={onEditar}
          accessibilityRole="button"
          style={{ height: 50, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="create-outline" size={18} color={FG} />
          <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Editar datos</Text>
        </PressableScale>
        <PressableScale onPress={onOtro} accessibilityRole="button" hitSlop={8} style={{ alignSelf: 'center', marginTop: 16, paddingVertical: 4, paddingHorizontal: 8 }}>
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.primary }}>Registrar otro negocio</Text>
        </PressableScale>
      </Fade>
    </ScrollView>
  );
}

// ── Pantalla ───────────────────────────────────────────────────────────────────

// `conAreaSegura` en false cuando ya la pone quien la contiene (la puerta de
// entrada de la app), para no sumar dos veces el margen de arriba.
export function RegistroNegocioScreen({ conAreaSegura = true }: { conAreaSegura?: boolean } = {}) {
  const [datos, setDatos] = useState<DatosNegocio>(VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const [vista, setVista] = useState<'formulario' | 'resumen'>('formulario');
  const opacidad = useState(() => new Animated.Value(1))[0];
  const enTransicion = useRef(false);
  const reduce = useReduceMotion();

  const set = useCallback(<K extends Campo>(campo: K, valor: DatosNegocio[K]) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    // Al corregir un campo, su error se va.
    setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e));
  }, []);
  const onEtiquetado = useCallback((v: Etiquetado) => set('etiquetado', v), [set]);

  // La vista que se va sale con fade antes de desmontarse; la nueva entra con
  // sus propios Fade. La opacidad vuelve a 1 ya con la nueva montada.
  const irA = (siguiente: 'formulario' | 'resumen') => {
    if (enTransicion.current) return;
    if (reduce) {
      setVista(siguiente);
      return;
    }
    enTransicion.current = true;
    Animated.timing(opacidad, { toValue: 0, duration: DUR.fast, easing: EASE.in, useNativeDriver: true }).start(() => {
      setVista(siguiente);
      enTransicion.current = false;
    });
  };
  useEffect(() => {
    opacidad.setValue(1);
  }, [vista, opacidad]);

  const registrar = (scrollA: (seccion: number) => void) => {
    const e = validar(datos);
    setErrores(e);
    const conError = (Object.keys(e) as Campo[]).filter((k) => e[k]);
    if (conError.length > 0) {
      scrollA(Math.min(...conError.map((k) => SECCION[k])));
      return;
    }
    // Guardado pendiente (lo decide Omar): aquí iría crearNegocio() de
    // lib/services/businesses.ts. El grupo cabe en `businesses.categoria`
    // (hoy guarda una de las 10 CATEGORIAS viejas; habría que pasar a los slugs
    // de GRUPOS) y los giros necesitan lugar propio: `businesses.giros text[]`
    // o una tabla `business_giros`. Responsable/teléfono/correo son privados
    // (anti-bypass): no van en columnas que lean los clientes.
    irA('resumen');
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={conAreaSegura ? ['top'] : []}>
        <Animated.View style={{ flex: 1, opacity: opacidad }}>
          {vista === 'formulario' ? (
            <Formulario datos={datos} errores={errores} set={set} onEtiquetado={onEtiquetado} onRegistrar={registrar} />
          ) : (
            <Resumen
              datos={datos}
              onEditar={() => irA('formulario')}
              onOtro={() => {
                setDatos(VACIO);
                setErrores({});
                irA('formulario');
              }}
            />
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
