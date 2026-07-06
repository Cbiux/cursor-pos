import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";

import type { ReceiptData } from "./types";

export interface ReceiptEncoderOptions {
  language?: string;
  codepageMapping?: string;
}

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

export function buildReceiptBuffer(
  data: ReceiptData,
  encoderOptions?: ReceiptEncoderOptions,
): Uint8Array {
  const width = columnsForWidth(data.paperWidth);
  const timestamp = formatTimestamp();

  const encoder = new ReceiptPrinterEncoder({
    language: encoderOptions?.language ?? "esc-pos",
    codepageMapping: encoderOptions?.codepageMapping,
    width,
  });

  encoder.initialize().align("center").bold(true).line(data.businessName).bold(false);

  encoder
    .newline()
    .qrcode(data.qrContent, {
      model: 2,
      size: data.paperWidth === 58 ? 6 : 8,
      errorCorrection: "m",
    })
    .newline();

  encoder.align("center").line(data.eventType).line(data.actionLabel).line(timestamp);

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
