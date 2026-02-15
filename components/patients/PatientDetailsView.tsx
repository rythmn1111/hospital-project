"use client";

import type { Patient } from "@/lib/store/patient-types";

interface Props {
  patient: Patient;
  onBack: () => void;
  onEdit: (id: string) => void;
}

export default function PatientDetailsView({ patient, onBack, onEdit }: Props) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to patients
      </button>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{patient.name}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Registered: {new Date(patient.registered_at).toLocaleDateString()}</p>
          </div>
          <button onClick={() => onEdit(patient.id)} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700">
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Age</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{patient.age ?? "—"} years</p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Gender</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{patient.gender ?? "—"}</p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Blood Group</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{patient.blood_group ?? "—"}</p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Phone</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{patient.phone ?? "—"}</p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">ABHA Number</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{patient.abha_number ?? "—"}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-zinc-500 dark:text-zinc-400">Address</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{patient.address ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
