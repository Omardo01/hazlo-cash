import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { STALE_MS, consultar, estaVieja, invalidar, leer, suscribir } from './cache';

export interface Consulta<T> {
  /** Lo último que sabemos. `undefined` solo la primerísima vez. */
  datos: T | undefined;
  /** Primera carga de verdad (no hay nada que enseñar) → toca skeleton. */
  cargando: boolean;
  /** Hay datos en pantalla y se están refrescando callados detrás. */
  revalidando: boolean;
  error: Error | null;
  /** Vuelve a consultar aunque esté fresca. Para el pull-to-refresh. */
  refrescar: () => Promise<void>;
}

/**
 * Lee una clave de la caché y la mantiene fresca.
 *
 * Al volver a una pestaña ya visitada pinta lo cacheado de inmediato y solo
 * sale a la red si pasó `staleMs`. Cambiar de pestaña diez veces en medio
 * minuto cuesta una consulta, no diez.
 *
 * Pasa `clave: null` para no consultar todavía (p. ej. falta la sesión).
 */
export function useConsulta<T>(
  clave: string | null,
  fetcher: () => Promise<T>,
  opts: { staleMs?: number } = {},
): Consulta<T> {
  const staleMs = opts.staleMs ?? STALE_MS;

  // El fetcher suele recrearse en cada render; guardarlo en una ref evita que
  // eso dispare consultas nuevas.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [revalidando, setRevalidando] = useState(false);

  const entrada = useSyncExternalStore(
    useCallback((cb) => (clave ? suscribir(clave, cb) : () => {}), [clave]),
    useCallback(() => (clave ? leer(clave) : undefined), [clave]),
  );

  const pedir = useCallback(
    async (forzar: boolean) => {
      if (!clave) return;
      if (!forzar && !estaVieja(clave, staleMs)) return;
      setRevalidando(true);
      try {
        await consultar(clave, fetcherRef.current);
      } catch {
        // El error queda en la caché; la pantalla lo lee de `error`.
      } finally {
        setRevalidando(false);
      }
    },
    [clave, staleMs],
  );

  // `invalidar` deja ts=0, así que una clave invalidada se revalida en cuanto
  // alguien la mira — sin borrar lo que ya se está mostrando.
  const invalidada = entrada?.ts === 0;

  useEffect(() => {
    pedir(false);
  }, [pedir, invalidada]);

  const refrescar = useCallback(async () => {
    if (clave) invalidar(clave);
    await pedir(true);
  }, [clave, pedir]);

  return {
    datos: entrada?.datos as T | undefined,
    cargando: entrada === undefined || (entrada.datos === undefined && entrada.error === null),
    revalidando,
    error: entrada?.error ?? null,
    refrescar,
  };
}
