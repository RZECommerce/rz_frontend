import { TrainersTab } from "@/components/hris/training/trainers-tab";
import { TrainingListTab } from "@/components/hris/training/training-list-tab";
import { TrainingTypeTab } from "@/components/hris/training/training-type-tab";
import { SkillsTab } from "@/components/hris/training/skills-tab";
import { CertificationsTab } from "@/components/hris/training/certifications-tab";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import {
    Folder as Folder01Icon,
    Settings as Settings01Icon,
    Group as UserGroupIcon,
    Psychology as SkillsIcon,
    CardMembership as CertIcon,
    School as TrainingIcon,
} from "@mui/icons-material";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/hris/training")({
  beforeLoad: requireAuth(),
  component: TrainingPage,
});

function TrainingPage() {
  const [activeTab, setActiveTab] = useState("training-list");
  const mainRef = useRef<HTMLElement>(null);
  const SCROLL_POSITION_KEY = "training_page_scroll";

  // Save scroll position when tab changes
  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      const scrollKey = `${SCROLL_POSITION_KEY}_${activeTab}`;
      sessionStorage.setItem(scrollKey, mainElement.scrollTop.toString());
    };

    // Restore scroll position for current tab
    const scrollKey = `${SCROLL_POSITION_KEY}_${activeTab}`;
    const savedScrollPosition = sessionStorage.getItem(scrollKey);
    
    // Use a small delay to ensure content is rendered
    const restoreScroll = () => {
      if (savedScrollPosition && mainElement) {
        mainElement.scrollTop = parseInt(savedScrollPosition, 10);
      } else if (mainElement) {
        mainElement.scrollTop = 0;
      }
    };

    // Try immediately
    requestAnimationFrame(restoreScroll);
    
    // Also try after a short delay for any async content
    const timeoutId = setTimeout(restoreScroll, 50);

    mainElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      mainElement.removeEventListener("scroll", handleScroll);
    };
  }, [activeTab]);

  return (
    <DashboardLayout>
      <main
        ref={mainRef}
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
                <TrainingIcon className="size-6" />
              </div>
              <h1 className="text-2xl font-bold">Training</h1>
            </div>
            <p className="text-muted-foreground">
              Manage training programs, types, and trainers
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid min-h-11 w-full grid-cols-5 items-stretch rounded-xl border border-border bg-muted/30 p-1.5 [&>button_svg]:text-primary">
            <TabsTrigger value="training-list" className="flex h-full min-h-8 items-center gap-2">
              <Folder01Icon className="size-5" />
              <span className="hidden sm:inline">Training List</span>
            </TabsTrigger>
            <TabsTrigger value="training-type" className="flex h-full min-h-8 items-center gap-2">
              <Settings01Icon className="size-5" />
              <span className="hidden sm:inline">Training Type</span>
            </TabsTrigger>
            <TabsTrigger value="trainers" className="flex h-full min-h-8 items-center gap-2">
              <UserGroupIcon className="size-5" />
              <span className="hidden sm:inline">Trainers</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex h-full min-h-8 items-center gap-2">
              <SkillsIcon className="size-5" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex h-full min-h-8 items-center gap-2">
              <CertIcon className="size-5" />
              <span className="hidden sm:inline">Certifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="training-list" className="mt-6">
            <TrainingListTab />
          </TabsContent>

          <TabsContent value="training-type" className="mt-6">
            <TrainingTypeTab />
          </TabsContent>

          <TabsContent value="trainers" className="mt-6">
            <TrainersTab />
          </TabsContent>

          <TabsContent value="skills" className="mt-6">
            <SkillsTab />
          </TabsContent>

          <TabsContent value="certifications" className="mt-6">
            <CertificationsTab />
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
