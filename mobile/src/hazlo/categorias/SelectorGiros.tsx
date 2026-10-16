import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../icons';
import { DUR, EASE, Fade, PressableScale, STAGGER, useReduceMotion } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { hueColors } from '../ui';
import { buscarGiros, grupoPorSlug, GRUPOS, type Grupo } from './catalogo';
import { Buscador, IconoGrupo, TextoResaltado } from './piezas';

/**
 * Etiquetado de un negocio con el catálogo del Excel: un grupo principal y
 * hasta MAX_GIROS giros de ese grupo. El buscador recorre los 271 giros; si se
 * elige uno de otro grupo, el grupo principal se cambia con él.
 */

export const MAX_GIROS = 5;
// Una búsqueda de una letra encuentra cientos: se pintan los primeros.
const MAX_RESULTADOS = 30;

export interface Etiquetado {
  /** slug del grupo principal (ver GRUPOS). */
  grupo: string | null;
  /** Giros elegidos; todos son del grupo principal. */
  giros: string[];
}

export const ETIQUETADO_VACIO: Etiquetado = { grupo: null, giros: [] };

/** 0 → 1 cuando `activo`: enciende un relleno con fade corto (nativo). */
function useEncendido(activo: boolean) {
  const p = useState(() => new Animated.Value(activo ? 1 : 0))[0];
  const reduce = useReduceMotion();

  useEffect(() => {
    const destino = activo ? 1 : 0;
    if (reduce) {
      p.setValue(destino);
      return;
    }
    Animated.timing(p, { toValue: destino, duration: DUR.fast, easing: activo ? EASE.out : EASE.in, useNativeDriver: true }).start();
  }, [p, activo, reduce]);

  return p;
}

// ── Etiquetas elegidas ─────────────────────────────────────────────────────────

interface Presente {
  clave: string;
  saliendo: boolean;
}

/**
 * Lista que deja salir con animación lo que ya no está: lo quitado se queda
 * marcado `saliendo` hasta que su animación termina y llama a `salio`.
 */
function usePresencia(claves: string[]): [Presente[], (clave: string) => void] {
  const firma = claves.join('\n');
  const [firmaPrevia, setFirmaPrevia] = useState(firma);
  const [lista, setLista] = useState<Presente[]>(() => claves.map((clave) => ({ clave, saliendo: false })));

  // Cambió la selección: se ajusta durante el render (sin efecto de por medio).
  if (firma !== firmaPrevia) {
    setFirmaPrevia(firma);
    setLista((prev) => {
      const siguen = new Set(claves);
      const sig = prev.map((p) => ({ clave: p.clave, saliendo: !siguen.has(p.clave) }));
      const yaEstaban = new Set(prev.map((p) => p.clave));
      for (const c of claves) if (!yaEstaban.has(c)) sig.push({ clave: c, saliendo: false });
      return sig;
    });
  }

  const salio = useCallback((clave: string) => setLista((prev) => prev.filter((p) => !(p.clave === clave && p.saliendo))), []);
  return [lista, salio];
}

function Etiqueta({
  clave,
  texto,
  saliendo,
  onQuitar,
  onSalio,
}: {
  clave: string;
  texto: string;
  saliendo: boolean;
  onQuitar: (giro: string) => void;
  onSalio: (clave: string) => void;
}) {
  const p = useState(() => new Animated.Value(0))[0];
  const reduce = useReduceMotion();

  useEffect(() => {
    if (reduce) {
      p.setValue(saliendo ? 0 : 1);
      if (saliendo) onSalio(clave);
      return;
    }
    // Si vuelve a elegirse a media salida, esta animación corta a la anterior
    // (que termina con finished=false y ya no la desmonta).
    Animated.timing(p, {
      toValue: saliendo ? 0 : 1,
      duration: saliendo ? DUR.fast : DUR.base,
      easing: saliendo ? EASE.in : EASE.out,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && saliendo) onSalio(clave);
    });
  }, [p, saliendo, reduce, clave, onSalio]);

  return (
    <Animated.View
      pointerEvents={saliendo ? 'none' : 'auto'}
      style={{ opacity: p, transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingLeft: 12, paddingRight: 5, borderRadius: 999, backgroundColor: C.primary }}>
        <Text style={{ fontFamily: F.base, fontSize: 12, color: '#fff' }}>{texto}</Text>
        <PressableScale
          onPress={() => onQuitar(texto)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Quitar ${texto}`}
          style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={10} color="#fff" />
        </PressableScale>
      </View>
    </Animated.View>
  );
}

function EtiquetasElegidas({
  grupo,
  giros,
  marcarError,
  onQuitar,
}: {
  grupo: Grupo | undefined;
  giros: string[];
  marcarError: boolean;
  onQuitar: (giro: string) => void;
}) {
  // La clave lleva el grupo: «Veterinario» y «Venta y renta» viven en dos.
  const [lista, salio] = usePresencia(grupo ? giros.map((g) => `${grupo.slug}:${g}`) : []);

  // Alto mínimo de una fila: la primera etiqueta entra sin empujar lo de abajo.
  return (
    <View style={{ minHeight: 30, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
      {lista.length === 0 ? (
        <Fade>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: marcarError ? C.accent : MUTED }}>
            Aún no eliges. Búscalo arriba o escoge un grupo.
          </Text>
        </Fade>
      ) : (
        lista.map(({ clave, saliendo }) => (
          <Etiqueta key={clave} clave={clave} texto={clave.slice(clave.indexOf(':') + 1)} saliendo={saliendo} onQuitar={onQuitar} onSalio={salio} />
        ))
      )}
    </View>
  );
}

// ── Grupos ─────────────────────────────────────────────────────────────────────

function TileGrupo({ grupo, actual, onPress }: { grupo: Grupo; actual: boolean; onPress: () => void }) {
  const p = useEncendido(actual);
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: actual }}
      accessibilityLabel={`${grupo.nombre}, ${grupo.giros.length} giros`}
      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 62, padding: 10, borderRadius: R.md }}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: R.md, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' }]} />
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: R.md, borderWidth: 1.5, borderColor: C.primary, opacity: p }]} />
      <IconoGrupo grupo={grupo} size={34} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={2} style={{ fontFamily: F.semi, fontSize: 12, lineHeight: 15, color: FG }}>
          {grupo.nombre}
        </Text>
        <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: MUTED, marginTop: 1 }}>
          {grupo.giros.length} {grupo.giros.length === 1 ? 'giro' : 'giros'}
        </Text>
      </View>
    </PressableScale>
  );
}

function RejillaGrupos({ actual, onElegir }: { actual: string | null; onElegir: (g: Grupo) => void }) {
  const filas: Grupo[][] = [];
  for (let i = 0; i < GRUPOS.length; i += 2) filas.push(GRUPOS.slice(i, i + 2));

  return (
    <View style={{ gap: 8 }}>
      {filas.map((fila, f) => (
        <View key={fila[0].slug} style={{ flexDirection: 'row', gap: 8 }}>
          {fila.map((g, k) => (
            <Fade key={g.slug} delay={Math.min(f * 2 + k, 8) * STAGGER} desde={8} style={{ flex: 1 }}>
              <TileGrupo grupo={g} actual={g.slug === actual} onPress={() => onElegir(g)} />
            </Fade>
          ))}
          {fila.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  );
}

function GrupoElegido({ grupo, onCambiar }: { grupo: Grupo; onCambiar: () => void }) {
  const [a, b, c] = hueColors(grupo.hue);
  return (
    <View style={{ height: 74, borderRadius: R.md, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 }}>
      <LinearGradient colors={[a, b, c]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']} start={{ x: 0.1, y: 0 }} end={{ x: 0.7, y: 0.6 }} style={StyleSheet.absoluteFill} />
      <View style={{ position: 'absolute', right: 70, bottom: -22, opacity: 0.14 }}>
        <Ionicons name={grupo.icono} size={92} color="#fff" />
      </View>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={grupo.icono} size={20} color="#fff" />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: F.semi, fontSize: 10, color: 'rgba(255,255,255,0.78)', letterSpacing: 0.8 }}>GRUPO PRINCIPAL</Text>
        <Text numberOfLines={1} style={{ fontFamily: F.bold, fontSize: 16, color: '#fff', letterSpacing: -0.3, marginTop: 1 }}>
          {grupo.nombre}
        </Text>
      </View>
      <PressableScale
        onPress={onCambiar}
        accessibilityRole="button"
        accessibilityLabel="Cambiar grupo principal"
        style={{ paddingVertical: 7, paddingHorizontal: 13, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.24)' }}>
        <Text style={{ fontFamily: F.semi, fontSize: 12, color: '#fff' }}>Cambiar</Text>
      </PressableScale>
    </View>
  );
}

// ── Giros ──────────────────────────────────────────────────────────────────────

function ChipGiro({ giro, activo, apagado, onPress }: { giro: string; activo: boolean; apagado: boolean; onPress: () => void }) {
  const p = useEncendido(activo);
  // El ícono ocupa el mismo lugar en los dos estados: elegir no cambia el
  // ancho del chip y la fila no se reacomoda.
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: activo }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingLeft: 10, paddingRight: 13, borderRadius: 999, opacity: apagado ? 0.45 : 1 }}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }]} />
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: 999, backgroundColor: '#FFF1E6', borderWidth: 1, borderColor: `${C.primary}99`, opacity: p }]} />
      {/* En web el <svg> no está posicionado y las capas absolutas lo
          taparían; el View (relative en RN-web) lo deja encima. */}
      <View>
        <Icon name={activo ? 'check' : 'plus'} size={13} color={activo ? C.accent : MUTED} />
      </View>
      <Text style={{ fontFamily: F.base, fontSize: 12.5, color: activo ? C.accent : FG }}>{giro}</Text>
    </PressableScale>
  );
}

function ChipsDelGrupo({ grupo, giros, onAlternar }: { grupo: Grupo; giros: string[]; onAlternar: (giro: string) => void }) {
  const lleno = giros.length >= MAX_GIROS;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
      {grupo.giros.map((giro, i) => {
        const activo = giros.includes(giro);
        return (
          <Fade key={giro} delay={(2 + Math.min(i, 12)) * STAGGER} desde={6}>
            <ChipGiro giro={giro} activo={activo} apagado={lleno && !activo} onPress={() => onAlternar(giro)} />
          </Fade>
        );
      })}
    </View>
  );
}

function FilaResultado({
  giro,
  grupo,
  busqueda,
  activo,
  primera,
  onPress,
}: {
  giro: string;
  grupo: Grupo;
  busqueda: string;
  activo: boolean;
  primera: boolean;
  onPress: () => void;
}) {
  const p = useEncendido(activo);
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: activo }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderTopWidth: primera ? 0 : StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(13,13,13,0.08)',
      }}>
      <IconoGrupo grupo={grupo} size={32} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <TextoResaltado texto={giro} busqueda={busqueda} style={{ fontFamily: F.semi, fontSize: 13.5, color: FG }} />
        <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>
          {grupo.nombre}
        </Text>
      </View>
      <View style={{ width: 24, height: 24 }}>
        <View style={[StyleSheet.absoluteFill, { borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(13,13,13,0.18)' }]} />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 12,
              backgroundColor: C.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: p,
              transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
            },
          ]}>
          <Icon name="check" size={13} color="#fff" />
        </Animated.View>
      </View>
    </PressableScale>
  );
}

function Resultados({
  busqueda,
  valor,
  onAlternar,
}: {
  busqueda: string;
  valor: Etiquetado;
  onAlternar: (grupo: Grupo, giro: string) => void;
}) {
  const resultados = buscarGiros(busqueda);

  if (resultados.length === 0) {
    return (
      <Fade key={busqueda} desde={8} style={{ alignItems: 'center', paddingVertical: 26, paddingHorizontal: 12 }}>
        <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG, textAlign: 'center' }}>No encontramos «{busqueda.trim()}»</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 4, textAlign: 'center', lineHeight: 17 }}>
          Prueba con otra palabra o borra la búsqueda para elegir por grupo.
        </Text>
      </Fade>
    );
  }

  const visibles = resultados.slice(0, MAX_RESULTADOS);
  const resto = resultados.length - visibles.length;

  return (
    <View>
      <Text style={{ fontFamily: F.semi, fontSize: 12, color: MUTED, marginBottom: 8, paddingHorizontal: 4 }}>
        {resultados.length} {resultados.length === 1 ? 'giro encontrado' : 'giros encontrados'} · toca para agregar
      </Text>
      <View style={{ borderRadius: R.lg, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {visibles.map((r, i) => (
          // Sin la búsqueda en la llave: al teclear, las filas que siguen
          // coincidiendo se quedan quietas y solo entran las nuevas.
          <Fade key={`${r.grupo.slug}-${r.giro}`} delay={Math.min(i, 6) * STAGGER} desde={8}>
            <FilaResultado
              giro={r.giro}
              grupo={r.grupo}
              busqueda={busqueda}
              activo={r.grupo.slug === valor.grupo && valor.giros.includes(r.giro)}
              primera={i === 0}
              onPress={() => onAlternar(r.grupo, r.giro)}
            />
          </Fade>
        ))}
      </View>
      {resto > 0 && (
        <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 8, textAlign: 'center' }}>
          Y {resto} más: escribe un poco más para afinar.
        </Text>
      )}
    </View>
  );
}

// ── Selector ───────────────────────────────────────────────────────────────────

function Subtitulo({ texto, accion, onAccion }: { texto: string; accion?: string; onAccion?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 2 }}>
      <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>{texto}</Text>
      {accion && onAccion && (
        <PressableScale onPress={onAccion} hitSlop={8} accessibilityRole="button">
          <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.primary }}>{accion}</Text>
        </PressableScale>
      )}
    </View>
  );
}

export const SelectorGiros = memo(function SelectorGiros({
  valor,
  onCambio,
  error,
}: {
  valor: Etiquetado;
  onCambio: (v: Etiquetado) => void;
  /** Error de validación del formulario; se pinta junto al contador. */
  error?: string;
}) {
  const [busqueda, setBusqueda] = useState('');
  const [cambiando, setCambiando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const grupo = grupoPorSlug(valor.grupo ?? undefined);
  const buscando = busqueda.trim().length > 0;
  const eligiendoGrupo = !grupo || cambiando;

  const elegirGrupo = (g: Grupo) => {
    setCambiando(false);
    setAviso(null);
    // Volver a tocar el mismo grupo conserva sus giros.
    if (g.slug !== valor.grupo) onCambio({ grupo: g.slug, giros: [] });
  };

  const alternar = (g: Grupo, giro: string) => {
    setCambiando(false);
    if (g.slug !== valor.grupo) {
      // Un giro de otro grupo se lleva el grupo principal con él; las
      // etiquetas del grupo anterior salen con su animación.
      setAviso(null);
      onCambio({ grupo: g.slug, giros: [giro] });
      return;
    }
    if (valor.giros.includes(giro)) {
      setAviso(null);
      onCambio({ ...valor, giros: valor.giros.filter((x) => x !== giro) });
      return;
    }
    if (valor.giros.length >= MAX_GIROS) {
      setAviso(`Máximo ${MAX_GIROS}: quita uno`);
      return;
    }
    setAviso(null);
    onCambio({ ...valor, giros: [...valor.giros, giro] });
  };

  // A la derecha de «Tus giros»: el error o el aviso reemplazan al contador
  // en el mismo renglón, así mostrarlos no empuja nada.
  const nota = error ?? aviso;

  return (
    <View>
      <Buscador valor={busqueda} onCambio={setBusqueda} placeholder="Busca tu giro: tacos, plomero, dentista…" />

      <View style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8, paddingHorizontal: 2 }}>
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>Tus giros</Text>
          {nota ? (
            <Fade key={nota} style={{ flexShrink: 1 }}>
              <Text numberOfLines={1} style={{ fontFamily: F.base, fontSize: 11.5, color: C.accent }}>
                {nota}
              </Text>
            </Fade>
          ) : (
            <Text style={{ fontFamily: F.base, fontSize: 11.5, color: MUTED }}>
              {valor.giros.length} de {MAX_GIROS}
            </Text>
          )}
        </View>
        <EtiquetasElegidas
          grupo={grupo}
          giros={valor.giros}
          marcarError={!!error}
          onQuitar={(giro) => grupo && alternar(grupo, giro)}
        />
      </View>

      <View style={{ marginTop: 18 }}>
        {buscando ? (
          <Resultados busqueda={busqueda} valor={valor} onAlternar={alternar} />
        ) : eligiendoGrupo ? (
          <View key="rejilla">
            <Fade desde={6}>
              <Subtitulo
                texto={grupo ? 'Elige otro grupo' : 'O escoge el grupo principal'}
                accion={grupo ? 'Cancelar' : undefined}
                onAccion={() => setCambiando(false)}
              />
            </Fade>
            <RejillaGrupos actual={valor.grupo} onElegir={elegirGrupo} />
          </View>
        ) : (
          grupo && (
            <View key={grupo.slug}>
              <Fade desde={10}>
                <GrupoElegido grupo={grupo} onCambiar={() => setCambiando(true)} />
              </Fade>
              <Fade delay={STAGGER} desde={6} style={{ marginTop: 16 }}>
                <Subtitulo texto={`Giros de ${grupo.nombre.toLowerCase()}`} />
              </Fade>
              <ChipsDelGrupo grupo={grupo} giros={valor.giros} onAlternar={(giro) => alternar(grupo, giro)} />
            </View>
          )
        )}
      </View>
    </View>
  );
});
