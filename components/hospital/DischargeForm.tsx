"use client";

import { useState } from "react";
import type { Patient, Admission } from "@/lib/store/hospital-store";

interface Props {
  patient: Patient;
  admission: Admission;
  onSubmit: (admissionId: string, summary: string) => void;
  onCancel: () => void;
}

export default function DischargeForm({ patient, admission, onSubmit, onCancel }: Props) {
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) {
      setError("Discharge summary is required");
      return;
    }
    onSubmit(admission.id, summary.trim());
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Discharge Patient</h3>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Patient: <span className="font-medium text-zinc-900 dark:text-zinc-100">{patient.name}</span> ({patient.id})
      </p>

      {/* Current admission info */}
      <div className="mb-6 rounded-lg border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Department</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{admission.department}</p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Doctor</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{admission.doctor}</p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Bed</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{admission.bedNumber}</p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Admitted</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{new Date(admission.admittedAt).toLocaleDateString()}</p>
          </div>
          <div className="col-span-2">
            <span className="text-zinc-500 dark:text-zinc-400">Diagnosis</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{admission.diagnosis}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Discharge Summary
        </label>
        <textarea
          className={`${inputClass} min-h-[120px] resize-y`}
          placeholder="Enter discharge summary, recovery notes, follow-up instructions..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Cancel
        </button>
        <button type="submit" className="rounded-lg bg-amber-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700">
          Confirm Discharge
        </button>
      </div>
    </form>
  );
}
