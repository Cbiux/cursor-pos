import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";

import { getLogoPrintSize, loadLogoCanvas } from "./logo-image";
import type { ReceiptData } from "./types";

export interface ReceiptEncoderOptions {
  language?: string;
  codepageMapping?: string;
}

const DEFAULT_CODEPAGE_MAPPING = "pos-5890";

function columnsForWidth(paperWidth: ReceiptData["paperWidth"]): number {
  return paperWidth === 58 ? 32 : 48;
}

function formatTimestamp(date = new Date()): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month} ${hours}:${minutes}`;
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

export async function buildReceiptBuffer(
  data: ReceiptData,
  encoderOptions?: ReceiptEncoderOptions,
): Promise<Uint8Array> {
  const width = columnsForWidth(data.paperWidth);
  const timestamp = formatTimestamp();
  const encoder = createEncoder(encoderOptions, width);

  encoder.initialize().codepage("windows1252").align("center");
  await appendLogo(encoder, data.paperWidth);

  encoder.bold(true).line(data.businessName).bold(false);

  encoder
    .newline()
    .qrcode(data.qrContent, {
      model: 2,
      size: data.paperWidth === 58 ? 6 : 8,
      errorCorrection: "m",
    })
    .newline();

  encoder.align("center").line(data.eventType).line(data.actionLabel);

  if (data.nombre.trim()) {
    encoder.line(data.nombre.trim());
  }

  encoder.line(timestamp);

  if (data.showWifi) {
    encoder
      .newline()
      .align("center")
      .bold(true)
      .line("WiFi")
      .bold(false)
      .line(`Red: ${data.wifiSsid}`)
      .line(`Clave: ${data.wifiPassword}`);
  }

  encoder.newline(3).cut();

  return encoder.encode();
}
