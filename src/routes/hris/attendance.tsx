import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import type { Attendance, AttendanceFilters } from "@/types/attendance";
import { AttendanceHeader } from "@/components/hris/attendance/attendance-header";
import { AttendanceStats } from "@/components/hris/attendance/attendance-stats";
import { AttendanceTable } from "@/components/hris/attendance/attendance-table";
import { AttendanceForm } from "@/components/hris/attendance/attendance-form";
import type { AttendanceFormData } from "@/components/hris/attendance/attendance-form";
import { ShiftSchedulesTab } from "@/components/hris/attendance/shift-schedules-tab";
import { OvertimePoliciesTab } from "@/components/hris/attendance/overtime-policies-tab";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { requireAuth } from "@/lib/auth/route-guards";

export const Route = createFileRoute("/hris/attendance")({
  beforeLoad: requireAuth(),
  component: AttendancePage,
});

function AttendancePage() {
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
    <DashboardLayout>
      <AttendanceHeader onAddClick={handleAddClick} />
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
        style={{ scrollbarGutter: "stable" }}
      >
        <Tabs defaultValue="records" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="records">Attendance Records</TabsTrigger>
            <TabsTrigger value="shift-schedules">Shift Schedules</TabsTrigger>
            <TabsTrigger value="overtime-policies">Overtime Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-6 mt-6">
            <AttendanceStats />
            <AttendanceTable
              filters={filters}
              onFiltersChange={setFilters}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value="shift-schedules" className="mt-6">
            <ShiftSchedulesTab />
          </TabsContent>

          <TabsContent value="overtime-policies" className="mt-6">
            <OvertimePoliciesTab />
          </TabsContent>
        </Tabs>
      </main>

      <AttendanceForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={createAttendance.isPending || updateAttendance.isPending}
      />
    </DashboardLayout>
  );
}

