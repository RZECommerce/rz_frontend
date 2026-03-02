
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { employeeService } from "@/services/employee.service";
import type { Employee, UpdateEmployeeDto } from "@/types/employee";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel as Cancel01Icon, Edit as Edit01Icon, Save as FloppyDiskIcon } from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const governmentContributionsSchema = z.object({
  sss_number: z.string().optional().nullable(),
  philhealth_number: z.string().optional().nullable(),
  pagibig_number: z.string().optional().nullable(),
  tax_dependents: z.number().min(0).max(10).optional().nullable(),
  tax_status: z.enum(["single", "married", "head_of_household"]).optional().nullable(),
});

type GovernmentContributionsFormData = z.infer<typeof governmentContributionsSchema>;

interface EmployeeGovernmentContributionsProps {
  employeeId: string;
  employee: Employee;
}

export function EmployeeGovernmentContributions({
  employeeId,
  employee,
}: EmployeeGovernmentContributionsProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<GovernmentContributionsFormData>({
    resolver: zodResolver(governmentContributionsSchema),
    defaultValues: {
      sss_number: employee.sss_number || "",
      philhealth_number: employee.philhealth_number || "",
      pagibig_number: employee.pagibig_number || "",
      tax_dependents: employee.tax_dependents || 0,
      tax_status: employee.tax_status || "single",
    },
  });

  const taxStatus = watch("tax_status");

  const updateEmployee = useMutation({
    mutationFn: (data: UpdateEmployeeDto) =>
      employeeService.update(employee.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", employee.id] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating employee:", error);
      alert("Failed to update government contributions");
    },
  });

  const onSubmit = (data: GovernmentContributionsFormData) => {
    const updateData: UpdateEmployeeDto = {
      sss_number: data.sss_number || undefined,
      philhealth_number: data.philhealth_number || undefined,
      pagibig_number: data.pagibig_number || undefined,
      tax_dependents: data.tax_dependents || 0,
      tax_status: data.tax_status || "single",
    };
    updateEmployee.mutate(updateData);
  };

  const handleCancel = () => {
    reset({
      sss_number: employee.sss_number || "",
      philhealth_number: employee.philhealth_number || "",
      pagibig_number: employee.pagibig_number || "",
      tax_dependents: employee.tax_dependents || 0,
      tax_status: employee.tax_status || "single",
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Government Contributions</CardTitle>
            <CardDescription>
              Manage employee's SSS, PhilHealth, Pag-IBIG membership numbers and tax information
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit01Icon className="size-5" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sss_number" className="text-sm font-medium">
                SSS Number
              </Label>
              {isEditing ? (
                <>
                  <Input
                    id="sss_number"
                    {...register("sss_number")}
                    placeholder="Enter SSS membership number"
                  />
                  {errors.sss_number && (
                    <p className="text-sm text-destructive">{errors.sss_number.message}</p>
                  )}
                </>
              ) : (
                <p className="text-sm font-medium">
                  {employee.sss_number || (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="philhealth_number" className="text-sm font-medium">
                PhilHealth Number
              </Label>
              {isEditing ? (
                <>
                  <Input
                    id="philhealth_number"
                    {...register("philhealth_number")}
                    placeholder="Enter PhilHealth membership number"
                  />
                  {errors.philhealth_number && (
                    <p className="text-sm text-destructive">{errors.philhealth_number.message}</p>
                  )}
                </>
              ) : (
                <p className="text-sm font-medium">
                  {employee.philhealth_number || (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pagibig_number" className="text-sm font-medium">
                Pag-IBIG Number
              </Label>
              {isEditing ? (
                <>
                  <Input
                    id="pagibig_number"
                    {...register("pagibig_number")}
                    placeholder="Enter Pag-IBIG membership number"
                  />
                  {errors.pagibig_number && (
                    <p className="text-sm text-destructive">{errors.pagibig_number.message}</p>
                  )}
                </>
              ) : (
                <p className="text-sm font-medium">
                  {employee.pagibig_number || (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_status" className="text-sm font-medium">
                Tax Status
              </Label>
              {isEditing ? (
                <>
                  <Select
                    onValueChange={(value) => setValue("tax_status", value as any)}
                    value={taxStatus}
                  >
                    <SelectTrigger id="tax_status" className="w-full">
                      <SelectValue placeholder="Select tax status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="head_of_household">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tax_status && (
                    <p className="text-sm text-destructive">{errors.tax_status.message}</p>
                  )}
                </>
              ) : (
                <p className="text-sm font-medium">
                  {employee.tax_status
                    ? employee.tax_status
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")
                    : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_dependents" className="text-sm font-medium">
                Tax Dependents
              </Label>
              {isEditing ? (
                <>
                  <Input
                    id="tax_dependents"
                    type="number"
                    min="0"
                    max="10"
                    {...register("tax_dependents", { valueAsNumber: true })}
                    placeholder="Number of dependents"
                  />
                  {errors.tax_dependents && (
                    <p className="text-sm text-destructive">{errors.tax_dependents.message}</p>
                  )}
                </>
              ) : (
                <p className="text-sm font-medium">
                  {employee.tax_dependents ?? (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={updateEmployee.isPending}
                className="gap-2"
              >
                <Cancel01Icon className="size-5" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateEmployee.isPending}
                className="gap-2"
              >
                <FloppyDiskIcon className="size-5" />
                {updateEmployee.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

