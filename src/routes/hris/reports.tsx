import { AccountReportTab } from "@/components/hris/reports/account-report-tab";
import { AttendanceReportTab } from "@/components/hris/reports/attendance-report-tab";

import { DailyAttendancesTab } from "@/components/hris/reports/daily-attendances-tab";
import { DateWiseAttendancesTab } from "@/components/hris/reports/date-wise-attendances-tab";
import { DepositReportTab } from "@/components/hris/reports/deposit-report-tab";
import { EmployeeReportTab } from "@/components/hris/reports/employee-report-tab";
import { ExpenseReportTab } from "@/components/hris/reports/expense-report-tab";
import { LeaveReportTab } from "@/components/hris/reports/leave-report-tab";
import { MonthlyAttendancesTab } from "@/components/hris/reports/monthly-attendances-tab";
import { PayrollReportTab } from "@/components/hris/reports/payroll-report-tab";
import { PensionReportTab } from "@/components/hris/reports/pension-report-tab";
import { ProjectReportTab } from "@/components/hris/reports/project-report-tab";
import { TaskReportTab } from "@/components/hris/reports/task-report-tab";
import { TrainingReportTab } from "@/components/hris/reports/training-report-tab";
import { TransactionReportTab } from "@/components/hris/reports/transaction-report-tab";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PesoIcon } from "@/components/shared/peso-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import {
  CalendarMonth as Calendar01Icon,
  AccessTime as Clock01Icon,
  Description as File01Icon,
  Folder as Folder01Icon,
  Receipt as Invoice01Icon,
  Settings as Settings01Icon,
  Group as UserGroupIcon,
} from "@mui/icons-material";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/hris/reports")({
  beforeLoad: requireAuth(),
  component: ReportsPage,
});

function ReportsPage() {
  const [activeTab, setActiveTab] = useState("daily-attendances");

  return (
    <DashboardLayout>
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-3 sm:space-y-4"
        )}
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground">
              Generate and analyze various HR and financial reports
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 bg-transparent !h-auto mb-1">
            <TabsTrigger
              value="daily-attendances"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Calendar01Icon className="size-5" />
              <span className="hidden sm:inline">Daily Attendances</span>
              <span className="sm:hidden">Daily</span>
            </TabsTrigger>
            <TabsTrigger
              value="date-wise-attendances"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Calendar01Icon className="size-5" />
              <span className="hidden sm:inline">Date Wise</span>
              <span className="sm:hidden">Date</span>
            </TabsTrigger>
            <TabsTrigger
              value="monthly-attendances"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Calendar01Icon className="size-5" />
              <span className="hidden sm:inline">Monthly Report</span>
              <span className="sm:hidden">Monthly</span>
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Calendar01Icon className="size-5" />
              <span className="hidden sm:inline">Attendance Log</span>
              <span className="sm:hidden">Logs</span>
            </TabsTrigger>
            <TabsTrigger
              value="leave"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Clock01Icon className="size-5" />
              Leaves
            </TabsTrigger>
            
            <TabsTrigger
              value="payroll"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Invoice01Icon className="size-5" />
              Payroll
            </TabsTrigger>
            <TabsTrigger
              value="expense"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Invoice01Icon className="size-5" />
              Expenses
            </TabsTrigger>
            <TabsTrigger
              value="deposit"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <PesoIcon className="size-5 text-lg" />
              Deposits
            </TabsTrigger>
            <TabsTrigger
              value="transaction"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <File01Icon className="size-5" />
              Transactions
            </TabsTrigger>
            <TabsTrigger
              value="pension"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <PesoIcon className="size-5 text-lg" />
              Pension
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Settings01Icon className="size-5" />
              Accounts
            </TabsTrigger>
            
            <TabsTrigger
              value="employee"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <UserGroupIcon className="size-5" />
              Employees
            </TabsTrigger>
            <TabsTrigger
              value="project"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Folder01Icon className="size-5" />
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="task"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <File01Icon className="size-5" />
              Tasks
            </TabsTrigger>
            <TabsTrigger
              value="training"
              className="flex items-center gap-2 bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Folder01Icon className="size-5" />
              Training
            </TabsTrigger>

          </TabsList>

          <TabsContent value="daily-attendances" className="mt-3">
            <DailyAttendancesTab />
          </TabsContent>

          <TabsContent value="date-wise-attendances" className="mt-3">
            <DateWiseAttendancesTab />
          </TabsContent>

          <TabsContent value="monthly-attendances" className="mt-3">
            <MonthlyAttendancesTab />
          </TabsContent>

          <TabsContent value="training" className="mt-3">
            <TrainingReportTab />
          </TabsContent>

          <TabsContent value="project" className="mt-3">
            <ProjectReportTab />
          </TabsContent>

          <TabsContent value="task" className="mt-3">
            <TaskReportTab />
          </TabsContent>

          <TabsContent value="employee" className="mt-3">
            <EmployeeReportTab />
          </TabsContent>

          <TabsContent value="account" className="mt-3">
            <AccountReportTab />
          </TabsContent>

          <TabsContent value="expense" className="mt-3">
            <ExpenseReportTab />
          </TabsContent>

          <TabsContent value="deposit" className="mt-3">
            <DepositReportTab />
          </TabsContent>

          <TabsContent value="transaction" className="mt-3">
            <TransactionReportTab />
          </TabsContent>

          <TabsContent value="pension" className="mt-3">
            <PensionReportTab />
          </TabsContent>

          <TabsContent value="payroll" className="mt-3">
            <PayrollReportTab />
          </TabsContent>

          <TabsContent value="attendance" className="mt-3">
            <AttendanceReportTab />
          </TabsContent>

          <TabsContent value="leave" className="mt-3">
            <LeaveReportTab />
          </TabsContent>


        </Tabs>
      </main>
    </DashboardLayout>
  );
}
