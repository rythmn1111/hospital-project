import { NextRequest, NextResponse } from "next/server";
import { WPPCONNECT_URL, SESSION_NAME } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const { token, phone, message } = await req.json();

  const res = await fetch(
    `${WPPCONNECT_URL}/api/${SESSION_NAME}/send-message`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ phone, message }),
    }
  );
  const data = await res.json();
  return NextResponse.json(data);
}
