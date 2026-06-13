-- =============================================================
-- Seguridad: blindar la columna `roles` contra escalada de privilegios.
-- Antes, `perfil_update_propio` dejaba a cualquier usuario editar su propia
-- fila SIN restringir columnas → podía ponerse rol 'admin' él solo.
-- Postgres no filtra columnas en RLS, así que se hace con grants por columna:
-- el rol `authenticated` solo puede actualizar campos no sensibles.
-- Los `roles` solo cambian server-side (service role / Admin API).
-- =============================================================

revoke update on public.profiles from anon, authenticated;

grant update (nombre, telefono, avatar_url, updated_at)
  on public.profiles to authenticated;

-- Además, restringir los valores válidos de roles (evita roles inventados).
alter table public.profiles
  add constraint roles_validos
  check (roles <@ array['cliente', 'embajador', 'negocio', 'admin']::text[]);
