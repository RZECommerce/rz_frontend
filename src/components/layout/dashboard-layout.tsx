import { DashboardSidebar } from "@/components/hris/dashboard/sidebar";
import { GlobalHeader } from "@/components/layout/global-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider className="bg-sidebar font-sans">
      <DashboardSidebar />
      <SidebarInset className="h-svh overflow-hidden w-full bg-background">
        <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden font-sans">
          <GlobalHeader />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
