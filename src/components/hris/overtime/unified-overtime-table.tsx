import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { overtimeRequestService } from "@/services/overtime-request.service";
import { overtimeService } from "@/services/overtime.service";
import type { OvertimeLog, OvertimeLogFilters } from "@/types/overtime";
import type { OvertimeRequest } from "@/types/overtime-request";
import {
  Cancel as Cancel01Icon,
  CheckCircle as CheckmarkCircle01Icon,
  Edit as Edit01Icon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";

interface UnifiedOvertimeTableProps {
  filters: OvertimeLogFilters;
  onFiltersChange: (filters: OvertimeLogFilters) => void;
}

// Extended interface for unified records
interface UnifiedOvertimeRecord extends OvertimeLog {
  source: "attendance" | "request";
  originalRequest?: OvertimeRequest;
}

export function UnifiedOvertimeTable({
  filters,
  onFiltersChange,
}: UnifiedOvertimeTableProps) {
  const [selectedRequest, setSelectedRequest] =
    useState<OvertimeRequest | null>(null);
  const [selectedRecord, setSelectedRecord] =
    useState<UnifiedOvertimeRecord | null>(null);
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [viewRecordDetailsDialogOpen, setViewRecordDetailsDialogOpen] =
    useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [approveRemarks, setApproveRemarks] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editReason, setEditReason] = useState("");

  const queryClient = useQueryClient();

  const {
    data: overtimeData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["overtime-unified", filters],
    queryFn: () => overtimeService.getAll(filters),
  });

  // Get pending requests for approval
  const { data: pendingRequests } = useQuery({
    queryKey: ["overtime-requests", "pending"],
    queryFn: () =>
      overtimeRequestService.getAll({
        status: "pending",
        per_page: 999,
        page: 1,
      }),
    enabled: true,
  });

  const approveMutation = useMutation({
    mutationFn: ({
      id,
      approved_hours,
      remarks,
    }: {
      id: string;
      approved_hours?: number | null;
      remarks?: string | null;
    }) =>
      overtimeRequestService.approve(id, {
        approved_hours: approved_hours || undefined,
        remarks: remarks || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtime-unified"] });
      queryClient.invalidateQueries({ queryKey: ["overtime-requests"] });
      setViewDetailsDialogOpen(false);
      setApproveDialogOpen(false);
      setApproveRemarks("");
      setSelectedRequest(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({
      id,
      rejectionReason,
      remarks,
    }: {
      id: string;
      rejectionReason: string;
      remarks?: string | null;
    }) =>
      overtimeRequestService.reject(id, {
        rejection_reason: rejectionReason,
        remarks: remarks || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtime-unified"] });
      queryClient.invalidateQueries({ queryKey: ["overtime-requests"] });
      setViewDetailsDialogOpen(false);
      setRejectDialogOpen(false);
      setRejectReason("");
      setRejectRemarks("");
      setSelectedRequest(null);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({
      id,
      hours,
      reason,
    }: {
      id: string;
      hours: number;
      reason: string;
    }) => {
      // For overtime requests, the action depends on the status
      if (
        selectedRecord?.source === "request" &&
        selectedRecord?.originalRequest
      ) {
        if (selectedRecord.status === "pending") {
          // For pending requests, only set the approved hours without changing status
          return overtimeRequestService.update(id.replace("req_", ""), {
            approved_hours: hours,
            remarks: reason,
          });
        } else if (selectedRecord.status === "approved") {
          // For approved requests, adjust the approved hours
          return overtimeRequestService.adjustHours(id.replace("req_", ""), {
            hours: hours,
            adjustment_reason: reason,
          });
        }
      }
      // For attendance records, we'd need to update the attendance record
      // This would typically involve a different endpoint or approach
      throw new Error("Editing attendance-based overtime is not supported");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtime-unified"] });
      queryClient.invalidateQueries({ queryKey: ["overtime-requests"] });
      setEditDialogOpen(false);
      setEditHours("");
      setEditReason("");
      setSelectedRecord(null);
    },
    onError: (error: any) => {
      console.error("Failed to edit overtime:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update overtime hours. Please try again.",
      );
    },
  });

  const handleApprove = async () => {
    if (selectedRequest) {
      await approveMutation.mutateAsync({
        id: selectedRequest.id,
        // Don't send approved_hours - let backend preserve existing value or use default
        remarks: approveRemarks || undefined,
      });
    }
  };

  const handleReject = async () => {
    if (selectedRequest && rejectReason.trim()) {
      await rejectMutation.mutateAsync({
        id: selectedRequest.id,
        rejectionReason: rejectReason.trim(),
        remarks: rejectRemarks || undefined,
      });
    }
  };

  const handleEdit = async () => {
    if (selectedRecord && editHours.trim() && editReason.trim()) {
      const hours = parseFloat(editHours);
      if (!isNaN(hours) && hours >= 0) {
        // For approved requests, ensure approved hours don't exceed rendered hours
        if (
          selectedRecord.status === "approved" &&
          selectedRecord.overtime_hours !== undefined
        ) {
          if (hours > selectedRecord.overtime_hours) {
            alert(
              `Approved hours cannot exceed rendered hours (${selectedRecord.overtime_hours}).`,
            );
            return;
          }
        }

        // For pending requests, ensure approved hours don't exceed requested hours
        if (
          selectedRecord.status === "pending" &&
          selectedRecord.originalRequest?.hours !== undefined
        ) {
          if (hours > selectedRecord.originalRequest.hours) {
            alert(
              `Approved hours cannot exceed requested hours (${selectedRecord.originalRequest.hours}).`,
            );
            return;
          }
        }

        // For request-based overtime, use the original request ID
        if (
          selectedRecord.source === "request" &&
          selectedRecord.originalRequest
        ) {
          await editMutation.mutateAsync({
            id: selectedRecord.originalRequest.id,
            hours: hours,
            reason: editReason,
          });
        } else {
          // For attendance-based overtime, we would need a different approach
          throw new Error("Editing attendance-based overtime is not supported");
        }
      }
    }
  };

  const openEditDialog = (record: UnifiedOvertimeRecord) => {
    setSelectedRecord(record);
    // For request-based overtime, set the initial hours based on status
    if (record.source === "request" && record.originalRequest) {
      let currentHours;
      if (record.status === "pending") {
        // For pending requests, use the requested hours
        currentHours = record.originalRequest.hours;
      } else if (record.status === "approved") {
        // For approved requests, use the approved hours
        currentHours =
          record.originalRequest.approved_hours ?? record.originalRequest.hours;
      } else {
        // For other statuses, use the original hours
        currentHours = record.originalRequest.hours;
      }
      setEditHours(currentHours.toString());
    } else {
      // For attendance-based overtime, we shouldn't be able to edit
      return;
    }
    setEditReason("");
    setEditDialogOpen(true);
  };

  const getStatusBadge = (status: string, source: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      cancelled: "outline",
    };

    return (
      <div className="flex items-center gap-2">
        <Badge variant={variants[status] || "secondary"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {source}
        </Badge>
      </div>
    );
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "-";
    try {
      const [hours, minutes] = timeString.split(":");
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  // Combine overtime logs with pending requests
  const allRecords: UnifiedOvertimeRecord[] = [
    // Add overtime records - preserve source if it's a request, otherwise mark as attendance
    ...(overtimeData?.data || []).map((log: OvertimeLog) => ({
      ...log,
      // If log has originalRequest, it's from a request; otherwise it's from attendance
      source: (log.originalRequest ? "request" : "attendance") as
        | "request"
        | "attendance",
    })),
    // Add ONLY pending requests (not approved ones since they're already in overtimeData)
    ...(pendingRequests?.data || []).map((request: OvertimeRequest) => ({
      id: `req_${request.id}`,
      attendance_id: null,
      attendance: undefined,
      employee_id: request.employee_id,
      employee: request.employee,
      date: request.date,
      time_in: request.start_time,
      time_out: request.end_time,
      total_hours: request.hours,
      regular_hours: 0,
      overtime_hours: request.hours,
      status: request.status as "pending" | "approved" | "rejected",
      approved_by: request.approved_by,
      approved_at: request.approved_at,
      rejection_reason: request.rejection_reason,
      notes: `Request: ${request.overtime_request_code}`,
      created_at: request.created_at,
      updated_at: request.updated_at,
      source: "request" as const,
      originalRequest: request,
    })),
  ];

  // Remove duplicates by checking if a request already exists as approved overtime
  const uniqueRecords = allRecords.filter((record, index, self) => {
    if (record.source === "attendance") {
      // Check if there's a matching request for the same employee and date
      const hasMatchingRequest = self.some(
        (other) =>
          other.source === "request" &&
          other.employee_id === record.employee_id &&
          other.date === record.date,
      );
      return !hasMatchingRequest;
    }
    return true; // Keep all request records
  });

  // Sort by date descending
  uniqueRecords.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overtime Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overtime Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Failed to load overtime data. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-end">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={filters.search || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    search: e.target.value || undefined,
                    page: 1, // Reset to first page when searching
                  })
                }
                className="w-64 pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {uniqueRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No overtime records found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-center">
                      <div>Rendered</div>
                      <div className="text-xs font-normal text-muted-foreground">
                        (Actual)
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div>Approved</div>
                      <div className="text-xs font-normal text-muted-foreground">
                        (For Payment)
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uniqueRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {record.employee?.full_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {record.employee?.employee_code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {formatTime(record.time_in)} -{" "}
                        {formatTime(record.time_out)}
                      </TableCell>
                      <TableCell className="text-center">
                        {record.source === "request" && record.originalRequest
                          ? record.originalRequest.hours
                          : record.overtime_hours}
                      </TableCell>
                      <TableCell className="text-center">
                        {record.source === "request" &&
                        record.originalRequest ? (
                          // For overtime requests, ONLY show approved_hours if it exists, otherwise dash
                          typeof record.originalRequest.approved_hours ===
                          "number" ? (
                            <span className="font-medium text-green-600">
                              {record.originalRequest.approved_hours}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )
                        ) : record.source === "attendance" &&
                          record.status === "approved" ? (
                          // For attendance-based overtime, show the overtime hours
                          <span className="font-medium text-green-600">
                            {record.overtime_hours}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {(record.status === "approved" ||
                          record.status === "pending") && (
                          <Badge
                            variant={
                              record.status === "approved"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {record.status.charAt(0).toUpperCase() +
                              record.status.slice(1)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(record.source === "request" &&
                            record.status === "pending" &&
                            record.originalRequest) ||
                          (record.source === "request" &&
                            record.status === "approved" &&
                            record.originalRequest) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(record)}
                              className="h-8 w-8 p-0"
                              title={
                                record.status === "pending"
                                  ? "Edit Overtime Request"
                                  : "Edit Approved Hours"
                              }
                            >
                              <Edit01Icon className="size-5" />
                            </Button>
                          ) : null}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record);
                              if (record.originalRequest) {
                                setSelectedRequest(record.originalRequest);
                                setViewDetailsDialogOpen(true);
                              } else {
                                setViewRecordDetailsDialogOpen(true);
                              }
                            }}
                            className="h-8 w-8 p-0"
                            title="View Details"
                          >
                            <VisibilityIcon className="size-5" />
                          </Button>

                          {record.source === "request" &&
                            record.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequest(
                                      record.originalRequest || null,
                                    );
                                    setViewDetailsDialogOpen(false);
                                    setApproveDialogOpen(true);
                                  }}
                                  disabled={
                                    approveMutation.isPending ||
                                    rejectMutation.isPending
                                  }
                                  className="h-8 w-8 p-0"
                                  title="Approve"
                                >
                                  <CheckmarkCircle01Icon className="size-5 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequest(
                                      record.originalRequest || null,
                                    );
                                    setViewDetailsDialogOpen(false);
                                    setRejectDialogOpen(true);
                                  }}
                                  disabled={
                                    approveMutation.isPending ||
                                    rejectMutation.isPending
                                  }
                                  className="h-8 w-8 p-0"
                                  title="Reject"
                                >
                                  <Cancel01Icon className="size-5 text-red-600" />
                                </Button>
                              </>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog
        open={viewDetailsDialogOpen || approveDialogOpen || rejectDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null);
            setViewDetailsDialogOpen(false);
            setApproveDialogOpen(false);
            setRejectDialogOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approveDialogOpen
                ? "Approve Overtime Request"
                : rejectDialogOpen
                  ? "Reject Overtime Request"
                  : "Overtime Details"}
            </DialogTitle>
          </DialogHeader>

          {!approveDialogOpen && !rejectDialogOpen && selectedRequest && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Request Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label>Request Code</Label>
                    <p className="text-sm font-medium">
                      {selectedRequest.overtime_request_code}
                    </p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedRequest.status, "request")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Employee Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label>Employee Name</Label>
                    <p className="text-sm font-medium">
                      {selectedRequest.employee?.full_name}
                    </p>
                  </div>
                  <div>
                    <Label>Employee Code</Label>
                    <p className="text-sm font-medium">
                      {selectedRequest.employee?.employee_code}
                    </p>
                  </div>
                  {selectedRequest.employee?.department && (
                    <div>
                      <Label>Department</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedRequest.employee.department.name}
                      </p>
                    </div>
                  )}
                  {selectedRequest.employee?.position && (
                    <div>
                      <Label>Position</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedRequest.employee.position.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Time Details
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label>Date</Label>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedRequest.date), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <Label>Rendered Time</Label>
                    <p className="text-sm font-medium">
                      {formatTime(selectedRequest.start_time)} -{" "}
                      {formatTime(selectedRequest.end_time)}
                    </p>
                  </div>
                  <div>
                    <Label>Rendered Hours</Label>
                    <p className="text-sm font-medium">
                      {selectedRequest.hours} hours
                    </p>
                  </div>
                  {selectedRequest.approved_hours !== null && (
                    <div>
                      <Label>Approved Hours</Label>
                      <p className="text-sm font-medium text-green-600">
                        {selectedRequest.approved_hours} hours
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Request Details
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label>Reason for Overtime</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedRequest.reason || "No reason provided"}
                    </p>
                  </div>
                </div>
              </div>

              {(selectedRequest.status === "approved" ||
                selectedRequest.status === "rejected") && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    {selectedRequest.status === "approved"
                      ? "Approval"
                      : "Rejection"}{" "}
                    Details
                  </h4>
                  <div className="space-y-2">
                    {selectedRequest.approved_by && (
                      <div>
                        <Label>
                          {selectedRequest.status === "approved"
                            ? "Approved By"
                            : "Rejected By"}
                        </Label>
                        <p className="text-sm font-medium">
                          {selectedRequest.approved_by}
                        </p>
                      </div>
                    )}
                    {selectedRequest.approved_at && (
                      <div>
                        <Label>
                          {selectedRequest.status === "approved"
                            ? "Approval Time"
                            : "Rejection Time"}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(selectedRequest.approved_at),
                            "MMMM dd, yyyy 'at' hh:mm a",
                          )}
                        </p>
                      </div>
                    )}
                    {selectedRequest.remarks && (
                      <div>
                        <Label>Remarks</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedRequest.remarks}
                        </p>
                      </div>
                    )}
                    {selectedRequest.rejection_reason && (
                      <div>
                        <Label>Rejection Reason</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedRequest.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Timestamps
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label>Created At</Label>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(selectedRequest.created_at),
                        "MMM dd, yyyy 'at' hh:mm a",
                      )}
                    </p>
                  </div>
                  <div>
                    <Label>Updated At</Label>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(selectedRequest.updated_at),
                        "MMM dd, yyyy 'at' hh:mm a",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {approveDialogOpen && selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="approve-remarks">Remarks (Optional)</Label>
                <Textarea
                  id="approve-remarks"
                  placeholder="Add any remarks for this approval..."
                  value={approveRemarks}
                  onChange={(e) => setApproveRemarks(e.target.value || "")}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setApproveDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? "Approving..." : "Approve"}
                </Button>
              </div>
            </div>
          )}

          {rejectDialogOpen && selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reject-reason">Rejection Reason *</Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Provide a reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reject-remarks">
                  Additional Remarks (Optional)
                </Label>
                <Textarea
                  id="reject-remarks"
                  placeholder="Add any additional remarks..."
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value || "")}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRejectDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending || !rejectReason.trim()}
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Overtime Request Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditDialogOpen(false);
            setSelectedRecord(null);
            setEditHours("");
            setEditReason("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedRecord?.status === "pending"
                ? "Edit Overtime Request"
                : selectedRecord?.status === "approved"
                  ? "Edit Approved Hours"
                  : "Edit Overtime Request"}
            </DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div>
                  <Label>Employee</Label>
                  <p className="text-sm font-medium">
                    {selectedRecord.employee?.full_name} (
                    {selectedRecord.employee?.employee_code})
                  </p>
                </div>
                <div>
                  <Label>Date & Time</Label>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedRecord.date), "MMM dd, yyyy")} |{" "}
                    {formatTime(selectedRecord.time_in || "")} -{" "}
                    {formatTime(selectedRecord.time_out || "")}
                  </p>
                </div>
                <div>
                  <Label>Rendered Hours</Label>
                  <p className="text-sm font-medium">
                    {selectedRecord.overtime_hours} hours
                  </p>
                </div>
                <div>
                  {selectedRecord.status === "approved" ? (
                    <>
                      <Label>Current Approved Hours</Label>
                      <p className="text-sm font-medium text-green-600">
                        {selectedRecord.originalRequest?.approved_hours ??
                          selectedRecord.originalRequest?.hours}{" "}
                        hours
                      </p>
                    </>
                  ) : (
                    <>
                      <Label>Current Requested Hours</Label>
                      <p className="text-sm font-medium text-blue-600">
                        {selectedRecord.originalRequest?.hours} hours
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="edit-hours">
                    {selectedRecord.status === "pending"
                      ? "Set Approved Time *"
                      : "New Approved Hours *"}
                  </Label>
                  <Input
                    id="edit-hours"
                    type="number"
                    step="0.5"
                    min="0"
                    max={
                      selectedRecord?.status === "approved"
                        ? selectedRecord.overtime_hours
                        : selectedRecord?.originalRequest?.hours || 24
                    }
                    placeholder={
                      selectedRecord.status === "pending"
                        ? "Enter approved hours for when this request is approved"
                        : "Enter approved hours for payment"
                    }
                    value={editHours}
                    onChange={(e) => setEditHours(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedRecord.status === "pending"
                      ? `Enter the hours that will be approved when this request is approved (0 - ${selectedRecord?.originalRequest?.hours || 24} hours)`
                      : `Enter the hours to approve for payment (0 - ${selectedRecord?.overtime_hours} hours)`}
                  </p>
                </div>
                <div>
                  <Label htmlFor="edit-reason">
                    {selectedRecord.status === "pending"
                      ? "Approval Reason *"
                      : "Adjustment Reason *"}
                  </Label>
                  <Textarea
                    id="edit-reason"
                    placeholder={
                      selectedRecord.status === "pending"
                        ? "Explain why these hours should be approved..."
                        : "Explain why the approved hours are being adjusted..."
                    }
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required: Provide a reason for this{" "}
                    {selectedRecord.status === "pending"
                      ? "approval"
                      : "adjustment"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEdit}
                  disabled={
                    editMutation.isPending ||
                    !editHours.trim() ||
                    !editReason.trim() ||
                    parseFloat(editHours) < 0 ||
                    (selectedRecord?.status === "approved" &&
                      parseFloat(editHours) >
                        (selectedRecord?.overtime_hours || 0)) ||
                    (selectedRecord?.status === "pending" &&
                      parseFloat(editHours) >
                        (selectedRecord?.originalRequest?.hours || 0))
                  }
                >
                  {editMutation.isPending
                    ? selectedRecord?.status === "pending"
                      ? "Setting..."
                      : "Adjusting..."
                    : selectedRecord?.status === "pending"
                      ? "Set Approved Time"
                      : "Adjust Hours"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Attendance Record Details Dialog */}
      <Dialog
        open={viewRecordDetailsDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setViewRecordDetailsDialogOpen(false);
            setSelectedRecord(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Overtime Details</DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Employee Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label>Employee Name</Label>
                    <p className="text-sm font-medium">
                      {selectedRecord.employee?.full_name}
                    </p>
                  </div>
                  <div>
                    <Label>Employee Code</Label>
                    <p className="text-sm font-medium">
                      {selectedRecord.employee?.employee_code}
                    </p>
                  </div>
                  {selectedRecord.employee?.department && (
                    <div>
                      <Label>Department</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedRecord.employee.department.name}
                      </p>
                    </div>
                  )}
                  {selectedRecord.employee?.position && (
                    <div>
                      <Label>Position</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedRecord.employee.position.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Time Details
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label>Date</Label>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedRecord.date), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <Label>Time In</Label>
                    <p className="text-sm font-medium">
                      {formatTime(selectedRecord.time_in || "")}
                    </p>
                  </div>
                  <div>
                    <Label>Time Out</Label>
                    <p className="text-sm font-medium">
                      {formatTime(selectedRecord.time_out || "")}
                    </p>
                  </div>
                  <div>
                    <Label>Total Hours</Label>
                    <p className="text-sm font-medium">
                      {selectedRecord.total_hours} hours
                    </p>
                  </div>
                  <div>
                    <Label>Regular Hours</Label>
                    <p className="text-sm font-medium">
                      {selectedRecord.regular_hours} hours
                    </p>
                  </div>
                  <div>
                    <Label>Overtime Hours</Label>
                    <p className="text-sm font-medium text-green-600">
                      {selectedRecord.overtime_hours} hours
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Status
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(
                        selectedRecord.status,
                        selectedRecord.source,
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Source</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedRecord.source === "attendance"
                        ? "Attendance Record"
                        : "Overtime Request"}
                    </p>
                  </div>
                </div>
              </div>

              {selectedRecord.notes && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Notes
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {selectedRecord.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(selectedRecord.approved_by || selectedRecord.approved_at) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Approval Details
                  </h4>
                  <div className="space-y-2">
                    {selectedRecord.approved_by && (
                      <div>
                        <Label>Approved By</Label>
                        <p className="text-sm font-medium">
                          {selectedRecord.approved_by}
                        </p>
                      </div>
                    )}
                    {selectedRecord.approved_at && (
                      <div>
                        <Label>Approval Time</Label>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(selectedRecord.approved_at),
                            "MMMM dd, yyyy 'at' hh:mm a",
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Timestamps
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label>Created At</Label>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(selectedRecord.created_at),
                        "MMM dd, yyyy 'at' hh:mm a",
                      )}
                    </p>
                  </div>
                  <div>
                    <Label>Updated At</Label>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(selectedRecord.updated_at),
                        "MMM dd, yyyy 'at' hh:mm a",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
