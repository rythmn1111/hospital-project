"use client";

import { useRouter } from "next/navigation";

const sections = [
  {
    title: "Hospital",
    description: "Manage inpatient records, admissions, and discharge summaries",
    href: "/hospital",
    color: "border-blue-500",
    hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M9 21V8l-3 2V21M15 21V8l3 2V21M12 3v4M10 5h4M9 8h6" />
      </svg>
    ),
  },
  {
    title: "Clinic",
    description: "Schedule appointments, manage OPD visits, and consultations",
    href: "/clinic",
    color: "border-emerald-500",
    hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a23.508 23.508 0 0 0-1.66-.104A23.318 23.318 0 0 0 12 3.34a23.318 23.318 0 0 0 7.402 6.703 23.486 23.486 0 0 0-1.66.104m-15.482 0c-.33.035-.66.074-.987.116A48.6 48.6 0 0 1 12 13.5a48.601 48.601 0 0 1 7.741-3.237c-.327-.042-.657-.081-.987-.116" />
      </svg>
    ),
  },
  {
    title: "Pharmacy",
    description: "Track inventory, prescriptions, and medicine dispensing",
    href: "/pharmacy",
    color: "border-purple-500",
    hoverBg: "hover:bg-purple-50 dark:hover:bg-purple-950/30",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-1.46 4.38A2.25 2.25 0 0 1 15.4 21H8.6a2.25 2.25 0 0 1-2.14-2.12L5 14.5m14 0H5" />
      </svg>
    ),
  },
  {
    title: "Testing Labs",
    description: "Order lab tests, view reports, and track sample status",
    href: "/testing-labs",
    color: "border-amber-500",
    hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-950/30",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-1.46 4.38A2.25 2.25 0 0 1 15.4 21H8.6a2.25 2.25 0 0 1-2.14-2.12L5 14.5m14 0H5" />
      </svg>
    ),
  },
  {
    title: "Staff",
    description: "Manage doctors, nurses, and other hospital staff records",
    href: "/staff",
    color: "border-rose-500",
    hoverBg: "hover:bg-rose-50 dark:hover:bg-rose-950/30",
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
    iconColor: "text-rose-600 dark:text-rose-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
];

export default function Dashboard() {
  const router = useRouter();

  const handleDisconnect = () => {
    localStorage.removeItem("wa_token");
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight text-zinc-900 dark:text-zinc-100">
                HospitalOS
              </h1>
              <span className="text-[10px] font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
                by Zenn Research
              </span>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              WhatsApp Connected
            </span>
            <span className="rounded-full bg-gradient-to-r from-zinc-700 to-zinc-900 px-2.5 py-1 text-xs font-bold text-white shadow-sm dark:from-zinc-200 dark:to-zinc-400 dark:text-zinc-900">
              PRO
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDisconnect}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Disconnect
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Logout
            </button>
            <div className="ml-1 flex items-center gap-2">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 shadow-md dark:bg-zinc-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white dark:text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-zinc-900" />
              </div>
              <div className="hidden flex-col sm:flex">
                <span className="text-sm font-semibold leading-tight text-zinc-900 dark:text-zinc-100">Admin</span>
                <span className="text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">Logged in</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Welcome back
          </h2>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Select a section to get started
          </p>
        </div>

        {/* Section Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <button
              key={section.title}
              onClick={() => router.push(section.href)}
              className={`group flex flex-col items-start gap-4 rounded-2xl border-t-4 ${section.color} bg-white p-6 text-left shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${section.hoverBg} dark:bg-zinc-900`}
            >
              <div className={`rounded-xl ${section.iconBg} p-3 ${section.iconColor}`}>
                {section.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {section.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {section.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Floating Chat Shortcut */}
      <button
        onClick={() => router.push("/chat")}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-all hover:scale-110 hover:bg-green-700 hover:shadow-xl"
        title="Open WhatsApp Chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );
}
