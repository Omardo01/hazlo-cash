-- =============================================================
-- 1) QR de un solo uso (decisión de Omar, 2026-10-17).
-- Al registrarse la venta de un código, el código se desactiva. Para el
-- siguiente amigo el recomendador genera otro: puede haber varios códigos por
-- (embajador, negocio), pero uno solo activo a la vez.
--
-- 2) Avisos push a la app web (PWA), Web Push estándar.
-- Los disparadores de la base arman el aviso y lo mandan por pg_net a la Edge
-- Function `enviar-push`, que lo entrega a las suscripciones del usuario. La
-- URL de la función y el secreto compartido viven en Vault (no en este
-- archivo): sin ellos, o si algo falla, el aviso simplemente no sale y la
-- venta sigue su curso.
-- =============================================================

-- ── 1. QR de un solo uso ─────────────────────────────────────────────────────

alter table public.referral_codes add column if not exists usado_at timestamptz;

alter table public.referral_codes drop constraint if exists referral_codes_embajador_id_negocio_id_key;
create unique index if not exists referral_codes_un_activo_por_negocio
  on public.referral_codes (embajador_id, negocio_id)
  where activo;

-- El embajador ya no escribe sus códigos directo (todo pasa por
-- generar_codigo_referido). Con "for all" podía volver a activar un QR usado y
-- cobrar dos veces: se queda solo con lectura.
drop policy if exists "codigo_all_embajador" on public.referral_codes;
drop policy if exists "codigo_select_embajador" on public.referral_codes;
create policy "codigo_select_embajador"
  on public.referral_codes for select
  using (auth.uid() = embajador_id);

-- Genera (o devuelve) el código ACTIVO del embajador para ese negocio.
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

  -- Si ya tiene un código sin usar para este negocio, ese mismo.
  select codigo into v_existe
    from public.referral_codes
    where embajador_id = v_uid and negocio_id = p_negocio_id and activo
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
      exit;
    exception
      when unique_violation then
        -- ¿Otro proceso creó el activo de este negocio? Devolvemos ese.
        select codigo into v_existe
          from public.referral_codes
          where embajador_id = v_uid and negocio_id = p_negocio_id and activo
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
    where embajador_id = p_embajador_id and negocio_id = p_negocio_id and activo
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
          where embajador_id = p_embajador_id and negocio_id = p_negocio_id and activo
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

-- La venta por QR ahora consume el código. Se bloquea también la fila del
-- código: dos escaneos simultáneos del mismo QR no pueden cobrar dos veces (el
-- segundo espera, vuelve a leer `activo` y ya lo encuentra usado).
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
begin
  select rc.id, b.id, b.owner_id, rc.embajador_id, b.comision_tipo, b.comision_valor, b.creditos
    into v_code_id, v_negocio_id, v_owner_id, v_embajador_id, v_tipo, v_valor, v_creditos
    from public.referral_codes rc
    join public.businesses b on b.id = rc.negocio_id
    where rc.codigo = upper(p_codigo) and rc.activo = true
    for update of b, rc;

  if not found then
    if exists (select 1 from public.referral_codes where codigo = upper(p_codigo) and usado_at is not null) then
      raise exception 'Este QR ya se usó. Cada QR sirve para una sola compra.' using errcode = 'P0002';
    end if;
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

  -- 2) El QR ya se usó: queda desactivado para siempre.
  update public.referral_codes set activo = false, usado_at = now() where id = v_code_id;

  -- 3) Descontar créditos del negocio.
  update public.businesses set creditos = creditos - v_comision where id = v_negocio_id;

  -- 4) Registrar la comisión.
  insert into public.comisiones (referral_id, negocio_id, embajador_id, monto)
    values (v_referral_id, v_negocio_id, v_embajador_id, v_comision);

  -- 5) Abonar al wallet del embajador.
  insert into public.wallets (user_id, saldo, updated_at)
    values (v_embajador_id, v_comision, now())
    on conflict (user_id)
    do update set saldo = public.wallets.saldo + excluded.saldo, updated_at = now();

  return json_build_object(
    'ok', true,
    'comision', v_comision,
    'creditos_restantes', v_creditos - v_comision
  );
end;
$$;

grant execute on function public.registrar_venta_por_codigo(text, numeric) to authenticated;

-- ── 2. Avisos push ───────────────────────────────────────────────────────────

create extension if not exists pg_net;

-- Una fila por navegador/teléfono suscrito. El endpoint es único: si el mismo
-- teléfono entra con otra cuenta, la suscripción se muda a esa cuenta.
create table if not exists public.push_suscripciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  agente text,
  created_at timestamptz not null default now()
);

create index if not exists push_suscripciones_user_idx on public.push_suscripciones (user_id);

alter table public.push_suscripciones enable row level security;

drop policy if exists "push_select_propio" on public.push_suscripciones;
create policy "push_select_propio"
  on public.push_suscripciones for select
  using (auth.uid() = user_id);

drop policy if exists "push_delete_propio" on public.push_suscripciones;
create policy "push_delete_propio"
  on public.push_suscripciones for delete
  using (auth.uid() = user_id);

-- Alta (o mudanza) de la suscripción de este navegador a la cuenta en sesión.
create or replace function public.guardar_suscripcion_push(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_agente text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado' using errcode = '42501';
  end if;
  if coalesce(p_endpoint, '') !~ '^https://' or coalesce(p_p256dh, '') = '' or coalesce(p_auth, '') = '' then
    raise exception 'Suscripción inválida' using errcode = '22023';
  end if;

  insert into public.push_suscripciones (user_id, endpoint, p256dh, auth, agente)
    values (auth.uid(), p_endpoint, p_p256dh, p_auth, left(p_agente, 300))
    on conflict (endpoint) do update
      set user_id = excluded.user_id,
          p256dh = excluded.p256dh,
          auth = excluded.auth,
          agente = excluded.agente,
          created_at = now();
end;
$$;

revoke all on function public.guardar_suscripcion_push(text, text, text, text) from public, anon;
grant execute on function public.guardar_suscripcion_push(text, text, text, text) to authenticated;

-- "$25" o "$12.50".
create or replace function public.texto_pesos(p numeric)
returns text
language sql
immutable
set search_path = ''
as $$
  select '$' || case when p = trunc(p) then to_char(p, 'FM999,999,990') else to_char(p, 'FM999,999,990.00') end;
$$;

-- Manda un aviso a todos los teléfonos del usuario. Solo la usan los
-- disparadores de abajo: nadie desde la app puede mandarle avisos a otro.
create or replace function public.enviar_push(p_user_id uuid, p_titulo text, p_cuerpo text, p_url text default '/')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text;
  v_secreto text;
begin
  if p_user_id is null then
    return;
  end if;
  -- Sin teléfonos suscritos no hay a quién avisar: ni se llama a la función.
  if not exists (select 1 from public.push_suscripciones where user_id = p_user_id) then
    return;
  end if;

  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'push_funcion_url';
  select decrypted_secret into v_secreto from vault.decrypted_secrets where name = 'push_secreto';
  if v_url is null or v_secreto is null then
    return;
  end if;

  perform net.http_post(
    url := v_url,
    body := jsonb_build_object('user_id', p_user_id, 'titulo', p_titulo, 'cuerpo', p_cuerpo, 'url', p_url),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secreto', v_secreto)
  );
exception
  when others then
    -- Un aviso que no sale nunca debe tumbar la venta o la recarga.
    raise warning 'enviar_push: %', sqlerrm;
end;
$$;

revoke all on function public.enviar_push(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.texto_pesos(numeric) from anon;

-- Recomendador: usaron su QR y cayó su comisión.
create or replace function public.avisar_comision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_negocio text;
begin
  select nombre into v_negocio from public.businesses where id = new.negocio_id;
  perform public.enviar_push(
    new.embajador_id,
    '¡Usaron tu QR! +' || public.texto_pesos(new.monto),
    'En ' || coalesce(v_negocio, 'un negocio') || '. Ya está en tu saldo.',
    '/'
  );
  return new;
end;
$$;

drop trigger if exists comisiones_avisar on public.comisiones;
create trigger comisiones_avisar
  after insert on public.comisiones
  for each row execute function public.avisar_comision();

-- Negocio: sus créditos bajaron de un umbral. Avisa una vez al cruzarlo, no
-- en cada venta. Con comisión fija el umbral son ventas (quedan para 3, ya no
-- alcanza para 1); con porcentaje, pesos ($100 y $0).
create or replace function public.avisar_creditos_bajos()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_por_venta numeric;
  v_ventas int;
begin
  if new.owner_id is null then
    return new;
  end if;

  if new.comision_tipo = 'fijo' and coalesce(new.comision_valor, 0) > 0 then
    v_por_venta := new.comision_valor;
    if old.creditos >= v_por_venta and new.creditos < v_por_venta then
      perform public.enviar_push(new.owner_id, 'Te quedaste sin créditos',
        'Ya no alcanzan para registrar ventas con Hazlo Cash. Pide una recarga.', '/');
    elsif old.creditos >= v_por_venta * 3 and new.creditos < v_por_venta * 3 then
      v_ventas := floor(new.creditos / v_por_venta);
      perform public.enviar_push(new.owner_id, 'Te quedan pocos créditos',
        'Alcanzan para ' || v_ventas || case when v_ventas = 1 then ' venta más.' else ' ventas más.' end || ' Pide una recarga a tiempo.', '/');
    end if;
  else
    if old.creditos > 0 and new.creditos <= 0 then
      perform public.enviar_push(new.owner_id, 'Te quedaste sin créditos',
        'Ya no alcanzan para registrar ventas con Hazlo Cash. Pide una recarga.', '/');
    elsif old.creditos >= 100 and new.creditos < 100 then
      perform public.enviar_push(new.owner_id, 'Te quedan pocos créditos',
        'Te quedan ' || public.texto_pesos(new.creditos) || '. Pide una recarga a tiempo.', '/');
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists businesses_avisar_creditos on public.businesses;
create trigger businesses_avisar_creditos
  after update of creditos on public.businesses
  for each row
  when (new.creditos < old.creditos)
  execute function public.avisar_creditos_bajos();

-- Negocio: le recargaron créditos.
create or replace function public.avisar_recarga()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid;
  v_creditos numeric;
begin
  select owner_id, creditos into v_owner, v_creditos from public.businesses where id = new.negocio_id;
  perform public.enviar_push(
    v_owner,
    'Te recargaron créditos',
    'Se sumaron ' || public.texto_pesos(new.monto) || '. Ahora tienes ' || public.texto_pesos(v_creditos) || '.',
    '/'
  );
  return new;
end;
$$;

drop trigger if exists recargas_avisar on public.recargas;
create trigger recargas_avisar
  after insert on public.recargas
  for each row execute function public.avisar_recarga();

revoke all on function public.avisar_comision() from public, anon, authenticated;
revoke all on function public.avisar_creditos_bajos() from public, anon, authenticated;
revoke all on function public.avisar_recarga() from public, anon, authenticated;
