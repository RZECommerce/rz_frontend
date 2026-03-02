import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { attendanceService } from "@/services/attendance.service";
import {
    ErrorOutline as AlertCircleIcon,
    Event as Calendar01Icon,
    AccessTime as Clock01Icon,
    Description as File01Icon,
    People as UserGroupIcon,
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

export function AttendanceStats() {
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["attendances", "stats"],
    queryFn: () => attendanceService.getAll({ per_page: 1000 }),
  });

  const statsCards: StatCard[] = React.useMemo(() => {
    const attendances = attendanceData?.data || [];
    const today = new Date().toISOString().split("T")[0];
    const todayAttendances = attendances.filter((att) => att.date === today);

    const present = todayAttendances.filter((att) => att.status === "present").length;
    const absent = todayAttendances.filter((att) => att.status === "absent").length;
    const late = todayAttendances.filter((att) => att.status === "late").length;
    const onLeave = todayAttendances.filter((att) => att.status === "on_leave").length;

    // Calculate average hours worked (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAttendances = attendances.filter((att) => {
      const attDate = new Date(att.date);
      return attDate >= thirtyDaysAgo && att.status === "present";
    });
    const totalHours = recentAttendances.reduce(
      (sum, att) => sum + att.total_hours,
      0
    );
    const avgHours = recentAttendances.length > 0
      ? (totalHours / recentAttendances.length).toFixed(1)
      : "0.0";

    return [
      {
        title: "Total Records",
        value: attendances.length.toString(),
        subtitle: "All time",
        icon: Calendar01Icon,
        subtitleIcon: File01Icon,
      },
      {
        title: "Present Today",
        value: present.toString(),
        subtitle: `Out of ${todayAttendances.length} employees`,
        icon: UserGroupIcon,
        subtitleIcon: File01Icon,
      },
      {
        title: "Absent Today",
        value: absent.toString(),
        subtitle: "Not checked in",
        icon: AlertCircleIcon,
        subtitleIcon: File01Icon,
      },
      {
        title: "Late Today",
        value: late.toString(),
        subtitle: "Arrived after time",
        icon: Clock01Icon,
        subtitleIcon: File01Icon,
      },
      {
        title: "On Leave Today",
        value: onLeave.toString(),
        subtitle: "Approved leave",
        icon: Calendar01Icon,
        subtitleIcon: File01Icon,
      },
      {
        title: "Avg Hours (30d)",
        value: `${avgHours} hrs`,
        subtitle: "Last 30 days",
        icon: Clock01Icon,
        subtitleIcon: File01Icon,
      },
    ];
  }, [attendanceData]);

  if (isLoading) {
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

