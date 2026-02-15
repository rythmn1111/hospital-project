"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import NfcTapButton from "@/components/NfcTapButton";
import type { Patient, Prescription } from "@/lib/store/patient-types";

type View = { kind: "tap" } | { kind: "patient"; patientId: string };

export default function PharmacyDashboard() {
  const [view, setView] = useState<View>({ kind: "tap" });
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dispensingId, setDispensingId] = useState<string | null>(null);

  const fetchPatientData = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);

    const [patientRes, rxRes] = await Promise.all([
      supabase.from("patients").select("*").eq("id", patientId).single(),
      supabase.from("prescriptions").select("*").eq("patient_id", patientId).order("prescribed_at", { ascending: false }),
    ]);

    if (patientRes.error || !patientRes.data) {
      setError("Patient not found");
      setLoading(false);
      return;
    }

    setPatient(patientRes.data);
    setPrescriptions(rxRes.data ?? []);
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

  async function handleDispense(prescriptionId: string) {
    setDispensingId(prescriptionId);
    await supabase.from("prescriptions").update({
      status: "dispensed",
      dispensed_at: new Date().toISOString(),
    }).eq("id", prescriptionId);
    if (patient) await fetchPatientData(patient.id);
    setDispensingId(null);
  }

  async function handleDispenseAll() {
    const pending = prescriptions.filter((rx) => rx.status === "prescribed");
    if (pending.length === 0) return;
    setDispensingId("all");
    const ids = pending.map((rx) => rx.id);
    await supabase.from("prescriptions").update({
      status: "dispensed",
      dispensed_at: new Date().toISOString(),
    }).in("id", ids);
    if (patient) await fetchPatientData(patient.id);
    setDispensingId(null);
  }

  const pendingRx = prescriptions.filter((rx) => rx.status === "prescribed");
  const dispensedRx = prescriptions.filter((rx) => rx.status === "dispensed");

  function renderTap() {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="mb-2 text-lg font-semibold text-zinc-800 dark:text-zinc-200">Pharmacy</h2>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">Tap the patient&apos;s NFC card to view prescriptions</p>
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

        {/* Pending Prescriptions */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Pending Prescriptions ({pendingRx.length})
            </h3>
            {pendingRx.length > 1 && (
              <button
                onClick={handleDispenseAll}
                disabled={dispensingId === "all"}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {dispensingId === "all" ? "Dispensing..." : "Dispense All"}
              </button>
            )}
          </div>
          {pendingRx.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500">No pending prescriptions for this patient.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRx.map((rx) => (
                <div key={rx.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{rx.medicine_name}</p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {rx.dosage && <span>Dosage: {rx.dosage}</span>}
                        {rx.frequency && <span>Frequency: {rx.frequency}</span>}
                        {rx.duration && <span>Duration: {rx.duration}</span>}
                      </div>
                      {rx.instructions && <p className="mt-1 text-xs text-zinc-400 italic">{rx.instructions}</p>}
                      <p className="mt-1 text-xs text-zinc-400">Prescribed: {new Date(rx.prescribed_at).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleDispense(rx.id)}
                      disabled={dispensingId === rx.id || dispensingId === "all"}
                      className="ml-4 shrink-0 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                    >
                      {dispensingId === rx.id ? "..." : "Dispense"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dispensed History */}
        {dispensedRx.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Dispensed ({dispensedRx.length})
            </h3>
            <div className="space-y-2">
              {dispensedRx.map((rx) => (
                <div key={rx.id} className="rounded-xl border border-zinc-200 bg-white p-4 opacity-75 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{rx.medicine_name} {rx.dosage}</p>
                      <p className="text-xs text-zinc-500">{rx.frequency} | {rx.duration}</p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Dispensed
                      </span>
                      {rx.dispensed_at && <p className="mt-1 text-xs text-zinc-400">{new Date(rx.dispensed_at).toLocaleString()}</p>}
                    </div>
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
          <Link href="/" className="flex items-center gap-1 text-sm text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Pharmacy</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Dispense Medications</p>
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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
          </div>
        ) : view.kind === "tap" ? renderTap() : renderPatientView()}
      </main>
    </div>
  );
}
