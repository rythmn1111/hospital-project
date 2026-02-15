"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/Dashboard";
import { supabase } from "@/lib/supabase";

type LoginRole = "admin" | "staff" | null;

export default function Home() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [selectedRole, setSelectedRole] = useState<LoginRole>(null);

  // Staff login state
  const [staffUsername, setStaffUsername] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffError, setStaffError] = useState("");
  const [staffLoading, setStaffLoading] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("logged_in"));
  }, []);

  // Avoid flash while checking localStorage
  if (loggedIn === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (loggedIn) {
    return <Dashboard />;
  }

  function handleAdminLogin() {
    localStorage.setItem("logged_in", "true");
    localStorage.setItem("login_role", "admin");
    window.location.href = "/";
  }

  async function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!staffUsername.trim() || !staffPassword.trim()) {
      setStaffError("Please enter both username and password");
      return;
    }

    setStaffLoading(true);
    setStaffError("");

    const { data, error } = await supabase
      .from("staff")
      .select("id, name, username, password")
      .eq("username", staffUsername.trim())
      .eq("password", staffPassword.trim())
      .single();

    setStaffLoading(false);

    if (error || !data) {
      setStaffError("Invalid username or password");
      return;
    }

    localStorage.setItem("logged_in", "true");
    localStorage.setItem("login_role", "staff");
    localStorage.setItem("staff_id", data.id);
    localStorage.setItem("staff_name", data.name);
    window.location.href = "/";
  }

  // Role selection screen
  if (!selectedRole) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              HospitalOS
            </h1>
            <p className="mt-1 text-sm tracking-wide text-zinc-500 dark:text-zinc-400">
              by Zenn Research
            </p>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Select your login type to continue
            </p>
          </div>

          <div className="grid w-full max-w-md grid-cols-2 gap-4 px-4">
            {/* Admin Card */}
            <button
              onClick={() => setSelectedRole("admin")}
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-zinc-200 bg-white p-6 shadow-sm transition-all active:border-blue-500 active:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:active:border-blue-500"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/40 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Admin</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Full access to all sections
                </p>
              </div>
            </button>

            {/* Staff Card */}
            <button
              onClick={() => setSelectedRole("staff")}
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-zinc-200 bg-white p-6 shadow-sm transition-all active:border-emerald-500 active:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:active:border-emerald-500"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-900/40 dark:text-emerald-400 dark:group-hover:bg-emerald-600 dark:group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Staff</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Login with credentials
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin login — direct bypass
  if (selectedRole === "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => setSelectedRole(null)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Admin Login
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Access all hospital sections as administrator
          </p>
          <button
            onClick={handleAdminLogin}
            className="rounded-2xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white active:bg-blue-700"
          >
            Login as Admin
          </button>
        </div>
      </div>
    );
  }

  // Staff login — Username/Password validated against Supabase
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 px-4">
        <button
          onClick={() => setSelectedRole(null)}
          className="flex items-center gap-1 self-start text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Staff Login
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleStaffLogin} className="w-full space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Username
            </label>
            <input
              type="text"
              value={staffUsername}
              onChange={(e) => setStaffUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              type="password"
              value={staffPassword}
              onChange={(e) => setStaffPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          {staffError && (
            <p className="text-sm text-red-500">{staffError}</p>
          )}
          <button
            type="submit"
            disabled={staffLoading}
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white active:bg-emerald-700 disabled:opacity-50"
          >
            {staffLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
