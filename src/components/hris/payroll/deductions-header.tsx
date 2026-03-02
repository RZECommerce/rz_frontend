
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    Add as Add01Icon,
    Receipt as Invoice01Icon,
    Menu as SidebarLeft01Icon,
} from "@mui/icons-material";

interface DeductionsHeaderProps {
  onAddClick: () => void;
}

export function DeductionsHeader({ onAddClick }: DeductionsHeaderProps) {
  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <SidebarTrigger className="lg:hidden">
        <SidebarLeft01Icon className="size-5" />
      </SidebarTrigger>

      <Invoice01Icon className="size-5" />
      <h1 className="flex-1 font-medium text-base">Deductions</h1>

      <Button
        size="sm"
        className="gap-2 bg-foreground text-background hover:bg-foreground/90"
        onClick={onAddClick}
      >
        <Add01Icon className="size-5" />
        New Deduction
      </Button>
    </header>
  );
}

