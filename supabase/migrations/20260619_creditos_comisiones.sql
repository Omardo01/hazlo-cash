-- =============================================================
-- Hazlo Cash — Créditos del negocio y comisiones del recomendador
-- Cierra el loop del dinero:
--   1) El admin ACTIVA (recarga) créditos a un negocio.
--   2) El negocio CONFIRMA una venta de un referido (con el folio/QR).
--   3) Se calcula la comisión (monto fijo o % del monto de venta),
--      se DESCUENTA de los créditos del negocio y se ABONA al wallet
--      del recomendador — todo en una transacción atómica server-side.
-- El dinero NUNCA se calcula en el cliente (regla del proyecto).
-- =============================================================

-- -------------------------------------------------------------
-- BUSINESSES — saldo de créditos (en pesos) + configuración de comisión.
-- comision_tipo='fijo'       → comision_valor es el monto en pesos por venta.
-- comision_tipo='porcentaje' → comision_valor es el % sobre el monto de venta.
-- -------------------------------------------------------------
alter table public.businesses
  add column creditos numeric(12, 2) not null default 0 check (creditos >= 0),
  add column comision_tipo text not null default 'fijo'
    check (comision_tipo in ('fijo', 'porcentaje')),
  add column comision_valor numeric(12, 2) not null default 10 check (comision_valor >= 0);

-- -------------------------------------------------------------
-- REFERRALS — registro económico de la venta cuando se confirma.
-- monto_venta es opcional en modo 'fijo', obligatorio en 'porcentaje'.
-- -------------------------------------------------------------
alter table public.referrals
  add column monto_venta numeric(12, 2),
  add column comision numeric(12, 2);

-- La confirmación de una venta DEBE pasar por confirmar_venta() porque mueve
-- dinero. Restringimos el UPDATE directo del negocio a sólo rechazar / dejar
-- pendiente; la función (security definer) es la única vía para 'confirmado'.
drop policy "referral_update_negocio" on public.referrals;
create policy "referral_update_negocio"
  on public.referrals for update
  using (
    exists (
      select 1
      from public.referral_codes rc
      join public.businesses b on b.id = rc.negocio_id
      where rc.id = codigo_id and b.owner_id = auth.uid()
    )
  )
  with check (estado in ('pendiente', 'rechazado'));

-- -------------------------------------------------------------
-- WALLETS — saldo acumulado del recomendador (embajador).
-- Lo escribe sólo confirmar_venta(); el cliente sólo lee el suyo.
-- -------------------------------------------------------------
create table public.wallets (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  saldo numeric(12, 2) not null default 0 check (saldo >= 0),
  updated_at timestamptz not null default now()
);

alter table public.wallets enable row level security;

create policy "wallet_select_propio"
  on public.wallets for select
  using (auth.uid() = user_id);

-- -------------------------------------------------------------
-- COMISIONES — ledger de cada comisión generada. Lado embajador (ingreso)
-- y lado negocio (consumo de créditos). Una fila por venta confirmada.
-- -------------------------------------------------------------
create table public.comisiones (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referrals (id) on delete cascade,
  negocio_id uuid not null references public.businesses (id) on delete cascade,
  embajador_id uuid not null references public.profiles (id) on delete cascade,
  monto numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

alter table public.comisiones enable row level security;

create policy "comision_select_embajador"
  on public.comisiones for select
  using (auth.uid() = embajador_id);

create policy "comision_select_negocio"
  on public.comisiones for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = negocio_id and b.owner_id = auth.uid()
    )
  );

create policy "comision_select_admin"
  on public.comisiones for select
  using (public.es_admin());

-- -------------------------------------------------------------
-- RECARGAS — ledger de créditos activados por el admin a un negocio.
-- -------------------------------------------------------------
create table public.recargas (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.businesses (id) on delete cascade,
  monto numeric(12, 2) not null check (monto > 0),
  admin_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.recargas enable row level security;

create policy "recarga_select_admin"
  on public.recargas for select
  using (public.es_admin());

create policy "recarga_select_negocio"
  on public.recargas for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = negocio_id and b.owner_id = auth.uid()
    )
  );

create index comisiones_embajador_idx on public.comisiones (embajador_id, created_at desc);
create index comisiones_negocio_idx on public.comisiones (negocio_id, created_at desc);
create index recargas_negocio_idx on public.recargas (negocio_id, created_at desc);

-- =============================================================
-- FUNCIONES (security definer = corren server-side, atómicas)
-- =============================================================

-- Admin activa/recarga créditos a un negocio. Devuelve el nuevo saldo.
create or replace function public.admin_recargar_creditos(p_negocio_id uuid, p_monto numeric)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_saldo numeric;
begin
  if not public.es_admin() then
    raise exception 'Requiere rol admin' using errcode = '42501';
  end if;
  if p_monto is null or p_monto <= 0 then
    raise exception 'El monto debe ser mayor a 0' using errcode = '22023';
  end if;

  update public.businesses
    set creditos = creditos + p_monto
    where id = p_negocio_id
    returning creditos into v_saldo;

  if not found then
    raise exception 'Negocio no encontrado' using errcode = 'P0002';
  end if;

  insert into public.recargas (negocio_id, monto, admin_id)
    values (p_negocio_id, p_monto, auth.uid());

  return v_saldo;
end;
$$;

-- El negocio confirma una venta de un referido. Calcula la comisión según la
-- configuración del negocio (fija o %), descuenta créditos y abona al wallet
-- del embajador. Lanza excepción (con mensaje claro) si algo no procede.
create or replace function public.confirmar_venta(p_referral_id uuid, p_monto_venta numeric default null)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_estado text;
  v_negocio_id uuid;
  v_owner_id uuid;
  v_embajador_id uuid;
  v_tipo text;
  v_valor numeric;
  v_creditos numeric;
  v_comision numeric;
  v_saldo_emb numeric;
begin
  -- Lock de la fila del referido y del negocio: evita doble confirmación y
  -- carreras sobre el saldo de créditos.
  select r.estado, b.id, b.owner_id, rc.embajador_id, b.comision_tipo, b.comision_valor, b.creditos
    into v_estado, v_negocio_id, v_owner_id, v_embajador_id, v_tipo, v_valor, v_creditos
    from public.referrals r
    join public.referral_codes rc on rc.id = r.codigo_id
    join public.businesses b on b.id = rc.negocio_id
    where r.id = p_referral_id
    for update of r, b;

  if not found then
    raise exception 'Solicitud no encontrada' using errcode = 'P0002';
  end if;

  -- Sólo el dueño del negocio (o un admin) confirma.
  if v_owner_id is distinct from auth.uid() and not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if v_estado <> 'pendiente' then
    raise exception 'Esta solicitud ya fue resuelta' using errcode = '22023';
  end if;

  -- Calcular comisión.
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

  -- 1) Marcar la venta como confirmada (con su registro económico).
  update public.referrals
    set estado = 'confirmado', confirmado_at = now(), monto_venta = p_monto_venta, comision = v_comision
    where id = p_referral_id;

  -- 2) Descontar créditos del negocio.
  update public.businesses
    set creditos = creditos - v_comision
    where id = v_negocio_id;

  -- 3) Registrar la comisión en el ledger.
  insert into public.comisiones (referral_id, negocio_id, embajador_id, monto)
    values (p_referral_id, v_negocio_id, v_embajador_id, v_comision);

  -- 4) Abonar al wallet del embajador (lo crea si aún no existe).
  insert into public.wallets (user_id, saldo, updated_at)
    values (v_embajador_id, v_comision, now())
    on conflict (user_id)
    do update set saldo = public.wallets.saldo + excluded.saldo, updated_at = now();

  select saldo into v_saldo_emb from public.wallets where user_id = v_embajador_id;

  return json_build_object(
    'ok', true,
    'comision', v_comision,
    'creditos_restantes', v_creditos - v_comision,
    'saldo_embajador', v_saldo_emb
  );
end;
$$;

grant execute on function public.admin_recargar_creditos(uuid, numeric) to authenticated;
grant execute on function public.confirmar_venta(uuid, numeric) to authenticated;
