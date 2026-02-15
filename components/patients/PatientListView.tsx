"use client";

import { useState } from "react";
import type { Patient } from "@/lib/store/patient-types";

interface Props {
  patients: Patient[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function PatientListView({ patients, onView, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("");

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search)) ||
      (p.abha_number && p.abha_number.includes(search))
  );

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, phone, or ABHA number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* Card list — touch-friendly for all screen sizes */}
      <div className="flex flex-col gap-3">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => onView(p.id)}
            className="w-full rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:active:bg-zinc-800"
          >
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{p.name}</h4>
              <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">{p.blood_group ?? "—"}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-sm text-zinc-500 dark:text-zinc-400">
              <span>Age: {p.age ?? "—"}</span>
              <span>Gender: {p.gender ?? "—"}</span>
              <span>Phone: {p.phone ?? "—"}</span>
              <span>Reg: {new Date(p.registered_at).toLocaleDateString()}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <span
                onClick={(e) => { e.stopPropagation(); onEdit(p.id); }}
                className="rounded-lg bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-700 active:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400"
              >
                Edit
              </span>
              <span
                onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 active:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
              >
                Delete
              </span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500">No patients found</p>
        )}
      </div>
    </div>
  );
}
