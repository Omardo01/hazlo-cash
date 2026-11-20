import { useEffect, useRef } from 'react';

/**
 * «Recomendar y ganar» en la ficha del mapa. /mapa es otra ruta, encima de la
 * app del recomendador: deja aquí el negocio, regresa, y la app abre Recomienda
 * con su QR. Si la app no estaba montada (se entró directo a /mapa), lo toma
 * al montarse.
 */
let pendiente: string | null = null;
const oyentes = new Set<() => void>();

export function pedirRecomendar(negocioId: string) {
  pendiente = negocioId;
  oyentes.forEach((o) => o());
}

function tomar(): string | null {
  const id = pendiente;
  pendiente = null;
  return id;
}

export function useRecomendarDesdeMapa(alPedir: (negocioId: string) => void) {
  const ref = useRef(alPedir);
  useEffect(() => {
    ref.current = alPedir;
  });
  useEffect(() => {
    const revisar = () => {
      const id = tomar();
      if (id) ref.current(id);
    };
    revisar();
    oyentes.add(revisar);
    return () => {
      oyentes.delete(revisar);
    };
  }, []);
}
