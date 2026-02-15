"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { WPPCONNECT_URL, SESSION_NAME } from "@/lib/whatsapp";

interface Message {
  id: string;
  from: string;
  body: string;
  fromMe: boolean;
  timestamp: number;
}

export default function ChatView() {
  const [phone, setPhone] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("wa_token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    const socket = io(WPPCONNECT_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("received-message", (data: { response: Record<string, string> }) => {
      const msg = data.response;
      if (msg.from === "status@broadcast" || msg.isStatusV3 === "true") return;
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id || crypto.randomUUID(),
          from: msg.from || "unknown",
          body: msg.body || "",
          fromMe: false,
          timestamp: Date.now(),
        },
      ]);
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("connect", () => setConnected(true));

    return () => {
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!phone.trim() || !text.trim() || !token) return;

    const res = await fetch("/api/whatsapp/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, phone: phone.trim(), message: text }),
    });
    const data = await res.json();

    if (data.status === "success") {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          from: "me",
          body: text,
          fromMe: true,
          timestamp: Date.now(),
        },
      ]);
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const disconnect = () => {
    socketRef.current?.disconnect();
    localStorage.removeItem("wa_token");
    window.location.href = "/";
  };

  const logoutCompletely = async () => {
    if (!token) return;
    await fetch("/api/whatsapp/logout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    socketRef.current?.disconnect();
    localStorage.removeItem("wa_token");
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          WhatsApp Chat
        </h1>
        <div className="flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
          />
          <input
            type="text"
            placeholder="Phone (e.g. 919876543210)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            onClick={disconnect}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Disconnect
          </button>
          <button
            onClick={logoutCompletely}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Logout WhatsApp
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <p className="text-center text-zinc-400 mt-20">
            No messages yet. Enter a phone number and start chatting.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-md rounded-2xl px-4 py-2 ${
                msg.fromMe
                  ? "bg-green-600 text-white"
                  : "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {!msg.fromMe && (
                <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                  {msg.from}
                </p>
              )}
              <p className="text-sm">{msg.body}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-full border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || !phone.trim()}
            className="rounded-full bg-green-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
