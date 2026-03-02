import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveRequestService } from "@/services/leave.service";
import type { LeaveRequestFilters } from "@/types/leave";
import { LeavesStats } from "@/components/hris/leaves/leaves-stats";
import { LeavesTable } from "@/components/hris/leaves/leaves-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function LeavesTab() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<LeaveRequestFilters>({
    per_page: 50,
  });
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

  return (
    <div className="space-y-6">
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
    </div>
  );
}
