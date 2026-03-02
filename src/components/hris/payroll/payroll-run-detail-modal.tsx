import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/lib/utils/status-badge";
import { payrollEntryService } from "@/services/payroll.service";
import type { PayrollEntry, PayrollRun, PayrollRunStatus } from "@/types/payroll";
import {
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

interface PayrollRunDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollRun: PayrollRun | null;
}

const statusLabels: Record<PayrollRunStatus, string> = {
  draft: "Draft",
  processing: "Processing",
  completed: "Completed",
  approved: "Approved",
  paid: "Paid",
  cancelled: "Cancelled",
};

export function PayrollRunDetailModal({
  open,
  onOpenChange,
  payrollRun,
}: PayrollRunDetailModalProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Drag-to-scroll functionality
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
    };

    const handleMouseLeave = () => {
      isDown = false;
      container.style.cursor = 'grab';
      container.style.userSelect = 'auto';
    };

    const handleMouseUp = () => {
      isDown = false;
      container.style.cursor = 'grab';
      container.style.userSelect = 'auto';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [open]);
  
  const { data: entriesData, isLoading } = useQuery({
    queryKey: ["payrollEntries", payrollRun?.id],
    queryFn: () =>
      payrollEntryService.getAll({ payroll_run_id: payrollRun?.id, per_page: 500 }),
    enabled: open && !!payrollRun?.id,
  });

  const entries: PayrollEntry[] = React.useMemo(() => {
    if (!entriesData?.data) return [];
    return Array.isArray(entriesData.data) ? entriesData.data : [];
  }, [entriesData]);

  const totals = React.useMemo(() => ({
    basicSalary: entries.reduce((sum, e) => sum + e.basic_salary, 0),
    allowances: entries.reduce((sum, e) => sum + (e.allowances || 0), 0),
    overtimePay: entries.reduce((sum, e) => sum + e.overtime_pay, 0),
    holidayPay: entries.reduce((sum, e) => sum + e.holiday_pay, 0),
    nightDifferential: entries.reduce((sum, e) => sum + e.night_differential, 0),
    bonus: entries.reduce((sum, e) => sum + e.bonus, 0),
    thirteenthMonth: entries.reduce((sum, e) => sum + e.thirteenth_month, 0),
    otherEarnings: entries.reduce((sum, e) => sum + e.other_earnings, 0),
    totalEarnings: entries.reduce((sum, e) => sum + e.total_earnings, 0),
    sss: entries.reduce((sum, e) => sum + e.sss_contribution, 0),
    philhealth: entries.reduce((sum, e) => sum + e.philhealth_contribution, 0),
    pagibig: entries.reduce((sum, e) => sum + e.pagibig_contribution, 0),
    tax: entries.reduce((sum, e) => sum + e.bir_withholding_tax, 0),
    loans: entries.reduce((sum, e) => sum + e.loans, 0),
    leaveDeductions: entries.reduce((sum, e) => sum + e.leave_deductions, 0),
    otherDeductions: entries.reduce((sum, e) => sum + e.other_deductions, 0),
    totalDeductions: entries.reduce((sum, e) => sum + e.total_deductions, 0),
    netPay: entries.reduce((sum, e) => sum + e.net_pay, 0),
  }), [entries]);

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatCurrencyPlain = (amount: number) => {
    return amount.toFixed(2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownloadCSV = () => {
    if (!payrollRun || entries.length === 0) return;

    const headers = [
      "Employee Code",
      "Employee Name",
      "Department",
      "Position",
      "Basic Salary",
      "Allowances",
      "Overtime Pay",
      "Holiday Pay",
      "Night Differential",
      "Bonus",
      "13th Month",
      "Other Earnings",
      "Total Earnings",
      "SSS",
      "PhilHealth",
      "Pag-IBIG",
      "Withholding Tax",
      "Loans",
      "Leave Deductions",
      "Other Deductions",
      "Total Deductions",
      "Net Pay",
      "Days Worked",
      "Hours Worked",
    ];

    const rows = entries.map((entry) => [
      entry.employee?.employee_code || "",
      entry.employee?.full_name || "",
      entry.employee?.department?.name || "",
      entry.employee?.position?.name || "",
      formatCurrencyPlain(entry.basic_salary),
      formatCurrencyPlain(entry.allowances || 0),
      formatCurrencyPlain(entry.overtime_pay),
      formatCurrencyPlain(entry.holiday_pay),
      formatCurrencyPlain(entry.night_differential),
      formatCurrencyPlain(entry.bonus),
      formatCurrencyPlain(entry.thirteenth_month),
      formatCurrencyPlain(entry.other_earnings),
      formatCurrencyPlain(entry.total_earnings),
      formatCurrencyPlain(entry.sss_contribution),
      formatCurrencyPlain(entry.philhealth_contribution),
      formatCurrencyPlain(entry.pagibig_contribution),
      formatCurrencyPlain(entry.bir_withholding_tax),
      formatCurrencyPlain(entry.loans),
      formatCurrencyPlain(entry.leave_deductions),
      formatCurrencyPlain(entry.other_deductions),
      formatCurrencyPlain(entry.total_deductions),
      formatCurrencyPlain(entry.net_pay),
      entry.days_worked?.toString() || "0",
      entry.hours_worked?.toString() || "0",
    ]);

    const totalsRow = [
      "",
      "TOTALS",
      "",
      "",
      formatCurrencyPlain(totals.basicSalary),
      formatCurrencyPlain(totals.allowances),
      formatCurrencyPlain(totals.overtimePay),
      formatCurrencyPlain(totals.holidayPay),
      formatCurrencyPlain(totals.nightDifferential),
      formatCurrencyPlain(totals.bonus),
      formatCurrencyPlain(totals.thirteenthMonth),
      formatCurrencyPlain(totals.otherEarnings),
      formatCurrencyPlain(totals.totalEarnings),
      formatCurrencyPlain(totals.sss),
      formatCurrencyPlain(totals.philhealth),
      formatCurrencyPlain(totals.pagibig),
      formatCurrencyPlain(totals.tax),
      formatCurrencyPlain(totals.loans),
      formatCurrencyPlain(totals.leaveDeductions),
      formatCurrencyPlain(totals.otherDeductions),
      formatCurrencyPlain(totals.totalDeductions),
      formatCurrencyPlain(totals.netPay),
      "",
      "",
    ];

    const csvContent = [
      `Payroll Run: ${payrollRun.payroll_period?.name || "N/A"} - ${payrollRun.payroll_run_code}`,
      `Period: ${payrollRun.payroll_period?.start_date || ""} to ${payrollRun.payroll_period?.end_date || ""}`,
      `Pay Date: ${payrollRun.payroll_period?.pay_date || ""}`,
      `Status: ${statusLabels[payrollRun.status]}`,
      `Total Employees: ${entries.length}`,
      "",
      `TOTALS (${entries.length} employees)`,
      "",
      `"EARNINGS","","","DEDUCTIONS",""`,
      `"Basic Salary","${formatCurrencyPlain(totals.basicSalary)}","","SSS","${formatCurrencyPlain(totals.sss)}"`,
      `"Allowances","${formatCurrencyPlain(totals.allowances)}","","PhilHealth","${formatCurrencyPlain(totals.philhealth)}"`,
      `"Overtime","${formatCurrencyPlain(totals.overtimePay)}","","Pag-IBIG","${formatCurrencyPlain(totals.pagibig)}"`,
      `"Holiday Pay","${formatCurrencyPlain(totals.holidayPay)}","","Tax","${formatCurrencyPlain(totals.tax)}"`,
      `"Night Differential","${formatCurrencyPlain(totals.nightDifferential)}","","Loans","${formatCurrencyPlain(totals.loans)}"`,
      `"Bonus","${formatCurrencyPlain(totals.bonus)}","","Leave Deductions","${formatCurrencyPlain(totals.leaveDeductions)}"`,
      `"13th Month","${formatCurrencyPlain(totals.thirteenthMonth)}","","Other Deductions","${formatCurrencyPlain(totals.otherDeductions)}"`,
      `"Other Earnings","${formatCurrencyPlain(totals.otherEarnings)}","","",""`,
      "",
      `"Total Gross Pay","${formatCurrencyPlain(totals.totalEarnings)}","","Total Deductions","${formatCurrencyPlain(totals.totalDeductions)}"`,
      "",
      `"Total Net Pay","","","","${formatCurrencyPlain(totals.netPay)}"`,
      "",
      "",
      "Employee Payroll Breakdown",
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `payroll-${payrollRun.payroll_run_code}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadPDF = () => {
    if (!payrollRun || entries.length === 0) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payroll Report - ${payrollRun.payroll_run_code}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; }
          h1 { font-size: 18px; margin-bottom: 5px; }
          h2 { font-size: 14px; color: #666; margin-top: 0; }
          .receipt { border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px; }
          .receipt-header { padding: 8px 16px; background: #f5f5f5; border-bottom: 1px solid #ddd; font-weight: bold; font-size: 12px; }
          .receipt-columns { display: flex; }
          .receipt-col { flex: 1; padding: 12px 16px; }
          .receipt-col + .receipt-col { border-left: 1px solid #ddd; }
          .receipt-col-title { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #666; margin-bottom: 6px; }
          .receipt-row { display: flex; justify-content: space-between; font-size: 10px; padding: 2px 0; }
          .receipt-row.label { color: #666; }
          .receipt-divider { border-top: 1px solid #ddd; margin: 6px 0; }
          .receipt-row.bold { font-weight: bold; font-size: 11px; }
          .receipt-net { display: flex; justify-content: space-between; padding: 8px 16px; border-top: 2px solid #333; font-weight: bold; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; font-size: 9px; }
          th, td { border: 1px solid #ddd; padding: 4px 6px; text-align: right; }
          th { background: #f5f5f5; font-weight: bold; }
          td:first-child, th:first-child { text-align: left; }
          .totals { font-weight: bold; background: #f0f0f0; }
          .green { color: #16a34a; }
          .red { color: #dc2626; }
          .blue { color: #2563eb; }
          @media print { body { margin: 10px; } }
        </style>
      </head>
      <body>
        <h1>Payroll Report</h1>
        <h2>${payrollRun.payroll_period?.name || "N/A"} - ${payrollRun.payroll_run_code}</h2>
        <p>Period: ${payrollRun.payroll_period?.start_date || ""} to ${payrollRun.payroll_period?.end_date || ""} | Pay Date: ${payrollRun.payroll_period?.pay_date || ""} | Status: ${statusLabels[payrollRun.status]} | Employees: ${entries.length}</p>
        
        <div class="receipt">
          <div class="receipt-header">TOTALS (${entries.length} employees)</div>
          <div class="receipt-columns">
            <div class="receipt-col">
              <div class="receipt-col-title">Earnings</div>
              <div class="receipt-row label"><span>Basic Salary</span><span>${formatCurrency(totals.basicSalary)}</span></div>
              <div class="receipt-row label"><span>Allowances</span><span>${formatCurrency(totals.allowances)}</span></div>
              <div class="receipt-row label"><span>Overtime</span><span>${formatCurrency(totals.overtimePay)}</span></div>
              <div class="receipt-row label"><span>Holiday Pay</span><span>${formatCurrency(totals.holidayPay)}</span></div>
              <div class="receipt-row label"><span>Night Differential</span><span>${formatCurrency(totals.nightDifferential)}</span></div>
              <div class="receipt-row label"><span>Bonus</span><span>${formatCurrency(totals.bonus)}</span></div>
              <div class="receipt-row label"><span>13th Month</span><span>${formatCurrency(totals.thirteenthMonth)}</span></div>
              <div class="receipt-row label"><span>Other Earnings</span><span>${formatCurrency(totals.otherEarnings)}</span></div>
              <div class="receipt-divider"></div>
              <div class="receipt-row bold green"><span>Total Gross Pay</span><span>${formatCurrency(totals.totalEarnings)}</span></div>
            </div>
            <div class="receipt-col">
              <div class="receipt-col-title">Deductions</div>
              <div class="receipt-row label"><span>SSS</span><span>${formatCurrency(totals.sss)}</span></div>
              <div class="receipt-row label"><span>PhilHealth</span><span>${formatCurrency(totals.philhealth)}</span></div>
              <div class="receipt-row label"><span>Pag-IBIG</span><span>${formatCurrency(totals.pagibig)}</span></div>
              <div class="receipt-row label"><span>Tax</span><span>${formatCurrency(totals.tax)}</span></div>
              <div class="receipt-row label"><span>Loans</span><span>${formatCurrency(totals.loans)}</span></div>
              <div class="receipt-row label"><span>Leave Deductions</span><span>${formatCurrency(totals.leaveDeductions)}</span></div>
              <div class="receipt-row label"><span>Other Deductions</span><span>${formatCurrency(totals.otherDeductions)}</span></div>
              <div class="receipt-divider"></div>
              <div class="receipt-row bold red"><span>Total Deductions</span><span>${formatCurrency(totals.totalDeductions)}</span></div>
            </div>
          </div>
          <div class="receipt-net blue"><span>Total Net Pay</span><span>${formatCurrency(totals.netPay)}</span></div>
        </div>

        <h3 style="font-size: 12px; margin-bottom: 8px;">Employee Payroll Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Basic</th>
              <th>Allow.</th>
              <th>OT</th>
              <th>Holiday</th>
              <th>Night</th>
              <th>Bonus</th>
              <th>13th</th>
              <th>Other</th>
              <th>Gross</th>
              <th>SSS</th>
              <th>PhilH</th>
              <th>HDMF</th>
              <th>Tax</th>
              <th>Loans</th>
              <th>Leave</th>
              <th>Other</th>
              <th>Ded.</th>
              <th>Net Pay</th>
            </tr>
          </thead>
          <tbody>
            ${entries.map((e) => `
              <tr>
                <td>${e.employee?.full_name || "N/A"}<br/><small>${e.employee?.employee_code || ""}</small></td>
                <td>${formatCurrencyPlain(e.basic_salary)}</td>
                <td>${formatCurrencyPlain(e.allowances || 0)}</td>
                <td>${formatCurrencyPlain(e.overtime_pay)}</td>
                <td>${formatCurrencyPlain(e.holiday_pay)}</td>
                <td>${formatCurrencyPlain(e.night_differential)}</td>
                <td>${formatCurrencyPlain(e.bonus)}</td>
                <td>${formatCurrencyPlain(e.thirteenth_month)}</td>
                <td>${formatCurrencyPlain(e.other_earnings)}</td>
                <td class="green">${formatCurrencyPlain(e.total_earnings)}</td>
                <td>${formatCurrencyPlain(e.sss_contribution)}</td>
                <td>${formatCurrencyPlain(e.philhealth_contribution)}</td>
                <td>${formatCurrencyPlain(e.pagibig_contribution)}</td>
                <td>${formatCurrencyPlain(e.bir_withholding_tax)}</td>
                <td>${formatCurrencyPlain(e.loans)}</td>
                <td>${formatCurrencyPlain(e.leave_deductions)}</td>
                <td>${formatCurrencyPlain(e.other_deductions)}</td>
                <td class="red">${formatCurrencyPlain(e.total_deductions)}</td>
                <td class="blue">${formatCurrencyPlain(e.net_pay)}</td>
              </tr>
            `).join("")}
            <tr class="totals">
              <td>TOTALS (${entries.length} employees)</td>
              <td>${formatCurrencyPlain(totals.basicSalary)}</td>
              <td>${formatCurrencyPlain(totals.allowances)}</td>
              <td>${formatCurrencyPlain(totals.overtimePay)}</td>
              <td>${formatCurrencyPlain(totals.holidayPay)}</td>
              <td>${formatCurrencyPlain(totals.nightDifferential)}</td>
              <td>${formatCurrencyPlain(totals.bonus)}</td>
              <td>${formatCurrencyPlain(totals.thirteenthMonth)}</td>
              <td>${formatCurrencyPlain(totals.otherEarnings)}</td>
              <td class="green">${formatCurrencyPlain(totals.totalEarnings)}</td>
              <td>${formatCurrencyPlain(totals.sss)}</td>
              <td>${formatCurrencyPlain(totals.philhealth)}</td>
              <td>${formatCurrencyPlain(totals.pagibig)}</td>
              <td>${formatCurrencyPlain(totals.tax)}</td>
              <td>${formatCurrencyPlain(totals.loans)}</td>
              <td>${formatCurrencyPlain(totals.leaveDeductions)}</td>
              <td>${formatCurrencyPlain(totals.otherDeductions)}</td>
              <td class="red">${formatCurrencyPlain(totals.totalDeductions)}</td>
              <td class="blue">${formatCurrencyPlain(totals.netPay)}</td>
            </tr>
          </tbody>
        </table>
        <p style="margin-top: 20px; color: #666; font-size: 8px;">Generated on ${new Date().toLocaleString()}</p>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrint = () => {
    handleDownloadPDF();
  };

  if (!payrollRun) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Payroll Run Details
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {payrollRun.payroll_period?.name || "N/A"} - {payrollRun.payroll_run_code}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadCSV} disabled={entries.length === 0}>
                <DownloadIcon className="size-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={entries.length === 0}>
                <PdfIcon className="size-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} disabled={entries.length === 0}>
                <PrintIcon className="size-4 mr-2" />
                Print
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <CloseIcon className="size-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Period</p>
              <p className="text-lg font-semibold">
                {payrollRun.payroll_period?.name || "N/A"}
              </p>
              <p className="text-xs text-muted-foreground">
                {payrollRun.payroll_period?.start_date} - {payrollRun.payroll_period?.end_date}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge status={payrollRun.status}>
                  {statusLabels[payrollRun.status]}
                </StatusBadge>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-lg font-semibold">{payrollRun.total_employees}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Pay Date</p>
              <p className="text-lg font-semibold">
                {formatDate(payrollRun.payroll_period?.pay_date || null)}
              </p>
            </div>
          </div>

          {/* Receipt-style Financial Summary - Columns */}
          <div className="rounded-lg border mb-6 overflow-hidden">
            <div className="px-5 py-3 bg-muted/50 border-b">
              <p className="font-semibold">TOTALS ({entries.length} employees)</p>
            </div>
            <div className="grid grid-cols-2 divide-x">
              {/* Earnings Column */}
              <div className="px-5 py-4 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Earnings</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Basic Salary</span>
                  <span>{formatCurrency(totals.basicSalary)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Allowances</span>
                  <span>{formatCurrency(totals.allowances)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overtime</span>
                  <span>{formatCurrency(totals.overtimePay)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Holiday Pay</span>
                  <span>{formatCurrency(totals.holidayPay)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Night Differential</span>
                  <span>{formatCurrency(totals.nightDifferential)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bonus</span>
                  <span>{formatCurrency(totals.bonus)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">13th Month</span>
                  <span>{formatCurrency(totals.thirteenthMonth)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Other Earnings</span>
                  <span>{formatCurrency(totals.otherEarnings)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold text-green-700 dark:text-green-400">
                  <span>Total Gross Pay</span>
                  <span>{formatCurrency(totals.totalEarnings)}</span>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="px-5 py-4 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Deductions</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SSS</span>
                  <span>{formatCurrency(totals.sss)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PhilHealth</span>
                  <span>{formatCurrency(totals.philhealth)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pag-IBIG</span>
                  <span>{formatCurrency(totals.pagibig)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loans</span>
                  <span>{formatCurrency(totals.loans)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Leave Deductions</span>
                  <span>{formatCurrency(totals.leaveDeductions)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Other Deductions</span>
                  <span>{formatCurrency(totals.otherDeductions)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold text-red-700 dark:text-red-400">
                  <span>Total Deductions</span>
                  <span>{formatCurrency(totals.totalDeductions)}</span>
                </div>
              </div>
            </div>

            {/* Net Pay - full width */}
            <div className="flex justify-between px-5 py-3 border-t-2 text-lg font-bold text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20">
              <span>Total Net Pay</span>
              <span>{formatCurrency(totals.netPay)}</span>
            </div>
          </div>

          {/* Employee Breakdown Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/50 flex items-center justify-between">
              <h3 className="font-semibold">Employee Payroll Breakdown</h3>
              <p className="text-sm text-muted-foreground">Click and drag to scroll horizontally</p>
            </div>
            {/* Table Container with Drag-to-Scroll */}
            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto max-h-[400px] overflow-y-auto cursor-grab active:cursor-grabbing"
            >
              <div className="relative w-full">
              <table className="w-full caption-bottom text-sm min-w-[2000px]">
                  <TableHeader className="sticky top-0 bg-muted z-20">
                    <TableRow className="bg-muted">
                    <TableHead className="min-w-[250px] w-[250px] sticky left-0 bg-muted z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Employee</TableHead>
                    <TableHead className="text-right min-w-[100px]">Basic Salary</TableHead>
                    <TableHead className="text-right min-w-[90px]">Allowances</TableHead>
                    <TableHead className="text-right min-w-[90px]">Overtime</TableHead>
                    <TableHead className="text-right min-w-[90px]">Holiday</TableHead>
                    <TableHead className="text-right min-w-[90px]">Night Diff</TableHead>
                    <TableHead className="text-right min-w-[80px]">Bonus</TableHead>
                    <TableHead className="text-right min-w-[80px]">13th Month</TableHead>
                    <TableHead className="text-right min-w-[80px]">Other</TableHead>
                    <TableHead className="text-right min-w-[110px] bg-green-50 dark:bg-green-950/30 font-semibold">Gross Pay</TableHead>
                    <TableHead className="text-right min-w-[80px]">SSS</TableHead>
                    <TableHead className="text-right min-w-[80px]">PhilHealth</TableHead>
                    <TableHead className="text-right min-w-[80px]">Pag-IBIG</TableHead>
                    <TableHead className="text-right min-w-[90px]">Tax</TableHead>
                    <TableHead className="text-right min-w-[80px]">Loans</TableHead>
                    <TableHead className="text-right min-w-[80px]">Leave Ded.</TableHead>
                    <TableHead className="text-right min-w-[80px]">Other Ded.</TableHead>
                    <TableHead className="text-right min-w-[110px] bg-red-50 dark:bg-red-950/30 font-semibold">Total Ded.</TableHead>
                    <TableHead className="text-right min-w-[120px] bg-blue-50 dark:bg-blue-950/30 font-bold">Net Pay</TableHead>
                    <TableHead className="text-right min-w-[70px]">Days</TableHead>
                    <TableHead className="text-right min-w-[70px]">Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={21} className="h-24 text-center text-muted-foreground">
                        Loading employee data...
                      </TableCell>
                    </TableRow>
                  ) : entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={21} className="h-24 text-center text-muted-foreground">
                        No payroll entries found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {/* Totals Row at TOP */}
                      <TableRow className="bg-muted font-semibold border-b-2 sticky top-[6px] z-20">
                        <TableCell className="sticky left-0 bg-muted z-30 min-w-[250px] w-[250px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">TOTALS ({entries.length} employees)</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.basicSalary)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.allowances)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.overtimePay)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.holidayPay)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.nightDifferential)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.bonus)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.thirteenthMonth)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.otherEarnings)}</TableCell>
                        <TableCell className="text-right text-green-700 bg-green-100 dark:bg-green-950/40">{formatCurrency(totals.totalEarnings)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.sss)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.philhealth)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.pagibig)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.tax)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.loans)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.leaveDeductions)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.otherDeductions)}</TableCell>
                        <TableCell className="text-right text-red-700 bg-red-100 dark:bg-red-950/40">{formatCurrency(totals.totalDeductions)}</TableCell>
                        <TableCell className="text-right text-blue-700 font-bold bg-blue-100 dark:bg-blue-950/40">{formatCurrency(totals.netPay)}</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className="text-right">-</TableCell>
                      </TableRow>
                      {/* Employee Rows */}
                      {entries.map((entry) => (
                        <TableRow key={entry.id} className="hover:bg-muted/50">
                          <TableCell className="sticky left-0 bg-background z-10 min-w-[250px] w-[250px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            <div className="overflow-hidden">
                              <p className="font-medium truncate">{entry.employee?.full_name || "N/A"}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {entry.employee?.employee_code} | {entry.employee?.department?.name || "-"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.basic_salary)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.allowances || 0)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.overtime_pay)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.holiday_pay)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.night_differential)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.bonus)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.thirteenth_month)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.other_earnings)}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600 bg-green-50/50 dark:bg-green-950/20">{formatCurrency(entry.total_earnings)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(entry.sss_contribution)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(entry.philhealth_contribution)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(entry.pagibig_contribution)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(entry.bir_withholding_tax)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(entry.loans)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(entry.leave_deductions)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(entry.other_deductions)}</TableCell>
                          <TableCell className="text-right font-semibold text-red-600 bg-red-50/50 dark:bg-red-950/20">{formatCurrency(entry.total_deductions)}</TableCell>
                          <TableCell className="text-right font-bold text-blue-600 bg-blue-50/50 dark:bg-blue-950/20">{formatCurrency(entry.net_pay)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{entry.days_worked || 0}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{entry.hours_worked || 0}</TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </table>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold mb-2">Processing Information</h4>
              <div className="space-y-1 text-muted-foreground">
                <p>Created by: {payrollRun.creator?.name || "System"}</p>
                <p>Created at: {formatDate(payrollRun.created_at)}</p>
                <p>Processed at: {formatDate(payrollRun.processed_at)}</p>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold mb-2">Approval Information</h4>
              <div className="space-y-1 text-muted-foreground">
                <p>Approved by: {payrollRun.approver?.name || "-"}</p>
                <p>Approved at: {formatDate(payrollRun.approved_at)}</p>
                <p>Notes: {payrollRun.notes || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
