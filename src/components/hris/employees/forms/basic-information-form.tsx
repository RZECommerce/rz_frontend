import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  departmentService,
  positionService,
  employmentTypeService,
} from "@/services/employee.service";
import type { Employee } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/services/employee.service";
import { toast } from "sonner";
import type { UpdateEmployeeDto } from "@/types/employee";
import { format } from "date-fns";

const basicInfoSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  marital_status: z.string().optional(),
  department_id: z.string().min(1, "Department is required"),
  position_id: z.string().min(1, "Position is required"),
  employment_type_id: z.string().min(1, "Employment type is required"),
  status: z.enum(["active", "on_leave", "probation", "inactive", "terminated"]).optional(),
  hire_date: z.string().min(1, "Date of joining is required"),
  date_of_leaving: z.string().optional().nullable(),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface BasicInformationFormProps {
  employee: Employee;
  isEditMode?: boolean;
  onEditModeChange?: (isEdit: boolean) => void;
}

export function BasicInformationForm({ employee, isEditMode = false, onEditModeChange }: BasicInformationFormProps) {
  const queryClient = useQueryClient();

  const { data: departmentsData } = useQuery({
    queryKey: ["departments", { activeOnly: true }],
    queryFn: () => departmentService.getAll(true),
  });

  const { data: positionsData } = useQuery({
    queryKey: ["positions", { activeOnly: true }],
    queryFn: () => positionService.getAll(true),
  });

  const { data: employmentTypesData } = useQuery({
    queryKey: ["employmentTypes", { activeOnly: true }],
    queryFn: () => employmentTypeService.getAll(true),
  });

  const departments = React.useMemo(() => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData;
    return [];
  }, [departmentsData]);

  const positions = React.useMemo(() => {
    if (!positionsData) return [];
    if (Array.isArray(positionsData)) return positionsData;
    return [];
  }, [positionsData]);

  const employmentTypes = React.useMemo(() => {
    if (!employmentTypesData) return [];
    if (Array.isArray(employmentTypesData)) return employmentTypesData;
    return [];
  }, [employmentTypesData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      first_name: employee.first_name,
      last_name: employee.last_name,
      username: employee.user_id || "",
      email: employee.email,
      phone: employee.phone || "",
      address: employee.address || "",
      city: employee.city || "",
      state: employee.state || "",
      postal_code: employee.postal_code || "",
      country: employee.country || "",
      date_of_birth: employee.date_of_birth
        ? format(new Date(employee.date_of_birth), "yyyy-MM-dd")
        : "",
      gender: employee.gender,
      marital_status: "",
      department_id: employee.department?.id || "",
      position_id: employee.position?.id || "",
      employment_type_id: employee.employment_type?.id || "",
      status: employee.status,
      hire_date: employee.hire_date
        ? format(new Date(employee.hire_date), "yyyy-MM-dd")
        : "",
      date_of_leaving: employee.contract_end_date
        ? format(new Date(employee.contract_end_date), "yyyy-MM-dd")
        : null,
    },
  });

  // Reset form when employee changes
  React.useEffect(() => {
    reset({
      first_name: employee.first_name,
      last_name: employee.last_name,
      username: employee.user_id || "",
      email: employee.email,
      phone: employee.phone || "",
      address: employee.address || "",
      city: employee.city || "",
      state: employee.state || "",
      postal_code: employee.postal_code || "",
      country: employee.country || "",
      date_of_birth: employee.date_of_birth
        ? format(new Date(employee.date_of_birth), "yyyy-MM-dd")
        : "",
      gender: employee.gender,
      marital_status: "",
      department_id: employee.department?.id || "",
      position_id: employee.position?.id || "",
      employment_type_id: employee.employment_type?.id || "",
      status: employee.status,
      hire_date: employee.hire_date
        ? format(new Date(employee.hire_date), "yyyy-MM-dd")
        : "",
      date_of_leaving: employee.contract_end_date
        ? format(new Date(employee.contract_end_date), "yyyy-MM-dd")
        : null,
    });
  }, [employee, reset]);

  // Find selected items for display
  const selectedDepartment = React.useMemo(
    () => departments.find((dept) => dept.id === watch("department_id")),
    [departments, watch("department_id")]
  );

  const selectedPosition = React.useMemo(
    () => positions.find((pos) => pos.id === watch("position_id")),
    [positions, watch("position_id")]
  );

  const selectedEmploymentType = React.useMemo(
    () => employmentTypes.find((type) => type.id === watch("employment_type_id")),
    [employmentTypes, watch("employment_type_id")]
  );

  const updateEmployee = useMutation({
    mutationFn: (data: UpdateEmployeeDto) =>
      employeeService.update(employee.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", employee.id] });
      toast.success("Employee information updated successfully");
      onEditModeChange?.(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to update employee", {
        description: error.message,
      });
    },
  });

  const onSubmit = (data: BasicInfoFormData) => {
    updateEmployee.mutate({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      department_id: data.department_id,
      position_id: data.position_id,
      employment_type_id: data.employment_type_id,
      status: data.status,
      hire_date: data.hire_date,
      contract_end_date: data.date_of_leaving || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Fields marked with <span className="text-destructive">*</span> are
          required
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input id="first_name" {...register("first_name")} disabled={!isEditMode} />
            {errors.first_name && (
              <p className="text-sm text-destructive">
                {errors.first_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="Username"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} placeholder="Address" disabled={!isEditMode} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">ZIP</Label>
            <Input
              id="postal_code"
              {...register("postal_code")}
              placeholder="ZIP"
              disabled={!isEditMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={watch("gender") || ""}
              onValueChange={(value) => setValue("gender", value as any)}
              disabled={!isEditMode}
            >
              <SelectTrigger disabled={!isEditMode}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department_id">
              Department <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("department_id")}
              onValueChange={(value) => setValue("department_id", value || "")}
              disabled={!isEditMode}
            >
              <SelectTrigger disabled={!isEditMode}>
                <SelectValue placeholder="Select department">
                  {selectedDepartment ? selectedDepartment.name : "Select department"}
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
            {errors.department_id && (
              <p className="text-sm text-destructive">
                {errors.department_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("status") || ""}
              onValueChange={(value) => setValue("status", value as any)}
              disabled={!isEditMode}
            >
              <SelectTrigger disabled={!isEditMode}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="probation">Probation</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_leaving">Date Of Leaving</Label>
            <Input
              id="date_of_leaving"
              type="date"
              {...register("date_of_leaving")}
              disabled={!isEditMode}
            />
          </div>
        </div>

        {/* Middle Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="last_name">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input id="last_name" {...register("last_name")} disabled={!isEditMode} />
            {errors.last_name && (
              <p className="text-sm text-destructive">
                {errors.last_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} disabled={!isEditMode} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} placeholder="City" disabled={!isEditMode} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={watch("country") || ""}
              onValueChange={(value) => setValue("country", value || undefined)}
              disabled={!isEditMode}
            >
              <SelectTrigger disabled={!isEditMode}>
                <SelectValue placeholder="Select Country..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PH">Philippines</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="marital_status">Marital Status</Label>
            <Select
              value={watch("marital_status") || ""}
              onValueChange={(value) => setValue("marital_status", value || undefined)}
              disabled={!isEditMode}
            >
              <SelectTrigger disabled={!isEditMode}>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position_id">
              Designation <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("position_id")}
              onValueChange={(value) => setValue("position_id", value || "")}
              disabled={!isEditMode}
            >
              <SelectTrigger disabled={!isEditMode}>
                <SelectValue placeholder="Select position">
                  {selectedPosition ? selectedPosition.name : "Select position"}
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
            {errors.position_id && (
              <p className="text-sm text-destructive">
                {errors.position_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employment_type_id">
              Office Shift <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("employment_type_id")}
              onValueChange={(value) => setValue("employment_type_id", value || "")}
              disabled={!isEditMode}
            >
              <SelectTrigger disabled={!isEditMode}>
                <SelectValue placeholder="Select employment type">
                  {selectedEmploymentType ? selectedEmploymentType.name : "Select employment type"}
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
            {errors.employment_type_id && (
              <p className="text-sm text-destructive">
                {errors.employment_type_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hire_date">
              Date Of Joining <span className="text-destructive">*</span>
            </Label>
            <Input id="hire_date" type="date" {...register("hire_date")} disabled={!isEditMode} />
            {errors.hire_date && (
              <p className="text-sm text-destructive">
                {errors.hire_date.message}
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee_code">
              Staff Id <span className="text-destructive">*</span>
            </Label>
            <Input
              id="employee_code"
              value={employee.employee_code}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input id="phone" {...register("phone")} disabled={!isEditMode} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input id="state" {...register("state")} placeholder="State/Province" disabled={!isEditMode} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">
              Date Of Birth <span className="text-destructive">*</span>
            </Label>
            <Input id="date_of_birth" type="date" {...register("date_of_birth")} disabled={!isEditMode} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role"
              value={employee.position?.name || ""}
              disabled
              className="bg-muted"
            />
          </div>
        </div>
      </div>

      {isEditMode && (
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onEditModeChange?.(false);
            }}
            disabled={updateEmployee.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateEmployee.isPending}>
            {updateEmployee.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </form>
  );
}
