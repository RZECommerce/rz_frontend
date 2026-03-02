
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RejectLeaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (rejectionReason: string, remarks?: string) => void;
  isSubmitting?: boolean;
  employeeName?: string;
}

export function RejectLeaveModal({
  open,
  onOpenChange,
  onReject,
  isSubmitting = false,
  employeeName,
}: RejectLeaveModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleSubmit = () => {
    if (!rejectionReason.trim()) {
      return;
    }
    onReject(rejectionReason.trim(), remarks.trim() || undefined);
    setRejectionReason("");
    setRemarks("");
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRejectionReason("");
      setRemarks("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Leave Request</DialogTitle>
          <DialogDescription>
            {employeeName
              ? `Are you sure you want to reject the leave request for ${employeeName}?`
              : "Are you sure you want to reject this leave request?"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">
              Rejection Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter the reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              placeholder="Add any additional remarks or notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !rejectionReason.trim()}
            variant="destructive"
          >
            {isSubmitting ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

