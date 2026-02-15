"use client";

import { useState } from "react";
import type { Patient } from "@/lib/store/patient-types";

interface Props {
  initial?: Patient;
  nfcCardId?: string | null;
  onSubmit: (data: Omit<Patient, "id" | "registered_at">) => void;
  onCancel: () => void;
  loading?: boolean;
}

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PatientForm({ initial, nfcCardId, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    age: initial?.age?.toString() ?? "",
    gender: (initial?.gender ?? "Male") as "Male" | "Female" | "Other",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
    blood_group: initial?.blood_group ?? "O+",
    abha_number: initial?.abha_number ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.age || Number(form.age) < 0 || Number(form.age) > 150)
      e.age = "Valid age is required";
    if (!form.phone.trim() || form.phone.length < 10)
      e.phone = "Valid phone number is required";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    onSubmit({
      nfc_card_id: nfcCardId ?? initial?.nfc_card_id ?? null,
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      phone: form.phone.trim(),
      address: form.address.trim() || null,
      blood_group: form.blood_group,
      abha_number: form.abha_number.trim() || null,
    });
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";
  const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
  const errorClass = "mt-1 text-xs text-red-500";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {initial ? "Edit Patient" : "Register New Patient"}
      </h3>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Full Name</label>
          <input className={inputClass} placeholder="Patient full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className={errorClass}>{errors.name}</p>}
        </div>
        <div>
          <label className={labelClass}>Age</label>
          <input className={inputClass} type="number" placeholder="30" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          {errors.age && <p className={errorClass}>{errors.age}</p>}
        </div>
        <div>
          <label className={labelClass}>Gender</label>
          <select className={inputClass} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "Male" | "Female" | "Other" })}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input className={inputClass} placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          {errors.phone && <p className={errorClass}>{errors.phone}</p>}
        </div>
        <div>
          <label className={labelClass}>Blood Group</label>
          <select className={inputClass} value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })}>
            {bloodGroups.map((bg) => (
              <option key={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Address</label>
          <input className={inputClass} placeholder="123, Street Name, City" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>ABHA Number</label>
          <input className={inputClass} placeholder="14-digit ABHA number" value={form.abha_number} onChange={(e) => setForm({ ...form, abha_number: e.target.value })} />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:opacity-50">
          {loading ? "Saving..." : initial ? "Update Patient" : "Register Patient"}
        </button>
      </div>
    </form>
  );
}
