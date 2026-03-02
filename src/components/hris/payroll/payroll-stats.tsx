import { payrollRunService } from "@/services/payroll.service";
import type { PayrollRun } from "@/types/payroll";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    CheckCircle as CheckmarkCircle01Icon,
    AccessTime as Clock01Icon,
    MonetizationOn as Coins01Icon,
    Receipt as Invoice01Icon,
    Description as FileIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

export function PayrollStats() {
  const { data: payrollRunsData, isLoading } = useQuery({
    queryKey: ["payrollRuns", { per_page: 9999 }],
    queryFn: () => payrollRunService.getAll({ per_page: 9999 }),
  });

  const payrollRuns = React.useMemo(() => {
    if (!payrollRunsData?.data) return [];
    const data = payrollRunsData.data;
    return Array.isArray(data) ? data : [];
  }, [payrollRunsData]);

  const stats = React.useMemo(() => {
    const totalRuns = payrollRuns.length;
    const draftRuns = payrollRuns.filter((pr: PayrollRun) => pr.status === "draft").length;
    const processingRuns = payrollRuns.filter((pr: PayrollRun) => pr.status === "processing").length;
    const approvedRuns = payrollRuns.filter((pr: PayrollRun) => pr.status === "approved").length;
    const paidRuns = payrollRuns.filter((pr: PayrollRun) => pr.status === "paid").length;

    const totalGrossPay = payrollRuns.reduce(
      (sum: number, pr: PayrollRun) => sum + pr.total_gross_pay,
      0
    );
    const totalNetPay = payrollRuns.reduce(
      (sum: number, pr: PayrollRun) => sum + pr.total_net_pay,
      0
    );

    return [
      {
        title: "Total Runs",
        value: totalRuns.toString(),
        subtitle: "All payroll runs",
        icon: Invoice01Icon,
        subtitleIcon: FileIcon,
      },
      {
        title: "Draft",
        value: draftRuns.toString(),
        subtitle: "Draft runs",
        icon: Clock01Icon,
        subtitleIcon: FileIcon,
      },
      {
        title: "Processing",
        value: processingRuns.toString(),
        subtitle: "In progress",
        icon: Clock01Icon,
        subtitleIcon: FileIcon,
      },
      {
        title: "Approved",
        value: approvedRuns.toString(),
        subtitle: "Approved runs",
        icon: CheckmarkCircle01Icon,
        subtitleIcon: FileIcon,
      },
      {
        title: "Paid",
        value: paidRuns.toString(),
        subtitle: "Paid out",
        icon: CheckmarkCircle01Icon,
        subtitleIcon: FileIcon,
      },
      {
        title: "Total Net Pay",
        value: `₱${totalNetPay.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        subtitle: "All time",
        icon: Coins01Icon,
        subtitleIcon: FileIcon,
      },
    ];
  }, [payrollRuns]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex flex-col animate-pulse h-full">
            <CardHeader className="pb-0">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-32 mb-4" />
              <div className="h-4 bg-muted rounded w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="flex flex-col h-full">
          <CardHeader className="pb-3 flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
              <stat.icon className="size-5" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-4">
            <p className="text-2xl sm:text-[26px] font-semibold tracking-tight mb-4">
              {stat.value}
            </p>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <stat.subtitleIcon className="size-4" />
              <span className="text-sm font-medium">{stat.subtitle}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

