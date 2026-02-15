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
          className="w-full max-w-md rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Age</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Gender</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Phone</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Blood Group</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Registered</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{p.name}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.age ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.gender ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.phone ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.blood_group ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{new Date(p.registered_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => onView(p.id)} className="rounded-md bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
                      View
                    </button>
                    <button onClick={() => onEdit(p.id)} className="rounded-md bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700 transition-colors hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:hover:bg-cyan-900/50">
                      Edit
                    </button>
                    <button onClick={() => onDelete(p.id)} className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-500">
                  No patients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</h4>
              <span className="text-xs text-zinc-400">{p.blood_group}</span>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span>Age: {p.age ?? "—"}</span>
              <span>Gender: {p.gender ?? "—"}</span>
              <span>Phone: {p.phone ?? "—"}</span>
              <span>Reg: {new Date(p.registered_at).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onView(p.id)} className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">View</button>
              <button onClick={() => onEdit(p.id)} className="rounded-md bg-cyan-100 px-3 py-1.5 text-xs font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">Edit</button>
              <button onClick={() => onDelete(p.id)} className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500">No patients found</p>
        )}
      </div>
    </div>
  );
}
