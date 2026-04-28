"use client";

import { useState, useCallback, useEffect } from "react";

// Minimal type definitions for Web Serial API to avoid TS errors
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  writable: WritableStream;
  getInfo(): { usbVendorId?: number; usbProductId?: number };
}

interface NavigatorSerial {
  requestPort(options?: { filters: Array<{ usbVendorId?: number; usbProductId?: number }> }): Promise<SerialPort>;
  getPorts(): Promise<SerialPort[]>;
}

declare global {
  interface Navigator {
    serial?: NavigatorSerial;
  }
}

export function useThermalPrinter() {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if Web Serial is supported on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !navigator.serial) {
      setIsSupported(false);
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    if (!navigator.serial) {
      setError("Browser tidak mendukung Web Serial API (Gunakan Chrome/Edge Desktop).");
      return false;
    }

    try {
      // Request user to select a serial port (USB Printer)
      const selectedPort = await navigator.serial.requestPort();
      
      // Typical thermal printer baud rate is 9600, but some use 115200 or 19200
      await selectedPort.open({ baudRate: 9600 });
      
      setPort(selectedPort);
      setIsConnected(true);
      return true;
    } catch (err: unknown) {
      // User cancelled the prompt or port failed to open
      const errMessage = err instanceof Error ? err.message : "Gagal terhubung ke printer";
      console.error("Printer connection error:", err);
      
      // Avoid showing error if user intentionally cancelled
      if (!errMessage.includes("No port selected by the user")) {
        setError(errMessage);
      }
      return false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (port) {
      try {
        await port.close();
      } catch (err) {
        console.error("Error closing port:", err);
      }
      setPort(null);
      setIsConnected(false);
    }
  }, [port]);

  const print = useCallback(async (data: Uint8Array) => {
    if (!port || !isConnected) {
      setError("Printer belum terhubung.");
      return false;
    }

    setError(null);
    try {
      const writer = port.writable.getWriter();
      await writer.write(data);
      writer.releaseLock();
      return true;
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Gagal mencetak struk";
      console.error("Print error:", err);
      setError(errMessage);
      
      // If writing failed, the port might be disconnected
      if (errMessage.includes("NetworkError") || errMessage.includes("The device has been lost")) {
        setIsConnected(false);
        setPort(null);
      }
      return false;
    }
  }, [port, isConnected]);

  return {
    isSupported,
    isConnected,
    error,
    connect,
    disconnect,
    print,
  };
}
