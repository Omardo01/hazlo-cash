-- =============================================================
-- Admin: alta y gestión de negocios desde el panel (web y móvil).
-- Hasta ahora businesses solo permitía CRUD al dueño (negocio_all_dueno).
-- Esto habilita a los usuarios con rol 'admin' a gestionar cualquier negocio.
-- =============================================================

-- Helper: ¿el usuario en sesión tiene rol admin?
-- security definer para leer profiles sin disparar recursión de RLS dentro
-- de la política (la policy de businesses no puede depender de la de profiles).
create or replace function public.es_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and 'admin' = any (roles)
  );
$$;

-- Control total de negocios para admins (alta incluida, con owner_id null).
create policy "negocio_all_admin"
  on public.businesses for all
  using (public.es_admin())
  with check (public.es_admin());
