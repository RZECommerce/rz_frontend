
import { useQuery } from "@tanstack/react-query";
import { overtimeService } from "@/services/overtime.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AccessTime as ClockIcon,
  Group as UserGroupIcon,
  Description as FileIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  List as ListIcon,
} from "@mui/icons-material";
import type { OvertimeLogFilters } from "@/types/overtime";

interface OvertimeStatsProps {
  filters?: OvertimeLogFilters;
}

export function OvertimeStats({ filters }: OvertimeStatsProps) {
  const { data: overtimeData, isLoading } = useQuery({
    queryKey: ["overtime", "stats", filters],
    queryFn: () => overtimeService.getAll({ ...filters, per_page: 1000 }),
  });

  const logs = overtimeData?.data || [];

  const stats = {
    totalLogs: logs.length,
    totalOvertimeHours: logs.reduce((sum, log) => sum + log.overtime_hours, 0),
    totalEmployees: new Set(logs.map((log) => log.employee_id)).size,
    averageOvertime: logs.length
      ? logs.reduce((sum, log) => sum + log.overtime_hours, 0) / logs.length
      : 0,
    thisMonth: logs.filter((log) => {
      const logDate = new Date(log.date);
      const now = new Date();
      return (
        logDate.getMonth() === now.getMonth() &&
        logDate.getFullYear() === now.getFullYear()
      );
    }).length,
    thisMonthHours: logs
      .filter((log) => {
        const logDate = new Date(log.date);
        const now = new Date();
        return (
          logDate.getMonth() === now.getMonth() &&
          logDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, log) => sum + log.overtime_hours, 0),
  };

  const statsCards = [
    {
      title: "Total Logs",
      value: stats.totalLogs.toString(),
      subtitle: "All time",
      icon: ListIcon,
      subtitleIcon: FileIcon,
    },
    {
      title: "Total Overtime Hours",
      value: `${stats.totalOvertimeHours.toFixed(1)}h`,
      subtitle: "Total hours",
      icon: ClockIcon,
      subtitleIcon: FileIcon,
    },
    {
      title: "Employees with OT",
      value: stats.totalEmployees.toString(),
      subtitle: "Active employees",
      icon: UserGroupIcon,
      subtitleIcon: FileIcon,
    },
    {
      title: "Average OT per Log",
      value: `${stats.averageOvertime.toFixed(1)}h`,
      subtitle: "Per log entry",
      icon: TrendingUpIcon,
      subtitleIcon: FileIcon,
    },
    {
      title: "This Month Logs",
      value: stats.thisMonth.toString(),
      subtitle: "Current month",
      icon: CalendarIcon,
      subtitleIcon: FileIcon,
    },
    {
      title: "This Month Hours",
      value: `${stats.thisMonthHours.toFixed(1)}h`,
      subtitle: "Current month",
      icon: ClockIcon,
      subtitleIcon: FileIcon,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statsCards.map((stat) => (
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

