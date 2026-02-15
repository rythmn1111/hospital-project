"use client";

import { useState } from "react";
import type { ItemCategory } from "@/lib/store/item-types";

interface Props {
  initial?: ItemCategory;
  onSubmit: (data: { name: string; slug: string; description: string | null }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function CategoryForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function handleNameChange(name: string) {
    setForm({ ...form, name, slug: initial ? form.slug : autoSlug(name) });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.slug.trim()) e.slug = "Slug is required";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    onSubmit({
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
    });
  }

  const inputClass = "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";
  const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {initial ? "Edit Category" : "Add New Category"}
      </h3>
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Category Name</label>
          <input className={inputClass} placeholder="e.g. Medicine" value={form.name} onChange={(e) => handleNameChange(e.target.value)} />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input className={inputClass} placeholder="e.g. medicine" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <input className={inputClass} placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
        <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Saving..." : initial ? "Update" : "Add Category"}
        </button>
      </div>
    </form>
  );
}
