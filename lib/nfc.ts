const NFC_SERVER = "http://localhost:5532";

export interface NFCReadResult {
  nfc_id: string | null;
  uid?: string;
}

export interface NFCWriteResult {
  success: boolean;
  nfc_id?: string;
  error?: string;
}

export interface NFCStatus {
  status: string;
  hardware: boolean;
  simulate: boolean;
}

export async function nfcRead(timeout = 30): Promise<NFCReadResult> {
  const res = await fetch(`${NFC_SERVER}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timeout }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "NFC read failed");
  }
  return res.json();
}

export async function nfcWrite(nfcId: string, timeout = 30): Promise<NFCWriteResult> {
  const res = await fetch(`${NFC_SERVER}/write`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nfc_id: nfcId, timeout }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "NFC write failed");
  }
  return res.json();
}

export async function nfcFormat(timeout = 30): Promise<NFCWriteResult> {
  const res = await fetch(`${NFC_SERVER}/format`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timeout }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "NFC format failed");
  }
  return res.json();
}

export async function nfcStatus(): Promise<NFCStatus> {
  const res = await fetch(`${NFC_SERVER}/status`);
  if (!res.ok) throw new Error("NFC server unreachable");
  return res.json();
}

export function generateNfcId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
}
