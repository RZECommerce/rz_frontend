
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHasPermission } from "@/hooks/use-permissions";
import {
    ArrowBack as ArrowLeft01Icon,
    ArrowForward as ArrowRight01Icon,
    CalendarMonth as Calendar01Icon,
    FileUpload as FileExportIcon,
    Menu as SidebarLeft01Icon,
} from "@mui/icons-material";

interface TimesheetHeaderProps {
  weekStart: string;
  weekEnd: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onExport: () => void;
}

export function TimesheetHeader({
  weekStart,
  weekEnd,
  onPreviousWeek,
  onNextWeek,
  onExport,
}: TimesheetHeaderProps) {
  const canView = useHasPermission("timesheets.view");
  const canManage = useHasPermission("timesheets.manage");
  const canExport = canView || canManage;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <SidebarTrigger className="lg:hidden">
        <SidebarLeft01Icon className="size-5" />
      </SidebarTrigger>

      <Calendar01Icon className="size-5" />
      <h1 className="flex-1 font-medium text-base">Timesheets</h1>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousWeek}
          className="gap-2"
        >
          <ArrowLeft01Icon className="size-5" />
          Previous
        </Button>
        <div className="px-3 py-1.5 text-sm font-medium bg-muted rounded-md">
          {formatDate(weekStart)} - {formatDate(weekEnd)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextWeek}
          className="gap-2"
        >
          Next
          <ArrowRight01Icon className="size-5" />
        </Button>
      </div>

      {canExport && (
        <>
          <div className="hidden sm:block h-6 w-px bg-border" />

          <Button variant="outline" size="sm" className="hidden sm:flex gap-2" onClick={onExport}>
            <FileExportIcon className="size-5" />
            Export
          </Button>
        </>
      )}
    </header>
  );
}

