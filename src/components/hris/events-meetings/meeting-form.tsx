import * as React from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Meeting, CreateMeetingDto } from "@/types/event-meeting";
import { useQuery } from "@tanstack/react-query";
import { employeeService } from "@/services/employee.service";

const meetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  meeting_type: z.enum(["team_meeting", "one_on_one", "client_meeting", "board_meeting", "other"]),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  location: z.string().optional().nullable(),
  organizer_id: z.string().optional().nullable(),
  status: z.enum(["scheduled", "ongoing", "completed", "cancelled"]).default("scheduled"),
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.string().optional().nullable(),
  meeting_link: z.string().optional().nullable(),
  agenda: z.string().optional().nullable(),
  attendee_ids: z.array(z.string()).optional().nullable(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface MeetingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateMeetingDto) => void;
  isSubmitting: boolean;
  meeting?: Meeting | null;
  defaultDate?: Date;
}

export function MeetingForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  meeting,
  defaultDate,
}: MeetingFormProps) {
  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeService.getAll({ per_page: 9999 }),
  });

  const employees = React.useMemo(() => {
    if (!employeesData) return [];
    if (Array.isArray(employeesData)) return employeesData;
    if (employeesData && typeof employeesData === 'object' && 'data' in employeesData) {
      return employeesData.data || [];
    }
    return [];
  }, [employeesData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: meeting?.title || "",
      description: meeting?.description || null,
      meeting_type: meeting?.meeting_type || "team_meeting",
      start_time: meeting?.start_time
        ? new Date(meeting.start_time).toISOString().slice(0, 16)
        : "",
      end_time: meeting?.end_time
        ? new Date(meeting.end_time).toISOString().slice(0, 16)
        : "",
      location: meeting?.location || null,
      organizer_id: meeting?.organizer_id || null,
      status: meeting?.status || "scheduled",
      is_recurring: meeting?.is_recurring ?? false,
      recurrence_pattern: meeting?.recurrence_pattern || null,
      meeting_link: meeting?.meeting_link || null,
      agenda: meeting?.agenda || null,
      attendee_ids: meeting?.attendees?.map((a) => a.employee_id) || [],
    },
  });

  const isRecurring = watch("is_recurring");

  React.useEffect(() => {
    if (open) {
      let defaultStartTime = "";
      let defaultEndTime = "";

      if (defaultDate) {
        // Create proper date from the Date object
        const startDate = new Date(defaultDate.getFullYear(), defaultDate.getMonth(), defaultDate.getDate(), 9, 0, 0); // 9:00 AM
        const endDate = new Date(defaultDate.getFullYear(), defaultDate.getMonth(), defaultDate.getDate(), 10, 0, 0); // 10:00 AM
        
        defaultStartTime = startDate.toISOString().slice(0, 16);
        defaultEndTime = endDate.toISOString().slice(0, 16);
      }

      reset({
        title: meeting?.title || "",
        description: meeting?.description || null,
        meeting_type: meeting?.meeting_type || "team_meeting",
        start_time: meeting?.start_time
          ? new Date(meeting.start_time).toISOString().slice(0, 16)
          : defaultStartTime,
        end_time: meeting?.end_time
          ? new Date(meeting.end_time).toISOString().slice(0, 16)
          : defaultEndTime,
        location: meeting?.location || null,
        organizer_id: meeting?.organizer_id || null,
        status: meeting?.status || "scheduled",
        is_recurring: meeting?.is_recurring ?? false,
        recurrence_pattern: meeting?.recurrence_pattern || null,
        meeting_link: meeting?.meeting_link || null,
        agenda: meeting?.agenda || null,
        attendee_ids: meeting?.attendees?.map((a) => a.employee_id) || [],
      });
    }
  }, [open, meeting, defaultDate, reset]);

  const selectedOrganizer = React.useMemo(
    () => employees.find((emp) => emp.id === watch("organizer_id")),
    [employees, watch("organizer_id")]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto font-sans [&_[data-slot=button][data-variant=outline]]:border-primary/20 [&_[data-slot=button][data-variant=outline]]:hover:bg-primary/5 [&_[data-slot=button][data-variant=ghost]]:hover:bg-primary/5">
        <DialogHeader className="border-b border-border/60 pb-4">
          <DialogTitle>{meeting ? "Edit Meeting" : "Create Meeting"}</DialogTitle>
          <DialogDescription>
            {meeting ? "Update meeting information" : "Schedule a new meeting"}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            // Convert datetime-local to ISO format
            const submitData = {
              ...data,
              start_time: new Date(data.start_time).toISOString(),
              end_time: new Date(data.end_time).toISOString(),
            };
            onSubmit(submitData);
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meeting_type">Meeting Type</Label>
              <Controller
                name="meeting_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="team_meeting">Team Meeting</SelectItem>
                      <SelectItem value="one_on_one">One-on-One</SelectItem>
                      <SelectItem value="client_meeting">Client Meeting</SelectItem>
                      <SelectItem value="board_meeting">Board Meeting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input id="start_time" type="datetime-local" {...register("start_time")} />
              {errors.start_time && (
                <p className="text-sm text-destructive">{errors.start_time.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input id="end_time" type="datetime-local" {...register("end_time")} />
              {errors.end_time && (
                <p className="text-sm text-destructive">{errors.end_time.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} placeholder="Physical location" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting_link">Meeting Link</Label>
              <Input
                id="meeting_link"
                type="url"
                {...register("meeting_link")}
                placeholder="https://meet.google.com/..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizer_id">Organizer</Label>
            <Controller
              name="organizer_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organizer">
                      {selectedOrganizer ? `${selectedOrganizer.full_name} (${selectedOrganizer.employee_code})` : "Select organizer"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.employee_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenda">Agenda</Label>
            <Textarea id="agenda" rows={3} {...register("agenda")} placeholder="Meeting agenda..." />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_recurring"
              checked={watch("is_recurring")}
              onCheckedChange={(checked) => {
                setValue("is_recurring", checked === true);
              }}
            />
            <Label htmlFor="is_recurring" className="cursor-pointer">
              Recurring Meeting
            </Label>
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
              <Input
                id="recurrence_pattern"
                {...register("recurrence_pattern")}
                placeholder="e.g., Daily, Weekly, Monthly"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : meeting ? "Update" : "Create Meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
