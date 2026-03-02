import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface EmployeeDetailTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function EmployeeDetailTabs({
  activeTab,
  onTabChange,
  className,
}: EmployeeDetailTabsProps) {
  return (
    <div className={cn("border-b bg-background overflow-x-auto", className)}>
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="h-auto w-full justify-start rounded-none border-b-0 bg-transparent p-0 min-w-max">
          <TabsTrigger
            value="general"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="salary"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
          >
            Set Salary
          </TabsTrigger>
          <TabsTrigger
            value="payroll"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
          >
            Payroll & Payslips
          </TabsTrigger>
          <TabsTrigger
            value="leave"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
          >
            Leave Management
          </TabsTrigger>
          <TabsTrigger
            value="core-hr"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
          >
            Core HR
          </TabsTrigger>
          <TabsTrigger
            value="lifecycle"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
          >
            Lifecycle & HR Ops
          </TabsTrigger>
          <TabsTrigger
            value="project-task"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
          >
            Project & Task
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
