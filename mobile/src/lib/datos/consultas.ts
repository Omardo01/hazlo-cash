import { getMiPerfil } from '../services/auth';
import {
  getEmbajadoresNegocio,
  getMiNegocio,
  getNegociosActivos,
  getNegociosAdmin,
  getResumenNegocio,
} from '../services/businesses';
import { getCodigosAdmin, getMetricasAdmin, getOrdenesAdmin, getUsuariosAdmin } from '../services/admin';
import { getMiCodigo, getMisVisitasCliente, getStatsEmbajador, getVisitasNegocio } from '../services/referrals';
import { getMisComisiones, getMiSaldo } from '../services/wallet';
import { getRetiros, totalRetirado } from '../simulacion/retiros';
import { useConsulta } from './useConsulta';

/**
 * Catálogo de datos de la app: una clave por consulta.
 *
 * Todo lo que se lea desde una pantalla pasa por aquí. Tener las claves en un
 * solo sitio es lo que permite que Realtime sepa qué parchar cuando llega un
 * evento, y que una acción (confirmar una venta) invalide exactamente lo que
 * quedó viejo.
 */
export const K = {
  perfil: 'perfil',
  visitasCliente: 'visitas-cliente',
  saldo: 'saldo',
  comisiones: 'comisiones',
  statsEmbajador: 'stats-embajador',
  miCodigo: 'mi-codigo',
  retiros: 'retiros',
  totalRetirado: 'total-retirado',
  negocios: 'negocios',
  miNegocio: 'mi-negocio',
  visitasNegocio: 'visitas-negocio',
  resumenNegocio: 'resumen-negocio',
  embajadoresNegocio: 'embajadores-negocio',
  adminMetricas: 'admin-metricas',
  adminOrdenes: 'admin-ordenes',
  adminNegocios: 'admin-negocios',
  adminUsuarios: 'admin-usuarios',
  adminCodigos: 'admin-codigos',
} as const;

/**
 * Cuánto aguanta cada dato antes de revalidarse.
 * Lo que cambia por acción de otro (visitas, saldo) se revalida seguido; el
 * catálogo y el perfil aguantan minutos porque casi nunca cambian.
 */
const LENTO = { staleMs: 5 * 60_000 };

// ── Cliente / embajador ───────────────────────────────────────────────────────
export const usePerfil = () => useConsulta(K.perfil, getMiPerfil, LENTO);
export const useVisitasCliente = () => useConsulta(K.visitasCliente, getMisVisitasCliente);
export const useSaldo = () => useConsulta(K.saldo, getMiSaldo);
export const useComisiones = () => useConsulta(K.comisiones, getMisComisiones);
export const useStatsEmbajador = () => useConsulta(K.statsEmbajador, getStatsEmbajador);
export const useMiCodigo = () => useConsulta(K.miCodigo, getMiCodigo, LENTO);
export const useRetiros = () => useConsulta(K.retiros, getRetiros);
export const useTotalRetirado = () => useConsulta(K.totalRetirado, totalRetirado);
export const useNegocios = () => useConsulta(K.negocios, getNegociosActivos, LENTO);

// ── Negocio ───────────────────────────────────────────────────────────────────
export const useMiNegocio = () => useConsulta(K.miNegocio, getMiNegocio, LENTO);
export const useVisitasNegocio = () => useConsulta(K.visitasNegocio, getVisitasNegocio);
export const useResumenNegocio = () => useConsulta(K.resumenNegocio, getResumenNegocio);
export const useEmbajadoresNegocio = () => useConsulta(K.embajadoresNegocio, getEmbajadoresNegocio, LENTO);

// ── Admin ─────────────────────────────────────────────────────────────────────
export const useAdminMetricas = () => useConsulta(K.adminMetricas, getMetricasAdmin);
export const useAdminOrdenes = () => useConsulta(K.adminOrdenes, getOrdenesAdmin);
export const useAdminNegocios = () => useConsulta(K.adminNegocios, getNegociosAdmin, LENTO);
export const useAdminUsuarios = () => useConsulta(K.adminUsuarios, getUsuariosAdmin, LENTO);
export const useAdminCodigos = () => useConsulta(K.adminCodigos, getCodigosAdmin, LENTO);
