"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import NfcTapButton from "@/components/NfcTapButton";
import type {
  Patient,
  Consultation,
  TestOrder,
  TestResult,
  Prescription,
} from "@/lib/store/patient-types";

type View =
  | { kind: "tap" }
  | { kind: "patient"; patientId: string }
  | { kind: "new-consultation"; patientId: string }
  | { kind: "consultation-detail"; consultationId: string; patientId: string };

export default function ClinicDashboard() {
  const [view, setView] = useState<View>({ kind: "tap" });
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [testOrders, setTestOrders] = useState<(TestOrder & { test_results?: TestResult[] })[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Items for dropdowns
  const [labTests, setLabTests] = useState<{ id: string; name: string }[]>([]);
  const [medicines, setMedicines] = useState<{ id: string; name: string }[]>([]);

  // Consultation form
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Test ordering
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [showTestPicker, setShowTestPicker] = useState(false);

  // Prescription
  const [rxList, setRxList] = useState<{ medicine_name: string; dosage: string; frequency: string; duration: string; instructions: string }[]>([]);
  const [showRxForm, setShowRxForm] = useState(false);
  const [rxMedicine, setRxMedicine] = useState("");
  const [rxDosage, setRxDosage] = useState("");
  const [rxFrequency, setRxFrequency] = useState("");
  const [rxDuration, setRxDuration] = useState("");
  const [rxInstructions, setRxInstructions] = useState("");

  const fetchPatientData = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);

    const [patientRes, consultRes, testRes, rxRes, labTestsRes, medsRes] = await Promise.all([
      supabase.from("patients").select("*").eq("id", patientId).single(),
      supabase.from("consultations").select("*").eq("patient_id", patientId).order("consulted_at", { ascending: false }),
      supabase.from("test_orders").select("*, test_results(*)").eq("patient_id", patientId).order("ordered_at", { ascending: false }),
      supabase.from("prescriptions").select("*").eq("patient_id", patientId).order("prescribed_at", { ascending: false }),
      supabase.from("items").select("id, name").eq("is_active", true).eq("category_id", (await supabase.from("item_categories").select("id").eq("slug", "lab-test").single()).data?.id ?? ""),
      supabase.from("items").select("id, name").eq("is_active", true).eq("category_id", (await supabase.from("item_categories").select("id").eq("slug", "medicine").single()).data?.id ?? ""),
    ]);

    if (patientRes.error || !patientRes.data) {
      setError("Patient not found");
      setLoading(false);
      return;
    }

    setPatient(patientRes.data);
    setConsultations(consultRes.data ?? []);
    setTestOrders(testRes.data ?? []);
    setPrescriptions(rxRes.data ?? []);
    setLabTests(labTestsRes.data ?? []);
    setMedicines(medsRes.data ?? []);
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

  async function handleSaveConsultation() {
    if (!patient) return;
    setSaving(true);

    const { data: consultation, error: err } = await supabase
      .from("consultations")
      .insert({ patient_id: patient.id, symptoms, diagnosis, notes })
      .select()
      .single();

    if (err || !consultation) {
      setError("Failed to save consultation: " + (err?.message ?? "Unknown error"));
      setSaving(false);
      return;
    }

    // Create test orders
    if (selectedTests.length > 0) {
      const testInserts = selectedTests.map((name) => ({
        consultation_id: consultation.id,
        patient_id: patient.id,
        test_name: name,
        status: "ordered" as const,
      }));
      await supabase.from("test_orders").insert(testInserts);
    }

    // Create prescriptions
    if (rxList.length > 0) {
      const rxInserts = rxList.map((rx) => ({
        consultation_id: consultation.id,
        patient_id: patient.id,
        ...rx,
        status: "prescribed" as const,
      }));
      await supabase.from("prescriptions").insert(rxInserts);
    }

    // Reset form
    setSymptoms("");
    setDiagnosis("");
    setNotes("");
    setSelectedTests([]);
    setRxList([]);
    setSaving(false);

    await fetchPatientData(patient.id);
    setView({ kind: "patient", patientId: patient.id });
  }

  function addRx() {
    if (!rxMedicine.trim()) return;
    setRxList((prev) => [...prev, { medicine_name: rxMedicine, dosage: rxDosage, frequency: rxFrequency, duration: rxDuration, instructions: rxInstructions }]);
    setRxMedicine("");
    setRxDosage("");
    setRxFrequency("");
    setRxDuration("");
    setRxInstructions("");
    setShowRxForm(false);
  }

  function renderTap() {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="mb-2 text-lg font-semibold text-zinc-800 dark:text-zinc-200">Clinic — Doctor&apos;s Station</h2>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">Tap the patient&apos;s NFC card to begin</p>
        <NfcTapButton onResult={handleNfcResult} label="Tap Patient Card" />
      </div>
    );
  }

  function renderPatientView() {
    if (!patient) return null;
    return (
      <div className="space-y-6">
        {/* Patient Info Bar */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{patient.name}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {patient.age ? `${patient.age}y` : ""} {patient.gender ?? ""} {patient.blood_group ? `| ${patient.blood_group}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setView({ kind: "new-consultation", patientId: patient.id });
                setSymptoms("");
                setDiagnosis("");
                setNotes("");
                setSelectedTests([]);
                setRxList([]);
              }}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              New Consultation
            </button>
            <button
              onClick={() => { setPatient(null); setView({ kind: "tap" }); }}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Scan Another
            </button>
          </div>
        </div>

        {/* Pending Test Results */}
        {testOrders.some((t) => t.status === "completed" && t.test_results && t.test_results.length > 0) && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
            <h3 className="mb-3 text-sm font-semibold text-emerald-800 dark:text-emerald-300">Recent Test Results</h3>
            <div className="space-y-2">
              {testOrders.filter((t) => t.status === "completed" && t.test_results && t.test_results.length > 0).map((t) => (
                <div key={t.id} className="rounded-lg bg-white p-3 dark:bg-zinc-900">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.test_name}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.test_results![0].result_text}</p>
                  <p className="text-xs text-zinc-400">{new Date(t.test_results![0].posted_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Tests */}
        {testOrders.some((t) => t.status !== "completed") && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <h3 className="mb-3 text-sm font-semibold text-amber-800 dark:text-amber-300">Pending Tests</h3>
            <div className="space-y-2">
              {testOrders.filter((t) => t.status !== "completed").map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg bg-white p-3 dark:bg-zinc-900">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.test_name}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    t.status === "ordered" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}>
                    {t.status === "ordered" ? "Ordered" : "Sample Collected"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consultation History */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Consultation History</h3>
          {consultations.length === 0 ? (
            <p className="text-sm text-zinc-500">No consultations yet.</p>
          ) : (
            <div className="space-y-3">
              {consultations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setView({ kind: "consultation-detail", consultationId: c.id, patientId: patient.id })}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-4 text-left transition hover:border-green-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-green-700"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{c.diagnosis || "No diagnosis"}</p>
                    <p className="text-xs text-zinc-400">{new Date(c.consulted_at).toLocaleDateString()}</p>
                  </div>
                  {c.symptoms && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Symptoms: {c.symptoms}</p>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prescription History */}
        {prescriptions.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Recent Prescriptions</h3>
            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                    <th className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-400">Medicine</th>
                    <th className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-400">Dosage</th>
                    <th className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-400">Frequency</th>
                    <th className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.slice(0, 10).map((rx) => (
                    <tr key={rx.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                      <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{rx.medicine_name}</td>
                      <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{rx.dosage}</td>
                      <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{rx.frequency}</td>
                      <td className="px-4 py-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          rx.status === "dispensed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}>{rx.status === "dispensed" ? "Dispensed" : "Pending"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderNewConsultation() {
    if (!patient) return null;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView({ kind: "patient", patientId: patient.id })} className="text-sm text-green-600 hover:underline dark:text-green-400">
            &larr; Back
          </button>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">New Consultation — {patient.name}</h2>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Symptoms</label>
              <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={3}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="Patient's reported symptoms..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Diagnosis</label>
              <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="Doctor's diagnosis..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="Additional notes..." />
            </div>
          </div>
        </div>

        {/* Order Tests */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Order Tests</h3>
            <button onClick={() => setShowTestPicker(!showTestPicker)} className="text-sm text-green-600 hover:underline dark:text-green-400">
              + Add Test
            </button>
          </div>
          {showTestPicker && (
            <div className="mb-3 flex flex-wrap gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
              {labTests.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (!selectedTests.includes(t.name)) setSelectedTests((p) => [...p, t.name]);
                    setShowTestPicker(false);
                  }}
                  className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:border-green-500 hover:text-green-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {t.name}
                </button>
              ))}
              {labTests.length === 0 && <p className="text-xs text-zinc-500">No lab tests in Items Editor. Add them first.</p>}
            </div>
          )}
          {selectedTests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTests.map((name) => (
                <span key={name} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {name}
                  <button onClick={() => setSelectedTests((p) => p.filter((n) => n !== name))} className="ml-1 text-green-500 hover:text-red-500">&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Prescriptions */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Prescriptions</h3>
            <button onClick={() => setShowRxForm(!showRxForm)} className="text-sm text-green-600 hover:underline dark:text-green-400">
              + Add Medicine
            </button>
          </div>
          {showRxForm && (
            <div className="mb-4 space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Medicine</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {medicines.map((m) => (
                    <button key={m.id} onClick={() => setRxMedicine(m.name)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${rxMedicine === m.name ? "border-green-500 bg-green-100 text-green-700" : "border-zinc-300 text-zinc-600 hover:border-green-400 dark:border-zinc-600 dark:text-zinc-400"}`}>
                      {m.name}
                    </button>
                  ))}
                </div>
                <input value={rxMedicine} onChange={(e) => setRxMedicine(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="Or type medicine name..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Dosage</label>
                  <input value={rxDosage} onChange={(e) => setRxDosage(e.target.value)} placeholder="e.g. 500mg"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Frequency</label>
                  <input value={rxFrequency} onChange={(e) => setRxFrequency(e.target.value)} placeholder="e.g. Twice daily"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Duration</label>
                  <input value={rxDuration} onChange={(e) => setRxDuration(e.target.value)} placeholder="e.g. 7 days"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Instructions</label>
                  <input value={rxInstructions} onChange={(e) => setRxInstructions(e.target.value)} placeholder="e.g. After meals"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addRx} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">Add</button>
                <button onClick={() => setShowRxForm(false)} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">Cancel</button>
              </div>
            </div>
          )}
          {rxList.length > 0 && (
            <div className="space-y-2">
              {rxList.map((rx, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{rx.medicine_name} {rx.dosage}</p>
                    <p className="text-xs text-zinc-500">{rx.frequency} | {rx.duration} {rx.instructions ? `| ${rx.instructions}` : ""}</p>
                  </div>
                  <button onClick={() => setRxList((p) => p.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700">&times;</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={handleSaveConsultation} disabled={saving}
            className="rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save Consultation"}
          </button>
          <button onClick={() => setView({ kind: "patient", patientId: patient.id })}
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function renderConsultationDetail() {
    if (view.kind !== "consultation-detail" || !patient) return null;
    const consultation = consultations.find((c) => c.id === view.consultationId);
    if (!consultation) return null;

    const relatedTests = testOrders.filter((t) => t.consultation_id === consultation.id);
    const relatedRx = prescriptions.filter((r) => r.consultation_id === consultation.id);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView({ kind: "patient", patientId: patient.id })} className="text-sm text-green-600 hover:underline dark:text-green-400">
            &larr; Back to Patient
          </button>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Consultation Details</h2>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-400 mb-3">{new Date(consultation.consulted_at).toLocaleString()}</p>
          <div className="space-y-3">
            {consultation.symptoms && (
              <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Symptoms</p>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">{consultation.symptoms}</p>
              </div>
            )}
            {consultation.diagnosis && (
              <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Diagnosis</p>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">{consultation.diagnosis}</p>
              </div>
            )}
            {consultation.notes && (
              <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Notes</p>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">{consultation.notes}</p>
              </div>
            )}
          </div>
        </div>

        {relatedTests.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Tests Ordered</h3>
            <div className="space-y-2">
              {relatedTests.map((t) => (
                <div key={t.id} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.test_name}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      t.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : t.status === "sample_collected" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {t.status === "completed" ? "Completed" : t.status === "sample_collected" ? "Sample Collected" : "Ordered"}
                    </span>
                  </div>
                  {t.test_results && t.test_results.length > 0 && (
                    <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">Result: {t.test_results[0].result_text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedRx.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Prescriptions</h3>
            <div className="space-y-2">
              {relatedRx.map((rx) => (
                <div key={rx.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{rx.medicine_name} {rx.dosage}</p>
                    <p className="text-xs text-zinc-500">{rx.frequency} | {rx.duration} {rx.instructions ? `| ${rx.instructions}` : ""}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    rx.status === "dispensed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>{rx.status === "dispensed" ? "Dispensed" : "Pending"}</span>
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
          <Link href="/" className="flex items-center gap-1 text-sm text-green-600 transition-colors hover:text-green-700 dark:text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Clinic</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">OPD / Doctor&apos;s Station</p>
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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
          </div>
        ) : view.kind === "tap" ? renderTap()
          : view.kind === "patient" ? renderPatientView()
          : view.kind === "new-consultation" ? renderNewConsultation()
          : view.kind === "consultation-detail" ? renderConsultationDetail()
          : null}
      </main>
    </div>
  );
}
