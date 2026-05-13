import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/dashboard/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar />
        {/* Main content — on mobile add bottom padding for the bottom nav bar */}
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden pb-24 md:pb-0">
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}
