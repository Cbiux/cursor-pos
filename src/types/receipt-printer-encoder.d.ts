declare module "@point-of-sale/receipt-printer-encoder" {
  interface QrCodeOptions {
    model?: number;
    size?: number;
    errorCorrection?: "l" | "m" | "q" | "h";
  }

  interface EncoderOptions {
    language?: string;
    width?: number;
    codepageMapping?: string;
  }

  export default class ReceiptPrinterEncoder {
    constructor(options?: EncoderOptions);
    initialize(): this;
    align(alignment: "left" | "center" | "right"): this;
    bold(enabled?: boolean): this;
    line(text: string): this;
    text(text: string): this;
    newline(count?: number): this;
    qrcode(value: string, options?: QrCodeOptions): this;
    cut(): this;
    encode(): Uint8Array;
  }
}
