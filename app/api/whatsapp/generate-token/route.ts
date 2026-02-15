import { NextResponse } from "next/server";
import { WPPCONNECT_URL, SESSION_NAME, SECRET_KEY } from "@/lib/whatsapp";

export async function POST() {
  const res = await fetch(
    `${WPPCONNECT_URL}/api/${SESSION_NAME}/${SECRET_KEY}/generate-token`,
    { method: "POST" }
  );
  const data = await res.json();
  return NextResponse.json(data);
}
