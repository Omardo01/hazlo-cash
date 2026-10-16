import { useEffect, useState } from 'react';

import { C, F } from '../theme';
import { CSS_TELEFONO, PANTALLA_NORMAL, TelefonoWeb, medidaExterior } from './TelefonoWeb';

/**
 * Laboratorio web: la app real, varias veces, lado a lado.
 *
 * Cada teléfono es un iframe de esta misma app con `?sesion=<slot>`, que le da
 * su propia llave de sesión en localStorage (ver lib/supabase.ts). Así una
 * persona puede tener abiertos cliente, embajador, negocio y admin a la vez y
 * ver el loop en vivo: lo que hace uno le llega por Realtime a los demás.
 *
 * Como cada iframe mide lo mismo que un teléfono, las hojas y modales de la app
 * se quedan dentro de su pantalla igual que en Android.
 */

interface Telefono {
  slot: string;
  titulo: string;
  pista: string;
  color: string;
}

const TELEFONOS: Telefono[] = [
  { slot: 'cliente', titulo: 'Cliente', pista: 'cliente.demo@hazlocash.app', color: '#00A896' },
  { slot: 'embajador', titulo: 'Embajador', pista: 'embajador.demo@hazlocash.app', color: C.primary },
  { slot: 'negocio', titulo: 'Negocio', pista: 'negocio.demo@hazlocash.app', color: '#2D2B8F' },
  { slot: 'admin', titulo: 'Admin', pista: 'admin.demo@hazlocash.app', color: '#0D0D0D' },
];

const ESCALAS = [0.6, 0.75, 0.9, 1];

const LLAVE_PREFS = 'hazlo-lab-prefs';

interface Prefs {
  escala: number;
  ocultos: string[];
}

function leerPrefs(): Prefs {
  try {
    const crudo = window.localStorage.getItem(LLAVE_PREFS);
    if (crudo) {
      const p = JSON.parse(crudo) as Partial<Prefs>;
      return {
        escala: typeof p.escala === 'number' && ESCALAS.includes(p.escala) ? p.escala : 0.75,
        ocultos: Array.isArray(p.ocultos) ? p.ocultos.filter((x): x is string => typeof x === 'string') : [],
      };
    }
  } catch {
    // Sin localStorage (modo privado): se usan los valores por defecto.
  }
  return { escala: 0.75, ocultos: [] };
}

function guardarPrefs(p: Prefs) {
  try {
    window.localStorage.setItem(LLAVE_PREFS, JSON.stringify(p));
  } catch {
    // Igual que arriba: no persistir no rompe nada.
  }
}

const CSS = `
.lab-raiz { min-height: 100vh; background: #E9E6E1; color: #0D0D0D; font-family: ${F.reg}, system-ui, sans-serif; }
.lab-barra { position: sticky; top: 0; z-index: 2; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px; padding: 14px 24px; background: rgba(245,243,240,0.86); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(0,0,0,0.06); }
.lab-titulo { font-family: ${F.bold}; font-size: 18px; letter-spacing: -0.3px; margin: 0; }
.lab-sub { font-size: 12px; color: rgba(13,13,13,0.55); margin: 2px 0 0; max-width: 460px; }
.lab-grupo { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.lab-etq { font-family: ${F.semi}; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.6px; color: rgba(13,13,13,0.5); margin-right: 2px; }
.lab-chip { font-family: ${F.semi}; font-size: 12px; height: 30px; padding: 0 12px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.1); background: #fff; color: #0D0D0D; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: transform 130ms cubic-bezier(.33,1,.68,1), background 130ms, color 130ms; }
.lab-chip:active { transform: scale(0.96); }
.lab-chip[aria-pressed="true"] { background: #0D0D0D; color: #fff; border-color: #0D0D0D; }
.lab-chip:focus-visible { outline: 2px solid ${C.primary}; outline-offset: 2px; }
.lab-punto { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
.lab-scroll { overflow-x: auto; }
.lab-fila { display: flex; gap: 28px; padding: 28px 24px 40px; align-items: flex-start; width: max-content; margin: 0 auto; }
.lab-col { display: flex; flex-direction: column; gap: 10px; animation: lab-entra 260ms cubic-bezier(.33,1,.68,1) both; }
.lab-cab { display: flex; align-items: center; gap: 8px; }
.lab-cab-texto { flex: 1; min-width: 0; }
.lab-cab-titulo { font-family: ${F.semi}; font-size: 14px; margin: 0; display: flex; align-items: center; gap: 7px; }
.lab-cab-pista { font-size: 11px; color: rgba(13,13,13,0.5); margin: 1px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; user-select: all; }
.lab-icono { width: 30px; height: 30px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.1); background: #fff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; color: #0D0D0D; text-decoration: none; font-size: 14px; transition: transform 130ms cubic-bezier(.33,1,.68,1); }
.lab-icono:active { transform: scale(0.92); }
.lab-icono:focus-visible { outline: 2px solid ${C.primary}; outline-offset: 2px; }
.lab-vacio { padding: 80px 24px; text-align: center; color: rgba(13,13,13,0.55); font-size: 13px; }
${CSS_TELEFONO}
@keyframes lab-entra { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .lab-col { animation: none; }
  .lab-chip, .lab-icono { transition: none; }
}
`;

function Fila({ t, escala, version, indice }: { t: Telefono; escala: number; version: number; indice: number }) {
  const [recarga, setRecarga] = useState(0);
  const src = `/?sesion=${t.slot}`;
  const exterior = medidaExterior(PANTALLA_NORMAL);

  return (
    <section className="lab-col" style={{ width: exterior.w * escala, animationDelay: `${indice * 45}ms` }} aria-label={`Teléfono ${t.titulo}`}>
      <div className="lab-cab">
        <div className="lab-cab-texto">
          <p className="lab-cab-titulo">
            <span className="lab-punto" style={{ background: t.color }} />
            {t.titulo}
          </p>
          <p className="lab-cab-pista" title="Cuenta demo sugerida">{t.pista}</p>
        </div>
        <button type="button" className="lab-icono" title="Recargar este teléfono" aria-label={`Recargar ${t.titulo}`} onClick={() => setRecarga((k) => k + 1)}>
          ↻
        </button>
        <a className="lab-icono" href={src} target="_blank" rel="noreferrer" title="Abrir en otra pestaña" aria-label={`Abrir ${t.titulo} en otra pestaña`}>
          ↗
        </a>
      </div>
      <TelefonoWeb pantalla={PANTALLA_NORMAL} escala={escala} src={src} titulo={`Hazlo Cash · ${t.titulo}`} recarga={`${version}-${recarga}`} />
    </section>
  );
}

export function Laboratorio() {
  const [prefs, setPrefs] = useState<Prefs>({ escala: 0.75, ocultos: [] });
  const [version, setVersion] = useState(0);

  // Se leen tras montar para que el primer render no dependa de localStorage.
  useEffect(() => {
    setPrefs(leerPrefs());
  }, []);

  const actualizar = (p: Prefs) => {
    setPrefs(p);
    guardarPrefs(p);
  };

  const alternar = (slot: string) => {
    const ocultos = prefs.ocultos.includes(slot) ? prefs.ocultos.filter((s) => s !== slot) : [...prefs.ocultos, slot];
    actualizar({ ...prefs, ocultos });
  };

  const visibles = TELEFONOS.filter((t) => !prefs.ocultos.includes(t.slot));

  return (
    <div className="lab-raiz">
      <style>{CSS}</style>

      <header className="lab-barra">
        <div style={{ flex: '1 1 260px' }}>
          <h1 className="lab-titulo">Laboratorio Hazlo Cash</h1>
          <p className="lab-sub">
            Cada teléfono guarda su propia sesión: entra una vez con la cuenta de cada rol y se queda. Lo que hagas en uno le llega en vivo a los demás.
          </p>
        </div>

        <div className="lab-grupo" role="group" aria-label="Teléfonos visibles">
          <span className="lab-etq">Ver</span>
          {TELEFONOS.map((t) => {
            const on = !prefs.ocultos.includes(t.slot);
            return (
              <button key={t.slot} type="button" className="lab-chip" aria-pressed={on} onClick={() => alternar(t.slot)}>
                <span className="lab-punto" style={{ background: on ? t.color : 'rgba(13,13,13,0.25)', boxShadow: on ? '0 0 0 1.5px #fff' : 'none' }} />
                {t.titulo}
              </button>
            );
          })}
        </div>

        <div className="lab-grupo" role="group" aria-label="Tamaño">
          <span className="lab-etq">Tamaño</span>
          {ESCALAS.map((e) => (
            <button key={e} type="button" className="lab-chip" aria-pressed={prefs.escala === e} onClick={() => actualizar({ ...prefs, escala: e })}>
              {Math.round(e * 100)}%
            </button>
          ))}
        </div>

        <button type="button" className="lab-chip" onClick={() => setVersion((v) => v + 1)}>
          ↻ Recargar todos
        </button>

        <a className="lab-chip" href="/sugerencias" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          Sugerencias de UI ↗
        </a>

        <a className="lab-chip" href="/ia" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          Ideas de ML ↗
        </a>

        <a className="lab-chip" href="/requerimientos" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          Requisitos de tiendas ↗
        </a>
      </header>

      {visibles.length === 0 ? (
        <p className="lab-vacio">Elige arriba qué teléfonos quieres ver.</p>
      ) : (
        <main className="lab-scroll">
          <div className="lab-fila">
            {visibles.map((t, i) => (
              <Fila key={t.slot} t={t} escala={prefs.escala} version={version} indice={i} />
            ))}
          </div>
        </main>
      )}
    </div>
  );
}
