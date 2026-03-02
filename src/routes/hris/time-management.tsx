import { AttendanceTab } from "@/components/hris/time-management/attendance-tab";
import { HolidaysTab } from "@/components/hris/time-management/holidays-tab";
import { LeavesTab } from "@/components/hris/time-management/leaves-tab";
import { OvertimeTab } from "@/components/hris/time-management/overtime-tab";
import { TimesheetsTab } from "@/components/hris/time-management/timesheets-tab";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import {
    CalendarMonth as Calendar01Icon,
    AccessTime as Clock01Icon,
    Description as File01Icon,
    Update as Time01Icon,
} from "@mui/icons-material";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/hris/time-management")({
  beforeLoad: requireAuth(),
  component: TimeManagementPage,
});

function TimeManagementPage() {
  const [activeTab, setActiveTab] = useState("attendance");

  return (
    <DashboardLayout>
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Calendar01Icon className="size-5" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="leaves" className="flex items-center gap-2">
              <Clock01Icon className="size-5" />
              <span className="hidden sm:inline">Leaves</span>
            </TabsTrigger>
            <TabsTrigger value="holidays" className="flex items-center gap-2">
              <Calendar01Icon className="size-5" />
              <span className="hidden sm:inline">Holidays</span>
            </TabsTrigger>
            <TabsTrigger value="overtime" className="flex items-center gap-2">
              <Time01Icon className="size-5" />
              <span className="hidden sm:inline">Overtime</span>
            </TabsTrigger>
            <TabsTrigger value="timesheets" className="flex items-center gap-2">
              <File01Icon className="size-5" />
              <span className="hidden sm:inline">Timesheets</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="mt-6">
            <AttendanceTab />
          </TabsContent>

          <TabsContent value="leaves" className="mt-6">
            <LeavesTab />
          </TabsContent>

          <TabsContent value="holidays" className="mt-6">
            <HolidaysTab />
          </TabsContent>

          <TabsContent value="overtime" className="mt-6">
            <OvertimeTab />
          </TabsContent>

          <TabsContent value="timesheets" className="mt-6">
            <TimesheetsTab />
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
