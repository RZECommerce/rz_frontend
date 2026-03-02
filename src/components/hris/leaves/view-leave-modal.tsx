
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { LeaveRequest } from "@/types/leave";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/lib/utils/status-badge";

interface ViewLeaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveRequest: LeaveRequest | null;
}

// Status colors are now handled by StatusBadge component

export function ViewLeaveModal({
  open,
  onOpenChange,
  leaveRequest,
}: ViewLeaveModalProps) {
  if (!leaveRequest) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge is now handled by StatusBadge component

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
          <DialogDescription>
            View complete information about this leave request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <div className="mt-1">
                <StatusBadge status={leaveRequest.status} />
              </div>
            </div>
            <div className="text-right">
              <Label className="text-sm text-muted-foreground">Request Code</Label>
              <p className="mt-1 text-sm font-medium">
                {leaveRequest.leave_request_code}
              </p>
            </div>
          </div>

          {/* Employee Information */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Employee</Label>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
              <Avatar className="size-5">
                <AvatarFallback className="text-xs font-semibold">
                  {leaveRequest.employee?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "N/A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{leaveRequest.employee?.full_name || "N/A"}</p>
                <p className="text-xs text-muted-foreground">
                  {leaveRequest.employee?.employee_code || "N/A"}
                </p>
                {leaveRequest.employee?.department && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {leaveRequest.employee.department.name}
                    {leaveRequest.employee.position && ` • ${leaveRequest.employee.position.name}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Leave Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Leave Type</Label>
              <p className="text-sm font-medium">
                {leaveRequest.leave_type?.name || "N/A"}
              </p>
              {leaveRequest.leave_type?.is_paid !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {leaveRequest.leave_type.is_paid ? "Paid Leave" : "Unpaid Leave"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Total Days</Label>
              <p className="text-sm font-medium">{leaveRequest.total_days} days</p>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Start Date</Label>
              <p className="text-sm font-medium">
                {formatDate(leaveRequest.start_date)}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">End Date</Label>
              <p className="text-sm font-medium">
                {formatDate(leaveRequest.end_date)}
              </p>
            </div>
          </div>

          {/* Reason */}
          {leaveRequest.reason && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Reason</Label>
              <p className="text-sm p-3 rounded-lg border bg-muted/50">
                {leaveRequest.reason}
              </p>
            </div>
          )}

          {/* Remarks */}
          {leaveRequest.remarks && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">HR Remarks</Label>
              <p className="text-sm p-3 rounded-lg border bg-muted/50">
                {leaveRequest.remarks}
              </p>
            </div>
          )}

          {/* Rejection Reason */}
          {leaveRequest.rejection_reason && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Rejection Reason</Label>
              <p className="text-sm p-3 rounded-lg border bg-destructive/10 text-destructive">
                {leaveRequest.rejection_reason}
              </p>
            </div>
          )}

          {/* Approval Information */}
          {leaveRequest.status === "approved" && (
            <div className="space-y-2 p-3 rounded-lg border bg-green-50 dark:bg-green-900/10">
              <Label className="text-sm text-muted-foreground">Approval Information</Label>
              <div className="space-y-1 text-sm">
                {leaveRequest.approver && (
                  <p>
                    <span className="text-muted-foreground">Approved by:</span>{" "}
                    <span className="font-medium">{leaveRequest.approver.name}</span>
                  </p>
                )}
                {leaveRequest.approved_at && (
                  <p>
                    <span className="text-muted-foreground">Approved at:</span>{" "}
                    <span className="font-medium">
                      {formatDateTime(leaveRequest.approved_at)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Created</Label>
              <p className="text-xs">
                {formatDateTime(leaveRequest.created_at)}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Last Updated</Label>
              <p className="text-xs">
                {formatDateTime(leaveRequest.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

