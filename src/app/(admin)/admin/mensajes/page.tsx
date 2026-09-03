import { ChevronRightIcon, MessageSquareIcon, ShieldCheckIcon } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ADMIN_TABS } from "@/lib/adminNav";
import { requireAdmin } from "@/lib/services/admin";

export const dynamic = "force-dynamic";

export default async function AdminMensajesPage() {
  const admin = await requireAdmin();

  return (
    <>
      <DashboardHeader
        title="Admin"
        tabs={ADMIN_TABS}
        userName={admin.nombre}
        userInitials={admin.iniciales}
        avatarColor="bg-brand-dark text-white"
        notificationColor="bg-brand-dark"
      />
      <div className="flex flex-1 min-h-0 gap-0 bg-[#fbfbfd]">
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 min-w-0 overflow-auto">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <span className="text-brand-dark">Admin</span>
            <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Mensajes</span>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="max-w-md rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-dark/10 text-brand-dark">
                <MessageSquareIcon className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-lg font-black tracking-tight text-foreground">
                Chat mediado — próximamente
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Aquí se moderará la comunicación entre clientes y negocios. Toda la
                conversación pasa por la plataforma para proteger los datos de contacto
                y sostener el modelo anti-bypass.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-teal/10 px-3 py-1.5 text-[11px] font-semibold text-brand-teal">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                Requiere backend de chat en tiempo real
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
