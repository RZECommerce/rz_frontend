import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { overtimeRequestService } from "@/services/overtime-request.service";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function GenerateOTButton() {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (data: { start_date: string; end_date: string }) =>
      overtimeRequestService.generateFromAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtime-requests"] });
      // Keep dialog open to show results
    },
  });

  const handleGenerate = () => {
    if (startDate && endDate) {
      generateMutation.mutate({
        start_date: startDate,
        end_date: endDate,
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStartDate("");
    setEndDate("");
    generateMutation.reset();
  };

  const result = generateMutation.data?.data;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <AutorenewIcon className="h-4 w-4 mr-2" />
          Generate OT from Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Overtime Requests</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Alert>
            <AlertDescription className="text-sm">
              This will automatically create OT requests from approved
              attendance records with overtime hours.
            </AlertDescription>
          </Alert>

          {!generateMutation.isSuccess && (
            <>
              <div>
                <Label htmlFor="start-date">Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  required
                />
              </div>
            </>
          )}

          {generateMutation.isError && (
            <Alert variant="destructive">
              <ErrorIcon className="h-4 w-4" />
              <AlertDescription>
                Failed to generate OT requests. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {generateMutation.isSuccess && result && (
            <div className="space-y-3">
              <Alert>
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Generation Complete!</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Generated:</span>
                      <span className="font-medium text-green-600">
                        {result.generated} requests
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Skipped:</span>
                      <span className="font-medium">
                        {result.skipped} (already exist)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Processed:
                      </span>
                      <span className="font-medium">
                        {result.total_processed}
                      </span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {result.errors && result.errors.length > 0 && (
                <Alert variant="destructive">
                  <ErrorIcon className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">
                      Errors ({result.errors.length})
                    </div>
                    <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                      {result.errors.map((error, idx) => (
                        <div
                          key={idx}
                          className="border-l-2 border-destructive pl-2"
                        >
                          <div className="font-medium">
                            Employee: {error.employee_id}
                          </div>
                          <div>Date: {error.date}</div>
                          <div className="text-muted-foreground">
                            {error.error}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {!generateMutation.isSuccess ? (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={
                    generateMutation.isPending || !startDate || !endDate
                  }
                >
                  {generateMutation.isPending ? "Generating..." : "Generate"}
                </Button>
              </>
            ) : (
              <Button onClick={handleClose}>Close</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
