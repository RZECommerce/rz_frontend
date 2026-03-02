import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHasPermission } from "@/hooks/use-permissions";
import { StatusBadge } from "@/lib/utils/status-badge";
import { employeeDocumentService } from "@/services/employee-document.service";
import { employeeService } from "@/services/employee.service";
import { overtimeRequestService } from "@/services/overtime-request.service";
import { deductionService, payrollEntryService, salaryComponentService } from "@/services/payroll.service";
import type { Employee } from "@/types/employee";
import type { LeaveBalance } from "@/types/leave";
import type { Deduction, PayrollEntry, SalaryComponent } from "@/types/payroll";
import { CheckCircle as CheckmarkCircle01Icon, Close as CloseIcon, Edit as Edit01Icon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { AllowancesSection } from "../sections/allowances-section";
import { AwardsSection } from "../sections/awards-section";
import { BankAccountSection } from "../sections/bank-account-section";
import { BasicInformationForm } from "../forms/basic-information-form";
import { CommissionsSection } from "../sections/commissions-section";
import { ComplaintsSection } from "../sections/complaints-section";
import { DocumentsSection } from "../sections/documents-section";
import { EmergencyContactsSection } from "../sections/emergency-contacts-section";
import { ImmigrationSection } from "../sections/immigration-section";
import { LoansSection } from "../sections/loans-section";
import { OtherPaymentsSection } from "../sections/other-payments-section";
import { OvertimeSection } from "../sections/overtime-section";
import { PromotionsSection } from "../sections/promotions-section";
import { QualificationSection } from "../sections/qualification-section";
import { SalaryHistorySection } from "../sections/salary-history-section";
import { SalaryPensionSection } from "../sections/salary-pension-section";
import { SocialProfileSection } from "../sections/social-profile-section";
import { StatutoryDeductionsSection } from "../sections/statutory-deductions-section";
import { TrainingSection } from "../sections/training-section";
import { TransfersSection } from "../sections/transfers-section";
import { TravelSection } from "../sections/travel-section";
import { WarningsSection } from "../sections/warnings-section";
import { WorkExperienceSection } from "../sections/work-experience-section";

interface ViewEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string | null;
}

export function ViewEmployeeModal({
  open,
  onOpenChange,
  employeeId,
}: ViewEmployeeModalProps) {
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = React.useState("basic");
  const [selectedPayslip, setSelectedPayslip] = React.useState<PayrollEntry | null>(null);
  const [isEditMode, setIsEditMode] = React.useState(true);
  const canEdit = useHasPermission("employees.edit");

  console.log("ViewEmployeeModal - isEditMode:", isEditMode, "canEdit:", canEdit);

  const { data: employee, isLoading } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () => employeeService.getById(employeeId!),
    enabled: open && !!employeeId,
  });

  const { data: assignedLeaveBalances, isLoading: isLoadingLeaveBalances } = useQuery({
    queryKey: ["employee-leave-balances", employeeId, currentYear],
    queryFn: () => employeeService.getAssignedLeaveTypes(employeeId!, currentYear),
    enabled: open && !!employeeId,
  });

  const { data: documents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ["employee-documents", employeeId],
    queryFn: () => employeeDocumentService.getByEmployee(employeeId!),
    enabled: open && !!employeeId && activeTab === "document",
  });

  const { data: salaryComponents, isLoading: isLoadingSalaryComponents } = useQuery({
    queryKey: ["employee-salary-components", employeeId],
    queryFn: () => salaryComponentService.getByEmployee(employeeId!, { is_active: true }),
    enabled: open && !!employeeId && (activeTab === "allowances" || activeTab === "commissions" || activeTab === "other-payment"),
  });

  const { data: deductions, isLoading: isLoadingDeductions } = useQuery({
    queryKey: ["employee-deductions", employeeId],
    queryFn: () => deductionService.getByEmployee(employeeId!, { is_active: true }),
    enabled: open && !!employeeId && (activeTab === "loan" || activeTab === "statutory-deductions"),
  });

  const { data: overtimeRequests, isLoading: isLoadingOvertime } = useQuery({
    queryKey: ["employee-overtime-requests", employeeId],
    queryFn: () => overtimeRequestService.getByEmployee(employeeId!),
    enabled: open && !!employeeId && activeTab === "overtime",
  });

  const { data: payrollEntries, isLoading: isLoadingPayrollEntries } = useQuery({
    queryKey: ["employee-payroll-entries", employeeId],
    queryFn: () => payrollEntryService.getAll({ employee_id: employeeId! }),
    enabled: open && !!employeeId && activeTab === "payslip",
  });

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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Filter salary components by type
  const allowances = React.useMemo(() => {
    if (!salaryComponents || !("data" in salaryComponents)) return [];
    const components = Array.isArray(salaryComponents) ? salaryComponents : salaryComponents.data || [];
    return components.filter((sc: SalaryComponent) => sc.component_type === "allowance");
  }, [salaryComponents]);

  const commissions = React.useMemo(() => {
    if (!salaryComponents || !("data" in salaryComponents)) return [];
    const components = Array.isArray(salaryComponents) ? salaryComponents : salaryComponents.data || [];
    return components.filter((sc: SalaryComponent) => sc.component_type === "commission");
  }, [salaryComponents]);

  const otherPayments = React.useMemo(() => {
    if (!salaryComponents || !("data" in salaryComponents)) return [];
    const components = Array.isArray(salaryComponents) ? salaryComponents : salaryComponents.data || [];
    return components.filter((sc: SalaryComponent) =>
      !["allowance", "commission", "bonus"].includes(sc.component_type || "")
    );
  }, [salaryComponents]);

  // Filter deductions by type
  const loans = React.useMemo(() => {
    if (!deductions || !("data" in deductions)) return [];
    const ded = Array.isArray(deductions) ? deductions : deductions.data || [];
    return ded.filter((d: Deduction) => d.deduction_type === "loan");
  }, [deductions]);

  const statutoryDeductions = React.useMemo(() => {
    if (!deductions || !("data" in deductions)) return [];
    const ded = Array.isArray(deductions) ? deductions : deductions.data || [];
    return ded.filter((d: Deduction) => d.deduction_type !== "loan");
  }, [deductions]);

  // Get documents list
  const documentsList = React.useMemo(() => {
    if (!documents) return [];
    return Array.isArray(documents) ? documents : (documents as any)?.data || [];
  }, [documents]);

  // Get overtime requests list
  const overtimeList = React.useMemo(() => {
    if (!overtimeRequests || !("data" in overtimeRequests)) return [];
    return Array.isArray(overtimeRequests) ? overtimeRequests : overtimeRequests.data || [];
  }, [overtimeRequests]);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>Loading employee information...</DialogDescription>
          </DialogHeader>
          <div className="h-64 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!employee) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>Employee not found</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-6xl overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 md:px-6 py-4 border-b shrink-0 text-left">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <DialogTitle className="text-lg md:text-2xl font-semibold truncate">
                {employee.full_name}
              </DialogTitle>
              <DialogDescription className="text-sm md:text-base flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <span className="truncate">Employee Code: {employee.employee_code}</span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-2">
                  Status: <StatusBadge status={employee.status} />
                </span>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="gap-2 h-8 px-2 md:h-9 md:px-3 shrink-0 mt-0.5"
                >
                  <Edit01Icon className="size-4 md:size-5" />
                  <span className="hidden md:inline">{isEditMode ? "Cancel" : "Edit"}</span>
                  <span className="md:hidden">{isEditMode ? "Cancel" : "Edit"}</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 md:h-9 md:w-9 shrink-0 rounded-full"
              >
                <CloseIcon className="size-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          orientation="vertical"
          className="flex-1 flex flex-col md:flex-row overflow-hidden"
        >
          <div className="w-full md:w-64 border-r-0 md:border-r border-b md:border-b-0 overflow-x-auto md:overflow-y-auto shrink-0 bg-muted/10 md:bg-transparent">
            <TabsList variant="line" className="!flex-row md:!flex-col h-auto w-max md:w-full bg-transparent p-2 gap-1">
              {/* Employee Information Tabs */}
              <div className="hidden md:block px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Employee Information
              </div>
              <TabsTrigger value="basic" className="!w-auto md:!w-full justify-start whitespace-nowrap">Basic</TabsTrigger>
              <TabsTrigger value="immigration" className="!w-auto md:!w-full justify-start whitespace-nowrap">Immigration</TabsTrigger>
              <TabsTrigger value="emergency-contacts" className="!w-auto md:!w-full justify-start whitespace-nowrap">Emergency Contacts</TabsTrigger>
              <TabsTrigger value="social-profile" className="!w-auto md:!w-full justify-start whitespace-nowrap">Social Profile</TabsTrigger>
              <TabsTrigger value="document" className="!w-auto md:!w-full justify-start whitespace-nowrap">Document</TabsTrigger>
              <TabsTrigger value="qualification" className="!w-auto md:!w-full justify-start whitespace-nowrap">Qualification</TabsTrigger>
              <TabsTrigger value="work-experience" className="!w-auto md:!w-full justify-start whitespace-nowrap">Work Experience</TabsTrigger>
              <TabsTrigger value="bank-account" className="!w-auto md:!w-full justify-start whitespace-nowrap">Bank Account</TabsTrigger>
              <TabsTrigger value="award" className="!w-auto md:!w-full justify-start whitespace-nowrap">Award</TabsTrigger>
              <TabsTrigger value="travel" className="!w-auto md:!w-full justify-start whitespace-nowrap">Travel</TabsTrigger>
              <TabsTrigger value="training" className="!w-auto md:!w-full justify-start whitespace-nowrap">Training</TabsTrigger>
              <TabsTrigger value="transfer" className="!w-auto md:!w-full justify-start whitespace-nowrap">Transfer</TabsTrigger>
              <TabsTrigger value="promotion" className="!w-auto md:!w-full justify-start whitespace-nowrap">Promotion</TabsTrigger>
              <TabsTrigger value="complaint" className="!w-auto md:!w-full justify-start whitespace-nowrap">Complaint</TabsTrigger>
              <TabsTrigger value="warning" className="!w-auto md:!w-full justify-start whitespace-nowrap">Warning</TabsTrigger>

              <Separator className="hidden md:block my-2" />

              {/* Salary Information Tabs */}
              <div className="hidden md:block px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Salary Information
              </div>
              <TabsTrigger value="basic-salary" className="!w-auto md:!w-full justify-start whitespace-nowrap">Basic Salary</TabsTrigger>
              <TabsTrigger value="allowances" className="!w-auto md:!w-full justify-start whitespace-nowrap">Allowances</TabsTrigger>
              <TabsTrigger value="commissions" className="!w-auto md:!w-full justify-start whitespace-nowrap">Commissions</TabsTrigger>
              <TabsTrigger value="loan" className="!w-auto md:!w-full justify-start whitespace-nowrap">Loan</TabsTrigger>
              <TabsTrigger value="statutory-deductions" className="!w-auto md:!w-full justify-start whitespace-nowrap">Statutory Deductions</TabsTrigger>
              <TabsTrigger value="other-payment" className="!w-auto md:!w-full justify-start whitespace-nowrap">Other Payment</TabsTrigger>
              <TabsTrigger value="overtime" className="!w-auto md:!w-full justify-start whitespace-nowrap">Overtime</TabsTrigger>
              <TabsTrigger value="salary-pension" className="!w-auto md:!w-full justify-start whitespace-nowrap">Salary Pension</TabsTrigger>
              <TabsTrigger value="payslip" className="!w-auto md:!w-full justify-start whitespace-nowrap">Payslip</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Tab */}
            <TabsContent value="basic" className="mt-0 space-y-6">
              {isEditMode ? (
                <BasicInformationForm employee={employee} isEditMode={isEditMode} onEditModeChange={setIsEditMode} />
              ) : (
                <>
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">First Name</p>
                        <p className="font-medium">{employee.first_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Last Name</p>
                        <p className="font-medium">{employee.last_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Email</p>
                        <p className="font-medium">{employee.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Phone</p>
                        <p className="font-medium">{employee.phone || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Date of Birth</p>
                        <p className="font-medium">{formatDate(employee.date_of_birth)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Gender</p>
                        <p className="font-medium">
                          {employee.gender
                            ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1)
                            : "Not set"}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Address</p>
                      <p className="font-medium text-sm">
                        {employee.address || employee.city || employee.state || employee.postal_code || employee.country
                          ? [
                            employee.address,
                            employee.city,
                            employee.state,
                            employee.postal_code,
                            employee.country,
                          ]
                            .filter(Boolean)
                            .join(", ")
                          : "Not set"}
                      </p>
                    </div>
                  </div>

                  {/* Company Information */}
                  {(employee as any).company && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Company Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Company</p>
                          <p className="font-medium">{(employee as any).company?.name}</p>
                        </div>
                        {(employee as any).company?.legal_name && (
                          <div>
                            <p className="text-muted-foreground mb-1">Legal Name</p>
                            <p className="font-medium">{(employee as any).company?.legal_name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Employment Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Employment Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Department</p>
                        <p className="font-medium">{employee.department?.name || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Position</p>
                        <p className="font-medium">{employee.position?.name || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Employment Type</p>
                        <p className="font-medium">{employee.employment_type?.name || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Status</p>
                        <StatusBadge status={employee.status} />
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Hire Date</p>
                        <p className="font-medium">{formatDate(employee.hire_date)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Salary</p>
                        <p className="font-medium">
                          {employee.salary
                            ? `${formatCurrency(employee.salary)} ${employee.currency || ""}`.trim()
                            : "Not set"}
                        </p>
                      </div>
                      {employee.probation_end_date && (
                        <div>
                          <p className="text-muted-foreground mb-1">Probation End Date</p>
                          <p className="font-medium">{formatDate(employee.probation_end_date)}</p>
                        </div>
                      )}
                      {employee.contract_end_date && (
                        <div>
                          <p className="text-muted-foreground mb-1">Contract End Date</p>
                          <p className="font-medium">{formatDate(employee.contract_end_date)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Government Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Government Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {employee.employee_id_number ? (
                        <div>
                          <p className="text-muted-foreground mb-1">Employee ID Number</p>
                          <p className="font-medium">{employee.employee_id_number}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-muted-foreground mb-1">Employee ID Number</p>
                          <p className="font-medium">Not set</p>
                        </div>
                      )}
                      {employee.tax_id_number ? (
                        <div>
                          <p className="text-muted-foreground mb-1">Tax ID Number (TIN)</p>
                          <p className="font-medium">{employee.tax_id_number}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-muted-foreground mb-1">Tax ID Number (TIN)</p>
                          <p className="font-medium">Not set</p>
                        </div>
                      )}
                      {employee.sss_number ? (
                        <div>
                          <p className="text-muted-foreground mb-1">SSS Number</p>
                          <p className="font-medium">{employee.sss_number}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-muted-foreground mb-1">SSS Number</p>
                          <p className="font-medium">Not set</p>
                        </div>
                      )}
                      {employee.philhealth_number ? (
                        <div>
                          <p className="text-muted-foreground mb-1">PhilHealth Number</p>
                          <p className="font-medium">{employee.philhealth_number}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-muted-foreground mb-1">PhilHealth Number</p>
                          <p className="font-medium">Not set</p>
                        </div>
                      )}
                      {employee.pagibig_number ? (
                        <div>
                          <p className="text-muted-foreground mb-1">Pag-IBIG Number</p>
                          <p className="font-medium">{employee.pagibig_number}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-muted-foreground mb-1">Pag-IBIG Number</p>
                          <p className="font-medium">Not set</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground mb-1">Tax Status</p>
                        <p className="font-medium">
                          {employee.tax_status
                            ? employee.tax_status
                              .split("_")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")
                            : "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Tax Dependents</p>
                        <p className="font-medium">
                          {employee.tax_dependents !== undefined && employee.tax_dependents !== null
                            ? employee.tax_dependents
                            : "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pension Information */}
                  {((employee as any).pension_provider ||
                    (employee as any).pension_account_number ||
                    (employee as any).pension_enrollment_date ||
                    (employee as any).pension_contribution_rate !== undefined ||
                    (employee as any).pension_enrolled !== undefined) && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Pension Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {(employee as any).pension_provider ? (
                            <div>
                              <p className="text-muted-foreground mb-1">Pension Provider</p>
                              <p className="font-medium">{(employee as any).pension_provider}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-muted-foreground mb-1">Pension Provider</p>
                              <p className="font-medium">Not set</p>
                            </div>
                          )}
                          {(employee as any).pension_account_number ? (
                            <div>
                              <p className="text-muted-foreground mb-1">Pension Account Number</p>
                              <p className="font-medium">{(employee as any).pension_account_number}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-muted-foreground mb-1">Pension Account Number</p>
                              <p className="font-medium">Not set</p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground mb-1">Pension Enrollment Date</p>
                            <p className="font-medium">{formatDate((employee as any).pension_enrollment_date)}</p>
                          </div>
                          {(employee as any).pension_contribution_rate !== undefined && (employee as any).pension_contribution_rate !== null ? (
                            <div>
                              <p className="text-muted-foreground mb-1">Pension Contribution Rate</p>
                              <p className="font-medium">{(employee as any).pension_contribution_rate}%</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-muted-foreground mb-1">Pension Contribution Rate</p>
                              <p className="font-medium">Not set</p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground mb-1">Pension Enrolled</p>
                            <p className="font-medium">
                              {(employee as any).pension_enrolled !== undefined
                                ? (employee as any).pension_enrolled
                                  ? "Yes"
                                  : "No"
                                : "Not set"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Benefits - Leave Types */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Benefits - Leave Types</h3>
                    {isLoadingLeaveBalances ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Loading leave types...
                      </div>
                    ) : assignedLeaveBalances && assignedLeaveBalances.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {assignedLeaveBalances.map((balance: LeaveBalance) => (
                          <Badge
                            key={balance.id}
                            variant="secondary"
                            className="px-3 py-1.5 text-sm"
                          >
                            {balance.leave_type?.name || "Unknown Leave Type"}
                            {balance.total_days > 0 && ` (${balance.total_days} days)`}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No leave types assigned to this employee.
                      </p>
                    )}
                  </div>

                  {/* Face Recognition */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Face Recognition</h3>
                    <div className="flex items-center gap-2">
                      {employee.face_encoding && employee.face_encoding.length > 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                        >
                          <CheckmarkCircle01Icon className="mr-1 size-5" />
                          Registered
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Not Registered
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {employee.notes && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Notes</h3>
                      <p className="text-sm text-muted-foreground">{employee.notes}</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Immigration Tab */}
            <TabsContent value="immigration" className="mt-0">
              {employeeId && <ImmigrationSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Emergency Contacts Tab */}
            <TabsContent value="emergency-contacts" className="mt-0">
              {employeeId && <EmergencyContactsSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Social Profile Tab */}
            <TabsContent value="social-profile" className="mt-0">
              {employeeId && employee && <SocialProfileSection employeeId={employeeId} employee={employee} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Document Tab */}
            <TabsContent value="document" className="mt-0">
              {employeeId && <DocumentsSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Qualification Tab */}
            <TabsContent value="qualification" className="mt-0">
              {employeeId && <QualificationSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Work Experience Tab */}
            <TabsContent value="work-experience" className="mt-0">
              {employeeId && <WorkExperienceSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Bank Account Tab */}
            <TabsContent value="bank-account" className="mt-0">
              {employeeId && <BankAccountSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Basic Salary Tab */}
            <TabsContent value="basic-salary" className="mt-0">
              {employeeId && (
                <SalaryHistorySection
                  employeeId={employeeId}
                  currentSalary={employee.salary}
                  currentCurrency={employee.currency}
                  isEditMode={isEditMode}
                />
              )}
            </TabsContent>

            {/* Allowances Tab */}
            <TabsContent value="allowances" className="mt-0">
              {employeeId && <AllowancesSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Commissions Tab */}
            <TabsContent value="commissions" className="mt-0">
              {employeeId && <CommissionsSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Loan Tab */}
            <TabsContent value="loan" className="mt-0">
              {employeeId && <LoansSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Statutory Deductions Tab */}
            <TabsContent value="statutory-deductions" className="mt-0">
              {employeeId && <StatutoryDeductionsSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Other Payment Tab */}
            <TabsContent value="other-payment" className="mt-0">
              {employeeId && <OtherPaymentsSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Overtime Tab */}
            <TabsContent value="overtime" className="mt-0">
              {employeeId && <OvertimeSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Salary Pension Tab */}
            <TabsContent value="salary-pension" className="mt-0">
              {employeeId && employee && (
                <SalaryPensionSection
                  employeeId={employeeId}
                  employee={employee}
                  isEditMode={isEditMode}
                />
              )}
            </TabsContent>

            {/* Award Tab */}
            <TabsContent value="award" className="mt-0">
              {employeeId && <AwardsSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Travel Tab */}
            <TabsContent value="travel" className="mt-0">
              {employeeId && <TravelSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Training Tab */}
            <TabsContent value="training" className="mt-0">
              {employeeId && <TrainingSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Transfer Tab */}
            <TabsContent value="transfer" className="mt-0">
              {employeeId && <TransfersSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Promotion Tab */}
            <TabsContent value="promotion" className="mt-0">
              {employeeId && <PromotionsSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Complaint Tab */}
            <TabsContent value="complaint" className="mt-0">
              {employeeId && <ComplaintsSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Warning Tab */}
            <TabsContent value="warning" className="mt-0">
              {employeeId && <WarningsSection employeeId={employeeId} isEditMode={isEditMode} />}
            </TabsContent>

            {/* Payslip Tab */}
            <TabsContent value="payslip" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payslip Records</h3>
                {isLoadingPayrollEntries ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Loading payslips...
                  </div>
                ) : payrollEntries && payrollEntries.data && payrollEntries.data.length > 0 ? (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Net Salary</TableHead>
                          <TableHead>Payroll Date</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payrollEntries.data.map((entry: PayrollEntry) => (
                          <React.Fragment key={entry.id}>
                            <TableRow className="cursor-pointer" onClick={() => setSelectedPayslip(selectedPayslip?.id === entry.id ? null : entry)}>
                              <TableCell className="font-medium">{formatCurrency(entry.net_pay)}</TableCell>
                              <TableCell>{formatDate((entry as any).payroll_run?.payroll_period?.pay_date || (entry as any).created_at)}</TableCell>
                              <TableCell>
                                {(entry as any).payroll_run?.payroll_period
                                  ? `${formatDate((entry as any).payroll_run.payroll_period.start_date)} - ${formatDate((entry as any).payroll_run.payroll_period.end_date)}`
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  entry.status === "paid" ? "default" :
                                    entry.status === "approved" ? "default" :
                                      entry.status === "calculated" ? "secondary" :
                                        "secondary"
                                }>
                                  {entry.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      payrollEntryService.downloadPayslip(entry.id).then((blob) => {
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `payslip-${entry.payroll_entry_code}.pdf`;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                      });
                                    }}
                                  >
                                    Download PDF
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {selectedPayslip?.id === entry.id && (
                              <TableRow>
                                <TableCell colSpan={5} className="p-0">
                                  <div className="p-4 bg-muted/50">
                                    <PayslipDetails payslip={entry} employee={employee} formatCurrency={formatCurrency} formatDate={formatDate} />
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No payslip records found.</p>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Payslip Details Component
interface PayslipDetailsProps {
  payslip: PayrollEntry;
  employee: Employee;
  formatCurrency: (amount?: number) => string;
  formatDate: (dateString?: string) => string;
}

function PayslipDetails({ payslip, employee, formatCurrency, formatDate }: PayslipDetailsProps) {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    basic_salary: true,
    pension: true,
    allowances: false,
    commissions: false,
    loans: false,
    deductions: false,
    other_payments: false,
    overtime: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-lg">{employee.full_name}</h4>
            <p className="text-sm text-muted-foreground">{employee.email}</p>
            <p className="text-sm text-muted-foreground">{employee.position?.name || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Basic Salary */}
      <Collapsible open={openSections.basic_salary} onOpenChange={() => toggleSection("basic_salary")}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
            <span className="font-semibold">Basic Salary</span>
            <span>{openSections.basic_salary ? "−" : "+"}</span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t rounded-b-lg p-4 bg-background">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Monthly Salary:</TableCell>
                  <TableCell className="text-right">{formatCurrency(payslip.basic_salary)}</TableCell>
                </TableRow>
                {payslip.days_worked && (
                  <TableRow>
                    <TableCell className="font-medium">Days Worked:</TableCell>
                    <TableCell className="text-right">{payslip.days_worked}</TableCell>
                  </TableRow>
                )}
                {payslip.hours_worked && (
                  <TableRow>
                    <TableCell className="font-medium">Hours Worked:</TableCell>
                    <TableCell className="text-right">{payslip.hours_worked}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Pension */}
      {"pension_employee_contribution" in payslip &&
        payslip.pension_employee_contribution !== undefined &&
        payslip.pension_employee_contribution !== null &&
        typeof payslip.pension_employee_contribution === "number" &&
        payslip.pension_employee_contribution > 0 && (
          <Collapsible open={openSections.pension} onOpenChange={() => toggleSection("pension")}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <span className="font-semibold">Pension</span>
                <span>{openSections.pension ? "−" : "+"}</span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t rounded-b-lg p-4 bg-background">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Pension Type:</TableCell>
                      <TableCell className="text-right">Employee Contribution</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Pension Amount:</TableCell>
                      <TableCell className="text-right">{formatCurrency(payslip.pension_employee_contribution)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

      {/* Allowances */}
      {(payslip.allowance_taxable + payslip.allowance_non_taxable) > 0 && (
        <Collapsible open={openSections.allowances} onOpenChange={() => toggleSection("allowances")}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
              <span className="font-semibold">Allowances</span>
              <span>{openSections.allowances ? "−" : "+"}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t rounded-b-lg p-4 bg-background">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Total Allowances:</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.allowance_taxable + payslip.allowance_non_taxable)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Commissions */}
      {payslip.bonus > 0 && (
        <Collapsible open={openSections.commissions} onOpenChange={() => toggleSection("commissions")}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
              <span className="font-semibold">Commissions</span>
              <span>{openSections.commissions ? "−" : "+"}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t rounded-b-lg p-4 bg-background">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Total Commissions:</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.bonus)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Loans */}
      {payslip.loans > 0 && (
        <Collapsible open={openSections.loans} onOpenChange={() => toggleSection("loans")}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
              <span className="font-semibold">Loans</span>
              <span>{openSections.loans ? "−" : "+"}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t rounded-b-lg p-4 bg-background">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Total Loans:</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.loans)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Statutory Deductions */}
      {(payslip.sss_contribution > 0 || payslip.philhealth_contribution > 0 || payslip.pagibig_contribution > 0 || payslip.bir_withholding_tax > 0) && (
        <Collapsible open={openSections.deductions} onOpenChange={() => toggleSection("deductions")}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
              <span className="font-semibold">Statutory Deductions</span>
              <span>{openSections.deductions ? "−" : "+"}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t rounded-b-lg p-4 bg-background">
              <Table>
                <TableBody>
                  {payslip.sss_contribution > 0 && (
                    <TableRow>
                      <TableCell className="font-medium">SSS:</TableCell>
                      <TableCell className="text-right">{formatCurrency(payslip.sss_contribution)}</TableCell>
                    </TableRow>
                  )}
                  {payslip.philhealth_contribution > 0 && (
                    <TableRow>
                      <TableCell className="font-medium">PhilHealth:</TableCell>
                      <TableCell className="text-right">{formatCurrency(payslip.philhealth_contribution)}</TableCell>
                    </TableRow>
                  )}
                  {payslip.pagibig_contribution > 0 && (
                    <TableRow>
                      <TableCell className="font-medium">Pag-IBIG:</TableCell>
                      <TableCell className="text-right">{formatCurrency(payslip.pagibig_contribution)}</TableCell>
                    </TableRow>
                  )}
                  {payslip.bir_withholding_tax > 0 && (
                    <TableRow>
                      <TableCell className="font-medium">BIR Withholding Tax:</TableCell>
                      <TableCell className="text-right">{formatCurrency(payslip.bir_withholding_tax)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell className="font-medium">Total Deductions:</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(payslip.total_deductions)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Other Payments */}
      {payslip.other_earnings > 0 && (
        <Collapsible open={openSections.other_payments} onOpenChange={() => toggleSection("other_payments")}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
              <span className="font-semibold">Other Payments</span>
              <span>{openSections.other_payments ? "−" : "+"}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t rounded-b-lg p-4 bg-background">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Total Other Payments:</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.other_earnings)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Overtime */}
      {payslip.overtime_pay > 0 && (
        <Collapsible open={openSections.overtime} onOpenChange={() => toggleSection("overtime")}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
              <span className="font-semibold">Overtime</span>
              <span>{openSections.overtime ? "−" : "+"}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t rounded-b-lg p-4 bg-background">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Overtime Hours:</TableCell>
                    <TableCell className="text-right">{payslip.overtime_hours || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Overtime Pay:</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.overtime_pay)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Net Salary Summary */}
      <div className="border rounded-lg p-4 bg-primary/5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">Net Salary:</span>
          <span className="font-bold text-lg">{formatCurrency(payslip.net_pay)}</span>
        </div>
      </div>
    </div>
  );
}