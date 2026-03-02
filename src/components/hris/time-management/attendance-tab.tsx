import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import type { Attendance, AttendanceFilters } from "@/types/attendance";
import { AttendanceStats } from "@/components/hris/attendance/attendance-stats";
import { AttendanceTable } from "@/components/hris/attendance/attendance-table";
import { AttendanceForm } from "@/components/hris/attendance/attendance-form";
import type { AttendanceFormData } from "@/components/hris/attendance/attendance-form";

export function AttendanceTab() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AttendanceFilters>({
    per_page: 50,
  });
  const [editingItem, setEditingItem] = useState<Attendance | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createAttendance = useMutation({
    mutationFn: attendanceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error: unknown) => {
      console.error("Error creating attendance:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to create attendance: ${message}`);
    },
  });

  const updateAttendance = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AttendanceFormData> }) =>
      attendanceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error: unknown) => {
      console.error("Error updating attendance:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to update attendance: ${message}`);
    },
  });

  const deleteAttendance = useMutation({
    mutationFn: attendanceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
    },
    onError: (error: unknown) => {
      console.error("Error deleting attendance:", error);
      alert("Failed to delete attendance");
    },
  });

  const handleAddClick = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (attendance: Attendance) => {
    setEditingItem(attendance);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this attendance record?")) {
      deleteAttendance.mutate(id);
    }
  };

  const handleSubmit = (data: AttendanceFormData) => {
    if (editingItem) {
      updateAttendance.mutate({ id: editingItem.id, data });
    } else {
      createAttendance.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <AttendanceStats />
      <AttendanceTable
        filters={filters}
        onFiltersChange={setFilters}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AttendanceForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={createAttendance.isPending || updateAttendance.isPending}
      />
    </div>
  );
}
