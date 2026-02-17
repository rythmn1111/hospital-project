import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();

  if (!phone || !code) {
    return NextResponse.json(
      { error: "Phone and code required" },
      { status: 400 }
    );
  }

  // Find matching OTP
  const { data: otp, error: otpError } = await supabase
    .from("admin_otps")
    .select("id, expires_at")
    .eq("phone", phone)
    .eq("code", code)
    .single();

  if (otpError || !otp) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
  }

  // Check expiry
  if (new Date(otp.expires_at) < new Date()) {
    await supabase.from("admin_otps").delete().eq("id", otp.id);
    return NextResponse.json({ error: "OTP expired" }, { status: 401 });
  }

  // Valid — delete OTP row
  await supabase.from("admin_otps").delete().eq("id", otp.id);

  // Get admin name
  const { data: admin } = await supabase
    .from("admins")
    .select("name")
    .eq("phone", phone)
    .single();

  return NextResponse.json({
    success: true,
    name: admin?.name || "Admin",
  });
}
