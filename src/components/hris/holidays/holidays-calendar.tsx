import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { holidayService } from "@/services/holiday.service";
import type { Holiday } from "@/types/holiday";
import { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { CalendarMonth as Calendar01Icon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import "./holidays-calendar.css";

interface HolidaysCalendarProps {
  onDateClick: (date: Date) => void;
  onEventClick: (holiday: Holiday) => void;
  onDelete?: (id: string) => void;
}

export function HolidaysCalendar({
  onDateClick,
  onEventClick,
}: HolidaysCalendarProps) {
  const { data: holidaysData, isLoading } = useQuery({
    queryKey: ["holidays"],
    queryFn: () => holidayService.getAll({ per_page: 1000 }),
  });

  const calendarEvents = React.useMemo(() => {
    const holidays = holidaysData?.data || [];
    return holidays
      .filter((holiday) => holiday.is_active)
      .map((holiday) => ({
        id: holiday.id,
        title: holiday.name,
        date: holiday.date,
        backgroundColor:
          holiday.type === "regular"
            ? "var(--holiday-regular)"
            : "var(--holiday-special)",
        borderColor:
          holiday.type === "regular"
            ? "var(--holiday-regular)"
            : "var(--holiday-special)",
        textColor: "white",
        extendedProps: {
          holiday: holiday,
        },
      }));
  }, [holidaysData]);

  const handleDateClick = (arg: { date: Date; allDay: boolean }) => {
    onDateClick(arg.date);
  };

  const handleEventClick = (arg: EventClickArg) => {
    onEventClick(arg.event.extendedProps.holiday as Holiday);
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
            <h2 className="text-2xl font-medium text-[#5B5B5B]">Holidays Calendar</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "var(--holiday-regular)" }}
              />
              <span className="text-sm text-[#5B5B5B]">Regular</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "var(--holiday-special)" }}
              />
              <span className="text-sm text-[#5B5B5B]">Special</span>
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

