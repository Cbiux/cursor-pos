export interface LumaCalendarEvent {
  id: string;
  name: string;
  startAt: string | null;
}

export interface LumaGuestTicket {
  id: string;
  name: string | null;
  checkedInAt: string | null;
}

export interface LumaGuestSummary {
  guestId: string;
  scanKey: string;
  name: string;
  email: string;
  ticketName: string | null;
  checkedIn: boolean;
  eventId: string;
  eventName: string;
  checkinUrl: string;
  approvalStatus: string;
}

export interface LumaCheckinEntry {
  id: string;
  guestId: string;
  name: string;
  ticketName: string | null;
  scannedAt: string;
  printed: boolean;
  checkedIn: boolean;
  error: string | null;
  checkinUrl: string;
  eventName: string;
}

export interface LumaReceiptData {
  eventName: string;
  guestName: string;
  ticketName: string | null;
  checkinUrl: string;
  paperWidth: import("@/lib/types").PaperWidth;
  showTimestamp: boolean;
}

export const LUMA_CHECKIN_LOG_KEY = "cursor-pos-luma-checkin-log";
export const LUMA_SELECTED_EVENT_KEY = "cursor-pos-luma-selected-event";
export const LUMA_SCAN_DEDUPE_MS = 8000;
