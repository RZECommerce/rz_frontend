
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHasPermission } from "@/hooks/use-permissions";
import {
    Add as Add01Icon,
    ArrowDropDown as ArrowDown01Icon,
    CalendarToday as Calendar01Icon,
    FileUpload as FileExportIcon,
    Menu as SidebarLeft01Icon,
} from "@mui/icons-material";

interface AttendanceHeaderProps {
  onAddClick: () => void;
}

export function AttendanceHeader({ onAddClick }: AttendanceHeaderProps) {
  const canCreate = useHasPermission("attendance.create");
  const canExport = useHasPermission("attendance.export");

  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 bg-background">
      <SidebarTrigger className="lg:hidden">
        <SidebarLeft01Icon className="size-5" />
      </SidebarTrigger>

      <Calendar01Icon className="size-5" />
      <h1 className="flex-1 font-medium text-base">Attendance</h1>

      <span className="hidden sm:block text-sm text-muted-foreground">
        Last update 12 min ago
      </span>

      <div className="hidden sm:block h-6 w-px bg-border" />

      {canExport && (
        <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
          <FileExportIcon className="size-5" />
          Export
        </Button>
      )}

      {canCreate && (
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
              New Attendance Record
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Bulk Import</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}

