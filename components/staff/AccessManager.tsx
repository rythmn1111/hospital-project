"use client";

import { useState, useEffect } from "react";
import type { Staff, Section, SectionField, StaffSectionAccess } from "@/lib/store/staff-types";

interface Props {
  staff: Staff;
  sections: Section[];
  sectionFields: SectionField[];
  currentAccess: StaffSectionAccess[];
  onSave: (staffId: string, access: { section_id: string; field_slugs: string[] }[]) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function AccessManager({ staff, sections, sectionFields, currentAccess, onSave, onCancel, loading }: Props) {
  // Build initial state from current access
  const [accessMap, setAccessMap] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
    const map: Record<string, Set<string>> = {};
    for (const sa of currentAccess) {
      if (sa.staff_id === staff.id) {
        map[sa.section_id] = new Set(sa.field_slugs);
      }
    }
    setAccessMap(map);
  }, [currentAccess, staff.id]);

  function toggleSection(sectionId: string) {
    setAccessMap((prev) => {
      const next = { ...prev };
      if (next[sectionId]) {
        delete next[sectionId];
      } else {
        next[sectionId] = new Set();
      }
      return next;
    });
  }

  function toggleField(sectionId: string, fieldSlug: string) {
    setAccessMap((prev) => {
      const next = { ...prev };
      const fields = new Set(next[sectionId] ?? []);
      if (fields.has(fieldSlug)) {
        fields.delete(fieldSlug);
      } else {
        fields.add(fieldSlug);
      }
      next[sectionId] = fields;
      return next;
    });
  }

  function handleSave() {
    const access = Object.entries(accessMap)
      .filter(([, fields]) => fields.size > 0)
      .map(([section_id, fields]) => ({
        section_id,
        field_slugs: Array.from(fields),
      }));
    onSave(staff.id, access);
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Manage Section Access</h3>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Staff: <span className="font-medium text-zinc-900 dark:text-zinc-100">{staff.name}</span>
      </p>

      <div className="space-y-4">
        {sections.map((section) => {
          const isEnabled = !!accessMap[section.id];
          const fields = sectionFields.filter((f) => f.section_id === section.id);
          const selectedFields = accessMap[section.id] ?? new Set<string>();

          return (
            <div key={section.id} className="rounded-lg border border-zinc-200 dark:border-zinc-700">
              {/* Section header toggle */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className={`flex w-full items-center justify-between rounded-t-lg px-4 py-3 text-left transition-colors ${
                  isEnabled
                    ? "bg-rose-50 dark:bg-rose-900/20"
                    : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                }`}
              >
                <span className={`text-sm font-medium ${isEnabled ? "text-rose-700 dark:text-rose-400" : "text-zinc-700 dark:text-zinc-300"}`}>
                  {section.name}
                </span>
                <span className={`flex h-5 w-5 items-center justify-center rounded text-xs ${
                  isEnabled
                    ? "bg-rose-600 text-white"
                    : "border border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-700"
                }`}>
                  {isEnabled && "✓"}
                </span>
              </button>

              {/* Fields (shown when section is enabled) */}
              {isEnabled && fields.length > 0 && (
                <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
                  <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">Select accessible fields:</p>
                  <div className="flex flex-wrap gap-2">
                    {fields.map((field) => {
                      const isSelected = selectedFields.has(field.slug);
                      return (
                        <button
                          key={field.id}
                          type="button"
                          onClick={() => toggleField(section.id, field.slug)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            isSelected
                              ? "bg-rose-600 text-white"
                              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {field.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Cancel
        </button>
        <button onClick={handleSave} disabled={loading} className="rounded-lg bg-rose-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50">
          {loading ? "Saving..." : "Save Access"}
        </button>
      </div>
    </div>
  );
}
