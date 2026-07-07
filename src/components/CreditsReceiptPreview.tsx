"use client";

import Image from "next/image";
import QRCode from "react-qr-code";

import { useLocale } from "@/lib/i18n/locale-context";
import { LOGO_SRC, getLogoPreviewSize } from "@/lib/logo-image";
import { getQrPreviewSize } from "@/lib/qr-image";
import { formatTicketTimestamp } from "@/lib/timestamp";
import { getPreviewShellClass, type CreditsTicketData } from "@/lib/types";

interface CreditsReceiptPreviewProps {
  data: CreditsTicketData;
}

export function CreditsReceiptPreview({ data }: CreditsReceiptPreviewProps) {
  const { t } = useLocale();
  const shellClass = getPreviewShellClass(data.paperWidth);
  const logoSize = getLogoPreviewSize(data.paperWidth);
  const current = data.entries[data.currentIndex] ?? null;

  return (
    <div className="flex w-full flex-col items-center">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        {t.app.preview}
      </p>
      <div className={shellClass}>
        <div className="flex flex-col items-center text-center">
          {data.showLogo ? (
            <Image
              src={LOGO_SRC}
              alt="Logo Cursor"
              width={logoSize.width}
              height={logoSize.height}
              className="mb-5"
              priority
            />
          ) : null}
          <p className="mb-5 text-base font-semibold">{data.title}</p>

          {data.showSubtitle && data.subtitle.trim() ? <p>{data.subtitle.trim()}</p> : null}

          {data.showQr && current ? (
            <div className="mb-5 rounded bg-white p-2">
              <QRCode value={current.claimUrl} size={getQrPreviewSize(data.paperWidth)} />
            </div>
          ) : null}

          {data.showLabel && current?.label ? <p>{current.label}</p> : null}
          {data.showTimestamp ? <p className="mb-4">{formatTicketTimestamp()}</p> : null}

          {!current ? (
            <p className="text-zinc-500">{t.credits.previewEmpty}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
