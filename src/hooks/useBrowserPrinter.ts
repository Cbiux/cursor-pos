"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  clearStoredPrinter,
  getBrowserPrinterSupport,
  loadStoredPrinter,
  saveStoredPrinter,
  type BrowserPrinterSupport,
  type PrinterTransport,
  type StoredPrinterDevice,
} from "@/lib/browser-printer";

type PrinterInstance = {
  connect: () => Promise<void>;
  reconnect: (device: {
    vendorId?: number | null;
    productId?: number | null;
    serialNumber?: string;
  }) => Promise<void>;
  disconnect: () => Promise<void>;
  print: (data: Uint8Array) => Promise<void>;
  addEventListener: (event: string, listener: (device?: StoredPrinterDevice) => void) => void;
};

interface UseBrowserPrinterResult {
  support: BrowserPrinterSupport;
  device: StoredPrinterDevice | null;
  isConnected: boolean;
  isConnecting: boolean;
  baudRate: number;
  setBaudRate: (value: number) => void;
  connect: (transport: PrinterTransport) => Promise<void>;
  disconnect: () => Promise<void>;
  print: (data: Uint8Array) => Promise<void>;
}

function buildDeviceLabel(
  transport: PrinterTransport,
  info: Partial<StoredPrinterDevice>,
): string {
  if (info.productName || info.manufacturerName) {
    return [info.manufacturerName, info.productName].filter(Boolean).join(" ");
  }

  if (info.vendorId && info.productId) {
    return `${transport.toUpperCase()} ${info.vendorId}:${info.productId}`;
  }

  return transport === "serial" ? "Impresora Serial" : "Impresora USB";
}

export function useBrowserPrinter(): UseBrowserPrinterResult {
  const [support] = useState<BrowserPrinterSupport>(() => getBrowserPrinterSupport());
  const [device, setDevice] = useState<StoredPrinterDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [baudRate, setBaudRate] = useState(9600);

  const printerRef = useRef<PrinterInstance | null>(null);
  const transportRef = useRef<PrinterTransport | null>(null);

  const createPrinter = useCallback(async (transport: PrinterTransport) => {
    if (transport === "serial") {
      const { default: WebSerialReceiptPrinter } = await import(
        "@/vendor/webserial-receipt-printer.js"
      );
      return new WebSerialReceiptPrinter({ baudRate }) as PrinterInstance;
    }

    const { default: WebUSBReceiptPrinter } = await import("@/vendor/webusb-receipt-printer.js");
    return new WebUSBReceiptPrinter() as PrinterInstance;
  }, [baudRate]);

  const bindPrinterEvents = useCallback(
    (printer: PrinterInstance, transport: PrinterTransport, onConnected?: () => void) => {
      printer.addEventListener("connected", (info) => {
        onConnected?.();

        const stored: StoredPrinterDevice = {
          transport,
          vendorId: info?.vendorId ?? null,
          productId: info?.productId ?? null,
          serialNumber: info?.serialNumber,
          manufacturerName: info?.manufacturerName,
          productName: info?.productName,
          language: info?.language ?? "esc-pos",
          codepageMapping: info?.codepageMapping ?? null,
          baudRate: transport === "serial" ? baudRate : undefined,
          label: buildDeviceLabel(transport, info ?? {}),
        };

        saveStoredPrinter(stored);
        setDevice(stored);
        setIsConnected(true);
        setIsConnecting(false);
      });

      printer.addEventListener("disconnected", () => {
        setIsConnected(false);
        setDevice(null);
        printerRef.current = null;
        transportRef.current = null;
      });
    },
    [baudRate],
  );

  const connect = useCallback(
    async (transport: PrinterTransport) => {
      setIsConnecting(true);

      try {
        if (printerRef.current) {
          await printerRef.current.disconnect();
        }

        const printer = await createPrinter(transport);
        let didConnect = false;

        printerRef.current = printer;
        transportRef.current = transport;
        bindPrinterEvents(printer, transport, () => {
          didConnect = true;
        });

        await printer.connect();
        await new Promise((resolve) => setTimeout(resolve, 400));

        if (!didConnect) {
          setIsConnecting(false);
          throw new Error("No se seleccionó ninguna impresora.");
        }
      } catch (error) {
        setIsConnecting(false);
        throw error;
      }
    },
    [bindPrinterEvents, createPrinter],
  );

  const disconnect = useCallback(async () => {
    if (printerRef.current) {
      await printerRef.current.disconnect();
    }

    clearStoredPrinter();
    setDevice(null);
    setIsConnected(false);
    printerRef.current = null;
    transportRef.current = null;
  }, []);

  const print = useCallback(async (data: Uint8Array) => {
    if (!printerRef.current) {
      throw new Error("Conecta una impresora antes de imprimir.");
    }

    await printerRef.current.print(data);
  }, []);

  useEffect(() => {
    const stored = loadStoredPrinter();

    if (!stored) {
      return;
    }

    setBaudRate(stored.baudRate ?? 9600);

    void (async () => {
      try {
        setIsConnecting(true);
        const printer = await createPrinter(stored.transport);
        printerRef.current = printer;
        transportRef.current = stored.transport;
        bindPrinterEvents(printer, stored.transport);
        await printer.reconnect(stored);
        setDevice(stored);
        setIsConnected(true);
      } catch {
        clearStoredPrinter();
        setDevice(null);
        setIsConnected(false);
      } finally {
        setIsConnecting(false);
      }
    })();
  }, [bindPrinterEvents, createPrinter]);

  return {
    support,
    device,
    isConnected,
    isConnecting,
    baudRate,
    setBaudRate,
    connect,
    disconnect,
    print,
  };
}
