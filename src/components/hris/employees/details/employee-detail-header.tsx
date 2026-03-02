
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { StatusBadge } from "@/lib/utils/status-badge";
import type { Employee } from "@/types/employee";
import {
    ChevronLeft as ArrowLeft01Icon,
    Edit as Edit01Icon,
    Menu as SidebarLeft01Icon,
} from "@mui/icons-material";

interface EmployeeDetailHeaderProps {
  employee: Employee;
  onBack: () => void;
  onEdit?: () => void;
  isEditMode?: boolean;
}

export function EmployeeDetailHeader({
  employee,
  onBack,
  onEdit,
  isEditMode = false,
}: EmployeeDetailHeaderProps) {
  // Status badge is now handled by StatusBadge component

  return (
    <header className="w-full flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <div className="flex items-center gap-3 flex-1">
        <SidebarTrigger className="lg:hidden">
          <SidebarLeft01Icon className="size-5" />
        </SidebarTrigger>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft01Icon className="size-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-medium text-base">{employee.full_name}</h1>
          <p className="text-sm text-muted-foreground">
            {employee.employee_code} • {employee.department?.name || "No Department"} • {employee.position?.name || "No Position"}
          </p>
        </div>
        <StatusBadge status={employee.status}>
          {employee.status.toUpperCase().replace("_", " ")}
        </StatusBadge>
      </div>

      {onEdit && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-2"
          >
            <Edit01Icon className="size-5" />
            {isEditMode ? "Cancel" : "Edit"}
          </Button>
        </div>
      )}
    </header>
  );
}

