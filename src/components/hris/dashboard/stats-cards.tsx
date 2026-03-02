
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { dashboardService } from "@/services/dashboard.service";
import {
  CalendarToday as CalendarIcon,
  AccessTime as ClockIcon,
  MonetizationOn as CoinsIcon,
  Description as FileIcon,
  Info as InfoIcon,
  Receipt as InvoiceIcon,
  Group as UserGroupIcon
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

export function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const statsCards = React.useMemo(() => {
    if (!stats) return [];

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    return [
      {
        title: "Total Employees",
        value: stats.employees.total.toString(),
        subtitle: `Active: ${stats.employees.active}, Inactive: ${stats.employees.inactive}`,
        icon: UserGroupIcon,
        subtitleIcon: FileIcon,
      },
      {
        title: "Attendance Rate",
        value: `${stats.attendance.rate}%`,
        subtitle: `Present: ${stats.attendance.present}, Late: ${stats.attendance.late}, Absent: ${stats.attendance.absent}`,
        icon: CalendarIcon,
        subtitleIcon: InfoIcon,
      },
      {
        title: "Pending Leaves",
        value: stats.leaves.pending.toString(),
        subtitle: `${stats.leaves.upcoming} upcoming approved leaves`,
        icon: ClockIcon,
        subtitleIcon: InfoIcon,
      },
      {
        title: "This Month Payroll",
        value: formatCurrency(stats.payroll.this_month),
        subtitle: stats.payroll.latest_run
          ? `Last: ${stats.payroll.latest_run.period_name}`
          : "No payroll processed yet",
        icon: InvoiceIcon,
        subtitleIcon: FileIcon,
      },
      {
        title: "Total Payroll Expense",
        value: formatCurrency(stats.payroll.total_expense),
        subtitle: `${stats.payroll.upcoming_runs.length} upcoming payroll runs`,
        icon: CoinsIcon,
        subtitleIcon: FileIcon,
      },
    ];
  }, [stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="flex flex-col animate-pulse">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
      {statsCards.map((stat) => (
        <Card key={stat.title} className="flex flex-col h-full">
          <CardHeader className="pb-3 flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0 !rounded-xl">
              <stat.icon className="size-5" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-4">
            <p className="text-2xl sm:text-[26px] font-semibold tracking-tight mb-4">
              {stat.value}
            </p>
            <div className="flex items-center gap-1.5 text-muted-foreground ">
              <stat.subtitleIcon className="size-4" />
              <span className="text-sm font-medium">{stat.subtitle}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
