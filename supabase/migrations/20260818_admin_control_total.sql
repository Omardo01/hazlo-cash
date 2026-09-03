-- =============================================================
-- Hazlo Cash — Control total del admin sobre el loop
-- El admin ya podía gestionar negocios, créditos, roles y saldos, pero no
-- veía las órdenes (referrals) ni los códigos: sin esto el panel admin no
-- puede auditar el loop ni armar pruebas.
--
-- Regla que NO se relaja: confirmar una venta mueve dinero, así que sigue
-- pasando exclusivamente por confirmar_venta() (security definer). El UPDATE
-- directo del admin queda acotado a 'pendiente' / 'rechazado'.
-- =============================================================

-- -------------------------------------------------------------
-- REFERRALS — el admin ve todo el flujo y puede crear órdenes de prueba.
-- -------------------------------------------------------------
create policy "referral_select_admin"
  on public.referrals for select
  using (public.es_admin());

create policy "referral_insert_admin"
  on public.referrals for insert
  with check (public.es_admin());

create policy "referral_update_admin"
  on public.referrals for update
  using (public.es_admin())
  with check (public.es_admin() and estado in ('pendiente', 'rechazado'));

-- -------------------------------------------------------------
-- REFERRAL_CODES — lectura para auditar qué código es de quién.
-- -------------------------------------------------------------
create policy "codigo_select_admin"
  on public.referral_codes for select
  using (public.es_admin());

-- -------------------------------------------------------------
-- WALLETS — el admin ya puede ajustar saldos; ahora también verlos.
-- -------------------------------------------------------------
create policy "wallet_select_admin"
  on public.wallets for select
  using (public.es_admin());

-- -------------------------------------------------------------
-- Código de referido a nombre de otro embajador (pruebas y soporte).
-- Misma lógica que generar_codigo_referido() pero con el embajador como
-- parámetro. Idempotente: si ya existe el par (embajador, negocio) lo devuelve.
-- -------------------------------------------------------------
create or replace function public.admin_generar_codigo(p_negocio_id uuid, p_embajador_id uuid)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_codigo text;
  v_existe text;
  v_nombre text;
  v_oferta text;
  v_intentos int := 0;
begin
  if not public.es_admin() then
    raise exception 'Requiere rol admin' using errcode = '42501';
  end if;

  select nombre, oferta into v_nombre, v_oferta
    from public.businesses where id = p_negocio_id;
  if not found then
    raise exception 'Negocio no encontrado' using errcode = 'P0002';
  end if;

  if not exists (select 1 from public.profiles where id = p_embajador_id) then
    raise exception 'Embajador no encontrado' using errcode = 'P0002';
  end if;

  select codigo into v_existe
    from public.referral_codes
    where embajador_id = p_embajador_id and negocio_id = p_negocio_id
    limit 1;
  if v_existe is not null then
    return json_build_object('codigo', v_existe, 'negocio', v_nombre, 'oferta', v_oferta, 'nuevo', false);
  end if;

  loop
    v_intentos := v_intentos + 1;
    v_codigo := 'HAZLO-' || (
      select string_agg(substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 1 + floor(random() * 36)::int, 1), '')
      from generate_series(1, 4)
    );
    begin
      insert into public.referral_codes (codigo, embajador_id, negocio_id)
        values (v_codigo, p_embajador_id, p_negocio_id);
      exit;
    exception
      when unique_violation then
        select codigo into v_existe
          from public.referral_codes
          where embajador_id = p_embajador_id and negocio_id = p_negocio_id
          limit 1;
        if v_existe is not null then
          return json_build_object('codigo', v_existe, 'negocio', v_nombre, 'oferta', v_oferta, 'nuevo', false);
        end if;
        if v_intentos >= 12 then
          raise exception 'No se pudo generar el código, intenta de nuevo.';
        end if;
    end;
  end loop;

  return json_build_object('codigo', v_codigo, 'negocio', v_nombre, 'oferta', v_oferta, 'nuevo', true);
end;
$$;

grant execute on function public.admin_generar_codigo(uuid, uuid) to authenticated;

-- -------------------------------------------------------------
-- Borrado de órdenes de prueba. Acotado a lo que NO movió dinero: una orden
-- confirmada ya generó comisión y descontó créditos, así que se conserva como
-- registro contable.
-- -------------------------------------------------------------
create policy "referral_delete_admin"
  on public.referrals for delete
  using (public.es_admin() and estado <> 'confirmado');
