"use client";

import { useEffect, useState } from "react";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    setHasToken(!!localStorage.getItem("wa_token"));
  }, []);

  // Avoid flash while checking localStorage
  if (hasToken === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (hasToken) {
    return <Dashboard />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Hospital Management
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Connect your WhatsApp to start managing your hospital
        </p>
        <QRCodeDisplay />
      </div>
    </div>
  );
}
