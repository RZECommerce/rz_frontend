
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { salaryComponentService } from "@/services/payroll.service";
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
import type { UpdateSalaryComponentDto } from "@/types/payroll";

const updateSalaryComponentSchema = z.object({
  employee_id: z.string().optional(),
  component_type: z.enum(["allowance", "bonus", "commission", "other"]).optional(),
  name: z.string().min(1, "Name is required").optional(),
  calculation_type: z.enum(["fixed", "percentage", "per_day", "per_hour"]).optional(),
  amount: z.number().min(0, "Amount must be positive").optional(),
  percentage: z.number().min(0).max(100).optional().nullable(),
  is_taxable: z.boolean().optional(),
  is_active: z.boolean().optional(),
  effective_date: z.string().optional(),
  end_date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type UpdateSalaryComponentFormData = z.infer<typeof updateSalaryComponentSchema>;

interface EditSalaryComponentFormProps {
  componentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateSalaryComponentDto) => void;
  isSubmitting: boolean;
}

export function EditSalaryComponentForm({
  componentId,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: EditSalaryComponentFormProps) {
  const { data: component, isLoading } = useQuery({
    queryKey: ["salaryComponent", componentId],
    queryFn: () => salaryComponentService.getById(componentId),
    enabled: open && !!componentId,
  });

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
  } = useForm<UpdateSalaryComponentFormData>({
    resolver: zodResolver(updateSalaryComponentSchema),
    defaultValues: {
      employee_id: component?.employee_id || "",
      component_type: component?.component_type || "allowance",
      name: component?.name || "",
      calculation_type: component?.calculation_type || "fixed",
      amount: component?.amount || 0,
      percentage: component?.percentage || null,
      is_taxable: component?.is_taxable ?? true,
      is_active: component?.is_active ?? true,
      effective_date: component?.effective_date || "",
      end_date: component?.end_date || null,
      description: component?.description || null,
    },
  });

  React.useEffect(() => {
    if (component) {
      reset({
        employee_id: component.employee_id,
        component_type: component.component_type as any,
        name: component.name,
        calculation_type: component.calculation_type as any,
        amount: component.amount,
        percentage: component.percentage,
        is_taxable: component.is_taxable,
        is_active: component.is_active,
        effective_date: component.effective_date,
        end_date: component.end_date,
        description: component.description,
      });
    }
  }, [component, reset]);

  const selectedEmployeeId = watch("employee_id");
  const calculationType = watch("calculation_type");
  const isTaxable = watch("is_taxable");
  const isActive = watch("is_active");

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="h-32 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Edit Salary Component
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Update salary component details.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            const updateData: UpdateSalaryComponentDto = {};
            if (data.employee_id) updateData.employee_id = data.employee_id;
            if (data.component_type) updateData.component_type = data.component_type;
            if (data.name) updateData.name = data.name;
            if (data.calculation_type) updateData.calculation_type = data.calculation_type;
            if (data.amount !== undefined) updateData.amount = data.amount;
            if (data.percentage !== undefined) updateData.percentage = data.percentage;
            if (data.is_taxable !== undefined) updateData.is_taxable = data.is_taxable;
            if (data.is_active !== undefined) updateData.is_active = data.is_active;
            if (data.effective_date) updateData.effective_date = data.effective_date;
            if (data.end_date !== undefined) updateData.end_date = data.end_date;
            if (data.description !== undefined) updateData.description = data.description;
            onSubmit(updateData);
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
            >
              <SelectTrigger id="employee_id" className="w-full">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="component_type" className="text-sm font-medium">
                Component Type
              </Label>
              <Select
                onValueChange={(value) => setValue("component_type", value as any)}
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
                Calculation Type
              </Label>
              <Select
                onValueChange={(value) => setValue("calculation_type", value as any)}
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
              Name
            </Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
              />
            </div>

            {calculationType === "percentage" && (
              <div className="space-y-2">
                <Label htmlFor="percentage" className="text-sm font-medium">
                  Percentage
                </Label>
                <Input
                  id="percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register("percentage", { valueAsNumber: true })}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effective_date" className="text-sm font-medium">
                Effective Date
              </Label>
              <Input id="effective_date" type="date" {...register("effective_date")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm font-medium">
                End Date
              </Label>
              <Input id="end_date" type="date" {...register("end_date")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea id="description" {...register("description")} rows={3} />
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
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

