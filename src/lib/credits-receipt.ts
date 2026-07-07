import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";

import { getLogoPrintSize, loadLogoCanvas } from "./logo-image";
import type { ReceiptEncoderOptions } from "./receipt";
import { getQrPrintSize, loadQrCanvas } from "./qr-image";
import type { CreditsTicketData } from "./types";
import { sanitizeForPrinter } from "./text-encoding";
import { formatTicketTimestamp } from "./timestamp";

const DEFAULT_CODEPAGE_MAPPING = "pos-5890";

function columnsForWidth(paperWidth: CreditsTicketData["paperWidth"]): number {
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
  paperWidth: CreditsTicketData["paperWidth"],
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
    // Continue without logo if it fails to load.
  }
}

async function appendQr(
  encoder: ReceiptPrinterEncoder,
  content: string,
  paperWidth: CreditsTicketData["paperWidth"],
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

export async function buildCreditsReceiptBuffer(
  data: CreditsTicketData,
  entryIndex: number,
  encoderOptions?: ReceiptEncoderOptions,
): Promise<Uint8Array> {
  const entry = data.entries[entryIndex];
  if (!entry) {
    throw new Error("No credit entry available to print.");
  }

  const width = columnsForWidth(data.paperWidth);
  const timestamp = formatTicketTimestamp();
  const encoder = createEncoder(encoderOptions, width);

  const title = sanitizeForPrinter(data.title.trim() || "Cursor Credits");
  const subtitle = sanitizeForPrinter(data.subtitle.trim());
  const label = sanitizeForPrinter(entry.label.trim());

  encoder.initialize().align("center");

  if (data.showLogo) {
    await appendLogo(encoder, data.paperWidth);
  }

  encoder.bold(true).line(title).bold(false);

  if (data.showSubtitle && subtitle) {
    encoder.line(subtitle);
  }

  if (data.showQr) {
    encoder.newline();
    await appendQr(encoder, entry.claimUrl, data.paperWidth);
  }

  if (data.showLabel && label) {
    encoder.align("center").line(label);
  }

  if (data.showTimestamp) {
    encoder.line(timestamp);
  }

  encoder.newline(3).cut();

  return encoder.encode();
}
