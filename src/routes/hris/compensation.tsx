import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import {
  AccountBalance as BandsIcon,
  TrendingUp as AdjustmentsIcon,
} from "@mui/icons-material";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";

const BandsTab = lazy(() => import("@/components/hris/compensation/bands-tab").then(m => ({ default: m.BandsTab })));
const AdjustmentsTab = lazy(() => import("@/components/hris/compensation/adjustments-tab").then(m => ({ default: m.AdjustmentsTab })));

export const Route = createFileRoute("/hris/compensation")({
  beforeLoad: requireAuth(),
  component: CompensationPage,
});

function CompensationPage() {
  const [activeTab, setActiveTab] = useState("bands");

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
            <h1 className="text-2xl font-bold">Compensation</h1>
            <p className="text-muted-foreground">Manage compensation bands and salary adjustments</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bands" className="flex items-center gap-2">
              <BandsIcon className="size-5" />
              <span className="hidden sm:inline">Compensation Bands</span>
            </TabsTrigger>
            <TabsTrigger value="adjustments" className="flex items-center gap-2">
              <AdjustmentsIcon className="size-5" />
              <span className="hidden sm:inline">Adjustments</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bands" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <BandsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="adjustments" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <AdjustmentsTab />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
