import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../supabase';

/**
 * Retiros del recomendador — SIMULACIÓN DE UI.
 *
 * No hay dispersión bancaria real ni backend detrás: las cuentas y el historial
 * viven en AsyncStorage del teléfono, por usuario. Sirve para recorrer el flujo
 * completo en una demo y para tener la UI lista cuando se conecte el proveedor
 * de pagos (STP/Conekta/otro, aún por definir).
 *
 * Nota de seguridad: NUNCA se guarda la CLABE completa. Se valida en el momento
 * del alta y solo se persiste banco + últimos 4 dígitos + titular. Cuando exista
 * dispersión real, la CLABE debe viajar al servidor y guardarse allá cifrada,
 * jamás en el dispositivo.
 */

export interface CuentaBancaria {
  id: string;
  alias: string;
  titular: string;
  banco: string;
  ultimos4: string;
  predeterminada: boolean;
  creada: string;
}

export type EstadoRetiro = 'procesando' | 'enviado';

export interface Retiro {
  id: string;
  monto: number;
  cuentaId: string;
  /** Etiqueta congelada al momento del retiro: sobrevive a que borren la cuenta. */
  cuenta: string;
  creada: string;
}

// ── Catálogo de bancos por prefijo de CLABE (3 primeros dígitos) ──────────────
const BANCOS: Record<string, string> = {
  '002': 'Banamex',
  '012': 'BBVA',
  '014': 'Santander',
  '021': 'HSBC',
  '030': 'Banco del Bajío',
  '036': 'Inbursa',
  '042': 'Mifel',
  '044': 'Scotiabank',
  '058': 'Banregio',
  '059': 'Invex',
  '062': 'Afirme',
  '072': 'Banorte',
  '127': 'Banco Azteca',
  '137': 'BanCoppel',
  '143': 'CIBanco',
  '166': 'Banco del Bienestar',
  '646': 'STP',
  '710': 'NVIO',
  '723': 'Cuenca',
  '728': 'Spin by OXXO',
  '812': 'BBVA Dinero Móvil',
};

export function bancoPorClabe(clabe: string): string {
  return BANCOS[clabe.slice(0, 3)] ?? 'Banco';
}

/**
 * Valida una CLABE de 18 dígitos con su dígito verificador (módulo 10 con
 * pesos 3-7-1). Así el formulario rechaza números inventados igual que lo haría
 * el banco.
 */
export function validarClabe(clabe: string): { ok: boolean; error: string | null } {
  const limpia = clabe.replace(/\D/g, '');
  if (limpia.length !== 18) return { ok: false, error: 'La CLABE debe tener 18 dígitos.' };

  const pesos = [3, 7, 1];
  let suma = 0;
  for (let i = 0; i < 17; i++) suma += (Number(limpia[i]) * pesos[i % 3]) % 10;
  const verificador = (10 - (suma % 10)) % 10;

  if (verificador !== Number(limpia[17])) return { ok: false, error: 'Esa CLABE no es válida. Revisa los dígitos.' };
  return { ok: true, error: null };
}

// ── Almacenamiento local, separado por usuario ────────────────────────────────
async function claves(): Promise<{ cuentas: string; retiros: string } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { cuentas: `hazlo.sim.cuentas.${user.id}`, retiros: `hazlo.sim.retiros.${user.id}` };
}

async function leer<T>(clave: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(clave);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

async function escribir<T>(clave: string, valor: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin storage disponible la simulación sigue en memoria hasta cerrar la app.
  }
}

const nuevoId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// ── Cuentas ───────────────────────────────────────────────────────────────────
export async function getCuentas(): Promise<CuentaBancaria[]> {
  const k = await claves();
  if (!k) return [];
  const cuentas = await leer<CuentaBancaria>(k.cuentas);
  return cuentas.sort((a, b) => Number(b.predeterminada) - Number(a.predeterminada));
}

export async function agregarCuenta(datos: {
  alias: string;
  titular: string;
  clabe: string;
}): Promise<{ ok: boolean; error: string | null }> {
  const k = await claves();
  if (!k) return { ok: false, error: 'Inicia sesión para registrar una cuenta.' };

  const titular = datos.titular.trim();
  if (titular.length < 3) return { ok: false, error: 'Escribe el nombre del titular.' };

  const clabe = datos.clabe.replace(/\D/g, '');
  const v = validarClabe(clabe);
  if (!v.ok) return { ok: false, error: v.error };

  const cuentas = await leer<CuentaBancaria>(k.cuentas);
  const ultimos4 = clabe.slice(-4);
  const banco = bancoPorClabe(clabe);

  if (cuentas.some((c) => c.banco === banco && c.ultimos4 === ultimos4)) {
    return { ok: false, error: 'Ya tienes registrada esa cuenta.' };
  }

  cuentas.push({
    id: nuevoId(),
    alias: datos.alias.trim() || banco,
    titular,
    banco,
    ultimos4,
    // La primera cuenta que registras queda como destino por defecto.
    predeterminada: cuentas.length === 0,
    creada: new Date().toISOString(),
  });

  await escribir(k.cuentas, cuentas);
  return { ok: true, error: null };
}

export async function eliminarCuenta(id: string): Promise<void> {
  const k = await claves();
  if (!k) return;
  const cuentas = (await leer<CuentaBancaria>(k.cuentas)).filter((c) => c.id !== id);
  // Si se fue la predeterminada, la más antigua toma el relevo: nunca debe
  // quedar una lista con cuentas y ninguna marcada.
  if (cuentas.length > 0 && !cuentas.some((c) => c.predeterminada)) cuentas[0].predeterminada = true;
  await escribir(k.cuentas, cuentas);
}

export async function marcarPredeterminada(id: string): Promise<void> {
  const k = await claves();
  if (!k) return;
  const cuentas = (await leer<CuentaBancaria>(k.cuentas)).map((c) => ({ ...c, predeterminada: c.id === id }));
  await escribir(k.cuentas, cuentas);
}

export function etiquetaCuenta(c: CuentaBancaria): string {
  return `${c.banco} •• ${c.ultimos4}`;
}

// ── Retiros ───────────────────────────────────────────────────────────────────
export async function getRetiros(): Promise<Retiro[]> {
  const k = await claves();
  if (!k) return [];
  const retiros = await leer<Retiro>(k.retiros);
  return retiros.sort((a, b) => b.creada.localeCompare(a.creada));
}

export async function registrarRetiro(monto: number, cuenta: CuentaBancaria): Promise<Retiro> {
  const retiro: Retiro = {
    id: nuevoId(),
    monto,
    cuentaId: cuenta.id,
    cuenta: etiquetaCuenta(cuenta),
    creada: new Date().toISOString(),
  };
  const k = await claves();
  if (k) {
    const retiros = await leer<Retiro>(k.retiros);
    retiros.push(retiro);
    await escribir(k.retiros, retiros);
  }
  return retiro;
}

/**
 * El estado se deduce del tiempo transcurrido en lugar de guardarse: así el
 * historial "avanza" solo, sin tareas en segundo plano. Un retiro real tarda
 * 1–2 días hábiles; aquí son 45 segundos para que la demo se pueda ver.
 */
const MS_EN_CAMINO = 45_000;

export function estadoRetiro(r: Retiro): EstadoRetiro {
  return Date.now() - new Date(r.creada).getTime() < MS_EN_CAMINO ? 'procesando' : 'enviado';
}

/** Total retirado en la simulación: se descuenta del saldo que ve el usuario. */
export async function totalRetirado(): Promise<number> {
  const retiros = await getRetiros();
  return retiros.reduce((s, r) => s + r.monto, 0);
}
