"use client";

import { Download, LoaderCircle, Printer, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { ReceiptPreview } from "@/components/ReceiptPreview";
import { defaultReceiptData, type PaperWidth, type ReceiptData } from "@/lib/types";

type FieldKey = keyof ReceiptData;

const textFields: Array<{ key: FieldKey; label: string; placeholder: string }> = [
  { key: "businessName", label: "Nombre del negocio", placeholder: "Cafe Cursor - Santiago" },
  { key: "qrContent", label: "Contenido del QR", placeholder: "https://..." },
  { key: "eventType", label: "Tipo de evento", placeholder: "Drop-by slot" },
  { key: "actionLabel", label: "Acción", placeholder: "Check-in" },
  { key: "wifiSsid", label: "Red WiFi", placeholder: "Taller.1" },
  { key: "wifiPassword", label: "Clave WiFi", placeholder: "@Salvo20" },
];

export function PosApp() {
  const [receipt, setReceipt] = useState<ReceiptData>(defaultReceiptData);
  const [printers, setPrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  async function loadPrinters() {
    setIsLoadingPrinters(true);
    setStatus(null);

    try {
      const response = await fetch("/api/printers");
      const data = (await response.json()) as { printers: string[]; error?: string };

      setPrinters(data.printers ?? []);

      if (data.printers?.length && !selectedPrinter) {
        setSelectedPrinter(data.printers[0]);
      }

      if (data.error) {
        setStatus(data.error);
      }
    } catch {
      setStatus("No se pudieron cargar las impresoras de Windows.");
    } finally {
      setIsLoadingPrinters(false);
    }
  }

  useEffect(() => {
    void loadPrinters();
  }, []);

  function updateField<K extends FieldKey>(key: K, value: ReceiptData[K]) {
    setReceipt((current) => ({ ...current, [key]: value }));
  }

  async function handlePrint() {
    if (!selectedPrinter) {
      setStatus("Selecciona una impresora antes de imprimir.");
      return;
    }

    setIsPrinting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt, printerName: selectedPrinter }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Error al imprimir.");
      }

      setStatus("Ticket enviado a la impresora.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error al imprimir.");
    } finally {
      setIsPrinting(false);
    }
  }

  async function handleDownload() {
    setIsDownloading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt, downloadOnly: true }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "No se pudo generar el archivo.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "ticket.bin";
      anchor.click();
      URL.revokeObjectURL(url);

      setStatus("Archivo ESC/POS descargado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error al descargar.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row lg:items-start lg:justify-between">
      <section className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-zinc-500">Cursor POS</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
            Impresión de tickets
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Configura el ticket, revisa la vista previa y envíalo a tu impresora térmica por USB.
          </p>
        </div>

        <div className="space-y-4">
          {textFields.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                {field.label}
              </span>
              <input
                type="text"
                value={String(receipt[field.key])}
                placeholder={field.placeholder}
                onChange={(event) => updateField(field.key, event.target.value)}
                disabled={field.key === "wifiSsid" || field.key === "wifiPassword" ? !receipt.showWifi : false}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">Ancho de papel</span>
              <select
                value={receipt.paperWidth}
                onChange={(event) =>
                  updateField("paperWidth", Number(event.target.value) as PaperWidth)
                }
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white"
              >
                <option value={58}>58 mm</option>
                <option value={80}>80 mm</option>
              </select>
            </label>

            <label className="flex items-end gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <input
                type="checkbox"
                checked={receipt.showWifi}
                onChange={(event) => updateField("showWifi", event.target.checked)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <span className="text-sm font-medium text-zinc-700">Incluir WiFi</span>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">Impresora</span>
            <div className="flex gap-2">
              <select
                value={selectedPrinter}
                onChange={(event) => setSelectedPrinter(event.target.value)}
                disabled={isLoadingPrinters || printers.length === 0}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white disabled:opacity-60"
              >
                {printers.length === 0 ? (
                  <option value="">No se detectaron impresoras</option>
                ) : (
                  printers.map((printer) => (
                    <option key={printer} value={printer}>
                      {printer}
                    </option>
                  ))
                )}
              </select>
              <button
                type="button"
                onClick={() => void loadPrinters()}
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 transition hover:bg-zinc-50"
                aria-label="Actualizar impresoras"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingPrinters ? "animate-spin" : ""}`} />
              </button>
            </div>
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void handlePrint()}
            disabled={isPrinting || printers.length === 0}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPrinting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            Imprimir ticket
          </button>
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={isDownloading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Descargar ESC/POS
          </button>
        </div>

        {status ? (
          <p className="mt-4 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">{status}</p>
        ) : null}
      </section>

      <aside className="flex w-full justify-center lg:sticky lg:top-10 lg:max-w-sm">
        <ReceiptPreview data={receipt} />
      </aside>
    </div>
  );
}
