import { ChevronRightIcon } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OrdenesPanel } from "@/components/admin/OrdenesPanel";
import { ADMIN_TABS } from "@/lib/adminNav";
import {
  requireAdmin,
  getOrdenesAdmin,
  getCodigosActivos,
  getUsuariosMin,
} from "@/lib/services/admin";

export const dynamic = "force-dynamic";

export default async function AdminOrdenesPage() {
  const admin = await requireAdmin();
  const [ordenes, codigos, clientes] = await Promise.all([
    getOrdenesAdmin(),
    getCodigosActivos(),
    getUsuariosMin(),
  ]);

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
            <span className="text-muted-foreground">Órdenes</span>
          </div>

          <OrdenesPanel ordenes={ordenes} codigos={codigos} clientes={clientes} />
        </div>
      </div>
    </>
  );
}
