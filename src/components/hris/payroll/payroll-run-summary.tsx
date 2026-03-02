
import type { PayrollRun } from "@/types/payroll";
import {
    MonetizationOn as Coins01Icon,
    Receipt as Invoice01Icon,
    People as UserGroupIcon,
    AccountBalanceWallet as Wallet01Icon,
} from "@mui/icons-material";

interface PayrollRunSummaryProps {
  payrollRun: PayrollRun;
}

export function PayrollRunSummary({ payrollRun }: PayrollRunSummaryProps) {
  const stats = [
    {
      title: "Total Employees",
      value: payrollRun.total_employees.toString(),
      icon: UserGroupIcon,
      color: "var(--blue)",
    },
    {
      title: "Gross Pay",
      value: `₱${payrollRun.total_gross_pay.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: Coins01Icon,
      color: "var(--green)",
    },
    {
      title: "Total Deductions",
      value: `₱${payrollRun.total_deductions.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: Invoice01Icon,
      color: "var(--red)",
    },
    {
      title: "Net Pay",
      value: `₱${payrollRun.total_net_pay.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: Wallet01Icon,
      color: "var(--purple)",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="relative p-5 rounded-xl border bg-card overflow-hidden"
        >
          <div className="relative flex items-start justify-between">
            <div className="flex flex-col gap-6">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <p className="text-2xl sm:text-[26px] font-semibold tracking-tight">
                {stat.value}
              </p>
            </div>
            <stat.icon className="size-5" style={{ color: stat.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

