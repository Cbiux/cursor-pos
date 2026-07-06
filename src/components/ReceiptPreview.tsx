"use client";

import Image from "next/image";
import QRCode from "react-qr-code";

import { LOGO_SRC, getLogoPreviewSize } from "@/lib/logo-image";
import { getQrPreviewSize } from "@/lib/qr-image";
import type { ReceiptData } from "@/lib/types";

function formatTimestamp(date = new Date()): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month} ${hours}:${minutes}`;
}

interface ReceiptPreviewProps {
  data: ReceiptData;
}

export function ReceiptPreview({ data }: ReceiptPreviewProps) {
  const widthClass = data.paperWidth === 58 ? "w-[260px]" : "w-[340px]";
  const logoSize = getLogoPreviewSize(data.paperWidth);

  return (
    <div className="flex flex-col items-center">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
        Vista previa
      </p>
      <div
        className={`${widthClass} rounded-sm bg-white px-5 py-6 font-mono text-[11px] leading-relaxed text-black shadow-[0_20px_60px_rgba(0,0,0,0.18)]`}
      >
        <div className="flex flex-col items-center text-center">
          <Image
            src={LOGO_SRC}
            alt="Logo Cursor"
            width={logoSize.width}
            height={logoSize.height}
            className="mb-4"
            priority
          />
          <p className="mb-4 text-xs font-semibold">{data.businessName}</p>

          <div className="mb-4 rounded bg-white p-2">
            <QRCode value={data.qrContent || " "} size={getQrPreviewSize(data.paperWidth)} />
          </div>

          <p>{data.eventType}</p>
          <p>{data.actionLabel}</p>
          {data.nombre.trim() ? <p>{data.nombre.trim()}</p> : null}
          <p className="mb-4">{formatTimestamp()}</p>

          {data.showWifi ? (
            <div>
              <p className="font-semibold">WiFi</p>
              <p>Red: {data.wifiSsid}</p>
              <p>Clave: {data.wifiPassword}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
