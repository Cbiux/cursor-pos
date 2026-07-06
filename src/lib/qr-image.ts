import QRCode from "qrcode";

function toEscPosSize(size: number): number {
  return Math.max(8, Math.round(size / 8) * 8);
}

export function getQrPrintSize(paperWidth: 58 | 80): { width: number; height: number } {
  const size = toEscPosSize(paperWidth === 58 ? 192 : 272);
  return { width: size, height: size };
}

export function getQrPreviewSize(paperWidth: 58 | 80): number {
  return paperWidth === 58 ? 156 : 208;
}

export async function loadQrCanvas(
  content: string,
  paperWidth: 58 | 80,
): Promise<HTMLCanvasElement> {
  if (typeof window === "undefined") {
    throw new Error("El QR solo se puede generar en el navegador.");
  }

  const { width } = getQrPrintSize(paperWidth);
  const canvas = document.createElement("canvas");

  await QRCode.toCanvas(canvas, content || " ", {
    width,
    margin: 1,
    errorCorrectionLevel: "M",
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  const snappedWidth = toEscPosSize(canvas.width);
  const snappedHeight = toEscPosSize(canvas.height);

  if (canvas.width === snappedWidth && canvas.height === snappedHeight) {
    return canvas;
  }

  const normalized = document.createElement("canvas");
  normalized.width = snappedWidth;
  normalized.height = snappedHeight;

  const context = normalized.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar el canvas del QR.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, snappedWidth, snappedHeight);
  context.drawImage(canvas, 0, 0, snappedWidth, snappedHeight);

  return normalized;
}
