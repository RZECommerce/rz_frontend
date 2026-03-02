import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { holidayService } from "@/services/holiday.service";
import type { UpdateHolidayDto } from "@/types/holiday";
import { HolidaysTable } from "@/components/hris/holidays/holidays-table";
import { EditHolidayForm } from "@/components/hris/holidays/edit-holiday-form";
import { toast } from "sonner";

export function HolidaysTableTab() {
  const queryClient = useQueryClient();
  const [editingHoliday, setEditingHoliday] = useState<string | null>(null);

  const updateHoliday = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHolidayDto }) =>
      holidayService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Holiday updated successfully.");
      setEditingHoliday(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update holiday.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const deleteHoliday = useMutation({
    mutationFn: holidayService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Holiday deleted successfully.");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete holiday.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const handleUpdate = (id: string, data: UpdateHolidayDto) => {
    updateHoliday.mutate({ id, data });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this holiday?")) {
      deleteHoliday.mutate(id);
    }
  };

  const handleEdit = (id: string) => {
    setEditingHoliday(id);
  };

  return (
    <div className="space-y-6">
      <HolidaysTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteHoliday.isPending}
      />

      {editingHoliday && (
        <EditHolidayForm
          holidayId={editingHoliday}
          open={!!editingHoliday}
          onOpenChange={(open: boolean) => !open && setEditingHoliday(null)}
          onSubmit={(data: UpdateHolidayDto) =>
            handleUpdate(editingHoliday, data)
          }
          isSubmitting={updateHoliday.isPending}
        />
      )}
    </div>
  );
}
