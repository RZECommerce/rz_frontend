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
import { cn } from "@/lib/utils";
import { deductionService } from "@/services/payroll.service";
import type { Deduction } from "@/types/payroll";
import { useQuery } from "@tanstack/react-query";

interface ViewEmployeeDeductionsModalProps {
  employeeId: string;
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewEmployeeDeductionsModal({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: ViewEmployeeDeductionsModalProps) {
  const { data: deductionsData, isLoading } = useQuery({
    queryKey: ["deductions", "employee", employeeId],
    queryFn: () => deductionService.getAll({ employee_id: employeeId }),
    enabled: open && !!employeeId,
  });

  const deductions = deductionsData?.data || [];
  const activeDeductions = deductions.filter((d: Deduction) => d.is_active);
  const inactiveDeductions = deductions.filter((d: Deduction) => !d.is_active);

  const totalAmount = activeDeductions.reduce(
    (sum: number, d: Deduction) => sum + (d.amount || 0),
    0
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

  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "loan":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400";
      case "advance":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400";
      case "insurance":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "penalty":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Deductions - {employeeName}
          </DialogTitle>
          <DialogDescription>
            View all deductions assigned to this employee
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading deductions...
          </div>
        ) : deductions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No deductions assigned to this employee.
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">
                  Total Deductions
                </div>
                <div className="text-2xl font-bold">{deductions.length}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">
                  Active Deductions
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {activeDeductions.length}
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">
                  Total Monthly Amount
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalAmount)}
                </div>
              </div>
            </div>

            {/* Active Deductions */}
            {activeDeductions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Active Deductions</h3>
                <div className="rounded-lg border bg-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Installments</TableHead>
                        <TableHead>Dates</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeDeductions.map((deduction: Deduction) => (
                        <TableRow key={deduction.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {deduction.deduction_code}
                          </TableCell>
                          <TableCell className="font-medium">
                            {deduction.name}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium capitalize",
                                getCategoryBadgeColor(
                                  deduction.deductionType?.category ||
                                    deduction.deduction_type
                                )
                              )}
                            >
                              {deduction.deductionType?.category ||
                                deduction.deduction_type}
                            </span>
                          </TableCell>
                          <TableCell className="capitalize text-xs">
                            {deduction.calculation_type.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell className="font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(deduction.amount)}
                            {deduction.percentage && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({deduction.percentage}%)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {deduction.calculation_type === "installment" &&
                            deduction.installment_count ? (
                              <div className="text-sm">
                                <div>
                                  {deduction.installment_paid}/
                                  {deduction.installment_count} paid
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Balance: {formatCurrency(deduction.remaining_balance)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div>{formatDate(deduction.effective_date)}</div>
                            {deduction.end_date && (
                              <div className="text-muted-foreground">
                                to {formatDate(deduction.end_date)}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Inactive Deductions */}
            {inactiveDeductions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Inactive Deductions</h3>
                <div className="rounded-lg border bg-card overflow-hidden opacity-60">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Dates</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inactiveDeductions.map((deduction: Deduction) => (
                        <TableRow key={deduction.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {deduction.deduction_code}
                          </TableCell>
                          <TableCell className="font-medium">
                            {deduction.name}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium capitalize",
                                getCategoryBadgeColor(
                                  deduction.deductionType?.category ||
                                    deduction.deduction_type
                                )
                              )}
                            >
                              {deduction.deductionType?.category ||
                                deduction.deduction_type}
                            </span>
                          </TableCell>
                          <TableCell className="capitalize text-xs">
                            {deduction.calculation_type.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(deduction.amount)}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div>{formatDate(deduction.effective_date)}</div>
                            {deduction.end_date && (
                              <div className="text-muted-foreground">
                                to {formatDate(deduction.end_date)}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
