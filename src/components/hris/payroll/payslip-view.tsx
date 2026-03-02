
import type { PayrollEntry } from "@/types/payroll";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PayslipViewProps {
  payrollEntry: PayrollEntry;
}

export function PayslipView({ payrollEntry }: PayslipViewProps) {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">Payslip</CardTitle>
              <p className="text-sm text-muted-foreground">
                Entry Code: {payrollEntry.payroll_entry_code}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Period</p>
              <p className="font-medium">
                {payrollEntry.employee?.department?.name || "N/A"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Employee Information */}
          <div>
            <h3 className="font-semibold mb-3">Employee Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{payrollEntry.employee?.full_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Employee Code</p>
                <p className="font-medium">{payrollEntry.employee?.employee_code || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium">
                  {payrollEntry.employee?.department?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Position</p>
                <p className="font-medium">
                  {payrollEntry.employee?.position?.name || "N/A"}
                </p>
              </div>
              {payrollEntry.employee?.sss_number && (
                <div>
                  <p className="text-muted-foreground">SSS Number</p>
                  <p className="font-medium">{payrollEntry.employee.sss_number}</p>
                </div>
              )}
              {payrollEntry.employee?.philhealth_number && (
                <div>
                  <p className="text-muted-foreground">PhilHealth Number</p>
                  <p className="font-medium">{payrollEntry.employee.philhealth_number}</p>
                </div>
              )}
              {payrollEntry.employee?.pagibig_number && (
                <div>
                  <p className="text-muted-foreground">Pag-IBIG Number</p>
                  <p className="font-medium">{payrollEntry.employee.pagibig_number}</p>
                </div>
              )}
              {payrollEntry.employee?.tax_id_number && (
                <div>
                  <p className="text-muted-foreground">TIN</p>
                  <p className="font-medium">{payrollEntry.employee.tax_id_number}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Earnings */}
          <div>
            <h3 className="font-semibold mb-3">Earnings</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Basic Salary</span>
                <span className="font-medium">{formatCurrency(payrollEntry.basic_salary)}</span>
              </div>
              {payrollEntry.overtime_pay > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overtime Pay</span>
                  <span className="font-medium">{formatCurrency(payrollEntry.overtime_pay)}</span>
                </div>
              )}
              {payrollEntry.holiday_pay > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Holiday Pay</span>
                  <span className="font-medium">{formatCurrency(payrollEntry.holiday_pay)}</span>
                </div>
              )}
              {payrollEntry.night_differential > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Night Differential</span>
                  <span className="font-medium">
                    {formatCurrency(payrollEntry.night_differential)}
                  </span>
                </div>
              )}
              {payrollEntry.commission_taxable > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission (Taxable)</span>
                  <span className="font-medium">{formatCurrency(payrollEntry.commission_taxable)}</span>
                </div>
              )}
              {payrollEntry.allowance_taxable > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allowance (Taxable)</span>
                  <span className="font-medium">{formatCurrency(payrollEntry.allowance_taxable)}</span>
                </div>
              )}
              {payrollEntry.allowance_non_taxable > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allowance (Non-Taxable)</span>
                  <span className="font-medium">{formatCurrency(payrollEntry.allowance_non_taxable)}</span>
                </div>
              )}
              {payrollEntry.bonus > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bonus</span>
                  <span className="font-medium">{formatCurrency(payrollEntry.bonus)}</span>
                </div>
              )}
              {payrollEntry.thirteenth_month > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">13th Month Pay</span>
                  <span className="font-medium">
                    {formatCurrency(payrollEntry.thirteenth_month)}
                  </span>
                </div>
              )}
              {payrollEntry.other_earnings > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Other Earnings</span>
                  <span className="font-medium">{formatCurrency(payrollEntry.other_earnings)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Earnings</span>
                <span>{formatCurrency(payrollEntry.total_earnings)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Deductions */}
          <div>
            <h3 className="font-semibold mb-3">Deductions</h3>
            <div className="space-y-2 text-sm">
              {payrollEntry.sss_contribution > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SSS Contribution</span>
                  <span className="font-medium">
                    {formatCurrency(payrollEntry.sss_contribution)}
                  </span>
                </div>
              )}
              {payrollEntry.philhealth_contribution > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PhilHealth Contribution</span>
                  <span className="font-medium">
                    {formatCurrency(payrollEntry.philhealth_contribution)}
                  </span>
                </div>
              )}
              {payrollEntry.pagibig_contribution > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pag-IBIG Contribution</span>
                  <span className="font-medium">
                    {formatCurrency(payrollEntry.pagibig_contribution)}
                  </span>
                </div>
              )}
              {payrollEntry.bir_withholding_tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BIR Withholding Tax</span>
                  <span className="font-medium">
                    {formatCurrency(payrollEntry.bir_withholding_tax)}
                  </span>
                </div>
              )}
              {payrollEntry.leave_deductions > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Leave Deductions</span>
                  <span className="font-medium">
                    {formatCurrency(payrollEntry.leave_deductions)}
                  </span>
                </div>
              )}
              {payrollEntry.loans > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loans</span>
                  <span className="font-medium">{formatCurrency(payrollEntry.loans)}</span>
                </div>
              )}
              {payrollEntry.other_deductions > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Other Deductions</span>
                  <span className="font-medium">
                    {formatCurrency(payrollEntry.other_deductions)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Deductions</span>
                <span>{formatCurrency(payrollEntry.total_deductions)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Net Pay */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Net Pay</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(payrollEntry.net_pay)}
              </span>
            </div>
          </div>

          {/* Work Summary */}
          {(payrollEntry.days_worked > 0 ||
            payrollEntry.hours_worked > 0 ||
            payrollEntry.overtime_hours > 0) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Work Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Days Worked</p>
                    <p className="font-medium">{payrollEntry.days_worked}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hours Worked</p>
                    <p className="font-medium">{payrollEntry.hours_worked}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Overtime Hours</p>
                    <p className="font-medium">{payrollEntry.overtime_hours}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {payrollEntry.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{payrollEntry.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

