
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHasPermission } from "@/hooks/use-permissions";
import {
    Add as Add01Icon,
    KeyboardArrowDown as ArrowDown01Icon,
    CalendarMonth as Calendar01Icon,
    FileUpload as Download01Icon,
    Menu as SidebarLeft01Icon
} from "@mui/icons-material";

interface HolidaysHeaderProps {
  onAddClick: () => void;
  onImportClick: () => void;
}

export function HolidaysHeader({ onAddClick, onImportClick }: HolidaysHeaderProps) {
  const canManage = useHasPermission("holidays.manage");
  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 bg-background">
      <SidebarTrigger className="lg:hidden">
        <SidebarLeft01Icon className="size-5" />
      </SidebarTrigger>

      <Calendar01Icon className="size-5" />
      <h1 className="flex-1 font-medium text-base">Holidays</h1>

      <span className="hidden sm:block text-sm text-muted-foreground">
        Last update 12 min ago
      </span>

      <div className="hidden sm:block h-6 w-px bg-border" />

      {canManage && (
        <>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2" onClick={onImportClick}>
            <Download01Icon className="size-5" />
            Import Holidays
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="hidden sm:flex gap-2">
                <Add01Icon className="size-5" />
                New
                <ArrowDown01Icon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onAddClick}>
                New Holiday
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </header>
  );
}

