import type { PrinterTransport, StoredPrinterDevice } from "./browser-printer";

type BrowserSerial = {
  requestPort(): Promise<SerialPort>;
  getPorts(): Promise<SerialPort[]>;
};

type BrowserUsb = {
  requestDevice(options: {
    filters: Array<{ vendorId?: number; productId?: number }>;
  }): Promise<USBDevice>;
  getDevices(): Promise<USBDevice[]>;
};

type SerialPortInfo = {
  usbVendorId?: number;
  usbProductId?: number;
};

type SerialPort = {
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  open(options: {
    baudRate: number;
    dataBits?: 7 | 8;
    stopBits?: 1 | 2;
    parity?: "none" | "even" | "odd";
    flowControl?: "none" | "hardware";
  }): Promise<void>;
  close(): Promise<void>;
  getInfo(): SerialPortInfo;
};

type USBEndpoint = {
  direction: "in" | "out";
  type: "bulk" | "interrupt" | "isochronous" | "control";
  endpointNumber: number;
};

type USBDevice = {
  vendorId: number;
  productId: number;
  serialNumber?: string;
  manufacturerName?: string;
  productName?: string;
  configurations: Array<{
    configurationValue: number;
    interfaces: Array<{
      interfaceNumber: number;
      alternates: Array<{
        endpoints: USBEndpoint[];
      }>;
    }>;
  }>;
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  reset(): Promise<void>;
  transferOut(endpointNumber: number, data: BufferSource): Promise<unknown>;
};

function getSerialApi(): BrowserSerial {
  if (!("serial" in navigator) || !navigator.serial) {
    throw new Error("Este navegador no soporta Web Serial. Usa Chrome o Edge.");
  }

  return navigator.serial as unknown as BrowserSerial;
}

function getUsbApi(): BrowserUsb {
  if (!("usb" in navigator) || !navigator.usb) {
    throw new Error("Este navegador no soporta WebUSB. Usa Chrome o Edge.");
  }

  return navigator.usb as unknown as BrowserUsb;
}

export interface SerialOpenOptions {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: "none" | "even" | "odd";
  flowControl?: "none" | "hardware";
}

type ConnectedHandler = (device: StoredPrinterDevice) => void;

function buildLabel(info: {
  transport: PrinterTransport;
  manufacturerName?: string;
  productName?: string;
  vendorId?: number | null;
  productId?: number | null;
}): string {
  if (info.productName || info.manufacturerName) {
    return [info.manufacturerName, info.productName].filter(Boolean).join(" ");
  }

  if (info.vendorId && info.productId) {
    return `${info.transport.toUpperCase()} ${info.vendorId}:${info.productId}`;
  }

  return info.transport === "serial" ? "Puerto serial" : "Impresora USB";
}

function findUsbOutEndpoint(device: USBDevice): {
  configurationValue: number;
  interfaceNumber: number;
  endpointNumber: number;
} {
  for (const configuration of device.configurations) {
    for (const iface of configuration.interfaces) {
      for (const alternate of iface.alternates) {
        const output = alternate.endpoints.find(
          (endpoint) => endpoint.direction === "out" && endpoint.type === "bulk",
        );

        if (output) {
          return {
            configurationValue: configuration.configurationValue,
            interfaceNumber: iface.interfaceNumber,
            endpointNumber: output.endpointNumber,
          };
        }
      }
    }
  }

  throw new Error("La impresora USB no expone un canal de salida compatible.");
}

export class BrowserReceiptPrinter {
  private serialPort: SerialPort | null = null;
  private usbDevice: USBDevice | null = null;
  private usbEndpoint: number | null = null;
  private queue: Uint8Array[] = [];
  private isWriting = false;
  private onConnected: ConnectedHandler | null = null;
  private onDisconnected: (() => void) | null = null;

  addEventListener(event: "connected", listener: ConnectedHandler): void;
  addEventListener(event: "disconnected", listener: () => void): void;
  addEventListener(event: string, listener: ConnectedHandler | (() => void)): void {
    if (event === "connected") {
      this.onConnected = listener as ConnectedHandler;
      return;
    }

    if (event === "disconnected") {
      this.onDisconnected = listener as () => void;
    }
  }

  async connectSerial(options: SerialOpenOptions): Promise<void> {
    const port = await getSerialApi().requestPort();
    await port.open({
      baudRate: options.baudRate,
      dataBits: options.dataBits ?? 8,
      stopBits: options.stopBits ?? 1,
      parity: options.parity ?? "none",
      flowControl: options.flowControl ?? "none",
    });

    this.serialPort = port;
    const info = port.getInfo();

    this.onConnected?.({
      transport: "serial",
      vendorId: info.usbVendorId ?? null,
      productId: info.usbProductId ?? null,
      language: "esc-pos",
      codepageMapping: "pos-5890",
      baudRate: options.baudRate,
      label: buildLabel({
        transport: "serial",
        vendorId: info.usbVendorId ?? null,
        productId: info.usbProductId ?? null,
      }),
    });
  }

  async reconnectSerial(
    device: StoredPrinterDevice,
    options: SerialOpenOptions,
  ): Promise<void> {
    const ports = await getSerialApi().getPorts();
    const match = ports.find((port) => {
      const info = port.getInfo();

      if (device.vendorId && device.productId) {
        return (
          info.usbVendorId === device.vendorId && info.usbProductId === device.productId
        );
      }

      return ports.length === 1;
    });

    if (!match) {
      throw new Error("No hay un puerto serial autorizado para reconectar.");
    }

    await match.open({
      baudRate: options.baudRate,
      dataBits: options.dataBits ?? 8,
      stopBits: options.stopBits ?? 1,
      parity: options.parity ?? "none",
      flowControl: options.flowControl ?? "none",
    });

    this.serialPort = match;
    this.onConnected?.(device);
  }

  async connectUsb(): Promise<void> {
    if (!("usb" in navigator)) {
      throw new Error("Este navegador no soporta WebUSB. Usa Chrome o Edge.");
    }

    let device: USBDevice;

    try {
      device = await getUsbApi().requestDevice({ filters: [] });
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotFoundError") {
        throw new Error(
          "No apareció ninguna impresora USB. En Windows el driver suele bloquear WebUSB: usa Conectar Serial.",
        );
      }

      throw error;
    }

    await this.openUsbDevice(device);
  }

  async reconnectUsb(device: StoredPrinterDevice): Promise<void> {
    if (!("usb" in navigator)) {
      return;
    }

    const devices = await getUsbApi().getDevices();
    const match =
      devices.find((entry) => entry.serialNumber && entry.serialNumber === device.serialNumber) ??
      devices.find(
        (entry) =>
          entry.vendorId === device.vendorId && entry.productId === device.productId,
      );

    if (!match) {
      throw new Error("No hay una impresora USB autorizada para reconectar.");
    }

    await this.openUsbDevice(match);
  }

  private async openUsbDevice(device: USBDevice): Promise<void> {
    await device.open();

    const endpoint = findUsbOutEndpoint(device);
    await device.selectConfiguration(endpoint.configurationValue);
    await device.claimInterface(endpoint.interfaceNumber);
    await device.reset();

    this.usbDevice = device;
    this.usbEndpoint = endpoint.endpointNumber;

    this.onConnected?.({
      transport: "usb",
      vendorId: device.vendorId,
      productId: device.productId,
      serialNumber: device.serialNumber,
      manufacturerName: device.manufacturerName,
      productName: device.productName,
      language: "esc-pos",
      codepageMapping: "pos-5890",
      label: buildLabel({
        transport: "usb",
        manufacturerName: device.manufacturerName,
        productName: device.productName,
        vendorId: device.vendorId,
        productId: device.productId,
      }),
    });
  }

  async print(data: Uint8Array): Promise<void> {
    if (this.serialPort?.writable) {
      this.queue.push(data);
      await this.flushSerialQueue();
      return;
    }

    if (this.usbDevice && this.usbEndpoint !== null) {
      await this.usbDevice.transferOut(this.usbEndpoint, Uint8Array.from(data));
      return;
    }

    throw new Error("No hay impresora conectada.");
  }

  private async flushSerialQueue(): Promise<void> {
    if (!this.serialPort?.writable || this.isWriting) {
      return;
    }

    this.isWriting = true;
    const writer = this.serialPort.writable.getWriter();

    try {
      let chunk = this.queue.shift();

      while (chunk) {
        await writer.write(chunk);
        chunk = this.queue.shift();
      }
    } finally {
      writer.releaseLock();
      this.isWriting = false;

      if (this.queue.length > 0) {
        await this.flushSerialQueue();
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.serialPort) {
      await this.serialPort.close();
      this.serialPort = null;
    }

    if (this.usbDevice) {
      await this.usbDevice.close();
      this.usbDevice = null;
      this.usbEndpoint = null;
    }

    this.queue = [];
    this.onDisconnected?.();
  }
}
