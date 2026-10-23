import { useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';

/**
 * Botón "atrás" para la navegación interna (pestañas, hojas, niveles del
 * catálogo, landing → registro…), que vive en estado de React y no en rutas.
 *
 * - Android: mientras `activo`, el atrás del sistema llama `alVolver` en vez de
 *   cerrar la app.
 * - Web: mientras `activo`, hay una entrada propia en el historial del
 *   navegador. El atrás del navegador (o el gesto del celular) la consume y
 *   llama `alVolver`; si el nivel se cierra desde la UI, la entrada se quita.
 *   Sin esto, "atrás" salía de la app entera porque todo pasa en `/`.
 *
 * Los niveles se apilan en el orden en que se activan: el atrás siempre
 * cierra el último abierto.
 */
export function useAtras(activo: boolean, alVolver: () => void) {
  // La función más reciente, sin volver a registrar el nivel en cada render.
  const ref = useRef(alVolver);
  ref.current = alVolver;

  useEffect(() => {
    if (!activo) return;
    if (Platform.OS === 'web') return abrirNivelWeb(() => ref.current());
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      ref.current();
      return true;
    });
    return () => sub.remove();
  }, [activo]);
}

// --- Web -------------------------------------------------------------------

// `pos`: en qué entrada del historial quedó el nivel (1 = la primera encima
// de la página; 0 = aún sin entrada).
type Nivel = { id: number; pos: number; alVolver: () => void };

// Niveles abiertos, del más viejo al más nuevo. `profundidad` es la entrada
// nuestra en la que está parado el navegador (0 = la página misma).
const pila: Nivel[] = [];
let profundidad = 0;
let siguienteId = 1;
let escuchando = false;
let programado = false;
// Esperando el popstate de un retroceso que pidió `ajustar`, no el usuario.
let retrocediendo = false;

// La marca va junto al estado del router (su `id`): así expo-router reconoce
// la misma pantalla al volver y no la reinicia.
const CLAVE = 'hazloAtras';

function profundidadDe(estado: unknown): number {
  if (estado && typeof estado === 'object' && CLAVE in estado) {
    const n = (estado as Record<string, unknown>)[CLAVE];
    return typeof n === 'number' ? n : 0;
  }
  return 0;
}

function alCambiarHistorial(e: PopStateEvent) {
  profundidad = profundidadDe(e.state);
  if (retrocediendo) {
    retrocediendo = false;
    ajustar();
    return;
  }
  // Atrás del usuario: se cierran, del más nuevo al más viejo, los niveles
  // cuya entrada ya quedó adelante. (Adelante no reabre nada.)
  while (pila.length > 0 && pila[pila.length - 1].pos > profundidad) pila.pop()?.alVolver();
  programar();
}

// Junta los cambios de un mismo render: cerrar dos niveles y abrir otro a la
// vez (cambiar de pestaña desde una hoja) se resuelve en un solo ajuste.
function programar() {
  if (programado) return;
  programado = true;
  queueMicrotask(() => {
    programado = false;
    ajustar();
  });
}

// Deja el historial igual a la pila: quita las entradas de niveles cerrados
// desde la UI y agrega las de los recién abiertos.
function ajustar() {
  if (retrocediendo) return; // sigue cuando llegue el popstate
  // Si otra navegación (expo-router) puso su entrada encima, no se toca nada.
  if (profundidadDe(window.history.state) !== profundidad) return;

  let vigentes = 0;
  while (vigentes < pila.length && vigentes < profundidad && pila[vigentes].pos === vigentes + 1) vigentes++;
  const sobran = profundidad - vigentes;
  if (sobran > 0) {
    retrocediendo = true;
    window.history.go(-sobran);
    return;
  }
  const base = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
  for (let i = vigentes; i < pila.length; i++) {
    profundidad = i + 1;
    pila[i].pos = profundidad;
    window.history.pushState({ ...base, [CLAVE]: profundidad }, '');
  }
}

// expo-router reescribe el estado de la entrada actual (replaceState con solo
// su `id`) cada vez que cambia su navegación, incluido cada "atrás". Eso
// borraba nuestra marca y el historial dejaba de cuadrar con la pila. Si el
// router reemplaza la misma entrada, la marca se conserva.
function conservarMarca() {
  const original = window.history.replaceState.bind(window.history);
  window.history.replaceState = (estado: unknown, titulo: string, url?: string | URL | null) => {
    const actual: unknown = window.history.state;
    const marca = profundidadDe(actual);
    const mismaEntrada =
      !!estado && typeof estado === 'object' && !!actual && typeof actual === 'object' &&
      (estado as Record<string, unknown>).id === (actual as Record<string, unknown>).id;
    const nuevo = marca > 0 && mismaEntrada && !(CLAVE in (estado as object)) ? { ...(estado as object), [CLAVE]: marca } : estado;
    original(nuevo, titulo, url);
  };
}

function abrirNivelWeb(alVolver: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  if (!escuchando) {
    window.addEventListener('popstate', alCambiarHistorial);
    conservarMarca();
    escuchando = true;
    // Si la página se recargó parada en una entrada nuestra, se parte de cero.
    if (profundidadDe(window.history.state) > 0) {
      window.history.replaceState({ ...window.history.state, [CLAVE]: 0 }, '');
    }
  }

  const nivel: Nivel = { id: siguienteId++, pos: 0, alVolver };
  pila.push(nivel);
  programar();

  return () => {
    const i = pila.findIndex((n) => n.id === nivel.id);
    if (i === -1) return; // ya lo cerró el atrás del navegador
    pila.splice(i, 1);
    programar();
  };
}
