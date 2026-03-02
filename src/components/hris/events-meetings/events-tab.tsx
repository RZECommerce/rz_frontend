import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { eventMeetingService } from "@/services/event-meeting.service";
import type { CreateEventDto, Event } from "@/types/event-meeting";
import {
    Add as Add01Icon,
    Delete as Delete01Icon,
    Edit as Edit01Icon,
    MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import * as React from "react";
import { toast } from "sonner";
import { EventForm } from "./event-form";

export function EventsTab() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<Event | null>(null);

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventMeetingService.getEvents(),
  });

  // Debug logging
  React.useEffect(() => {
    if (error) {
      console.error("Error loading events:", error);
    }
    if (events) {
      console.log("Events data:", events);
    }
  }, [events, error]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventMeetingService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete event");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateEventDto) => eventMeetingService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsFormOpen(false);
      setEditingEvent(null);
      toast.success("Event created successfully");
    },
    onError: () => {
      toast.error("Failed to create event");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEventDto> }) =>
      eventMeetingService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsFormOpen(false);
      setEditingEvent(null);
      toast.success("Event updated successfully");
    },
    onError: () => {
      toast.error("Failed to update event");
    },
  });

  const handleAdd = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventTypeLabel = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleSubmit = (data: CreateEventDto) => {
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Events</h3>
          <p className="text-sm text-muted-foreground">
            Manage company events and celebrations
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Add01Icon className="size-5" />
          Add Event
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Event Code</TableHead>
                <TableHead className="min-w-[200px]">Title</TableHead>
                <TableHead className="min-w-[120px]">Type</TableHead>
                <TableHead className="min-w-[150px]">Start Date</TableHead>
                <TableHead className="min-w-[150px]">End Date</TableHead>
                <TableHead className="min-w-[150px]">Location</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Attendees</TableHead>
                <TableHead className="text-right min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!Array.isArray(events) || events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.event_code}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={event.title}>
                      {event.title}
                    </TableCell>
                    <TableCell>{getEventTypeLabel(event.event_type)}</TableCell>
                    <TableCell>
                      {event.is_all_day
                        ? format(new Date(event.start_date), "MMM d, yyyy")
                        : format(new Date(event.start_date), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell>
                      {event.is_all_day
                        ? format(new Date(event.end_date), "MMM d, yyyy")
                        : format(new Date(event.end_date), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={event.location || ""}>
                      {event.location || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {event.max_attendees
                        ? `${event.attendees?.length || 0}/${event.max_attendees}`
                        : event.attendees?.length || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(event)}>
                            <Edit01Icon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(event.id)}
                            className="text-destructive"
                          >
                            <Delete01Icon className="size-5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <EventForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        event={editingEvent}
      />
    </div>
  );
}
