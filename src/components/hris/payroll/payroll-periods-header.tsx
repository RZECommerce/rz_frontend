
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    Add as Add01Icon,
    CalendarMonth as Calendar01Icon,
    Menu as SidebarLeft01Icon,
} from "@mui/icons-material";

interface PayrollPeriodsHeaderProps {
  onAddClick: () => void;
}

export function PayrollPeriodsHeader({ onAddClick }: PayrollPeriodsHeaderProps) {
  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <SidebarTrigger className="lg:hidden">
        <SidebarLeft01Icon className="size-5" />
      </SidebarTrigger>

      <Calendar01Icon className="size-5" />
      <h1 className="flex-1 font-medium text-base">Payroll Periods</h1>

      <span className="hidden sm:block text-sm text-muted-foreground">
        Last update 1 min ago
      </span>

      <Button
        size="sm"
        className="gap-2 bg-foreground text-background hover:bg-foreground/90"
        onClick={onAddClick}
      >
        <Add01Icon className="size-5" />
        New Period
      </Button>
    </header>
  );
}

