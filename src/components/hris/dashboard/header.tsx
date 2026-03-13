
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    Dashboard as DashboardSquare01Icon,
    Menu as SidebarLeft01Icon,
} from "@mui/icons-material";

export function DashboardHeader() {
  return (
    <header className="flex w-full items-center gap-3 bg-background px-4 py-4 font-sans sm:px-6">
      <SidebarTrigger className="lg:hidden">
        <SidebarLeft01Icon className="size-5" />
      </SidebarTrigger>

      <DashboardSquare01Icon className="size-5" />
      <h1 className="flex-1 font-medium text-base">Dashboard</h1>

      <span className="hidden sm:block text-sm text-muted-foreground">
        Last update 12 min ago
      </span>

      <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
        Export
      </Button>
    </header>
  );
}
