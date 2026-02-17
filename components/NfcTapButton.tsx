"use client";

import { useState, useEffect } from "react";
import { nfcRead } from "@/lib/nfc";
import { bleConnect, bleDisconnect, bleIsConnected, bleNfcRead, bleDeviceName } from "@/lib/nfc-ble";

type NfcMode = "local" | "bluetooth";

const MODE_STORAGE_KEY = "hospitalos-nfc-mode";

interface Props {
  onResult: (nfcId: string | null) => void;
  label?: string;
  className?: string;
}

export default function NfcTapButton({ onResult, label = "Tap NFC Card", className = "" }: Props) {
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<NfcMode>("local");
  const [bleConnected, setBleConnected] = useState(false);
  const [bleConnecting, setBleConnecting] = useState(false);

  // Load saved mode preference
  useEffect(() => {
    const saved = localStorage.getItem(MODE_STORAGE_KEY) as NfcMode | null;
    if (saved === "local" || saved === "bluetooth") setMode(saved);
  }, []);

  // Sync BLE connection state
  useEffect(() => {
    setBleConnected(bleIsConnected());
  }, [mode]);

  function handleModeChange(newMode: NfcMode) {
    setMode(newMode);
    setError(null);
    localStorage.setItem(MODE_STORAGE_KEY, newMode);
  }

  async function handleBleConnect() {
    setBleConnecting(true);
    setError(null);
    try {
      await bleConnect();
      setBleConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "BLE connection failed");
      setBleConnected(false);
    } finally {
      setBleConnecting(false);
    }
  }

  function handleBleDisconnect() {
    bleDisconnect();
    setBleConnected(false);
  }

  async function handleTap() {
    setWaiting(true);
    setError(null);
    try {
      if (mode === "bluetooth") {
        const result = await bleNfcRead(35000);
        onResult(result.nfc_id);
      } else {
        const result = await nfcRead(30);
        onResult(result.nfc_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "NFC read failed");
      onResult(null);
    } finally {
      setWaiting(false);
    }
  }

  const canTap = mode === "local" || (mode === "bluetooth" && bleConnected);

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Mode toggle */}
      <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900">
        <button
          onClick={() => handleModeChange("local")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "local"
              ? "bg-cyan-600 text-white"
              : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          Local NFC
        </button>
        <button
          onClick={() => handleModeChange("bluetooth")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "bluetooth"
              ? "bg-cyan-600 text-white"
              : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          Bluetooth NFC
        </button>
      </div>

      {/* BLE connection controls */}
      {mode === "bluetooth" && (
        <div className="flex items-center gap-3">
          {bleConnected ? (
            <>
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Connected{bleDeviceName() ? ` to ${bleDeviceName()}` : ""}
              </span>
              <button
                onClick={handleBleDisconnect}
                className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleBleConnect}
              disabled={bleConnecting}
              className="rounded-lg border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-100 disabled:opacity-50 dark:border-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/40"
            >
              {bleConnecting ? "Connecting..." : "Connect Bluetooth Reader"}
            </button>
          )}
        </div>
      )}

      {/* Tap button */}
      <button
        onClick={handleTap}
        disabled={waiting || !canTap}
        className={`flex items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-10 py-8 text-base font-medium transition-all ${
          waiting
            ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-900/20 dark:text-amber-400"
            : !canTap
              ? "cursor-not-allowed border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-600"
              : "border-zinc-300 bg-white text-zinc-700 active:border-cyan-500 active:bg-cyan-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:active:border-cyan-500 dark:active:bg-cyan-900/20"
        }`}
      >
        {waiting ? (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
            <span className="text-lg">Waiting for card tap...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
            </svg>
            <span className="text-lg">{label}</span>
          </>
        )}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
