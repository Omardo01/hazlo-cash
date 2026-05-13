"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  MapPinIcon,
  ChevronRightIcon,
  SearchIcon,
  FilterIcon,
  MoreVerticalIcon,
  StarIcon,
  PlusIcon,
  BuildingIcon,
  PhoneIcon,
  MailIcon,
  UserIcon,
  CreditCardIcon,
  PercentIcon,
  ChevronDownIcon,
  CheckIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const adminTabs = [
  { label: "Overview",  href: "/admin" },
  { label: "Usuarios",  href: "/admin/users" },
  { label: "Negocios",  href: "/admin/negocios" },
  { label: "Finanzas",  href: "/admin/finanzas" },
];

const CATEGORIAS = [
  "Comida",
  "Restaurante",
  "Servicios",
  "Salud",
  "Belleza",
  "Mecánica",
  "Electricidad",
  "Plomería",
  "Educación",
  "Otro",
];

type Negocio = {
  id: string;
  name: string;
  category: string;
  city: string;
  rating: number;
  rev: string;
  status: "verified" | "pending" | "rejected";
  iconBg: string;
};

const ICON_COLORS = [
  "bg-brand-orange",
  "bg-indigo-500",
  "bg-brand-dark",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-brand-purple",
  "bg-brand-teal",
];

const initialData: Negocio[] = [
  { id: "NEG-01", name: "Tacos El Güero",  category: "Comida",      city: "Villahermosa", rating: 4.8, rev: "$18,450", status: "verified", iconBg: "bg-brand-orange" },
  { id: "NEG-02", name: "Sushi Go",         category: "Restaurante", city: "Monterrey",    rating: 4.5, rev: "$42,100", status: "verified", iconBg: "bg-indigo-500"   },
  { id: "NEG-03", name: "BarberShop X",     category: "Servicios",   city: "CDMX",         rating: 4.9, rev: "$12,300", status: "pending",  iconBg: "bg-brand-dark"   },
  { id: "NEG-04", name: "Pizzería Roma",    category: "Comida",      city: "Guadalajara",  rating: 4.2, rev: "$8,900",  status: "verified", iconBg: "bg-rose-500"     },
  { id: "NEG-05", name: "Gym Fit Life",     category: "Salud",       city: "Puebla",       rating: 4.7, rev: "$25,000", status: "rejected", iconBg: "bg-emerald-500"  },
];

type FormState = {
  nombre: string;
  categoria: string;
  ciudad: string;
  telefono: string;
  email: string;
  responsable: string;
  clabe: string;
  comision: string;
  descripcion: string;
};

const emptyForm: FormState = {
  nombre: "",
  categoria: "",
  ciudad: "",
  telefono: "",
  email: "",
  responsable: "",
  clabe: "",
  comision: "10",
  descripcion: "",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
      {children}
    </label>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
      {children}
    </div>
  );
}

export default function AdminNegociosPage() {
  const [negocios, setNegocios] = useState<Negocio[]>(initialData);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);
  const [query, setQuery] = useState("");

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<FormState> = {};
    if (!form.nombre.trim())      newErrors.nombre      = "Requerido";
    if (!form.categoria)          newErrors.categoria   = "Requerido";
    if (!form.ciudad.trim())      newErrors.ciudad      = "Requerido";
    if (!form.telefono.trim())    newErrors.telefono    = "Requerido";
    if (!form.email.trim())       newErrors.email       = "Requerido";
    if (!form.responsable.trim()) newErrors.responsable = "Requerido";
    if (form.clabe.trim() && form.clabe.replace(/\s/g, "").length !== 18)
      newErrors.clabe = "La CLABE debe tener 18 dígitos";
    const comNum = parseFloat(form.comision);
    if (isNaN(comNum) || comNum < 1 || comNum > 30)
      newErrors.comision = "Entre 1 y 30%";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const newId = `NEG-${String(negocios.length + 1).padStart(2, "0")}`;
    const colorIndex = negocios.length % ICON_COLORS.length;
    const nuevo: Negocio = {
      id: newId,
      name: form.nombre.trim(),
      category: form.categoria,
      city: form.ciudad.trim(),
      rating: 0,
      rev: "$0",
      status: "pending",
      iconBg: ICON_COLORS[colorIndex],
    };
    setNegocios((prev) => [nuevo, ...prev]);
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setForm(emptyForm);
      setErrors({});
    }, 1800);
  }

  function handleOpenChange(val: boolean) {
    if (!val) {
      setForm(emptyForm);
      setErrors({});
      setSubmitted(false);
    }
    setOpen(val);
  }

  const filtered = negocios.filter(
    (n) =>
      n.name.toLowerCase().includes(query.toLowerCase()) ||
      n.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <DashboardHeader
        title="Admin"
        tabs={adminTabs}
        userName="Super Admin"
        userInitials="SA"
        avatarColor="bg-brand-dark text-white"
        notificationColor="bg-brand-dark"
      />

      <div className="flex flex-1 min-h-0 gap-0 bg-[#fbfbfd]">
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 min-w-0 overflow-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <span className="text-brand-dark">Admin</span>
            <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Negocios</span>
          </div>

          {/* Page header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
                <MapPinIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground leading-none">Negocios</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  {negocios.length} proveedores registrados
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-brand-orange text-white text-[12px] font-semibold hover:bg-brand-orange/90 transition-colors"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dar de Alta Negocio</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>

          {/* Table card */}
          <div className="rounded-2xl border border-border bg-white flex flex-col">
            <div className="border-b border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar nombre o ID..."
                  className="h-9 w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-3 text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
                />
              </div>
              <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-xs font-medium hover:bg-secondary">
                <FilterIcon className="h-3.5 w-3.5" />
                Filtrar por Estado
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-[1fr_120px_100px_100px_100px_40px] gap-4 px-5 py-3 border-b border-border bg-secondary/30">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Negocio</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Ubicación</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">Calificación</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-right">Volumen</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">Estado</span>
                  <span></span>
                </div>

                {filtered.length === 0 && (
                  <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No se encontraron negocios.
                  </div>
                )}

                {filtered.map((neg) => (
                  <div
                    key={neg.id}
                    className="grid grid-cols-[1fr_120px_100px_100px_100px_40px] gap-4 items-center px-5 py-4 border-b border-border/50 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white", neg.iconBg)}>
                        {neg.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{neg.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{neg.id} · {neg.category}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{neg.city}</div>
                    <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                      {neg.rating > 0 ? (
                        <>
                          <StarIcon className="h-3 w-3 text-brand-orange fill-brand-orange" />
                          {neg.rating}
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </div>
                    <div className="text-right font-bold text-sm text-foreground">{neg.rev}</div>
                    <div className="flex justify-center">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                        neg.status === "verified" ? "bg-emerald-500/10 text-emerald-500" :
                        neg.status === "rejected" ? "bg-red-500/10 text-red-500" :
                        "bg-brand-orange/10 text-brand-orange"
                      )}>
                        {neg.status === "verified" ? "Verificado" : neg.status === "rejected" ? "Rechazado" : "Pendiente"}
                      </span>
                    </div>
                    <button className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-secondary text-muted-foreground">
                      <MoreVerticalIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Drawer: Dar de Alta Negocio ── */}
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-[480px] overflow-y-auto p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <BuildingIcon className="h-4 w-4" />
              </div>
              <div>
                <SheetTitle className="text-base font-black text-foreground">Dar de Alta Negocio</SheetTitle>
                <SheetDescription className="text-xs mt-0.5">
                  El negocio quedará en estado <span className="font-semibold text-brand-orange">Pendiente</span> hasta su verificación.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckIcon className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-base font-black text-foreground">¡Negocio registrado!</p>
              <p className="text-sm text-muted-foreground text-center">
                Se creó con estado <span className="font-semibold text-brand-orange">Pendiente</span>. Revísalo en la lista.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 px-6 py-5">

              {/* Sección: Datos del negocio */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-purple mb-3">Datos del Negocio</p>
                <div className="flex flex-col gap-3">

                  <div>
                    <FieldLabel>Nombre del Negocio *</FieldLabel>
                    <Field icon={<BuildingIcon className="h-3.5 w-3.5" />}>
                      <input
                        value={form.nombre}
                        onChange={(e) => handleChange("nombre", e.target.value)}
                        placeholder="Ej. Tacos El Güero"
                        className={cn(
                          "h-9 w-full rounded-lg border bg-secondary/30 pl-9 pr-3 text-sm focus:outline-none focus:ring-1",
                          errors.nombre
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                            : "border-border focus:border-brand-purple focus:ring-brand-purple"
                        )}
                      />
                    </Field>
                    {errors.nombre && <p className="mt-1 text-[11px] text-red-500">{errors.nombre}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Categoría *</FieldLabel>
                      <div className="relative">
                        <select
                          value={form.categoria}
                          onChange={(e) => handleChange("categoria", e.target.value)}
                          className={cn(
                            "h-9 w-full appearance-none rounded-lg border bg-secondary/30 pl-3 pr-8 text-sm focus:outline-none focus:ring-1",
                            errors.categoria
                              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                              : "border-border focus:border-brand-purple focus:ring-brand-purple"
                          )}
                        >
                          <option value="">Seleccionar</option>
                          {CATEGORIAS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                      {errors.categoria && <p className="mt-1 text-[11px] text-red-500">{errors.categoria}</p>}
                    </div>

                    <div>
                      <FieldLabel>Ciudad *</FieldLabel>
                      <Field icon={<MapPinIcon className="h-3.5 w-3.5" />}>
                        <input
                          value={form.ciudad}
                          onChange={(e) => handleChange("ciudad", e.target.value)}
                          placeholder="Villahermosa"
                          className={cn(
                            "h-9 w-full rounded-lg border bg-secondary/30 pl-9 pr-3 text-sm focus:outline-none focus:ring-1",
                            errors.ciudad
                              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                              : "border-border focus:border-brand-purple focus:ring-brand-purple"
                          )}
                        />
                      </Field>
                      {errors.ciudad && <p className="mt-1 text-[11px] text-red-500">{errors.ciudad}</p>}
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Descripción (opcional)</FieldLabel>
                    <textarea
                      value={form.descripcion}
                      onChange={(e) => handleChange("descripcion", e.target.value)}
                      placeholder="Breve descripción del negocio o servicio..."
                      rows={3}
                      className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Sección: Contacto */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-purple mb-3">Contacto</p>
                <div className="flex flex-col gap-3">

                  <div>
                    <FieldLabel>Nombre del Responsable *</FieldLabel>
                    <Field icon={<UserIcon className="h-3.5 w-3.5" />}>
                      <input
                        value={form.responsable}
                        onChange={(e) => handleChange("responsable", e.target.value)}
                        placeholder="Juan Pérez"
                        className={cn(
                          "h-9 w-full rounded-lg border bg-secondary/30 pl-9 pr-3 text-sm focus:outline-none focus:ring-1",
                          errors.responsable
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                            : "border-border focus:border-brand-purple focus:ring-brand-purple"
                        )}
                      />
                    </Field>
                    {errors.responsable && <p className="mt-1 text-[11px] text-red-500">{errors.responsable}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Teléfono *</FieldLabel>
                      <Field icon={<PhoneIcon className="h-3.5 w-3.5" />}>
                        <input
                          value={form.telefono}
                          onChange={(e) => handleChange("telefono", e.target.value)}
                          placeholder="993 123 4567"
                          className={cn(
                            "h-9 w-full rounded-lg border bg-secondary/30 pl-9 pr-3 text-sm focus:outline-none focus:ring-1",
                            errors.telefono
                              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                              : "border-border focus:border-brand-purple focus:ring-brand-purple"
                          )}
                        />
                      </Field>
                      {errors.telefono && <p className="mt-1 text-[11px] text-red-500">{errors.telefono}</p>}
                    </div>

                    <div>
                      <FieldLabel>Email *</FieldLabel>
                      <Field icon={<MailIcon className="h-3.5 w-3.5" />}>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="negocio@email.com"
                          className={cn(
                            "h-9 w-full rounded-lg border bg-secondary/30 pl-9 pr-3 text-sm focus:outline-none focus:ring-1",
                            errors.email
                              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                              : "border-border focus:border-brand-purple focus:ring-brand-purple"
                          )}
                        />
                      </Field>
                      {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Sección: Pagos */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-purple mb-3">Pagos y Comisiones</p>
                <div className="flex flex-col gap-3">

                  <div>
                    <FieldLabel>CLABE Interbancaria (opcional)</FieldLabel>
                    <Field icon={<CreditCardIcon className="h-3.5 w-3.5" />}>
                      <input
                        value={form.clabe}
                        onChange={(e) => handleChange("clabe", e.target.value.replace(/\D/g, "").slice(0, 18))}
                        placeholder="18 dígitos"
                        maxLength={18}
                        className={cn(
                          "h-9 w-full rounded-lg border bg-secondary/30 pl-9 pr-3 text-sm font-mono focus:outline-none focus:ring-1",
                          errors.clabe
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                            : "border-border focus:border-brand-purple focus:ring-brand-purple"
                        )}
                      />
                    </Field>
                    {errors.clabe
                      ? <p className="mt-1 text-[11px] text-red-500">{errors.clabe}</p>
                      : <p className="mt-1 text-[11px] text-muted-foreground">{form.clabe.length}/18 dígitos</p>
                    }
                  </div>

                  <div>
                    <FieldLabel>Comisión para Hazlo Cash (%) *</FieldLabel>
                    <Field icon={<PercentIcon className="h-3.5 w-3.5" />}>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={form.comision}
                        onChange={(e) => handleChange("comision", e.target.value)}
                        className={cn(
                          "h-9 w-full rounded-lg border bg-secondary/30 pl-9 pr-3 text-sm focus:outline-none focus:ring-1",
                          errors.comision
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                            : "border-border focus:border-brand-purple focus:ring-brand-purple"
                        )}
                      />
                    </Field>
                    {errors.comision
                      ? <p className="mt-1 text-[11px] text-red-500">{errors.comision}</p>
                      : <p className="mt-1 text-[11px] text-muted-foreground">Porcentaje que Hazlo Cash retiene por transacción (1–30%).</p>
                    }
                  </div>
                </div>
              </div>

            </div>
          )}

          {!submitted && (
            <SheetFooter className="px-6 pb-6 pt-4 border-t border-border sticky bottom-0 bg-white">
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => handleOpenChange(false)}
                  className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 h-10 rounded-xl bg-brand-orange text-white text-sm font-semibold hover:bg-brand-orange/90 transition-colors"
                >
                  Dar de Alta
                </button>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
