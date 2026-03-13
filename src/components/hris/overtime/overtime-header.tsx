
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHasPermission } from "@/hooks/use-permissions";
import {
    AccessTime as Clock01Icon,
    FileUpload as FileExportIcon,
    Menu as SidebarLeft01Icon
} from "@mui/icons-material";

interface OvertimeHeaderProps {
  onExport: () => void;
}

export function OvertimeHeader({ onExport }: OvertimeHeaderProps) {
  const canView = useHasPermission("overtime.view");
  const canManage = useHasPermission("overtime.manage");
  const canExport = canView || canManage;

  return (
    <div className="flex items-center justify-between font-sans">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="lg:hidden">
          <SidebarLeft01Icon className="size-5" />
        </SidebarTrigger>

        <div className="rounded-xl bg-primary/10 p-2 text-primary">
          <Clock01Icon className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Overtime Management</h1>
          <p className="text-muted-foreground">
            View attendance overtime, manage requests, and track approvals
          </p>
        </div>
      </div>

      {canExport && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-primary/20 hover:bg-primary/5"
          onClick={onExport}
        >
          <FileExportIcon className="size-5" />
          Export
        </Button>
      )}
    </div>
  );
}

