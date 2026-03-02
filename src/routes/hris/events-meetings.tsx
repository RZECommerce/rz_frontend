import { EventsTab } from "@/components/hris/events-meetings/events-tab";
import { HolidaysTableTab } from "@/components/hris/events-meetings/holidays-table-tab";
import { MeetingsTab } from "@/components/hris/events-meetings/meetings-tab";
import { UnifiedCalendarTab } from "@/components/hris/events-meetings/unified-calendar-tab";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import {
    CalendarMonth as Calendar01Icon,
    Event as Calendar02Icon,
    GridView as GridIcon,
    Group as UserGroupIcon,
} from "@mui/icons-material";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/hris/events-meetings")({
  beforeLoad: requireAuth(),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || "holidays",
    };
  },
  component: EventsMeetingsPage,
});

function EventsMeetingsPage() {
  const navigate = useNavigate();
  const { tab } = useSearch({ from: "/hris/events-meetings" });
  const [activeTab, setActiveTab] = useState(tab || "holidays");

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate({
      to: "/hris/events-meetings",
      search: { tab: value },
      replace: true,
    });
  };

  return (
    <DashboardLayout>
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
      >
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Events & Meetings</h1>
            <p className="text-muted-foreground">
              Manage company events, team meetings, and holidays
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="holidays" className="flex items-center gap-2">
              <Calendar02Icon className="size-5" />
              <span>Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="holidays-table" className="flex items-center gap-2">
              <GridIcon className="size-5" />
              <span>Holiday Table</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar01Icon className="size-5" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="meetings" className="flex items-center gap-2">
              <UserGroupIcon className="size-5" />
              <span>Meetings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="holidays" className="mt-6">
            <UnifiedCalendarTab />
          </TabsContent>

          <TabsContent value="holidays-table" className="mt-6">
            <HolidaysTableTab />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventsTab />
          </TabsContent>

          <TabsContent value="meetings" className="mt-6">
            <MeetingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
