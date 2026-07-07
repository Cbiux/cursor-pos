export type LumaQrSource = "custom" | "guest";

export interface LumaPrintSettings {
  qrSource: LumaQrSource;
  customQrContent: string;
  actionLabel: string;
  showLogo: boolean;
  showQr: boolean;
  showActionLabel: boolean;
  showTicketName: boolean;
  showTimestamp: boolean;
}

export const LUMA_PRINT_SETTINGS_KEY = "cursor-pos-luma-print-settings";

export const defaultLumaPrintSettings: LumaPrintSettings = {
  qrSource: "custom",
  customQrContent: "",
  actionLabel: "Check-in",
  showLogo: true,
  showQr: true,
  showActionLabel: true,
  showTicketName: true,
  showTimestamp: true,
};

export function loadLumaPrintSettings(fallbackQrContent = ""): LumaPrintSettings {
  if (typeof window === "undefined") {
    return {
      ...defaultLumaPrintSettings,
      customQrContent: fallbackQrContent,
    };
  }

  try {
    const raw = window.localStorage.getItem(LUMA_PRINT_SETTINGS_KEY);
    if (!raw) {
      return {
        ...defaultLumaPrintSettings,
        customQrContent: fallbackQrContent,
      };
    }

    const parsed = JSON.parse(raw) as Partial<LumaPrintSettings>;
    return {
      qrSource: parsed.qrSource === "guest" ? "guest" : "custom",
      customQrContent: parsed.customQrContent?.trim() || fallbackQrContent,
      actionLabel: parsed.actionLabel?.trim() || defaultLumaPrintSettings.actionLabel,
      showLogo: parsed.showLogo ?? defaultLumaPrintSettings.showLogo,
      showQr: parsed.showQr ?? defaultLumaPrintSettings.showQr,
      showActionLabel: parsed.showActionLabel ?? defaultLumaPrintSettings.showActionLabel,
      showTicketName: parsed.showTicketName ?? defaultLumaPrintSettings.showTicketName,
      showTimestamp: parsed.showTimestamp ?? defaultLumaPrintSettings.showTimestamp,
    };
  } catch {
    return {
      ...defaultLumaPrintSettings,
      customQrContent: fallbackQrContent,
    };
  }
}

export function saveLumaPrintSettings(settings: LumaPrintSettings) {
  window.localStorage.setItem(LUMA_PRINT_SETTINGS_KEY, JSON.stringify(settings));
}

export function resolveLumaQrContent(
  settings: LumaPrintSettings,
  guestCheckinUrl: string,
  fallbackQrContent: string,
): string {
  if (settings.qrSource === "guest" && guestCheckinUrl.trim()) {
    return guestCheckinUrl.trim();
  }

  return settings.customQrContent.trim() || fallbackQrContent.trim() || guestCheckinUrl.trim();
}
