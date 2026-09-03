import { UsersIcon, ChevronRightIcon } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UsuariosTabla } from "@/components/admin/UsuariosTabla";
import { ADMIN_TABS } from "@/lib/adminNav";
import { requireAdmin, getUsuariosAdmin } from "@/lib/services/admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const usuarios = await getUsuariosAdmin();

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
            <span className="text-muted-foreground">Usuarios</span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                <UsersIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground leading-none">Directorio</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  {usuarios.length} usuarios registrados
                </p>
              </div>
            </div>
          </div>

          <UsuariosTabla usuarios={usuarios} />
        </div>
      </div>
    </>
  );
}
