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

// Negocio tal como lo ve el catálogo. Sin sesión, `oferta` llega vacía y
// `promoOculta` dice si hay una promoción esperando a que se registre.
export interface NegocioCatalogo extends Business {
  promoOculta?: boolean;
}

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
