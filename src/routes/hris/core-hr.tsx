import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import {
  Error as AlertCircleIcon,
  SyncAlt as ArrowRight01Icon,
  TrendingUp as ArrowUp01Icon,
  Hub as CoreHrIcon,
  MonetizationOn as Coins01Icon,
  Delete as Delete01Icon,
  Description as File01Icon,
  Folder as Folder01Icon,
  Timeline as TimelineIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";

const PromotionsTab = lazy(() => import("@/components/hris/core-hr/tabs/promotions-tab").then(m => ({ default: m.PromotionsTab })));
const AwardsTab = lazy(() => import("@/components/hris/core-hr/tabs/awards-tab").then(m => ({ default: m.AwardsTab })));
const TravelsTab = lazy(() => import("@/components/hris/core-hr/tabs/travels-tab").then(m => ({ default: m.TravelsTab })));
const TransfersTab = lazy(() => import("@/components/hris/core-hr/tabs/transfers-tab").then(m => ({ default: m.TransfersTab })));
const ResignationsTab = lazy(() => import("@/components/hris/core-hr/tabs/resignations-tab").then(m => ({ default: m.ResignationsTab })));
const ComplaintsTab = lazy(() => import("@/components/hris/core-hr/tabs/complaints-tab").then(m => ({ default: m.ComplaintsTab })));
const WarningsTab = lazy(() => import("@/components/hris/core-hr/tabs/warnings-tab").then(m => ({ default: m.WarningsTab })));
const TerminationsTab = lazy(() => import("@/components/hris/core-hr/tabs/terminations-tab").then(m => ({ default: m.TerminationsTab })));
const LifecycleTab = lazy(() => import("@/components/hris/core-hr/tabs/lifecycle-tab").then(m => ({ default: m.LifecycleTab })));
const StatusDefinitionsTab = lazy(() => import("@/components/hris/core-hr/tabs/status-definitions-tab").then(m => ({ default: m.StatusDefinitionsTab })));

export const Route = createFileRoute("/hris/core-hr")({
  beforeLoad: requireAuth(),
  component: CoreHrPage,
});

function CoreHrPage() {
  const [activeTab, setActiveTab] = useState("promotions");

  return (
    <DashboardLayout>
      <main
        className={cn(
          "w-full flex-1 overflow-auto font-sans",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <CoreHrIcon className="size-6" />
              </div>
              <h1 className="text-2xl font-bold">Core HR</h1>
            </div>
            <p className="text-muted-foreground">Manage promotions, awards, travels, transfers, resignations, complaints, warnings, and terminations</p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full [&_[data-slot=button][data-variant=outline]]:border-primary/20 [&_[data-slot=button][data-variant=outline]]:hover:bg-primary/5 [&_[data-slot=button][data-variant=ghost]]:hover:bg-primary/5"
        >
          <TabsList className="grid min-h-11 w-full grid-cols-4 items-stretch rounded-xl border border-border bg-muted/30 p-1.5 lg:grid-cols-10 [&>button_svg]:text-primary">
            <TabsTrigger value="promotions" className="flex h-full min-h-8 min-w-0 items-center justify-center gap-2">
              <ArrowUp01Icon className="size-5" />
              <span className="hidden sm:inline">Promotion</span>
            </TabsTrigger>
            <TabsTrigger value="awards" className="flex h-full min-h-8 min-w-0 items-center justify-center gap-2">
              <Coins01Icon className="size-5" />
              <span className="hidden sm:inline">Award</span>
            </TabsTrigger>
            <TabsTrigger value="travels" className="flex h-full min-h-8 min-w-0 items-center justify-center gap-2">
              <Folder01Icon className="size-5" />
              <span className="hidden sm:inline">Travel</span>
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex h-full min-h-8 min-w-0 items-center justify-center gap-2">
              <ArrowRight01Icon className="size-5" />
              <span className="hidden sm:inline">Transfer</span>
            </TabsTrigger>
            <TabsTrigger value="resignations" className="flex h-full min-h-8 min-w-0 items-center justify-center gap-2">
              <File01Icon className="size-5" />
              <span className="hidden sm:inline">Resignations</span>
            </TabsTrigger>
            <TabsTrigger value="complaints" className="flex h-full min-h-8 min-w-0 items-center justify-center gap-2">
              <File01Icon className="size-5" />
              <span className="hidden sm:inline">Complaints</span>
            </TabsTrigger>
            <TabsTrigger value="warnings" className="flex h-full min-h-8 min-w-0 items-center justify-center gap-2">
              <AlertCircleIcon className="size-5" />
              <span className="hidden sm:inline">Warnings</span>
            </TabsTrigger>
            <TabsTrigger value="terminations" className="flex h-full min-h-8 min-w-0 items-center justify-center gap-2">
              <Delete01Icon className="size-5" />
              <span className="hidden sm:inline">Terminations</span>
            </TabsTrigger>
            <TabsTrigger value="lifecycle" className="flex h-full min-h-8 min-w-0 items-center justify-center gap-2">
              <TimelineIcon className="size-5" />
              <span className="hidden sm:inline">Lifecycle</span>
            </TabsTrigger>
            <TabsTrigger value="status-definitions" className="flex h-full min-h-8 min-w-0 items-center justify-center gap-2">
              <BadgeIcon className="size-5" />
              <span className="hidden sm:inline">Statuses</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="promotions" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <PromotionsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="awards" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <AwardsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="travels" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <TravelsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="transfers" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <TransfersTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="resignations" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <ResignationsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="complaints" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <ComplaintsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="warnings" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <WarningsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="terminations" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <TerminationsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="lifecycle" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <LifecycleTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="status-definitions" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <StatusDefinitionsTab />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
