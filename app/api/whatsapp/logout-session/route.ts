import { NextRequest, NextResponse } from "next/server";
import { WPPCONNECT_URL, SESSION_NAME, SECRET_KEY } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  // Step 1: Try to logout the WhatsApp session (unlink device)
  try {
    await fetch(`${WPPCONNECT_URL}/api/${SESSION_NAME}/logout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Logout may fail if session isn't fully connected, continue anyway
  }

  // Step 2: Close the browser session
  try {
    await fetch(`${WPPCONNECT_URL}/api/${SESSION_NAME}/close-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Continue even if close fails
  }

  // Step 3: Clear stored session data so next connect requires fresh QR
  const clearRes = await fetch(
    `${WPPCONNECT_URL}/api/${SESSION_NAME}/${SECRET_KEY}/clear-session-data`,
    { method: "POST" }
  );
  const data = await clearRes.json();

  return NextResponse.json(data);
}
