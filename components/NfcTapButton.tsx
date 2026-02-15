"use client";

import { useState } from "react";
import { nfcRead } from "@/lib/nfc";

interface Props {
  onResult: (nfcId: string | null) => void;
  label?: string;
  className?: string;
}

export default function NfcTapButton({ onResult, label = "Tap NFC Card", className = "" }: Props) {
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTap() {
    setWaiting(true);
    setError(null);
    try {
      const result = await nfcRead(30);
      onResult(result.nfc_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "NFC read failed");
      onResult(null);
    } finally {
      setWaiting(false);
    }
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <button
        onClick={handleTap}
        disabled={waiting}
        className={`flex items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-10 py-8 text-base font-medium transition-all ${
          waiting
            ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-900/20 dark:text-amber-400"
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
