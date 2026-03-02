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
import type { Transfer, CreateTransferDto } from "@/types/core-hr";

const transferSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  from_department_id: z.string().optional().nullable(),
  to_department_id: z.string().optional().nullable(),
  transfer_date: z.string().min(1, "Transfer date is required"),
  description: z.string().optional().nullable(),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Transfer | null;
  onSubmit: (data: CreateTransferDto) => void;
  isSubmitting: boolean;
}

export function TransferForm({ open, onOpenChange, editingItem, onSubmit, isSubmitting }: TransferFormProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      employee_id: "",
      from_department_id: null,
      to_department_id: null,
      transfer_date: "",
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
          from_department_id: editingItem.from_department_id || null,
          to_department_id: editingItem.to_department_id || null,
          transfer_date: editingItem.transfer_date,
          description: editingItem.description || null,
        });
      } else {
        reset({
          employee_id: "",
          from_department_id: null,
          to_department_id: null,
          transfer_date: "",
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

  const selectedFromDepartment = React.useMemo(
    () => departments.find((dept) => dept.id === watch("from_department_id")),
    [departments, watch("from_department_id")]
  );

  const selectedToDepartment = React.useMemo(
    () => departments.find((dept) => dept.id === watch("to_department_id")),
    [departments, watch("to_department_id")]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Edit Transfer" : "Transfer For"}</DialogTitle>
          <DialogDescription>{editingItem ? "Update transfer information" : "Add a new transfer record"}</DialogDescription>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_department_id">From Department</Label>
              <Select value={watch("from_department_id") || ""} onValueChange={(value) => setValue("from_department_id", value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select From Department...">
                    {selectedFromDepartment ? selectedFromDepartment.name : "Select From Department..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {departments?.map((department) => (<SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="to_department_id">To Department</Label>
              <Select value={watch("to_department_id") || ""} onValueChange={(value) => setValue("to_department_id", value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select To Department...">
                    {selectedToDepartment ? selectedToDepartment.name : "Select To Department..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {departments?.map((department) => (<SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer_date">Transfer Date <span className="text-destructive">*</span></Label>
            <Input id="transfer_date" type="date" {...register("transfer_date")} />
            {errors.transfer_date && <p className="text-sm text-destructive">{errors.transfer_date.message}</p>}
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
