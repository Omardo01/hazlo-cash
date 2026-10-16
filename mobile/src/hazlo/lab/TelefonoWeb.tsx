import { C, F } from '../theme';

/**
 * Un teléfono dibujado con DOM y la app real adentro como iframe. Solo web:
 * lo usan el laboratorio (/lab, cuatro a la vez) y el marco de escritorio de /
 * (uno, con tamaño de pantalla a elegir). Como el iframe mide lo mismo que la
 * pantalla, la app ve el ancho de un teléfono y sus hojas se quedan adentro.
 */

export interface Pantalla {
  ancho: number;
  alto: number;
  // En web la app no recibe el inset superior del sistema: se dibuja una barra
  // de estado falsa y el iframe empieza debajo, como con SafeAreaView.
  estado: number;
  radio: number;
  recorte: 'isla' | 'punto' | null;
}

// Pantalla lógica de un teléfono "normal" (iPhone 14 / Pixel 7 rondan esto).
export const PANTALLA_NORMAL: Pantalla = { ancho: 390, alto: 844, estado: 44, radio: 44, recorte: 'isla' };

const BISEL = 10;

export function medidaExterior(p: Pantalla) {
  return { w: p.ancho + BISEL * 2, h: p.alto + BISEL * 2 };
}

export const CSS_TELEFONO = `
.tel-marco { position: relative; box-sizing: content-box; background: #0D0D0D; padding: ${BISEL}px; box-shadow: 0 30px 60px -20px rgba(13,13,13,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset; transform-origin: top left; }
.tel-vidrio { overflow: hidden; background: #F5F3F0; display: flex; flex-direction: column; }
.tel-estado { flex: none; display: flex; align-items: center; justify-content: space-between; padding: 4px 30px 0; font-family: ${F.semi}; font-size: 14px; color: #0D0D0D; }
.tel-bateria { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; }
.tel-bateria i { width: 22px; height: 11px; border-radius: 3px; border: 1.5px solid #0D0D0D; position: relative; box-sizing: border-box; }
.tel-bateria i::after { content: ''; position: absolute; inset: 1.5px; right: 4px; border-radius: 1px; background: #0D0D0D; }
.tel-pantalla { flex: 1; border: 0; display: block; background: #F5F3F0; }
.tel-isla { position: absolute; top: ${BISEL + 9}px; left: 50%; width: 110px; height: 30px; margin-left: -55px; border-radius: 999px; background: #0D0D0D; pointer-events: none; }
.tel-punto { position: absolute; top: ${BISEL + 12}px; left: 50%; width: 14px; height: 14px; margin-left: -7px; border-radius: 999px; background: #0D0D0D; pointer-events: none; }
.tel-pantalla:focus-visible { outline: 2px solid ${C.primary}; }
`;

export function TelefonoWeb({ pantalla, escala, src, titulo, recarga }: {
  pantalla: Pantalla;
  escala: number;
  src: string;
  titulo: string;
  // Cambiarlo vuelve a montar el iframe (recargar el teléfono).
  recarga: string | number;
}) {
  const ext = medidaExterior(pantalla);
  return (
    // Contenedor del tamaño ya escalado: transform no cambia el espacio que ocupa.
    <div style={{ width: ext.w * escala, height: ext.h * escala }}>
      <div
        className="tel-marco"
        style={{ width: pantalla.ancho, height: pantalla.alto, borderRadius: pantalla.radio + BISEL, transform: `scale(${escala})` }}
      >
        <div className="tel-vidrio" style={{ width: pantalla.ancho, height: pantalla.alto, borderRadius: pantalla.radio }}>
          <div className="tel-estado" style={{ height: pantalla.estado }} aria-hidden>
            <span>9:41</span>
            <span className="tel-bateria">5G <i /></span>
          </div>
          <iframe key={recarga} className="tel-pantalla" style={{ width: pantalla.ancho }} src={src} title={titulo} allow="camera; clipboard-write; web-share" />
        </div>
        {pantalla.recorte === 'isla' && <div className="tel-isla" />}
        {pantalla.recorte === 'punto' && <div className="tel-punto" />}
      </div>
    </div>
  );
}
