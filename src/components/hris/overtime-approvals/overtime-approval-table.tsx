import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { overtimeRequestService } from "@/services/overtime-request.service";
import type { OvertimeRequest, OvertimeRequestFilters } from "@/types/overtime-request";

interface OvertimeApprovalTableProps {
  filters: OvertimeRequestFilters;
  onFiltersChange: (filters: OvertimeRequestFilters) => void;
}

export function OvertimeApprovalTable({ filters, onFiltersChange }: OvertimeApprovalTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approvedHours, setApprovedHours] = useState("");
  const [approveRemarks, setApproveRemarks] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectRemarks, setRejectRemarks] = useState("");

  const queryClient = useQueryClient();

  const { data: requestsData, isLoading, error } = useQuery({
    queryKey: ["overtime-requests", filters],
    queryFn: () => overtimeRequestService.getAll(filters),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved_hours, remarks }: { id: string; approved_hours?: number | null; remarks?: string | null }) =>
      overtimeRequestService.approve(id, { approved_hours, remarks: remarks || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtime-requests"] });
      setApproveDialogOpen(false);
      setApprovedHours("");
      setApproveRemarks("");
      setSelectedRequest(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, rejection_reason, remarks }: { id: string; rejection_reason: string; remarks?: string | null }) =>
      overtimeRequestService.reject(id, { rejection_reason, remarks: remarks || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtime-requests"] });
      setRejectDialogOpen(false);
      setRejectReason("");
      setRejectRemarks("");
      setSelectedRequest(null);
    },
  });

  const handleApprove = () => {
    if (selectedRequest) {
      const hoursToApprove = approvedHours ? parseFloat(approvedHours) : null;
      approveMutation.mutate({
        id: selectedRequest.id,
        approved_hours: hoursToApprove,
        remarks: approveRemarks || null,
      });
    }
  };

  const handleReject = () => {
    if (selectedRequest && rejectReason.trim()) {
      rejectMutation.mutate({
        id: selectedRequest.id,
        rejection_reason: rejectReason.trim(),
        remarks: rejectRemarks || null,
      });
    }
  };

  const handleRowClick = (request: OvertimeRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleApproveClick = (request: OvertimeRequest) => {
    setSelectedRequest(request);
    setApprovedHours(request.hours.toString());
    setApproveDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      cancelled: "outline",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overtime Requests</CardTitle>
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
          <CardTitle>Overtime Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Failed to load overtime requests. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const requests = requestsData?.data || [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Overtime Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No overtime requests found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request Code</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-center">
                      <div>Rendered</div>
                      <div className="text-xs font-normal text-muted-foreground">(Actual)</div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div>Approved</div>
                      <div className="text-xs font-normal text-muted-foreground">(For Payment)</div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow
                      key={request.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(request)}
                    >
                      <TableCell className="font-medium">
                        {request.overtime_request_code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.employee?.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.employee?.employee_code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {formatTime(request.start_time)} - {formatTime(request.end_time)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-medium text-base">{request.hours}</div>
                        <div className="text-xs text-muted-foreground">hrs</div>
                      </TableCell>
                      <TableCell className="text-center">
                        {request.approved_hours !== null ? (
                          <div>
                            <div className="font-medium text-base text-green-600">{request.approved_hours}</div>
                            <div className="text-xs text-green-600">hrs</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {request.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveClick(request)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckIcon className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setRejectDialogOpen(true);
                                }}
                                disabled={rejectMutation.isPending}
                              >
                                <CloseIcon className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {request.status === "approved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveClick(request)}
                              disabled={approveMutation.isPending}
                            >
                              <EditIcon className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
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

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Overtime Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Request Code</Label>
                  <p className="text-sm font-medium">
                    {selectedRequest.overtime_request_code}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4 text-base">Employee Information</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Employee Name</Label>
                    <p className="text-sm font-medium">
                      {selectedRequest.employee?.full_name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Employee Code</Label>
                    <p className="text-sm font-medium">
                      {selectedRequest.employee?.employee_code}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Department</Label>
                    <p className="text-sm font-medium">
                      {selectedRequest.employee?.department?.name || "-"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Position</Label>
                    <p className="text-sm font-medium">
                      {selectedRequest.employee?.position?.name || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4 text-base">Time Details</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedRequest.date), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Rendered Time</Label>
                    <p className="text-sm font-medium">
                      {formatTime(selectedRequest.start_time)} - {formatTime(selectedRequest.end_time)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Rendered Hours</Label>
                    <p className="text-sm font-medium">{selectedRequest.hours} hours</p>
                  </div>
                  {selectedRequest.approved_hours !== null && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Approved Hours (For Payment)</Label>
                      <p className="text-sm font-medium text-green-600">{selectedRequest.approved_hours} hours</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Reason</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.reason || "No reason provided"}
                  </p>
                </div>
              </div>

              {selectedRequest.status !== "pending" && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4 text-base">Approval Details</h4>
                  <div className="grid grid-cols-2 gap-6">
                    {selectedRequest.approved_by && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Approved/Rejected By</Label>
                        <p className="text-sm font-medium">
                          {selectedRequest.approved_by}
                        </p>
                      </div>
                    )}
                    {selectedRequest.approved_at && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Approval Time</Label>
                        <p className="text-sm font-medium">
                          {format(new Date(selectedRequest.approved_at), "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedRequest.remarks && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-xs text-muted-foreground">Remarks</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedRequest.remarks}
                      </p>
                    </div>
                  )}
                  {selectedRequest.rejection_reason && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-xs text-muted-foreground">Rejection Reason</Label>
                      <p className="text-sm text-destructive">
                        {selectedRequest.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t pt-6">
                <div className="grid grid-cols-2 gap-6 text-xs text-muted-foreground">
                  <div className="space-y-1">
                    <Label className="text-xs">Created At</Label>
                    <p>{format(new Date(selectedRequest.created_at), "MMM dd, yyyy HH:mm")}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Updated At</Label>
                    <p>{format(new Date(selectedRequest.updated_at), "MMM dd, yyyy HH:mm")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve/Edit Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === "approved" ? "Edit Approved Hours" : "Approve Overtime Request"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedRequest && (
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Employee:</span>
                  <span className="font-medium">{selectedRequest.employee?.full_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{format(new Date(selectedRequest.date), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rendered Hours:</span>
                  <span className="font-medium">{selectedRequest.hours} hrs</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="approved-hours" className="text-sm font-medium">
                Approved Hours for Payment *
              </Label>
              <Input
                id="approved-hours"
                type="number"
                min="0"
                max="24"
                step="0.5"
                placeholder="Enter hours to approve..."
                value={approvedHours}
                onChange={(e) => setApprovedHours(e.target.value)}
                className="text-base"
                required
              />
              <p className="text-xs text-muted-foreground">
                This is the hours that will be paid. Default is the rendered hours.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="approve-remarks" className="text-sm font-medium">
                Remarks (Optional)
              </Label>
              <Textarea
                id="approve-remarks"
                placeholder="Add any remarks for this approval..."
                value={approveRemarks}
                onChange={(e) => setApproveRemarks(e.target.value)}
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                OT pay will be calculated based on the approved hours and policy multipliers.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setApproveDialogOpen(false);
                  setApprovedHours("");
                  setApproveRemarks("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={
                  approveMutation.isPending ||
                  !approvedHours ||
                  parseFloat(approvedHours) <= 0 ||
                  parseFloat(approvedHours) > 24
                }
              >
                {approveMutation.isPending ? "Saving..." : selectedRequest?.status === "approved" ? "Update" : "Approve"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Overtime Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="reject-reason" className="text-sm font-medium">
                Rejection Reason *
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="Provide a reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="reject-remarks" className="text-sm font-medium">
                Additional Remarks (Optional)
              </Label>
              <Textarea
                id="reject-remarks"
                placeholder="Add any additional remarks..."
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectReason("");
                  setRejectRemarks("");
                }}
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
        </DialogContent>
      </Dialog>
    </>
  );
}
