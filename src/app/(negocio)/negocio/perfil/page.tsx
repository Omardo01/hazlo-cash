"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BellIcon,
  ChevronDownIcon,
  MoonIcon,
  ChevronRightIcon,
  SearchIcon,
  CheckCircle2Icon,
  EditIcon,
  ImageIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  ZapIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
  EyeIcon,
  SaveIcon,
  UsersIcon,
  TrendingUpIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types & Data ──────────────────────────────────────────────────────────────

type DiaSemana = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";
type TabKey = "info" | "servicios" | "horarios" | "oferta";

interface Horario {
  dia: DiaSemana;
  label: string;
  abre: string;
  cierra: string;
  abierto: boolean;
}

interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
}

const navTabs = [
  { label: "Inicio",      href: "/negocio"              },
  { label: "Solicitudes", href: "/negocio/solicitudes"  },
  { label: "Embajadores", href: "/negocio/embajadores"  },
  { label: "Mi Negocio",  href: "/negocio/perfil"       },
];

const horariosInit: Horario[] = [
  { dia: "lun", label: "Lunes",     abre: "08:00", cierra: "22:00", abierto: true  },
  { dia: "mar", label: "Martes",    abre: "08:00", cierra: "22:00", abierto: true  },
  { dia: "mie", label: "Miércoles", abre: "08:00", cierra: "22:00", abierto: true  },
  { dia: "jue", label: "Jueves",    abre: "08:00", cierra: "22:00", abierto: true  },
  { dia: "vie", label: "Viernes",   abre: "08:00", cierra: "23:00", abierto: true  },
  { dia: "sab", label: "Sábado",    abre: "09:00", cierra: "23:00", abierto: true  },
  { dia: "dom", label: "Domingo",   abre: "10:00", cierra: "20:00", abierto: false },
];

const serviciosInit: Servicio[] = [
  { id: "s1", nombre: "Taco + Refresco",  precio: 120,  descripcion: "2 tacos al pastor + refresco de lata" },
  { id: "s2", nombre: "Orden familiar",   precio: 350,  descripcion: "10 tacos surtidos + 2 refrescos" },
  { id: "s3", nombre: "Catering x10 pax", precio: 900,  descripcion: "100 tacos + aguas para 10 personas" },
  { id: "s4", nombre: "Catering x20 pax", precio: 1800, descripcion: "200 tacos + aguas para 20 personas" },
];

const categorias = ["Comida", "Bebidas", "Plomería", "Electricidad", "Mecánica", "Belleza", "Limpieza", "Albañilería", "Otro"];

const sectionTabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "info",      label: "Información",  icon: EditIcon   },
  { key: "servicios", label: "Servicios",    icon: ZapIcon    },
  { key: "horarios",  label: "Horarios",     icon: ClockIcon  },
  { key: "oferta",    label: "Oferta",       icon: StarIcon   },
];

// ── Header ────────────────────────────────────────────────────────────────────

function NegocioHeader({ activeHref }: { activeHref: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-[62px] shrink-0 items-center bg-white border-b border-border px-4 sm:px-5 gap-3">
      <nav className="flex items-center gap-1 h-full">
        {navTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex h-full items-center px-3 text-sm transition-colors",
              tab.href === activeHref
                ? "font-semibold text-foreground"
                : "font-medium text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.href === activeHref && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full bg-brand-orange" />
            )}
          </Link>
        ))}
        <div className="mx-1 h-5 w-px bg-border" />
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <SearchIcon className="h-4 w-4" />
        </button>
      </nav>
      <div className="flex-1" />
      <div className="flex items-center gap-2.5 shrink-0">
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <BellIcon className="h-[17px] w-[17px]" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-orange" />
        </button>
        <span className="hidden sm:block text-sm font-semibold text-foreground">Tacos El Güero</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange text-[11px] font-bold">
          TG
        </div>
        <ChevronDownIcon className="h-3 w-3 text-muted-foreground hidden sm:block" />
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <MoonIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors shrink-0",
        checked ? "bg-brand-teal" : "bg-border"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

// ── Tabs content ──────────────────────────────────────────────────────────────

function TabInfo({
  nombre, setNombre,
  categoria, setCategoria,
  descripcion, setDescripcion,
  telefono, setTelefono,
  direccion, setDireccion,
}: {
  nombre: string; setNombre: (v: string) => void;
  categoria: string; setCategoria: (v: string) => void;
  descripcion: string; setDescripcion: (v: string) => void;
  telefono: string; setTelefono: (v: string) => void;
  direccion: string; setDireccion: (v: string) => void;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        <div
          className="h-28 flex items-center justify-center relative"
          style={{ background: "linear-gradient(135deg, #1A1840 0%, #2D2B8F 60%, #F5A623 200%)" }}
        >
          <div className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange mx-auto mb-1.5 text-lg font-black text-white">
              TG
            </div>
            <p className="text-white/50 text-[11px]">Sin foto de portada</p>
          </div>
          <button className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-all">
            <ImageIcon className="h-3 w-3" />
            Subir foto
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Datos del negocio</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Nombre del negocio *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-[13px] outline-none focus:border-brand-orange/50 focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Categoría *
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-[13px] outline-none focus:border-brand-orange/50 focus:bg-white transition-all"
            >
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            maxLength={280}
            className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-[13px] outline-none focus:border-brand-orange/50 focus:bg-white transition-all resize-none"
          />
          <p className="text-[10px] text-muted-foreground text-right">{descripcion.length}/280</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <PhoneIcon className="h-3 w-3" /> Teléfono
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-[13px] outline-none focus:border-brand-orange/50 focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MapPinIcon className="h-3 w-3" /> Dirección
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-[13px] outline-none focus:border-brand-orange/50 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold transition-all",
              saved
                ? "bg-brand-teal/10 text-brand-teal"
                : "bg-brand-orange text-white hover:bg-brand-orange/90 shadow-sm"
            )}
          >
            {saved ? <CheckCircle2Icon className="h-3.5 w-3.5" /> : <SaveIcon className="h-3.5 w-3.5" />}
            {saved ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TabServicios({
  servicios, setServicios,
}: {
  servicios: Servicio[];
  setServicios: React.Dispatch<React.SetStateAction<Servicio[]>>;
}) {
  const [showNuevo, setShowNuevo] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", descripcion: "" });

  const agregar = () => {
    if (!nuevo.nombre || !nuevo.precio) return;
    setServicios((prev) => [
      ...prev,
      { id: `s${Date.now()}`, nombre: nuevo.nombre, precio: Number(nuevo.precio), descripcion: nuevo.descripcion },
    ]);
    setNuevo({ nombre: "", precio: "", descripcion: "" });
    setShowNuevo(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Servicios / Menú</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{servicios.length} servicios activos</p>
        </div>
        <button
          onClick={() => setShowNuevo(true)}
          className="flex items-center gap-1.5 rounded-xl bg-brand-orange text-white px-3 py-1.5 text-[12px] font-semibold hover:bg-brand-orange/90 transition-colors"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Agregar
        </button>
      </div>

      <div className="divide-y divide-border">
        {servicios.map((s) => (
          <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/10 shrink-0">
              <ZapIcon className="h-4 w-4 text-brand-orange" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground">{s.nombre}</p>
              {s.descripcion && (
                <p className="text-[11px] text-muted-foreground truncate">{s.descripcion}</p>
              )}
            </div>
            <p className="text-[13px] font-black text-foreground shrink-0">${s.precio.toLocaleString("es-MX")}</p>
            <button
              onClick={() => setServicios((prev) => prev.filter((x) => x.id !== s.id))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {showNuevo && (
          <div className="px-5 py-4 bg-brand-orange/3 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Nombre *</label>
                <input
                  type="text"
                  placeholder="ej. Orden familiar"
                  value={nuevo.nombre}
                  onChange={(e) => setNuevo((p) => ({ ...p, nombre: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[12px] outline-none focus:border-brand-orange/50 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Precio (MXN) *</label>
                <input
                  type="number"
                  placeholder="350"
                  value={nuevo.precio}
                  onChange={(e) => setNuevo((p) => ({ ...p, precio: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[12px] outline-none focus:border-brand-orange/50 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Descripción</label>
              <input
                type="text"
                placeholder="Describe brevemente..."
                value={nuevo.descripcion}
                onChange={(e) => setNuevo((p) => ({ ...p, descripcion: e.target.value }))}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[12px] outline-none focus:border-brand-orange/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={agregar}
                className="flex items-center gap-1.5 rounded-xl bg-brand-orange text-white px-3.5 py-2 text-[12px] font-semibold hover:bg-brand-orange/90 transition-colors"
              >
                <PlusIcon className="h-3.5 w-3.5" /> Agregar
              </button>
              <button
                onClick={() => { setShowNuevo(false); setNuevo({ nombre: "", precio: "", descripcion: "" }); }}
                className="flex items-center gap-1.5 rounded-xl bg-secondary text-muted-foreground px-3.5 py-2 text-[12px] font-semibold hover:bg-border transition-colors"
              >
                <XIcon className="h-3.5 w-3.5" /> Cancelar
              </button>
            </div>
          </div>
        )}

        {servicios.length === 0 && !showNuevo && (
          <div className="py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary mx-auto mb-3">
              <ZapIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Sin servicios aún</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">Agrega los servicios o productos que ofreces.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabHorarios({
  horarios, setHorarios,
}: {
  horarios: Horario[];
  setHorarios: React.Dispatch<React.SetStateAction<Horario[]>>;
}) {
  const [saved, setSaved] = useState(false);

  const toggle = (dia: DiaSemana) =>
    setHorarios((prev) => prev.map((h) => h.dia === dia ? { ...h, abierto: !h.abierto } : h));

  const update = (dia: DiaSemana, field: "abre" | "cierra", value: string) =>
    setHorarios((prev) => prev.map((h) => h.dia === dia ? { ...h, [field]: value } : h));

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold">Horarios de atención</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {horarios.filter(h => h.abierto).length} días activos
        </p>
      </div>
      <div className="divide-y divide-border">
        {horarios.map((h) => (
          <div key={h.dia} className="flex items-center gap-3 px-5 py-3 flex-wrap">
            <div className="w-[88px] shrink-0">
              <p className={cn("text-[12px] font-semibold", h.abierto ? "text-foreground" : "text-muted-foreground")}>
                {h.label}
              </p>
            </div>
            <Toggle checked={h.abierto} onChange={() => toggle(h.dia)} />
            {h.abierto ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={h.abre}
                  onChange={(e) => update(h.dia, "abre", e.target.value)}
                  className="rounded-xl border border-border bg-secondary px-2.5 py-1.5 text-[12px] outline-none focus:border-brand-orange/50 focus:bg-white transition-all"
                />
                <span className="text-[11px] text-muted-foreground">—</span>
                <input
                  type="time"
                  value={h.cierra}
                  onChange={(e) => update(h.dia, "cierra", e.target.value)}
                  className="rounded-xl border border-border bg-secondary px-2.5 py-1.5 text-[12px] outline-none focus:border-brand-orange/50 focus:bg-white transition-all"
                />
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground italic">Cerrado</span>
            )}
          </div>
        ))}
      </div>
      <div className="px-5 py-4 border-t border-border flex justify-end">
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold transition-all",
            saved
              ? "bg-brand-teal/10 text-brand-teal"
              : "bg-brand-orange text-white hover:bg-brand-orange/90 shadow-sm"
          )}
        >
          {saved ? <CheckCircle2Icon className="h-3.5 w-3.5" /> : <SaveIcon className="h-3.5 w-3.5" />}
          {saved ? "¡Guardado!" : "Guardar horarios"}
        </button>
      </div>
    </div>
  );
}

function TabOferta() {
  const [activa,    setActiva]   = useState(true);
  const [texto,     setTexto]    = useState("1 Coca gratis");
  const [desc,      setDesc]     = useState("Para clientes que lleguen por Hazlo Cash");
  const [vence,     setVence]    = useState("2026-04-30");
  const [saved,     setSaved]    = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">Oferta para clientes Hazlo Cash</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Los clientes que lleguen por recomendación verán esta oferta.
            </p>
          </div>
          <Toggle checked={activa} onChange={setActiva} />
        </div>

        {activa && (
          <div className="space-y-3 pt-1">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Título de la oferta *
                </label>
                <input
                  type="text"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="ej. 1 Coca gratis"
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-[13px] outline-none focus:border-brand-orange/50 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Vence el
                </label>
                <input
                  type="date"
                  value={vence}
                  onChange={(e) => setVence(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-[13px] outline-none focus:border-brand-orange/50 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Descripción
              </label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="ej. Para clientes que lleguen por Hazlo Cash"
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-[13px] outline-none focus:border-brand-orange/50 focus:bg-white transition-all"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold transition-all",
              saved
                ? "bg-brand-teal/10 text-brand-teal"
                : "bg-brand-orange text-white hover:bg-brand-orange/90 shadow-sm"
            )}
          >
            {saved ? <CheckCircle2Icon className="h-3.5 w-3.5" /> : <SaveIcon className="h-3.5 w-3.5" />}
            {saved ? "¡Guardado!" : "Guardar oferta"}
          </button>
        </div>
      </div>

      {/* Preview */}
      {activa && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Vista previa de la oferta
          </p>
          <div
            className="rounded-2xl p-4 text-white"
            style={{ background: "linear-gradient(135deg, var(--brand-orange) 0%, #F5C842 100%)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <ZapIcon className="h-3 w-3" />
              <p className="text-[10px] font-bold uppercase tracking-wider">Oferta exclusiva Hazlo Cash</p>
            </div>
            <p className="text-base font-black leading-tight">{texto || "Título de la oferta"}</p>
            <p className="text-[11px] text-white/75 mt-0.5">{desc || "Descripción"}</p>
            {vence && (
              <p className="text-[10px] text-white/60 mt-2">
                Vence: {new Date(vence + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PerfilNegocioPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  // Estado global del perfil (compartido entre tabs para el completeness)
  const [nombre,      setNombre]      = useState("Tacos El Güero");
  const [categoria,   setCategoria]   = useState("Comida");
  const [descripcion, setDescripcion] = useState("Los mejores tacos al pastor de Villahermosa. Más de 20 años de tradición tabasqueña. Servicio rápido y precios justos.");
  const [telefono,    setTelefono]    = useState("+52 993 456 7890");
  const [direccion,   setDireccion]   = useState("Av. Méndez 245, Col. Centro, Villahermosa, Tab.");
  const [horarios,    setHorarios]    = useState<Horario[]>(horariosInit);
  const [servicios,   setServicios]   = useState<Servicio[]>(serviciosInit);

  const completenessItems = [
    { label: "Nombre",          done: !!nombre                 },
    { label: "Categoría",       done: !!categoria              },
    { label: "Descripción",     done: descripcion.length > 20  },
    { label: "Teléfono",        done: !!telefono               },
    { label: "Dirección",       done: !!direccion              },
    { label: "Foto de portada", done: false                    },
    { label: "Servicios",       done: servicios.length > 0     },
    { label: "Horarios",        done: horarios.some(h => h.abierto) },
    { label: "Oferta Hazlo",    done: true                     },
  ];
  const pct = Math.round((completenessItems.filter(i => i.done).length / completenessItems.length) * 100);

  return (
    <>
      <NegocioHeader activeHref="/negocio/perfil" />

      <div className="flex flex-1 min-h-0 gap-0">

        {/* ── Main content ── */}
        <div className="flex flex-1 flex-col min-w-0 overflow-auto">

          {/* Sub-header con tabs de sección */}
          <div className="sticky top-0 z-[5] bg-white border-b border-border px-4 sm:px-6">

            {/* Breadcrumb + title */}
            <div className="flex items-center justify-between py-4 flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-1">
                  <span className="text-brand-orange">Negocio</span>
                  <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Mi Negocio</span>
                </div>
                <h1 className="text-xl font-black text-foreground leading-none">Mi Negocio</h1>
              </div>
              <button className="flex items-center gap-1.5 rounded-xl bg-secondary hover:bg-border px-3.5 py-2 text-[12px] font-semibold text-muted-foreground transition-colors">
                <EyeIcon className="h-3.5 w-3.5" />
                Ver perfil público
              </button>
            </div>

            {/* Section tabs */}
            <div className="flex items-center gap-0 -mb-px">
              {sectionTabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={cn(
                    "relative flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold transition-colors border-b-2",
                    activeTab === t.key
                      ? "text-foreground border-brand-orange"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-4 sm:p-6 flex flex-col gap-4">
            {activeTab === "info" && (
              <TabInfo
                nombre={nombre} setNombre={setNombre}
                categoria={categoria} setCategoria={setCategoria}
                descripcion={descripcion} setDescripcion={setDescripcion}
                telefono={telefono} setTelefono={setTelefono}
                direccion={direccion} setDireccion={setDireccion}
              />
            )}
            {activeTab === "servicios" && (
              <TabServicios servicios={servicios} setServicios={setServicios} />
            )}
            {activeTab === "horarios" && (
              <TabHorarios horarios={horarios} setHorarios={setHorarios} />
            )}
            {activeTab === "oferta" && <TabOferta />}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="hidden lg:flex w-[270px] xl:w-[290px] shrink-0 flex-col border-l border-border bg-background overflow-auto">
          <div className="flex flex-col gap-4 p-5">

            {/* Completeness */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Completitud</h3>
                <span className={cn(
                  "text-xs font-black",
                  pct === 100 ? "text-brand-teal" : "text-brand-orange"
                )}>{pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden mb-4">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: pct === 100 ? "var(--brand-teal)" : "linear-gradient(90deg, var(--brand-orange), #F5C842)",
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                {completenessItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={cn(
                      "h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 text-[8px]",
                      item.done ? "bg-brand-teal/15 text-brand-teal" : "bg-border text-muted-foreground"
                    )}>
                      {item.done ? "✓" : "·"}
                    </div>
                    <span className={cn(
                      "text-[11px]",
                      item.done ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vista previa */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Vista previa pública</h3>
                <button className="text-[11px] text-brand-purple font-medium hover:underline flex items-center gap-0.5">
                  Abrir <ExternalLinkIcon className="h-2.5 w-2.5" />
                </button>
              </div>
              <div className="rounded-2xl border border-border bg-white overflow-hidden">
                {/* Banner */}
                <div
                  className="h-16 flex items-center px-4 gap-3"
                  style={{ background: "linear-gradient(135deg, #1A1840 0%, #2D2B8F 100%)" }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange text-sm font-black text-white shrink-0">
                    TG
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-black text-white truncate">{nombre || "Nombre del negocio"}</p>
                    <p className="text-[10px] text-white/50">{categoria} · Villahermosa</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 ml-auto">
                    <StarIcon className="h-3 w-3 fill-brand-orange text-brand-orange" />
                    <span className="text-[11px] font-bold text-white">4.8</span>
                  </div>
                </div>
                {/* Body */}
                <div className="px-4 py-3 space-y-2">
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {descripcion || "Sin descripción todavía."}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <ShieldCheckIcon className="h-3 w-3 text-brand-teal" />
                    <span className="text-brand-teal font-semibold">Verificado</span>
                    <span>·</span>
                    <UsersIcon className="h-3 w-3" />
                    <span>7 embajadores</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Rendimiento del perfil</h3>
              <div className="rounded-2xl border border-border bg-white p-4 space-y-3">
                {[
                  { label: "Visitas este mes",     value: "248",  icon: EyeIcon,        color: "text-brand-purple", bg: "bg-brand-purple/8" },
                  { label: "Solicitudes recibidas", value: "24",  icon: TrendingUpIcon,  color: "text-brand-teal",   bg: "bg-brand-teal/8"   },
                  { label: "Tasa de conversión",   value: "9.7%", icon: ZapIcon,        color: "text-brand-orange", bg: "bg-brand-orange/8" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl shrink-0", stat.bg)}>
                      <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      <p className="text-sm font-black text-foreground">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* URL */}
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-[11px] font-semibold text-muted-foreground mb-2">Tu URL pública</p>
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
                <code className="text-[11px] text-brand-purple font-mono flex-1 truncate">
                  hazlocash.mx/b/tacos-el-guero
                </code>
                <ExternalLinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
