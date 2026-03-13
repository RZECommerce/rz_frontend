import { AlertBanner } from "./alert-banner";
import { StatsCards } from "./stats-cards";
import { PayrollChart } from "./payroll-chart";
import { ChartPieDonutText } from "./chart-pie-donut";
import { EmployeesTable } from "./employees-table";
import { useDashboardStore } from "@/stores/dashboard-store";
import { cn } from "@/lib/utils";

export function DashboardContent() {
  const showAlertBanner = useDashboardStore((state) => state.showAlertBanner);
  const showStatsCards = useDashboardStore((state) => state.showStatsCards);
  const showChart = useDashboardStore((state) => state.showChart);
  const showTable = useDashboardStore((state) => state.showTable);
  const layoutDensity = useDashboardStore((state) => state.layoutDensity);

  return (
    <main
      className={cn(
        "w-full flex-1 overflow-auto font-sans",
        layoutDensity === "compact" && "p-2 sm:p-4 space-y-4",
        layoutDensity === "default" && "p-4 sm:p-6 space-y-6 sm:space-y-8",
        layoutDensity === "comfortable" && "p-6 sm:p-8 space-y-8 sm:space-y-10"
      )}
    >
      {showAlertBanner && <AlertBanner />}
      {showStatsCards && <StatsCards />}
      {showChart && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          <div className="xl:col-span-2 w-full min-w-0">
            <PayrollChart />
          </div>
          <div className="w-full min-w-0">
            <ChartPieDonutText />
          </div>
        </div>
      )}

    </main>
  );
}
