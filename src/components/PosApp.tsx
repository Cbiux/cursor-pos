"use client";

import {
  Cable,
  Camera,
  Coins,
  Download,
  LoaderCircle,
  PlugZap,
  Printer,
  QrCode,
  Save,
  Ticket,
  Unplug,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppTopBar } from "@/components/AppTopBar";
import { CameraCapture } from "@/components/CameraCapture";
import { CreditsReceiptPreview } from "@/components/CreditsReceiptPreview";
import { CursorCredits } from "@/components/CursorCredits";
import { DocsFooterLink } from "@/components/DocsBackLink";
import { LumaCheckin } from "@/components/LumaCheckin";
import { LumaReceiptPreview } from "@/components/LumaReceiptPreview";
import { PhotoReceiptPreview } from "@/components/PhotoReceiptPreview";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { useBrowserPrinter } from "@/hooks/useBrowserPrinter";
import { useLocale } from "@/lib/i18n/locale-context";
import { downloadReceiptBuffer } from "@/lib/browser-printer";
import { buildPhotoReceiptBuffer } from "@/lib/photo-receipt";
import { loadReceiptDefaults, saveReceiptDefaults } from "@/lib/receipt-defaults";
import { buildReceiptBuffer } from "@/lib/receipt";
import type { LumaReceiptData } from "@/lib/luma/types";
import {
  type PaperWidth,
  defaultCreditsTicketData,
  defaultPhotoTicketData,
  defaultReceiptData,
  type CreditsTicketData,
  type PhotoTicketData,
  type ReceiptData,
  type TicketMode,
} from "@/lib/types";

type FieldKey = keyof ReceiptData;

export function PosApp() {
  const { t } = useLocale();
  const [mode, setMode] = useState<TicketMode>("event");
  const [receipt, setReceipt] = useState<ReceiptData>(defaultReceiptData);
  const [photoTicket, setPhotoTicket] = useState<PhotoTicketData>(defaultPhotoTicketData);
  const [lumaPreviewReceipt, setLumaPreviewReceipt] = useState<LumaReceiptData | null>(null);
  const [creditsPreview, setCreditsPreview] = useState<CreditsTicketData>(defaultCreditsTicketData);
  const [status, setStatus] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const {
    support,
    device,
    isConnected,
    isConnecting,
    baudRate,
    setBaudRate,
    connect,
    disconnect,
    print,
  } = useBrowserPrinter();

  const textFields = useMemo(
    () =>
      [
        { key: "businessName" as const, label: t.fields.businessName, placeholder: t.placeholders.businessName },
        { key: "nombre" as const, label: t.fields.nombre, placeholder: t.placeholders.nombre },
        { key: "extra" as const, label: t.fields.extra, placeholder: t.placeholders.extra },
        { key: "qrContent" as const, label: t.fields.qrContent, placeholder: t.placeholders.qrContent },
        { key: "eventType" as const, label: t.fields.eventType, placeholder: t.placeholders.eventType },
        { key: "actionLabel" as const, label: t.fields.actionLabel, placeholder: t.placeholders.actionLabel },
        { key: "wifiSsid" as const, label: t.fields.wifiSsid, placeholder: t.placeholders.wifiSsid },
        { key: "wifiPassword" as const, label: t.fields.wifiPassword, placeholder: t.placeholders.wifiPassword },
      ] satisfies Array<{ key: FieldKey; label: string; placeholder: string }>,
    [t],
  );

  const handleCreditsPreviewChange = useCallback((data: CreditsTicketData) => {
    setCreditsPreview(data);
  }, []);

  const handleLumaPreviewChange = useCallback((data: LumaReceiptData) => {
    setLumaPreviewReceipt(data);
  }, []);

  function isFieldDisabled(key: FieldKey): boolean {
    switch (key) {
      case "qrContent":
        return !receipt.showQr;
      case "eventType":
        return !receipt.showEventType;
      case "actionLabel":
        return !receipt.showActionLabel;
      case "nombre":
        return !receipt.showNombre;
      case "extra":
        return !receipt.showExtra;
      case "wifiSsid":
      case "wifiPassword":
        return !receipt.showWifi;
      default:
        return false;
    }
  }

  useEffect(() => {
    const saved = loadReceiptDefaults();
    setReceipt(saved);
    setPhotoTicket((current) => ({
      ...current,
      nombre: saved.nombre,
      extra: saved.extra,
      paperWidth: saved.paperWidth,
      showTimestamp: saved.showTimestamp,
    }));
  }, []);

  useEffect(() => {
    setStatus(null);
    if (mode !== "luma") {
      setLumaPreviewReceipt(null);
    }
  }, [mode]);

  function updateField<K extends FieldKey>(key: K, value: ReceiptData[K]) {
    setReceipt((current) => ({ ...current, [key]: value }));

    if (key === "nombre" || key === "extra" || key === "paperWidth" || key === "showTimestamp") {
      setPhotoTicket((current) => ({
        ...current,
        ...(key === "nombre" ? { nombre: value as string } : {}),
        ...(key === "extra" ? { extra: value as string } : {}),
        ...(key === "paperWidth" ? { paperWidth: value as PaperWidth } : {}),
        ...(key === "showTimestamp" ? { showTimestamp: value as boolean } : {}),
      }));
    }
  }

  function updatePhotoField<K extends keyof PhotoTicketData>(key: K, value: PhotoTicketData[K]) {
    setPhotoTicket((current) => ({ ...current, [key]: value }));

    if (key === "nombre") {
      setReceipt((current) => ({ ...current, nombre: value as string }));
    }
    if (key === "extra") {
      setReceipt((current) => ({ ...current, extra: value as string }));
    }
    if (key === "paperWidth") {
      setReceipt((current) => ({ ...current, paperWidth: value as PaperWidth }));
    }
    if (key === "showTimestamp") {
      setReceipt((current) => ({ ...current, showTimestamp: value as boolean }));
    }
  }

  function handleSaveDefaults() {
    saveReceiptDefaults(receipt);
    setStatus(t.status.defaultsSaved);
  }

  async function handleConnect(transport: "serial" | "usb") {
    setStatus(null);

    try {
      await connect(transport);
      setStatus(
        transport === "serial" ? t.status.connectedSerial : t.status.connectedUsb,
      );
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : t.status.connectError;
      const message =
        rawMessage.includes("Failed to open") ||
        (error instanceof DOMException && error.name === "NetworkError")
          ? t.status.serialOpenFailed
          : rawMessage.includes("cancel") || rawMessage.includes("Cancel")
            ? t.status.connectCancelled
            : rawMessage;

      setStatus(message);
    }
  }

  async function handleDisconnect() {
    await disconnect();
    setStatus(t.status.disconnected);
  }

  async function handlePrint() {
    setIsPrinting(true);
    setStatus(null);

    try {
      const encoderOptions = {
        language: device?.language ?? "esc-pos",
        codepageMapping: device?.codepageMapping ?? "pos-5890",
      };

      const buffer =
        mode === "event"
          ? await buildReceiptBuffer(receipt, encoderOptions)
          : await buildPhotoReceiptBuffer(photoTicket, encoderOptions);

      await print(buffer);
      setStatus(mode === "event" ? t.status.printEvent : t.status.printPhoto);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.printError);
    } finally {
      setIsPrinting(false);
    }
  }

  async function handleDownload() {
    try {
      const encoderOptions = {
        language: device?.language ?? "esc-pos",
        codepageMapping: device?.codepageMapping ?? "pos-5890",
      };

      const buffer =
        mode === "event"
          ? await buildReceiptBuffer(receipt, encoderOptions)
          : await buildPhotoReceiptBuffer(photoTicket, encoderOptions);

      downloadReceiptBuffer(buffer);
      setStatus(t.status.downloaded);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.downloadError);
    }
  }

  const browserReady = support.secureContext && (support.serial || support.usb);
  const canPrintPhoto = mode !== "photo" || Boolean(photoTicket.photoDataUrl);
  const encoderOptions = useMemo(
    () => ({
      language: device?.language ?? "esc-pos",
      codepageMapping: device?.codepageMapping ?? "pos-5890",
    }),
    [device?.codepageMapping, device?.language],
  );

  const lumaPreviewData = useMemo((): LumaReceiptData => {
    if (lumaPreviewReceipt) {
      return lumaPreviewReceipt;
    }

    return {
      eventName: receipt.businessName,
      guestName: receipt.nombre,
      ticketName: null,
      qrContent: receipt.qrContent,
      actionLabel: receipt.actionLabel,
      paperWidth: receipt.paperWidth,
      showLogo: receipt.showLogo,
      showQr: receipt.showQr,
      showActionLabel: receipt.showActionLabel,
      showTicketName: true,
      showTimestamp: receipt.showTimestamp,
    };
  }, [lumaPreviewReceipt, receipt]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10">
      <AppTopBar />

      <div className="mb-8 rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 shadow-sm sm:p-5">
        <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.ticketMode.label}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={() => setMode("event")}
            className={`inline-flex items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-base font-semibold transition ${
              mode === "event"
                ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
            }`}
          >
            <Ticket className="h-5 w-5" />
            {t.ticketMode.event}
          </button>
          <button
            type="button"
            onClick={() => setMode("photo")}
            className={`inline-flex items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-base font-semibold transition ${
              mode === "photo"
                ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
            }`}
          >
            <Camera className="h-5 w-5" />
            {t.ticketMode.photo}
          </button>
          <button
            type="button"
            onClick={() => setMode("luma")}
            className={`inline-flex items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-base font-semibold transition ${
              mode === "luma"
                ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
            }`}
          >
            <QrCode className="h-5 w-5" />
            {t.ticketMode.luma}
          </button>
          <button
            type="button"
            onClick={() => setMode("credits")}
            className={`inline-flex items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-base font-semibold transition ${
              mode === "credits"
                ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
            }`}
          >
            <Coins className="h-5 w-5" />
            {t.ticketMode.credits}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-10 xl:flex-row xl:items-start">
      <section className="w-full shrink-0 rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 shadow-sm xl:w-[520px]">
        <div className="mb-6">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t.app.brand}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.app.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{t.app.subtitle}</p>
        </div>

        {!browserReady ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {t.browser.unsupported}
          </div>
        ) : null}

        <div className="mb-6 space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{t.printer.title}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {isConnecting
                  ? t.printer.connecting
                  : isConnected && device
                    ? device.label
                    : t.printer.disconnected}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isConnected
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
              }`}
            >
              {isConnected ? t.printer.statusConnected : t.printer.statusDisconnected}
            </span>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t.printer.baud}
            </span>
            <select
              value={baudRate}
              onChange={(event) => setBaudRate(Number(event.target.value))}
              disabled={isConnected}
              className="w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 outline-none transition focus:border-zinc-400 disabled:opacity-60"
            >
              <option value={9600}>9600</option>
              <option value={19200}>19200</option>
              <option value={38400}>38400</option>
              <option value={115200}>115200</option>
            </select>
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void handleConnect("serial")}
              disabled={!support.serial || isConnecting || isConnected}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isConnecting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Cable className="h-4 w-4" />
              )}
              {t.printer.connectSerial}
            </button>
            <button
              type="button"
              onClick={() => void handleConnect("usb")}
              disabled={
                !support.usb || support.isWindows || isConnecting || isConnected
              }
              title={support.isWindows ? t.printer.usbWindowsHint : undefined}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-200 transition hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlugZap className="h-4 w-4" />
              {support.isWindows ? t.printer.usbUnavailable : t.printer.connectUsb}
            </button>
          </div>

          {isConnected ? (
            <button
              type="button"
              onClick={() => void handleDisconnect()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-200 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <Unplug className="h-4 w-4" />
              {t.printer.disconnect}
            </button>
          ) : null}
        </div>

        {mode === "event" ? (
          <div className="space-y-4">
            {textFields.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {field.label}
                </span>
                <input
                  type="text"
                  value={String(receipt[field.key])}
                  placeholder={field.placeholder}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  disabled={isFieldDisabled(field.key)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 outline-none transition focus:border-zinc-400 focus:bg-white dark:focus:border-zinc-500 dark:focus:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>
            ))}

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.fields.paperWidth}</span>
                <select
                  value={receipt.paperWidth}
                  onChange={(event) =>
                    updateField("paperWidth", Number(event.target.value) as PaperWidth)
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 outline-none transition focus:border-zinc-400 focus:bg-white dark:focus:border-zinc-500 dark:focus:bg-zinc-900"
                >
                  <option value={58}>58 mm</option>
                  <option value={80}>80 mm</option>
                </select>
              </label>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={receipt.showTimestamp}
                    onChange={(event) => updateField("showTimestamp", event.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.fields.includeTimestamp}</span>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={receipt.showWifi}
                    onChange={(event) => updateField("showWifi", event.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.fields.includeWifi}</span>
                </label>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t.fields.ticketSections}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["showLogo", t.fields.includeLogo],
                    ["showQr", t.fields.includeQr],
                    ["showEventType", t.fields.includeEventType],
                    ["showActionLabel", t.fields.includeActionLabel],
                    ["showNombre", t.fields.includeName],
                    ["showExtra", t.fields.includeExtra],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <input
                      type="checkbox"
                      checked={receipt[key]}
                      onChange={(event) => updateField(key, event.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : mode === "photo" ? (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.fields.name}</span>
              <input
                type="text"
                value={photoTicket.nombre}
                placeholder={t.placeholders.nombre}
                onChange={(event) => updatePhotoField("nombre", event.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 outline-none transition focus:border-zinc-400 focus:bg-white dark:focus:border-zinc-500 dark:focus:bg-zinc-900"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.fields.extra}</span>
              <input
                type="text"
                value={photoTicket.extra}
                placeholder={t.placeholders.extra}
                onChange={(event) => updatePhotoField("extra", event.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 outline-none transition focus:border-zinc-400 focus:bg-white dark:focus:border-zinc-500 dark:focus:bg-zinc-900"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.fields.paperWidth}</span>
                <select
                  value={photoTicket.paperWidth}
                  onChange={(event) =>
                    updatePhotoField("paperWidth", Number(event.target.value) as PaperWidth)
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 outline-none transition focus:border-zinc-400 focus:bg-white dark:focus:border-zinc-500 dark:focus:bg-zinc-900"
                >
                  <option value={58}>58 mm</option>
                  <option value={80}>80 mm</option>
                </select>
              </label>

              <label className="flex items-end gap-3 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 px-4 py-3">
                <input
                  type="checkbox"
                  checked={photoTicket.showTimestamp}
                  onChange={(event) => updatePhotoField("showTimestamp", event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.fields.includeTimestamp}</span>
              </label>
            </div>

            <CameraCapture
              photoSourceDataUrl={photoTicket.photoSourceDataUrl}
              photoFrameOffset={photoTicket.photoFrameOffset}
              photoDataUrl={photoTicket.photoDataUrl}
              onPhotoChange={(value) =>
                setPhotoTicket((current) => ({
                  ...current,
                  ...value,
                }))
              }
            />
          </div>
        ) : mode === "luma" ? (
          <LumaCheckin
            isConnected={isConnected}
            paperWidth={receipt.paperWidth}
            showTimestamp={receipt.showTimestamp}
            defaultQrContent={receipt.qrContent}
            defaultEventName={receipt.businessName}
            defaultGuestName={receipt.nombre}
            onPaperWidthChange={(value) => updateField("paperWidth", value)}
            onShowTimestampChange={(value) => updateField("showTimestamp", value)}
            printBuffer={print}
            onStatus={setStatus}
            onPreviewReceiptChange={handleLumaPreviewChange}
            encoderOptions={encoderOptions}
          />
        ) : (
          <CursorCredits
            isConnected={isConnected}
            printBuffer={print}
            onStatus={setStatus}
            onPreviewChange={handleCreditsPreviewChange}
            encoderOptions={encoderOptions}
          />
        )}

        {mode === "event" || mode === "photo" ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void handlePrint()}
              disabled={isPrinting || !isConnected || !canPrintPhoto}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPrinting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              {mode === "event" ? t.actions.printEvent : t.actions.printPhoto}
            </button>
            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={!canPrintPhoto}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-200 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {t.actions.download}
            </button>
          </div>
        ) : null}

        {mode === "event" ? (
          <button
            type="button"
            onClick={handleSaveDefaults}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-200 transition hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <Save className="h-4 w-4" />
            {t.actions.saveDefaults}
          </button>
        ) : null}

        {status ? (
          <p className="mt-4 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">{status}</p>
        ) : null}

        <p className="mt-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{t.printer.footnote}</p>
      </section>

      <aside className="flex min-w-0 flex-1 justify-center xl:sticky xl:top-10 xl:justify-center">
        {mode === "event" ? (
          <ReceiptPreview data={receipt} />
        ) : mode === "photo" ? (
          <PhotoReceiptPreview data={photoTicket} />
        ) : mode === "luma" ? (
          <LumaReceiptPreview data={lumaPreviewData} />
        ) : (
          <CreditsReceiptPreview data={creditsPreview} />
        )}
      </aside>
      </div>

      <DocsFooterLink />
    </div>
  );
}
