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
import { salaryComponentService } from "@/services/payroll.service";
import type { CreateSalaryComponentDto, SalaryComponent, UpdateSalaryComponentDto } from "@/types/payroll";
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

const allowanceSchema = z.object({
  name: z.string().min(1, "Allowance name is required"),
  calculation_type: z.enum(["fixed", "percentage"]),
  amount: z.number().min(0).optional().nullable(),
  percentage: z.number().min(0).max(100).optional().nullable(),
  is_taxable: z.boolean(),
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

type AllowanceFormData = z.infer<typeof allowanceSchema>;

interface AllowancesSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function AllowancesSection({ employeeId, isEditMode = true }: AllowancesSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [calculationType, setCalculationType] = React.useState<"fixed" | "percentage">("fixed");

  const { data: salaryComponents, isLoading } = useQuery({
    queryKey: ["employee-salary-components", employeeId, "allowance"],
    queryFn: () => salaryComponentService.getByEmployee(employeeId, { component_type: "allowance" }),
  });

  const allowances = React.useMemo(() => {
    if (!salaryComponents || !("data" in salaryComponents)) return [];
    const components = Array.isArray(salaryComponents) ? salaryComponents : salaryComponents.data || [];
    return components.filter((sc: SalaryComponent) => sc.component_type === "allowance");
  }, [salaryComponents]);

  const createMutation = useMutation({
    mutationFn: (data: CreateSalaryComponentDto) => salaryComponentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-salary-components", employeeId] });
      toast.success("Allowance added successfully");
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to add allowance", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalaryComponentDto }) =>
      salaryComponentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-salary-components", employeeId] });
      toast.success("Allowance updated successfully");
      setIsAddDialogOpen(false);
      setEditingId(null);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to update allowance", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => salaryComponentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-salary-components", employeeId] });
      toast.success("Allowance deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete allowance", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AllowanceFormData>({
    resolver: zodResolver(allowanceSchema),
    defaultValues: {
      name: "",
      calculation_type: "fixed",
      amount: 0,
      percentage: 0,
      is_taxable: true,
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
      const allowance = allowances.find((a) => a.id === editingId);
      if (allowance) {
        reset({
          name: allowance.name,
          calculation_type: allowance.calculation_type,
          amount: allowance.amount || 0,
          percentage: allowance.percentage || 0,
          is_taxable: allowance.is_taxable,
          effective_date: allowance.effective_date,
          end_date: allowance.end_date || "",
          description: allowance.description || "",
        });
        setCalculationType(allowance.calculation_type);
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, allowances, reset]);

  const onSubmit = (data: AllowanceFormData) => {
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: {
          name: data.name,
          calculation_type: data.calculation_type,
          amount: data.calculation_type === "fixed" ? (data.amount ?? undefined) : undefined,
          percentage: data.calculation_type === "percentage" ? (data.percentage ?? undefined) : undefined,
          is_taxable: data.is_taxable,
          effective_date: data.effective_date,
          end_date: data.end_date || undefined,
          description: data.description || undefined,
        },
      });
    } else {
      createMutation.mutate({
        employee_id: employeeId,
        component_type: "allowance",
        name: data.name,
        calculation_type: data.calculation_type,
        amount: data.calculation_type === "fixed" ? (data.amount ?? 0) : 0,
        percentage: data.calculation_type === "percentage" ? data.percentage : undefined,
        is_taxable: data.is_taxable,
        effective_date: data.effective_date,
        end_date: data.end_date || undefined,
        description: data.description || undefined,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this allowance?")) {
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
        <h3 className="text-lg font-semibold">Allowances</h3>
        {isEditMode && (
          <Button
            onClick={() => {
              reset({
                name: "",
                calculation_type: "fixed",
                amount: 0,
                percentage: 0,
                is_taxable: true,
                effective_date: "",
                end_date: "",
                description: "",
              });
              setEditingId(null);
              setCalculationType("fixed");
              setIsAddDialogOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Add01Icon className="size-5 mr-2" />
            Add Allowance
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading allowances...
        </div>
      ) : allowances.length > 0 ? (
        <div className="space-y-4">
          {allowances.map((allowance: SalaryComponent) => (
            <div key={allowance.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{allowance.name}</h4>
                  {allowance.description && (
                    <p className="text-sm text-muted-foreground mt-1">{allowance.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={allowance.is_active ? "default" : "secondary"}>
                    {allowance.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {isEditMode && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontalIcon className="size-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingId(allowance.id)}>
                          <Edit01Icon className="size-5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(allowance.id)}
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
                    {allowance.calculation_type === "percentage"
                      ? `${allowance.percentage}%`
                      : formatCurrency(allowance.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Taxable: </span>
                  <span className="font-medium">{allowance.is_taxable ? "Yes" : "No"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Effective Date: </span>
                  <span className="font-medium">{formatDate(allowance.effective_date)}</span>
                </div>
                {allowance.end_date && (
                  <div>
                    <span className="text-muted-foreground">End Date: </span>
                    <span className="font-medium">{formatDate(allowance.end_date)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No allowances found.</p>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Allowance" : "Add Allowance"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update allowance information" : "Add a new allowance for this employee"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Allowance Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register("name")} placeholder="Enter allowance name" />
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_taxable"
                {...register("is_taxable")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_taxable" className="font-normal cursor-pointer">
                Taxable
              </Label>
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
                {editingId ? "Update" : "Add"} Allowance
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
