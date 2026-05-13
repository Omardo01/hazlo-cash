import { TooltipProvider } from "@/components/ui/tooltip";
import { NegocioSidebar } from "@/components/dashboard/NegocioSidebar";

export default function NegocioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <NegocioSidebar />
        {/* Main content — on mobile add bottom padding for the bottom nav bar */}
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden pb-24 md:pb-0">
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}
