// Tipos de dominio del loop core (espejo de la app web src/lib/services/types.ts).
// Cuando el esquema crezca, se generarán desde Supabase (supabase gen types).

export type Rol = 'cliente' | 'embajador' | 'negocio' | 'admin';

export interface Profile {
  id: string;
  nombre: string;
  telefono: string | null;
  avatar_url: string | null;
  roles: Rol[];
}

export interface Business {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string | null;
  direccion: string | null;
  oferta: string | null;
  activo: boolean;
  giros?: string[]; // giros del catálogo (vacío en negocios dados de alta antes)
}

// Negocio tal como lo ve el catálogo. Sin sesión, `oferta` llega vacía.
export type NegocioCatalogo = Business;

// Cómo el negocio paga al recomendador: monto fijo en pesos por venta,
// o un porcentaje del monto de la venta.
export type ComisionTipo = 'fijo' | 'porcentaje';

// Vista admin/dueño del negocio: incluye el saldo de créditos y la
// configuración de comisión (datos que no se exponen en el catálogo público).
export interface BusinessAdmin extends Business {
  owner_id: string | null; // cuenta dueña (rol negocio) que opera el negocio
  creditos: number;
  comision_tipo: ComisionTipo;
  comision_valor: number;
  giros: string[]; // giros del catálogo que eligió al registrarse
  por_aprobar: boolean; // se registró solo y el admin aún no lo activa
}

// El negocio pide créditos y transfiere; el admin acepta al ver llegar el dinero.
export interface SolicitudRecarga {
  id: string;
  negocio_id: string;
  monto: number;
  referencia: string; // va en el concepto de la transferencia
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  created_at: string;
  resuelta_en: string | null;
}

export interface SolicitudRecargaAdmin extends SolicitudRecarga {
  negocio: string; // nombre del negocio
}

// Negocio que un usuario recomienda sumar a Hazlo Cash (Descubre → "Recomienda un negocio").
export type EstadoSugerencia = 'nueva' | 'contactada' | 'sumada' | 'descartada';

export interface NuevaSugerencia {
  nombre: string;
  direccion: string;
  contacto: string; // opcional: '' si no lo dieron
  grupo: string; // slug del grupo del catálogo
  giro: string;
}

// Una recomendación del usuario en sesión, con el estado del negocio.
export interface MiSugerencia {
  id: string;
  nombre: string;
  grupo: string;
  giro: string;
  estado: EstadoSugerencia;
  created_at: string;
  resuelta_en: string | null;
  lugar: number; // 1 = fue el primero en recomendarlo
  total: number; // cuántas personas lo han recomendado
}

// Lo que el link de invitación (/registro-negocio?s=…) precarga en el registro.
export interface PrecargaRegistro {
  nombre: string;
  direccion: string;
  contacto: string | null;
  grupo: string;
  giro: string;
  recomendaciones: number;
  ya_registrado: boolean;
}

// Un negocio sugerido con todas las personas que lo recomendaron (admin).
export interface NegocioSugerido {
  clave: string; // grupo + nombre normalizado: junta las recomendaciones
  id: string; // de cualquiera de sus filas; basta para moverlo de estado
  nombre: string; // como lo escribió la primera persona
  direccion: string;
  contacto: string | null; // el primer teléfono que alguien dio (10 dígitos)
  grupo: string;
  giro: string;
  estado: EstadoSugerencia;
  resuelta_en: string | null;
  primera: string; // primera recomendación
  ultima: string; // la más reciente
  recomendadores: string[]; // nombres, en orden de llegada
}

export interface ReferralCode {
  id: string;
  codigo: string;
  embajador_id: string;
  negocio_id: string;
  activo: boolean;
}

export type EstadoReferral = 'pendiente' | 'confirmado' | 'rechazado';

// Valores de estado como constantes tipadas. Comparar contra strings sueltos
// ya costó un bug (se escribía 'confirmada' y el filtro devolvía siempre 0).
export const PENDIENTE: EstadoReferral = 'pendiente';
export const CONFIRMADO: EstadoReferral = 'confirmado';
export const RECHAZADO: EstadoReferral = 'rechazado';

export interface Referral {
  id: string;
  codigo_id: string;
  cliente_id: string | null;
  estado: EstadoReferral;
  created_at: string;
  confirmado_at: string | null;
}
