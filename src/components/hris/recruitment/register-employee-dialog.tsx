import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  departmentService,
  employmentTypeService,
  positionService,
} from "@/services/employee.service";
import type { Candidate } from "@/types/recruitment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const registerEmployeeSchema = z.object({
  position_id: z.string().min(1, "Position is required"),
  department_id: z.string().min(1, "Department is required"),
  employment_type_id: z.string().min(1, "Employment type is required"),
  hire_date: z.string().min(1, "Hire date is required"),
  salary: z.string().optional(),
});

type RegisterEmployeeFormData = z.infer<typeof registerEmployeeSchema>;

interface RegisterEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  onSubmit: (data: {
    position_id: string;
    department_id: string;
    employment_type_id: string;
    hire_date: string;
    salary?: number;
  }) => void;
  isSubmitting: boolean;
}

export function RegisterEmployeeDialog({
  open,
  onOpenChange,
  candidate,
  onSubmit,
  isSubmitting,
}: RegisterEmployeeDialogProps) {
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(false),
  });

  const { data: positions = [] } = useQuery({
    queryKey: ["positions"],
    queryFn: () => positionService.getAll(false),
  });

  const { data: employmentTypes = [] } = useQuery({
    queryKey: ["employment-types"],
    queryFn: () => employmentTypeService.getAll(false),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<RegisterEmployeeFormData>({
    resolver: zodResolver(registerEmployeeSchema),
    defaultValues: {
      position_id: candidate?.job_posting?.position_id || "",
      department_id: candidate?.job_posting?.department_id || "",
      employment_type_id: candidate?.job_posting?.employment_type_id || "",
      hire_date: new Date().toISOString().split("T")[0],
      salary: "",
    },
  });

  const selectedDepartment = React.useMemo(
    () => departments.find((dept) => dept.id === watch("department_id")),
    [departments, watch]
  );

  const selectedPosition = React.useMemo(
    () => positions.find((pos) => pos.id === watch("position_id")),
    [positions, watch]
  );

  const selectedEmploymentType = React.useMemo(
    () => employmentTypes.find((type) => type.id === watch("employment_type_id")),
    [employmentTypes, watch]
  );

  React.useEffect(() => {
    if (open && candidate) {
      reset({
        position_id: candidate?.job_posting?.position_id || "",
        department_id: candidate?.job_posting?.department_id || "",
        employment_type_id: candidate?.job_posting?.employment_type_id || "",
        hire_date: new Date().toISOString().split("T")[0],
        salary: "",
      });
    }
  }, [open, candidate, reset]);

  const onFormSubmit = (data: RegisterEmployeeFormData) => {
    onSubmit({
      position_id: data.position_id,
      department_id: data.department_id,
      employment_type_id: data.employment_type_id,
      hire_date: data.hire_date,
      salary: data.salary ? parseFloat(data.salary) : undefined,
    });
  };

  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Register Employee</DialogTitle>
          <DialogDescription>
            Convert {candidate.first_name} {candidate.last_name} to an employee
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={candidate.first_name} disabled />
            </div>

            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={candidate.last_name} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={candidate.email} disabled />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={candidate.phone || "N/A"} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department_id">
              Department <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="department_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department">
                      {field.value ? departments.find(d => d.id === field.value)?.name || field.value : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.department_id && (
              <p className="text-sm text-destructive">
                {errors.department_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position_id">
              Position (Role) <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="position_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position">
                      {field.value ? positions.find(p => p.id === field.value)?.name || field.value : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.position_id && (
              <p className="text-sm text-destructive">
                {errors.position_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employment_type_id">
              Employment Type <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="employment_type_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type">
                      {field.value ? employmentTypes.find(t => t.id === field.value)?.name || field.value : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {employmentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.employment_type_id && (
              <p className="text-sm text-destructive">
                {errors.employment_type_id.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hire_date">
                Hire Date <span className="text-destructive">*</span>
              </Label>
              <Input id="hire_date" type="date" {...register("hire_date")} />
              {errors.hire_date && (
                <p className="text-sm text-destructive">
                  {errors.hire_date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary (Optional)</Label>
              <Input
                id="salary"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("salary")}
              />
              {errors.salary && (
                <p className="text-sm text-destructive">
                  {errors.salary.message}
                </p>
              )}
            </div>
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
              {isSubmitting ? "Registering..." : "Register Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
