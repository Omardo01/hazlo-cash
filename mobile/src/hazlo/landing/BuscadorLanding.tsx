import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Keyboard, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useCatalogoPublico } from '@/lib/datos/consultas';
import type { NegocioCatalogo } from '@/lib/types';

import { normalizar, type Grupo } from '../categorias/catalogo';
import { grupoDeCategoria, girosDeNegocio } from '../categorias/grupoDeNegocio';
import { IconoGrupo, TextoResaltado } from '../categorias/piezas';
import { HazloMark } from '../HazloMark';
import { Icon } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';

/** Alto de la caja de texto: Landing lo usa para colocar la lista debajo. */
const ALTO_CAMPO = 48;
const MAX_RESULTADOS = 6;

interface Coincidencia {
  negocio: NegocioCatalogo;
  grupo: Grupo;
  /** Lo que se muestra como giro: el que coincidió, el suyo o su categoría. */
  giro: string;
}

function buscarNegocios(negocios: NegocioCatalogo[], busqueda: string): Coincidencia[] {
  const q = normalizar(busqueda.trim());
  if (!q) return [];
  const salida: (Coincidencia & { empieza: boolean })[] = [];
  for (const negocio of negocios) {
    const grupo = grupoDeCategoria(negocio.categoria);
    const giros = girosDeNegocio(negocio);
    const giroTocado = giros.find((g) => normalizar(g).includes(q));
    const nombre = normalizar(negocio.nombre);
    const porCategoria = normalizar(negocio.categoria).includes(q) || normalizar(grupo.nombre).includes(q);
    if (!nombre.includes(q) && !giroTocado && !porCategoria) continue;
    salida.push({ negocio, grupo, giro: giroTocado ?? giros[0] ?? grupo.nombre, empieza: nombre.startsWith(q) });
  }
  // Los que empiezan con lo que se escribió van primero.
  return salida.sort((a, b) => Number(b.empieza) - Number(a.empieza) || a.negocio.nombre.localeCompare(b.negocio.nombre, 'es')).slice(0, MAX_RESULTADOS);
}

function FilaNegocio({ c, busqueda, indice, alTocar }: { c: Coincidencia; busqueda: string; indice: number; alTocar: () => void }) {
  return (
    <Fade delay={Math.min(indice, 5) * STAGGER} desde={6}>
      <PressableScale
        onPress={alTocar}
        accessibilityRole="button"
        accessibilityLabel={`${c.negocio.nombre}, ${c.giro}, está en Hazlo Cash`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 14, borderTopWidth: indice === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: 'rgba(13,13,13,0.08)' }}>
        <IconoGrupo grupo={c.grupo} size={38} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <TextoResaltado texto={c.negocio.nombre} busqueda={busqueda} style={{ fontFamily: F.semi, fontSize: 14, color: FG }} />
          <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 1 }}>{c.giro}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <HazloMark size={11} />
            <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: C.accent }}>Está en Hazlo Cash</Text>
          </View>
        </View>
        <Icon name="chevR" size={15} color={MUTED} />
      </PressableScale>
    </Fade>
  );
}

function FilaAccion({ texto, alTocar, primera }: { texto: string; alTocar: () => void; primera?: boolean }) {
  return (
    <PressableScale
      onPress={alTocar}
      accessibilityRole="button"
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 14, borderTopWidth: primera ? 0 : StyleSheet.hairlineWidth, borderTopColor: 'rgba(13,13,13,0.08)' }}>
      <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: FG }}>{texto}</Text>
      <Icon name="chevR" size={13} color={FG} sw={2.2} />
    </PressableScale>
  );
}

/**
 * Caja de texto del landing: busca por negocio, giro o categoría, y lo que va
 * encontrando flota debajo. No pide cuenta ni muestra promociones: a quien busca
 * le basta saber que el negocio está en Hazlo Cash.
 *
 * Landing decide dónde va y cuándo está abierta: al enfocarla sube para que el
 * teclado no tape la lista. `progreso` es esa misma animación (0 a 1).
 */
export function BuscadorLanding({
  abierto,
  progreso,
  altoLista,
  onAbrir,
  onCerrar,
  onElegir,
  onVerTodos,
  onInvitar,
}: {
  abierto: boolean;
  progreso: Animated.Value;
  /** Espacio libre debajo de la caja, ya subida. */
  altoLista: number;
  onAbrir: () => void;
  onCerrar: () => void;
  onElegir: (negocio: NegocioCatalogo) => void;
  onVerTodos: () => void;
  onInvitar: () => void;
}) {
  const [texto, setTexto] = useState('');
  const [foco, setFoco] = useState(false);
  const [teclado, setTeclado] = useState(0);
  const campo = useRef<TextInput>(null);

  // El catálogo se pide hasta que alguien toca la caja.
  const { datos: negocios, cargando, error } = useCatalogoPublico(abierto);
  const resultados = useMemo(() => buscarNegocios(negocios ?? [], texto), [negocios, texto]);

  // Al cerrarse queda limpia y sin foco.
  if (!abierto && texto) setTexto('');
  useEffect(() => {
    if (!abierto) campo.current?.blur();
  }, [abierto]);

  useEffect(() => {
    const abre = Keyboard.addListener('keyboardDidShow', (e) => setTeclado(e.endCoordinates.height));
    const cierra = Keyboard.addListener('keyboardDidHide', () => setTeclado(0));
    return () => {
      abre.remove();
      cierra.remove();
    };
  }, []);

  const hayTexto = texto.trim().length > 0;
  const sinResultados = hayTexto && !cargando && !error && resultados.length === 0;

  return (
    <View>
      <View
        style={{
          height: ALTO_CAMPO,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingLeft: 16,
          paddingRight: 8,
          borderRadius: 999,
          backgroundColor: '#fff',
          // Mismo grosor siempre: al enfocar no brinca nada.
          borderWidth: 1.5,
          borderColor: foco ? C.primary : 'transparent',
        }}>
        <Icon name="search" size={17} color={foco ? C.primary : FG} sw={2.3} />
        <TextInput
          ref={campo}
          value={texto}
          onChangeText={setTexto}
          onFocus={() => {
            setFoco(true);
            onAbrir();
          }}
          onBlur={() => setFoco(false)}
          placeholder="Busca negocio, giro o categoría"
          placeholderTextColor={MUTED}
          accessibilityLabel="Busca un negocio, un giro o una categoría"
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
          autoCorrect={false}
          style={{ flex: 1, minWidth: 0, fontFamily: F.base, fontSize: 13.5, color: FG, padding: 0, paddingRight: abierto ? 34 : 0 }}
        />
        {/* Encima del campo: cerrada, su lugar lo ocupa el texto de ayuda. */}
        <Animated.View style={{ position: 'absolute', right: 8, opacity: progreso, pointerEvents: abierto ? 'auto' : 'none' }}>
          <PressableScale
            onPress={() => {
              if (!hayTexto) {
                onCerrar();
                return;
              }
              setTexto('');
              campo.current?.focus();
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hayTexto ? 'Borrar búsqueda' : 'Cerrar la búsqueda'}
            style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,13,13,0.07)' }}>
            <Icon name="x" size={13} color={FG} sw={2.2} />
          </PressableScale>
        </Animated.View>
      </View>

      {/* Flota sobre lo demás: no empuja nada al aparecer. */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: ALTO_CAMPO + 8,
          maxHeight: Math.max(120, altoLista - teclado),
          borderRadius: R.md + 2,
          backgroundColor: '#fff',
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
          opacity: progreso,
          pointerEvents: abierto ? 'auto' : 'none',
          transform: [{ translateY: progreso.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
        }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {hayTexto && cargando && !negocios ? (
            <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, padding: 16, textAlign: 'center' }}>Buscando…</Text>
          ) : null}
          {hayTexto && error && !negocios ? (
            <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, padding: 16, textAlign: 'center' }}>No pudimos buscar. Revisa tu conexión e inténtalo otra vez.</Text>
          ) : null}
          {resultados.map((c, i) => (
            <FilaNegocio key={c.negocio.id} c={c} busqueda={texto} indice={i} alTocar={() => onElegir(c.negocio)} />
          ))}
          {sinResultados ? (
            <Fade key={texto} desde={6}>
              <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, alignItems: 'center' }}>
                <Ionicons name="storefront-outline" size={22} color={MUTED} />
                <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: FG, marginTop: 6, textAlign: 'center' }}>«{texto.trim()}» aún no está en Hazlo Cash</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 2, textAlign: 'center' }}>¿Lo conoces? Invítalo a sumarse.</Text>
              </View>
              <FilaAccion texto="Invitar a un negocio" alTocar={onInvitar} />
            </Fade>
          ) : null}
          <FilaAccion texto="Ver todos los negocios" alTocar={onVerTodos} primera={!hayTexto} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}
