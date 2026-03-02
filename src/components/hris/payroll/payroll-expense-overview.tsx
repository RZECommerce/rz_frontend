import { Button } from "@/components/ui/button";
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
    type ChartConfig
} from "@/components/ui/chart";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { payrollStatisticsService } from "@/services/payroll.service";
import { MoreHoriz as MoreHorizontalIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import type { TooltipProps } from "recharts";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  value: {
    label: "Expense",
    color: "#7C4DFF",
  },
} satisfies ChartConfig;

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-background gap-1.5 rounded-lg px-2.5 py-1.5 text-xs shadow-xl grid min-w-[8rem] items-start">
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

export function PayrollExpenseOverview() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["payrollStatistics", "monthly"],
    queryFn: () => payrollStatisticsService.getMonthly(6),
    staleTime: 5 * 60 * 1000,
  });

  const chartData = statsData?.expense.chart_data || [];
  const totalExpense = statsData?.expense.total || 0;
  const changePercent = statsData?.expense.change_percent || 0;
  const isPositive = changePercent >= 0;

  const formattedValue = `₱${totalExpense.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

  if (isLoading) {
    return (
      <Card className="h-full w-full min-h-0">
        <CardHeader>
          <CardTitle className="text-base">Payroll Expense Overview</CardTitle>
          <CardDescription className="text-xs">Loading...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-pulse bg-muted h-32 w-full rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full w-full min-h-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Payroll Expense Overview</CardTitle>
            <CardDescription className="text-xs">Last 6 months expense summary</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontalIcon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0">
          <div className="mb-4">
            <p className="text-xl font-semibold mb-1.5">{formattedValue}</p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <svg
                  className="size-5"
                  style={{ color: "var(--icon-green)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              ) : (
                <svg
                  className="size-5"
                  style={{ color: "var(--icon-red)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              )}
              <span
                className="text-xs font-medium"
                style={{ color: isPositive ? "var(--icon-green)" : "var(--icon-red)" }}
              >
                {Math.abs(changePercent)}% Last 30 Days
              </span>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="w-full flex-1 min-h-0 mt-4">
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
              <defs>
                <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="value"
                type="natural"
                fill="url(#fillValue)"
                fillOpacity={0.4}
                stroke="var(--color-value)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
      </CardContent>
    </Card>
  );
}

