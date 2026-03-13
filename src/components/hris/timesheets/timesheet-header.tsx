
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
    <header className="flex w-full items-center gap-3 border-b bg-background px-4 py-4 font-sans sm:px-6">
      <SidebarTrigger className="lg:hidden">
        <SidebarLeft01Icon className="size-5" />
      </SidebarTrigger>

      <div className="rounded-xl bg-primary/10 p-2 text-primary">
        <Calendar01Icon className="size-5" />
      </div>
      <h1 className="flex-1 text-base font-medium">Timesheets</h1>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousWeek}
          className="gap-2 border-primary/20 hover:bg-primary/5"
        >
          <ArrowLeft01Icon className="size-5" />
          Previous
        </Button>
        <div className="rounded-md bg-primary/5 px-3 py-1.5 text-sm font-medium text-foreground ring-1 ring-inset ring-primary/15">
          {formatDate(weekStart)} - {formatDate(weekEnd)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextWeek}
          className="gap-2 border-primary/20 hover:bg-primary/5"
        >
          Next
          <ArrowRight01Icon className="size-5" />
        </Button>
      </div>

      {canExport && (
        <>
          <div className="hidden sm:block h-6 w-px bg-border" />

          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 border-primary/20 hover:bg-primary/5 sm:flex"
            onClick={onExport}
          >
            <FileExportIcon className="size-5" />
            Export
          </Button>
        </>
      )}
    </header>
  );
}

