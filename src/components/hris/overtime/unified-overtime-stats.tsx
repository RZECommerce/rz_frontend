import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { overtimeRequestService } from "@/services/overtime-request.service";
import { overtimeService } from "@/services/overtime.service";
import type { OvertimeLogFilters } from "@/types/overtime";
import {
  CheckCircle as CheckCircleIcon,
  AccessTime as ClockIcon,
  Description as FileIcon,
  List as ListIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
  Group as UserGroupIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  subtitleIcon: any;
}

interface UnifiedOvertimeStatsProps {
  filters: OvertimeLogFilters;
}

export function UnifiedOvertimeStats({ filters }: UnifiedOvertimeStatsProps) {
  // Get unified overtime data (attendance + approved requests)
  const { data: overtimeData, isLoading: overtimeLoading } = useQuery({
    queryKey: ["overtime-unified", "stats", filters],
    queryFn: () => overtimeService.getAll({ ...filters, per_page: 1000 }),
  });

  // Get pending requests count
  const { data: pendingRequests } = useQuery({
    queryKey: ["overtime-requests", "pending", "count"],
    queryFn: () =>
      overtimeRequestService.getAll({
        status: "pending",
        per_page: 1,
        page: 1,
      }),
    enabled: true,
  });

  const statsCards: StatCard[] = React.useMemo(() => {
    const allRecords = overtimeData?.data || [];
    const pendingCount = pendingRequests?.total || 0;

    // Calculate unified statistics
    const totalRecords = allRecords.length;
    const totalOvertimeHours = allRecords.reduce(
      (sum, record) => sum + record.overtime_hours,
      0,
    );
    const uniqueEmployees = new Set(
      allRecords.map((record) => record.employee_id),
    ).size;
    const averageOvertime =
      totalRecords > 0 ? totalOvertimeHours / totalRecords : 0;

    // Separate attendance vs request stats
    const attendanceRecords = allRecords.filter(
      (record) => record.attendance_id !== null,
    );
    const requestRecords = allRecords.filter(
      (record) => record.attendance_id === null,
    );
    const approvedRequests = requestRecords.filter(
      (record) => record.status === "approved",
    );

    return [
      {
        title: "Total Records",
        value: totalRecords.toString(),
        subtitle: "All overtime",
        icon: ListIcon,
        subtitleIcon: FileIcon,
      },
      {
        title: "Pending Approval",
        value: pendingCount.toString(),
        subtitle: "Need action",
        icon: PendingIcon,
        subtitleIcon: FileIcon,
      },
      {
        title: "Total OT Hours",
        value: `${totalOvertimeHours.toFixed(1)}h`,
        subtitle: "All time",
        icon: ClockIcon,
        subtitleIcon: FileIcon,
      },
      {
        title: "Employees with OT",
        value: uniqueEmployees.toString(),
        subtitle: "Active employees",
        icon: UserGroupIcon,
        subtitleIcon: FileIcon,
      },
      {
        title: "Average OT",
        value: `${averageOvertime.toFixed(1)}h`,
        subtitle: "Per record",
        icon: TrendingUpIcon,
        subtitleIcon: FileIcon,
      },
      {
        title: "Approved Requests",
        value: approvedRequests.length.toString(),
        subtitle: "This month",
        icon: CheckCircleIcon,
        subtitleIcon: FileIcon,
      },
    ];
  }, [overtimeData, pendingRequests]);

  if (overtimeLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
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
