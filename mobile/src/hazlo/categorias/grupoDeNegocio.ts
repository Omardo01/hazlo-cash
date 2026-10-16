import { GRUPOS, grupoPorSlug, normalizar, type Grupo } from './catalogo';

/**
 * En qué grupo del catálogo cae un negocio según su `businesses.categoria`.
 *
 * Hoy los negocios guardan una de las 10 categorías viejas del alta (Comida,
 * Mecánica, Plomería…) o texto libre ("Café"); cuando el registro de negocio
 * guarde el grupo o un giro del Excel, se reconoce directo. Lo que no encaja
 * en nada va a "Servicios varios", que en el Excel ya es el cajón de sastre.
 */
const EQUIVALENCIAS: Record<string, string> = {
  comida: 'alimentos',
  restaurante: 'alimentos',
  cafe: 'alimentos',
  salud: 'salud',
  belleza: 'belleza',
  mecanica: 'automotriz',
  electricidad: 'oficios',
  plomeria: 'oficios',
  educacion: 'ensenanza',
  servicios: 'servicios',
};

const RESPALDO = 'servicios';

export function grupoDeCategoria(categoria: string | null | undefined): Grupo {
  const c = normalizar((categoria ?? '').trim());
  return (
    GRUPOS.find((g) => g.slug === c || normalizar(g.nombre) === c) ??
    GRUPOS.find((g) => g.giros.some((giro) => normalizar(giro) === c)) ??
    grupoPorSlug(EQUIVALENCIAS[c]) ??
    (grupoPorSlug(RESPALDO) as Grupo)
  );
}

// Categorías viejas que sí apuntan a un giro concreto del catálogo.
const GIRO_EQUIVALENTE: Record<string, string> = {
  cafe: 'Cafetería',
};

/**
 * Giros específicos de un negocio. Cuando el registro de negocio guarde sus
 * giros (se propuso `businesses.giros text[]`), se usan esos; mientras, salen
 * de `categoria` si es un giro del catálogo o una categoría vieja con
 * equivalente claro ("Café" → Cafetería). "Comida" no dice qué giro es: ese
 * negocio cuenta en su grupo pero en ningún giro.
 */
export function girosDeNegocio(n: { categoria: string | null; giros?: string[] | null }): string[] {
  if (n.giros?.length) return n.giros;
  const c = normalizar((n.categoria ?? '').trim());
  for (const g of GRUPOS) {
    const giro = g.giros.find((x) => normalizar(x) === c);
    if (giro) return [giro];
  }
  return GIRO_EQUIVALENTE[c] ? [GIRO_EQUIVALENTE[c]] : [];
}
