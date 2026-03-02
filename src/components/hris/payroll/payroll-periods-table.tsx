
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { payrollPeriodService } from "@/services/payroll.service";
import type { PayrollPeriod } from "@/types/payroll";
import {
    CheckCircle as CheckmarkCircle01Icon,
    AccessTime as Clock01Icon,
    Delete as Delete01Icon,
    Edit as Edit01Icon,
    Lock as Locker01Icon,
    MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";

interface PayrollPeriodsTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddClick?: () => void;
  isDeleting?: boolean;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; icon: typeof CheckmarkCircle01Icon; label: string }
> = {
  locked: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-400",
    icon: Locker01Icon,
    label: "Locked",
  },
  active: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-400",
    icon: CheckmarkCircle01Icon,
    label: "Active",
  },
  inactive: {
    bg: "bg-gray-100 dark:bg-gray-900/30",
    text: "text-gray-800 dark:text-gray-400",
    icon: Clock01Icon,
    label: "Inactive",
  },
};

export function PayrollPeriodsTable({
  onEdit,
  onDelete,
  onAddClick,
  isDeleting = false,
}: PayrollPeriodsTableProps) {
  const { data: periods, isLoading } = useQuery({
    queryKey: ["payrollPeriods"],
    queryFn: () => payrollPeriodService.getAll(),
  });

  const periodsList = Array.isArray(periods) ? periods : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeLabel = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusInfo = (period: PayrollPeriod) => {
    if (period.is_locked) {
      return statusConfig.locked;
    }
    if (period.is_active) {
      return statusConfig.active;
    }
    return statusConfig.inactive;
  };

  return (
    <div className="space-y-4">
      {onAddClick && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Payroll Periods</h2>
            <p className="text-sm text-muted-foreground">Manage payroll period schedules</p>
          </div>
          <Button onClick={onAddClick} className="gap-2">
            <CheckmarkCircle01Icon className="size-5" />
            Add New Period
          </Button>
        </div>
      )}
      <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                Code
              </TableHead>
              <TableHead className="min-w-[200px] text-muted-foreground font-medium">
                Name
              </TableHead>
              <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                Type
              </TableHead>
              <TableHead className="min-w-[150px] text-muted-foreground font-medium">
                Start Date
              </TableHead>
              <TableHead className="min-w-[150px] text-muted-foreground font-medium">
                End Date
              </TableHead>
              <TableHead className="min-w-[150px] text-muted-foreground font-medium">
                Pay Date
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Loading payroll periods...
                </TableCell>
              </TableRow>
            ) : periodsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No payroll periods found.
                </TableCell>
              </TableRow>
            ) : (
              periodsList.map((period: PayrollPeriod) => {
                const statusInfo = getStatusInfo(period);
                const StatusIcon = statusInfo.icon;
                return (
                  <TableRow key={period.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {period.period_code}
                    </TableCell>
                    <TableCell className="font-medium">{period.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {getTypeLabel(period.type)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(period.start_date)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(period.end_date)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(period.pay_date)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          statusInfo.bg,
                          statusInfo.text
                        )}
                      >
                        <StatusIcon className="size-5" />
                        {statusInfo.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onEdit(period.id)}
                            disabled={period.is_locked}
                          >
                            <Edit01Icon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(period.id)}
                            disabled={isDeleting || period.is_locked}
                            className="text-destructive focus:text-destructive"
                          >
                            <Delete01Icon className="size-5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      </div>
    </div>
  );
}

