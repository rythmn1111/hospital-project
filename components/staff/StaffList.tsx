"use client";

import { useState } from "react";
import type { Staff } from "@/lib/store/staff-types";

interface Props {
  staffList: Staff[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function StaffList({ staffList, onView, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("");

  const filtered = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search))
  );

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* Card list — touch-friendly */}
      <div className="flex flex-col gap-3">
        {filtered.map((s) => (
          <button
            key={s.id}
            onClick={() => onView(s.id)}
            className="w-full rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:active:bg-zinc-800"
          >
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{s.name}</h4>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${s.is_doctor ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                {s.is_doctor ? "Doctor" : "Staff"}
              </span>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-1 text-sm text-zinc-500 dark:text-zinc-400">
              <span>Qual: {s.qualification ?? "—"}</span>
              <span>Phone: {s.phone ?? "—"}</span>
            </div>
            <div className="flex gap-2">
              <span
                onClick={(e) => { e.stopPropagation(); onEdit(s.id); }}
                className="rounded-lg bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700 active:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400"
              >
                Edit
              </span>
              <span
                onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 active:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
              >
                Delete
              </span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500">No staff members found</p>
        )}
      </div>
    </div>
  );
}
