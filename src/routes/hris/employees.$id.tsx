
import { EmployeeDeductions } from "@/components/hris/employees/forms/employee-deductions";
import { EmployeeDetailHeader } from "@/components/hris/employees/details/employee-detail-header";
import { EmployeeGovernmentContributions } from "@/components/hris/employees/forms/employee-government-contributions";
import { EmployeeOverview } from "@/components/hris/employees/details/employee-overview";
import { EmployeeSalaryComponents } from "@/components/hris/employees/forms/employee-salary-components";
import { EmployeeUserRole } from "@/components/hris/employees/forms/employee-user-role";
import { FaceRegistration } from "@/components/hris/employees/forms/face-registration";
import { EmployeeDetailTabs } from "@/components/hris/employees/details/employee-detail-tabs";
import { GeneralInfoSidebar } from "@/components/hris/employees/details/general-info-sidebar";
import { BasicInformationForm } from "@/components/hris/employees/forms/basic-information-form";
import { ImmigrationSection } from "@/components/hris/employees/sections/immigration-section";
import { EmergencyContactsSection } from "@/components/hris/employees/sections/emergency-contacts-section";
import { SocialProfileSection } from "@/components/hris/employees/sections/social-profile-section";
import { DocumentsSection } from "@/components/hris/employees/sections/documents-section";
import { QualificationSection } from "@/components/hris/employees/sections/qualification-section";
import { WorkExperienceSection } from "@/components/hris/employees/sections/work-experience-section";
import { BankAccountSection } from "@/components/hris/employees/sections/bank-account-section";
import { ProfilePictureSection } from "@/components/hris/employees/forms/profile-picture-section";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import { employeeService } from "@/services/employee.service";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useHasPermission } from "@/hooks/use-permissions";

export const Route = createFileRoute("/hris/employees/$id")({
  beforeLoad: requireAuth(),
  component: EmployeeDetailPage,
});

function EmployeeDetailPage() {
  const { id: employeeId } = Route.useParams();
  const navigate = useNavigate();
  const [isFaceRegistrationOpen, setIsFaceRegistrationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [activeSection, setActiveSection] = useState("basic");
  const [isEditMode, setIsEditMode] = useState(false);
  const canEdit = useHasPermission("employees.edit");

  const { data: employee, isLoading } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () => employeeService.getById(employeeId),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="w-full flex items-center gap-3 px-4 sm:p-6 py-4 border-b bg-background">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        </div>
        <main className={cn("w-full flex-1 overflow-auto", "p-4 sm:p-6")}>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </main>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="flex flex-col h-full w-full items-center justify-center">
          <p className="text-muted-foreground">Employee not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <EmployeeDetailHeader
        employee={employee}
        onBack={() => navigate({ to: "/hris/employees" })}
        onEdit={canEdit ? () => setIsEditMode(!isEditMode) : undefined}
        isEditMode={isEditMode}
      />

      <EmployeeDetailTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className={cn("w-full flex-1 overflow-auto", "flex")}>
        {activeTab === "general" && (
          <>
            <GeneralInfoSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
            <div className="flex-1 p-6">
              {activeSection === "basic" && (
                <BasicInformationForm employee={employee} isEditMode={isEditMode} onEditModeChange={setIsEditMode} />
              )}
              {activeSection === "profile-picture" && (
                <ProfilePictureSection employeeId={employeeId} />
              )}
              {activeSection === "immigration" && (
                <ImmigrationSection employeeId={employeeId} isEditMode={isEditMode} />
              )}
              {activeSection === "emergency-contacts" && (
                <EmergencyContactsSection employeeId={employeeId} />
              )}
              {activeSection === "social-profile" && employee && (
                <SocialProfileSection employeeId={employeeId} employee={employee} isEditMode={isEditMode} />
              )}
              {activeSection === "document" && (
                <DocumentsSection employeeId={employeeId} />
              )}
              {activeSection === "qualification" && (
                <QualificationSection employeeId={employeeId} />
              )}
              {activeSection === "work-experience" && (
                <WorkExperienceSection employeeId={employeeId} />
              )}
              {activeSection === "bank-account" && (
                <BankAccountSection employeeId={employeeId} />
              )}
            </div>
          </>
        )}

        {activeTab === "profile" && (
          <div className="flex-1 p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="face-recognition">Face Recognition</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-6 space-y-6">
                <EmployeeOverview
                  employee={employee}
                  onRegisterFace={() => setIsFaceRegistrationOpen(true)}
                />
                <EmployeeUserRole employee={employee} />
              </TabsContent>
              <TabsContent value="face-recognition" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Face Recognition</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Register face encoding for biometric authentication.
                    </p>
                    <button
                      onClick={() => setIsFaceRegistrationOpen(true)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Register Face
                    </button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === "salary" && (
          <div className="flex-1 p-6">
            <Tabs defaultValue="basic-salary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic-salary">Basic Salary</TabsTrigger>
                <TabsTrigger value="allowances">Allowances</TabsTrigger>
                <TabsTrigger value="commissions">Commissions</TabsTrigger>
                <TabsTrigger value="overtime">Overtime</TabsTrigger>
              </TabsList>
              <TabsContent value="basic-salary" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Basic Salary</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage basic salary records for this employee.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Basic Salary management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="allowances" className="mt-6">
                <EmployeeSalaryComponents employeeId={employeeId} />
              </TabsContent>
              <TabsContent value="commissions" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Commissions</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage commission records for this employee.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Commissions management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="overtime" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Overtime</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage overtime records for this employee.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Overtime management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <Tabs defaultValue="loans" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="loans">Loans</TabsTrigger>
                <TabsTrigger value="deductions">Deductions</TabsTrigger>
                <TabsTrigger value="pension">Pension</TabsTrigger>
              </TabsList>
              <TabsContent value="loans" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Loans</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage loan records (SSS Loan, Pag-IBIG Loan, Other Loan) for this employee.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Loans management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="deductions" className="mt-6">
                <EmployeeDeductions employeeId={employeeId} />
              </TabsContent>
              <TabsContent value="pension" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Pension</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage pension settings (Fixed or Percentage) for this employee.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Pension management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === "payroll" && (
          <div className="flex-1 p-6">
            <Tabs defaultValue="payslips" className="w-full">
              <TabsList>
                <TabsTrigger value="payslips">Payslips</TabsTrigger>
                <TabsTrigger value="other-payments">Other Payments</TabsTrigger>
              </TabsList>
              <TabsContent value="payslips" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Payslip Management</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      View and manage payslips with export options (PDF, CSV, Print).
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Payslip management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="other-payments" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Other Payments</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage other payment records for this employee.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Other Payments management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === "leave" && (
          <div className="flex-1 p-6">
            <Tabs defaultValue="records" className="w-full">
              <TabsList>
                <TabsTrigger value="records">Leave Records</TabsTrigger>
                <TabsTrigger value="remaining">Remaining Leave</TabsTrigger>
              </TabsList>
              <TabsContent value="records" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Leave Records</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      View leave applications and their status.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Leave Records - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="remaining" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Remaining Leave</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      View remaining leave balance by leave type.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Remaining Leave - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === "core-hr" && (
          <div className="flex-1 p-6">
            <Tabs defaultValue="contributions" className="w-full">
              <TabsList>
                <TabsTrigger value="contributions">Government Contributions</TabsTrigger>
                <TabsTrigger value="deductions">Deductions</TabsTrigger>
              </TabsList>
              <TabsContent value="contributions" className="mt-6">
                <EmployeeGovernmentContributions
                  employeeId={employeeId}
                  employee={employee}
                />
              </TabsContent>
              <TabsContent value="deductions" className="mt-6">
                <EmployeeDeductions employeeId={employeeId} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === "lifecycle" && (
          <div className="flex-1 p-6">
            <Tabs defaultValue="awards" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="awards">Awards</TabsTrigger>
                <TabsTrigger value="travel">Travel</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
                <TabsTrigger value="tickets">Tickets</TabsTrigger>
              </TabsList>
              <TabsContent value="awards" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Awards</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage employee awards and recognition.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Awards management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="travel" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Travel Management</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage employee travel records and expenses.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Travel management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="training" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Training</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage employee training records and attendance.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Training management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="tickets" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tickets</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage support tickets for this employee.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Tickets management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <Tabs defaultValue="transfers" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="transfers">Transfers</TabsTrigger>
                <TabsTrigger value="promotions">Promotions</TabsTrigger>
                <TabsTrigger value="complaints">Complaints</TabsTrigger>
                <TabsTrigger value="warnings">Warnings</TabsTrigger>
              </TabsList>
              <TabsContent value="transfers" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Transfers</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage employee department and company transfers.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Transfers management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="promotions" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Promotions</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage employee promotion records.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Promotions management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="complaints" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Complaints</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage employee complaints and resolutions.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Complaints management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="warnings" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Warnings</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage employee warnings and disciplinary actions.
                    </p>
                    <div className="text-center text-muted-foreground py-12 border rounded-lg">
                      Warnings management - Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === "project-task" && (
          <div className="flex-1 p-6">
            <div className="text-center text-muted-foreground py-12">
              Project & Task section - Coming soon
            </div>
          </div>
        )}
      </main>

      <FaceRegistration
        employeeId={employeeId}
        open={isFaceRegistrationOpen}
        onOpenChange={setIsFaceRegistrationOpen}
        hasFaceEncoding={
          !!employee?.face_encoding && employee.face_encoding.length > 0
        }
      />
    </DashboardLayout>
  );
}
