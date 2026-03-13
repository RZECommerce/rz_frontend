import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CreateLeaveTypeDto, UpdateLeaveTypeDto, LeaveType } from "@/types/leave";

const leaveTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  max_days_per_year: z.number().min(0).optional().nullable(),
  requires_approval: z.boolean().default(true),
  is_paid: z.boolean().default(true),
  can_carry_over: z.boolean().default(false),
  max_carry_over_days: z.number().min(0).optional().nullable(),
  is_active: z.boolean().default(true),
}).refine((data) => {
  if (data.can_carry_over && data.max_carry_over_days !== null && data.max_carry_over_days !== undefined) {
    return data.max_carry_over_days >= 0;
  }
  return true;
}, {
  message: "Max carry over days must be 0 or greater",
  path: ["max_carry_over_days"],
});

type LeaveTypeFormData = z.infer<typeof leaveTypeSchema>;

interface LeaveTypeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingLeaveType: LeaveType | null;
  onSubmit: (data: CreateLeaveTypeDto | UpdateLeaveTypeDto) => void;
  isSubmitting: boolean;
}

export function LeaveTypeForm({
  open,
  onOpenChange,
  editingLeaveType,
  onSubmit,
  isSubmitting,
}: LeaveTypeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LeaveTypeFormData>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      name: "",
      description: null,
      max_days_per_year: null,
      requires_approval: true,
      is_paid: true,
      can_carry_over: false,
      max_carry_over_days: null,
      is_active: true,
    },
  });

  const requiresApproval = watch("requires_approval");
  const isPaid = watch("is_paid");
  const canCarryOver = watch("can_carry_over");
  const isActive = watch("is_active");

  React.useEffect(() => {
    if (editingLeaveType) {
      setValue("name", editingLeaveType.name);
      setValue("description", editingLeaveType.description || null);
      setValue("max_days_per_year", editingLeaveType.max_days_per_year || null);
      setValue("requires_approval", editingLeaveType.requires_approval);
      setValue("is_paid", editingLeaveType.is_paid);
      setValue("can_carry_over", editingLeaveType.can_carry_over);
      setValue("max_carry_over_days", editingLeaveType.max_carry_over_days || null);
      setValue("is_active", editingLeaveType.is_active);
    } else {
      reset({
        name: "",
        description: null,
        max_days_per_year: null,
        requires_approval: true,
        is_paid: true,
        can_carry_over: false,
        max_carry_over_days: null,
        is_active: true,
      });
    }
  }, [editingLeaveType, setValue, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto font-sans [&_[data-slot=button][data-variant=outline]]:border-primary/20 [&_[data-slot=button][data-variant=outline]]:hover:bg-primary/5 [&_[data-slot=button][data-variant=ghost]]:hover:bg-primary/5">
        <DialogHeader className="border-b border-border/60 pb-4">
          <DialogTitle>
            {editingLeaveType ? "Edit Leave Type" : "Create Leave Type"}
          </DialogTitle>
          <DialogDescription>
            {editingLeaveType
              ? "Update the leave type information below."
              : "Fill in the information to create a new leave type."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Sick Leave, Vacation Leave"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_days_per_year">Max Days Per Year</Label>
              <Input
                id="max_days_per_year"
                type="number"
                min="0"
                {...register("max_days_per_year", {
                  setValueAs: (v) => {
                    if (v === "" || v === null || v === undefined) return null;
                    const num = Number(v);
                    return isNaN(num) ? null : num;
                  },
                })}
                placeholder="Leave empty for unlimited"
              />
              {errors.max_days_per_year && (
                <p className="text-sm text-destructive">
                  {errors.max_days_per_year.message}
                </p>
              )}
            </div>

            {canCarryOver && (
              <div className="space-y-2">
                <Label htmlFor="max_carry_over_days">Max Carry Over Days</Label>
                <Input
                  id="max_carry_over_days"
                  type="number"
                  min="0"
                  {...register("max_carry_over_days", {
                    setValueAs: (v) => {
                      if (v === "" || v === null || v === undefined) return null;
                      const num = Number(v);
                      return isNaN(num) ? null : num;
                    },
                  })}
                  placeholder="0"
                />
                {errors.max_carry_over_days && (
                  <p className="text-sm text-destructive">
                    {errors.max_carry_over_days.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requires_approval"
                checked={requiresApproval}
                onCheckedChange={(checked) => setValue("requires_approval", !!checked)}
                aria-label="Requires Approval"
              />
              <Label htmlFor="requires_approval" className="font-normal cursor-pointer">
                Requires Approval
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_paid"
                checked={isPaid}
                onCheckedChange={(checked) => setValue("is_paid", !!checked)}
                aria-label="Is Paid"
              />
              <Label htmlFor="is_paid" className="font-normal cursor-pointer">
                Is Paid Leave
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="can_carry_over"
                checked={canCarryOver}
                onCheckedChange={(checked) => setValue("can_carry_over", !!checked)}
                aria-label="Can Carry Over"
              />
              <Label htmlFor="can_carry_over" className="font-normal cursor-pointer">
                Can Carry Over to Next Year
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue("is_active", !!checked)}
                aria-label="Active"
              />
              <Label htmlFor="is_active" className="font-normal cursor-pointer">
                Active
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingLeaveType ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
