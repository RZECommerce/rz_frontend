import { LeaveTypesDialog } from "@/components/hris/leaves/leave-types-dialog";
import { LeavesStats } from "@/components/hris/leaves/leaves-stats";
import { LeavesTable } from "@/components/hris/leaves/leaves-table";
import { LeaveBlackoutPeriodsTable } from "@/components/hris/leaves/leave-blackout-periods-table";
import { LeaveEncashmentsTab } from "@/components/hris/leaves/leave-encashments-tab";
import { LeaveExpiryRulesTab } from "@/components/hris/leaves/leave-expiry-rules-tab";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useHasPermission } from "@/hooks/use-permissions";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import { leaveRequestService } from "@/services/leave.service";
import type { LeaveRequest, LeaveRequestFilters } from "@/types/leave";
import { Settings as Settings01Icon } from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/hris/leaves")({
  beforeLoad: requireAuth(),
  component: LeavesPage,
});

function LeavesPage() {
  const queryClient = useQueryClient();
  const canManageLeaveTypes = useHasPermission("leave-types.manage");
  const [filters, setFilters] = useState<LeaveRequestFilters>({
    per_page: 50,
  });
  const [leaveTypesDialogOpen, setLeaveTypesDialogOpen] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: "",
    message: "",
  });

  const deleteLeaveRequest = useMutation({
    mutationFn: leaveRequestService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    },
    onError: (error: unknown) => {
      console.error("Error deleting leave request:", error);
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      setErrorDialog({
        open: true,
        title: "Delete Failed",
        message: `Failed to delete leave request: ${message}`,
      });
    },
  });

  const approveLeaveRequest = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { remarks?: string } }) =>
      leaveRequestService.approve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    },
    onError: (error: unknown) => {
      console.error("Error approving leave request:", error);
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      setErrorDialog({
        open: true,
        title: "Approval Failed",
        message: `Failed to approve leave request: ${message}`,
      });
    },
  });

  const rejectLeaveRequest = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { rejection_reason: string; remarks?: string } }) =>
      leaveRequestService.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    },
    onError: (error: unknown) => {
      console.error("Error rejecting leave request:", error);
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      setErrorDialog({
        open: true,
        title: "Rejection Failed",
        message: `Failed to reject leave request: ${message}`,
      });
    },
  });

  const handleDelete = (id: string) => {
    deleteLeaveRequest.mutate(id);
  };

  const handleApprove = (id: string, remarks?: string) => {
    approveLeaveRequest.mutate({ id, data: { remarks } });
  };

  const handleReject = (id: string, rejectionReason: string, remarks?: string) => {
    rejectLeaveRequest.mutate({ id, data: { rejection_reason: rejectionReason, remarks } });
  };

  const handleExport = async () => {
    try {
      const allData = await leaveRequestService.getAll({
        ...filters,
        per_page: 9999,
        page: 1,
      });

      const leaveRequests = Array.isArray(allData?.data) ? allData.data : [];

      const headers = [
        "Code",
        "Employee",
        "Employee Code",
        "Department",
        "Position",
        "Leave Type",
        "Start Date",
        "End Date",
        "Total Days",
        "Status",
        "Reason",
        "Remarks",
        "Approved By",
        "Approved At",
        "Rejection Reason",
        "Created At",
      ];

      const escapeCSV = (value: string | number | null | undefined): string => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const formatDate = (dateString: string | null): string => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US");
      };

      const formatDateTime = (dateString: string | null): string => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleString("en-US");
      };

      const rows: string[][] = leaveRequests.map((lr: LeaveRequest) => [
        escapeCSV(lr.leave_request_code),
        escapeCSV(lr.employee?.full_name),
        escapeCSV(lr.employee?.employee_code),
        escapeCSV(lr.employee?.department?.name),
        escapeCSV(lr.employee?.position?.name),
        escapeCSV(lr.leave_type?.name),
        escapeCSV(formatDate(lr.start_date)),
        escapeCSV(formatDate(lr.end_date)),
        escapeCSV(lr.total_days),
        escapeCSV(lr.status),
        escapeCSV(lr.reason),
        escapeCSV(lr.remarks),
        escapeCSV(lr.approver?.name),
        escapeCSV(formatDateTime(lr.approved_at)),
        escapeCSV(lr.rejection_reason),
        escapeCSV(formatDateTime(lr.created_at)),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `leave-requests-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting leave requests:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      setErrorDialog({
        open: true,
        title: "Export Failed",
        message: `Failed to export leave requests: ${message}`,
      });
    }
  };

  return (
    <DashboardLayout>
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Leave Requests</h1>
            <p className="text-muted-foreground">
              Manage employee leave requests and approvals
            </p>
          </div>
          {canManageLeaveTypes && (
            <Button
              variant="outline"
              onClick={() => setLeaveTypesDialogOpen(true)}
              className="gap-2"
            >
              <Settings01Icon className="size-5" />
              Manage Leave Types
            </Button>
          )}
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">Leave Requests</TabsTrigger>
            <TabsTrigger value="blackout-periods">Blackout Periods</TabsTrigger>
            <TabsTrigger value="encashments">Encashments</TabsTrigger>
            <TabsTrigger value="expiry-rules">Expiry Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6 mt-6">
            <LeavesStats />
            <LeavesTable
              filters={filters}
              onFiltersChange={setFilters}
              onDelete={handleDelete}
              onApprove={handleApprove}
              onReject={handleReject}
              isDeleting={deleteLeaveRequest.isPending}
              isApproving={approveLeaveRequest.isPending}
              isRejecting={rejectLeaveRequest.isPending}
            />
          </TabsContent>

          <TabsContent value="blackout-periods" className="mt-6">
            <LeaveBlackoutPeriodsTable />
          </TabsContent>

          <TabsContent value="encashments" className="mt-6">
            <LeaveEncashmentsTab />
          </TabsContent>

          <TabsContent value="expiry-rules" className="mt-6">
            <LeaveExpiryRulesTab />
          </TabsContent>
        </Tabs>
      </main>

      <LeaveTypesDialog
        open={leaveTypesDialogOpen}
        onOpenChange={setLeaveTypesDialogOpen}
      />

      <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{errorDialog.title}</DialogTitle>
            <DialogDescription>{errorDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorDialog({ ...errorDialog, open: false })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
