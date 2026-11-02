-- =============================================================
-- Hazlo Cash — Solicitudes de recarga de créditos por transferencia
--
-- El negocio (ya aprobado) pide cuántos créditos quiere cargar y recibe los
-- datos para transferir con una referencia única. La solicitud le aparece al
-- admin, que la acepta cuando ve llegar la transferencia (verificación humana,
-- sin conciliación automática por ahora) o la rechaza.
--
-- Nadie escribe la tabla directo: las dos funciones SECURITY DEFINER son la
-- única vía, porque aceptar mueve dinero. Aceptar hace lo mismo que
-- admin_recargar_creditos (suma créditos + deja rastro en `recargas`) dentro
-- de la misma transacción que cierra la solicitud.
-- =============================================================

create table public.solicitudes_recarga (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.businesses (id) on delete cascade,
  monto numeric(12, 2) not null check (monto > 0 and monto <= 100000),
  -- Lo que el negocio pone en el concepto de la transferencia.
  referencia text not null unique,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'aceptada', 'rechazada')),
  created_at timestamptz not null default now(),
  resuelta_en timestamptz,
  admin_id uuid references public.profiles (id) on delete set null
);

create index solicitudes_recarga_negocio on public.solicitudes_recarga (negocio_id, created_at desc);
create index solicitudes_recarga_pendientes on public.solicitudes_recarga (created_at) where estado = 'pendiente';

alter table public.solicitudes_recarga enable row level security;

create policy "recarga_select_dueno"
  on public.solicitudes_recarga for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = negocio_id and b.owner_id = auth.uid()
    )
  );

create policy "recarga_select_admin"
  on public.solicitudes_recarga for select
  using (public.es_admin());

revoke insert, update, delete on public.solicitudes_recarga from anon, authenticated;

-- -------------------------------------------------------------
-- El dueño pide una recarga para su negocio. Sólo con el negocio activo
-- (aprobado) y una solicitud pendiente a la vez.
-- -------------------------------------------------------------
create or replace function public.negocio_solicitar_recarga(p_monto numeric)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_negocio public.businesses;
  v_solicitud public.solicitudes_recarga;
begin
  if p_monto is null or p_monto < 100 or p_monto > 100000 then
    raise exception 'El monto va de $100 a $100,000' using errcode = '22023';
  end if;

  select * into v_negocio
    from public.businesses
    where owner_id = auth.uid()
    order by created_at
    limit 1;

  if not found then
    raise exception 'No tienes un negocio asignado' using errcode = 'P0002';
  end if;
  if not v_negocio.activo then
    raise exception 'Tu negocio todavía no está aprobado' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.solicitudes_recarga
    where negocio_id = v_negocio.id and estado = 'pendiente'
  ) then
    raise exception 'Ya tienes una recarga esperando confirmación' using errcode = '23505';
  end if;

  insert into public.solicitudes_recarga (negocio_id, monto, referencia)
    values (
      v_negocio.id,
      round(p_monto, 2),
      'HZ' || upper(substr(md5(gen_random_uuid()::text), 1, 6))
    )
    returning * into v_solicitud;

  return row_to_json(v_solicitud);
end;
$$;

-- -------------------------------------------------------------
-- El admin acepta (llegó la transferencia) o rechaza una solicitud.
-- Devuelve el saldo de créditos del negocio después de resolverla.
-- -------------------------------------------------------------
create or replace function public.admin_resolver_recarga(p_solicitud_id uuid, p_aceptar boolean)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_solicitud public.solicitudes_recarga;
  v_saldo numeric;
begin
  if not public.es_admin() then
    raise exception 'Requiere rol admin' using errcode = '42501';
  end if;

  -- for update: dos admins aceptando a la vez no suman dos veces.
  select * into v_solicitud
    from public.solicitudes_recarga
    where id = p_solicitud_id
    for update;

  if not found then
    raise exception 'Solicitud no encontrada' using errcode = 'P0002';
  end if;
  if v_solicitud.estado <> 'pendiente' then
    raise exception 'Esa solicitud ya se resolvió' using errcode = '22023';
  end if;

  if p_aceptar then
    update public.businesses
      set creditos = creditos + v_solicitud.monto
      where id = v_solicitud.negocio_id
      returning creditos into v_saldo;

    insert into public.recargas (negocio_id, monto, admin_id)
      values (v_solicitud.negocio_id, v_solicitud.monto, auth.uid());
  else
    select creditos into v_saldo from public.businesses where id = v_solicitud.negocio_id;
  end if;

  update public.solicitudes_recarga
    set estado = case when p_aceptar then 'aceptada' else 'rechazada' end,
        resuelta_en = now(),
        admin_id = auth.uid()
    where id = p_solicitud_id;

  return v_saldo;
end;
$$;

revoke execute on function public.negocio_solicitar_recarga(numeric) from public, anon;
revoke execute on function public.admin_resolver_recarga(uuid, boolean) from public, anon;
grant execute on function public.negocio_solicitar_recarga(numeric) to authenticated;
grant execute on function public.admin_resolver_recarga(uuid, boolean) to authenticated;
