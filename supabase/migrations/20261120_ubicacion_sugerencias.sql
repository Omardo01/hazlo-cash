-- =============================================================
-- Hazlo Cash — Pin en el mapa al invitar un negocio
--
-- Quien invita a un negocio (Inicio → «Invítalos») puede marcar en el mapa
-- dónde está. Es opcional, como el teléfono. El admin lo ve en Sugeridos y el
-- link de registro que le manda al negocio llega con el pin ya puesto.
-- =============================================================

alter table public.sugerencias_negocio
  add column if not exists lat double precision,
  add column if not exists lng double precision;

alter table public.sugerencias_negocio drop constraint if exists sugerencias_ubicacion_valida;
alter table public.sugerencias_negocio
  add constraint sugerencias_ubicacion_valida check (
    (lat is null and lng is null)
    or (lat between 14 and 33 and lng between -119 and -86)  -- dentro de México
  );

-- La versión de 5 argumentos se quita: con dos firmas, PostgREST no sabría
-- cuál llamar. La nueva acepta las mismas 5 (lat/lng por defecto null), así
-- que la app publicada antes de esto sigue funcionando.
drop function if exists public.sugerir_negocio(text, text, text, text, text);

create or replace function public.sugerir_negocio(
  p_nombre text,
  p_direccion text,
  p_contacto text,
  p_grupo text,
  p_giro text,
  p_lat double precision default null,
  p_lng double precision default null
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
  if (p_lat is null) <> (p_lng is null)
     or (p_lat is not null and not (p_lat between 14 and 33 and p_lng between -119 and -86)) then
    raise exception 'Revisa el pin en el mapa' using errcode = '22023';
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

  insert into public.sugerencias_negocio (usuario_id, nombre, direccion, contacto, grupo, giro, estado, negocio_id, lat, lng)
    values (auth.uid(), v_nombre, v_direccion, nullif(v_contacto, ''), btrim(p_grupo), btrim(p_giro), coalesce(v_estado, 'nueva'), v_negocio, p_lat, p_lng);

  select count(*) into v_total from public.sugerencias_negocio where clave = v_clave;

  return json_build_object('recomendaciones', v_total);
end;
$$;

revoke execute on function public.sugerir_negocio(text, text, text, text, text, double precision, double precision) from public, anon;
grant execute on function public.sugerir_negocio(text, text, text, text, text, double precision, double precision) to authenticated;

-- El link de registro llega también con el primer pin que alguien marcó.
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
    'lat', (array_agg(s.lat order by s.created_at) filter (where s.lat is not null))[1],
    'lng', (array_agg(s.lng order by s.created_at) filter (where s.lat is not null))[1],
    'recomendaciones', count(*),
    'ya_registrado', bool_or(s.negocio_id is not null)
  )
  from public.sugerencias_negocio s
  where s.clave = (select clave from public.sugerencias_negocio where id = p_id)
    and s.estado <> 'descartada'
  having count(*) > 0;
$$;

revoke execute on function public.sugerencia_para_registro(uuid) from public;
grant execute on function public.sugerencia_para_registro(uuid) to anon, authenticated;
