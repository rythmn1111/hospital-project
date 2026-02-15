import { NextRequest, NextResponse } from "next/server";
import { WPPCONNECT_URL, SESSION_NAME } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  const res = await fetch(
    `${WPPCONNECT_URL}/api/${SESSION_NAME}/check-connection-session`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  return NextResponse.json(data);
}
