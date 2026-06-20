-- =============================================================
-- Registrar una venta escaneando el QR del recomendador (código HAZLO-XXXX).
-- Modelo "taquería": el cliente llega y muestra el código del embajador; el
-- negocio lo escanea y la venta queda registrada al instante.
-- Crea un referido ya CONFIRMADO (sin cuenta de cliente), descuenta créditos
-- del negocio y abona la comisión al recomendador. Todo atómico, server-side.
-- =============================================================

create or replace function public.registrar_venta_por_codigo(p_codigo text, p_monto_venta numeric default null)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code_id uuid;
  v_negocio_id uuid;
  v_owner_id uuid;
  v_embajador_id uuid;
  v_tipo text;
  v_valor numeric;
  v_creditos numeric;
  v_comision numeric;
  v_referral_id uuid;
  v_saldo_emb numeric;
begin
  -- Buscar el código activo + su negocio (lock sobre el negocio por el saldo).
  select rc.id, b.id, b.owner_id, rc.embajador_id, b.comision_tipo, b.comision_valor, b.creditos
    into v_code_id, v_negocio_id, v_owner_id, v_embajador_id, v_tipo, v_valor, v_creditos
    from public.referral_codes rc
    join public.businesses b on b.id = rc.negocio_id
    where rc.codigo = upper(p_codigo) and rc.activo = true
    for update of b;

  if not found then
    raise exception 'Ese código no existe o no está activo.' using errcode = 'P0002';
  end if;

  -- Solo el dueño del negocio (o un admin) puede registrar la venta del código.
  if v_owner_id is distinct from auth.uid() and not public.es_admin() then
    raise exception 'Ese código no es de tu negocio.' using errcode = '42501';
  end if;

  -- Calcular comisión (fija o % del monto de venta).
  if v_tipo = 'porcentaje' then
    if p_monto_venta is null or p_monto_venta <= 0 then
      raise exception 'Captura el monto de la venta' using errcode = '22023';
    end if;
    v_comision := round(p_monto_venta * v_valor / 100.0, 2);
  else
    v_comision := v_valor;
  end if;

  if v_creditos < v_comision then
    raise exception 'Créditos insuficientes. Pide al admin que recargue.' using errcode = '22023';
  end if;

  -- 1) Crear el referido ya confirmado (venta directa, sin cliente con cuenta).
  insert into public.referrals (codigo_id, cliente_id, estado, confirmado_at, monto_venta, comision)
    values (v_code_id, null, 'confirmado', now(), p_monto_venta, v_comision)
    returning id into v_referral_id;

  -- 2) Descontar créditos del negocio.
  update public.businesses set creditos = creditos - v_comision where id = v_negocio_id;

  -- 3) Registrar la comisión.
  insert into public.comisiones (referral_id, negocio_id, embajador_id, monto)
    values (v_referral_id, v_negocio_id, v_embajador_id, v_comision);

  -- 4) Abonar al wallet del embajador.
  insert into public.wallets (user_id, saldo, updated_at)
    values (v_embajador_id, v_comision, now())
    on conflict (user_id)
    do update set saldo = public.wallets.saldo + excluded.saldo, updated_at = now();

  select saldo into v_saldo_emb from public.wallets where user_id = v_embajador_id;

  return json_build_object(
    'ok', true,
    'comision', v_comision,
    'creditos_restantes', v_creditos - v_comision
  );
end;
$$;

grant execute on function public.registrar_venta_por_codigo(text, numeric) to authenticated;
