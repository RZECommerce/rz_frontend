import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { CreateOvertimeRequestDto, OvertimeRequest, UpdateOvertimeRequestDto } from "@/types/overtime-request";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  Edit as Edit01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const overtimeSchema = z.object({
  date: z.string().min(1, "Date is required"),
  hours: z.number().min(0.1, "Hours must be at least 0.1"),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  reason: z.string().min(1, "Reason is required"),
});

type OvertimeFormData = z.infer<typeof overtimeSchema>;

interface OvertimeSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function OvertimeSection({ employeeId, isEditMode = true }: OvertimeSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const { data: overtimeRequests, isLoading } = useQuery({
    queryKey: ["employee-overtime-requests", employeeId],
    queryFn: () => overtimeRequestService.getByEmployee(employeeId),
  });

  const overtimeList = React.useMemo(() => {
    if (!overtimeRequests || !("data" in overtimeRequests)) return [];
    return Array.isArray(overtimeRequests) ? overtimeRequests : overtimeRequests.data || [];
  }, [overtimeRequests]);

  const createMutation = useMutation({
    mutationFn: (data: CreateOvertimeRequestDto) => overtimeRequestService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-overtime-requests", employeeId] });
      toast.success("Overtime request added successfully");
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to add overtime request", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOvertimeRequestDto }) =>
      overtimeRequestService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-overtime-requests", employeeId] });
      toast.success("Overtime request updated successfully");
      setIsAddDialogOpen(false);
      setEditingId(null);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to update overtime request", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => overtimeRequestService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-overtime-requests", employeeId] });
      toast.success("Overtime request deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete overtime request", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<OvertimeFormData>({
    resolver: zodResolver(overtimeSchema),
    defaultValues: {
      date: "",
      hours: 0,
      start_time: "",
      end_time: "",
      reason: "",
    },
  });

  const startTime = watch("start_time");
  const endTime = watch("end_time");

  React.useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      
      let diffMs = end.getTime() - start.getTime();
      
      if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000;
      }
      
      const hours = diffMs / (1000 * 60 * 60);
      setValue("hours", Math.round(hours * 10) / 10);
    }
  }, [startTime, endTime, setValue]);

  React.useEffect(() => {
    if (editingId) {
      const overtime = overtimeList.find((o: OvertimeRequest) => o.id === editingId);
      if (overtime) {
        reset({
          date: overtime.date,
          hours: overtime.hours || 0,
          start_time: overtime.start_time || "",
          end_time: overtime.end_time || "",
          reason: overtime.reason || "",
        });
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, overtimeList, reset]);

  const onSubmit = (data: OvertimeFormData) => {
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: {
          date: data.date,
          hours: data.hours,
          start_time: data.start_time || undefined,
          end_time: data.end_time || undefined,
          reason: data.reason,
        },
      });
    } else {
      createMutation.mutate({
        employee_id: employeeId,
        date: data.date,
        hours: data.hours,
        start_time: data.start_time || "",
        end_time: data.end_time || "",
        reason: data.reason,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this overtime request?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Overtime Requests</h3>
        {isEditMode && (
          <Button
            onClick={() => {
              reset({
                date: "",
                hours: 0,
                start_time: "",
                end_time: "",
                reason: "",
              });
              setEditingId(null);
              setIsAddDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Add01Icon className="size-5 mr-2" />
            Add Overtime
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading overtime requests...
        </div>
      ) : overtimeList.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                {isEditMode && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {overtimeList.map((request: OvertimeRequest) => (
                <TableRow key={request.id}>
                  <TableCell>{formatDate(request.date)}</TableCell>
                  <TableCell className="font-medium">{request.hours || 0} hours</TableCell>
                  <TableCell>{request.start_time || "-"}</TableCell>
                  <TableCell>{request.end_time || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{request.reason || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === "approved"
                          ? "default"
                          : request.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  {isEditMode && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingId(request.id)}>
                            <Edit01Icon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(request.id)}
                            className="text-destructive"
                          >
                            <Delete01Icon className="size-5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No overtime requests found.</p>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Overtime Request" : "Add Overtime Request"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update overtime request information" : "Add a new overtime request for this employee"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input id="date" type="date" {...register("date")} />
                {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">
                  Hours <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.1"
                  {...register("hours", { valueAsNumber: true })}
                  placeholder="Enter hours"
                />
                {errors.hours && <p className="text-sm text-destructive">{errors.hours.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input id="start_time" type="time" {...register("start_time")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input id="end_time" type="time" {...register("end_time")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                {...register("reason")}
                placeholder="Enter reason for overtime"
                rows={3}
              />
              {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingId(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Update" : "Add"} Overtime
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
