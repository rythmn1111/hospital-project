"use client";

import { useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { WPPCONNECT_URL, SESSION_NAME } from "@/lib/whatsapp";

export default function QRCodeDisplay() {
  const [status, setStatus] = useState<
    "idle" | "connecting" | "qr" | "connected"
  >("idle");
  const [qrCode, setQrCode] = useState<string>("");
  const [error, setError] = useState<string>("");

  const connect = useCallback(async () => {
    setStatus("connecting");
    setError("");

    try {
      // Step 1: Generate token
      const tokenRes = await fetch("/api/whatsapp/generate-token", {
        method: "POST",
      });
      const tokenData = await tokenRes.json();
      if (tokenData.status !== "success") {
        throw new Error("Failed to generate token");
      }
      const token = tokenData.token;

      // Step 2: Connect Socket.IO to listen for QR and session events
      const socket: Socket = io(WPPCONNECT_URL, {
        transports: ["websocket"],
      });

      socket.on("qrCode", (data: { data: string; session: string }) => {
        if (data.session === SESSION_NAME) {
          setQrCode(data.data);
          setStatus("qr");
        }
      });

      socket.on(
        "session-logged",
        (data: { session: string; status: string }) => {
          if (data.session === SESSION_NAME) {
            setStatus("connected");
            localStorage.setItem("wa_token", token);
            socket.disconnect();
            window.location.href = "/chat";
          }
        }
      );

      // Step 3: Start session
      const sessionRes = await fetch("/api/whatsapp/start-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const sessionData = await sessionRes.json();

      // If already connected, redirect to chat
      if (sessionData.status === "CONNECTED") {
        localStorage.setItem("wa_token", token);
        socket.disconnect();
        window.location.href = "/chat";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setStatus("idle");
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      {status === "idle" && (
        <button
          onClick={connect}
          className="rounded-full bg-green-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-green-700"
        >
          Connect WhatsApp
        </button>
      )}

      {status === "connecting" && (
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
          <p className="text-zinc-600 dark:text-zinc-400">
            Starting session...
          </p>
        </div>
      )}

      {status === "qr" && qrCode && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-zinc-600 dark:text-zinc-400">
            Scan this QR code with WhatsApp
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCode}
            alt="WhatsApp QR Code"
            className="h-64 w-64 rounded-lg border border-zinc-200 dark:border-zinc-700"
          />
          <p className="text-sm text-zinc-500">
            Open WhatsApp &gt; Settings &gt; Linked Devices &gt; Link a Device
          </p>
        </div>
      )}

      {status === "connected" && (
        <p className="text-green-600 font-semibold">
          Connected! Redirecting...
        </p>
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
