-- =============================================================
-- Hazlo Cash — Esquema inicial del loop core
-- Embajador → Cliente → Negocio → (comisión, fase siguiente)
-- RLS habilitado en TODAS las tablas desde el día 1.
-- =============================================================

-- -------------------------------------------------------------
-- PROFILES — extensión de auth.users. Un usuario puede tener
-- múltiples roles (cliente, embajador, negocio, admin).
-- -------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  telefono text,
  avatar_url text,
  roles text[] not null default '{cliente}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "perfil_select_propio"
  on public.profiles for select
  using (auth.uid() = id);

create policy "perfil_update_propio"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- El insert lo hace el trigger (security definer), no el cliente.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------
-- BUSINESSES — negocios/prestadores de servicio.
-- -------------------------------------------------------------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete set null,
  nombre text not null,
  categoria text not null,
  descripcion text,
  direccion text,
  oferta text, -- la oferta Hazlo Cash, ej. "Refresco gratis con tu primer pedido"
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;

-- Catálogo público: cualquiera (incluso anónimo) ve negocios activos.
create policy "negocio_select_activos"
  on public.businesses for select
  using (activo = true);

create policy "negocio_all_dueno"
  on public.businesses for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- -------------------------------------------------------------
-- REFERRAL_CODES — código único por embajador+negocio (HAZLO-XXXX).
-- -------------------------------------------------------------
create table public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique check (codigo ~ '^HAZLO-[A-Z0-9]{4}$'),
  embajador_id uuid not null references public.profiles (id) on delete cascade,
  negocio_id uuid not null references public.businesses (id) on delete cascade,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (embajador_id, negocio_id)
);

alter table public.referral_codes enable row level security;

-- El deep link /r/[code] se abre sin sesión: lectura pública de códigos activos.
create policy "codigo_select_activos"
  on public.referral_codes for select
  using (activo = true);

create policy "codigo_all_embajador"
  on public.referral_codes for all
  using (auth.uid() = embajador_id)
  with check (auth.uid() = embajador_id);

-- -------------------------------------------------------------
-- REFERRALS — cada uso de un código. El corazón del loop.
-- estado: pendiente → confirmado (por el negocio) | rechazado
-- -------------------------------------------------------------
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  codigo_id uuid not null references public.referral_codes (id) on delete cascade,
  cliente_id uuid references public.profiles (id) on delete set null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'confirmado', 'rechazado')),
  created_at timestamptz not null default now(),
  confirmado_at timestamptz
);

alter table public.referrals enable row level security;

create policy "referral_insert_cliente"
  on public.referrals for insert
  with check (auth.uid() = cliente_id);

create policy "referral_select_cliente"
  on public.referrals for select
  using (auth.uid() = cliente_id);

create policy "referral_select_embajador"
  on public.referrals for select
  using (
    exists (
      select 1 from public.referral_codes rc
      where rc.id = codigo_id and rc.embajador_id = auth.uid()
    )
  );

create policy "referral_select_negocio"
  on public.referrals for select
  using (
    exists (
      select 1
      from public.referral_codes rc
      join public.businesses b on b.id = rc.negocio_id
      where rc.id = codigo_id and b.owner_id = auth.uid()
    )
  );

-- Solo el dueño del negocio confirma o rechaza.
create policy "referral_update_negocio"
  on public.referrals for update
  using (
    exists (
      select 1
      from public.referral_codes rc
      join public.businesses b on b.id = rc.negocio_id
      where rc.id = codigo_id and b.owner_id = auth.uid()
    )
  );

-- Índices para las consultas del loop
create index referrals_codigo_id_idx on public.referrals (codigo_id);
create index referral_codes_embajador_idx on public.referral_codes (embajador_id);
create index referral_codes_negocio_idx on public.referral_codes (negocio_id);
create index businesses_owner_idx on public.businesses (owner_id);
