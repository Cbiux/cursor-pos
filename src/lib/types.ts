import type { PhotoFrameOffset } from "./photo-image";
import { DEFAULT_PHOTO_FRAME_OFFSET } from "./photo-image";

export type PaperWidth = 58 | 80;

export type TicketMode = "event" | "photo" | "luma" | "credits";

export interface ReceiptData {
  businessName: string;
  nombre: string;
  extra: string;
  qrContent: string;
  eventType: string;
  actionLabel: string;
  wifiSsid: string;
  wifiPassword: string;
  paperWidth: PaperWidth;
  showLogo: boolean;
  showQr: boolean;
  showEventType: boolean;
  showActionLabel: boolean;
  showNombre: boolean;
  showExtra: boolean;
  showWifi: boolean;
  showTimestamp: boolean;
}

export interface PhotoTicketData {
  nombre: string;
  extra: string;
  paperWidth: PaperWidth;
  photoSourceDataUrl: string | null;
  photoFrameOffset: PhotoFrameOffset;
  photoDataUrl: string | null;
  showTimestamp: boolean;
}

export interface CreditEntry {
  id: string;
  label: string;
  claimUrl: string;
}

export interface CreditsTicketData {
  title: string;
  subtitle: string;
  entries: CreditEntry[];
  currentIndex: number;
  paperWidth: PaperWidth;
  showLogo: boolean;
  showQr: boolean;
  showLabel: boolean;
  showSubtitle: boolean;
  showTimestamp: boolean;
}

export const defaultReceiptData: ReceiptData = {
  businessName: "Cursor Meetup - San José",
  nombre: "Juan Santamaría",
  extra: "",
  qrContent: "https://luma.com/cursor-san-jose-costa-rica",
  eventType: "Drop-by slot",
  actionLabel: "Check-in",
  wifiSsid: "Taller.1",
  wifiPassword: "@Salvo20",
  paperWidth: 58,
  showLogo: true,
  showQr: true,
  showEventType: true,
  showActionLabel: true,
  showNombre: true,
  showExtra: true,
  showWifi: true,
  showTimestamp: true,
};

export const defaultPhotoTicketData: PhotoTicketData = {
  nombre: "Juan Santamaría",
  extra: "",
  paperWidth: 58,
  photoSourceDataUrl: null,
  photoFrameOffset: DEFAULT_PHOTO_FRAME_OFFSET,
  photoDataUrl: null,
  showTimestamp: true,
};

export const defaultCreditsTicketData: CreditsTicketData = {
  title: "Cursor Credits",
  subtitle: "",
  entries: [],
  currentIndex: 0,
  paperWidth: 58,
  showLogo: true,
  showQr: true,
  showLabel: true,
  showSubtitle: false,
  showTimestamp: true,
};

export const CREDITS_STATE_KEY = "cursor-pos-credits-state";

export function getPreviewWidthClass(paperWidth: PaperWidth): string {
  return paperWidth === 58 ? "w-[400px]" : "w-[520px]";
}

export function getPreviewShellClass(paperWidth: PaperWidth): string {
  return `${getPreviewWidthClass(paperWidth)} rounded-sm bg-white px-8 py-9 font-mono text-[14px] leading-relaxed text-black shadow-[0_24px_80px_rgba(0,0,0,0.2)]`;
}
