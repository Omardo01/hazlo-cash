// Tipos de dominio del loop core.
// Cuando el esquema crezca, se generarán desde Supabase (supabase gen types).

export type Rol = "cliente" | "embajador" | "negocio" | "admin";

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
}

export interface ReferralCode {
  id: string;
  codigo: string;
  embajador_id: string;
  negocio_id: string;
  activo: boolean;
}

export type EstadoReferral = "pendiente" | "confirmado" | "rechazado";

export interface Referral {
  id: string;
  codigo_id: string;
  cliente_id: string | null;
  estado: EstadoReferral;
  created_at: string;
  confirmado_at: string | null;
}
