import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import {
  Gavel as CasesIcon,
} from "@mui/icons-material";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";

const CasesTab = lazy(() => import("@/components/hris/disciplinary/cases-tab").then(m => ({ default: m.CasesTab })));

export const Route = createFileRoute("/hris/disciplinary")({
  beforeLoad: requireAuth(),
  component: DisciplinaryPage,
});

function DisciplinaryPage() {
  const [activeTab, setActiveTab] = useState("cases");

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
            <h1 className="text-2xl font-bold">Disciplinary Management</h1>
            <p className="text-muted-foreground">Manage disciplinary cases, NTE issuance, and sanctions</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="cases" className="flex items-center gap-2">
              <CasesIcon className="size-5" />
              <span className="hidden sm:inline">Disciplinary Cases</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="mt-6">
            <Suspense fallback={<div className="h-24 flex items-center justify-center">Loading...</div>}>
              <CasesTab />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
