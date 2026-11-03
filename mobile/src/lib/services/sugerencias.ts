import { supabase } from '../supabase';
import type { EstadoSugerencia, MiSugerencia, NegocioSugerido, NuevaSugerencia, PrecargaRegistro } from '../types';
import { baseApp } from './referrals';

// Códigos que levanta sugerir_negocio con un mensaje ya escrito para el usuario.
const ERRORES_PROPIOS = new Set(['42501', '22023', '23505', '54000']);

// El usuario en sesión recomienda un negocio. La función pone al autor,
// normaliza el teléfono y frena repetidos. `recomendaciones` es cuántas
// personas lo han recomendado ya, contando esta.
export async function sugerirNegocio(
  s: NuevaSugerencia,
): Promise<{ ok: boolean; recomendaciones: number; error: string | null }> {
  const { data, error } = await supabase.rpc('sugerir_negocio', {
    p_nombre: s.nombre,
    p_direccion: s.direccion,
    p_contacto: s.contacto,
    p_grupo: s.grupo,
    p_giro: s.giro,
  });
  if (!error) return { ok: true, recomendaciones: Number((data as { recomendaciones: number }).recomendaciones), error: null };
  return {
    ok: false,
    recomendaciones: 0,
    error: ERRORES_PROPIOS.has(error.code) ? error.message : 'No pudimos enviarla. Revisa tu conexión e intenta otra vez.',
  };
}

// Los negocios que recomendé, el más reciente primero, con su estado y en qué
// lugar llegué entre quienes lo recomendaron.
export async function getMisSugerencias(): Promise<MiSugerencia[]> {
  const { data, error } = await supabase.rpc('mis_sugerencias');
  if (error) throw new Error(`Error al cargar tus recomendaciones: ${error.message}`);
  return (data ?? []) as MiSugerencia[];
}

type Fila = {
  id: string;
  clave: string;
  nombre: string;
  direccion: string;
  contacto: string | null;
  grupo: string;
  giro: string;
  estado: EstadoSugerencia;
  created_at: string;
  resuelta_en: string | null;
  usuario: { nombre: string } | null;
};

// Negocios sugeridos (admin): las filas de la misma clave se juntan en uno,
// con quiénes lo recomendaron. Lo más recomendado primero.
export async function getSugerenciasAdmin(): Promise<NegocioSugerido[]> {
  const { data, error } = await supabase
    .from('sugerencias_negocio')
    .select('id, clave, nombre, direccion, contacto, grupo, giro, estado, created_at, resuelta_en, usuario:profiles!sugerencias_negocio_usuario_id_fkey(nombre)')
    .order('created_at')
    .limit(1000);
  if (error) throw new Error(`Error al cargar sugerencias: ${error.message}`);

  const porClave = new Map<string, NegocioSugerido>();
  for (const f of (data ?? []) as unknown as Fila[]) {
    const quien = f.usuario?.nombre || 'Usuario';
    const n = porClave.get(f.clave);
    if (!n) {
      porClave.set(f.clave, {
        clave: f.clave,
        id: f.id,
        nombre: f.nombre,
        direccion: f.direccion,
        contacto: f.contacto,
        grupo: f.grupo,
        giro: f.giro,
        estado: f.estado,
        resuelta_en: f.resuelta_en,
        primera: f.created_at,
        ultima: f.created_at,
        recomendadores: [quien],
      });
      continue;
    }
    n.ultima = f.created_at;
    n.contacto = n.contacto ?? f.contacto;
    n.recomendadores.push(quien);
  }
  return [...porClave.values()].sort(
    (a, b) => b.recomendadores.length - a.recomendadores.length || b.ultima.localeCompare(a.ultima),
  );
}

// Link de invitación que el admin le manda al negocio: abre el registro con
// lo que los usuarios ya contaron. Cualquier fila del negocio sirve.
export function linkRegistroNegocio(sugerenciaId: string): string {
  return `${baseApp()}/registro-negocio?s=${sugerenciaId}`;
}

// Sin sesión (el dueño aún no tiene cuenta). Null si el id no existe, el
// negocio se descartó o falla la red: el registro se abre vacío y ya.
export async function getPrecargaRegistro(sugerenciaId: string): Promise<PrecargaRegistro | null> {
  const { data, error } = await supabase.rpc('sugerencia_para_registro', { p_id: sugerenciaId });
  if (error || !data) return null;
  return data as PrecargaRegistro;
}

// El admin mueve el negocio (todas sus recomendaciones): contactada, sumada,
// descartada o de vuelta a nueva.
export async function resolverSugerencia(id: string, estado: EstadoSugerencia): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase.rpc('admin_resolver_sugerencia', { p_sugerencia_id: id, p_estado: estado });
  return { ok: !error, error: error?.message ?? null };
}
