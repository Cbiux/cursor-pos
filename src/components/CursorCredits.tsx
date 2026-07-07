"use client";

import { LoaderCircle, Printer, RefreshCw, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { buildCreditsReceiptBuffer } from "@/lib/credits-receipt";
import { parseCreditsCsv } from "@/lib/credits-csv";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ReceiptEncoderOptions } from "@/lib/receipt";
import {
  CREDITS_STATE_KEY,
  defaultCreditsTicketData,
  type CreditsTicketData,
  type PaperWidth,
} from "@/lib/types";

interface CursorCreditsProps {
  isConnected: boolean;
  printBuffer: (buffer: Uint8Array) => Promise<void>;
  onStatus: (message: string | null) => void;
  onPreviewChange: (data: CreditsTicketData) => void;
  encoderOptions: ReceiptEncoderOptions;
}

function loadCreditsState(): CreditsTicketData {
  if (typeof window === "undefined") {
    return defaultCreditsTicketData;
  }

  try {
    const raw = window.localStorage.getItem(CREDITS_STATE_KEY);
    if (!raw) {
      return defaultCreditsTicketData;
    }

    const parsed = JSON.parse(raw) as Partial<CreditsTicketData>;
    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];

    return {
      title: parsed.title?.trim() || defaultCreditsTicketData.title,
      subtitle: parsed.subtitle?.trim() ?? defaultCreditsTicketData.subtitle,
      entries,
      currentIndex: Math.min(
        Math.max(parsed.currentIndex ?? 0, 0),
        Math.max(entries.length - 1, 0),
      ),
      paperWidth: parsed.paperWidth === 80 ? 80 : 58,
      showLogo: parsed.showLogo ?? defaultCreditsTicketData.showLogo,
      showQr: parsed.showQr ?? defaultCreditsTicketData.showQr,
      showLabel: parsed.showLabel ?? defaultCreditsTicketData.showLabel,
      showSubtitle: parsed.showSubtitle ?? defaultCreditsTicketData.showSubtitle,
      showTimestamp: parsed.showTimestamp ?? defaultCreditsTicketData.showTimestamp,
    };
  } catch {
    return defaultCreditsTicketData;
  }
}

function saveCreditsState(data: CreditsTicketData) {
  window.localStorage.setItem(CREDITS_STATE_KEY, JSON.stringify(data));
}

export function CursorCredits({
  isConnected,
  printBuffer,
  onStatus,
  onPreviewChange,
  encoderOptions,
}: CursorCreditsProps) {
  const { t } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [credits, setCredits] = useState<CreditsTicketData>(defaultCreditsTicketData);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const loaded = loadCreditsState();
    setCredits(loaded);
    onPreviewChange(loaded);
  }, [onPreviewChange]);

  useEffect(() => {
    onPreviewChange(credits);
    saveCreditsState(credits);
  }, [credits, onPreviewChange]);

  const currentEntry = credits.entries[credits.currentIndex] ?? null;
  const remaining = Math.max(credits.entries.length - credits.currentIndex, 0);

  const progressLabel = useMemo(() => {
    if (credits.entries.length === 0) {
      return t.credits.queueEmpty;
    }

    return t.credits.progress
      .replace("{current}", String(Math.min(credits.currentIndex + 1, credits.entries.length)))
      .replace("{total}", String(credits.entries.length));
  }, [credits.currentIndex, credits.entries.length, t.credits.progress, t.credits.queueEmpty]);

  function updateCredits<K extends keyof CreditsTicketData>(key: K, value: CreditsTicketData[K]) {
    setCredits((current) => ({ ...current, [key]: value }));
  }

  async function handleCsvUpload(file: File) {
    onStatus(null);

    try {
      const text = await file.text();
      const entries = parseCreditsCsv(text);

      if (entries.length === 0) {
        throw new Error(t.credits.csvEmpty);
      }

      setCredits((current) => ({
        ...current,
        entries,
        currentIndex: 0,
      }));
      onStatus(t.credits.csvLoaded.replace("{count}", String(entries.length)));
    } catch (error) {
      onStatus(error instanceof Error ? error.message : t.credits.csvError);
    }
  }

  async function handlePrintNext() {
    if (!isConnected) {
      onStatus(t.credits.printerRequired);
      return;
    }

    if (!currentEntry) {
      onStatus(t.credits.queueEmpty);
      return;
    }

    setIsPrinting(true);
    onStatus(null);

    try {
      const buffer = await buildCreditsReceiptBuffer(
        credits,
        credits.currentIndex,
        encoderOptions,
      );
      await printBuffer(buffer);

      setCredits((current) => ({
        ...current,
        currentIndex: Math.min(current.currentIndex + 1, current.entries.length),
      }));

      onStatus(
        credits.currentIndex + 1 >= credits.entries.length
          ? t.credits.printedLast
          : t.credits.printedNext,
      );
    } catch (error) {
      onStatus(error instanceof Error ? error.message : t.credits.printError);
    } finally {
      setIsPrinting(false);
    }
  }

  function handleResetQueue() {
    setCredits((current) => ({ ...current, currentIndex: 0 }));
    onStatus(t.credits.queueReset);
  }

  function handleClearQueue() {
    setCredits((current) => ({ ...current, entries: [], currentIndex: 0 }));
    onStatus(t.credits.queueCleared);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{t.credits.title}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.credits.subtitle}</p>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t.credits.titleLabel}
          </span>
          <input
            type="text"
            value={credits.title}
            onChange={(event) => updateCredits("title", event.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t.credits.subtitleLabel}
          </span>
          <input
            type="text"
            value={credits.subtitle}
            onChange={(event) => updateCredits("subtitle", event.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleCsvUpload(file);
              }
              event.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Upload className="h-4 w-4" />
            {t.credits.uploadCsv}
          </button>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t.credits.csvHint}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{progressLabel}</p>
        {currentEntry ? (
          <div className="mt-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{currentEntry.label}</p>
            <p className="mt-1 break-all text-xs text-zinc-500 dark:text-zinc-400">
              {currentEntry.claimUrl}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{t.credits.queueEmpty}</p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t.fields.paperWidth}
            </span>
            <select
              value={credits.paperWidth}
              onChange={(event) =>
                updateCredits("paperWidth", Number(event.target.value) as PaperWidth)
              }
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value={58}>58 mm</option>
              <option value={80}>80 mm</option>
            </select>
          </label>

          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">{t.credits.remainingLabel}</p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">{remaining}</p>
          </div>
        </div>

        <p className="mb-2 mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t.fields.ticketSections}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["showLogo", t.fields.includeLogo],
              ["showQr", t.fields.includeQr],
              ["showLabel", t.fields.includeName],
              ["showSubtitle", t.credits.includeSubtitle],
              ["showTimestamp", t.fields.includeTimestamp],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <input
                type="checkbox"
                checked={credits[key]}
                onChange={(event) => updateCredits(key, event.target.checked)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void handlePrintNext()}
            disabled={!isConnected || !currentEntry || isPrinting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPrinting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            {t.credits.printNext}
          </button>
          <button
            type="button"
            onClick={handleResetQueue}
            disabled={credits.entries.length === 0 || credits.currentIndex === 0}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <RefreshCw className="h-4 w-4" />
            {t.credits.resetQueue}
          </button>
        </div>

        {credits.entries.length > 0 ? (
          <button
            type="button"
            onClick={handleClearQueue}
            className="mt-3 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {t.credits.clearQueue}
          </button>
        ) : null}
      </div>
    </div>
  );
}
