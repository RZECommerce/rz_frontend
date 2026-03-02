import { CreateDeductionForm } from "@/components/hris/payroll/create-deduction-form";
import { EditDeductionForm } from "@/components/hris/payroll/edit-deduction-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deductionService } from "@/services/payroll.service";
import type {
  CreateDeductionDto,
  Deduction,
  UpdateDeductionDto,
} from "@/types/payroll";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  Edit as Edit01Icon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface EmployeeDeductionsProps {
  employeeId: string;
}

export function EmployeeDeductions({ employeeId }: EmployeeDeductionsProps) {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<string | null>(null);

  const { data: deductionsData, isLoading } = useQuery({
    queryKey: ["deductions", { employee_id: employeeId }],
    queryFn: () => deductionService.getAll({ employee_id: employeeId }),
  });

  const deductions = (deductionsData?.data || []).filter(
    (ded: Deduction) => ded.employee_id === employeeId
  );

  const deleteDeduction = useMutation({
    mutationFn: deductionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deductions"] });
    },
  });

  const createDeduction = useMutation({
    mutationFn: deductionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deductions"] });
      setIsCreateDialogOpen(false);
    },
  });

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

  const handleCreate = (data: CreateDeductionDto) => {
    createDeduction.mutate({ ...data, employee_id: employeeId });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <CardTitle className="text-lg">Deductions</CardTitle>
            <CardDescription>
              Manage loans, advances, and other deductions for this employee
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2"
          >
            <Add01Icon className="size-5" />
            Add Deduction
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : deductions.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground">
            No deductions found. Click "Add Deduction" to create one.
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deductions.map((deduction: Deduction) => (
                  <TableRow key={deduction.id}>
                    <TableCell className="font-medium">
                      {deduction.name}
                    </TableCell>
                    <TableCell>{deduction.deduction_type}</TableCell>
                    <TableCell>{formatCurrency(deduction.amount)}</TableCell>
                    <TableCell>
                      {formatCurrency(deduction.remaining_balance)}
                      {deduction.installment_count && (
                        <div className="text-xs text-muted-foreground">
                          ({deduction.installment_paid}/
                          {deduction.installment_count})
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(deduction.effective_date)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${deduction.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                      >
                        {deduction.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingDeduction(deduction.id)}
                        >
                          <Edit01Icon className="size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this deduction?"
                              )
                            ) {
                              deleteDeduction.mutate(deduction.id);
                            }
                          }}
                        >
                          <Delete01Icon
                            className="size-5 text-destructive"
                          />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <CreateDeductionForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreate}
        isSubmitting={createDeduction.isPending}
        defaultEmployeeId={employeeId}
      />

      {editingDeduction && (
        <EditDeductionForm
          deductionId={editingDeduction}
          open={!!editingDeduction}
          onOpenChange={(open: boolean) => !open && setEditingDeduction(null)}
          onSubmit={(data: UpdateDeductionDto) => {
            deductionService.update(editingDeduction, data);
            setEditingDeduction(null);
          }}
          isSubmitting={false}
        />
      )}
    </Card>
  );
}
