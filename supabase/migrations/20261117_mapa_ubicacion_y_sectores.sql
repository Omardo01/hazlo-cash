-- =============================================================
-- Hazlo Cash — Mapa con negocios reales y sectores opcionales
--
-- 1) businesses.lat / lng — dónde está el negocio. Lo marcan el dueño (Editar
--    ficha), el admin (alta, edición o desde el mapa) y el registro público.
--    Los dos van juntos: o hay ubicación completa o no hay.
-- 2) sectores — agrupar colonias es opcional. Sin filas, el mapa muestra las
--    colonias tal cual. Las colonias se guardan por su id (el slug que genera
--    mobile/scripts/generar-mapa.ts). Sólo el admin los organiza, y siempre
--    todos de una vez con admin_guardar_sectores (así una colonia nunca queda
--    en dos sectores a medio guardar).
-- 3) admin_mapa_negocios() — negocios activos con su ubicación y cifras:
--    recomendadores distintos y ventas confirmadas en el mes (hora de México).
-- =============================================================

alter table public.businesses
  add column if not exists lat double precision,
  add column if not exists lng double precision;

alter table public.businesses drop constraint if exists businesses_ubicacion_valida;
alter table public.businesses
  add constraint businesses_ubicacion_valida check (
    (lat is null and lng is null)
    or (lat between 14 and 33 and lng between -119 and -86)  -- dentro de México
  );

-- -------------------------------------------------------------
-- Sectores
-- -------------------------------------------------------------
create table if not exists public.sectores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(btrim(nombre)) between 1 and 40),
  colonias text[] not null default '{}',
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.sectores enable row level security;

-- Los nombres de los sectores no son privados: cualquiera los puede leer.
drop policy if exists "sectores_select_todos" on public.sectores;
create policy "sectores_select_todos"
  on public.sectores for select
  using (true);

drop policy if exists "sectores_admin" on public.sectores;
create policy "sectores_admin"
  on public.sectores for all
  using (public.es_admin())
  with check (public.es_admin());

-- Reemplaza todos los sectores. Recibe [{ nombre, colonias: [id, …] }, …].
-- Una lista vacía los quita todos: el mapa vuelve a sólo colonias.
create or replace function public.admin_guardar_sectores(p_sectores jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total integer;
begin
  if not public.es_admin() then
    raise exception 'Sólo el administrador organiza los sectores' using errcode = '42501';
  end if;
  if p_sectores is null or jsonb_typeof(p_sectores) <> 'array' then
    raise exception 'Formato de sectores inválido' using errcode = '22023';
  end if;
  if jsonb_array_length(p_sectores) > 60 then
    raise exception 'Son demasiados sectores' using errcode = '22023';
  end if;
  if exists (
    select 1
      from jsonb_array_elements(p_sectores) s
     where jsonb_typeof(s -> 'colonias') <> 'array'
        or char_length(btrim(coalesce(s ->> 'nombre', ''))) not between 1 and 40
  ) then
    raise exception 'Cada sector necesita nombre y lista de colonias' using errcode = '22023';
  end if;
  if exists (
    select c
      from jsonb_array_elements(p_sectores) s,
           jsonb_array_elements_text(s -> 'colonias') c
     group by c
    having count(*) > 1
  ) then
    raise exception 'Una colonia sólo puede estar en un sector' using errcode = '23505';
  end if;

  delete from public.sectores where true;

  insert into public.sectores (nombre, colonias, orden)
  select btrim(t.s ->> 'nombre'),
         array(select jsonb_array_elements_text(t.s -> 'colonias')),
         (t.o - 1)::integer
    from jsonb_array_elements(p_sectores) with ordinality as t(s, o);

  get diagnostics v_total = row_count;
  return v_total;
end;
$$;

revoke all on function public.admin_guardar_sectores(jsonb) from public, anon;
grant execute on function public.admin_guardar_sectores(jsonb) to authenticated;

-- -------------------------------------------------------------
-- Negocios para el mapa (admin)
-- -------------------------------------------------------------
create or replace function public.admin_mapa_negocios()
returns json
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_mes timestamptz := date_trunc('month', now() at time zone 'America/Mexico_City') at time zone 'America/Mexico_City';
begin
  if not public.es_admin() then
    raise exception 'Sólo el administrador ve el mapa completo' using errcode = '42501';
  end if;

  return coalesce((
    select json_agg(json_build_object(
             'id', b.id,
             'nombre', b.nombre,
             'categoria', b.categoria,
             'giros', b.giros,
             'lat', b.lat,
             'lng', b.lng,
             'recomendadores', (
               select count(distinct rc.embajador_id)
                 from public.referral_codes rc
                where rc.negocio_id = b.id
             ),
             'ventas_mes', (
               select count(*)
                 from public.referrals r
                 join public.referral_codes rc on rc.id = r.codigo_id
                where rc.negocio_id = b.id
                  and r.estado = 'confirmado'
                  and r.confirmado_at >= v_mes
             )
           ) order by b.nombre)
      from public.businesses b
     where b.activo
  ), '[]'::json);
end;
$$;

revoke all on function public.admin_mapa_negocios() from public, anon;
grant execute on function public.admin_mapa_negocios() to authenticated;
