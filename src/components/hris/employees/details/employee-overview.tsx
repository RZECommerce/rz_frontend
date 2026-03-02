
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Employee } from "@/types/employee";
import { CheckCircle as CheckmarkCircle01Icon, Portrait as FaceIdIcon } from "@mui/icons-material";

interface EmployeeOverviewProps {
  employee: Employee;
  onRegisterFace?: () => void;
}

export function EmployeeOverview({ employee, onRegisterFace }: EmployeeOverviewProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount) return "Not set";
    return `₱${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{employee.phone || "Not set"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{formatDate(employee.date_of_birth)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gender</p>
                <p className="font-medium">{employee.gender ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1) : "Not set"}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-muted-foreground text-sm mb-1">Address</p>
              <p className="font-medium text-sm">
                {employee.address || "Not set"}
                {employee.city && `, ${employee.city}`}
                {employee.state && `, ${employee.state}`}
                {employee.postal_code && ` ${employee.postal_code}`}
                {employee.country && `, ${employee.country}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium">{employee.department?.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Position</p>
                <p className="font-medium">{employee.position?.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Employment Type</p>
                <p className="font-medium">{employee.employment_type?.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Hire Date</p>
                <p className="font-medium">{formatDate(employee.hire_date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Salary</p>
                <p className="font-medium">{formatCurrency(employee.salary)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Currency</p>
                <p className="font-medium">{employee.currency || "PHP"}</p>
              </div>
            </div>
            {employee.probation_end_date && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-sm">Probation End Date</p>
                  <p className="font-medium text-sm">{formatDate(employee.probation_end_date)}</p>
                </div>
              </>
            )}
            {employee.contract_end_date && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-sm">Contract End Date</p>
                  <p className="font-medium text-sm">{formatDate(employee.contract_end_date)}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {(employee.employee_id_number || employee.tax_id_number || employee.notes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {employee.employee_id_number && (
                <div>
                  <p className="text-muted-foreground">Employee ID Number</p>
                  <p className="font-medium">{employee.employee_id_number}</p>
                </div>
              )}
              {employee.tax_id_number && (
                <div>
                  <p className="text-muted-foreground">Tax ID Number (TIN)</p>
                  <p className="font-medium">{employee.tax_id_number}</p>
                </div>
              )}
            </div>
            {employee.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Notes</p>
                  <p className="text-sm">{employee.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Face Recognition</CardTitle>
            {employee.face_encoding && employee.face_encoding.length > 0 && (
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200">
                <CheckmarkCircle01Icon className="mr-1 size-5" />
                Registered
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                Register the employee's face for facial recognition time clock access. A clear, front-facing photo is required.
              </p>
              {employee.face_encoding && employee.face_encoding.length > 0 ? (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Face encoding is registered. You can re-register to update it.
                </p>
              ) : (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  No face encoding registered. Register a face to enable time clock access.
                </p>
              )}
            </div>
          </div>
          {onRegisterFace && (
            <Button onClick={onRegisterFace} variant="outline" className="w-full sm:w-auto">
              <FaceIdIcon className="mr-2 size-5" />
              {employee.face_encoding && employee.face_encoding.length > 0
                ? "Re-register Face"
                : "Register Face"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

