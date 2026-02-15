"use client";

import type { Staff, Section, SectionField, StaffSectionAccess } from "@/lib/store/staff-types";

interface Props {
  staff: Staff;
  sections: Section[];
  sectionFields: SectionField[];
  access: StaffSectionAccess[];
  onBack: () => void;
  onManageAccess: (staffId: string) => void;
}

export default function StaffDetails({ staff, sections, sectionFields, access, onBack, onManageAccess }: Props) {
  const staffAccess = access.filter((a) => a.staff_id === staff.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to staff list
      </button>

      {/* Staff Info */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{staff.name}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{staff.qualification ?? "No qualification listed"}</p>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${staff.is_doctor ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
            {staff.is_doctor ? "Doctor" : "Staff"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Phone</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{staff.phone ?? "—"}</p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Date of Birth</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              {staff.birthdate ? new Date(staff.birthdate).toLocaleDateString() : "—"}
            </p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Username</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{staff.username ?? "—"}</p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">ABHA Number</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{staff.abha_number ?? "—"}</p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Joined</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              {new Date(staff.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <button onClick={() => onManageAccess(staff.id)} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700">
            Manage Section Access
          </button>
        </div>
      </div>

      {/* Section Access */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h4 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Section Access</h4>
        {staffAccess.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No section access assigned yet.</p>
        ) : (
          <div className="space-y-4">
            {staffAccess.map((sa) => {
              const section = sections.find((s) => s.id === sa.section_id);
              const fields = sectionFields.filter(
                (f) => f.section_id === sa.section_id && sa.field_slugs.includes(f.slug)
              );
              return (
                <div key={sa.id} className="rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                  <h5 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {section?.name ?? "Unknown Section"}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {fields.map((f) => (
                      <span key={f.id} className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/20 dark:text-rose-400">
                        {f.name}
                      </span>
                    ))}
                    {fields.length === 0 && (
                      <span className="text-xs text-zinc-400">No fields assigned</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
