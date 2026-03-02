export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type MeetingStatus = "scheduled" | "ongoing" | "completed" | "cancelled";
export type EventType = "company_event" | "team_building" | "celebration" | "training" | "other";
export type MeetingType = "team_meeting" | "one_on_one" | "client_meeting" | "board_meeting" | "other";

export interface Event {
  id: string;
  event_code: string;
  title: string;
  description?: string | null;
  event_type: EventType;
  start_date: string;
  end_date: string;
  location?: string | null;
  organizer_id?: string | null;
  organizer?: {
    id: string;
    name: string;
    email: string;
  } | null;
  max_attendees?: number | null;
  status: EventStatus;
  is_all_day: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  attendees?: EventAttendee[] | null;
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  employee_id: string;
  employee?: {
    id: string;
    full_name: string;
    employee_code: string;
  } | null;
  status: "invited" | "accepted" | "declined" | "attended";
  rsvp_date?: string | null;
  created_at: string;
}

export interface Meeting {
  id: string;
  meeting_code: string;
  title: string;
  description?: string | null;
  meeting_type: MeetingType;
  start_time: string;
  end_time: string;
  location?: string | null;
  organizer_id?: string | null;
  organizer?: {
    id: string;
    name: string;
    email: string;
  } | null;
  status: MeetingStatus;
  is_recurring: boolean;
  recurrence_pattern?: string | null;
  meeting_link?: string | null;
  agenda?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  attendees?: MeetingAttendee[] | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingAttendee {
  id: string;
  meeting_id: string;
  employee_id: string;
  employee?: {
    id: string;
    full_name: string;
    employee_code: string;
  } | null;
  status: "invited" | "accepted" | "declined" | "attended";
  rsvp_date?: string | null;
  created_at: string;
}

export interface CreateEventDto {
  title: string;
  description?: string | null;
  event_type: EventType;
  start_date: string;
  end_date: string;
  location?: string | null;
  organizer_id?: string | null;
  max_attendees?: number | null;
  status?: EventStatus;
  is_all_day?: boolean;
  attendee_ids?: string[] | null;
}

export interface CreateMeetingDto {
  title: string;
  description?: string | null;
  meeting_type: MeetingType;
  start_time: string;
  end_time: string;
  location?: string | null;
  organizer_id?: string | null;
  status?: MeetingStatus;
  is_recurring?: boolean;
  recurrence_pattern?: string | null;
  meeting_link?: string | null;
  agenda?: string | null;
  attendee_ids?: string[] | null;
}
