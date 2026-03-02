
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PesoIcon } from "@/components/shared/peso-icon";
import { useHasPermission } from "@/hooks/use-permissions";
import {
    Add as Add01Icon,
    Menu as SidebarLeft01Icon
} from "@mui/icons-material";

interface PayrollHeaderProps {}

export function PayrollHeader({}: PayrollHeaderProps) {
  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 bg-background">
      <SidebarTrigger className="lg:hidden">
        <SidebarLeft01Icon className="size-5" />
      </SidebarTrigger>

      <PesoIcon className="size-5 text-lg" />
      <h1 className="flex-1 font-medium text-base">Payroll Management</h1>

      <span className="hidden sm:block text-sm text-muted-foreground">
        Last update 1 min ago
      </span>
    </header>
  );
}

