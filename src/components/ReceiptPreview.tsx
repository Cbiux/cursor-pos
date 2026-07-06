"use client";

import Image from "next/image";
import QRCode from "react-qr-code";

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
  const widthClass = data.paperWidth === 58 ? "w-[220px]" : "w-[300px]";

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
            src="/logo.svg"
            alt="Logo"
            width={56}
            height={56}
            className="mb-3"
          />
          <p className="mb-4 text-xs font-semibold">{data.businessName}</p>

          <div className="mb-4 rounded bg-white p-2">
            <QRCode value={data.qrContent || " "} size={data.paperWidth === 58 ? 120 : 160} />
          </div>

          <p>{data.eventType}</p>
          <p>{data.actionLabel}</p>
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
