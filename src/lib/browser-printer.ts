export type PrinterTransport = "serial" | "usb";

export interface StoredPrinterDevice {
  transport: PrinterTransport;
  vendorId?: number | null;
  productId?: number | null;
  serialNumber?: string;
  manufacturerName?: string;
  productName?: string;
  language?: string | null;
  codepageMapping?: string | null;
  baudRate?: number;
  label: string;
}

export interface BrowserPrinterSupport {
  serial: boolean;
  usb: boolean;
  secureContext: boolean;
}

const STORAGE_KEY = "cursor-pos-printer";

export function getBrowserPrinterSupport(): BrowserPrinterSupport {
  return {
    serial: typeof navigator !== "undefined" && "serial" in navigator,
    usb: typeof navigator !== "undefined" && "usb" in navigator,
    secureContext:
      typeof window !== "undefined" ? window.isSecureContext : false,
  };
}

export function loadStoredPrinter(): StoredPrinterDevice | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPrinterDevice) : null;
  } catch {
    return null;
  }
}

export function saveStoredPrinter(device: StoredPrinterDevice): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(device));
}

export function clearStoredPrinter(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function downloadReceiptBuffer(buffer: Uint8Array): void {
  const blob = new Blob([Uint8Array.from(buffer)], {
    type: "application/octet-stream",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ticket.bin";
  anchor.click();
  URL.revokeObjectURL(url);
}
