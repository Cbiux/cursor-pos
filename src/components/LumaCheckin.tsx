"use client";

import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import {
  CheckCircle2,
  LoaderCircle,
  Printer,
  QrCode,
  RefreshCw,
  ScanLine,
  Square,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { buildLumaReceiptBuffer } from "@/lib/luma-receipt";
import { lumaApiFetch } from "@/lib/luma/browser-api";
import { parseLumaCheckinUrl } from "@/lib/luma/parse-checkin-url";
import { hasSessionLumaApiKey } from "@/lib/luma/storage";
import { playScanBeep } from "@/lib/scan-beep";
import {
  LUMA_CHECKIN_LOG_KEY,
  LUMA_SCAN_DEDUPE_MS,
  LUMA_SELECTED_EVENT_KEY,
  type LumaCalendarEvent,
  type LumaCheckinEntry,
  type LumaGuestSummary,
  type LumaReceiptData,
} from "@/lib/luma/types";
import {
  loadLumaPrintSettings,
  resolveLumaQrContent,
  saveLumaPrintSettings,
  type LumaPrintSettings,
} from "@/lib/luma/print-settings";
import { useLocale } from "@/lib/i18n/locale-context";
import { ConnectLuma } from "@/components/ConnectLuma";
import type { ReceiptEncoderOptions } from "@/lib/receipt";
import type { PaperWidth } from "@/lib/types";

interface LumaCheckinProps {
  isConnected: boolean;
  paperWidth: PaperWidth;
  showTimestamp: boolean;
  defaultQrContent: string;
  defaultEventName: string;
  defaultGuestName: string;
  onPaperWidthChange: (value: PaperWidth) => void;
  onShowTimestampChange: (value: boolean) => void;
  printBuffer: (buffer: Uint8Array) => Promise<void>;
  onStatus: (message: string | null) => void;
  onPreviewReceiptChange: (data: LumaReceiptData) => void;
  encoderOptions: ReceiptEncoderOptions;
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

type LumaAuthMode = "loading" | "required" | "session" | "server";

interface PendingScan {
  guest: LumaGuestSummary;
  entryId: string;
  dedupeKey: string;
}

function loadStoredEventId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(LUMA_SELECTED_EVENT_KEY) ?? "";
}

function loadStoredLog(): LumaCheckinEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LUMA_CHECKIN_LOG_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as LumaCheckinEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredLog(entries: LumaCheckinEntry[]) {
  window.localStorage.setItem(LUMA_CHECKIN_LOG_KEY, JSON.stringify(entries.slice(0, 50)));
}

function saveStoredEventId(eventId: string) {
  window.localStorage.setItem(LUMA_SELECTED_EVENT_KEY, eventId);
}

function formatEventLabel(event: LumaCalendarEvent, locale: string): string {
  const date = event.startAt
    ? new Intl.DateTimeFormat(locale === "es" ? "es-CR" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(event.startAt))
    : null;

  return date ? `${event.name} · ${date}` : event.name;
}

export function LumaCheckin({
  isConnected,
  paperWidth,
  showTimestamp,
  onPaperWidthChange,
  onShowTimestampChange,
  printBuffer,
  onStatus,
  onPreviewReceiptChange,
  defaultQrContent,
  defaultEventName,
  defaultGuestName,
  encoderOptions,
}: LumaCheckinProps) {
  const { t, locale } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<BrowserQRCodeReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const processingRef = useRef(false);
  const lastScanRef = useRef<{ key: string; at: number } | null>(null);

  const [events, setEvents] = useState<LumaCalendarEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logEntries, setLogEntries] = useState<LumaCheckinEntry[]>([]);
  const [reprintingId, setReprintingId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<LumaAuthMode>("loading");
  const [authRefreshKey, setAuthRefreshKey] = useState(0);
  const [serverConfigured, setServerConfigured] = useState(false);
  const [pendingScan, setPendingScan] = useState<PendingScan | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [printSettings, setPrintSettings] = useState<LumaPrintSettings>(() =>
    loadLumaPrintSettings(defaultQrContent),
  );

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  useEffect(() => {
    setLogEntries(loadStoredLog());
    setSelectedEventId(loadStoredEventId());
  }, []);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/luma/status")
      .then((response) => response.json())
      .then((payload: { serverConfigured?: boolean }) => {
        if (!cancelled) {
          setServerConfigured(Boolean(payload.serverConfigured));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setServerConfigured(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setIsLoadingEvents(true);
      setError(null);

      try {
        const response = await lumaApiFetch("/api/luma/events");
        const payload = (await response.json()) as {
          events?: LumaCalendarEvent[];
          error?: string;
        };

        if (!response.ok) {
          if (response.status === 503 && !hasSessionLumaApiKey()) {
            if (!cancelled) {
              setAuthMode("required");
              setEvents([]);
              setSelectedEventId("");
            }
            return;
          }

          throw new Error(payload.error ?? t.luma.eventsLoadError);
        }

        if (cancelled) {
          return;
        }

        setAuthMode(hasSessionLumaApiKey() ? "session" : "server");

        const nextEvents = payload.events ?? [];
        setEvents(nextEvents);

        const storedEventId = loadStoredEventId();
        if (storedEventId && nextEvents.some((event) => event.id === storedEventId)) {
          setSelectedEventId(storedEventId);
        } else if (nextEvents[0]) {
          setSelectedEventId(nextEvents[0].id);
        } else {
          setSelectedEventId("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : t.luma.eventsLoadError,
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingEvents(false);
        }
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, [authRefreshKey, t.luma.eventsLoadError]);

  useEffect(() => {
    if (selectedEventId) {
      saveStoredEventId(selectedEventId);
    }
  }, [selectedEventId]);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    setPrintSettings((current) => ({
      ...current,
      customQrContent: current.customQrContent || defaultQrContent,
      showTimestamp,
    }));
  }, [defaultQrContent, showTimestamp]);

  useEffect(() => {
    saveLumaPrintSettings(printSettings);
  }, [printSettings]);

  const buildPreviewReceiptData = useCallback(
    (guest?: LumaGuestSummary): LumaReceiptData => {
      const subject = guest ?? pendingScan?.guest;

      return {
        eventName: subject?.eventName ?? selectedEvent?.name ?? defaultEventName,
        guestName: subject?.name ?? defaultGuestName,
        ticketName: subject?.ticketName ?? null,
        qrContent: resolveLumaQrContent(
          printSettings,
          subject?.checkinUrl ?? "",
          defaultQrContent,
        ),
        actionLabel: printSettings.actionLabel,
        paperWidth,
        showLogo: printSettings.showLogo,
        showQr: printSettings.showQr,
        showActionLabel: printSettings.showActionLabel,
        showTicketName: printSettings.showTicketName,
        showTimestamp: printSettings.showTimestamp,
      };
    },
    [
      pendingScan,
      printSettings,
      paperWidth,
      defaultQrContent,
      defaultEventName,
      defaultGuestName,
      selectedEvent,
    ],
  );

  useEffect(() => {
    onPreviewReceiptChange(buildPreviewReceiptData());
  }, [buildPreviewReceiptData, onPreviewReceiptChange]);

  async function buildAndPrintGuest(guest: LumaGuestSummary) {
    const receiptData = buildPreviewReceiptData(guest);
    const buffer = await buildLumaReceiptBuffer(receiptData, encoderOptions);
    await printBuffer(buffer);
  }

  function updatePrintSettings<K extends keyof LumaPrintSettings>(
    key: K,
    value: LumaPrintSettings[K],
  ) {
    setPrintSettings((current) => ({ ...current, [key]: value }));
  }

  function appendLogEntry(entry: LumaCheckinEntry) {
    setLogEntries((current) => {
      const next = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 50);
      saveStoredLog(next);
      return next;
    });
  }

  async function processScan(rawValue: string) {
    if (processingRef.current || pendingScan) {
      if (pendingScan) {
        onStatus(t.luma.discardPendingFirst);
      }
      return;
    }

    const parsed = parseLumaCheckinUrl(rawValue);
    if (!parsed) {
      onStatus(t.luma.invalidQr);
      return;
    }

    if (selectedEventId && parsed.eventId !== selectedEventId) {
      onStatus(t.luma.eventMismatch);
      return;
    }

    const dedupeKey = `${parsed.eventId}:${parsed.pk}`;
    const now = Date.now();
    if (
      lastScanRef.current &&
      lastScanRef.current.key === dedupeKey &&
      now - lastScanRef.current.at < LUMA_SCAN_DEDUPE_MS
    ) {
      return;
    }

    lastScanRef.current = { key: dedupeKey, at: now };
    processingRef.current = true;
    setIsProcessing(true);
    onStatus(null);
    setError(null);

    try {
      const params = new URLSearchParams({
        event_id: parsed.eventId,
        pk: parsed.pk,
        checkin_url: parsed.checkinUrl,
      });

      if (selectedEvent?.name) {
        params.set("event_name", selectedEvent.name);
      }

      const response = await lumaApiFetch(`/api/luma/guest?${params.toString()}`);
      const payload = (await response.json()) as {
        guest?: LumaGuestSummary;
        error?: string;
      };

      if (!response.ok || !payload.guest) {
        throw new Error(payload.error ?? t.luma.guestLoadError);
      }

      const guest = payload.guest;
      playScanBeep();
      setPendingScan({
        guest,
        entryId: `${dedupeKey}:${now}`,
        dedupeKey,
      });
      onStatus(t.luma.scannedReady);
    } catch (scanError) {
      onStatus(scanError instanceof Error ? scanError.message : t.luma.scanProcessError);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }

  function discardPendingScan() {
    setPendingScan(null);
    onStatus(null);
  }

  async function confirmPendingScan() {
    if (!pendingScan || isConfirming) {
      return;
    }

    if (!isConnected) {
      onStatus(t.luma.printerRequired);
      return;
    }

    const { guest, entryId } = pendingScan;
    setIsConfirming(true);
    onStatus(null);

    let printed = false;
    let entryError: string | null = null;

    try {
      await buildAndPrintGuest(guest);
      printed = true;

      appendLogEntry({
        id: entryId,
        guestId: guest.guestId,
        name: guest.name,
        ticketName: guest.ticketName,
        scannedAt: new Date().toISOString(),
        printed,
        error: entryError,
        qrContent: buildPreviewReceiptData(guest).qrContent,
        eventName: guest.eventName,
      });

      setPendingScan(null);
      onStatus(t.luma.scannedPrinted);
    } catch (printError) {
      onStatus(printError instanceof Error ? printError.message : t.luma.printError);
    } finally {
      setIsConfirming(false);
    }
  }

  async function startScanning() {
    if (!selectedEventId) {
      setError(t.luma.selectEventFirst);
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    setError(null);
    onStatus(null);

    try {
      const reader = scannerRef.current ?? new BrowserQRCodeReader();
      scannerRef.current = reader;

      const devices = await BrowserQRCodeReader.listVideoInputDevices();
      const nextCameras = devices.map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label.trim() || `${t.camera.cameraDefault} ${index + 1}`,
      }));

      setCameras(nextCameras);

      const preferredDeviceId =
        selectedCameraId && nextCameras.some((camera) => camera.deviceId === selectedCameraId)
          ? selectedCameraId
          : nextCameras.find((camera) => /back|rear|environment/i.test(camera.label))?.deviceId ??
            nextCameras[0]?.deviceId ??
            undefined;

      if (preferredDeviceId) {
        setSelectedCameraId(preferredDeviceId);
      }

      controlsRef.current?.stop();
      controlsRef.current = await reader.decodeFromVideoDevice(
        preferredDeviceId,
        video,
        (result) => {
          if (!result) {
            return;
          }

          void processScan(result.getText());
        },
      );

      setIsScanning(true);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : t.luma.scannerStartError);
      setIsScanning(false);
    }
  }

  function stopScanning() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setIsScanning(false);
  }

  async function handleReprint(entry: LumaCheckinEntry) {
    if (!isConnected) {
      onStatus(t.luma.printerRequired);
      return;
    }

    setReprintingId(entry.id);
    onStatus(null);

    try {
      await buildAndPrintGuest({
        guestId: entry.guestId,
        scanKey: entry.guestId,
        name: entry.name,
        email: "",
        ticketName: entry.ticketName,
        checkedIn: false,
        eventId: selectedEventId,
        eventName: entry.eventName,
        checkinUrl: entry.qrContent,
        approvalStatus: "approved",
      });
      onStatus(t.luma.reprinted);
    } catch (reprintError) {
      onStatus(reprintError instanceof Error ? reprintError.message : t.luma.printError);
    } finally {
      setReprintingId(null);
    }
  }

  async function handleCameraChange(deviceId: string) {
    setSelectedCameraId(deviceId);
    if (!isScanning) {
      return;
    }

    stopScanning();
    await startScanning();
  }

  function handleCalendarConnected() {
    setAuthRefreshKey((current) => current + 1);
  }

  function handleCalendarDisconnected() {
    stopScanning();
    setPendingScan(null);
    setAuthRefreshKey((current) => current + 1);
  }

  if (authMode === "loading") {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        {t.luma.loadingEvents}
      </div>
    );
  }

  if (authMode === "required") {
    return (
      <ConnectLuma
        layout="gate"
        serverConfigured={serverConfigured}
        onConnected={handleCalendarConnected}
      />
    );
  }

  return (
    <div className="space-y-4">
      <ConnectLuma
        layout="settings"
        serverConfigured={serverConfigured}
        onConnected={handleCalendarConnected}
        onDisconnected={handleCalendarDisconnected}
      />
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{t.luma.title}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.luma.subtitle}</p>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t.luma.eventLabel}
          </span>
          <select
            value={selectedEventId}
            disabled={isLoadingEvents || isScanning}
            onChange={(event) => setSelectedEventId(event.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingEvents ? (
              <option value="">{t.luma.loadingEvents}</option>
            ) : events.length === 0 ? (
              <option value="">{t.luma.noEvents}</option>
            ) : (
              events.map((event) => (
                <option key={event.id} value={event.id}>
                  {formatEventLabel(event, locale)}
                </option>
              ))
            )}
          </select>
        </label>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t.fields.paperWidth}
            </span>
            <select
              value={paperWidth}
              disabled={isScanning}
              onChange={(event) =>
                onPaperWidthChange(Number(event.target.value) as PaperWidth)
              }
              className="w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value={58}>58 mm</option>
              <option value={80}>80 mm</option>
            </select>
          </label>

          <label className="flex items-end gap-3 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-3">
            <input
              type="checkbox"
              checked={showTimestamp}
              disabled={isScanning}
              onChange={(event) => onShowTimestampChange(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t.fields.includeTimestamp}
            </span>
          </label>
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {t.luma.badgeSettingsTitle}
          </p>
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{t.luma.badgeSettingsHint}</p>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
              <input
                type="radio"
                name="luma-qr-source"
                checked={printSettings.qrSource === "custom"}
                onChange={() => updatePrintSettings("qrSource", "custom")}
                className="h-4 w-4"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{t.luma.qrSourceCustom}</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
              <input
                type="radio"
                name="luma-qr-source"
                checked={printSettings.qrSource === "guest"}
                onChange={() => updatePrintSettings("qrSource", "guest")}
                className="h-4 w-4"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{t.luma.qrSourceGuest}</span>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t.luma.badgeQrLabel}
            </span>
            <input
              type="text"
              value={printSettings.customQrContent}
              disabled={printSettings.qrSource === "guest" || !printSettings.showQr}
              onChange={(event) => updatePrintSettings("customQrContent", event.target.value)}
              placeholder={defaultQrContent || t.placeholders.qrContent}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t.fields.actionLabel}
            </span>
            <input
              type="text"
              value={printSettings.actionLabel}
              disabled={!printSettings.showActionLabel}
              onChange={(event) => updatePrintSettings("actionLabel", event.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>

          <p className="mb-2 mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t.fields.ticketSections}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["showLogo", t.fields.includeLogo],
                ["showQr", t.fields.includeQr],
                ["showActionLabel", t.fields.includeActionLabel],
                ["showTicketName", t.luma.includeTicketName],
                ["showTimestamp", t.fields.includeTimestamp],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <input
                  type="checkbox"
                  checked={printSettings[key]}
                  onChange={(event) => updatePrintSettings(key, event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {t.luma.scannerTitle}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {pendingScan
                ? t.luma.scannerPausedHint
                : isScanning
                  ? isProcessing
                    ? t.luma.processing
                    : t.luma.scannerActiveHint
                  : t.luma.scannerIdleHint}
            </p>
          </div>
          {isProcessing ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              {t.luma.processing}
            </span>
          ) : pendingScan ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t.luma.confirmTitle}
            </span>
          ) : isScanning ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800 dark:bg-sky-950 dark:text-sky-200">
              <ScanLine className="h-3.5 w-3.5 animate-pulse" />
              {t.luma.scannerWaitingHint}
            </span>
          ) : null}
        </div>

        {cameras.length > 0 ? (
          <label className="mb-3 block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t.camera.cameraLabel}
            </span>
            <select
              value={selectedCameraId}
              disabled={!isScanning || cameras.length < 2}
              onChange={(event) => void handleCameraChange(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cameras.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-black dark:border-zinc-700">
          <video
            ref={videoRef}
            className="aspect-[4/3] w-full object-cover"
            autoPlay
            playsInline
            muted
          />
          {!isScanning ? (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/70 px-6 text-center text-sm text-zinc-200">
              {t.luma.scannerStoppedHint}
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6">
              <div
                className={`relative aspect-square w-[min(72vw,18rem)] rounded-2xl border-2 ${
                  pendingScan
                    ? "border-amber-300/80"
                    : isProcessing
                      ? "border-amber-300/80"
                      : "border-emerald-300/90"
                }`}
              >
                <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-white/90" />
                <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-white/90" />
                <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-white/90" />
                <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-white/90" />
                {!pendingScan && !isProcessing ? (
                  <span className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-emerald-300/90" />
                ) : null}
              </div>
              <p className="mt-4 max-w-xs text-center text-sm font-medium text-white drop-shadow">
                {pendingScan
                  ? t.luma.scannerPausedHint
                  : isProcessing
                    ? t.luma.processing
                    : t.luma.scannerWaitingHint}
              </p>
            </div>
          )}
        </div>

        {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          {!isScanning ? (
            <button
              type="button"
              onClick={() => void startScanning()}
              disabled={!selectedEventId || isLoadingEvents || isProcessing}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ScanLine className="h-4 w-4" />
              {t.luma.startScan}
            </button>
          ) : (
            <button
              type="button"
              onClick={stopScanning}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-200 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <Square className="h-4 w-4" />
              {t.luma.stopScan}
            </button>
          )}
        </div>
      </div>

      {pendingScan ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
          <div className="mb-4">
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              {t.luma.confirmTitle}
            </p>
            <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
              {t.luma.confirmHint}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200/80 bg-white px-4 py-4 dark:border-emerald-900 dark:bg-zinc-900">
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {pendingScan.guest.name}
            </p>
            {pendingScan.guest.email ? (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {pendingScan.guest.email}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {pendingScan.guest.ticketName ? (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  {pendingScan.guest.ticketName}
                </span>
              ) : null}
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {t.luma.approvalLabel}: {pendingScan.guest.approvalStatus}
              </span>
              {pendingScan.guest.checkedIn ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  {t.luma.alreadyCheckedIn}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void confirmPendingScan()}
              disabled={!isConnected || isConfirming}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isConfirming ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              {t.luma.confirmPrint}
            </button>
            <button
              type="button"
              onClick={discardPendingScan}
              disabled={isConfirming}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-900 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
              {t.luma.confirmDiscard}
            </button>
          </div>

          {!isConnected ? (
            <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
              {t.luma.printerRequired}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{t.luma.logTitle}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.luma.logHint}</p>
          </div>
          <QrCode className="h-5 w-5 text-zinc-400" />
        </div>

        {logEntries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            {t.luma.logEmpty}
          </p>
        ) : (
          <div className="space-y-2">
            {logEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {entry.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Intl.DateTimeFormat(locale === "es" ? "es-CR" : "en-US", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    }).format(new Date(entry.scannedAt))}
                    {entry.ticketName ? ` · ${entry.ticketName}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {entry.printed
                      ? t.luma.statusPrinted
                      : entry.error
                        ? t.luma.statusPrintFailed
                        : t.luma.statusAwaitingPrint}
                    {entry.error ? ` · ${entry.error}` : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleReprint(entry)}
                  disabled={!isConnected || reprintingId === entry.id}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {reprintingId === entry.id ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Printer className="h-4 w-4" />
                  )}
                  {t.luma.reprint}
                </button>
              </div>
            ))}
          </div>
        )}

        {logEntries.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setLogEntries([]);
              saveStoredLog([]);
            }}
            className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <RefreshCw className="h-4 w-4" />
            {t.luma.clearLog}
          </button>
        ) : null}
      </div>
    </div>
  );
}
