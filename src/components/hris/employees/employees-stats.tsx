import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { employeeService } from "@/services/employee.service";
import {
  Cancel as Cancel01Icon,
  CheckCircle as CheckmarkCircle01Icon,
  AccessTime as Clock01Icon,
  Description as File01Icon,
  Group as UserGroupIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  subtitleIcon: React.ElementType;
}

export function EmployeesStats() {
  const { data: employeesData, isLoading } = useQuery({
    queryKey: ["employees", "stats"],
    queryFn: () => employeeService.getAll({ per_page: 1000 }),
  });

  const statsCards: StatCard[] = React.useMemo(() => {
    const employees = Array.isArray(employeesData?.data) ? employeesData.data : [];

    const active = employees.filter((emp) => emp.status === "active").length;
    const inactive = employees.filter(
      (emp) => emp.status === "inactive" || emp.status === "terminated"
    ).length;
    const onLeave = employees.filter((emp) => emp.status === "on_leave").length;
    const probation = employees.filter((emp) => emp.status === "probation").length;

    return [
      {
        title: "Total Employees",
        value: employees.length.toString(),
        subtitle: `Active: ${active}, Inactive: ${inactive}`,
        icon: UserGroupIcon,
        subtitleIcon: File01Icon,
      },
      {
        title: "Active",
        value: active.toString(),
        subtitle: "Currently working",
        icon: CheckmarkCircle01Icon,
        subtitleIcon: File01Icon,
      },
      {
        title: "On Leave",
        value: onLeave.toString(),
        subtitle: "Approved leave",
        icon: Clock01Icon,
        subtitleIcon: File01Icon,
      },
      {
        title: "Probation",
        value: probation.toString(),
        subtitle: "Under probation",
        icon: Clock01Icon,
        subtitleIcon: File01Icon,
      },
      {
        title: "Inactive",
        value: inactive.toString(),
        subtitle: "Not active",
        icon: Cancel01Icon,
        subtitleIcon: File01Icon,
      },
    ];
  }, [employeesData]);

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

