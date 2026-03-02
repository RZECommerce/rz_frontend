
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { employeeService } from "@/services/employee.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CreateSalaryComponentDto } from "@/types/payroll";

const createSalaryComponentSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  component_type: z.enum(["allowance", "bonus", "commission", "other"]),
  name: z.string().min(1, "Name is required"),
  calculation_type: z.enum(["fixed", "percentage", "per_day", "per_hour"]),
  amount: z.number().min(0, "Amount must be positive"),
  percentage: z.number().min(0).max(100).optional().nullable(),
  is_taxable: z.boolean().optional(),
  is_active: z.boolean().optional(),
  effective_date: z.string().min(1, "Effective date is required"),
  end_date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
}).refine((data) => {
  if (data.calculation_type === "percentage" && !data.percentage) {
    return false;
  }
  return true;
}, {
  message: "Percentage is required for percentage calculation type",
  path: ["percentage"],
});

export type CreateSalaryComponentFormData = z.infer<typeof createSalaryComponentSchema>;

interface CreateSalaryComponentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSalaryComponentDto) => void;
  isSubmitting: boolean;
  defaultEmployeeId?: string;
}

export function CreateSalaryComponentForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  defaultEmployeeId,
}: CreateSalaryComponentFormProps) {
  const { data: employeesData } = useQuery({
    queryKey: ["employees", { status: "active" }],
    queryFn: () => employeeService.getAll({ status: "active", per_page: 1000 }),
  });

  const employees = React.useMemo(
    () => Array.isArray(employeesData?.data) ? employeesData.data : [],
    [employeesData]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateSalaryComponentFormData>({
    resolver: zodResolver(createSalaryComponentSchema),
    defaultValues: {
      employee_id: defaultEmployeeId || "",
      component_type: "allowance",
      name: "",
      calculation_type: "fixed",
      amount: 0,
      percentage: null,
      is_taxable: true,
      is_active: true,
      effective_date: "",
      end_date: null,
      description: null,
    },
  });

  const selectedEmployeeId = watch("employee_id");
  const calculationType = watch("calculation_type");
  const isTaxable = watch("is_taxable");
  const isActive = watch("is_active");

  React.useEffect(() => {
    if (!open) {
      reset({
        employee_id: defaultEmployeeId || "",
        component_type: "allowance",
        name: "",
        calculation_type: "fixed",
        amount: 0,
        percentage: null,
        is_taxable: true,
        is_active: true,
        effective_date: "",
        end_date: null,
        description: null,
      });
    } else if (defaultEmployeeId) {
      setValue("employee_id", defaultEmployeeId);
    }
  }, [open, reset, defaultEmployeeId, setValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Create Salary Component
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Add a new salary component (allowance, bonus, etc.) for an employee.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit({
              ...data,
              percentage: data.percentage || null,
              end_date: data.end_date || null,
              description: data.description || null,
              is_taxable: data.is_taxable ?? true,
              is_active: data.is_active ?? true,
            });
          })}
          className="space-y-6 mt-6"
        >
          <div className="space-y-2">
            <Label htmlFor="employee_id" className="text-sm font-medium">
              Employee <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("employee_id", value || "", { shouldValidate: true })}
              value={selectedEmployeeId}
              disabled={!!defaultEmployeeId}
            >
              <SelectTrigger id="employee_id" className="w-full" disabled={!!defaultEmployeeId}>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.full_name} ({employee.employee_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employee_id && (
              <p className="text-sm text-destructive mt-1">{errors.employee_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="component_type" className="text-sm font-medium">
                Component Type <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue("component_type", value as any, { shouldValidate: true })}
                value={watch("component_type")}
              >
                <SelectTrigger id="component_type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allowance">Allowance</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calculation_type" className="text-sm font-medium">
                Calculation Type <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue("calculation_type", value as any, { shouldValidate: true })}
                value={calculationType}
              >
                <SelectTrigger id="calculation_type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="per_day">Per Day</SelectItem>
                  <SelectItem value="per_hour">Per Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Transportation Allowance"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
              )}
            </div>

            {calculationType === "percentage" && (
              <div className="space-y-2">
                <Label htmlFor="percentage" className="text-sm font-medium">
                  Percentage <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register("percentage", { valueAsNumber: true })}
                />
                {errors.percentage && (
                  <p className="text-sm text-destructive mt-1">{errors.percentage.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effective_date" className="text-sm font-medium">
                Effective Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="effective_date"
                type="date"
                {...register("effective_date")}
              />
              {errors.effective_date && (
                <p className="text-sm text-destructive mt-1">{errors.effective_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm font-medium">
                End Date (Optional)
              </Label>
              <Input
                id="end_date"
                type="date"
                {...register("end_date")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_taxable"
                checked={isTaxable}
                onCheckedChange={(checked) => setValue("is_taxable", checked as boolean)}
              />
              <Label htmlFor="is_taxable" className="text-sm font-medium cursor-pointer">
                Taxable
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue("is_active", checked as boolean)}
              />
              <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                Active
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

