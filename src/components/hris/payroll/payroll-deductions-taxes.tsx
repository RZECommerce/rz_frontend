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
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  taxes: {
    label: "Taxes",
    color: "#E0C8FF",
  },
  deductions: {
    label: "Deductions",
    color: "#AC80F7",
  },
} satisfies ChartConfig;

export function PayrollDeductionsTaxes() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["payrollStatistics", "monthly"],
    queryFn: () => payrollStatisticsService.getMonthly(6),
    staleTime: 5 * 60 * 1000,
  });

  const chartData = statsData?.deductions.chart_data || [];
  const totalDeductions = statsData?.deductions.total || 0;
  const changePercent = statsData?.deductions.change_percent || 0;
  const isPositive = changePercent >= 0;

  const formattedValue = `₱${totalDeductions.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

  if (isLoading) {
    return (
      <Card className="h-full w-full min-h-0">
        <CardHeader>
          <CardTitle className="text-base">Deductions & Taxes</CardTitle>
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
            <CardTitle className="text-base">Deductions & Taxes</CardTitle>
            <CardDescription className="text-xs">Last 6 months summary</CardDescription>
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
            <BarChart 
              accessibilityLayer 
              data={chartData}
              margin={{
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
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
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="taxes"
                stackId="a"
                fill="var(--color-taxes)"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="deductions"
                stackId="a"
                fill="var(--color-deductions)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
      </CardContent>
    </Card>
  );
}

