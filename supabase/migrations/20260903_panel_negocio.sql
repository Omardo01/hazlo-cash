-- =============================================================
-- Hazlo Cash — Panel del negocio
--
-- El dueño de un negocio ya podía ver y resolver sus solicitudes, pero no
-- tenía forma de ver su operación: cuánto ha vendido, cuánta comisión pagó,
-- cuántos créditos le quedan, ni QUIÉN se lo está recomendando.
--
-- El nombre del embajador vive en `profiles`, que el negocio no puede leer
-- (RLS: sólo el propio perfil y el admin). En vez de abrir esa policy, estas
-- dos funciones SECURITY DEFINER devuelven exactamente lo que el negocio
-- necesita ver — nombre del embajador y agregados — sin exponer la tabla ni
-- los datos de contacto del cliente (anti-bypass).
-- =============================================================

-- Negocio del usuario en sesión. Si se pasa un id, valida que sea suyo.
create or replace function public.mi_negocio_id(p_negocio_id uuid default null)
returns uuid
language sql
security definer
stable
set search_path = ''
as $$
  select b.id
    from public.businesses b
   where b.owner_id = auth.uid()
     and (p_negocio_id is null or b.id = p_negocio_id)
   order by b.created_at
   limit 1;
$$;

-- -------------------------------------------------------------
-- Resumen de operación del negocio.
-- -------------------------------------------------------------
create or replace function public.negocio_resumen(p_negocio_id uuid default null)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_res json;
begin
  v_id := public.mi_negocio_id(p_negocio_id);
  if v_id is null then
    raise exception 'No tienes un negocio asignado' using errcode = 'P0002';
  end if;

  select json_build_object(
    'negocio_id', v_id,
    'creditos', (select creditos from public.businesses where id = v_id),
    'ordenes', count(*),
    'pendientes', count(*) filter (where r.estado = 'pendiente'),
    'confirmadas', count(*) filter (where r.estado = 'confirmado'),
    'rechazadas', count(*) filter (where r.estado = 'rechazado'),
    'comisiones_pagadas', coalesce(sum(r.comision) filter (where r.estado = 'confirmado'), 0),
    'ventas_registradas', coalesce(sum(r.monto_venta) filter (where r.estado = 'confirmado'), 0),
    'embajadores', (select count(*) from public.referral_codes where negocio_id = v_id and activo),
    'clientes', count(distinct r.cliente_id)
  )
    into v_res
    from public.referrals r
    join public.referral_codes rc on rc.id = r.codigo_id
   where rc.negocio_id = v_id;

  return v_res;
end;
$$;

-- -------------------------------------------------------------
-- Quién recomienda a este negocio, ordenado por ventas confirmadas.
-- Devuelve el nombre del embajador (dato que el negocio no puede leer por
-- RLS) pero NADA del cliente: el anti-bypass sigue en pie.
-- -------------------------------------------------------------
create or replace function public.negocio_embajadores(p_negocio_id uuid default null)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_res json;
begin
  v_id := public.mi_negocio_id(p_negocio_id);
  if v_id is null then
    raise exception 'No tienes un negocio asignado' using errcode = 'P0002';
  end if;

  select coalesce(json_agg(x order by x.confirmadas desc, x.nombre), '[]'::json)
    into v_res
    from (
      select rc.id                                            as codigo_id,
             rc.codigo,
             rc.activo,
             coalesce(nullif(trim(p.nombre), ''), 'Sin nombre') as nombre,
             count(r.id)                                       as recomendaciones,
             count(r.id) filter (where r.estado = 'confirmado') as confirmadas,
             count(r.id) filter (where r.estado = 'pendiente')  as pendientes,
             coalesce(sum(r.comision) filter (where r.estado = 'confirmado'), 0) as comision_pagada,
             max(r.created_at)                                 as ultima
        from public.referral_codes rc
        join public.profiles p on p.id = rc.embajador_id
        left join public.referrals r on r.codigo_id = rc.id
       where rc.negocio_id = v_id
       group by rc.id, rc.codigo, rc.activo, p.nombre
    ) x;

  return v_res;
end;
$$;

grant execute on function public.mi_negocio_id(uuid) to authenticated;
grant execute on function public.negocio_resumen(uuid) to authenticated;
grant execute on function public.negocio_embajadores(uuid) to authenticated;
