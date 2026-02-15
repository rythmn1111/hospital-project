"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { ItemCategory, Item } from "@/lib/store/item-types";
import CategoryForm from "./CategoryForm";
import ItemForm from "./ItemForm";

type Tab = "items" | "add-item" | "categories" | "add-category";
type View =
  | { kind: "list" }
  | { kind: "edit-item"; itemId: string }
  | { kind: "edit-category"; categoryId: string };

export default function ItemsEditorDashboard() {
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("items");
  const [view, setView] = useState<View>({ kind: "list" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [catRes, itemRes] = await Promise.all([
      supabase.from("item_categories").select("*").order("name"),
      supabase.from("items").select("*").order("name"),
    ]);
    if (catRes.error || itemRes.error) {
      setError("Failed to load data from Supabase.");
      setLoading(false);
      return;
    }
    setCategories(catRes.data ?? []);
    setItems(itemRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Item CRUD
  async function handleAddItem(data: Omit<Item, "id" | "created_at">) {
    setSaving(true);
    const { error: err } = await supabase.from("items").insert(data);
    setSaving(false);
    if (err) { setError("Failed to add item: " + err.message); return; }
    await fetchData();
    setActiveTab("items");
    setView({ kind: "list" });
  }

  async function handleEditItem(itemId: string, data: Omit<Item, "id" | "created_at">) {
    setSaving(true);
    const { error: err } = await supabase.from("items").update(data).eq("id", itemId);
    setSaving(false);
    if (err) { setError("Failed to update item: " + err.message); return; }
    await fetchData();
    setView({ kind: "list" });
    setActiveTab("items");
  }

  async function handleDeleteItem(itemId: string) {
    if (!confirm("Delete this item?")) return;
    const { error: err } = await supabase.from("items").delete().eq("id", itemId);
    if (err) { setError("Failed to delete item: " + err.message); return; }
    await fetchData();
  }

  async function toggleItemActive(item: Item) {
    const { error: err } = await supabase.from("items").update({ is_active: !item.is_active }).eq("id", item.id);
    if (err) { setError("Failed to update item: " + err.message); return; }
    await fetchData();
  }

  // Category CRUD
  async function handleAddCategory(data: { name: string; slug: string; description: string | null }) {
    setSaving(true);
    const { error: err } = await supabase.from("item_categories").insert(data);
    setSaving(false);
    if (err) { setError("Failed to add category: " + err.message); return; }
    await fetchData();
    setActiveTab("categories");
    setView({ kind: "list" });
  }

  async function handleEditCategory(catId: string, data: { name: string; slug: string; description: string | null }) {
    setSaving(true);
    const { error: err } = await supabase.from("item_categories").update(data).eq("id", catId);
    setSaving(false);
    if (err) { setError("Failed to update category: " + err.message); return; }
    await fetchData();
    setView({ kind: "list" });
    setActiveTab("categories");
  }

  async function handleDeleteCategory(catId: string) {
    const catItems = items.filter((i) => i.category_id === catId);
    if (catItems.length > 0) {
      setError(`Cannot delete: ${catItems.length} item(s) belong to this category. Delete or move them first.`);
      return;
    }
    if (!confirm("Delete this category?")) return;
    const { error: err } = await supabase.from("item_categories").delete().eq("id", catId);
    if (err) { setError("Failed to delete category: " + err.message); return; }
    await fetchData();
  }

  // Filtered items
  const filteredItems = items.filter((i) => {
    const matchesCategory = filterCategory === "all" || i.category_id === filterCategory;
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Stats
  const totalItems = items.length;
  const activeItems = items.filter((i) => i.is_active).length;
  const totalCategories = categories.length;

  const stats = [
    { label: "Total Items", value: totalItems, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { label: "Active Items", value: activeItems, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Categories", value: totalCategories, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: "items", label: "All Items" },
    { key: "add-item", label: "Add Item" },
    { key: "categories", label: "Categories" },
    { key: "add-category", label: "Add Category" },
  ];

  function getCategoryName(catId: string) {
    return categories.find((c) => c.id === catId)?.name ?? "—";
  }

  function renderContent() {
    if (loading) {
      return (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      );
    }

    // Edit views
    if (view.kind === "edit-item") {
      const item = items.find((i) => i.id === view.itemId);
      if (!item) return null;
      return (
        <ItemForm
          categories={categories}
          initial={item}
          onSubmit={(data) => handleEditItem(view.itemId, data)}
          onCancel={() => { setView({ kind: "list" }); setActiveTab("items"); }}
          loading={saving}
        />
      );
    }
    if (view.kind === "edit-category") {
      const cat = categories.find((c) => c.id === view.categoryId);
      if (!cat) return null;
      return (
        <CategoryForm
          initial={cat}
          onSubmit={(data) => handleEditCategory(view.categoryId, data)}
          onCancel={() => { setView({ kind: "list" }); setActiveTab("categories"); }}
          loading={saving}
        />
      );
    }

    switch (activeTab) {
      case "items":
        return (
          <div>
            {/* Filters */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Table */}
            <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                    <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
                    <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Category</th>
                    <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Unit</th>
                    <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Price</th>
                    <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                    <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</p>
                        {item.description && <p className="text-xs text-zinc-400 truncate max-w-xs">{item.description}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {getCategoryName(item.category_id)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{item.unit ?? "—"}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{item.price != null ? `₹${item.price}` : "—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleItemActive(item)} className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${item.is_active ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-500"}`}>
                          {item.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => { setView({ kind: "edit-item", itemId: item.id }); }} className="rounded-md bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400">Edit</button>
                          <button onClick={() => handleDeleteItem(item.id)} className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-500">No items found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {filteredItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</h4>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"}`}>
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{getCategoryName(item.category_id)}</span>
                    {item.unit && <span>Unit: {item.unit}</span>}
                    {item.price != null && <span>₹{item.price}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setView({ kind: "edit-item", itemId: item.id })} className="rounded-md bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Edit</button>
                    <button onClick={() => toggleItemActive(item)} className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{item.is_active ? "Deactivate" : "Activate"}</button>
                    <button onClick={() => handleDeleteItem(item.id)} className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">Delete</button>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && <p className="py-8 text-center text-sm text-zinc-500">No items found</p>}
            </div>
          </div>
        );

      case "add-item":
        return (
          <ItemForm
            categories={categories}
            onSubmit={handleAddItem}
            onCancel={() => { setActiveTab("items"); setView({ kind: "list" }); }}
            loading={saving}
          />
        );

      case "categories":
        return (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Slug</th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Items</th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Description</th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => {
                  const count = items.filter((i) => i.category_id === cat.id).length;
                  return (
                    <tr key={cat.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{cat.name}</td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 font-mono text-xs">{cat.slug}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{count}</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs truncate max-w-xs">{cat.description ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setView({ kind: "edit-category", categoryId: cat.id })} className="rounded-md bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400">Edit</button>
                          <button onClick={() => handleDeleteCategory(cat.id)} className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {categories.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">No categories found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        );

      case "add-category":
        return (
          <CategoryForm
            onSubmit={handleAddCategory}
            onCancel={() => { setActiveTab("categories"); setView({ kind: "list" }); }}
            loading={saving}
          />
        );

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-1 text-sm text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Items Editor</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Manage medicines, tests, procedures &amp; supplies</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
            <button onClick={() => setError(null)} className="ml-2 font-medium underline">Dismiss</button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-xl ${s.bg} border border-zinc-200 p-4 dark:border-zinc-800`}>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setView({ kind: "list" }); }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === t.key ? "bg-indigo-600 text-white" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
