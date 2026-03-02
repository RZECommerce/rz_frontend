import * as React from "react";
import { useQuery } from "@tanstack/react-query";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { employeeService, departmentService } from "@/services/employee.service";
import type { Award, CreateAwardDto } from "@/types/core-hr";

const awardSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  department_id: z.string().optional().nullable(),
  award_type: z.string().min(1, "Award type is required"),
  gift: z.string().optional().nullable(),
  cash: z.number().optional().nullable(),
  award_information: z.string().optional().nullable(),
  award_date: z.string().min(1, "Award date is required"),
  award_photo: z.string().optional().nullable(),
});

type AwardFormData = z.infer<typeof awardSchema>;

interface AwardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Award | null;
  onSubmit: (data: CreateAwardDto) => void;
  isSubmitting: boolean;
}

export function AwardForm({
  open,
  onOpenChange,
  editingItem,
  onSubmit,
  isSubmitting,
}: AwardFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AwardFormData>({
    resolver: zodResolver(awardSchema),
    defaultValues: {
      employee_id: "",
      department_id: null,
      award_type: "",
      gift: null,
      cash: null,
      award_information: null,
      award_date: "",
      award_photo: null,
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
          award_type: editingItem.award_type,
          gift: editingItem.gift || null,
          cash: editingItem.cash || null,
          award_information: editingItem.award_information || null,
          award_date: editingItem.award_date,
          award_photo: editingItem.award_photo || null,
        });
      } else {
        reset({
          employee_id: "",
          department_id: null,
          award_type: "",
          gift: null,
          cash: null,
          award_information: null,
          award_date: "",
          award_photo: null,
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
          <DialogTitle>{editingItem ? "Edit Award" : "Add Award"}</DialogTitle>
          <DialogDescription>
            {editingItem ? "Update award information" : "Add a new award record"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee_id">
              Employee <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("employee_id")}
              onValueChange={(value) => setValue("employee_id", value || "", { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Employee...">
                  {selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : "Select Employee..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employee_id && (
              <p className="text-sm text-destructive">{errors.employee_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department_id">Department</Label>
              <Select
                value={watch("department_id") || ""}
                onValueChange={(value) => setValue("department_id", value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department...">
                    {selectedDepartment ? selectedDepartment.name : "Select Department..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {departments?.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="award_type">
                Award Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("award_type")}
                onValueChange={(value) => setValue("award_type", value || "", { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Award Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee of the Month">Employee of the Month</SelectItem>
                  <SelectItem value="Employee of the Year">Employee of the Year</SelectItem>
                  <SelectItem value="Outstanding Performance">Outstanding Performance</SelectItem>
                  <SelectItem value="Long Service">Long Service</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.award_type && (
                <p className="text-sm text-destructive">{errors.award_type.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gift">Gift</Label>
              <Input id="gift" {...register("gift")} placeholder="Gift" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash">Cash</Label>
              <Input
                id="cash"
                type="number"
                step="0.01"
                {...register("cash", { valueAsNumber: true })}
                placeholder="Cash"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="award_information">Award Information</Label>
            <Textarea
              id="award_information"
              {...register("award_information")}
              placeholder="Award Information"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="award_date">
              Award Date <span className="text-destructive">*</span>
            </Label>
            <Input id="award_date" type="date" {...register("award_date")} />
            {errors.award_date && (
              <p className="text-sm text-destructive">{errors.award_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="award_photo">Award Photo</Label>
            <Input id="award_photo" type="file" {...register("award_photo")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
