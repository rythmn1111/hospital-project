"use client";

import { useState } from "react";
import type { Patient } from "@/lib/store/patient-types";

interface Props {
  initial?: Patient;
  nfcCardId?: string | null;
  onSubmit: (data: Omit<Patient, "id" | "registered_at">) => void;
  onCancel: () => void;
  loading?: boolean;
}

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PatientForm({ initial, nfcCardId, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    age: initial?.age?.toString() ?? "",
    gender: (initial?.gender ?? "Male") as "Male" | "Female" | "Other",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
    blood_group: initial?.blood_group ?? "O+",
    abha_number: initial?.abha_number ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // OTP verification state — skip for editing existing patients
  const isEdit = !!initial;
  const [phoneVerified, setPhoneVerified] = useState(isEdit);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  async function handleSendOtp() {
    if (!form.phone.trim() || form.phone.length < 10) {
      setErrors({ ...errors, phone: "Valid phone number is required" });
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/patient/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setOtpSent(true);
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otpCode.length !== 6) {
      setOtpError("Enter the 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/patient/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone.trim(), code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setPhoneVerified(true);
      setOtpSent(false);
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setOtpLoading(false);
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.age || Number(form.age) < 0 || Number(form.age) > 150)
      e.age = "Valid age is required";
    if (!form.phone.trim() || form.phone.length < 10)
      e.phone = "Valid phone number is required";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    onSubmit({
      nfc_card_id: nfcCardId ?? initial?.nfc_card_id ?? null,
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      phone: form.phone.trim(),
      address: form.address.trim() || null,
      blood_group: form.blood_group,
      abha_number: form.abha_number.trim() || null,
    });
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";
  const labelClass = "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
  const errorClass = "mt-1 text-sm text-red-500";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {initial ? "Edit Patient" : "Register New Patient"}
      </h3>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Full Name</label>
          <input className={inputClass} placeholder="Patient full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className={errorClass}>{errors.name}</p>}
        </div>
        <div>
          <label className={labelClass}>Age</label>
          <input className={inputClass} type="number" placeholder="30" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          {errors.age && <p className={errorClass}>{errors.age}</p>}
        </div>
        <div>
          <label className={labelClass}>Gender</label>
          <select className={inputClass} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "Male" | "Female" | "Other" })}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        {/* Phone field with OTP verification */}
        <div>
          <label className={labelClass}>Phone</label>
          {phoneVerified && !isEdit ? (
            <div className="flex items-center gap-2">
              <input className={`${inputClass} bg-zinc-50 dark:bg-zinc-800/50`} value={form.phone} readOnly />
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" title="Phone verified">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          ) : isEdit ? (
            <input className={inputClass} placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          ) : (
            <div className="flex items-center gap-2">
              <input
                className={inputClass}
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => {
                  setForm({ ...form, phone: e.target.value });
                  if (otpSent) {
                    setOtpSent(false);
                    setOtpCode("");
                    setOtpError("");
                  }
                }}
                disabled={otpLoading}
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpLoading || !form.phone.trim()}
                className="shrink-0 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-medium text-white active:bg-cyan-700 disabled:opacity-50"
              >
                {otpLoading && !otpSent ? "Sending..." : otpSent ? "Resend" : "Verify"}
              </button>
            </div>
          )}
          {errors.phone && <p className={errorClass}>{errors.phone}</p>}
        </div>

        {/* OTP input — shown after OTP is sent */}
        {otpSent && !phoneVerified && (
          <div>
            <label className={labelClass}>Enter OTP</label>
            <div className="flex items-center gap-2">
              <input
                className={inputClass}
                placeholder="6-digit OTP"
                value={otpCode}
                maxLength={6}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtpCode(val);
                  setOtpError("");
                }}
                disabled={otpLoading}
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpLoading || otpCode.length !== 6}
                className="shrink-0 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white active:bg-green-700 disabled:opacity-50"
              >
                {otpLoading ? "Verifying..." : "Confirm"}
              </button>
            </div>
            {otpError && <p className={errorClass}>{otpError}</p>}
          </div>
        )}
        {/* Show OTP error even if otpSent is false (e.g. send failure) */}
        {!otpSent && otpError && !phoneVerified && (
          <div>
            <p className={errorClass}>{otpError}</p>
          </div>
        )}

        <div>
          <label className={labelClass}>Blood Group</label>
          <select className={inputClass} value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })}>
            {bloodGroups.map((bg) => (
              <option key={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Address</label>
          <input className={inputClass} placeholder="123, Street Name, City" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>ABHA Number</label>
          <input className={inputClass} placeholder="14-digit ABHA number" value={form.abha_number} onChange={(e) => setForm({ ...form, abha_number: e.target.value })} />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-xl border border-zinc-300 px-6 py-3 text-base font-medium text-zinc-700 active:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:active:bg-zinc-800">
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || (!phoneVerified && !isEdit)}
          className="rounded-xl bg-cyan-600 px-8 py-3 text-base font-medium text-white active:bg-cyan-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : initial ? "Update Patient" : "Register Patient"}
        </button>
      </div>
    </form>
  );
}
