
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  departmentService,
  positionService,
  employmentTypeService,
} from "@/services/employee.service";
import { userService } from "@/services/user.service";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CreateEmployeeDto } from "@/types/employee";

const createEmployeeSchema = z.object({
  user_id: z.string().optional(),
  create_new_user: z.boolean().optional(),
  department_id: z.string().min(1, "Department is required"),
  position_id: z.string().min(1, "Position is required"),
  employment_type_id: z.string().min(1, "Employment type is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  hire_date: z.string().min(1, "Hire date is required"),
  probation_end_date: z.string().optional().nullable(),
  contract_end_date: z.string().optional().nullable(),
  status: z.enum(["active", "on_leave", "probation", "inactive", "terminated"]),
  salary: z.number().min(0).optional().nullable(),
  currency: z.string().optional().nullable(),
  employee_id_number: z.string().optional().nullable(),
  tax_id_number: z.string().optional().nullable(),
  sss_number: z.string().optional().nullable(),
  philhealth_number: z.string().optional().nullable(),
  pagibig_number: z.string().optional().nullable(),
  tax_dependents: z.number().min(0).max(10).optional().nullable(),
  tax_status: z.enum(["single", "married", "head_of_household"]).optional().nullable(),
  notes: z.string().optional().nullable(),
}).refine((data) => {
  if (!data.create_new_user && !data.user_id) {
    return false;
  }
  return true;
}, {
  message: "Either select an existing user or check 'Create new user account'",
  path: ["user_id"],
}).refine((data) => {
  if (data.probation_end_date && data.hire_date) {
    return new Date(data.probation_end_date) > new Date(data.hire_date);
  }
  return true;
}, {
  message: "Probation end date must be after hire date",
  path: ["probation_end_date"],
}).refine((data) => {
  if (data.contract_end_date && data.hire_date) {
    return new Date(data.contract_end_date) > new Date(data.hire_date);
  }
  return true;
}, {
  message: "Contract end date must be after hire date",
  path: ["contract_end_date"],
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

interface CreateEmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEmployeeDto) => void;
  isSubmitting: boolean;
  preSelectedUserId?: string | null;
}

export function CreateEmployeeForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  preSelectedUserId,
}: CreateEmployeeFormProps) {
  const [createNewUser, setCreateNewUser] = React.useState(false);
  const [emailDomain, setEmailDomain] = React.useState("rz.com");

  // Fetch email domain setting
  const { data: settingsData } = useQuery({
    queryKey: ["settings", "system"],
    queryFn: async () => {
      const response = await fetch("/api/settings?category=system");
      const data = await response.json();
      return data;
    },
  });

  React.useEffect(() => {
    if (settingsData?.data?.general) {
      const emailDomainSetting = settingsData.data.general.find(
        (s: any) => s.key === "employee_email_domain"
      );
      if (emailDomainSetting) {
        setEmailDomain(emailDomainSetting.value);
      }
    }
  }, [settingsData]);

  const { data: departmentsData } = useQuery({
    queryKey: ["departments", { activeOnly: true }],
    queryFn: () => departmentService.getAll(true),
  });

  const departments = React.useMemo(() => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData;
    if (departmentsData && typeof departmentsData === 'object' && 'data' in departmentsData) {
      const data = (departmentsData as { data: unknown }).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  }, [departmentsData]);

  const { data: positionsData } = useQuery({
    queryKey: ["positions", { activeOnly: true }],
    queryFn: () => positionService.getAll(true),
  });

  const { data: employmentTypesData } = useQuery({
    queryKey: ["employmentTypes", { activeOnly: true }],
    queryFn: () => employmentTypeService.getAll(true),
  });

  // Fetch users without employee records
  const { data: usersData } = useQuery({
    queryKey: ["users", "without-employee"],
    queryFn: async () => {
      const response = await userService.getUsersWithEmployeeStatus();
      // Filter to only users without employee records
      return (response.data?.users || []).filter((user: any) => !user.has_employee);
    },
  });

  const availableUsers = React.useMemo(() => {
    if (!usersData) return [];
    return usersData;
  }, [usersData]);

  const positions = React.useMemo(() => {
    if (!positionsData) return [];
    if (Array.isArray(positionsData)) return positionsData;
    if (positionsData && typeof positionsData === 'object' && 'data' in positionsData) {
      const data = (positionsData as { data: unknown }).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  }, [positionsData]);

  const employmentTypes = React.useMemo(() => {
    if (!employmentTypesData) return [];
    if (Array.isArray(employmentTypesData)) return employmentTypesData;
    if (employmentTypesData && typeof employmentTypesData === 'object' && 'data' in employmentTypesData) {
      const data = (employmentTypesData as { data: unknown }).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  }, [employmentTypesData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      user_id: "",
      create_new_user: false,
      department_id: "",
      position_id: "",
      employment_type_id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: null,
      date_of_birth: null,
      gender: null,
      address: null,
      city: null,
      state: null,
      postal_code: null,
      country: "Philippines",
      hire_date: "",
      probation_end_date: null,
      contract_end_date: null,
      status: "active",
      salary: null,
      currency: "PHP",
      employee_id_number: null,
      tax_id_number: null,
      sss_number: null,
      philhealth_number: null,
      pagibig_number: null,
      tax_dependents: 0,
      tax_status: "single",
      notes: null,
    },
  });

  React.useEffect(() => {
    if (!open) {
      reset();
      setCreateNewUser(false);
    } else if (preSelectedUserId) {
      // Pre-select user if provided
      setValue("user_id", preSelectedUserId, { shouldValidate: true });
      setCreateNewUser(false);
    }
  }, [open, reset, preSelectedUserId, setValue]);

  const selectedUserId = watch("user_id");
  const selectedDepartmentId = watch("department_id");
  const selectedPositionId = watch("position_id");
  const selectedEmploymentTypeId = watch("employment_type_id");
  const selectedStatus = watch("status");
  const selectedGender = watch("gender");
  const selectedTaxStatus = watch("tax_status");

  // Find selected items for display
  const selectedUser = React.useMemo(
    () => availableUsers.find((user: any) => String(user.id) === selectedUserId),
    [availableUsers, selectedUserId]
  );

  const selectedDepartment = React.useMemo(
    () => departments.find((dept) => dept.id === selectedDepartmentId),
    [departments, selectedDepartmentId]
  );

  const selectedPosition = React.useMemo(
    () => positions.find((pos) => pos.id === selectedPositionId),
    [positions, selectedPositionId]
  );

  const selectedEmploymentType = React.useMemo(
    () => employmentTypes.find((type) => type.id === selectedEmploymentTypeId),
    [employmentTypes, selectedEmploymentTypeId]
  );

  // Auto-fill name and email when user is selected
  React.useEffect(() => {
    if (selectedUserId && availableUsers.length > 0 && !createNewUser) {
      const selectedUser = availableUsers.find((u: any) => String(u.id) === selectedUserId);
      if (selectedUser) {
        // Split name into first and last name
        const nameParts = selectedUser.name?.split(" ") || [];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        
        setValue("first_name", firstName);
        setValue("last_name", lastName);
        setValue("email", selectedUser.email || "");
      }
    }
  }, [selectedUserId, availableUsers, setValue, createNewUser]);

  // Auto-generate email when creating new user
  React.useEffect(() => {
    if (createNewUser) {
      const firstName = watch("first_name");
      const lastName = watch("last_name");
      if (firstName && lastName) {
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`;
        setValue("email", email);
      }
    }
  }, [createNewUser, watch("first_name"), watch("last_name"), setValue, watch, emailDomain]);

  // Handle create new user checkbox
  const handleCreateNewUserChange = (checked: boolean) => {
    setCreateNewUser(checked);
    setValue("create_new_user", checked);
    if (checked) {
      setValue("user_id", "");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Create Employee
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Add a new employee to the system. Fill in all required information.
          </DialogDescription>
        </DialogHeader>
          <form
          onSubmit={handleSubmit((data) => {
            onSubmit({
              ...data,
              user_id: data.create_new_user ? undefined : data.user_id,
              create_new_user: data.create_new_user,
              phone: data.phone || undefined,
              date_of_birth: data.date_of_birth || undefined,
              gender: data.gender || undefined,
              address: data.address || undefined,
              city: data.city || undefined,
              state: data.state || undefined,
              postal_code: data.postal_code || undefined,
              country: data.country || undefined,
              probation_end_date: data.probation_end_date || undefined,
              contract_end_date: data.contract_end_date || undefined,
              salary: data.salary || undefined,
              currency: data.currency || "PHP",
              employee_id_number: data.employee_id_number || undefined,
              tax_id_number: data.tax_id_number || undefined,
              sss_number: data.sss_number || undefined,
              philhealth_number: data.philhealth_number || undefined,
              pagibig_number: data.pagibig_number || undefined,
              tax_dependents: data.tax_dependents || 0,
              tax_status: data.tax_status || "single",
              notes: data.notes || undefined,
            });
          })}
          className="space-y-6 mt-6"
        >
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="government">Government</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                  <Checkbox
                    id="create_new_user"
                    checked={createNewUser}
                    onCheckedChange={handleCreateNewUserChange}
                  />
                  <Label htmlFor="create_new_user" className="text-sm font-medium cursor-pointer">
                    Create new user account with @rz.com email
                  </Label>
                </div>

                {!createNewUser && (
                  <div className="space-y-2">
                    <Label htmlFor="user_id" className="text-sm font-medium">
                      User <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("user_id", value || "", { shouldValidate: true })}
                      value={selectedUserId}
                    >
                      <SelectTrigger id="user_id" className="w-full">
                        <SelectValue placeholder="Select a user (must not have employee record)">
                          {selectedUser ? `${selectedUser.name} (${selectedUser.email})` : "Select a user (must not have employee record)"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.length === 0 ? (
                          <SelectItem value="" disabled>
                            No users available (all users already have employee records)
                          </SelectItem>
                        ) : (
                          availableUsers.map((user: any) => (
                            <SelectItem key={user.id} value={String(user.id)}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.user_id && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.user_id.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Only users without employee records are shown. Name and email will be auto-filled.
                    </p>
                  </div>
                )}

                {createNewUser && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      A new user account will be created automatically with email: <strong>{watch("first_name") && watch("last_name") ? `${watch("first_name")?.toLowerCase()}.${watch("last_name")?.toLowerCase()}@${emailDomain}` : `[firstname].[lastname]@${emailDomain}`}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    {...register("first_name")}
                    placeholder="Enter first name"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    {...register("last_name")}
                    placeholder="Enter last name"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-sm font-medium">
                    Date of Birth
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    {...register("date_of_birth")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("gender", value as any)}
                    value={selectedGender || ""}
                  >
                    <SelectTrigger id="gender" className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department_id" className="text-sm font-medium">
                    Department <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("department_id", value || "", { shouldValidate: true })}
                    value={selectedDepartmentId}
                  >
                    <SelectTrigger id="department_id" className="w-full">
                      <SelectValue placeholder="Select department">
                        {selectedDepartment ? selectedDepartment.name : "Select department"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department_id && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.department_id.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position_id" className="text-sm font-medium">
                    Position <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("position_id", value || "", { shouldValidate: true })}
                    value={selectedPositionId}
                  >
                    <SelectTrigger id="position_id" className="w-full">
                      <SelectValue placeholder="Select position">
                        {selectedPosition ? selectedPosition.name : "Select position"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {positions?.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.position_id && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.position_id.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employment_type_id" className="text-sm font-medium">
                    Employment Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("employment_type_id", value || "", { shouldValidate: true })}
                    value={selectedEmploymentTypeId}
                  >
                    <SelectTrigger id="employment_type_id" className="w-full">
                      <SelectValue placeholder="Select employment type">
                        {selectedEmploymentType ? selectedEmploymentType.name : "Select employment type"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.employment_type_id && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.employment_type_id.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("status", value as any, { shouldValidate: true })}
                    value={selectedStatus}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="probation">Probation</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hire_date" className="text-sm font-medium">
                    Hire Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="hire_date"
                    type="date"
                    {...register("hire_date")}
                  />
                  {errors.hire_date && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.hire_date.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="probation_end_date" className="text-sm font-medium">
                    Probation End Date
                  </Label>
                  <Input
                    id="probation_end_date"
                    type="date"
                    {...register("probation_end_date")}
                  />
                  {errors.probation_end_date && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.probation_end_date.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_end_date" className="text-sm font-medium">
                    Contract End Date
                  </Label>
                  <Input
                    id="contract_end_date"
                    type="date"
                    {...register("contract_end_date")}
                  />
                  {errors.contract_end_date && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.contract_end_date.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary" className="text-sm font-medium">
                    Salary
                  </Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("salary", { valueAsNumber: true })}
                    placeholder="Enter monthly salary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium">
                    Currency
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("currency", value)}
                    value={watch("currency") || "PHP"}
                  >
                    <SelectTrigger id="currency" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Address
                </Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  placeholder="Enter street address"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium">
                    State/Province
                  </Label>
                  <Input
                    id="state"
                    {...register("state")}
                    placeholder="Enter state or province"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code" className="text-sm font-medium">
                    Postal Code
                  </Label>
                  <Input
                    id="postal_code"
                    {...register("postal_code")}
                    placeholder="Enter postal code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium">
                    Country
                  </Label>
                  <Input
                    id="country"
                    {...register("country")}
                    placeholder="Enter country"
                    defaultValue="Philippines"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="government" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_id_number" className="text-sm font-medium">
                    Employee ID Number
                  </Label>
                  <Input
                    id="employee_id_number"
                    {...register("employee_id_number")}
                    placeholder="Enter employee ID number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_id_number" className="text-sm font-medium">
                    Tax ID Number (TIN)
                  </Label>
                  <Input
                    id="tax_id_number"
                    {...register("tax_id_number")}
                    placeholder="Enter TIN"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sss_number" className="text-sm font-medium">
                    SSS Number
                  </Label>
                  <Input
                    id="sss_number"
                    {...register("sss_number")}
                    placeholder="Enter SSS number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="philhealth_number" className="text-sm font-medium">
                    PhilHealth Number
                  </Label>
                  <Input
                    id="philhealth_number"
                    {...register("philhealth_number")}
                    placeholder="Enter PhilHealth number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pagibig_number" className="text-sm font-medium">
                    Pag-IBIG Number
                  </Label>
                  <Input
                    id="pagibig_number"
                    {...register("pagibig_number")}
                    placeholder="Enter Pag-IBIG number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_status" className="text-sm font-medium">
                    Tax Status
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("tax_status", value as any)}
                    value={selectedTaxStatus || "single"}
                  >
                    <SelectTrigger id="tax_status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="head_of_household">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_dependents" className="text-sm font-medium">
                    Tax Dependents
                  </Label>
                  <Input
                    id="tax_dependents"
                    type="number"
                    min="0"
                    max="10"
                    {...register("tax_dependents", { valueAsNumber: true })}
                    placeholder="Number of dependents"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Enter any additional notes"
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
            >
              {isSubmitting ? "Creating..." : "Create Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

