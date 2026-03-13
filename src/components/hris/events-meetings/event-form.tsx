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
import type { Event, CreateEventDto } from "@/types/event-meeting";
import { useQuery } from "@tanstack/react-query";
import { employeeService } from "@/services/employee.service";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  event_type: z.enum(["company_event", "team_building", "celebration", "training", "other"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  location: z.string().optional().nullable(),
  organizer_id: z.string().optional().nullable(),
  max_attendees: z.number().optional().nullable(),
  status: z.enum(["draft", "published", "cancelled", "completed"]).default("draft"),
  is_all_day: z.boolean().default(false),
  attendee_ids: z.array(z.string()).optional().nullable(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEventDto) => void;
  isSubmitting: boolean;
  event?: Event | null;
  defaultDate?: Date;
}

export function EventForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  event,
  defaultDate,
}: EventFormProps) {
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

  const getDefaultStartDate = () => {
    if (event?.start_date) {
      const date = new Date(event.start_date);
      // Format as YYYY-MM-DD for HTML date input
      return date.getFullYear() + '-' + 
             String(date.getMonth() + 1).padStart(2, '0') + '-' + 
             String(date.getDate()).padStart(2, '0');
    }
    if (defaultDate) {
      // Format as YYYY-MM-DD for HTML date input
      return defaultDate.getFullYear() + '-' + 
             String(defaultDate.getMonth() + 1).padStart(2, '0') + '-' + 
             String(defaultDate.getDate()).padStart(2, '0');
    }
    // Current date in YYYY-MM-DD format
    const today = new Date();
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0');
  };

  const getDefaultEndDate = () => {
    if (event?.end_date) {
      const date = new Date(event.end_date);
      return date.getFullYear() + '-' + 
             String(date.getMonth() + 1).padStart(2, '0') + '-' + 
             String(date.getDate()).padStart(2, '0');
    }
    if (defaultDate) {
      // For new events from calendar click, use same day as start date
      return defaultDate.getFullYear() + '-' + 
             String(defaultDate.getMonth() + 1).padStart(2, '0') + '-' + 
             String(defaultDate.getDate()).padStart(2, '0');
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.getFullYear() + '-' + 
           String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' + 
           String(tomorrow.getDate()).padStart(2, '0');
  };

  const [startDate, setStartDate] = React.useState(getDefaultStartDate());
  const [startTime, setStartTime] = React.useState(() => {
    if (event?.start_date && !event.is_all_day) {
      const date = new Date(event.start_date);
      return date.toTimeString().slice(0, 5);
    }
    return "09:00";
  });
  const [endDate, setEndDate] = React.useState(getDefaultEndDate());
  const [endTime, setEndTime] = React.useState(() => {
    if (event?.end_date && !event.is_all_day) {
      const date = new Date(event.end_date);
      return date.toTimeString().slice(0, 5);
    }
    return "10:00";
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || null,
      event_type: event?.event_type || "company_event",
      start_date: event?.start_date || "",
      end_date: event?.end_date || "",
      location: event?.location || null,
      organizer_id: event?.organizer_id || null,
      max_attendees: event?.max_attendees || null,
      status: event?.status || "draft",
      is_all_day: event?.is_all_day ?? false,
      attendee_ids: event?.attendees?.map((a) => a.employee_id) || [],
    },
  });

  const isAllDay = watch("is_all_day");

  React.useEffect(() => {
    if (open) {
      let start: string;
      let end: string;
      const isAllDayEvent = event?.is_all_day ?? false;

      if (event?.start_date) {
        // Editing existing event
        const date = new Date(event.start_date);
        start = date.getFullYear() + '-' + 
               String(date.getMonth() + 1).padStart(2, '0') + '-' + 
               String(date.getDate()).padStart(2, '0');
        const eventEndDate = new Date(event.end_date);
        end = eventEndDate.getFullYear() + '-' + 
             String(eventEndDate.getMonth() + 1).padStart(2, '0') + '-' + 
             String(eventEndDate.getDate()).padStart(2, '0');
      } else if (defaultDate) {
        // Creating new event from calendar click - same day for both start and end
        start = defaultDate.getFullYear() + '-' + 
               String(defaultDate.getMonth() + 1).padStart(2, '0') + '-' + 
               String(defaultDate.getDate()).padStart(2, '0');
        end = defaultDate.getFullYear() + '-' + 
             String(defaultDate.getMonth() + 1).padStart(2, '0') + '-' + 
             String(defaultDate.getDate()).padStart(2, '0');
      } else {
        // Creating new event without default date
        start = getDefaultStartDate();
        end = getDefaultEndDate();
      }

      setStartDate(start);
      setStartTime(start && !isAllDayEvent ? new Date(start + 'T' + (startTime || '09:00')).toTimeString().slice(0, 5) : '09:00');
      setEndDate(end);
      setEndTime(end && !isAllDayEvent ? new Date(end + 'T' + (endTime || '10:00')).toTimeString().slice(0, 5) : '10:00');

      reset({
        title: event?.title || "",
        description: event?.description || null,
        event_type: event?.event_type || "company_event",
        start_date: start,
        end_date: end,
        location: event?.location || null,
        organizer_id: event?.organizer_id || null,
        max_attendees: event?.max_attendees || null,
        status: event?.status || "draft",
        is_all_day: isAllDayEvent,
        attendee_ids: event?.attendees?.map((a) => a.employee_id) || [],
      });
    }
  }, [open, event, defaultDate, reset, startTime, endTime]);

  const selectedOrganizer = React.useMemo(
    () => employees.find((emp) => emp.id === watch("organizer_id")),
    [employees, watch("organizer_id")]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto font-sans [&_[data-slot=button][data-variant=outline]]:border-primary/20 [&_[data-slot=button][data-variant=outline]]:hover:bg-primary/5 [&_[data-slot=button][data-variant=ghost]]:hover:bg-primary/5">
        <DialogHeader className="border-b border-border/60 pb-4">
          <DialogTitle>{event ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>
            {event ? "Update event information" : "Create a new company event"}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            // Convert date strings to ISO format
            const submitData = {
              ...data,
              start_date: isAllDay
                ? `${startDate}T00:00:00`
                : `${startDate}T${startTime || "00:00"}:00`,
              end_date: isAllDay
                ? `${endDate}T23:59:59`
                : `${endDate}T${endTime || "23:59"}:59`,
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
              <Label htmlFor="event_type">Event Type</Label>
              <Controller
                name="event_type"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value} 
                    onValueChange={(value: string | null) => field.onChange(value ?? "company_event")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company_event">Company Event</SelectItem>
                      <SelectItem value="team_building">Team Building</SelectItem>
                      <SelectItem value="celebration">Celebration</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
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
                  <Select 
                    value={field.value} 
                    onValueChange={(value: string | null) => field.onChange(value ?? "draft")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_all_day"
              checked={watch("is_all_day")}
              onCheckedChange={(checked) => {
                setValue("is_all_day", checked === true);
              }}
            />
            <Label htmlFor="is_all_day" className="cursor-pointer">
              All Day Event
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setValue("start_date", e.target.value);
                }}
              />
              {!isAllDay && (
                <Input
                  id="start_time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setValue("end_date", e.target.value);
                }}
              />
              {!isAllDay && (
                <Input
                  id="end_time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} placeholder="Event location" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizer_id">Organizer</Label>
              <Controller
                name="organizer_id"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={(field.value ?? "") as string} 
                    onValueChange={(value: string | null) => field.onChange(value ?? "")}
                  >
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
              <Label htmlFor="max_attendees">Max Attendees</Label>
              <Input
                id="max_attendees"
                type="number"
                {...register("max_attendees", { valueAsNumber: true })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : event ? "Update" : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
