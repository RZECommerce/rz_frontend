
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
import type { CreateDeductionDto } from "@/types/payroll";

const createDeductionSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  deduction_type: z.enum(["loan", "advance", "insurance", "penalty", "other"]),
  name: z.string().min(1, "Name is required"),
  calculation_type: z.enum(["fixed", "percentage", "installment"]),
  amount: z.number().min(0, "Amount must be positive"),
  percentage: z.number().min(0).max(100).optional().nullable(),
  installment_count: z.number().min(1).optional().nullable(),
  is_active: z.boolean().optional(),
  effective_date: z.string().min(1, "Effective date is required"),
  end_date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
}).refine((data) => {
  if (data.calculation_type === "percentage" && !data.percentage) {
    return false;
  }
  if (data.calculation_type === "installment" && !data.installment_count) {
    return false;
  }
  return true;
}, {
  message: "Required field missing for calculation type",
  path: ["calculation_type"],
});

export type CreateDeductionFormData = z.infer<typeof createDeductionSchema>;

interface CreateDeductionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDeductionDto) => void;
  isSubmitting: boolean;
  defaultEmployeeId?: string;
}

export function CreateDeductionForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  defaultEmployeeId,
}: CreateDeductionFormProps) {
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
  } = useForm<CreateDeductionFormData>({
    resolver: zodResolver(createDeductionSchema),
    defaultValues: {
      employee_id: defaultEmployeeId || "",
      deduction_type: "loan",
      name: "",
      calculation_type: "fixed",
      amount: 0,
      percentage: null,
      installment_count: null,
      is_active: true,
      effective_date: new Date().toISOString().split('T')[0],
      end_date: null,
      description: null,
    },
  });

  const selectedEmployeeId = watch("employee_id");
  const calculationType = watch("calculation_type");
  const isActive = watch("is_active");

  React.useEffect(() => {
    if (!open) {
      reset({
        employee_id: defaultEmployeeId || "",
        deduction_type: "loan",
        name: "",
        calculation_type: "fixed",
        amount: 0,
        percentage: null,
        installment_count: null,
        is_active: true,
        effective_date: new Date().toISOString().split('T')[0],
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
            Create Deduction
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Add a new deduction (loan, advance, etc.) for an employee.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit({
              ...data,
              percentage: data.percentage || null,
              installment_count: data.installment_count || null,
              end_date: data.end_date || null,
              description: data.description || null,
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
              onValueChange={(value: string | null) => setValue("employee_id", value ?? "", { shouldValidate: true })}
              value={(selectedEmployeeId ?? "") as string}
              disabled={!!defaultEmployeeId}
            >
              <SelectTrigger id="employee_id" className="w-full" disabled={!!defaultEmployeeId}>
                <SelectValue placeholder="Select an employee">
                  {selectedEmployeeId ? (() => {
                    const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
                    return selectedEmployee ? `${selectedEmployee.full_name} (${selectedEmployee.employee_code})` : "Select an employee";
                  })() : "Select an employee"}
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
            {errors.employee_id && (
              <p className="text-sm text-destructive mt-1">{errors.employee_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deduction_type" className="text-sm font-medium">
                Deduction Type <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue("deduction_type", value as any, { shouldValidate: true })}
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
                  <SelectItem value="installment">Installment</SelectItem>
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
              placeholder="e.g., SSS Loan"
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

            {calculationType === "installment" && (
              <div className="space-y-2">
                <Label htmlFor="installment_count" className="text-sm font-medium">
                  Installment Count <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="installment_count"
                  type="number"
                  min="1"
                  {...register("installment_count", { valueAsNumber: true })}
                />
                {errors.installment_count && (
                  <p className="text-sm text-destructive mt-1">{errors.installment_count.message}</p>
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
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

