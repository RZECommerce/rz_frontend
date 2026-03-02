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
import type { Complaint, CreateComplaintDto } from "@/types/core-hr";

const complaintSchema = z.object({
  complaint_from: z.string().min(1, "Complaint from is required"),
  complaint_against: z.string().min(1, "Complaint against is required"),
  complaint_title: z.string().min(1, "Complaint title is required"),
  complaint_date: z.string().min(1, "Complaint date is required"),
  description: z.string().optional().nullable(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

interface ComplaintFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Complaint | null;
  onSubmit: (data: CreateComplaintDto) => void;
  isSubmitting: boolean;
}

export function ComplaintForm({ open, onOpenChange, editingItem, onSubmit, isSubmitting }: ComplaintFormProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      complaint_from: "",
      complaint_against: "",
      complaint_title: "",
      complaint_date: "",
      description: null,
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
          complaint_from: editingItem.complaint_from,
          complaint_against: editingItem.complaint_against,
          complaint_title: editingItem.complaint_title,
          complaint_date: editingItem.complaint_date,
          description: editingItem.description || null,
        });
      } else {
        reset({
          complaint_from: "",
          complaint_against: "",
          complaint_title: "",
          complaint_date: "",
          description: null,
        });
      }
    }
  }, [open, editingItem, reset]);

  const employees = employeesData?.data || [];

  const selectedComplaintFrom = React.useMemo(
    () => employees.find((emp) => emp.id === watch("complaint_from")),
    [employees, watch("complaint_from")]
  );

  const selectedComplaintAgainst = React.useMemo(
    () => employees.find((emp) => emp.id === watch("complaint_against")),
    [employees, watch("complaint_against")]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Edit Complaint" : "Add Complaint"}</DialogTitle>
          <DialogDescription>{editingItem ? "Update complaint information" : "Add a new complaint record"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="complaint_from">Complaint From <span className="text-destructive">*</span></Label>
              <Select value={watch("complaint_from")} onValueChange={(value) => setValue("complaint_from", value || "", { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee...">
                    {selectedComplaintFrom ? `${selectedComplaintFrom.first_name} ${selectedComplaintFrom.last_name}` : "Select Employee..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>{employees.map((employee) => (<SelectItem key={employee.id} value={employee.id}>{employee.first_name} {employee.last_name}</SelectItem>))}</SelectContent>
              </Select>
              {errors.complaint_from && <p className="text-sm text-destructive">{errors.complaint_from.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="complaint_against">Complaint Against <span className="text-destructive">*</span></Label>
              <Select value={watch("complaint_against")} onValueChange={(value) => setValue("complaint_against", value || "", { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee...">
                    {selectedComplaintAgainst ? `${selectedComplaintAgainst.first_name} ${selectedComplaintAgainst.last_name}` : "Select Employee..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>{employees.map((employee) => (<SelectItem key={employee.id} value={employee.id}>{employee.first_name} {employee.last_name}</SelectItem>))}</SelectContent>
              </Select>
              {errors.complaint_against && <p className="text-sm text-destructive">{errors.complaint_against.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="complaint_title">Complaint Title <span className="text-destructive">*</span></Label>
            <Input id="complaint_title" {...register("complaint_title")} placeholder="Title" />
            {errors.complaint_title && <p className="text-sm text-destructive">{errors.complaint_title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="complaint_date">Complaint Date</Label>
            <Input id="complaint_date" type="date" {...register("complaint_date")} />
            {errors.complaint_date && <p className="text-sm text-destructive">{errors.complaint_date.message}</p>}
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
