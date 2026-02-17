"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { nfcWrite, generateNfcId } from "@/lib/nfc";
import { bleIsConnected, bleNfcWrite } from "@/lib/nfc-ble";
import NfcTapButton from "@/components/NfcTapButton";
import type { Patient } from "@/lib/store/patient-types";
import PatientListView from "./PatientListView";
import PatientForm from "./PatientForm";
import PatientDetailsView from "./PatientDetailsView";

type Tab = "list" | "register" | "nfc-register";
type View =
  | { kind: "list" }
  | { kind: "details"; patientId: string }
  | { kind: "edit"; patientId: string };

export default function PatientsDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("list");
  const [view, setView] = useState<View>({ kind: "list" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NFC registration flow
  const [nfcCardId, setNfcCardId] = useState<string | null>(null);
  const [nfcStep, setNfcStep] = useState<"tap" | "writing" | "form" | "found">("tap");
  const [nfcWriteError, setNfcWriteError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("patients")
      .select("*")
      .order("registered_at", { ascending: false });

    if (err) {
      setError("Failed to load patients: " + err.message);
      setLoading(false);
      return;
    }
    setPatients(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  async function handleRegister(data: Omit<Patient, "id" | "registered_at">) {
    setSaving(true);
    const { error: err } = await supabase.from("patients").insert(data);
    setSaving(false);
    if (err) {
      setError("Failed to register patient: " + err.message);
      return;
    }
    await fetchPatients();
    setActiveTab("list");
    setView({ kind: "list" });
    setNfcCardId(null);
    setNfcStep("tap");
  }

  async function handleEdit(patientId: string, data: Omit<Patient, "id" | "registered_at">) {
    setSaving(true);
    const { error: err } = await supabase.from("patients").update(data).eq("id", patientId);
    setSaving(false);
    if (err) {
      setError("Failed to update patient: " + err.message);
      return;
    }
    await fetchPatients();
    setView({ kind: "details", patientId });
  }

  async function handleDelete(patientId: string) {
    if (!confirm("Are you sure you want to delete this patient?")) return;
    const { error: err } = await supabase.from("patients").delete().eq("id", patientId);
    if (err) {
      setError("Failed to delete patient: " + err.message);
      return;
    }
    await fetchPatients();
    setView({ kind: "list" });
  }

  async function handleNfcResult(nfcId: string | null) {
    setNfcWriteError(null);

    if (nfcId) {
      // Card has an ID — check if patient exists
      const { data } = await supabase.from("patients").select("*").eq("nfc_card_id", nfcId).single();
      if (data) {
        // Patient found — show their details
        setNfcStep("found");
        await fetchPatients();
        setView({ kind: "details", patientId: data.id });
        setActiveTab("nfc-register");
        return;
      }
      // Card has ID but no patient — use this ID for registration
      setNfcCardId(nfcId);
      setNfcStep("form");
      return;
    }

    // Blank card — generate new ID and write it
    const newId = generateNfcId();
    setNfcStep("writing");
    try {
      const useBle = localStorage.getItem("hospitalos-nfc-mode") === "bluetooth" && bleIsConnected();
      if (useBle) {
        await bleNfcWrite(newId, 35000);
      } else {
        await nfcWrite(newId, 30);
      }
      setNfcCardId(newId);
      setNfcStep("form");
    } catch {
      setNfcWriteError("Failed to write NFC card. Please try again.");
      setNfcStep("tap");
    }
  }

  const totalPatients = patients.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const registeredToday = patients.filter((p) => p.registered_at.slice(0, 10) === todayStr).length;

  const stats = [
    { label: "Total Patients", value: totalPatients, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
    { label: "Registered Today", value: registeredToday, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: "list", label: "All Patients" },
    { key: "nfc-register", label: "Tap Card to Register" },
    { key: "register", label: "Manual Register" },
  ];

  function renderNfcRegister() {
    if (nfcStep === "tap") {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="mb-2 text-lg font-semibold text-zinc-800 dark:text-zinc-200">Patient Registration</h2>
          <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">Tap an NFC card to register a new patient or find an existing one</p>
          {nfcWriteError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {nfcWriteError}
            </div>
          )}
          <NfcTapButton onResult={handleNfcResult} label="Tap NFC Card" />
        </div>
      );
    }

    if (nfcStep === "writing") {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent mb-4" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Writing new ID to card... keep card on reader</p>
        </div>
      );
    }

    if (nfcStep === "found") {
      return null; // View is set to details, handled by renderContent
    }

    // nfcStep === "form"
    return (
      <div>
        <div className="mb-4 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300">
          NFC Card ID: <span className="font-mono font-medium">{nfcCardId}</span> — Fill in the patient details below
        </div>
        <PatientForm
          nfcCardId={nfcCardId}
          onSubmit={handleRegister}
          onCancel={() => { setNfcStep("tap"); setNfcCardId(null); setActiveTab("nfc-register"); }}
          loading={saving}
        />
      </div>
    );
  }

  function renderContent() {
    if (loading) {
      return (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
        </div>
      );
    }

    if (view.kind === "details") {
      const patient = patients.find((p) => p.id === view.patientId);
      if (!patient) return null;
      return (
        <PatientDetailsView
          patient={patient}
          onBack={() => { setView({ kind: "list" }); if (activeTab === "nfc-register") { setNfcStep("tap"); } }}
          onEdit={(id) => setView({ kind: "edit", patientId: id })}
        />
      );
    }

    if (view.kind === "edit") {
      const patient = patients.find((p) => p.id === view.patientId);
      if (!patient) return null;
      return (
        <PatientForm
          initial={patient}
          onSubmit={(data) => handleEdit(view.patientId, data)}
          onCancel={() => setView({ kind: "details", patientId: view.patientId })}
          loading={saving}
        />
      );
    }

    switch (activeTab) {
      case "list":
        return (
          <PatientListView
            patients={patients}
            onView={(id) => { setView({ kind: "details", patientId: id }); setActiveTab("list"); }}
            onEdit={(id) => { setView({ kind: "edit", patientId: id }); setActiveTab("list"); }}
            onDelete={handleDelete}
          />
        );
      case "nfc-register":
        return renderNfcRegister();
      case "register":
        return (
          <PatientForm
            onSubmit={handleRegister}
            onCancel={() => { setActiveTab("list"); setView({ kind: "list" }); }}
            loading={saving}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Patients</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Register &amp; Manage Patient Records</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
            <button onClick={() => setError(null)} className="ml-2 font-medium underline">Dismiss</button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-xl ${s.bg} border border-zinc-200 p-4 dark:border-zinc-800`}>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                setView({ kind: "list" });
                if (t.key === "nfc-register") setNfcStep("tap");
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === t.key
                  ? "bg-cyan-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
