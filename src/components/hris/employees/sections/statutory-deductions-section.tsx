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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const deductionSchema = z.object({
  deduction_type: z.enum(["advance", "insurance", "penalty", "other"]),
  name: z.string().min(1, "Deduction name is required"),
  calculation_type: z.enum(["fixed", "percentage"]),
  amount: z.number().min(0).optional().nullable(),
  percentage: z.number().min(0).max(100).optional().nullable(),
  effective_date: z.string().min(1, "Effective date is required"),
  end_date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.calculation_type === "fixed") {
      return data.amount !== null && data.amount !== undefined && data.amount > 0;
    }
    if (data.calculation_type === "percentage") {
      return data.percentage !== null && data.percentage !== undefined && data.percentage > 0;
    }
    return true;
  },
  {
    message: "Amount is required for fixed type, percentage is required for percentage type",
    path: ["amount"],
  }
);

type DeductionFormData = z.infer<typeof deductionSchema>;

interface StatutoryDeductionsSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function StatutoryDeductionsSection({ employeeId, isEditMode = true }: StatutoryDeductionsSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [calculationType, setCalculationType] = React.useState<"fixed" | "percentage">("fixed");

  const { data: deductions, isLoading } = useQuery({
    queryKey: ["employee-deductions", employeeId, "statutory"],
    queryFn: () => deductionService.getByEmployee(employeeId),
  });

  const statutoryDeductions = React.useMemo(() => {
    if (!deductions || !("data" in deductions)) return [];
    const ded = Array.isArray(deductions) ? deductions : deductions.data || [];
    return ded.filter((d: Deduction) => d.deduction_type !== "loan");
  }, [deductions]);

  const createMutation = useMutation({
    mutationFn: (data: CreateDeductionDto) => deductionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-deductions", employeeId] });
      toast.success("Statutory deduction added successfully");
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to add statutory deduction", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeductionDto }) =>
      deductionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-deductions", employeeId] });
      toast.success("Statutory deduction updated successfully");
      setIsAddDialogOpen(false);
      setEditingId(null);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to update statutory deduction", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deductionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-deductions", employeeId] });
      toast.success("Statutory deduction deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete statutory deduction", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DeductionFormData>({
    resolver: zodResolver(deductionSchema),
    defaultValues: {
      deduction_type: "insurance",
      name: "",
      calculation_type: "fixed",
      amount: 0,
      percentage: 0,
      effective_date: "",
      end_date: "",
      description: "",
    },
  });

  const watchCalculationType = watch("calculation_type");

  React.useEffect(() => {
    setCalculationType(watchCalculationType);
  }, [watchCalculationType]);

  React.useEffect(() => {
    if (editingId) {
      const deduction = statutoryDeductions.find((d) => d.id === editingId);
      if (deduction) {
        reset({
          deduction_type: (deduction.deduction_type || "insurance") as "advance" | "insurance" | "penalty" | "other",
          name: deduction.name,
          calculation_type: deduction.calculation_type,
          amount: deduction.amount || 0,
          percentage: deduction.percentage || 0,
          effective_date: deduction.effective_date,
          end_date: deduction.end_date || "",
          description: deduction.description || "",
        });
        setCalculationType(deduction.calculation_type);
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, statutoryDeductions, reset]);

  const onSubmit = (data: DeductionFormData) => {
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: {
          deduction_type: data.deduction_type,
          name: data.name,
          calculation_type: data.calculation_type,
          amount: data.calculation_type === "fixed" ? (data.amount ?? undefined) : undefined,
          percentage: data.calculation_type === "percentage" ? (data.percentage ?? undefined) : undefined,
          effective_date: data.effective_date,
          end_date: data.end_date || undefined,
          description: data.description || undefined,
        },
      });
    } else {
      createMutation.mutate({
        employee_id: employeeId,
        deduction_type: data.deduction_type,
        name: data.name,
        calculation_type: data.calculation_type,
        amount: data.calculation_type === "fixed" ? (data.amount ?? 0) : 0,
        percentage: data.calculation_type === "percentage" ? data.percentage : undefined,
        is_active: true,
        effective_date: data.effective_date,
        end_date: data.end_date || undefined,
        description: data.description || undefined,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this statutory deduction?")) {
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
        <h3 className="text-lg font-semibold">Statutory Deductions</h3>
        {isEditMode && (
          <Button
            onClick={() => {
              reset({
                deduction_type: "insurance",
                name: "",
                calculation_type: "fixed",
                amount: 0,
                percentage: 0,
                effective_date: "",
                end_date: "",
                description: "",
              });
              setEditingId(null);
              setCalculationType("fixed");
              setIsAddDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Add01Icon className="size-5 mr-2" />
            Add Deduction
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading statutory deductions...
        </div>
      ) : statutoryDeductions.length > 0 ? (
        <div className="space-y-4">
          {statutoryDeductions.map((deduction: Deduction) => (
            <div key={deduction.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{deduction.name}</h4>
                  <Badge variant="outline" className="mt-1">
                    {deduction.deduction_type}
                  </Badge>
                  {deduction.description && (
                    <p className="text-sm text-muted-foreground mt-2">{deduction.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={deduction.is_active ? "default" : "secondary"}>
                    {deduction.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {isEditMode && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontalIcon className="size-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingId(deduction.id)}>
                          <Edit01Icon className="size-5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(deduction.id)}
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
                  <span className="text-muted-foreground">Amount: </span>
                  <span className="font-medium">
                    {deduction.calculation_type === "percentage"
                      ? `${deduction.percentage}%`
                      : formatCurrency(deduction.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Effective Date: </span>
                  <span className="font-medium">{formatDate(deduction.effective_date)}</span>
                </div>
                {deduction.end_date && (
                  <div>
                    <span className="text-muted-foreground">End Date: </span>
                    <span className="font-medium">{formatDate(deduction.end_date)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No statutory deductions found.</p>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Statutory Deduction" : "Add Statutory Deduction"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update statutory deduction information" : "Add a new statutory deduction for this employee"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deduction_type">
                Deduction Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("deduction_type")}
                onValueChange={(value) => setValue("deduction_type", value as "advance" | "insurance" | "penalty" | "other")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="advance">Advance</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="penalty">Penalty</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Deduction Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register("name")} placeholder="Enter deduction name" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="calculation_type">
                Calculation Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={calculationType}
                onValueChange={(value) => {
                  setValue("calculation_type", value as "fixed" | "percentage");
                  setCalculationType(value as "fixed" | "percentage");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {calculationType === "fixed" ? (
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="Enter amount"
                />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="percentage">
                  Percentage <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="percentage"
                  type="number"
                  step="0.01"
                  {...register("percentage", { valueAsNumber: true })}
                  placeholder="Enter percentage"
                />
                {errors.percentage && (
                  <p className="text-sm text-destructive">{errors.percentage.message}</p>
                )}
              </div>
            )}

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
                {editingId ? "Update" : "Add"} Deduction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
