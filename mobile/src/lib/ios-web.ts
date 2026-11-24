import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Lo que Safari (y la app instalada) hace distinto en iPhone y iPad.
 *
 * El importante: al enfocar un campo con letra menor a 16 px, iOS acerca la
 * página sola y la deja corrida. Se evita por dos lados: cada campo sube a 16 y
 * la página avisa que no se acerque al enfocar. El pellizco del usuario sigue
 * funcionando: iOS lo permite siempre.
 */
export const ES_IOS_WEB =
  Platform.OS === 'web' &&
  typeof navigator !== 'undefined' &&
  // El iPad se presenta como Mac; lo delata la pantalla táctil.
  (/iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1));

const LETRA_MINIMA = 16;

function agrandar(campo: Element) {
  if (!(campo instanceof HTMLInputElement || campo instanceof HTMLTextAreaElement)) return;
  // Los montos ya van más grandes: esos no se tocan.
  if (parseFloat(getComputedStyle(campo).fontSize) < LETRA_MINIMA) campo.style.setProperty('font-size', `${LETRA_MINIMA}px`, 'important');
}

function agrandarEn(nodo: Node) {
  if (!(nodo instanceof Element)) return;
  if (nodo.matches('input, textarea')) agrandar(nodo);
  nodo.querySelectorAll('input, textarea').forEach(agrandar);
}

let listo = false;

/** Se llama una vez, al arrancar la app. */
export function prepararIOS() {
  if (!ES_IOS_WEB || listo || typeof document === 'undefined') return;
  listo = true;
  // `navigator.standalone` solo existe en Safari: true si se abrió desde el inicio.
  const instalada = ('standalone' in navigator && navigator.standalone === true) || window.matchMedia('(display-mode: standalone)').matches;
  if (instalada) document.documentElement.classList.add('ios-instalada');
  const vista = document.querySelector('meta[name="viewport"]');
  if (vista) vista.setAttribute('content', `${vista.getAttribute('content') ?? ''}, maximum-scale=1`);
  agrandarEn(document.body);
  // Las pantallas aparecen y desaparecen: cada campo nuevo se revisa al entrar.
  new MutationObserver((cambios) => {
    for (const c of cambios) c.addedNodes.forEach(agrandarEn);
  }).observe(document.body, { childList: true, subtree: true });
}

/**
 * Con `activo`, la página no se queda corrida cuando iOS la recorre para
 * enseñar el campo: lo que se escribe ya está arriba.
 */
export function useSinRecorrer(activo: boolean) {
  useEffect(() => {
    if (!ES_IOS_WEB || !activo) return;
    const vista = window.visualViewport;
    const regresar = () => {
      if (window.scrollY !== 0 || (vista?.offsetTop ?? 0) > 0) window.scrollTo(0, 0);
    };
    regresar();
    vista?.addEventListener('resize', regresar);
    vista?.addEventListener('scroll', regresar);
    window.addEventListener('scroll', regresar);
    return () => {
      vista?.removeEventListener('resize', regresar);
      vista?.removeEventListener('scroll', regresar);
      window.removeEventListener('scroll', regresar);
      regresar();
    };
  }, [activo]);
}

/** Cuánto tapa el teclado en web: ahí no existen los eventos de Keyboard. */
export function useTecladoWeb(): number {
  const [alto, setAlto] = useState(0);
  useEffect(() => {
    const vista = Platform.OS === 'web' && typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vista) return;
    const medir = () => {
      const tapa = window.innerHeight - vista.height - vista.offsetTop;
      // Poco es la barra del navegador; con zoom, la cuenta no vale.
      setAlto(tapa > 120 && Math.abs(vista.scale - 1) < 0.02 ? Math.round(tapa) : 0);
    };
    medir();
    vista.addEventListener('resize', medir);
    vista.addEventListener('scroll', medir);
    return () => {
      vista.removeEventListener('resize', medir);
      vista.removeEventListener('scroll', medir);
    };
  }, []);
  return alto;
}
