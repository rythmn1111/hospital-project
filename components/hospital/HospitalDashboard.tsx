"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import NfcTapButton from "@/components/NfcTapButton";
import type { Patient, SupabaseAdmission } from "@/lib/store/patient-types";

type Tab = "patients" | "admissions";
type View =
  | { kind: "tap" }
  | { kind: "list" }
  | { kind: "details"; patientId: string }
  | { kind: "admit"; patientId: string }
  | { kind: "discharge"; admissionId: string };

const TOTAL_BEDS = 50;

export default function HospitalDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [admissions, setAdmissions] = useState<SupabaseAdmission[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("patients");
  const [view, setView] = useState<View>({ kind: "tap" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // NFC-identified patient
  const [nfcPatient, setNfcPatient] = useState<Patient | null>(null);

  // Admission form
  const [admDepartment, setAdmDepartment] = useState("");
  const [admDoctor, setAdmDoctor] = useState("");
  const [admBed, setAdmBed] = useState("");
  const [admDiagnosis, setAdmDiagnosis] = useState("");

  // Discharge form
  const [dischargeSummary, setDischargeSummary] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [pRes, aRes] = await Promise.all([
      supabase.from("patients").select("*").order("registered_at", { ascending: false }),
      supabase.from("admissions").select("*").order("admitted_at", { ascending: false }),
    ]);
    setPatients(pRes.data ?? []);
    setAdmissions(aRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleNfcResult(nfcId: string | null) {
    if (!nfcId) {
      setError("Blank card — please register at Patients desk first.");
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("patients").select("*").eq("nfc_card_id", nfcId).single();
    if (!data) {
      setError("No patient found for this card. Register at Patients desk first.");
      setLoading(false);
      return;
    }
    setNfcPatient(data);
    await fetchData();
    setView({ kind: "details", patientId: data.id });
    setActiveTab("patients");
  }

  async function handleAdmit(patientId: string) {
    if (!admDepartment.trim()) return;
    setSaving(true);
    const { error: err } = await supabase.from("admissions").insert({
      patient_id: patientId,
      department: admDepartment,
      doctor: admDoctor,
      bed_number: admBed,
      diagnosis: admDiagnosis,
      status: "admitted",
    });
    setSaving(false);
    if (err) {
      setError("Failed to admit: " + err.message);
      return;
    }
    setAdmDepartment("");
    setAdmDoctor("");
    setAdmBed("");
    setAdmDiagnosis("");
    await fetchData();
    setView({ kind: "details", patientId });
  }

  async function handleDischarge(admissionId: string) {
    setSaving(true);
    const { error: err } = await supabase.from("admissions").update({
      status: "discharged",
      discharged_at: new Date().toISOString(),
      discharge_summary: dischargeSummary,
    }).eq("id", admissionId);
    setSaving(false);
    if (err) {
      setError("Failed to discharge: " + err.message);
      return;
    }
    const adm = admissions.find((a) => a.id === admissionId);
    setDischargeSummary("");
    await fetchData();
    if (adm) setView({ kind: "details", patientId: adm.patient_id });
    else setView({ kind: "list" });
  }

  // Stats
  const currentlyAdmitted = admissions.filter((a) => a.status === "admitted").length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const dischargedToday = admissions.filter((a) => a.status === "discharged" && a.discharged_at?.slice(0, 10) === todayStr).length;
  const availableBeds = TOTAL_BEDS - currentlyAdmitted;

  const stats = [
    { label: "Total Patients", value: patients.length, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Currently Admitted", value: currentlyAdmitted, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Discharged Today", value: dischargedToday, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Available Beds", value: availableBeds, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
  ];

  function getPatientName(patientId: string) {
    return patients.find((p) => p.id === patientId)?.name ?? patientId;
  }

  function getPatientAdmission(patientId: string) {
    return admissions.find((a) => a.patient_id === patientId && a.status === "admitted");
  }

  const filteredPatients = patients.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.phone ?? "").includes(search)
  );

  function renderTap() {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="mb-2 text-lg font-semibold text-zinc-800 dark:text-zinc-200">Hospital — Inpatient</h2>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">Tap a patient&apos;s card or browse patients below</p>
        <NfcTapButton onResult={handleNfcResult} label="Tap Patient Card" />
        <button
          onClick={() => setView({ kind: "list" })}
          className="mt-4 text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          Or browse all patients
        </button>
      </div>
    );
  }

  function renderList() {
    return (
      <div>
        <div className="mb-4 flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button onClick={() => setView({ kind: "tap" })} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            Scan NFC
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Age</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Gender</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => {
                const activeAdm = getPatientAdmission(p.id);
                return (
                  <tr key={p.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{p.name}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.age ?? "-"}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.gender ?? "-"}</td>
                    <td className="px-4 py-3">
                      {activeAdm ? (
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Admitted</span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">Outpatient</span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => setView({ kind: "details", patientId: p.id })} className="text-blue-600 hover:underline dark:text-blue-400 text-xs">View</button>
                      {!activeAdm && (
                        <button onClick={() => { setView({ kind: "admit", patientId: p.id }); setAdmDepartment(""); setAdmDoctor(""); setAdmBed(""); setAdmDiagnosis(""); }} className="text-emerald-600 hover:underline dark:text-emerald-400 text-xs">Admit</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredPatients.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">No patients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderDetails() {
    if (view.kind !== "details") return null;
    const p = patients.find((pt) => pt.id === view.patientId);
    if (!p) return null;
    const patientAdmissions = admissions.filter((a) => a.patient_id === p.id).sort((a, b) => new Date(b.admitted_at).getTime() - new Date(a.admitted_at).getTime());
    const activeAdm = patientAdmissions.find((a) => a.status === "admitted");

    return (
      <div className="space-y-6">
        <button onClick={() => setView({ kind: "list" })} className="text-sm text-blue-600 hover:underline dark:text-blue-400">&larr; Back to list</button>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{p.name}</h2>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-zinc-500">Age:</span> <span className="text-zinc-900 dark:text-zinc-100">{p.age ?? "-"}</span></div>
            <div><span className="text-zinc-500">Gender:</span> <span className="text-zinc-900 dark:text-zinc-100">{p.gender ?? "-"}</span></div>
            <div><span className="text-zinc-500">Phone:</span> <span className="text-zinc-900 dark:text-zinc-100">{p.phone ?? "-"}</span></div>
            <div><span className="text-zinc-500">Blood Group:</span> <span className="text-zinc-900 dark:text-zinc-100">{p.blood_group ?? "-"}</span></div>
          </div>
          <div className="mt-4 flex gap-2">
            {activeAdm ? (
              <button
                onClick={() => { setView({ kind: "discharge", admissionId: activeAdm.id }); setDischargeSummary(""); }}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                Discharge
              </button>
            ) : (
              <button
                onClick={() => { setView({ kind: "admit", patientId: p.id }); setAdmDepartment(""); setAdmDoctor(""); setAdmBed(""); setAdmDiagnosis(""); }}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                New Admission
              </button>
            )}
          </div>
        </div>

        {/* Admission History */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Admission History ({patientAdmissions.length})</h3>
          {patientAdmissions.length === 0 ? (
            <p className="text-sm text-zinc-500">No admissions.</p>
          ) : (
            <div className="space-y-3">
              {patientAdmissions.map((a) => (
                <div key={a.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{a.department} — Bed {a.bed_number}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      a.status === "admitted" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}>{a.status === "admitted" ? "Admitted" : "Discharged"}</span>
                  </div>
                  <div className="text-xs text-zinc-500 space-y-1">
                    {a.doctor && <p>Doctor: {a.doctor}</p>}
                    {a.diagnosis && <p>Diagnosis: {a.diagnosis}</p>}
                    <p>Admitted: {new Date(a.admitted_at).toLocaleString()}</p>
                    {a.discharged_at && <p>Discharged: {new Date(a.discharged_at).toLocaleString()}</p>}
                    {a.discharge_summary && <p className="mt-1 text-zinc-600 dark:text-zinc-400">Summary: {a.discharge_summary}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderAdmitForm() {
    if (view.kind !== "admit") return null;
    const p = patients.find((pt) => pt.id === view.patientId);
    if (!p) return null;

    return (
      <div className="space-y-6">
        <button onClick={() => setView({ kind: "details", patientId: p.id })} className="text-sm text-blue-600 hover:underline dark:text-blue-400">&larr; Back</button>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Admit — {p.name}</h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Department *</label>
            <input value={admDepartment} onChange={(e) => setAdmDepartment(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" placeholder="e.g. Cardiology" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Doctor</label>
            <input value={admDoctor} onChange={(e) => setAdmDoctor(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" placeholder="e.g. Dr. Mehra" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bed Number</label>
            <input value={admBed} onChange={(e) => setAdmBed(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" placeholder="e.g. ICU-03" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Diagnosis</label>
            <textarea value={admDiagnosis} onChange={(e) => setAdmDiagnosis(e.target.value)} rows={2}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" placeholder="Admission diagnosis..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleAdmit(p.id)} disabled={saving || !admDepartment.trim()}
              className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
              {saving ? "Admitting..." : "Admit Patient"}
            </button>
            <button onClick={() => setView({ kind: "details", patientId: p.id })}
              className="rounded-lg border border-zinc-300 px-6 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  function renderDischargeForm() {
    if (view.kind !== "discharge") return null;
    const adm = admissions.find((a) => a.id === view.admissionId);
    if (!adm) return null;
    const p = patients.find((pt) => pt.id === adm.patient_id);

    return (
      <div className="space-y-6">
        <button onClick={() => setView({ kind: "details", patientId: adm.patient_id })} className="text-sm text-blue-600 hover:underline dark:text-blue-400">&larr; Back</button>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Discharge — {p?.name ?? "Patient"}</h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <p>Department: {adm.department} | Bed: {adm.bed_number}</p>
            <p>Admitted: {new Date(adm.admitted_at).toLocaleString()}</p>
            {adm.diagnosis && <p>Diagnosis: {adm.diagnosis}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Discharge Summary</label>
            <textarea value={dischargeSummary} onChange={(e) => setDischargeSummary(e.target.value)} rows={4}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Discharge notes and summary..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleDischarge(adm.id)} disabled={saving}
              className="rounded-lg bg-amber-600 px-6 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">
              {saving ? "Discharging..." : "Discharge Patient"}
            </button>
            <button onClick={() => setView({ kind: "details", patientId: adm.patient_id })}
              className="rounded-lg border border-zinc-300 px-6 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  function renderAdmissionsTab() {
    return (
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Patient</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Department</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Bed</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Admitted</th>
            </tr>
          </thead>
          <tbody>
            {admissions.map((a) => (
              <tr key={a.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                <td className="px-4 py-3">
                  <button onClick={() => setView({ kind: "details", patientId: a.patient_id })} className="text-blue-600 hover:underline dark:text-blue-400 font-medium">
                    {getPatientName(a.patient_id)}
                  </button>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{a.department}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{a.bed_number}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    a.status === "admitted" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}>{a.status === "admitted" ? "Admitted" : "Discharged"}</span>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{new Date(a.admitted_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {admissions.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">No admissions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "patients", label: "Patients" },
    { key: "admissions", label: "All Admissions" },
  ];

  function renderContent() {
    if (loading) {
      return (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      );
    }

    if (view.kind === "tap") return renderTap();
    if (view.kind === "details") return renderDetails();
    if (view.kind === "admit") return renderAdmitForm();
    if (view.kind === "discharge") return renderDischargeForm();

    switch (activeTab) {
      case "patients": return renderList();
      case "admissions": return renderAdmissionsTab();
      default: return null;
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-1 text-sm text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Hospital</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Inpatient Management</p>
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

        {/* Tabs (only show when in list views) */}
        {(view.kind === "list" || (view.kind === "tap" && false)) && (
          <div className="mb-6 flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setView({ kind: "list" }); }}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === t.key ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {renderContent()}
      </main>
    </div>
  );
}
