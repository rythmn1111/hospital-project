"use client";

import { useState } from "react";
import type { Patient } from "@/lib/store/hospital-store";

interface Props {
  onRegister: (patient: Patient) => void;
}

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PatientRegistrationForm({ onRegister }: Props) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male" as Patient["gender"],
    phone: "",
    address: "",
    bloodGroup: "O+",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.age || Number(form.age) < 0 || Number(form.age) > 150)
      e.age = "Valid age is required";
    if (!form.phone.trim() || form.phone.length < 10)
      e.phone = "Valid phone number is required";
    if (!form.address.trim()) e.address = "Address is required";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    const patient: Patient = {
      id: `P${Date.now().toString().slice(-6)}`,
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      phone: form.phone.trim(),
      address: form.address.trim(),
      bloodGroup: form.bloodGroup,
      registeredAt: new Date().toISOString(),
    };
    onRegister(patient);
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";
  const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
  const errorClass = "mt-1 text-xs text-red-500";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Register New Patient
      </h3>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Full Name</label>
          <input className={inputClass} placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className={errorClass}>{errors.name}</p>}
        </div>
        <div>
          <label className={labelClass}>Age</label>
          <input className={inputClass} type="number" placeholder="30" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          {errors.age && <p className={errorClass}>{errors.age}</p>}
        </div>
        <div>
          <label className={labelClass}>Gender</label>
          <select className={inputClass} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Patient["gender"] })}>
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
        <div className="sm:col-span-2">
          <label className={labelClass}>Address</label>
          <input className={inputClass} placeholder="123, Street Name, City" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          {errors.address && <p className={errorClass}>{errors.address}</p>}
        </div>
        <div>
          <label className={labelClass}>Blood Group</label>
          <select className={inputClass} value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
            {bloodGroups.map((bg) => (
              <option key={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          Register Patient
        </button>
      </div>
    </form>
  );
}
