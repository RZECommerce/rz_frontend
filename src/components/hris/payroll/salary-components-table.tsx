
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { salaryComponentService } from "@/services/payroll.service";
import type { SalaryComponent } from "@/types/payroll";
import {
    Delete as DeleteIcon,
    Edit as EditIcon
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

interface SalaryComponentsTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddClick?: () => void;
  isDeleting?: boolean;
}

export function SalaryComponentsTable({
  onEdit,
  onDelete,
  onAddClick,
  isDeleting = false,
}: SalaryComponentsTableProps) {
  const { data: componentsData, isLoading } = useQuery({
    queryKey: ["salaryComponents"],
    queryFn: () => salaryComponentService.getAll(),
  });

  const components = React.useMemo(
    () => (componentsData?.data || []),
    [componentsData]
  );

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {onAddClick && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Employee Allowances</h2>
            <p className="text-sm text-muted-foreground">Assign salary components to specific employees</p>
          </div>
          <Button onClick={onAddClick} className="gap-2">
            <EditIcon className="size-5" />
            Add Employee Allowance
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
              <TableHead className="min-w-[150px] text-muted-foreground font-medium">
                Employee
              </TableHead>
              <TableHead className="min-w-[150px] text-muted-foreground font-medium">
                Name
              </TableHead>
              <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                Type
              </TableHead>
              <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                Amount
              </TableHead>
              <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                Effective Date
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="text-right min-w-[150px] text-muted-foreground font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Loading salary components...
                </TableCell>
              </TableRow>
            ) : components.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No salary components found.
                </TableCell>
              </TableRow>
            ) : (
              components.map((component: SalaryComponent) => (
                <TableRow key={component.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {component.salary_component_code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{component.employee?.full_name || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">
                        {component.employee?.employee_code || ""}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{component.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {component.component_type}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(component.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(component.effective_date)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium",
                        component.is_active
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
                          : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                      )}
                    >
                      {component.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(component.id)}
                        title="Edit"
                      >
                        <EditIcon className="size-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(component.id)}
                        disabled={isDeleting}
                        title="Delete"
                      >
                        <DeleteIcon className="size-5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      </div>
    </div>
  );
}

