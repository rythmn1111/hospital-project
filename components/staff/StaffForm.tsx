"use client";

import { useState } from "react";
import type { Staff } from "@/lib/store/staff-types";

interface Props {
  initial?: Staff;
  onSubmit: (data: Omit<Staff, "id" | "created_at">) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function StaffForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    qualification: initial?.qualification ?? "",
    birthdate: initial?.birthdate ?? "",
    is_doctor: initial?.is_doctor ?? false,
    phone: initial?.phone ?? "",
    username: initial?.username ?? "",
    password: "",
    abha_number: initial?.abha_number ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.username.trim()) e.username = "Username is required";
    if (!initial && !form.password.trim()) e.password = "Password is required";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    const data: Omit<Staff, "id" | "created_at"> = {
      name: form.name.trim(),
      qualification: form.qualification.trim() || null,
      birthdate: form.birthdate || null,
      is_doctor: form.is_doctor,
      phone: form.phone.trim() || null,
      username: form.username.trim(),
      password: form.password.trim() || null,
      abha_number: form.abha_number.trim() || null,
    };

    // On edit, don't send password if left blank (keep existing)
    if (initial && !form.password.trim()) {
      data.password = initial.password;
    }

    onSubmit(data);
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";
  const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
  const errorClass = "mt-1 text-xs text-red-500";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {initial ? "Edit Staff Member" : "Add New Staff Member"}
      </h3>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Full Name</label>
          <input className={inputClass} placeholder="Dr. Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className={errorClass}>{errors.name}</p>}
        </div>
        <div>
          <label className={labelClass}>Username</label>
          <input className={inputClass} placeholder="dr.sharma" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          {errors.username && <p className={errorClass}>{errors.username}</p>}
        </div>
        <div>
          <label className={labelClass}>Password {initial && <span className="text-xs text-zinc-400">(leave blank to keep current)</span>}</label>
          <input className={inputClass} type="password" placeholder={initial ? "••••••••" : "Enter password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {errors.password && <p className={errorClass}>{errors.password}</p>}
        </div>
        <div>
          <label className={labelClass}>Qualification</label>
          <input className={inputClass} placeholder="MD, MBBS, BSc Nursing..." value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Date of Birth</label>
          <input className={inputClass} type="date" value={form.birthdate} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input className={inputClass} placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>ABHA Number</label>
          <input className={inputClass} placeholder="14-digit ABHA number" value={form.abha_number} onChange={(e) => setForm({ ...form, abha_number: e.target.value })} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_doctor}
              onChange={(e) => setForm({ ...form, is_doctor: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Is a Doctor</span>
          </label>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="rounded-lg bg-rose-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50">
          {loading ? "Saving..." : initial ? "Update" : "Add Staff"}
        </button>
      </div>
    </form>
  );
}
