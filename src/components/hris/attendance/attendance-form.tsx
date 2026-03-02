
import * as React from "react";
import { useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Attendance } from "@/types/attendance";

const attendanceSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  time_in: z.string().optional().nullable(),
  time_out: z.string().optional().nullable(),
  break_start: z.string().optional().nullable(),
  break_end: z.string().optional().nullable(),
  status: z.enum(["present", "absent", "late", "half_day", "on_leave"]).optional(),
  late_minutes: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type AttendanceFormData = z.infer<typeof attendanceSchema>;

interface AttendanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Attendance | null;
  onSubmit: (data: AttendanceFormData) => void;
  isSubmitting: boolean;
}

export function AttendanceForm({
  open,
  onOpenChange,
  editingItem,
  onSubmit,
  isSubmitting,
}: AttendanceFormProps) {
  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeService.getAll({ per_page: 100 }),
  });

  const employees = Array.isArray(employeesData?.data) ? employeesData.data : [];

  const formatDateTimeForInput = (isoString: string | null): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employee_id: "",
      date: new Date().toISOString().split("T")[0],
      time_in: null,
      time_out: null,
      break_start: null,
      break_end: null,
      status: "present",
      late_minutes: null,
      notes: null,
    },
  });

  useEffect(() => {
    if (editingItem) {
      setValue("employee_id", editingItem.employee_id);
      setValue("date", editingItem.date);
      setValue("time_in", formatDateTimeForInput(editingItem.time_in));
      setValue("time_out", formatDateTimeForInput(editingItem.time_out));
      setValue("break_start", formatDateTimeForInput(editingItem.break_start));
      setValue("break_end", formatDateTimeForInput(editingItem.break_end));
      setValue("status", editingItem.status);
      setValue("late_minutes", editingItem.late_minutes || null);
      setValue("notes", editingItem.notes || null);
    } else {
      reset({
        employee_id: "",
        date: new Date().toISOString().split("T")[0],
        time_in: null,
        time_out: null,
        break_start: null,
        break_end: null,
        status: "present",
        late_minutes: null,
        notes: null,
      });
    }
  }, [editingItem, setValue, reset]);

  const timeInValue = watch("time_in");
  const timeOutValue = watch("time_out");

  // Clear dependent fields when time_in is removed
  useEffect(() => {
    if (!timeInValue) {
      setValue("time_out", null);
      setValue("break_start", null);
      setValue("break_end", null);
    }
  }, [timeInValue, setValue]);

  // Clear break fields when time_out is removed
  useEffect(() => {
    if (!timeOutValue) {
      setValue("break_start", null);
      setValue("break_end", null);
    }
  }, [timeOutValue, setValue]);

  const formatDateTimeForAPI = (datetimeLocal: string | null | undefined): string | null => {
    if (!datetimeLocal) return null;
    const date = new Date(datetimeLocal);
    return date.toISOString();
  };

  const handleFormSubmit = (data: AttendanceFormData) => {
    const formData = {
      ...data,
      time_in: formatDateTimeForAPI(data.time_in),
      time_out: formatDateTimeForAPI(data.time_out),
      break_start: formatDateTimeForAPI(data.break_start),
      break_end: formatDateTimeForAPI(data.break_end),
      late_minutes: data.late_minutes || null,
      notes: data.notes || null,
    };
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Edit" : "Create"} Attendance Record
          </DialogTitle>
          <DialogDescription>
            {editingItem
              ? "Update the attendance information below."
              : "Fill in the information to create a new attendance record."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee *</Label>
              <select
                id="employee_id"
                {...register("employee_id")}
                className="w-full px-3 py-2 rounded-md border bg-background"
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.employee_code})
                  </option>
                ))}
              </select>
              {errors.employee_id && (
                <p className="text-sm text-destructive">{errors.employee_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time_in">Time In</Label>
              <Input
                id="time_in"
                type="datetime-local"
                {...register("time_in")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_out">Time Out</Label>
              <Input
                id="time_out"
                type="datetime-local"
                {...register("time_out")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="break_start">Break Start</Label>
              <Input
                id="break_start"
                type="datetime-local"
                {...register("break_start")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="break_end">Break End</Label>
              <Input
                id="break_end"
                type="datetime-local"
                {...register("break_end")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...register("status")}
                className="w-full px-3 py-2 rounded-md border bg-background"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="late_minutes">Late Minutes</Label>
              <Input
                id="late_minutes"
                type="number"
                min="0"
                {...register("late_minutes", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              {...register("notes")}
              className="w-full px-3 py-2 rounded-md border bg-background min-h-[80px]"
              placeholder="Optional notes..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

