import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { salaryComponentService } from "@/services/payroll.service";
import type { SalaryComponent } from "@/types/payroll";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";

interface ViewEmployeeAllowancesModalProps {
  employeeId: string;
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewEmployeeAllowancesModal({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: ViewEmployeeAllowancesModalProps) {
  const { data: componentsData, isLoading } = useQuery({
    queryKey: ["salaryComponents", "employee", employeeId],
    queryFn: () => salaryComponentService.getAll({ employee_id: employeeId }),
    enabled: open && !!employeeId,
  });

  const components = componentsData?.data || [];

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

  const activeComponents = components.filter((c) => c.is_active);
  const inactiveComponents = components.filter((c) => !c.is_active);

  const totalActiveAmount = activeComponents.reduce(
    (sum, c) => sum + (c.amount || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <PersonIcon className="size-6" />
            Employee Allowances - {employeeName}
          </DialogTitle>
          <DialogDescription>
            View all salary components assigned to this employee
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CategoryIcon className="size-4" />
                <span className="text-sm font-medium">Total Components</span>
              </div>
              <p className="text-2xl font-bold">{components.length}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CategoryIcon className="size-4" />
                <span className="text-sm font-medium">Active Components</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {activeComponents.length}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MoneyIcon className="size-4" />
                <span className="text-sm font-medium">Total Monthly Amount</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalActiveAmount)}
              </p>
            </div>
          </div>

          {/* Active Components */}
          {activeComponents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm">
                  Active Components ({activeComponents.length})
                </span>
              </h3>
              <div className="rounded-lg border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-medium">Component Name</TableHead>
                      <TableHead className="font-medium">Type</TableHead>
                      <TableHead className="font-medium">Calculation</TableHead>
                      <TableHead className="font-medium">Amount</TableHead>
                      <TableHead className="font-medium">Effective Date</TableHead>
                      <TableHead className="font-medium">End Date</TableHead>
                      <TableHead className="font-medium">Taxable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeComponents.map((component: SalaryComponent) => (
                      <TableRow key={component.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{component.name}</div>
                            {component.componentType && (
                              <div className="text-xs text-muted-foreground">
                                {component.componentType.code}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-muted">
                            {component.componentType?.category || component.component_type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize text-xs">
                            {component.calculation_type.replace(/_/g, " ")}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(component.amount)}
                          {component.percentage && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({component.percentage}%)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(component.effective_date)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {component.end_date ? formatDate(component.end_date) : "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                              component.is_taxable
                                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400"
                                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                            )}
                          >
                            {component.is_taxable ? "Yes" : "No"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Inactive Components */}
          {inactiveComponents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400 text-sm">
                  Inactive Components ({inactiveComponents.length})
                </span>
              </h3>
              <div className="rounded-lg border bg-card overflow-hidden opacity-60">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-medium">Component Name</TableHead>
                      <TableHead className="font-medium">Type</TableHead>
                      <TableHead className="font-medium">Amount</TableHead>
                      <TableHead className="font-medium">Effective Date</TableHead>
                      <TableHead className="font-medium">End Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inactiveComponents.map((component: SalaryComponent) => (
                      <TableRow key={component.id}>
                        <TableCell className="font-medium">{component.name}</TableCell>
                        <TableCell className="capitalize text-xs">
                          {component.componentType?.category || component.component_type}
                        </TableCell>
                        <TableCell>{formatCurrency(component.amount)}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(component.effective_date)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {component.end_date ? formatDate(component.end_date) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading components...</div>
            </div>
          )}

          {!isLoading && components.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <CategoryIcon className="size-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                No salary components assigned to this employee yet.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
