import { useState } from 'react';
import { Easing, cancelAnimation, useSharedValue, withDecay, withTiming, type SharedValue } from 'react-native-reanimated';

import { DUR } from '../motion';

export const ESCALA_MAX = 3.5;

// Lo que tapan la barra de arriba y la hoja: el mapa puede subir y bajar lo
// suficiente para que nada quede escondido debajo de ellas.
const TAPADO_ARRIBA = 150;
const TAPADO_ABAJO = 400;
const HOLGURA = 40;

const ENTRADA = { duration: DUR.slow, easing: Easing.out(Easing.cubic) };

function limitarEje(t: number, escalado: number, vista: number, inicio: number): number {
  'worklet';
  if (escalado <= vista) {
    const centrado = inicio + (vista - escalado) / 2;
    return Math.min(centrado + HOLGURA, Math.max(centrado - HOLGURA, t));
  }
  return Math.min(inicio + HOLGURA, Math.max(inicio + vista - escalado - HOLGURA, t));
}

export interface Camara {
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  s: SharedValue<number>;
  /** Avisar el tamaño del contenedor. */
  medir: (ancho: number, alto: number) => void;
  /** Centra (x, y) del lienzo en la franja visible entre `arriba` y `abajo`. */
  volarA: (x: number, y: number, escala: number, arriba: number, abajo: number, animar?: boolean) => void;
  /** Acerca o aleja manteniendo fijo el punto de pantalla (fx, fy). */
  acercar: (factor: number, fx: number, fy: number, animar: boolean) => void;
  /** Sube o baja el mapa sin tocar el acercamiento: para seguir a la hoja. */
  desplazar: (dy: number, animar: boolean) => void;
  /** Worklets para los gestos. */
  alzar: () => void;
  mover: (dx: number, dy: number) => void;
  soltar: (vx: number, vy: number) => void;
  pellizcar: (factor: number, fx: number, fy: number) => void;
  acercarEnWorklet: (factor: number, fx: number, fy: number) => void;
}

/** La cámara del mapa: pantalla = (tx, ty) + s · lienzo. Solo mueve transform. */
export function useCamara(anchoMapa: number, altoMapa: number): Camara {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const s = useSharedValue(0.6);
  const ancho = useSharedValue(390);
  const alto = useSharedValue(800);

  const escalaMin = () => {
    'worklet';
    return Math.min(ESCALA_MAX, ancho.get() / anchoMapa);
  };
  const limX = (t: number, escala: number) => {
    'worklet';
    return limitarEje(t, anchoMapa * escala, ancho.get(), 0);
  };
  const limY = (t: number, escala: number) => {
    'worklet';
    return limitarEje(t, altoMapa * escala, Math.max(120, alto.get() - TAPADO_ARRIBA - TAPADO_ABAJO), TAPADO_ARRIBA);
  };
  const aplicarZoom = (factor: number, fx: number, fy: number) => {
    'worklet';
    const antes = s.get();
    const despues = Math.min(ESCALA_MAX, Math.max(escalaMin(), antes * factor));
    const k = despues / antes;
    s.set(despues);
    tx.set(limX(fx - k * (fx - tx.get()), despues));
    ty.set(limY(fy - k * (fy - ty.get()), despues));
  };

  // Un solo objeto por montaje: los gestos lo capturan y no debe cambiar.
  const [camara] = useState<Camara>(() => ({
    tx,
    ty,
    s,
    medir: (a, h) => {
      ancho.set(a);
      alto.set(h);
    },
    volarA: (x, y, escala, arriba, abajo, animar = true) => {
      const destinoS = Math.min(ESCALA_MAX, Math.max(escalaMin(), escala));
      const destinoX = ancho.get() / 2 - x * destinoS;
      const destinoY = arriba + (abajo - arriba) / 2 - y * destinoS;
      cancelAnimation(tx);
      cancelAnimation(ty);
      cancelAnimation(s);
      if (!animar) {
        tx.set(destinoX);
        ty.set(destinoY);
        s.set(destinoS);
        return;
      }
      tx.set(withTiming(destinoX, ENTRADA));
      ty.set(withTiming(destinoY, ENTRADA));
      s.set(withTiming(destinoS, ENTRADA));
    },
    acercar: (factor, fx, fy, animar) => {
      if (!animar) {
        aplicarZoom(factor, fx, fy);
        return;
      }
      const antes = s.get();
      const despues = Math.min(ESCALA_MAX, Math.max(escalaMin(), antes * factor));
      const k = despues / antes;
      tx.set(withTiming(limX(fx - k * (fx - tx.get()), despues), ENTRADA));
      ty.set(withTiming(limY(fy - k * (fy - ty.get()), despues), ENTRADA));
      s.set(withTiming(despues, ENTRADA));
    },
    desplazar: (dy, animar) => {
      const destino = limY(ty.get() + dy, s.get());
      cancelAnimation(ty);
      ty.set(animar ? withTiming(destino, ENTRADA) : destino);
    },
    alzar: () => {
      'worklet';
      cancelAnimation(tx);
      cancelAnimation(ty);
    },
    mover: (dx, dy) => {
      'worklet';
      const escala = s.get();
      tx.set(limX(tx.get() + dx, escala));
      ty.set(limY(ty.get() + dy, escala));
    },
    soltar: (vx, vy) => {
      'worklet';
      const escala = s.get();
      const rangoX: [number, number] = [limX(-1e6, escala), limX(1e6, escala)];
      const rangoY: [number, number] = [limY(-1e6, escala), limY(1e6, escala)];
      tx.set(withDecay({ velocity: vx, clamp: rangoX, deceleration: 0.994 }));
      ty.set(withDecay({ velocity: vy, clamp: rangoY, deceleration: 0.994 }));
    },
    pellizcar: (factor, fx, fy) => {
      'worklet';
      aplicarZoom(factor, fx, fy);
    },
    acercarEnWorklet: (factor, fx, fy) => {
      'worklet';
      const antes = s.get();
      const despues = Math.min(ESCALA_MAX, Math.max(escalaMin(), antes * factor));
      const k = despues / antes;
      tx.set(withTiming(limX(fx - k * (fx - tx.get()), despues), ENTRADA));
      ty.set(withTiming(limY(fy - k * (fy - ty.get()), despues), ENTRADA));
      s.set(withTiming(despues, ENTRADA));
    },
  }));

  return camara;
}
