import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { holidayService } from "@/services/holiday.service";
import type {
  CreateHolidayDto,
  Holiday,
  UpdateHolidayDto,
} from "@/types/holiday";
import { HolidaysCalendar } from "@/components/hris/holidays/holidays-calendar";
import { CreateHolidayForm } from "@/components/hris/holidays/create-holiday-form";
import { EditHolidayForm } from "@/components/hris/holidays/edit-holiday-form";
import { ImportHolidaysDialog } from "@/components/hris/holidays/import-holidays-dialog";
import { toast } from "sonner";

export function HolidaysTab() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<string | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined);

  const createHoliday = useMutation({
    mutationFn: holidayService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Holiday created successfully.");
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create holiday.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

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

  const importHolidays = useMutation({
    mutationFn: (year: number) => holidayService.import(year),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success(`Holidays imported successfully!`, {
        description: `Imported ${data.imported} new holidays. ${data.skipped} holidays were skipped (already exist).`,
      });
      setIsImportDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to import holidays.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const handleCreate = (data: CreateHolidayDto) => {
    createHoliday.mutate(data);
  };

  const handleUpdate = (id: string, data: UpdateHolidayDto) => {
    updateHoliday.mutate({ id, data });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this holiday?")) {
      deleteHoliday.mutate(id);
    }
  };

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    setDefaultDate(dateString);
    setIsCreateDialogOpen(true);
  };

  const handleEventClick = (holiday: Holiday) => {
    setEditingHoliday(holiday.id);
  };

  return (
    <div className="space-y-6">
      <HolidaysCalendar
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
        onDelete={handleDelete}
      />

      <CreateHolidayForm
        open={isCreateDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsCreateDialogOpen(open);
          if (!open) setDefaultDate(undefined);
        }}
        onSubmit={handleCreate}
        isSubmitting={createHoliday.isPending}
        defaultDate={defaultDate}
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

      <ImportHolidaysDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={(year: number) => importHolidays.mutate(year)}
        isImporting={importHolidays.isPending}
      />
    </div>
  );
}
