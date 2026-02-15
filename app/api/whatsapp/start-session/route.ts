import { NextRequest, NextResponse } from "next/server";
import { WPPCONNECT_URL, SESSION_NAME } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  const res = await fetch(
    `${WPPCONNECT_URL}/api/${SESSION_NAME}/start-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ waitQrCode: false }),
    }
  );
  const data = await res.json();
  return NextResponse.json(data);
}
