"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const allSections = [
  {
    title: "Hospital",
    slug: "hospital",
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
    slug: "clinic",
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
    slug: "pharmacy",
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
    slug: "testing-labs",
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
    title: "Patients",
    slug: "patients",
    description: "Register patients, manage records, and track patient history",
    href: "/patients",
    color: "border-cyan-500",
    hoverBg: "hover:bg-cyan-50 dark:hover:bg-cyan-950/30",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/40",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  {
    title: "Items Editor",
    slug: "items-editor",
    description: "Manage medicines, lab tests, procedures, and supplies",
    href: "/items-editor",
    color: "border-indigo-500",
    hoverBg: "hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
      </svg>
    ),
  },
  {
    title: "Staff",
    slug: "staff",
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
  const [visibleSections, setVisibleSections] = useState(allSections);
  const [loading, setLoading] = useState(true);
  const [loginRole, setLoginRole] = useState<string | null>(null);
  const [staffName, setStaffName] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [clinicMode, setClinicMode] = useState(false);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    setIsFullscreen(!!document.fullscreenElement);
    setIsDark(document.documentElement.classList.contains("dark"));
    setClinicMode(localStorage.getItem("clinic_mode") === "true");
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const hiddenInClinicMode = ["hospital", "testing-labs"];

  function toggleClinicMode() {
    const next = !clinicMode;
    setClinicMode(next);
    localStorage.setItem("clinic_mode", String(next));
  }

  function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  useEffect(() => {
    const role = localStorage.getItem("login_role");
    const name = localStorage.getItem("staff_name");
    setLoginRole(role);
    setStaffName(name);

    if (role === "staff") {
      const staffId = localStorage.getItem("staff_id");
      if (staffId) {
        fetchStaffAccess(staffId);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchStaffAccess(staffId: string) {
    // Get section access for this staff member, join with sections to get slugs
    const { data, error } = await supabase
      .from("staff_section_access")
      .select("section_id, sections(slug)")
      .eq("staff_id", staffId);

    if (error || !data) {
      setVisibleSections([]);
      setLoading(false);
      return;
    }

    const allowedSlugs = data
      .map((row: Record<string, unknown>) => {
        const sec = row.sections;
        if (Array.isArray(sec)) return sec[0]?.slug as string | undefined;
        if (sec && typeof sec === "object") return (sec as { slug: string }).slug;
        return undefined;
      })
      .filter(Boolean) as string[];

    if (allowedSlugs.length === 0) {
      setVisibleSections([]);
    } else {
      setVisibleSections(allSections.filter((s) => allowedSlugs.includes(s.slug)));
    }
    setLoading(false);
  }

  const isAdmin = loginRole !== "staff";

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
              <span className="text-xs font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
                by Zenn Research
              </span>
            </div>
            {isAdmin && (
              <span className="rounded-full bg-gradient-to-r from-zinc-700 to-zinc-900 px-2.5 py-1 text-xs font-bold text-white shadow-sm dark:from-zinc-200 dark:to-zinc-400 dark:text-zinc-900">
                ADMIN
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 active:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:active:bg-zinc-800"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 active:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:active:bg-zinc-800"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white active:bg-red-700"
            >
              Logout
            </button>
            <div className="ml-1 flex items-center gap-2">
              <div className={`relative flex h-10 w-10 items-center justify-center rounded-full shadow-md ${isAdmin ? "bg-zinc-800 dark:bg-zinc-200" : "bg-emerald-600 dark:bg-emerald-500"}`}>
                {isAdmin ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white dark:text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-zinc-900" />
              </div>
              <div className="hidden flex-col sm:flex">
                <span className="text-sm font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
                  {isAdmin ? "Admin" : staffName ?? "Staff"}
                </span>
                <span className="text-xs leading-tight text-zinc-500 dark:text-zinc-400">
                  {isAdmin ? "Admin" : "Staff"} · Logged in
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              Welcome back{staffName ? `, ${staffName}` : ""}
            </h2>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              {isAdmin ? "Select a section to get started" : "Your accessible sections"}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={toggleClinicMode}
              className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 active:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:active:bg-zinc-800"
            >
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Clinic Mode</span>
              <div className={`relative h-6 w-11 rounded-full transition-colors ${clinicMode ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"}`}>
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${clinicMode ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-400 border-t-transparent" />
          </div>
        ) : visibleSections.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-500 dark:text-zinc-400">No sections assigned to your account.</p>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">Contact your admin to get access.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {visibleSections.filter((s) => !clinicMode || !hiddenInClinicMode.includes(s.slug)).map((section) => (
              <button
                key={section.title}
                onClick={() => router.push(section.href)}
                className={`group flex flex-col items-start gap-3 rounded-2xl border-t-4 ${section.color} bg-white p-5 text-left shadow-sm transition-all active:scale-[0.98] active:shadow-md ${section.hoverBg} dark:bg-zinc-900`}
              >
                <div className={`rounded-xl ${section.iconBg} p-3 ${section.iconColor}`}>
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {section.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
