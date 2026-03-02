
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
    Delete as Delete01Icon,
    Edit as Edit01Icon,
    Search as SearchIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

interface DeductionsTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddClick?: () => void;
  isDeleting?: boolean;
}

export function DeductionsTable({
  onEdit,
  onDelete,
  onAddClick,
  isDeleting = false,
}: DeductionsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: deductionsData, isLoading } = useQuery({
    queryKey: ["deductions"],
    queryFn: () => deductionService.getAll(),
  });

  const deductions = React.useMemo(
    () => (deductionsData?.data || []),
    [deductionsData]
  );

  const filteredDeductions = React.useMemo(() => {
    if (!searchQuery.trim()) return deductions;

    const query = searchQuery.toLowerCase();
    return deductions.filter((deduction: Deduction) => {
      return (
        deduction.deduction_code?.toLowerCase().includes(query) ||
        deduction.name?.toLowerCase().includes(query) ||
        deduction.employee?.full_name?.toLowerCase().includes(query) ||
        deduction.employee?.employee_code?.toLowerCase().includes(query) ||
        deduction.deduction_type?.toLowerCase().includes(query)
      );
    });
  }, [deductions, searchQuery]);

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
            <h2 className="text-lg font-semibold">Deductions</h2>
            <p className="text-sm text-muted-foreground">Manage employee deductions and loans</p>
          </div>
          <Button onClick={onAddClick} className="gap-2">
            <Delete01Icon className="size-5" />
            Add New Deduction
          </Button>
        </div>
      )}
      <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4 border-b">
        <div className="relative max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by employee, code, or name..."
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
                Balance
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
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  Loading deductions...
                </TableCell>
              </TableRow>
            ) : filteredDeductions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  {searchQuery ? "No deductions match your search." : "No deductions found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredDeductions.map((deduction: Deduction) => (
                <TableRow key={deduction.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {deduction.deduction_code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{deduction.employee?.full_name || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">
                        {deduction.employee?.employee_code || ""}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{deduction.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {deduction.deduction_type}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(deduction.amount)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(deduction.remaining_balance)}
                    {deduction.installment_count && (
                      <div className="text-xs text-muted-foreground">
                        ({deduction.installment_paid}/{deduction.installment_count} installments)
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(deduction.effective_date)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium",
                        deduction.is_active
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
                          : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                      )}
                    >
                      {deduction.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(deduction.id)}
                        title="Edit"
                      >
                        <Edit01Icon className="size-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(deduction.id)}
                        disabled={isDeleting}
                        title="Delete"
                      >
                        <Delete01Icon className="size-5 text-destructive" />
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

