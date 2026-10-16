import { useEffect, useState } from 'react';

import { HazloMark } from '../HazloMark';
import { C, F } from '../theme';
import { CSS_TELEFONO, TelefonoWeb, medidaExterior, type Pantalla } from './TelefonoWeb';

/**
 * Lo que ve una pantalla de escritorio en /: la app dentro de un teléfono, para
 * que la web sirva siempre para probar la vista móvil. El teléfono de adentro
 * es un iframe de / con su sesión normal; esta página no abre sesión (ver
 * lib/marco-web.ts). Para varios roles a la vez está /lab.
 */

interface Modelo {
  id: string;
  nombre: string;
  detalle: string;
  pantalla: Pantalla;
}

const MODELOS: Modelo[] = [
  { id: 'chico', nombre: 'iPhone SE', detalle: 'Chico · 375×667', pantalla: { ancho: 375, alto: 667, estado: 24, radio: 22, recorte: null } },
  { id: 'normal', nombre: 'iPhone 15', detalle: 'Normal · 393×852', pantalla: { ancho: 393, alto: 852, estado: 48, radio: 48, recorte: 'isla' } },
  { id: 'android', nombre: 'Pixel 8', detalle: 'Android · 412×915', pantalla: { ancho: 412, alto: 915, estado: 40, radio: 36, recorte: 'punto' } },
  { id: 'grande', nombre: 'Pro Max', detalle: 'Grande · 430×932', pantalla: { ancho: 430, alto: 932, estado: 48, radio: 52, recorte: 'isla' } },
];

const HERRAMIENTAS = [
  { href: '/lab', texto: 'Laboratorio', pista: 'Los 4 roles a la vez, cada uno con su sesión' },
  { href: '/?marco=0', texto: 'Sin marco', pista: 'La app a todo lo ancho de la ventana' },
  { href: '/sugerencias', texto: 'Sugerencias', pista: 'Maquetas de UI por decidir' },
  { href: '/categorias', texto: 'Giros', pista: 'Catálogo de giros de negocio' },
  { href: '/ia', texto: 'Ideas de ML', pista: '18 propuestas de machine learning' },
  { href: '/requerimientos', texto: 'Tiendas', pista: 'Requisitos de Play Store y App Store' },
];

const MARGEN = 28;
const LLAVE_PREFS = 'hazlo-marco-modelo';

function leerModelo(): string {
  try {
    const id = window.localStorage.getItem(LLAVE_PREFS);
    if (id && MODELOS.some((m) => m.id === id)) return id;
  } catch {
    // Sin localStorage (modo privado): el teléfono normal.
  }
  return 'normal';
}

function guardarModelo(id: string) {
  try {
    window.localStorage.setItem(LLAVE_PREFS, id);
  } catch {
    // No persistir no rompe nada.
  }
}

const CSS = `
.esc-raiz { height: 100vh; box-sizing: border-box; padding: ${MARGEN}px; display: flex; align-items: center; justify-content: center; gap: 64px; background: #E9E6E1; color: #0D0D0D; font-family: ${F.reg}, system-ui, sans-serif; overflow: hidden; }
.esc-panel { width: 288px; max-height: 100%; overflow-y: auto; flex: none; display: flex; flex-direction: column; gap: 22px; animation: esc-entra 320ms cubic-bezier(.33,1,.68,1) both; }
.esc-telefono { flex: none; animation: esc-entra 420ms cubic-bezier(.33,1,.68,1) 70ms both; }
.esc-marca { display: flex; align-items: center; gap: 12px; }
.esc-titulo { font-family: ${F.bold}; font-size: 20px; letter-spacing: -0.4px; margin: 0; line-height: 1.1; }
.esc-etiqueta { font-family: ${F.semi}; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.6px; color: rgba(13,13,13,0.5); margin: 0 0 8px; }
.esc-sub { font-size: 13px; line-height: 1.6; color: rgba(13,13,13,0.6); margin: 0; }
.esc-modelos { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.esc-opcion { font: inherit; text-align: left; display: flex; flex-direction: column; align-items: flex-start; gap: 1px; padding: 9px 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.7); color: #0D0D0D; cursor: pointer; text-decoration: none; transition: transform 130ms cubic-bezier(.33,1,.68,1), background 160ms, color 160ms, border-color 160ms; }
.esc-opcion:hover { background: #fff; }
.esc-opcion:active { transform: scale(0.97); }
.esc-opcion:focus-visible { outline: 2px solid ${C.primary}; outline-offset: 2px; }
.esc-opcion[aria-pressed="true"] { background: #0D0D0D; border-color: #0D0D0D; color: #fff; }
.esc-opcion b { font-family: ${F.semi}; font-weight: normal; font-size: 13px; }
.esc-opcion span { font-size: 10.5px; opacity: 0.55; white-space: nowrap; }
.esc-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.esc-chip { font-family: ${F.semi}; font-size: 12px; height: 30px; padding: 0 12px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.1); background: rgba(255,255,255,0.7); color: #0D0D0D; text-decoration: none; display: inline-flex; align-items: center; transition: transform 130ms cubic-bezier(.33,1,.68,1), background 160ms; }
.esc-chip:hover { background: #fff; }
.esc-chip:active { transform: scale(0.95); }
.esc-chip:focus-visible { outline: 2px solid ${C.primary}; outline-offset: 2px; }
.esc-acciones { display: flex; gap: 8px; }
.esc-boton { font-family: ${F.semi}; font-size: 12px; height: 34px; padding: 0 14px; border-radius: 999px; border: 0; background: linear-gradient(135deg, ${C.primary}, ${C.accent}); color: #fff; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 8px 18px -8px ${C.accent}; transition: transform 130ms cubic-bezier(.33,1,.68,1); }
.esc-boton:active { transform: scale(0.95); }
.esc-boton:focus-visible { outline: 2px solid ${C.ink}; outline-offset: 2px; }
${CSS_TELEFONO}
@keyframes esc-entra { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@media (max-width: 860px) { .esc-panel { display: none; } }
@media (prefers-reduced-motion: reduce) {
  .esc-panel, .esc-telefono { animation: none; }
  .esc-opcion, .esc-boton, .esc-chip { transition: none; }
}
`;

// Escala que deja entrar el teléfono completo en el alto de la ventana.
function escalaPara(p: Pantalla, altoVentana: number) {
  return Math.min(1, (altoVentana - MARGEN * 2) / medidaExterior(p).h);
}

export function Escritorio() {
  const [modeloId, setModeloId] = useState('normal');
  const [alto, setAlto] = useState(() => window.innerHeight);
  const [recarga, setRecarga] = useState(0);

  // Se lee tras montar para que el primer render no dependa de localStorage.
  useEffect(() => {
    setModeloId(leerModelo());
    const alCambiar = () => setAlto(window.innerHeight);
    window.addEventListener('resize', alCambiar);
    return () => window.removeEventListener('resize', alCambiar);
  }, []);

  const modelo = MODELOS.find((m) => m.id === modeloId) ?? MODELOS[1];
  const escala = escalaPara(modelo.pantalla, alto);

  const elegir = (id: string) => {
    setModeloId(id);
    guardarModelo(id);
  };

  return (
    <div className="esc-raiz">
      <style>{CSS}</style>

      <aside className="esc-panel">
        <div className="esc-marca">
          <HazloMark size={30} />
          <div>
            <h1 className="esc-titulo">Hazlo Cash</h1>
            <p className="esc-sub" style={{ fontSize: 12 }}>Vista móvil</p>
          </div>
        </div>

        <p className="esc-sub">
          Es la app real, conectada a los datos de verdad, con el ancho de un teléfono. Desde un celular esta misma dirección la abre a pantalla completa.
        </p>

        <section>
          <p className="esc-etiqueta">Teléfono</p>
          <div className="esc-modelos" role="group" aria-label="Tamaño del teléfono">
            {MODELOS.map((m) => (
              <button key={m.id} type="button" className="esc-opcion" aria-pressed={m.id === modelo.id} onClick={() => elegir(m.id)}>
                <b>{m.nombre}</b>
                <span>{m.detalle}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="esc-acciones">
          <button type="button" className="esc-boton" onClick={() => setRecarga((k) => k + 1)}>
            ↻ Recargar app
          </button>
        </div>

        <section>
          <p className="esc-etiqueta">Herramientas</p>
          <div className="esc-chips">
            {HERRAMIENTAS.map((h) => (
              <a key={h.href} className="esc-chip" href={h.href} target="_blank" rel="noreferrer" title={h.pista}>
                {h.texto} ↗
              </a>
            ))}
          </div>
        </section>
      </aside>

      <div className="esc-telefono">
        <TelefonoWeb pantalla={modelo.pantalla} escala={escala} src="/" titulo="Hazlo Cash" recarga={`${modelo.id}-${recarga}`} />
      </div>
    </div>
  );
}
