"use client";

import {
  Cable,
  Download,
  LoaderCircle,
  PlugZap,
  Printer,
  Save,
  Unplug,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ReceiptPreview } from "@/components/ReceiptPreview";
import { useBrowserPrinter } from "@/hooks/useBrowserPrinter";
import { downloadReceiptBuffer } from "@/lib/browser-printer";
import { loadReceiptDefaults, saveReceiptDefaults } from "@/lib/receipt-defaults";
import { buildReceiptBuffer } from "@/lib/receipt";
import { type PaperWidth, defaultReceiptData, type ReceiptData } from "@/lib/types";

type FieldKey = keyof ReceiptData;

const textFields: Array<{ key: FieldKey; label: string; placeholder: string }> = [
  { key: "businessName", label: "Nombre del negocio", placeholder: "Cursor Meetup - San José" },
  { key: "nombre", label: "Nombre", placeholder: "Juan Santamaría" },
  { key: "qrContent", label: "Contenido del QR", placeholder: "https://luma.com/..." },
  { key: "eventType", label: "Tipo de evento", placeholder: "Drop-by slot" },
  { key: "actionLabel", label: "Acción", placeholder: "Check-in" },
  { key: "wifiSsid", label: "Red WiFi", placeholder: "Taller.1" },
  { key: "wifiPassword", label: "Clave WiFi", placeholder: "@Salvo20" },
];

export function PosApp() {
  const [receipt, setReceipt] = useState<ReceiptData>(defaultReceiptData);
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

  useEffect(() => {
    setReceipt(loadReceiptDefaults());
  }, []);

  function updateField<K extends FieldKey>(key: K, value: ReceiptData[K]) {
    setReceipt((current) => ({ ...current, [key]: value }));
  }

  function handleSaveDefaults() {
    saveReceiptDefaults(receipt);
    setStatus("Valores guardados como predeterminados.");
  }

  async function handleConnect(transport: "serial" | "usb") {
    setStatus(null);

    try {
      await connect(transport);
      setStatus(
        transport === "serial"
          ? "Impresora conectada por puerto serial."
          : "Impresora conectada por USB.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo conectar la impresora.";

      setStatus(
        message.includes("cancel") || message.includes("Cancel")
          ? "Conexión cancelada. Vuelve a intentarlo y elige tu impresora en el diálogo del navegador."
          : message,
      );
    }
  }

  async function handleDisconnect() {
    await disconnect();
    setStatus("Impresora desconectada.");
  }

  async function handlePrint() {
    setIsPrinting(true);
    setStatus(null);

    try {
      const buffer = await buildReceiptBuffer(receipt, {
        language: device?.language ?? "esc-pos",
        codepageMapping: device?.codepageMapping ?? "pos-5890",
      });

      await print(buffer);
      setStatus("Ticket enviado a la impresora.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error al imprimir.");
    } finally {
      setIsPrinting(false);
    }
  }

  async function handleDownload() {
    try {
      const buffer = await buildReceiptBuffer(receipt, {
        language: device?.language ?? "esc-pos",
        codepageMapping: device?.codepageMapping ?? "pos-5890",
      });

      downloadReceiptBuffer(buffer);
      setStatus("Archivo ESC/POS descargado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error al descargar.");
    }
  }

  const browserReady = support.secureContext && (support.serial || support.usb);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row lg:items-start lg:justify-between">
      <section className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-zinc-500">Cursor POS</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
            Impresión de tickets
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Conecta tu impresora térmica desde el navegador y imprime directo, también en Vercel.
          </p>
        </div>

        {!browserReady ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Este navegador no soporta impresión directa. Abre la app en Chrome o Edge con HTTPS.
          </div>
        ) : null}

        <div className="mb-6 space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-800">Impresora</p>
              <p className="text-sm text-zinc-600">
                {isConnecting
                  ? "Conectando..."
                  : isConnected && device
                    ? device.label
                    : "Sin conectar"}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isConnected
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-zinc-200 text-zinc-700"
              }`}
            >
              {isConnected ? "Conectada" : "Desconectada"}
            </span>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">
              Velocidad serial (baud)
            </span>
            <select
              value={baudRate}
              onChange={(event) => setBaudRate(Number(event.target.value))}
              disabled={isConnected}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:opacity-60"
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
              Conectar Serial
            </button>
            <button
              type="button"
              onClick={() => void handleConnect("usb")}
              disabled={
                !support.usb || support.isWindows || isConnecting || isConnected
              }
              title={
                support.isWindows
                  ? "En Windows el driver bloquea WebUSB. Usa Conectar Serial."
                  : undefined
              }
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlugZap className="h-4 w-4" />
              {support.isWindows ? "USB no disponible" : "Conectar USB"}
            </button>
          </div>

          {isConnected ? (
            <button
              type="button"
              onClick={() => void handleDisconnect()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
            >
              <Unplug className="h-4 w-4" />
              Desconectar
            </button>
          ) : null}
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
                disabled={
                  field.key === "wifiSsid" || field.key === "wifiPassword"
                    ? !receipt.showWifi
                    : false
                }
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
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void handlePrint()}
            disabled={isPrinting || !isConnected}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPrinting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            Imprimir ticket
          </button>
          <button
            type="button"
            onClick={() => void handleDownload()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            <Download className="h-4 w-4" />
            Descargar ESC/POS
          </button>
        </div>

        <button
          type="button"
          onClick={handleSaveDefaults}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
        >
          <Save className="h-4 w-4" />
          Guardar defaults
        </button>

        {status ? (
          <p className="mt-4 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">{status}</p>
        ) : null}

        <p className="mt-4 text-xs leading-5 text-zinc-500">
          MTP-2 por Bluetooth: Conectar Serial y elige <strong>MTP-2: vinculado</strong>. Por cable
          USB necesitas un puerto COM de cable (CH340), no los COM de Bluetooth (COM10–COM13).
          Velocidad recomendada: 9600 baud. El logo se imprime en blanco y negro optimizado para
          papel térmico.
        </p>
      </section>

      <aside className="flex w-full justify-center lg:sticky lg:top-10 lg:max-w-sm">
        <ReceiptPreview data={receipt} />
      </aside>
    </div>
  );
}
