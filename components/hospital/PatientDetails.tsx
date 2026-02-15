"use client";

import type { Patient, Admission } from "@/lib/store/hospital-store";

interface Props {
  patient: Patient;
  admissions: Admission[];
  onBack: () => void;
  onAdmit: (patientId: string) => void;
  onDischarge: (admissionId: string) => void;
}

export default function PatientDetails({ patient, admissions, onBack, onAdmit, onDischarge }: Props) {
  const patientAdmissions = admissions
    .filter((a) => a.patientId === patient.id)
    .sort((a, b) => new Date(b.admittedAt).getTime() - new Date(a.admittedAt).getTime());

  const currentAdmission = patientAdmissions.find((a) => a.status === "admitted");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to patients
      </button>

      {/* Patient Info Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{patient.name}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">ID: {patient.id}</p>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${currentAdmission ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
            {currentAdmission ? "Admitted" : "Outpatient"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Age</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{patient.age} years</p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Gender</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{patient.gender}</p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Blood Group</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{patient.bloodGroup}</p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Phone</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{patient.phone}</p>
          </div>
          <div className="col-span-2">
            <span className="text-zinc-500 dark:text-zinc-400">Address</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{patient.address}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          {!currentAdmission && (
            <button onClick={() => onAdmit(patient.id)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
              New Admission
            </button>
          )}
          {currentAdmission && (
            <button onClick={() => onDischarge(currentAdmission.id)} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700">
              Discharge Patient
            </button>
          )}
        </div>
      </div>

      {/* Admission History */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h4 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Admission History</h4>
        {patientAdmissions.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No admission records found.</p>
        ) : (
          <div className="space-y-4">
            {patientAdmissions.map((a) => (
              <div key={a.id} className="rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{a.department} — {a.doctor}</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${a.status === "admitted" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                    {a.status === "admitted" ? "Active" : "Discharged"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>Bed: {a.bedNumber}</span>
                  <span>Diagnosis: {a.diagnosis}</span>
                  <span>Admitted: {new Date(a.admittedAt).toLocaleDateString()}</span>
                  {a.dischargedAt && <span>Discharged: {new Date(a.dischargedAt).toLocaleDateString()}</span>}
                </div>
                {a.dischargeSummary && (
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">Summary:</span> {a.dischargeSummary}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
