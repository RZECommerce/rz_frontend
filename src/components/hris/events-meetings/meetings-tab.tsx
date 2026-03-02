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
import type { CreateMeetingDto, Meeting } from "@/types/event-meeting";
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
import { MeetingForm } from "./meeting-form";

export function MeetingsTab() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMeeting, setEditingMeeting] = React.useState<Meeting | null>(null);

  const { data: meetings = [], isLoading, error } = useQuery({
    queryKey: ["meetings"],
    queryFn: () => eventMeetingService.getMeetings(),
  });

  // Debug logging
  React.useEffect(() => {
    if (error) {
      console.error("Error loading meetings:", error);
    }
    if (meetings) {
      console.log("Meetings data:", meetings);
    }
  }, [meetings, error]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventMeetingService.deleteMeeting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete meeting");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMeetingDto) => eventMeetingService.createMeeting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setIsFormOpen(false);
      setEditingMeeting(null);
      toast.success("Meeting created successfully");
    },
    onError: () => {
      toast.error("Failed to create meeting");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMeetingDto> }) =>
      eventMeetingService.updateMeeting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setIsFormOpen(false);
      setEditingMeeting(null);
      toast.success("Meeting updated successfully");
    },
    onError: () => {
      toast.error("Failed to update meeting");
    },
  });

  const handleAdd = () => {
    setEditingMeeting(null);
    setIsFormOpen(true);
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "ongoing":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMeetingTypeLabel = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleSubmit = (data: CreateMeetingDto) => {
    if (editingMeeting) {
      updateMutation.mutate({ id: editingMeeting.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading meetings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Meetings</h3>
          <p className="text-sm text-muted-foreground">
            Manage team meetings and appointments
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Add01Icon className="size-5" />
          Add Meeting
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Meeting Code</TableHead>
                <TableHead className="min-w-[200px]">Title</TableHead>
                <TableHead className="min-w-[120px]">Type</TableHead>
                <TableHead className="min-w-[150px]">Start Time</TableHead>
                <TableHead className="min-w-[150px]">End Time</TableHead>
                <TableHead className="min-w-[150px]">Location</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Attendees</TableHead>
                <TableHead className="text-right min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!Array.isArray(meetings) || meetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    No meetings found
                  </TableCell>
                </TableRow>
              ) : (
                meetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">{meeting.meeting_code}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={meeting.title}>
                      {meeting.title}
                    </TableCell>
                    <TableCell>{getMeetingTypeLabel(meeting.meeting_type)}</TableCell>
                    <TableCell>
                      {format(new Date(meeting.start_time), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(meeting.end_time), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={meeting.location || meeting.meeting_link || ""}>
                      {meeting.location || meeting.meeting_link || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{meeting.attendees?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(meeting)}>
                             <Edit01Icon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(meeting.id)}
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

      <MeetingForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        meeting={editingMeeting}
      />
    </div>
  );
}
