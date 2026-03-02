import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { leaveRequestService } from "@/services/leave.service";
import type { LeaveRequest } from "@/types/leave";
import {
    CalendarToday as Calendar01Icon,
    CheckCircle as CheckmarkCircle01Icon,
    Cancel as CircleIcon,
    AccessTime as Clock01Icon,
    Description as File01Icon,
    PauseCircle as PauseCircleIcon,
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

export function LeavesStats() {
  const { data: leaveRequestsData, isLoading } = useQuery({
    queryKey: ["leaveRequests", { per_page: 9999 }], // Fetch all for stats
    queryFn: () => leaveRequestService.getAll({ per_page: 9999 }),
  });

  const leaveRequests = React.useMemo(() => {
    if (!leaveRequestsData?.data) return [];
    const data = leaveRequestsData.data;
    return Array.isArray(data) ? data : [];
  }, [leaveRequestsData]);

  const statsCards: StatCard[] = React.useMemo(() => {
    const totalRequests = leaveRequests.length;
    const pendingRequests = leaveRequests.filter(
      (lr: LeaveRequest) => lr.status === "pending"
    ).length;
    const approvedRequests = leaveRequests.filter(
      (lr: LeaveRequest) => lr.status === "approved"
    ).length;
    const rejectedRequests = leaveRequests.filter(
      (lr: LeaveRequest) => lr.status === "rejected"
    ).length;
    const cancelledRequests = leaveRequests.filter(
      (lr: LeaveRequest) => lr.status === "cancelled"
    ).length;

    // Calculate total days
    const totalDays = leaveRequests.reduce(
      (sum: number, lr: LeaveRequest) => sum + lr.total_days,
      0
    );

    return [
      {
        title: "Total Requests",
        value: totalRequests.toString(),
        subtitle: "All time",
        icon: Calendar01Icon,
        subtitleIcon: File01Icon,
      },
      {
        title: "Pending",
        value: pendingRequests.toString(),
        subtitle: "Awaiting approval",
        icon: Clock01Icon,
        subtitleIcon: File01Icon,
      },
      {
        title: "Approved",
        value: approvedRequests.toString(),
        subtitle: "Approved requests",
        icon: CheckmarkCircle01Icon,
        subtitleIcon: File01Icon,
      },
      {
        title: "Rejected",
        value: rejectedRequests.toString(),
        subtitle: "Rejected requests",
        icon: CircleIcon,
        subtitleIcon: File01Icon,
      },
      {
        title: "Cancelled",
        value: cancelledRequests.toString(),
        subtitle: "Cancelled requests",
        icon: PauseCircleIcon,
        subtitleIcon: File01Icon,
      },
      {
        title: "Total Days",
        value: totalDays.toFixed(0),
        subtitle: "Total leave days",
        icon: Calendar01Icon,
        subtitleIcon: File01Icon,
      },
    ];
  }, [leaveRequests]);

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

