-- =============================================================
-- Hazlo Cash — Menú del negocio
--
-- Lo que vende cada negocio (platillos, servicios) con su precio opcional.
-- Se ve en la ficha del negocio al abrirlo en Descubre y en el mapa, para que
-- quien recomienda sepa qué está recomendando.
--
-- Lectura: cualquiera, si el negocio está activo (igual que el catálogo);
-- el dueño y el admin ven el suyo aunque esté por aprobar.
-- Escritura: solo con guardar_menu(), que reemplaza el menú completo de una
-- vez y valida que quien guarda sea el dueño o un admin.
-- Sin datos de contacto: el anti-bypass no se toca.
-- =============================================================

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.businesses (id) on delete cascade,
  nombre text not null check (char_length(btrim(nombre)) between 1 and 60),
  descripcion text check (descripcion is null or char_length(descripcion) <= 120),
  precio numeric(10, 2) check (precio is null or precio >= 0),
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists menu_items_negocio_idx on public.menu_items (negocio_id, orden);

alter table public.menu_items enable row level security;

drop policy if exists "menu_select" on public.menu_items;
create policy "menu_select"
  on public.menu_items for select
  using (
    exists (
      select 1 from public.businesses b
       where b.id = negocio_id
         and (b.activo or b.owner_id = auth.uid() or public.es_admin())
    )
  );

-- Reemplaza el menú del negocio. p_items: [{ nombre, descripcion?, precio? }, …]
create or replace function public.guardar_menu(p_negocio_id uuid, p_items jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total integer;
begin
  if not exists (
    select 1 from public.businesses b
     where b.id = p_negocio_id
       and (b.owner_id = auth.uid() or public.es_admin())
  ) then
    raise exception 'Solo el dueño o el administrador editan este menú' using errcode = '42501';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Formato de menú inválido' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) > 80 then
    raise exception 'El menú admite hasta 80 cosas' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_items) i
     where char_length(btrim(coalesce(i ->> 'nombre', ''))) not between 1 and 60
        or char_length(coalesce(i ->> 'descripcion', '')) > 120
        or (i ? 'precio' and jsonb_typeof(i -> 'precio') not in ('number', 'null'))
        or coalesce((i ->> 'precio')::numeric, 0) < 0
  ) then
    raise exception 'Revisa los nombres y precios del menú' using errcode = '22023';
  end if;

  delete from public.menu_items where negocio_id = p_negocio_id;

  insert into public.menu_items (negocio_id, nombre, descripcion, precio, orden)
  select p_negocio_id,
         btrim(t.i ->> 'nombre'),
         nullif(btrim(coalesce(t.i ->> 'descripcion', '')), ''),
         round((t.i ->> 'precio')::numeric, 2),
         (t.o - 1)::integer
    from jsonb_array_elements(p_items) with ordinality as t(i, o);

  get diagnostics v_total = row_count;
  return v_total;
end;
$$;

revoke all on function public.guardar_menu(uuid, jsonb) from public, anon;
grant execute on function public.guardar_menu(uuid, jsonb) to authenticated;
