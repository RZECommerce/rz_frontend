import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { eventMeetingService } from "@/services/event-meeting.service";
import { holidayService } from "@/services/holiday.service";
import type { Event, Meeting } from "@/types/event-meeting";
import type { Holiday } from "@/types/holiday";
import { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { CalendarToday as Calendar01Icon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import "../holidays/holidays-calendar.css";

interface UnifiedCalendarProps {
  onDateClick: (date: Date, type?: "event" | "meeting") => void;
  onHolidayClick: (holiday: Holiday) => void;
  onEventClick: (event: Event) => void;
  onMeetingClick: (meeting: Meeting) => void;
  onDelete?: (id: string, type: "holiday" | "event" | "meeting") => void;
}

export function UnifiedCalendar({
  onDateClick,
  onHolidayClick,
  onEventClick,
  onMeetingClick,
}: UnifiedCalendarProps) {
  const { data: holidaysData, isLoading: holidaysLoading } = useQuery({
    queryKey: ["holidays"],
    queryFn: () => holidayService.getAll({ per_page: 1000 }),
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventMeetingService.getEvents(),
  });

  const { data: meetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: () => eventMeetingService.getMeetings(),
  });

  const isLoading = holidaysLoading || eventsLoading || meetingsLoading;

  const calendarEvents = React.useMemo(() => {
    const eventsList: any[] = [];
    const now = new Date();

    const isDatePast = (dateStr: string) => {
      const date = new Date(dateStr);
      // If it's a date-only string (YYYY-MM-DD), set it to end of that day for comparison
      if (dateStr.length === 10) {
        date.setHours(23, 59, 59, 999);
      }
      return date < now;
    };

    // Add holidays
    const holidays = holidaysData?.data || [];
    holidays
      .filter((holiday) => holiday.is_active)
      .forEach((holiday) => {
        const isPast = isDatePast(holiday.date);
        eventsList.push({
          id: `holiday-${holiday.id}`,
          title: holiday.name,
          date: holiday.date,
          backgroundColor: isPast
            ? "#9ca3af" // Gray for past
            : holiday.type === "regular"
            ? "var(--holiday-regular)"
            : "var(--holiday-special)",
          borderColor: isPast
            ? "#9ca3af"
            : holiday.type === "regular"
            ? "var(--holiday-regular)"
            : "var(--holiday-special)",
          textColor: "white",
          extendedProps: {
            type: "holiday",
            holiday: holiday,
          },
        });
      });

    // Add events
    events.forEach((event) => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      const isPast = isDatePast(event.end_date);
      
      // For all-day events, use date only
      if (event.is_all_day) {
        eventsList.push({
          id: `event-${event.id}`,
          title: event.title,
          start: startDate.toISOString().split("T")[0],
          end: endDate.toISOString().split("T")[0],
          backgroundColor: isPast ? "#9ca3af" : "#3b82f6", // Blue for events
          borderColor: isPast ? "#9ca3af" : "#3b82f6",
          textColor: "white",
          extendedProps: {
            type: "event",
            event: event,
          },
        });
      } else {
        eventsList.push({
          id: `event-${event.id}`,
          title: event.title,
          start: event.start_date,
          end: event.end_date,
          backgroundColor: isPast ? "#9ca3af" : "#3b82f6",
          borderColor: isPast ? "#9ca3af" : "#3b82f6",
          textColor: "white",
          extendedProps: {
            type: "event",
            event: event,
          },
        });
      }
    });

    // Add meetings
    meetings.forEach((meeting) => {
      const isPast = isDatePast(meeting.end_time);
      eventsList.push({
        id: `meeting-${meeting.id}`,
        title: meeting.title,
        start: meeting.start_time,
        end: meeting.end_time,
        backgroundColor: isPast ? "#9ca3af" : "#10b981", // Green for meetings
        borderColor: isPast ? "#9ca3af" : "#10b981",
        textColor: "white",
        extendedProps: {
          type: "meeting",
          meeting: meeting,
        },
      });
    });

    return eventsList;
  }, [holidaysData, events, meetings]);

  const handleDateClick = (arg: { date: Date; allDay: boolean }) => {
    // Default to event when clicking on a date
    onDateClick(arg.date, "event");
  };

  const handleEventClick = (arg: EventClickArg) => {
    const { type } = arg.event.extendedProps;
    
    if (type === "holiday") {
      onHolidayClick(arg.event.extendedProps.holiday as Holiday);
    } else if (type === "event") {
      onEventClick(arg.event.extendedProps.event as Event);
    } else if (type === "meeting") {
      onMeetingClick(arg.event.extendedProps.meeting as Meeting);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#E6E6E6", padding: "1px" }}>
      <div className="bg-white rounded-t-lg">
        <div className="flex flex-row items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2">
            <Calendar01Icon
              className="size-5 text-[#5B5B5B]"
            />
            <h2 className="text-2xl font-medium text-[#5B5B5B]">Calendar</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "var(--holiday-regular)" }}
              />
              <span className="text-sm text-[#5B5B5B]">Regular Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "var(--holiday-special)" }}
              />
              <span className="text-sm text-[#5B5B5B]">Special Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "#3b82f6" }}
              />
              <span className="text-sm text-[#5B5B5B]">Event</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "#10b981" }}
              />
              <span className="text-sm text-[#5B5B5B]">Meeting</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "dayGridMonth",
          }}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          editable={false}
          selectable={false}
          dayMaxEvents={false}
          moreLinkClick="popover"
          height="auto"
          contentHeight="auto"
          eventDisplay="block"
          eventTextColor="white"
          locale="en"
          firstDay={0}
          weekends={true}
          dayHeaderFormat={{ weekday: "long" }}
          buttonText={{
            today: "Today",
            month: "Month",
          }}
          views={{
            dayGridMonth: {
              titleFormat: { year: "numeric", month: "long" },
            },
          }}
        />
      </div>
    </div>
  );
}
