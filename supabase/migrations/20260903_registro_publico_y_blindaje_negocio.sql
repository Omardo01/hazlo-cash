-- =============================================================
-- Hazlo Cash — Registro público de usuarios + blindaje del negocio
--
-- 1) handle_new_user() ahora lee nombre / teléfono / roles del metadata que
--    manda el signup, PERO sanea los roles: desde el cliente sólo se puede
--    nacer 'cliente' y/o 'embajador'. 'negocio' y 'admin' los asigna el admin
--    (Edge Function admin-asignar-rol), igual que antes.
--
-- 2) Blindaje de businesses. `negocio_all_dueno` es FOR ALL sin restricción de
--    columnas: hoy el dueño de un negocio puede hacer, por REST y con su
--    propia sesión, `update businesses set creditos = 999999`. Eso es dinero
--    que nadie recargó. Postgres no filtra columnas en RLS, así que se corta
--    con un trigger: un no-admin no puede tocar las columnas del dinero ni
--    las de control (creditos, comision_*, owner_id, activo).
-- =============================================================

-- -------------------------------------------------------------
-- 1) Registro público
-- -------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_roles text[];
begin
  -- Roles pedidos en el signup, acotados a los que un desconocido puede tener.
  select coalesce(
           array_agg(r) filter (where r in ('cliente', 'embajador')),
           '{}'::text[]
         )
    into v_roles
    from jsonb_array_elements_text(
           coalesce(new.raw_user_meta_data -> 'roles', '[]'::jsonb)
         ) as r;

  if v_roles is null or cardinality(v_roles) = 0 then
    v_roles := array['cliente'];
  end if;

  insert into public.profiles (id, nombre, telefono, roles)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''), ''),
    nullif(trim(new.raw_user_meta_data ->> 'telefono'), ''),
    v_roles
  );
  return new;
end;
$$;

-- -------------------------------------------------------------
-- 2) Blindaje de las columnas sensibles de businesses
-- -------------------------------------------------------------
create or replace function public.proteger_columnas_negocio()
returns trigger
language plpgsql
security invoker            -- INVOKER a propósito: ver la nota de abajo
set search_path = ''
as $$
begin
  -- Bypass del motor de dinero. Las funciones del proyecto que mueven saldos
  -- (confirmar_venta, admin_recargar_creditos, admin_ajustar_saldo) son
  -- SECURITY DEFINER, así que dentro de ellas `current_user` es el owner de la
  -- función, no `authenticated`. Este trigger es SECURITY INVOKER justamente
  -- para poder distinguir los dos casos: si no viene por REST con la sesión de
  -- un usuario, es el motor y pasa. Si el trigger fuera DEFINER, `current_user`
  -- sería siempre su propio owner y bloquearía confirmar_venta().
  if current_user <> 'authenticated' then
    return new;
  end if;

  -- El admin gestiona créditos, comisión, dueño y activación desde el panel.
  if public.es_admin() then
    return new;
  end if;

  if new.creditos is distinct from old.creditos then
    raise exception 'Los créditos sólo los recarga el administrador'
      using errcode = '42501';
  end if;
  if new.comision_tipo is distinct from old.comision_tipo
     or new.comision_valor is distinct from old.comision_valor then
    raise exception 'La comisión sólo la define el administrador'
      using errcode = '42501';
  end if;
  if new.owner_id is distinct from old.owner_id then
    raise exception 'El dueño del negocio sólo lo asigna el administrador'
      using errcode = '42501';
  end if;
  if new.activo is distinct from old.activo then
    raise exception 'La activación del negocio la controla el administrador'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_columnas_negocio on public.businesses;

create trigger proteger_columnas_negocio
  before update on public.businesses
  for each row execute function public.proteger_columnas_negocio();
