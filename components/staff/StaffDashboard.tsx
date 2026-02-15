"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Staff, Section, SectionField, StaffSectionAccess } from "@/lib/store/staff-types";
import StaffList from "./StaffList";
import StaffForm from "./StaffForm";
import StaffDetails from "./StaffDetails";
import AccessManager from "./AccessManager";

type Tab = "list" | "add";
type View =
  | { kind: "list" }
  | { kind: "details"; staffId: string }
  | { kind: "edit"; staffId: string }
  | { kind: "access"; staffId: string };

export default function StaffDashboard() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionFields, setSectionFields] = useState<SectionField[]>([]);
  const [access, setAccess] = useState<StaffSectionAccess[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("list");
  const [view, setView] = useState<View>({ kind: "list" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [staffRes, sectionsRes, fieldsRes, accessRes] = await Promise.all([
      supabase.from("staff").select("*").order("created_at", { ascending: false }),
      supabase.from("sections").select("*").order("name"),
      supabase.from("section_fields").select("*").order("name"),
      supabase.from("staff_section_access").select("*"),
    ]);

    if (staffRes.error || sectionsRes.error || fieldsRes.error || accessRes.error) {
      setError("Failed to load data from Supabase. Check your connection.");
      setLoading(false);
      return;
    }

    setStaffList(staffRes.data ?? []);
    setSections(sectionsRes.data ?? []);
    setSectionFields(fieldsRes.data ?? []);
    setAccess(accessRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CRUD handlers
  async function handleAddStaff(data: Omit<Staff, "id" | "created_at">) {
    setSaving(true);
    const { error: err } = await supabase.from("staff").insert(data);
    setSaving(false);
    if (err) {
      setError("Failed to add staff: " + err.message);
      return;
    }
    await fetchData();
    setActiveTab("list");
    setView({ kind: "list" });
  }

  async function handleEditStaff(staffId: string, data: Omit<Staff, "id" | "created_at">) {
    setSaving(true);
    const { error: err } = await supabase.from("staff").update(data).eq("id", staffId);
    setSaving(false);
    if (err) {
      setError("Failed to update staff: " + err.message);
      return;
    }
    await fetchData();
    setView({ kind: "details", staffId });
  }

  async function handleDeleteStaff(staffId: string) {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    const { error: err } = await supabase.from("staff").delete().eq("id", staffId);
    if (err) {
      setError("Failed to delete staff: " + err.message);
      return;
    }
    await fetchData();
    setView({ kind: "list" });
  }

  async function handleSaveAccess(staffId: string, newAccess: { section_id: string; field_slugs: string[] }[]) {
    setSaving(true);
    // Delete existing access for this staff
    await supabase.from("staff_section_access").delete().eq("staff_id", staffId);
    // Insert new access rows
    if (newAccess.length > 0) {
      const rows = newAccess.map((a) => ({
        staff_id: staffId,
        section_id: a.section_id,
        field_slugs: a.field_slugs,
      }));
      const { error: err } = await supabase.from("staff_section_access").insert(rows);
      if (err) {
        setError("Failed to save access: " + err.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    await fetchData();
    setView({ kind: "details", staffId });
  }

  // Stats
  const totalStaff = staffList.length;
  const totalDoctors = staffList.filter((s) => s.is_doctor).length;
  const totalNonDoctors = totalStaff - totalDoctors;

  const stats = [
    { label: "Total Staff", value: totalStaff, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { label: "Doctors", value: totalDoctors, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Other Staff", value: totalNonDoctors, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Sections", value: sections.length, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: "list", label: "Staff Members" },
    { key: "add", label: "Add New Staff" },
  ];

  function renderContent() {
    if (loading) {
      return (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-600 border-t-transparent" />
        </div>
      );
    }

    // Sub-views
    if (view.kind === "details") {
      const staff = staffList.find((s) => s.id === view.staffId);
      if (!staff) return null;
      return (
        <StaffDetails
          staff={staff}
          sections={sections}
          sectionFields={sectionFields}
          access={access}
          onBack={() => setView({ kind: "list" })}
          onManageAccess={(id) => setView({ kind: "access", staffId: id })}
        />
      );
    }
    if (view.kind === "edit") {
      const staff = staffList.find((s) => s.id === view.staffId);
      if (!staff) return null;
      return (
        <StaffForm
          initial={staff}
          onSubmit={(data) => handleEditStaff(view.staffId, data)}
          onCancel={() => setView({ kind: "details", staffId: view.staffId })}
          loading={saving}
        />
      );
    }
    if (view.kind === "access") {
      const staff = staffList.find((s) => s.id === view.staffId);
      if (!staff) return null;
      return (
        <AccessManager
          staff={staff}
          sections={sections}
          sectionFields={sectionFields}
          currentAccess={access}
          onSave={handleSaveAccess}
          onCancel={() => setView({ kind: "details", staffId: view.staffId })}
          loading={saving}
        />
      );
    }

    // Tab content
    switch (activeTab) {
      case "list":
        return (
          <StaffList
            staffList={staffList}
            onView={(id) => { setView({ kind: "details", staffId: id }); setActiveTab("list"); }}
            onEdit={(id) => { setView({ kind: "edit", staffId: id }); setActiveTab("list"); }}
            onDelete={handleDeleteStaff}
          />
        );
      case "add":
        return (
          <StaffForm
            onSubmit={handleAddStaff}
            onCancel={() => { setActiveTab("list"); setView({ kind: "list" }); }}
            loading={saving}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-rose-600 transition-colors hover:text-rose-700 dark:text-rose-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Staff</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Manage Staff &amp; Access Control</p>
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
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-xl ${s.bg} border border-zinc-200 p-4 dark:border-zinc-800`}>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                setView({ kind: "list" });
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === t.key
                  ? "bg-rose-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {renderContent()}
      </main>
    </div>
  );
}
