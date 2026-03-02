import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Settings as ManageIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ViewEmployeeDeductionsModal } from "./view-employee-deductions-modal";
import { ManageEmployeeDeductionsModal } from "./manage-employee-deductions-modal";

interface EmployeeDeductionsTableProps {
  onAddClick?: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

interface EmployeeDeductionSummary {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  totalDeductions: number;
  activeDeductions: number;
  totalAmount: number;
  deductions: Deduction[];
}

export function EmployeeDeductionsTable({
  onAddClick,
  onEdit,
  onDelete,
  isDeleting = false,
}: EmployeeDeductionsTableProps) {
  const [viewingEmployee, setViewingEmployee] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [managingEmployee, setManagingEmployee] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpanded = (employeeId: string) => {
    setExpandedEmployees((prev) => {
      const next = new Set(prev);
      if (next.has(employeeId)) {
        next.delete(employeeId);
      } else {
        next.add(employeeId);
      }
      return next;
    });
  };

  const { data: deductionsData, isLoading } = useQuery({
    queryKey: ["deductions"],
    queryFn: () => deductionService.getAll(),
  });

  const deductions = deductionsData?.data || [];

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

  const employeeSummaries = useMemo(() => {
    const grouped = new Map<string, EmployeeDeductionSummary>();

    deductions.forEach((deduction: Deduction) => {
      if (!deduction.employee) return;

      const employeeId = deduction.employee.id;
      if (!grouped.has(employeeId)) {
        grouped.set(employeeId, {
          employeeId,
          employeeCode: deduction.employee.employee_code,
          employeeName: deduction.employee.full_name,
          totalDeductions: 0,
          activeDeductions: 0,
          totalAmount: 0,
          deductions: [],
        });
      }

      const summary = grouped.get(employeeId)!;
      summary.totalDeductions++;
      summary.deductions.push(deduction);

      if (deduction.is_active) {
        summary.activeDeductions++;
        summary.totalAmount += deduction.amount || 0;
      }
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.employeeName.localeCompare(b.employeeName)
    );
  }, [deductions]);

  const filteredSummaries = useMemo(() => {
    if (!searchQuery.trim()) return employeeSummaries;

    const query = searchQuery.toLowerCase();
    return employeeSummaries.filter((summary) => {
      return (
        summary.employeeCode?.toLowerCase().includes(query) ||
        summary.employeeName?.toLowerCase().includes(query) ||
        summary.deductions.some((ded) =>
          ded.name?.toLowerCase().includes(query) ||
          ded.deductionType?.name?.toLowerCase().includes(query) ||
          ded.deduction_type?.toLowerCase().includes(query)
        )
      );
    });
  }, [employeeSummaries, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Employee Deductions</h2>
          <p className="text-sm text-muted-foreground">
            Manage deductions assigned to employees
          </p>
        </div>
        {onAddClick && (
          <Button onClick={onAddClick} className="gap-2">
            <AddIcon className="size-5" />
            Add Employee Deduction
          </Button>
        )}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by employee, code, or deduction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="min-w-[150px] text-muted-foreground font-medium">
                  Employee Code
                </TableHead>
                <TableHead className="min-w-[200px] text-muted-foreground font-medium">
                  Employee Name
                </TableHead>
                <TableHead className="min-w-[150px] text-center text-muted-foreground font-medium">
                  Total Deductions
                </TableHead>
                <TableHead className="min-w-[150px] text-center text-muted-foreground font-medium">
                  Active Deductions
                </TableHead>
                <TableHead className="min-w-[180px] text-right text-muted-foreground font-medium">
                  Total Monthly Amount
                </TableHead>
                <TableHead className="text-right min-w-[180px] text-muted-foreground font-medium">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading employee deductions...
                  </TableCell>
                </TableRow>
              ) : filteredSummaries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p>{searchQuery ? "No employees match your search." : "No employee deductions found."}</p>
                      {!searchQuery && (
                        <p className="text-xs">
                          Assign deductions to employees to get started.
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSummaries.map((summary) => {
                  const isExpanded = expandedEmployees.has(summary.employeeId);
                  return (
                    <>
                      <TableRow key={summary.employeeId} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleExpanded(summary.employeeId)}>
                        <TableCell className="font-medium text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <CollapseIcon className="size-4" /> : <ExpandIcon className="size-4" />}
                            {summary.employeeCode}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{summary.employeeName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                            {summary.totalDeductions}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium",
                              summary.activeDeductions > 0
                                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400"
                                : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400"
                            )}
                          >
                            {summary.activeDeductions}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-lg text-red-600 dark:text-red-400">
                            {formatCurrency(summary.totalAmount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setViewingEmployee({
                                  id: summary.employeeId,
                                  name: summary.employeeName,
                                })
                              }
                              title="View Details"
                            >
                              <ViewIcon className="size-5 text-blue-600 dark:text-blue-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setManagingEmployee({
                                  id: summary.employeeId,
                                  name: summary.employeeName,
                                })
                              }
                              title="Manage Deductions"
                            >
                              <ManageIcon className="size-5 text-purple-600 dark:text-purple-400" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && summary.deductions.map((deduction) => (
                        <TableRow key={deduction.id} className="bg-muted/20">
                          <TableCell className="pl-12 text-xs text-muted-foreground">
                            {deduction.deduction_code}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{deduction.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {deduction.deductionType?.category || deduction.deduction_type}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <span className="capitalize text-xs">
                              {deduction.calculation_type.replace(/_/g, " ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(deduction.amount)}
                            {deduction.calculation_type === "installment" && deduction.installment_count && (
                              <div className="text-xs text-muted-foreground">
                                {deduction.installment_paid}/{deduction.installment_count} paid
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(deduction.effective_date)}
                            {deduction.end_date && ` - ${formatDate(deduction.end_date)}`}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(deduction.id)}
                                title="Edit"
                              >
                                <EditIcon className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(deduction.id)}
                                disabled={isDeleting}
                                title="Delete"
                              >
                                <DeleteIcon className="size-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {viewingEmployee && (
        <ViewEmployeeDeductionsModal
          employeeId={viewingEmployee.id}
          employeeName={viewingEmployee.name}
          open={!!viewingEmployee}
          onOpenChange={(open) => !open && setViewingEmployee(null)}
        />
      )}

      {managingEmployee && (
        <ManageEmployeeDeductionsModal
          employeeId={managingEmployee.id}
          employeeName={managingEmployee.name}
          open={!!managingEmployee}
          onOpenChange={(open) => !open && setManagingEmployee(null)}
        />
      )}
    </div>
  );
}
