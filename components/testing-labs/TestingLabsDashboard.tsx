"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import NfcTapButton from "@/components/NfcTapButton";
import type { Patient, TestOrder, TestResult } from "@/lib/store/patient-types";

type View = { kind: "tap" } | { kind: "patient"; patientId: string };

export default function TestingLabsDashboard() {
  const [view, setView] = useState<View>({ kind: "tap" });
  const [patient, setPatient] = useState<Patient | null>(null);
  const [testOrders, setTestOrders] = useState<(TestOrder & { test_results?: TestResult[] })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Result posting form
  const [resultOrderId, setResultOrderId] = useState<string | null>(null);
  const [resultText, setResultText] = useState("");

  const fetchPatientData = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);

    const [patientRes, testRes] = await Promise.all([
      supabase.from("patients").select("*").eq("id", patientId).single(),
      supabase.from("test_orders").select("*, test_results(*)").eq("patient_id", patientId).order("ordered_at", { ascending: false }),
    ]);

    if (patientRes.error || !patientRes.data) {
      setError("Patient not found");
      setLoading(false);
      return;
    }

    setPatient(patientRes.data);
    setTestOrders(testRes.data ?? []);
    setLoading(false);
  }, []);

  async function handleNfcResult(nfcId: string | null) {
    if (!nfcId) {
      setError("Blank card — please register this patient first at the Patients desk.");
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("patients").select("*").eq("nfc_card_id", nfcId).single();
    if (!data) {
      setError("No patient found for this card. Please register at the Patients desk first.");
      setLoading(false);
      return;
    }
    await fetchPatientData(data.id);
    setView({ kind: "patient", patientId: data.id });
  }

  async function handleMarkSampleCollected(orderId: string) {
    setSavingId(orderId);
    await supabase.from("test_orders").update({
      status: "sample_collected",
      sample_collected_at: new Date().toISOString(),
    }).eq("id", orderId);
    if (patient) await fetchPatientData(patient.id);
    setSavingId(null);
  }

  async function handlePostResult(orderId: string) {
    if (!resultText.trim()) return;
    setSavingId(orderId);

    await supabase.from("test_results").insert({
      test_order_id: orderId,
      result_text: resultText,
    });

    await supabase.from("test_orders").update({
      status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", orderId);

    setResultOrderId(null);
    setResultText("");
    if (patient) await fetchPatientData(patient.id);
    setSavingId(null);
  }

  const pendingTests = testOrders.filter((t) => t.status !== "completed");
  const completedTests = testOrders.filter((t) => t.status === "completed");

  function renderTap() {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="mb-2 text-lg font-semibold text-zinc-800 dark:text-zinc-200">Testing Labs</h2>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">Tap the patient&apos;s NFC card to view pending tests</p>
        <NfcTapButton onResult={handleNfcResult} label="Tap Patient Card" />
      </div>
    );
  }

  function renderPatientView() {
    if (!patient) return null;
    return (
      <div className="space-y-6">
        {/* Patient Info */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{patient.name}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {patient.age ? `${patient.age}y` : ""} {patient.gender ?? ""} {patient.blood_group ? `| ${patient.blood_group}` : ""}
            </p>
          </div>
          <button
            onClick={() => { setPatient(null); setView({ kind: "tap" }); }}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Scan Another
          </button>
        </div>

        {/* Pending Tests */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Pending Tests ({pendingTests.length})
          </h3>
          {pendingTests.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500">No pending tests for this patient.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTests.map((t) => (
                <div key={t.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.test_name}</p>
                      <p className="text-xs text-zinc-400">Ordered: {new Date(t.ordered_at).toLocaleString()}</p>
                      {t.sample_collected_at && <p className="text-xs text-blue-500">Sample collected: {new Date(t.sample_collected_at).toLocaleString()}</p>}
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      t.status === "ordered" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                      {t.status === "ordered" ? "Ordered" : "Sample Collected"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {t.status === "ordered" && (
                      <button
                        onClick={() => handleMarkSampleCollected(t.id)}
                        disabled={savingId === t.id}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingId === t.id ? "Saving..." : "Mark Sample Collected"}
                      </button>
                    )}
                    {t.status === "sample_collected" && resultOrderId !== t.id && (
                      <button
                        onClick={() => { setResultOrderId(t.id); setResultText(""); }}
                        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                      >
                        Post Results
                      </button>
                    )}
                  </div>

                  {resultOrderId === t.id && (
                    <div className="mt-3 space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Result</label>
                        <textarea
                          value={resultText}
                          onChange={(e) => setResultText(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          placeholder="Enter test result..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePostResult(t.id)}
                          disabled={savingId === t.id || !resultText.trim()}
                          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                          {savingId === t.id ? "Posting..." : "Submit Result"}
                        </button>
                        <button
                          onClick={() => setResultOrderId(null)}
                          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Tests */}
        {completedTests.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Completed Tests ({completedTests.length})
            </h3>
            <div className="space-y-3">
              {completedTests.map((t) => (
                <div key={t.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.test_name}</p>
                      {t.test_results && t.test_results.length > 0 && (
                        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">{t.test_results[0].result_text}</p>
                      )}
                      <p className="text-xs text-zinc-400">Completed: {t.completed_at ? new Date(t.completed_at).toLocaleString() : "N/A"}</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-1 text-sm text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Testing Labs</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Lab Tests &amp; Results</p>
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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          </div>
        ) : view.kind === "tap" ? renderTap() : renderPatientView()}
      </main>
    </div>
  );
}
