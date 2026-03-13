import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { payrollRunService } from "@/services/payroll.service";
import type { PayrollRun } from "@/types/payroll";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import type { TooltipProps } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { format } from "date-fns";

const chartConfig = {
  gross: {
    label: "Gross Pay",
    color: "var(--chart-4-hex)",
  },
  deductions: {
    label: "Deductions",
    color: "var(--chart-silver)",
  },
  net: {
    label: "Net Pay",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className=" bg-background gap-1.5 rounded-lg  px-2.5 py-1.5 text-xs shadow-xl grid min-w-32 items-start">
      <div className="font-medium mb-2">{label}</div>
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const dataKey = item.dataKey as string;
          const config = chartConfig[dataKey as keyof typeof chartConfig];
          const label = config?.label || dataKey;
          const color = config?.color || item.color || "#000";
          const value = typeof item.value === "number" ? item.value : 0;

          return (
            <div
              key={index}
              className="flex w-full items-center gap-2"
            >
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: color }}
              />
              <div className="flex flex-1 justify-between items-center">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground font-mono font-medium tabular-nums">
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PayrollChart() {
  const { data: payrollRunsData, isLoading } = useQuery({
    queryKey: ["payrollRuns", "chart"],
    queryFn: () => payrollRunService.getAll({ per_page: 12, status: "approved" }),
  });

  const chartData = React.useMemo(() => {
    if (!payrollRunsData?.data) return [];

    const data = payrollRunsData.data;
    if (!Array.isArray(data)) return [];

    return data
      .slice()
      .reverse()
      .map((run: PayrollRun) => ({
        month: format(new Date(run.payroll_period?.end_date || run.created_at), "MMM"),
        gross: run.total_gross_pay || 0,
        deductions: run.total_deductions || 0,
        net: run.total_net_pay || 0,
      }));
  }, [payrollRunsData]);

  if (isLoading) {
    return (
      <Card className="relative bg-card  rounded-xl overflow-hidden">
        <div className="relative">
          <CardHeader>
            <CardTitle>Payroll Overview</CardTitle>
            <CardDescription>Loading chart data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted animate-pulse rounded" />
          </CardContent>
        </div>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="relative bg-card  overflow-hidden">
        <div className="relative">
          <CardHeader>
            <CardTitle>Payroll Overview</CardTitle>
            <CardDescription>Last 12 months payroll summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>No payroll data available. Approved payroll runs will appear here.</p>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative bg-card rounded-xl overflow-hidden flex flex-col h-full w-full">
      <div className="relative flex flex-col flex-1">
        <CardHeader>
          <CardTitle>Payroll Overview</CardTitle>
          <CardDescription>Last 12 months payroll summary</CardDescription>
        </CardHeader>
        <CardContent className="w-full px-2 sm:px-6">
          <ChartContainer config={chartConfig} className="w-full h-[250px] sm:h-[300px] mt-4 min-w-0">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            >
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--chart-axis)", fontSize: 12 }}
                tickFormatter={(value: number) =>
                  new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                    notation: "compact",
                    maximumFractionDigits: 0,
                  }).format(value)
                }
              />
              <ChartTooltip cursor={false} content={<CustomTooltip />} />
              <ChartLegend
                content={<ChartLegendContent />}
                wrapperStyle={{ paddingTop: "16px" }}
              />
              <defs>
                <linearGradient id="fillGross" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-gross)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-gross)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillDeductions" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-deductions)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-deductions)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillNet" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-net)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-net)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="net"
                type="natural"
                fill="url(#fillNet)"
                fillOpacity={0.4}
                stroke="var(--color-net)"
                strokeWidth={2}
              />
              <Area
                dataKey="deductions"
                type="natural"
                fill="url(#fillDeductions)"
                fillOpacity={0.4}
                stroke="var(--color-deductions)"
                strokeWidth={2}
              />
              <Area
                dataKey="gross"
                type="natural"
                fill="url(#fillGross)"
                fillOpacity={0.4}
                stroke="var(--color-gross)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </div>
    </Card>
  );
}

