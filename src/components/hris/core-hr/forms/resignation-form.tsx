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
import { employeeService, departmentService } from "@/services/employee.service";
import type { Resignation, CreateResignationDto } from "@/types/core-hr";

const resignationSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  department_id: z.string().optional().nullable(),
  resignation_date: z.string().min(1, "Resignation date is required"),
  notice_date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

type ResignationFormData = z.infer<typeof resignationSchema>;

interface ResignationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Resignation | null;
  onSubmit: (data: CreateResignationDto) => void;
  isSubmitting: boolean;
}

export function ResignationForm({ open, onOpenChange, editingItem, onSubmit, isSubmitting }: ResignationFormProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ResignationFormData>({
    resolver: zodResolver(resignationSchema),
    defaultValues: {
      employee_id: "",
      department_id: null,
      resignation_date: "",
      notice_date: null,
      description: null,
    },
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeService.getAll({ per_page: 9999 }),
  });

  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(true),
  });

  React.useEffect(() => {
    if (open) {
      if (editingItem) {
        reset({
          employee_id: editingItem.employee_id,
          department_id: editingItem.department_id || null,
          resignation_date: editingItem.resignation_date,
          notice_date: editingItem.notice_date || null,
          description: editingItem.description || null,
        });
      } else {
        reset({
          employee_id: "",
          department_id: null,
          resignation_date: "",
          notice_date: null,
          description: null,
        });
      }
    }
  }, [open, editingItem, reset]);

  const employees = employeesData?.data || [];
  const departments = React.useMemo(() => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData;
    return [];
  }, [departmentsData]);

  const selectedEmployee = React.useMemo(
    () => employees.find((emp) => emp.id === watch("employee_id")),
    [employees, watch("employee_id")]
  );

  const selectedDepartment = React.useMemo(
    () => departments.find((dept) => dept.id === watch("department_id")),
    [departments, watch("department_id")]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Edit Resignation" : "Add Resignation"}</DialogTitle>
          <DialogDescription>{editingItem ? "Update resignation information" : "Add a new resignation record"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee_id">Employee <span className="text-destructive">*</span></Label>
            <Select value={watch("employee_id")} onValueChange={(value) => setValue("employee_id", value || "", { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Employee...">
                  {selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : "Select Employee..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>{employees.map((employee) => (<SelectItem key={employee.id} value={employee.id}>{employee.first_name} {employee.last_name}</SelectItem>))}</SelectContent>
            </Select>
            {errors.employee_id && <p className="text-sm text-destructive">{errors.employee_id.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="department_id">Department</Label>
            <Select value={watch("department_id") || ""} onValueChange={(value) => setValue("department_id", value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department...">
                  {selectedDepartment ? selectedDepartment.name : "Select Department..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {departments?.map((department) => (<SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resignation_date">Resignation Date <span className="text-destructive">*</span></Label>
              <Input id="resignation_date" type="date" {...register("resignation_date")} />
              {errors.resignation_date && <p className="text-sm text-destructive">{errors.resignation_date.message}</p>}
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
