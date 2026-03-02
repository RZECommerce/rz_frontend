
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

interface ApproveLeaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (remarks?: string) => void;
  isSubmitting?: boolean;
  employeeName?: string;
}

export function ApproveLeaveModal({
  open,
  onOpenChange,
  onApprove,
  isSubmitting = false,
  employeeName,
}: ApproveLeaveModalProps) {
  const [remarks, setRemarks] = useState("");

  const handleSubmit = () => {
    onApprove(remarks.trim() || undefined);
    setRemarks("");
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRemarks("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Leave Request</DialogTitle>
          <DialogDescription>
            {employeeName
              ? `Are you sure you want to approve the leave request for ${employeeName}?`
              : "Are you sure you want to approve this leave request?"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              placeholder="Add any remarks or notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

