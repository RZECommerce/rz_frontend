import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import {
  Flag as GoalsIcon,
  Speed as IndicatorsIcon,
  Assessment as AppraisalsIcon,
} from "@mui/icons-material";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";

const GoalsTab = lazy(() => import("@/components/hris/performance/goals-tab").then(m => ({ default: m.GoalsTab })));
const IndicatorsTab = lazy(() => import("@/components/hris/performance/indicators-tab").then(m => ({ default: m.IndicatorsTab })));
const AppraisalsTab = lazy(() => import("@/components/hris/performance/appraisals-tab").then(m => ({ default: m.AppraisalsTab })));

export const Route = createFileRoute("/hris/performance")({
  beforeLoad: requireAuth(),
  component: PerformancePage,
});

function PerformancePage() {
  const [activeTab, setActiveTab] = useState("goals");

  return (
    <DashboardLayout>
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Performance Management</h1>
            <p className="text-muted-foreground">Manage goals, indicators, and appraisals</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <GoalsIcon className="size-5" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="indicators" className="flex items-center gap-2">
              <IndicatorsIcon className="size-5" />
              <span className="hidden sm:inline">Indicators</span>
            </TabsTrigger>
            <TabsTrigger value="appraisals" className="flex items-center gap-2">
              <AppraisalsIcon className="size-5" />
              <span className="hidden sm:inline">Appraisals</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <GoalsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="indicators" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <IndicatorsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="appraisals" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <AppraisalsTab />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
