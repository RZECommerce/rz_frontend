import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { holidayService } from "@/services/holiday.service";
import { eventMeetingService } from "@/services/event-meeting.service";
import type {
  CreateHolidayDto,
  Holiday,
  UpdateHolidayDto,
} from "@/types/holiday";
import type {
  Event,
  Meeting,
  CreateEventDto,
  CreateMeetingDto,
} from "@/types/event-meeting";
import { UnifiedCalendar } from "./unified-calendar";
import { CreateHolidayForm } from "@/components/hris/holidays/create-holiday-form";
import { EditHolidayForm } from "@/components/hris/holidays/edit-holiday-form";
import { EventForm } from "./event-form";
import { MeetingForm } from "./meeting-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function UnifiedCalendarTab() {
  const queryClient = useQueryClient();
  
  // Holiday states
  const [isCreateHolidayDialogOpen, setIsCreateHolidayDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<string | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined);

  // Event states
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [defaultEventDate, setDefaultEventDate] = useState<Date | undefined>(undefined);

  // Meeting states
  const [isMeetingFormOpen, setIsMeetingFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [defaultMeetingDate, setDefaultMeetingDate] = useState<Date | undefined>(undefined);

  // Date click dialog state
  const [isDateClickDialogOpen, setIsDateClickDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Holiday mutations
  const createHoliday = useMutation({
    mutationFn: holidayService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Holiday created successfully.");
      setIsCreateHolidayDialogOpen(false);
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

  // Event mutations
  const createEvent = useMutation({
    mutationFn: (data: CreateEventDto) => eventMeetingService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsEventFormOpen(false);
      setEditingEvent(null);
      setDefaultEventDate(undefined);
      toast.success("Event created successfully");
    },
    onError: () => {
      toast.error("Failed to create event");
    },
  });

  const updateEvent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEventDto> }) =>
      eventMeetingService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsEventFormOpen(false);
      setEditingEvent(null);
      setDefaultEventDate(undefined);
      toast.success("Event updated successfully");
    },
    onError: () => {
      toast.error("Failed to update event");
    },
  });

  const deleteEvent = useMutation({
    mutationFn: (id: string) => eventMeetingService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete event");
    },
  });

  // Meeting mutations
  const createMeeting = useMutation({
    mutationFn: (data: CreateMeetingDto) => eventMeetingService.createMeeting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setIsMeetingFormOpen(false);
      setEditingMeeting(null);
      setDefaultMeetingDate(undefined);
      toast.success("Meeting created successfully");
    },
    onError: () => {
      toast.error("Failed to create meeting");
    },
  });

  const updateMeeting = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMeetingDto> }) =>
      eventMeetingService.updateMeeting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setIsMeetingFormOpen(false);
      setEditingMeeting(null);
      setDefaultMeetingDate(undefined);
      toast.success("Meeting updated successfully");
    },
    onError: () => {
      toast.error("Failed to update meeting");
    },
  });

  const deleteMeeting = useMutation({
    mutationFn: (id: string) => eventMeetingService.deleteMeeting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete meeting");
    },
  });

  // Handlers
  const handleHolidayCreate = (data: CreateHolidayDto) => {
    createHoliday.mutate(data);
  };

  const handleHolidayUpdate = (id: string, data: UpdateHolidayDto) => {
    updateHoliday.mutate({ id, data });
  };

  const handleHolidayDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this holiday?")) {
      deleteHoliday.mutate(id);
    }
  };

  const handleEventSubmit = (data: CreateEventDto) => {
    if (editingEvent) {
      updateEvent.mutate({ id: editingEvent.id, data });
    } else {
      createEvent.mutate(data);
    }
  };

  const handleEventDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEvent.mutate(id);
    }
  };

  const handleMeetingSubmit = (data: CreateMeetingDto) => {
    if (editingMeeting) {
      updateMeeting.mutate({ id: editingMeeting.id, data });
    } else {
      createMeeting.mutate(data);
    }
  };

  const handleMeetingDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      deleteMeeting.mutate(id);
    }
  };

  const handleDateClick = (date: Date, type?: "event" | "meeting") => {
    setSelectedDate(date);
    if (type === "meeting") {
      setDefaultMeetingDate(date);
      setIsMeetingFormOpen(true);
      setIsDateClickDialogOpen(false);
    } else {
      // Show dialog to choose between event, meeting, or holiday
      setIsDateClickDialogOpen(true);
    }
  };

  const handleHolidayClick = (holiday: Holiday) => {
    setEditingHoliday(holiday.id);
  };

  const handleEventClick = (event: Event) => {
    setEditingEvent(event);
    setIsEventFormOpen(true);
  };

  const handleMeetingClick = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsMeetingFormOpen(true);
  };

  const handleCreateEventFromDate = () => {
    if (selectedDate) {
      setDefaultEventDate(selectedDate);
      setIsEventFormOpen(true);
    }
    setIsDateClickDialogOpen(false);
  };

  const handleCreateMeetingFromDate = () => {
    if (selectedDate) {
      setDefaultMeetingDate(selectedDate);
      setIsMeetingFormOpen(true);
    }
    setIsDateClickDialogOpen(false);
  };

  const handleCreateHolidayFromDate = () => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split("T")[0];
      setDefaultDate(dateString);
      setIsCreateHolidayDialogOpen(true);
    }
    setIsDateClickDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <UnifiedCalendar
        onDateClick={handleDateClick}
        onHolidayClick={handleHolidayClick}
        onEventClick={handleEventClick}
        onMeetingClick={handleMeetingClick}
      />

      {/* Date Click Dialog */}
      <Dialog open={isDateClickDialogOpen} onOpenChange={setIsDateClickDialogOpen}>
        <DialogContent className="font-sans [&_[data-slot=button][data-variant=outline]]:border-primary/20 [&_[data-slot=button][data-variant=outline]]:hover:bg-primary/5">
          <DialogHeader className="border-b border-border/60 pb-4">
            <DialogTitle>Create New</DialogTitle>
            <DialogDescription>
              What would you like to create for {selectedDate?.toLocaleDateString()}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button onClick={handleCreateEventFromDate} variant="outline" className="w-full">
              Create Event
            </Button>
            <Button onClick={handleCreateMeetingFromDate} variant="outline" className="w-full">
              Create Meeting
            </Button>
            <Button onClick={handleCreateHolidayFromDate} variant="outline" className="w-full">
              Create Holiday
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Holiday Forms */}
      <CreateHolidayForm
        open={isCreateHolidayDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsCreateHolidayDialogOpen(open);
          if (!open) setDefaultDate(undefined);
        }}
        onSubmit={handleHolidayCreate}
        isSubmitting={createHoliday.isPending}
        defaultDate={defaultDate}
      />

      {editingHoliday && (
        <EditHolidayForm
          holidayId={editingHoliday}
          open={!!editingHoliday}
          onOpenChange={(open: boolean) => !open && setEditingHoliday(null)}
          onSubmit={(data: UpdateHolidayDto) =>
            handleHolidayUpdate(editingHoliday, data)
          }
          isSubmitting={updateHoliday.isPending}
        />
      )}

      {/* Event Form */}
      <EventForm
        open={isEventFormOpen}
        onOpenChange={(open: boolean) => {
          setIsEventFormOpen(open);
          if (!open) {
            setEditingEvent(null);
            setDefaultEventDate(undefined);
          }
        }}
        onSubmit={handleEventSubmit}
        isSubmitting={createEvent.isPending || updateEvent.isPending}
        event={editingEvent}
        defaultDate={defaultEventDate}
      />

      {/* Meeting Form */}
      <MeetingForm
        open={isMeetingFormOpen}
        onOpenChange={(open: boolean) => {
          setIsMeetingFormOpen(open);
          if (!open) {
            setEditingMeeting(null);
            setDefaultMeetingDate(undefined);
          }
        }}
        onSubmit={handleMeetingSubmit}
        isSubmitting={createMeeting.isPending || updateMeeting.isPending}
        meeting={editingMeeting}
        defaultDate={defaultMeetingDate}
      />
    </div>
  );
}
