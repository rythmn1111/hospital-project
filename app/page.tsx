import QRCodeDisplay from "@/components/QRCodeDisplay";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Hospital WhatsApp
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Connect your WhatsApp to start messaging patients
        </p>
        <QRCodeDisplay />
      </div>
    </div>
  );
}
