-- =============================================================
-- Generación del código de referido del embajador.
-- Cierra la primera mitad del loop: el embajador "se vuelve embajador"
-- de un negocio y obtiene su código HAZLO-XXXX para compartir.
-- Idempotente: si ya tiene código para ese negocio, lo devuelve.
-- =============================================================

create or replace function public.generar_codigo_referido(p_negocio_id uuid)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_codigo text;
  v_existe text;
  v_nombre text;
  v_oferta text;
  v_activo boolean;
  v_intentos int := 0;
begin
  if v_uid is null then
    raise exception 'No autenticado' using errcode = '42501';
  end if;

  select nombre, oferta, activo into v_nombre, v_oferta, v_activo
    from public.businesses where id = p_negocio_id;
  if not found then
    raise exception 'Negocio no encontrado' using errcode = 'P0002';
  end if;
  if not v_activo then
    raise exception 'Ese negocio no está disponible.' using errcode = '22023';
  end if;

  -- Idempotente: si ya tiene un código para este negocio, lo devolvemos.
  select codigo into v_existe
    from public.referral_codes
    where embajador_id = v_uid and negocio_id = p_negocio_id
    limit 1;
  if v_existe is not null then
    return json_build_object('codigo', v_existe, 'negocio', v_nombre, 'oferta', v_oferta, 'nuevo', false);
  end if;

  -- Generar HAZLO-XXXX (4 chars [A-Z0-9]) reintentando ante colisión global.
  loop
    v_intentos := v_intentos + 1;
    v_codigo := 'HAZLO-' || (
      select string_agg(substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 1 + floor(random() * 36)::int, 1), '')
      from generate_series(1, 4)
    );
    begin
      insert into public.referral_codes (codigo, embajador_id, negocio_id)
        values (v_codigo, v_uid, p_negocio_id);
      exit; -- insertado con éxito
    exception
      when unique_violation then
        -- ¿Colisión por (embajador, negocio)? Otro proceso lo creó: devolvemos ese.
        select codigo into v_existe
          from public.referral_codes
          where embajador_id = v_uid and negocio_id = p_negocio_id
          limit 1;
        if v_existe is not null then
          return json_build_object('codigo', v_existe, 'negocio', v_nombre, 'oferta', v_oferta, 'nuevo', false);
        end if;
        -- Si no, fue colisión del código global: reintenta con otro.
        if v_intentos >= 12 then
          raise exception 'No se pudo generar el código, intenta de nuevo.';
        end if;
    end;
  end loop;

  return json_build_object('codigo', v_codigo, 'negocio', v_nombre, 'oferta', v_oferta, 'nuevo', true);
end;
$$;

grant execute on function public.generar_codigo_referido(uuid) to authenticated;
