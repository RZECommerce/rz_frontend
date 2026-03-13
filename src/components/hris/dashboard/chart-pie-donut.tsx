import * as React from "react"

import { Label, Pie, PieChart } from "recharts"
import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/services/dashboard.service"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Button } from "@base-ui/react"

const chartConfig = {
  present: {
    label: "Present",
    color: "var(--primary)",
  },
  late: {
    label: "Late",
    color: "var(--chart-4-hex)",
  },
  absent: {
    label: "Absent",
    color: "var(--chart-silver)",
  },
} satisfies ChartConfig

export function ChartPieDonutText() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const chartData = React.useMemo(() => {
    if (!stats) return [];

    return [
      {
        name: "present",
        value: stats.attendance.present,
        fill: "var(--color-present)"
      },
      {
        name: "late",
        value: stats.attendance.late,
        fill: "var(--color-late)"
      },
      {
        name: "absent",
        value: stats.attendance.absent,
        fill: "var(--color-absent)"
      },
    ];
  }, [stats]);

  if (isLoading) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="items-center pb-0">
          <CardTitle>Attendance Rate </CardTitle>
          <CardDescription>Loading attendance data...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="h-full bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!stats || chartData.length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="items-center pb-0">
          <CardTitle>Attendance Rate</CardTitle>
          <CardDescription>Today's attendance overview</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>No attendance data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Attendance Rate </CardTitle>
        <CardDescription>Today's attendance overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 w-full">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px] w-full min-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="90%"
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-xl sm:text-2xl font-bold"
                        >
                          {stats.attendance.rate}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-xs"
                        >
                          Attendance Rate
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
