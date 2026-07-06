declare module "@point-of-sale/webserial-receipt-printer" {
  interface SerialPrinterOptions {
    baudRate?: number;
    bufferSize?: number;
    dataBits?: 7 | 8;
    flowControl?: "none" | "hardware";
    parity?: "none" | "even" | "odd";
    stopBits?: 1 | 2;
  }

  interface SerialDeviceInfo {
    type: "serial";
    vendorId: number | null;
    productId: number | null;
    language: string | null;
    codepageMapping: string | null;
  }

  export default class WebSerialReceiptPrinter {
    constructor(options?: SerialPrinterOptions);
    connect(): Promise<void>;
    reconnect(device: { vendorId?: number | null; productId?: number | null }): Promise<void>;
    disconnect(): Promise<void>;
    print(data: Uint8Array | number[]): Promise<void>;
    addEventListener(event: "connected", listener: (device: SerialDeviceInfo) => void): void;
    addEventListener(event: "disconnected", listener: () => void): void;
  }
}

declare module "@point-of-sale/webusb-receipt-printer" {
  interface UsbDeviceInfo {
    type: "usb";
    manufacturerName?: string;
    productName?: string;
    serialNumber?: string;
    vendorId: number;
    productId: number;
    language: string;
    codepageMapping: string;
  }

  export default class WebUSBReceiptPrinter {
    connect(): Promise<void>;
    reconnect(device: {
      serialNumber?: string;
      vendorId?: number;
      productId?: number;
    }): Promise<void>;
    disconnect(): Promise<void>;
    print(data: Uint8Array | number[]): Promise<void>;
    addEventListener(event: "connected", listener: (device: UsbDeviceInfo) => void): void;
    addEventListener(event: "disconnected", listener: () => void): void;
  }
}
