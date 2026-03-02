import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deductionService } from "@/services/payroll.service";
import type { CreateDeductionDto, Deduction, UpdateDeductionDto } from "@/types/payroll";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  Edit as Edit01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const loanSchema = z.object({
  name: z.string().min(1, "Loan name is required"),
  amount: z.number().min(0, "Amount must be positive"),
  installment_count: z.number().min(1, "Installment count must be at least 1").optional().nullable(),
  effective_date: z.string().min(1, "Effective date is required"),
  end_date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

type LoanFormData = z.infer<typeof loanSchema>;

interface LoansSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function LoansSection({ employeeId, isEditMode = true }: LoansSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const { data: deductions, isLoading } = useQuery({
    queryKey: ["employee-deductions", employeeId, "loan"],
    queryFn: () => deductionService.getByEmployee(employeeId, { deduction_type: "loan" }),
  });

  const loans = React.useMemo(() => {
    if (!deductions || !("data" in deductions)) return [];
    const ded = Array.isArray(deductions) ? deductions : deductions.data || [];
    return ded.filter((d: Deduction) => d.deduction_type === "loan");
  }, [deductions]);

  const createMutation = useMutation({
    mutationFn: (data: CreateDeductionDto) => deductionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-deductions", employeeId] });
      toast.success("Loan added successfully");
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to add loan", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeductionDto }) =>
      deductionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-deductions", employeeId] });
      toast.success("Loan updated successfully");
      setIsAddDialogOpen(false);
      setEditingId(null);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to update loan", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deductionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-deductions", employeeId] });
      toast.success("Loan deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete loan", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      name: "",
      amount: 0,
      installment_count: 1,
      effective_date: "",
      end_date: "",
      description: "",
    },
  });

  React.useEffect(() => {
    if (editingId) {
      const loan = loans.find((l) => l.id === editingId);
      if (loan) {
        reset({
          name: loan.name,
          amount: loan.amount,
          installment_count: loan.installment_count || 1,
          effective_date: loan.effective_date,
          end_date: loan.end_date || "",
          description: loan.description || "",
        });
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, loans, reset]);

  const onSubmit = (data: LoanFormData) => {
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: {
          name: data.name,
          amount: data.amount,
          installment_count: data.installment_count || null,
          effective_date: data.effective_date,
          end_date: data.end_date || null,
          description: data.description || null,
        },
      });
    } else {
      createMutation.mutate({
        employee_id: employeeId,
        deduction_type: "loan",
        name: data.name,
        calculation_type: "fixed",
        amount: data.amount,
        installment_count: data.installment_count || null,
        effective_date: data.effective_date,
        end_date: data.end_date || null,
        description: data.description || null,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this loan?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "₱0.00";
    return `₱${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Loans</h3>
        {isEditMode && (
          <Button
            onClick={() => {
              reset({
                name: "",
                amount: 0,
                installment_count: 1,
                effective_date: "",
                end_date: "",
                description: "",
              });
              setEditingId(null);
              setIsAddDialogOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Add01Icon className="size-5 mr-2" />
            Add Loan
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading loans...
        </div>
      ) : loans.length > 0 ? (
        <div className="space-y-4">
          {loans.map((loan: Deduction) => (
            <div key={loan.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{loan.name}</h4>
                  {loan.description && (
                    <p className="text-sm text-muted-foreground mt-1">{loan.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={loan.is_active ? "default" : "secondary"}>
                    {loan.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {isEditMode && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontalIcon className="size-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingId(loan.id)}>
                          <Edit01Icon className="size-5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(loan.id)}
                          className="text-destructive"
                        >
                          <Delete01Icon className="size-5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Amount: </span>
                  <span className="font-medium">{formatCurrency(loan.amount)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Remaining Balance: </span>
                  <span className="font-medium">{formatCurrency(loan.remaining_balance)}</span>
                </div>
                {loan.installment_count && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Installments: </span>
                      <span className="font-medium">
                        {loan.installment_paid || 0} / {loan.installment_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Installment Amount: </span>
                      <span className="font-medium">
                        {formatCurrency(loan.amount / (loan.installment_count || 1))}
                      </span>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-muted-foreground">Effective Date: </span>
                  <span className="font-medium">{formatDate(loan.effective_date)}</span>
                </div>
                {loan.end_date && (
                  <div>
                    <span className="text-muted-foreground">End Date: </span>
                    <span className="font-medium">{formatDate(loan.end_date)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No loans found.</p>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Loan" : "Add Loan"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update loan information" : "Add a new loan for this employee"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Loan Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register("name")} placeholder="Enter loan name" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Total Amount <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="Enter total amount"
                />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="installment_count">Installment Count</Label>
                <Input
                  id="installment_count"
                  type="number"
                  {...register("installment_count", { valueAsNumber: true })}
                  placeholder="Enter installment count"
                />
                {errors.installment_count && (
                  <p className="text-sm text-destructive">{errors.installment_count.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effective_date">
                  Effective Date <span className="text-destructive">*</span>
                </Label>
                <Input id="effective_date" type="date" {...register("effective_date")} />
                {errors.effective_date && (
                  <p className="text-sm text-destructive">{errors.effective_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" type="date" {...register("end_date")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingId(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Update" : "Add"} Loan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
