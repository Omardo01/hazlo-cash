-- =============================================================
-- Admin: leer todos los perfiles (para el panel de gestión de usuarios).
-- Hasta ahora profiles solo permitía leer el propio (perfil_select_propio).
-- es_admin() es security definer, así que no hay recursión de RLS.
-- =============================================================

create policy "perfil_select_admin"
  on public.profiles for select
  using (public.es_admin());
