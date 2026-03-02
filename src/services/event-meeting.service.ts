import { api } from "./api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  Event,
  Meeting,
  CreateEventDto,
  CreateMeetingDto,
} from "@/types/event-meeting";

export const eventMeetingService = {
  // Events
  getEvents: async (): Promise<Event[]> => {
    try {
      const response = await api.get<{ data: Event[] } | Event[]>(API_ENDPOINTS.events.list);
      const responseData = response.data;
      
      // Handle wrapped response
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return Array.isArray(responseData.data) ? responseData.data : [];
      }
      
      // Handle direct array response
      if (Array.isArray(responseData)) {
        return responseData;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  getEvent: async (id: string): Promise<Event> => {
    const response = await api.get<{ data: Event } | Event>(API_ENDPOINTS.events.detail(id));
    const responseData = response.data;
    return (responseData && typeof responseData === 'object' && 'data' in responseData) 
      ? responseData.data 
      : responseData as Event;
  },

  createEvent: async (data: CreateEventDto): Promise<Event> => {
    const response = await api.post<{ data: Event } | Event>(API_ENDPOINTS.events.create, data);
    const responseData = response.data;
    return (responseData && typeof responseData === 'object' && 'data' in responseData) 
      ? responseData.data 
      : responseData as Event;
  },

  updateEvent: async (id: string, data: Partial<CreateEventDto>): Promise<Event> => {
    const response = await api.put<{ data: Event } | Event>(API_ENDPOINTS.events.update(id), data);
    const responseData = response.data;
    return (responseData && typeof responseData === 'object' && 'data' in responseData) 
      ? responseData.data 
      : responseData as Event;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.events.delete(id));
  },

  // Meetings
  getMeetings: async (): Promise<Meeting[]> => {
    try {
      const response = await api.get<{ data: Meeting[] } | Meeting[]>(API_ENDPOINTS.meetings.list);
      const responseData = response.data;
      
      // Handle wrapped response
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return Array.isArray(responseData.data) ? responseData.data : [];
      }
      
      // Handle direct array response
      if (Array.isArray(responseData)) {
        return responseData;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching meetings:', error);
      return [];
    }
  },

  getMeeting: async (id: string): Promise<Meeting> => {
    const response = await api.get<{ data: Meeting } | Meeting>(API_ENDPOINTS.meetings.detail(id));
    const responseData = response.data;
    return (responseData && typeof responseData === 'object' && 'data' in responseData) 
      ? responseData.data 
      : responseData as Meeting;
  },

  createMeeting: async (data: CreateMeetingDto): Promise<Meeting> => {
    const response = await api.post<{ data: Meeting } | Meeting>(API_ENDPOINTS.meetings.create, data);
    const responseData = response.data;
    return (responseData && typeof responseData === 'object' && 'data' in responseData) 
      ? responseData.data 
      : responseData as Meeting;
  },

  updateMeeting: async (id: string, data: Partial<CreateMeetingDto>): Promise<Meeting> => {
    const response = await api.put<{ data: Meeting } | Meeting>(API_ENDPOINTS.meetings.update(id), data);
    const responseData = response.data;
    return (responseData && typeof responseData === 'object' && 'data' in responseData) 
      ? responseData.data 
      : responseData as Meeting;
  },

  deleteMeeting: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.meetings.delete(id));
  },
};
