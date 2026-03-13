import { CreatePayrollRunForm } from "@/components/hris/payroll/create-payroll-run-form";
import { DeductionsTab } from "@/components/hris/payroll/deductions-tab";
import { PayrollDateFilter } from "@/components/hris/payroll/payroll-date-filter";
import { PayrollDeductionsTaxes } from "@/components/hris/payroll/payroll-deductions-taxes";
import { PayrollExpenseOverview } from "@/components/hris/payroll/payroll-expense-overview";
import { PayrollHeader } from "@/components/hris/payroll/payroll-header";
import { PayrollPeriodsTab } from "@/components/hris/payroll/payroll-periods-tab";
import { PayrollRunsTab } from "@/components/hris/payroll/payroll-runs-tab";
import { SalaryComponentsTab } from "@/components/hris/payroll/salary-components-tab";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import { payrollRunService } from "@/services/payroll.service";
import {
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
  RemoveCircleOutline as DeductionIcon,
  PlayArrow as RunIcon,
} from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import * as React from "react";
import { useEffect, useState } from "react";

type DateRange = "30days" | "3months" | "1year";

export const Route = createFileRoute("/hris/payroll/")({
  beforeLoad: requireAuth(),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || "runs",
    };
  },
  component: PayrollPage,
});

function PayrollPage() {
  const navigate = useNavigate();
  const { tab } = useSearch({ from: "/hris/payroll/" });
  const [activeTab, setActiveTab] = useState(tab || "runs");
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRange>("30days");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate({
      to: "/hris/payroll",
      search: (prev) => ({ ...prev, tab: value }),
      replace: true,
    });
  };


  const createPayrollRun = useMutation({
    mutationFn: payrollRunService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrollRuns"] });
      setIsCreateDialogOpen(false);
    },
    onError: (error: unknown) => {
      console.error("Error creating payroll run:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to create payroll run: ${message}`);
    },
  });

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = (data: {
    payroll_period_id: string;
    notes?: string | null;
  }) => {
    createPayrollRun.mutate(data);
  };

  return (
    <DashboardLayout>
      <PayrollHeader />
      <main
        className={cn(
          "w-full flex-1 overflow-auto font-sans",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
        style={{ scrollbarGutter: "stable" }}
      >
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full [&_[data-slot=button][data-variant=outline]]:border-primary/20 [&_[data-slot=button][data-variant=outline]]:hover:bg-primary/5 [&_[data-slot=button][data-variant=ghost]]:hover:bg-primary/5"
        >
          <TabsList className="grid min-h-11 w-full grid-cols-4 items-stretch rounded-xl border border-border bg-muted/30 p-1.5 [&>button_svg]:text-primary">
            <TabsTrigger value="runs" className="flex h-full min-h-8 items-center gap-2">
              <RunIcon className="size-5" />
              <span>Payroll Runs</span>
            </TabsTrigger>
            <TabsTrigger value="periods" className="flex h-full min-h-8 items-center gap-2">
              <CalendarIcon className="size-5" />
              <span>Periods</span>
            </TabsTrigger>
            <TabsTrigger value="salary-components" className="flex h-full min-h-8 items-center gap-2">
              <MoneyIcon className="size-5" />
              <span>Salary Components</span>
            </TabsTrigger>
            <TabsTrigger value="deductions" className="flex h-full min-h-8 items-center gap-2">
              <DeductionIcon className="size-5" />
              <span>Deductions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="runs" className="mt-6 scroll-gutter-stable">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Payroll Runs</h2>
                  <p className="text-sm text-muted-foreground">Process and manage payroll runs</p>
                </div>
                <Button
                  onClick={handleCreate}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <RunIcon className="size-5" />
                  New Payroll Run
                </Button>
              </div>

              <PayrollDateFilter value={dateRange} onChange={setDateRange} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[400px]">
                <PayrollExpenseOverview />
                <PayrollDeductionsTaxes />
              </div>

              <PayrollRunsTab />
            </div>
          </TabsContent>

          <TabsContent value="periods" className="scroll-gutter-stable">
            <PayrollPeriodsTab />
          </TabsContent>

          <TabsContent value="salary-components" className="scroll-gutter-stable">
            <SalaryComponentsTab />
          </TabsContent>

          <TabsContent value="deductions" className="scroll-gutter-stable">
            <DeductionsTab />
          </TabsContent>
        </Tabs>
      </main>

      <CreatePayrollRunForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleSubmit}
        isSubmitting={createPayrollRun.isPending}
      />
    </DashboardLayout>
  );
}
