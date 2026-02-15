"use client";

import { useState } from "react";
import type { Patient, Admission } from "@/lib/store/hospital-store";

interface Props {
  patient: Patient;
  onSubmit: (admission: Admission) => void;
  onCancel: () => void;
}

const departments = ["Cardiology", "Orthopedics", "Pulmonology", "Neurology", "General Medicine", "Surgery", "Pediatrics", "Gynecology"];
const doctors: Record<string, string[]> = {
  Cardiology: ["Dr. Mehra", "Dr. Joshi"],
  Orthopedics: ["Dr. Kapoor", "Dr. Nair"],
  Pulmonology: ["Dr. Singh", "Dr. Rao"],
  Neurology: ["Dr. Gupta", "Dr. Desai"],
  "General Medicine": ["Dr. Verma", "Dr. Iyer"],
  Surgery: ["Dr. Chauhan", "Dr. Bhatt"],
  Pediatrics: ["Dr. Mishra", "Dr. Das"],
  Gynecology: ["Dr. Kulkarni", "Dr. Menon"],
};

export default function AdmissionForm({ patient, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    department: departments[0],
    doctor: doctors[departments[0]][0],
    bedNumber: "",
    diagnosis: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.bedNumber.trim()) e.bedNumber = "Bed number is required";
    if (!form.diagnosis.trim()) e.diagnosis = "Diagnosis is required";
    return e;
  }

  function handleDepartmentChange(dept: string) {
    setForm({ ...form, department: dept, doctor: doctors[dept][0] });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    const admission: Admission = {
      id: `A${Date.now().toString().slice(-6)}`,
      patientId: patient.id,
      department: form.department,
      doctor: form.doctor,
      bedNumber: form.bedNumber.trim(),
      diagnosis: form.diagnosis.trim(),
      admittedAt: new Date().toISOString(),
      dischargedAt: null,
      dischargeSummary: "",
      status: "admitted",
    };
    onSubmit(admission);
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";
  const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
  const errorClass = "mt-1 text-xs text-red-500";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Admit Patient</h3>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Patient: <span className="font-medium text-zinc-900 dark:text-zinc-100">{patient.name}</span> ({patient.id})
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Department</label>
          <select className={inputClass} value={form.department} onChange={(e) => handleDepartmentChange(e.target.value)}>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Doctor</label>
          <select className={inputClass} value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}>
            {doctors[form.department].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Bed Number</label>
          <input className={inputClass} placeholder="ICU-01 or W1-05" value={form.bedNumber} onChange={(e) => setForm({ ...form, bedNumber: e.target.value })} />
          {errors.bedNumber && <p className={errorClass}>{errors.bedNumber}</p>}
        </div>
        <div>
          <label className={labelClass}>Diagnosis</label>
          <input className={inputClass} placeholder="Primary diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
          {errors.diagnosis && <p className={errorClass}>{errors.diagnosis}</p>}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Cancel
        </button>
        <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          Confirm Admission
        </button>
      </div>
    </form>
  );
}
