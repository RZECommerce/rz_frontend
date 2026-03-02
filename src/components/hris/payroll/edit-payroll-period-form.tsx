
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { payrollPeriodService } from "@/services/payroll.service";
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
import type { UpdatePayrollPeriodDto } from "@/types/payroll";

const updatePayrollPeriodSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  type: z.enum(["monthly", "semi_monthly", "weekly", "bi_weekly"]).optional(),
  start_date: z.string().min(1, "Start date is required").optional(),
  end_date: z.string().min(1, "End date is required").optional(),
  pay_date: z.string().min(1, "Pay date is required").optional(),
  is_active: z.boolean().optional(),
  is_locked: z.boolean().optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end > start;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["end_date"],
});

export type UpdatePayrollPeriodFormData = z.infer<typeof updatePayrollPeriodSchema>;

interface EditPayrollPeriodFormProps {
  periodId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdatePayrollPeriodDto) => void;
  isSubmitting: boolean;
}

export function EditPayrollPeriodForm({
  periodId,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: EditPayrollPeriodFormProps) {
  const { data: period, isLoading } = useQuery({
    queryKey: ["payrollPeriod", periodId],
    queryFn: () => payrollPeriodService.getById(periodId),
    enabled: open && !!periodId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdatePayrollPeriodFormData>({
    resolver: zodResolver(updatePayrollPeriodSchema),
    defaultValues: {
      name: period?.name || "",
      type: period?.type || "monthly",
      start_date: period?.start_date || "",
      end_date: period?.end_date || "",
      pay_date: period?.pay_date || "",
      is_active: period?.is_active ?? true,
      is_locked: period?.is_locked ?? false,
    },
  });

  React.useEffect(() => {
    if (period) {
      reset({
        name: period.name,
        type: period.type,
        start_date: period.start_date,
        end_date: period.end_date,
        pay_date: period.pay_date,
        is_active: period.is_active,
        is_locked: period.is_locked,
      });
    }
  }, [period, reset]);

  const selectedType = watch("type");
  const isActive = watch("is_active");
  const isLocked = watch("is_locked");

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Edit Payroll Period
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Update payroll period details. Locked periods cannot be modified.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            const updateData: UpdatePayrollPeriodDto = {};
            if (data.name) updateData.name = data.name;
            if (data.type) updateData.type = data.type;
            if (data.start_date) updateData.start_date = data.start_date;
            if (data.end_date) updateData.end_date = data.end_date;
            if (data.pay_date) updateData.pay_date = data.pay_date;
            if (data.is_active !== undefined) updateData.is_active = data.is_active;
            if (data.is_locked !== undefined) updateData.is_locked = data.is_locked;
            onSubmit(updateData);
          })}
          className="space-y-6 mt-6"
        >
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              disabled={period?.is_locked}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Type <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("type", value as any, { shouldValidate: true })}
              value={selectedType}
              disabled={period?.is_locked}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Select period type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="semi_monthly">Semi-Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date" className="text-sm font-medium">
              Start Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="start_date"
              type="date"
              {...register("start_date")}
              disabled={period?.is_locked}
            />
            {errors.start_date && (
              <p className="text-sm text-destructive mt-1">{errors.start_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date" className="text-sm font-medium">
              End Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="end_date"
              type="date"
              {...register("end_date")}
              disabled={period?.is_locked}
            />
            {errors.end_date && (
              <p className="text-sm text-destructive mt-1">{errors.end_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay_date" className="text-sm font-medium">
              Pay Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pay_date"
              type="date"
              {...register("pay_date")}
              disabled={period?.is_locked}
            />
            {errors.pay_date && (
              <p className="text-sm text-destructive mt-1">{errors.pay_date.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", checked as boolean)}
              disabled={period?.is_locked}
            />
            <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
              Active
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_locked"
              checked={isLocked}
              onCheckedChange={(checked) => setValue("is_locked", checked as boolean)}
            />
            <Label htmlFor="is_locked" className="text-sm font-medium cursor-pointer">
              Lock Period (prevents modifications)
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
              disabled={isSubmitting || period?.is_locked}
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

