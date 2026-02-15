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
          className="w-full max-w-md rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Qualification</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Phone</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Type</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{s.name}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{s.qualification ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{s.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.is_doctor ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                    {s.is_doctor ? "Doctor" : "Staff"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => onView(s.id)} className="rounded-md bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
                      View
                    </button>
                    <button onClick={() => onEdit(s.id)} className="rounded-md bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50">
                      Edit
                    </button>
                    <button onClick={() => onDelete(s.id)} className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">
                  No staff members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((s) => (
          <div key={s.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{s.name}</h4>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.is_doctor ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                {s.is_doctor ? "Doctor" : "Staff"}
              </span>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span>Qual: {s.qualification ?? "—"}</span>
              <span>Phone: {s.phone ?? "—"}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onView(s.id)} className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                View
              </button>
              <button onClick={() => onEdit(s.id)} className="rounded-md bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                Edit
              </button>
              <button onClick={() => onDelete(s.id)} className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500">No staff members found</p>
        )}
      </div>
    </div>
  );
}
