/**
 * Caché de datos en memoria con revalidación en segundo plano
 * (stale-while-revalidate).
 *
 * El problema que resuelve: el shell de cada rol monta y desmonta la pantalla
 * al cambiar de pestaña, así que el estado local se pierde y cada regreso
 * volvía a consultar desde cero — de ahí el parpadeo de "cargando" y el gasto
 * de datos repetido.
 *
 * Reglas de la casa:
 *  - Lo cacheado se pinta AL INSTANTE; la revalidación ocurre callada detrás.
 *  - Solo se vuelve a consultar si la entrada está vieja (`STALE_MS`).
 *  - Dos pantallas que piden la misma clave a la vez comparten una sola
 *    petición (dedupe).
 *  - Realtime no vuelve a consultar: parcha la caché con `mutar()`.
 *
 * Vive en memoria a propósito: al cerrar la app se descarta. Datos de dinero
 * no se persisten en disco.
 */

/** Cuánto vale una entrada antes de revalidarla al volver a una pantalla. */
export const STALE_MS = 30_000;

type Entrada = {
  datos: unknown;
  /** Cuándo se resolvió (para decidir si está vieja). */
  ts: number;
  error: Error | null;
};

const entradas = new Map<string, Entrada>();
const enVuelo = new Map<string, Promise<unknown>>();
const suscriptores = new Map<string, Set<() => void>>();

function avisar(clave: string) {
  suscriptores.get(clave)?.forEach((cb) => cb());
}

/** Entrada cacheada, o undefined si nunca se ha pedido esta clave. */
export function leer(clave: string): Entrada | undefined {
  return entradas.get(clave);
}

export function estaVieja(clave: string, staleMs = STALE_MS): boolean {
  const e = entradas.get(clave);
  return !e || Date.now() - e.ts > staleMs;
}

/** Escribe un valor ya resuelto y despierta a quien lo esté mirando. */
export function escribir<T>(clave: string, datos: T) {
  entradas.set(clave, { datos, ts: Date.now(), error: null });
  avisar(clave);
}

/**
 * Parcha lo cacheado sin tocar la red. Es la vía de Realtime: llega el evento
 * con la fila cambiada y se aplica encima de la lista que ya tenemos.
 * Si la clave no está cacheada no hace nada — nadie la está mirando.
 */
export function mutar<T>(clave: string, fn: (prev: T) => T) {
  const e = entradas.get(clave);
  if (!e) return;
  entradas.set(clave, { datos: fn(e.datos as T), ts: e.ts, error: null });
  avisar(clave);
}

/**
 * Marca claves como viejas sin borrarlas: la pantalla sigue mostrando lo que
 * había (sin parpadeo) y se revalida en cuanto alguien la mire. Con `prefijo`
 * alcanza a familias enteras de claves.
 */
export function invalidar(clave: string, prefijo = false) {
  const alcanzadas = prefijo ? [...entradas.keys()].filter((k) => k.startsWith(clave)) : [clave];
  for (const k of alcanzadas) {
    const e = entradas.get(k);
    if (!e) continue;
    entradas.set(k, { ...e, ts: 0 });
    avisar(k);
  }
}

/** Borra todo. Al cerrar sesión, para que el siguiente usuario no vea datos del anterior. */
export function limpiarTodo() {
  const claves = [...entradas.keys()];
  entradas.clear();
  enVuelo.clear();
  claves.forEach(avisar);
}

/**
 * Consulta con dedupe: si ya hay una petición en vuelo para esta clave, se
 * engancha a ella en vez de abrir otra.
 */
export function consultar<T>(clave: string, fetcher: () => Promise<T>): Promise<T> {
  const yaVa = enVuelo.get(clave);
  if (yaVa) return yaVa as Promise<T>;

  const p = fetcher()
    .then((datos) => {
      entradas.set(clave, { datos, ts: Date.now(), error: null });
      return datos;
    })
    .catch((err: unknown) => {
      const error = err instanceof Error ? err : new Error(String(err));
      const previo = entradas.get(clave);
      // Un fallo no borra lo que ya se mostraba: se conserva el dato viejo y
      // se marca el error para que la pantalla decida si lo enseña.
      entradas.set(clave, { datos: previo?.datos, ts: Date.now(), error });
      throw error;
    })
    .finally(() => {
      enVuelo.delete(clave);
      avisar(clave);
    });

  enVuelo.set(clave, p);
  return p;
}

export function suscribir(clave: string, cb: () => void): () => void {
  let set = suscriptores.get(clave);
  if (!set) {
    set = new Set();
    suscriptores.set(clave, set);
  }
  set.add(cb);
  return () => {
    set.delete(cb);
    if (set.size === 0) suscriptores.delete(clave);
  };
}
