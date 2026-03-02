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
import type { Termination, CreateTerminationDto } from "@/types/core-hr";

const terminationSchema = z.object({
  termination_to: z.string().min(1, "Termination to is required"),
  termination_type: z.string().optional().nullable(),
  termination_date: z.string().min(1, "Termination date is required"),
  notice_date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

type TerminationFormData = z.infer<typeof terminationSchema>;

interface TerminationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Termination | null;
  onSubmit: (data: CreateTerminationDto) => void;
  isSubmitting: boolean;
}

export function TerminationForm({ open, onOpenChange, editingItem, onSubmit, isSubmitting }: TerminationFormProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<TerminationFormData>({
    resolver: zodResolver(terminationSchema),
    defaultValues: {
      termination_to: "",
      termination_type: null,
      termination_date: "",
      notice_date: null,
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
          termination_to: editingItem.termination_to,
          termination_type: editingItem.termination_type || null,
          termination_date: editingItem.termination_date,
          notice_date: editingItem.notice_date || null,
          description: editingItem.description || null,
        });
      } else {
        reset({
          termination_to: "",
          termination_type: null,
          termination_date: "",
          notice_date: null,
          description: null,
        });
      }
    }
  }, [open, editingItem, reset]);

  const employees = employeesData?.data || [];

  const selectedEmployee = React.useMemo(
    () => employees.find((emp) => emp.id === watch("termination_to")),
    [employees, watch("termination_to")]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Edit Termination" : "Termination Info"}</DialogTitle>
          <DialogDescription>{editingItem ? "Update termination information" : "Add a new termination record"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="termination_to">Termination To <span className="text-destructive">*</span></Label>
            <Select value={watch("termination_to")} onValueChange={(value) => setValue("termination_to", value || "", { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Employee...">
                  {selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : "Select Employee..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>{employees.map((employee) => (<SelectItem key={employee.id} value={employee.id}>{employee.first_name} {employee.last_name}</SelectItem>))}</SelectContent>
            </Select>
            {errors.termination_to && <p className="text-sm text-destructive">{errors.termination_to.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="termination_type">Termination Type</Label>
            <Select value={watch("termination_type") || ""} onValueChange={(value) => setValue("termination_type", value || null)}>
              <SelectTrigger><SelectValue placeholder="Termination Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                <SelectItem value="Voluntary">Voluntary</SelectItem>
                <SelectItem value="Involuntary">Involuntary</SelectItem>
                <SelectItem value="Retirement">Retirement</SelectItem>
                <SelectItem value="End of Contract">End of Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="termination_date">Termination Date <span className="text-destructive">*</span></Label>
              <Input id="termination_date" type="date" {...register("termination_date")} />
              {errors.termination_date && <p className="text-sm text-destructive">{errors.termination_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice_date">Notice Date</Label>
              <Input id="notice_date" type="date" {...register("notice_date")} />
            </div>
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
