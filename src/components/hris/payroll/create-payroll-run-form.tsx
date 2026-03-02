
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { payrollPeriodService } from "@/services/payroll.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight as ArrowRight01Icon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const createPayrollRunSchema = z.object({
  payroll_period_id: z.string().min(1, "Payroll period is required"),
  notes: z.string().optional().nullable(),
});

export type CreatePayrollRunFormData = z.infer<typeof createPayrollRunSchema>;

interface CreatePayrollRunFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePayrollRunFormData) => void;
  isSubmitting: boolean;
}

export function CreatePayrollRunForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreatePayrollRunFormProps) {
  const { data: payrollPeriodsData } = useQuery({
    queryKey: ["payrollPeriods"],
    queryFn: () => payrollPeriodService.getAll(true),
  });

  const payrollPeriods = Array.isArray(payrollPeriodsData) ? payrollPeriodsData : [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreatePayrollRunFormData>({
    resolver: zodResolver(createPayrollRunSchema),
    defaultValues: {
      payroll_period_id: "",
      notes: null,
    },
  });

  const selectedPeriodId = watch("payroll_period_id");

  const selectedPeriod = React.useMemo(
    () => payrollPeriods.find((period) => period.id === selectedPeriodId),
    [payrollPeriods, selectedPeriodId]
  );

  React.useEffect(() => {
    if (!open) {
      reset({
        payroll_period_id: "",
        notes: null,
      });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Create Payroll Run
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Create a new payroll run for a specific period. After creation, you can process it to calculate payroll for all employees.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit({
              ...data,
              notes: data.notes?.trim() || null,
            });
          })}
          className="space-y-6 mt-6"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="payroll_period_id" className="text-sm font-medium">
                Payroll Period <span className="text-destructive">*</span>
              </Label>
              <Link
                to="/hris/payroll/periods"
                className="text-xs text-primary hover:underline flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChange(false);
                }}
              >
                Manage Periods
                <ArrowRight01Icon className="size-5" />
              </Link>
            </div>
            <Select
              onValueChange={(value) => setValue("payroll_period_id", value || "", { shouldValidate: true })}
              value={selectedPeriodId}
            >
              <SelectTrigger id="payroll_period_id" className="w-full">
                <SelectValue placeholder="Select a payroll period">
                  {selectedPeriod ? selectedPeriod.name : "Select a payroll period"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {payrollPeriods.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No payroll periods available.{" "}
                    <Link
                      to="/hris/payroll/periods"
                      className="text-primary hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChange(false);
                      }}
                    >
                      Create one
                    </Link>
                  </div>
                ) : (
                  payrollPeriods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.payroll_period_id && (
              <p className="text-sm text-destructive mt-1">
                {errors.payroll_period_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Enter any notes (optional)"
              rows={4}
              className="resize-y min-h-[100px]"
            />
            {errors.notes && (
              <p className="text-sm text-destructive mt-1">
                {errors.notes.message}
              </p>
            )}
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

