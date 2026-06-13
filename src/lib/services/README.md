# Capa de servicios

Regla del proyecto: **los componentes nunca llaman a Supabase directamente.**
Todo acceso a datos pasa por funciones de esta carpeta.

- Las pantallas importan `getNegociosCercanos()`, no `supabase.from("businesses")`.
- Si algún día cambiamos de proveedor, solo se reescribe esta carpeta.
- Lógica de dinero (comisiones, pagos) va siempre en servicios server-side
  usando `createAdminClient` — nunca en el cliente.

Convención: un archivo por dominio (`businesses.ts`, `referrals.ts`, `auth.ts`, ...).
