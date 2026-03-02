
import { useQuery } from "@tanstack/react-query";
import { timesheetService } from "@/services/timesheet.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Group as UserGroupIcon,
  AccessTime as ClockIcon,
  Description as FileIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

interface TimesheetStatsProps {
  weekStart: string;
  weekEnd: string;
  employeeId?: string;
}

export function TimesheetStats({
  weekStart,
  weekEnd,
  employeeId,
}: TimesheetStatsProps) {
  const { data: timesheets, isLoading } = useQuery({
    queryKey: ["timesheets", "weekly", weekStart, weekEnd, employeeId],
    queryFn: () =>
      timesheetService.getWeekly(weekStart, weekEnd, {
        employee_id: employeeId,
      }),
  });

  const stats = {
    totalEmployees: timesheets?.length || 0,
    totalHours: timesheets?.reduce((sum, t) => sum + t.total_hours, 0) || 0,
    totalOvertime: timesheets?.reduce((sum, t) => sum + t.overtime_hours, 0) || 0,
    averageHours: timesheets?.length
      ? timesheets.reduce((sum, t) => sum + t.total_hours, 0) / timesheets.length
      : 0,
  };

  const statsCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees.toString(),
      subtitle: "Employees with timesheets",
      icon: UserGroupIcon,
      subtitleIcon: FileIcon,
    },
    {
      title: "Total Hours",
      value: `${stats.totalHours.toFixed(1)}h`,
      subtitle: "Total hours worked",
      icon: ClockIcon,
      subtitleIcon: FileIcon,
    },
    {
      title: "Total Overtime",
      value: `${stats.totalOvertime.toFixed(1)}h`,
      subtitle: "Overtime hours",
      icon: ClockIcon,
      subtitleIcon: FileIcon,
    },
    {
      title: "Average Hours",
      value: `${stats.averageHours.toFixed(1)}h`,
      subtitle: "Per employee",
      icon: TrendingUpIcon,
      subtitleIcon: FileIcon,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

