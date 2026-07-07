import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";

import { getLogoPrintSize, loadLogoCanvas } from "./logo-image";
import { getQrPrintSize, loadQrCanvas } from "./qr-image";
import { sanitizeForPrinter } from "./text-encoding";
import { formatTicketTimestamp } from "./timestamp";
import type { ReceiptData } from "./types";

export interface ReceiptEncoderOptions {
  language?: string;
  codepageMapping?: string;
}

const DEFAULT_CODEPAGE_MAPPING = "pos-5890";

function columnsForWidth(paperWidth: ReceiptData["paperWidth"]): number {
  return paperWidth === 58 ? 32 : 48;
}

function createEncoder(encoderOptions?: ReceiptEncoderOptions, width?: number) {
  return new ReceiptPrinterEncoder({
    language: encoderOptions?.language ?? "esc-pos",
    width: width ?? 32,
    codepageMapping: encoderOptions?.codepageMapping ?? DEFAULT_CODEPAGE_MAPPING,
  });
}

async function appendLogo(
  encoder: ReceiptPrinterEncoder,
  paperWidth: ReceiptData["paperWidth"],
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const logo = await loadLogoCanvas(paperWidth);
    const size = getLogoPrintSize(paperWidth);
    encoder
      .align("center")
      .image(logo, size.width, size.height, "threshold", 160)
      .newline();
  } catch {
    // Si el logo no carga, continuar sin bloquear la impresión.
  }
}

async function appendQr(
  encoder: ReceiptPrinterEncoder,
  content: string,
  paperWidth: ReceiptData["paperWidth"],
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const qr = await loadQrCanvas(content, paperWidth);
    const size = getQrPrintSize(paperWidth);
    encoder
      .align("center")
      .image(qr, size.width, size.height, "threshold", 128)
      .newline();
  } catch {
    encoder.align("center").line(sanitizeForPrinter(content)).newline();
  }
}

export async function buildReceiptBuffer(
  data: ReceiptData,
  encoderOptions?: ReceiptEncoderOptions,
): Promise<Uint8Array> {
  const width = columnsForWidth(data.paperWidth);
  const timestamp = formatTicketTimestamp();
  const encoder = createEncoder(encoderOptions, width);

  const businessName = sanitizeForPrinter(data.businessName);
  const eventType = sanitizeForPrinter(data.eventType);
  const actionLabel = sanitizeForPrinter(data.actionLabel);
  const nombre = sanitizeForPrinter(data.nombre.trim());
  const extra = sanitizeForPrinter(data.extra.trim());
  const wifiSsid = sanitizeForPrinter(data.wifiSsid);
  const wifiPassword = sanitizeForPrinter(data.wifiPassword);

  encoder.initialize().align("center");

  if (data.showLogo) {
    await appendLogo(encoder, data.paperWidth);
  }

  encoder.bold(true).line(businessName).bold(false);

  if (data.showQr) {
    encoder.newline();
    await appendQr(encoder, data.qrContent, data.paperWidth);
  }

  encoder.align("center");

  if (data.showEventType) {
    encoder.line(eventType);
  }

  if (data.showActionLabel) {
    encoder.line(actionLabel);
  }

  if (data.showNombre && nombre) {
    encoder.line(nombre);
  }

  if (data.showExtra && extra) {
    encoder.line(extra);
  }

  if (data.showTimestamp) {
    encoder.line(timestamp);
  }

  if (data.showWifi) {
    encoder
      .newline()
      .align("center")
      .bold(true)
      .line("WiFi")
      .bold(false)
      .line(`Red: ${wifiSsid}`)
      .line(`Clave: ${wifiPassword}`);
  }

  encoder.newline(3).cut();

  return encoder.encode();
}
