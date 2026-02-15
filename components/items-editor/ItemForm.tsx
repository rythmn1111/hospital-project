"use client";

import { useState } from "react";
import type { Item, ItemCategory } from "@/lib/store/item-types";

interface Props {
  categories: ItemCategory[];
  initial?: Item;
  defaultCategoryId?: string;
  onSubmit: (data: Omit<Item, "id" | "created_at">) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ItemForm({ categories, initial, defaultCategoryId, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState({
    category_id: initial?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    unit: initial?.unit ?? "",
    price: initial?.price?.toString() ?? "",
    is_active: initial?.is_active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.category_id) e.category_id = "Category is required";
    if (form.price && isNaN(Number(form.price))) e.price = "Price must be a number";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    onSubmit({
      category_id: form.category_id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      unit: form.unit.trim() || null,
      price: form.price ? Number(form.price) : null,
      is_active: form.is_active,
    });
  }

  const inputClass = "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";
  const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {initial ? "Edit Item" : "Add New Item"}
      </h3>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Item Name</label>
          <input className={inputClass} placeholder="e.g. Paracetamol 500mg" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select className={inputClass} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
        </div>
        <div>
          <label className={labelClass}>Unit</label>
          <input className={inputClass} placeholder="e.g. tablet, ml, test" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Price</label>
          <input className={inputClass} type="number" step="0.01" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Active</span>
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea className={`${inputClass} min-h-[80px] resize-y`} placeholder="Optional description or notes" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
        <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Saving..." : initial ? "Update" : "Add Item"}
        </button>
      </div>
    </form>
  );
}
