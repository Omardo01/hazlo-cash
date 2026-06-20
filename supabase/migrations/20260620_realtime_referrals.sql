-- =============================================================
-- Realtime en referrals: el cliente ve el estatus de su orden EN VIVO
-- (pendiente → confirmado) sin refrescar. RLS sigue aplicando, así que
-- cada cliente solo recibe eventos de sus propias órdenes.
-- =============================================================

-- replica identity full: el payload de los UPDATE incluye la fila completa,
-- necesario para que los filtros y RLS de Realtime funcionen de forma fiable.
alter table public.referrals replica identity full;

-- Agrega la tabla a la publicación de Realtime (idempotente).
do $$
begin
  alter publication supabase_realtime add table public.referrals;
exception when others then
  raise notice 'referrals ya estaba en la publicación supabase_realtime: %', sqlerrm;
end $$;
