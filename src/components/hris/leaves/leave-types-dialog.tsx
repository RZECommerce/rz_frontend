import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHasPermission } from "@/hooks/use-permissions";
import { leaveTypeService } from "@/services/leave.service";
import type { CreateLeaveTypeDto, LeaveType, UpdateLeaveTypeDto } from "@/types/leave";
import { Add as Add01Icon } from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import { LeaveTypeForm } from "./leave-type-form";
import { LeaveTypesTable } from "./leave-types-table";

interface LeaveTypesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveTypesDialog({
  open,
  onOpenChange,
}: LeaveTypesDialogProps) {
  const queryClient = useQueryClient();
  const canManage = useHasPermission("leave-types.manage");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingLeaveType, setEditingLeaveType] = React.useState<LeaveType | null>(null);

  const createLeaveType = useMutation({
    mutationFn: (data: CreateLeaveTypeDto) => leaveTypeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      toast.success("Leave type created successfully");
      setIsFormOpen(false);
      setEditingLeaveType(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to create leave type", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const updateLeaveType = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeaveTypeDto }) =>
      leaveTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      toast.success("Leave type updated successfully");
      setIsFormOpen(false);
      setEditingLeaveType(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update leave type", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const deleteLeaveType = useMutation({
    mutationFn: leaveTypeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      toast.success("Leave type deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete leave type", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const handleEdit = (leaveType: LeaveType) => {
    setEditingLeaveType(leaveType);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingLeaveType(null);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: CreateLeaveTypeDto | UpdateLeaveTypeDto) => {
    if (editingLeaveType) {
      updateLeaveType.mutate({ id: editingLeaveType.id, data });
    } else {
      createLeaveType.mutate(data as CreateLeaveTypeDto);
    }
  };

  const handleDelete = (id: string) => {
    deleteLeaveType.mutate(id);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[85vh] w-full max-w-5xl flex-col p-0 font-sans [&_[data-slot=button][data-variant=outline]]:border-primary/20 [&_[data-slot=button][data-variant=outline]]:hover:bg-primary/5 [&_[data-slot=button][data-variant=ghost]]:hover:bg-primary/5">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Manage Leave Types</DialogTitle>
                <DialogDescription className="mt-1">
                  Create and manage leave types for your organization
                </DialogDescription>
              </div>
              {canManage && (
                <Button onClick={handleCreate} size="sm" className="gap-2">
                  <Add01Icon className="size-5" />
                  Create Leave Type
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <LeaveTypesTable
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteLeaveType.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      <LeaveTypeForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingLeaveType={editingLeaveType}
        onSubmit={handleSubmit}
        isSubmitting={createLeaveType.isPending || updateLeaveType.isPending}
      />
    </>
  );
}
