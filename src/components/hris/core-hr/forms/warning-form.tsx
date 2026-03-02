import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { employeeService } from "@/services/employee.service";
import type { Warning, CreateWarningDto } from "@/types/core-hr";

const warningSchema = z.object({
  warning_to: z.string().min(1, "Warning to is required"),
  warning_type: z.string().optional().nullable(),
  subject: z.string().min(1, "Subject is required"),
  warning_date: z.string().min(1, "Warning date is required"),
  description: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
});

type WarningFormData = z.infer<typeof warningSchema>;

interface WarningFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Warning | null;
  onSubmit: (data: CreateWarningDto) => void;
  isSubmitting: boolean;
}

export function WarningForm({ open, onOpenChange, editingItem, onSubmit, isSubmitting }: WarningFormProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<WarningFormData>({
    resolver: zodResolver(warningSchema),
    defaultValues: {
      warning_to: "",
      warning_type: null,
      subject: "",
      warning_date: "",
      description: null,
      status: null,
    },
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeService.getAll({ per_page: 9999 }),
  });

  React.useEffect(() => {
    if (open) {
      if (editingItem) {
        reset({
          warning_to: editingItem.warning_to,
          warning_type: editingItem.warning_type || null,
          subject: editingItem.subject,
          warning_date: editingItem.warning_date,
          description: editingItem.description || null,
          status: editingItem.status || null,
        });
      } else {
        reset({
          warning_to: "",
          warning_type: null,
          subject: "",
          warning_date: "",
          description: null,
          status: null,
        });
      }
    }
  }, [open, editingItem, reset]);

  const employees = employeesData?.data || [];

  const selectedEmployee = React.useMemo(
    () => employees.find((emp) => emp.id === watch("warning_to")),
    [employees, watch("warning_to")]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Edit Warning" : "Add Warning"}</DialogTitle>
          <DialogDescription>{editingItem ? "Update warning information" : "Add a new warning record"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="warning_to">Warning To <span className="text-destructive">*</span></Label>
            <Select value={watch("warning_to")} onValueChange={(value) => setValue("warning_to", value || "", { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Employee...">
                  {selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : "Select Employee..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>{employees.map((employee) => (<SelectItem key={employee.id} value={employee.id}>{employee.first_name} {employee.last_name}</SelectItem>))}</SelectContent>
            </Select>
            {errors.warning_to && <p className="text-sm text-destructive">{errors.warning_to.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warning_type">Warning Type</Label>
              <Select value={watch("warning_type") || ""} onValueChange={(value) => setValue("warning_type", value || null)}>
                <SelectTrigger><SelectValue placeholder="Warning Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="Verbal">Verbal</SelectItem>
                  <SelectItem value="Written">Written</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={watch("status") || ""} onValueChange={(value) => setValue("status", value || null)}>
                <SelectTrigger><SelectValue placeholder="Select Status..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
            <Input id="subject" {...register("subject")} placeholder="Subject" />
            {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="warning_date">Warning Date <span className="text-destructive">*</span></Label>
            <Input id="warning_date" type="date" {...register("warning_date")} />
            {errors.warning_date && <p className="text-sm text-destructive">{errors.warning_date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Description" rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingItem ? "Update" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
