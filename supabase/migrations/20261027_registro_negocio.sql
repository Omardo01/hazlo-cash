-- =============================================================
-- Hazlo Cash — Registro de negocios desde la app
--
-- Hasta hoy los negocios sólo los daba de alta el admin. Desde 2026-10-27 un
-- negocio se registra solo (Edge Function registro-negocio, con service role):
-- nace con su cuenta dueña, oculto del catálogo y POR APROBAR. Hasta que el
-- admin lo activa no aparece a nadie más.
--
-- 1) businesses.giros — los giros del catálogo del Excel que eligió (hasta 5).
--    `categoria` guarda el slug del grupo (grupoDeCategoria ya lo reconoce).
-- 2) businesses.por_aprobar — lo marca la función; lo apaga el admin al
--    activarlo. Es columna de control: el dueño no la puede tocar.
-- =============================================================

alter table public.businesses
  add column if not exists giros text[] not null default '{}',
  add column if not exists por_aprobar boolean not null default false;

-- Mismo candado de columnas de 20260903, sumando por_aprobar.
create or replace function public.proteger_columnas_negocio()
returns trigger
language plpgsql
security invoker            -- INVOKER a propósito: ver 20260903_registro_publico_y_blindaje_negocio.sql
set search_path = ''
as $$
begin
  if current_user <> 'authenticated' then
    return new;
  end if;

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
  if new.activo is distinct from old.activo
     or new.por_aprobar is distinct from old.por_aprobar then
    raise exception 'La activación del negocio la controla el administrador'
      using errcode = '42501';
  end if;

  return new;
end;
$$;
