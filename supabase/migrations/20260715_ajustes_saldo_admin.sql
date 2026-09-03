-- =============================================================
-- Hazlo Cash — Ajustes de saldo por el admin
-- Permite al admin asignar (sumar) o quitar (restar) saldo al wallet de
-- cualquier usuario, con motivo y registro de auditoría. El dinero se mueve
-- SOLO server-side (security definer + es_admin), como manda el modelo.
-- =============================================================

-- Ledger de ajustes manuales de saldo. monto puede ser + (asignar) o − (quitar).
create table public.ajustes_saldo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  monto numeric(12, 2) not null check (monto <> 0),
  motivo text,
  admin_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.ajustes_saldo enable row level security;

-- El admin ve todos los ajustes; el usuario ve solo los suyos.
create policy "ajuste_select_admin"
  on public.ajustes_saldo for select
  using (public.es_admin());

create policy "ajuste_select_propio"
  on public.ajustes_saldo for select
  using (auth.uid() = user_id);

create index ajustes_user_idx on public.ajustes_saldo (user_id, created_at desc);

-- Admin ajusta el saldo de un usuario (+ o −). Registra el movimiento y
-- devuelve el nuevo saldo. No permite dejar el wallet en negativo.
create or replace function public.admin_ajustar_saldo(
  p_user_id uuid,
  p_monto numeric,
  p_motivo text default null
)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actual numeric;
  v_nuevo numeric;
begin
  if not public.es_admin() then
    raise exception 'Requiere rol admin' using errcode = '42501';
  end if;
  if p_monto is null or p_monto = 0 then
    raise exception 'El monto no puede ser 0' using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'Usuario no encontrado' using errcode = 'P0002';
  end if;

  select coalesce(saldo, 0) into v_actual
    from public.wallets where user_id = p_user_id;
  v_actual := coalesce(v_actual, 0);
  v_nuevo := v_actual + p_monto;

  if v_nuevo < 0 then
    raise exception 'El ajuste dejaría el saldo en negativo (actual %, ajuste %)', v_actual, p_monto
      using errcode = '22023';
  end if;

  insert into public.wallets (user_id, saldo, updated_at)
    values (p_user_id, v_nuevo, now())
    on conflict (user_id)
    do update set saldo = v_nuevo, updated_at = now();

  insert into public.ajustes_saldo (user_id, monto, motivo, admin_id)
    values (p_user_id, p_monto, nullif(trim(p_motivo), ''), auth.uid());

  return v_nuevo;
end;
$$;
