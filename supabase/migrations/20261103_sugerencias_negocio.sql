-- =============================================================
-- Hazlo Cash — Negocios que los usuarios recomiendan sumar
--
-- Descubre → "Recomienda un negocio": un usuario con sesión propone un
-- negocio que todavía no está en Hazlo Cash (paso 1 del flujo de
-- integración). La sugerencia le aparece al admin en la pestaña Sugeridos,
-- que la lleva de nueva → contactada → sumada (o la descarta).
--
-- Varias personas pueden recomendar el mismo negocio: cada una es una fila,
-- y `clave` (grupo + nombre sin acentos, espacios ni signos) las junta. El
-- estado vive por negocio: todas las filas de una clave se mueven juntas, y
-- cuántas filas tiene la clave es cuántas veces lo recomendaron (el paso 7
-- premia a los primeros 20).
--
-- Igual que las recargas, nadie escribe la tabla directo: las dos funciones
-- SECURITY DEFINER son la única vía. La de alta pone al autor con auth.uid()
-- (no se puede sugerir a nombre de otro) y frena el envío en ráfaga.
-- =============================================================

create table public.sugerencias_negocio (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 2 and 80),
  direccion text not null check (char_length(direccion) between 1 and 200),
  -- 10 dígitos sin lada de país; null si no lo dieron (es opcional).
  contacto text check (contacto ~ '^[0-9]{10}$'),
  -- Del catálogo de giros (mobile/src/hazlo/categorias/catalogo.ts).
  grupo text not null check (char_length(grupo) between 1 and 40),
  giro text not null check (char_length(giro) between 1 and 80),
  clave text generated always as (
    grupo || ':' || regexp_replace(translate(lower(nombre), 'áéíóúüñ', 'aeiouun'), '[^a-z0-9]+', '', 'g')
  ) stored,
  estado text not null default 'nueva'
    check (estado in ('nueva', 'contactada', 'sumada', 'descartada')),
  created_at timestamptz not null default now(),
  resuelta_en timestamptz,
  admin_id uuid references public.profiles (id) on delete set null,
  -- El negocio que se registró desde el link de invitación (paso 3). Es lo
  -- que liga a sus recomendadores con él para el incentivo del paso 7.
  negocio_id uuid references public.businesses (id) on delete set null
);

create index sugerencias_negocio_usuario on public.sugerencias_negocio (usuario_id, created_at desc);
create index sugerencias_negocio_estado on public.sugerencias_negocio (estado, created_at desc);
create index sugerencias_negocio_clave on public.sugerencias_negocio (clave, created_at);
-- Una persona cuenta una sola vez por negocio.
create unique index sugerencias_negocio_una_por_usuario on public.sugerencias_negocio (clave, usuario_id);

alter table public.sugerencias_negocio enable row level security;

create policy "sugerencia_select_propia"
  on public.sugerencias_negocio for select
  using (usuario_id = auth.uid());

create policy "sugerencia_select_admin"
  on public.sugerencias_negocio for select
  using (public.es_admin());

revoke insert, update, delete on public.sugerencias_negocio from anon, authenticated;

-- -------------------------------------------------------------
-- El usuario manda una sugerencia. Máximo 10 al día y una vez por negocio.
-- Si alguien más ya lo había recomendado, la nueva fila toma el estado del
-- negocio (si ya se contactó, no vuelve a "nueva"); si estaba descartado,
-- la nueva recomendación lo reabre completo.
-- Devuelve cuántas personas lo han recomendado, contando esta.
-- -------------------------------------------------------------
create or replace function public.sugerir_negocio(
  p_nombre text,
  p_direccion text,
  p_contacto text,
  p_grupo text,
  p_giro text
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nombre text := btrim(coalesce(p_nombre, ''));
  v_direccion text := btrim(coalesce(p_direccion, ''));
  -- Solo dígitos; el 52 de país se quita si viene con el número completo.
  v_contacto text := regexp_replace(regexp_replace(coalesce(p_contacto, ''), '\D', '', 'g'), '^52(?=[0-9]{10}$)', '');
  v_clave text;
  v_estado text;
  v_negocio uuid;
  v_total integer;
begin
  if auth.uid() is null then
    raise exception 'Inicia sesión para recomendar un negocio' using errcode = '42501';
  end if;
  if char_length(v_nombre) < 2 or char_length(v_nombre) > 80 then
    raise exception 'Revisa el nombre del negocio' using errcode = '22023';
  end if;
  if v_direccion = '' or char_length(v_direccion) > 200 then
    raise exception 'Revisa la dirección' using errcode = '22023';
  end if;
  if v_contacto <> '' and v_contacto !~ '^[0-9]{10}$' then
    raise exception 'El teléfono debe tener 10 dígitos' using errcode = '22023';
  end if;
  if coalesce(btrim(p_grupo), '') = '' or coalesce(btrim(p_giro), '') = '' then
    raise exception 'Elige un giro' using errcode = '22023';
  end if;

  if (
    select count(*) from public.sugerencias_negocio
    where usuario_id = auth.uid() and created_at > now() - interval '1 day'
  ) >= 10 then
    raise exception 'Ya mandaste muchas recomendaciones hoy. Intenta mañana.' using errcode = '54000';
  end if;

  v_clave := btrim(p_grupo) || ':' || regexp_replace(translate(lower(v_nombre), 'áéíóúüñ', 'aeiouun'), '[^a-z0-9]+', '', 'g');

  if exists (
    select 1 from public.sugerencias_negocio
    where clave = v_clave and usuario_id = auth.uid()
  ) then
    raise exception 'Ya nos recomendaste ese negocio. Lo estamos revisando.' using errcode = '23505';
  end if;

  -- Estado actual del negocio (todas sus filas comparten estado).
  select estado, negocio_id into v_estado, v_negocio
    from public.sugerencias_negocio
    where clave = v_clave
    order by created_at desc
    limit 1;

  if v_estado = 'descartada' then
    update public.sugerencias_negocio
      set estado = 'nueva', resuelta_en = null, admin_id = null
      where clave = v_clave;
    v_estado := 'nueva';
  end if;

  insert into public.sugerencias_negocio (usuario_id, nombre, direccion, contacto, grupo, giro, estado, negocio_id)
    values (auth.uid(), v_nombre, v_direccion, nullif(v_contacto, ''), btrim(p_grupo), btrim(p_giro), coalesce(v_estado, 'nueva'), v_negocio);

  select count(*) into v_total from public.sugerencias_negocio where clave = v_clave;

  return json_build_object('recomendaciones', v_total);
end;
$$;

-- -------------------------------------------------------------
-- El admin mueve un negocio sugerido de estado: se pasa el id de cualquiera
-- de sus filas y se mueven todas las de la misma clave. 'nueva' lo reabre.
-- -------------------------------------------------------------
create or replace function public.admin_resolver_sugerencia(p_sugerencia_id uuid, p_estado text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'Requiere rol admin' using errcode = '42501';
  end if;
  if p_estado not in ('nueva', 'contactada', 'sumada', 'descartada') then
    raise exception 'Estado no válido' using errcode = '22023';
  end if;

  update public.sugerencias_negocio
    set estado = p_estado,
        resuelta_en = case when p_estado = 'nueva' then null else now() end,
        admin_id = case when p_estado = 'nueva' then null else auth.uid() end
    where clave = (select clave from public.sugerencias_negocio where id = p_sugerencia_id);

  if not found then
    raise exception 'Sugerencia no encontrada' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.sugerir_negocio(text, text, text, text, text) from public, anon;
revoke execute on function public.admin_resolver_sugerencia(uuid, text) from public, anon;
grant execute on function public.sugerir_negocio(text, text, text, text, text) to authenticated;
grant execute on function public.admin_resolver_sugerencia(uuid, text) to authenticated;

-- -------------------------------------------------------------
-- Link de invitación (/registro-negocio?s=<id>): lo que los usuarios ya
-- contaron del negocio, para que el registro llegue lleno. Es pública (el
-- dueño todavía no tiene cuenta) pero solo responde con el id exacto de una
-- fila, y no dice quién lo recomendó. Null si no existe o se descartó.
-- -------------------------------------------------------------
create or replace function public.sugerencia_para_registro(p_id uuid)
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'nombre', (array_agg(s.nombre order by s.created_at))[1],
    'direccion', (array_agg(s.direccion order by s.created_at))[1],
    'contacto', (array_agg(s.contacto order by s.created_at) filter (where s.contacto is not null))[1],
    'grupo', (array_agg(s.grupo order by s.created_at))[1],
    'giro', (array_agg(s.giro order by s.created_at))[1],
    'recomendaciones', count(*),
    'ya_registrado', bool_or(s.negocio_id is not null)
  )
  from public.sugerencias_negocio s
  where s.clave = (select clave from public.sugerencias_negocio where id = p_id)
    and s.estado <> 'descartada'
  having count(*) > 0;
$$;

-- -------------------------------------------------------------
-- La Edge Function registro-negocio, al crear el negocio desde el link, lo
-- liga con todas las recomendaciones de esa clave y las marca sumadas.
-- Solo service role: nadie más puede reclamar recomendaciones ajenas.
-- -------------------------------------------------------------
create or replace function public.vincular_sugerencia_negocio(p_sugerencia_id uuid, p_negocio_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_filas integer;
begin
  update public.sugerencias_negocio
    set negocio_id = p_negocio_id,
        estado = 'sumada',
        resuelta_en = now()
    where clave = (select clave from public.sugerencias_negocio where id = p_sugerencia_id)
      and negocio_id is null
      and estado <> 'descartada';
  get diagnostics v_filas = row_count;
  return v_filas;
end;
$$;

revoke execute on function public.sugerencia_para_registro(uuid) from public;
grant execute on function public.sugerencia_para_registro(uuid) to anon, authenticated;
revoke execute on function public.vincular_sugerencia_negocio(uuid, uuid) from public, anon, authenticated;
grant execute on function public.vincular_sugerencia_negocio(uuid, uuid) to service_role;

-- -------------------------------------------------------------
-- Las recomendaciones del usuario en sesión, con el estado del negocio y
-- en qué lugar llegó él (el paso 7 premia a los primeros 20). Necesita
-- SECURITY DEFINER para contar las filas de otros sin poder leerlas.
-- -------------------------------------------------------------
create or replace function public.mis_sugerencias()
returns table (
  id uuid,
  nombre text,
  grupo text,
  giro text,
  estado text,
  created_at timestamptz,
  resuelta_en timestamptz,
  lugar integer,
  total integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select m.id, m.nombre, m.grupo, m.giro, m.estado, m.created_at, m.resuelta_en, m.lugar::integer, m.total::integer
  from (
    select s.*,
      row_number() over (partition by s.clave order by s.created_at) as lugar,
      count(*) over (partition by s.clave) as total
    from public.sugerencias_negocio s
    where s.clave in (select clave from public.sugerencias_negocio where usuario_id = auth.uid())
  ) m
  where m.usuario_id = auth.uid()
  order by m.created_at desc;
$$;

revoke execute on function public.mis_sugerencias() from public, anon;
grant execute on function public.mis_sugerencias() to authenticated;
