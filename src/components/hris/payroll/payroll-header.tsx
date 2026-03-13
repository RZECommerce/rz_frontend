
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PesoIcon } from "@/components/shared/peso-icon";
import {
    Menu as SidebarLeft01Icon
} from "@mui/icons-material";

interface PayrollHeaderProps {}

export function PayrollHeader({}: PayrollHeaderProps) {
  return (
    <header className="flex w-full items-center gap-3 bg-background px-4 py-4 font-sans sm:px-6">
      <SidebarTrigger className="lg:hidden">
        <SidebarLeft01Icon className="size-5" />
      </SidebarTrigger>

      <div className="rounded-xl bg-primary/10 p-2 text-primary">
        <PesoIcon className="size-5 text-lg" />
      </div>
      <h1 className="flex-1 text-base font-medium">Payroll Management</h1>

      <span className="hidden text-sm text-muted-foreground sm:block">
        Last update 1 min ago
      </span>
    </header>
  );
}

