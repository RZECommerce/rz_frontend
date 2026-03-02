
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { deductionService } from "@/services/payroll.service";
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
import type { UpdateDeductionDto } from "@/types/payroll";

const updateDeductionSchema = z.object({
  employee_id: z.string().optional(),
  deduction_type: z.enum(["loan", "advance", "insurance", "penalty", "other"]).optional(),
  name: z.string().min(1, "Name is required").optional(),
  calculation_type: z.enum(["fixed", "percentage", "installment"]).optional(),
  amount: z.number().min(0, "Amount must be positive").optional(),
  percentage: z.number().min(0).max(100).optional().nullable(),
  installment_count: z.number().min(1).optional().nullable(),
  is_active: z.boolean().optional(),
  effective_date: z.string().optional(),
  end_date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type UpdateDeductionFormData = z.infer<typeof updateDeductionSchema>;

interface EditDeductionFormProps {
  deductionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateDeductionDto) => void;
  isSubmitting: boolean;
}

export function EditDeductionForm({
  deductionId,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: EditDeductionFormProps) {
  const { data: deduction, isLoading } = useQuery({
    queryKey: ["deduction", deductionId],
    queryFn: () => deductionService.getById(deductionId),
    enabled: open && !!deductionId,
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
  } = useForm<UpdateDeductionFormData>({
    resolver: zodResolver(updateDeductionSchema),
    defaultValues: {
      employee_id: deduction?.employee_id || "",
      deduction_type: deduction?.deduction_type || "other",
      name: deduction?.name || "",
      calculation_type: deduction?.calculation_type || "fixed",
      amount: deduction?.amount || 0,
      percentage: deduction?.percentage || null,
      installment_count: deduction?.installment_count || null,
      is_active: deduction?.is_active ?? true,
      effective_date: deduction?.effective_date || "",
      end_date: deduction?.end_date || null,
      description: deduction?.description || null,
    },
  });

  React.useEffect(() => {
    if (deduction) {
      reset({
        employee_id: deduction.employee_id,
        deduction_type: deduction.deduction_type as any,
        name: deduction.name,
        calculation_type: deduction.calculation_type as any,
        amount: deduction.amount,
        percentage: deduction.percentage,
        installment_count: deduction.installment_count,
        is_active: deduction.is_active,
        effective_date: deduction.effective_date,
        end_date: deduction.end_date,
        description: deduction.description,
      });
    }
  }, [deduction, reset]);

  const selectedEmployeeId = watch("employee_id");
  const calculationType = watch("calculation_type");
  const isActive = watch("is_active");

  const selectedEmployee = React.useMemo(
    () => employees.find((emp) => emp.id === selectedEmployeeId),
    [employees, selectedEmployeeId]
  );

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
            Edit Deduction
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Update deduction details.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            const updateData: UpdateDeductionDto = {};
            if (data.employee_id) updateData.employee_id = data.employee_id;
            if (data.deduction_type) updateData.deduction_type = data.deduction_type;
            if (data.name) updateData.name = data.name;
            if (data.calculation_type) updateData.calculation_type = data.calculation_type;
            if (data.amount !== undefined) updateData.amount = data.amount;
            if (data.percentage !== undefined) updateData.percentage = data.percentage;
            if (data.installment_count !== undefined) updateData.installment_count = data.installment_count;
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
              Employee
            </Label>
            <Select
              onValueChange={(value: string | null) => setValue("employee_id", value ?? "")}
              value={(selectedEmployeeId ?? "") as string}
            >
              <SelectTrigger id="employee_id" className="w-full">
                <SelectValue placeholder="Select an employee">
                  {selectedEmployee ? `${selectedEmployee.full_name} (${selectedEmployee.employee_code})` : "Select an employee"}
                </SelectValue>
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
              <Label htmlFor="deduction_type" className="text-sm font-medium">
                Deduction Type
              </Label>
              <Select
                onValueChange={(value) => setValue("deduction_type", value as any)}
                value={watch("deduction_type")}
              >
                <SelectTrigger id="deduction_type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="advance">Advance</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
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
                  <SelectItem value="installment">Installment</SelectItem>
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

            {calculationType === "installment" && (
              <div className="space-y-2">
                <Label htmlFor="installment_count" className="text-sm font-medium">
                  Installment Count
                </Label>
                <Input
                  id="installment_count"
                  type="number"
                  min="1"
                  {...register("installment_count", { valueAsNumber: true })}
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

