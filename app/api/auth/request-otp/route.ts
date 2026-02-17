import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendWhatsAppMessage } from "@/lib/whatsapp-otp";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();

  if (!phone) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 });
  }

  // Check if phone is registered as admin
  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("id")
    .eq("phone", phone)
    .single();

  if (adminError || !admin) {
    return NextResponse.json(
      { error: "Phone number not registered" },
      { status: 400 }
    );
  }

  // Delete any existing OTPs for this phone
  await supabase.from("admin_otps").delete().eq("phone", phone);

  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP (expires_at defaults to now + 5 minutes)
  const { error: insertError } = await supabase
    .from("admin_otps")
    .insert({ phone, code });

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to generate OTP" },
      { status: 500 }
    );
  }

  // Send OTP via WhatsApp
  try {
    await sendWhatsAppMessage(
      phone,
      `Your HospitalOS login OTP is: ${code}. Valid for 5 minutes.`
    );
  } catch {
    // Clean up OTP if send fails
    await supabase.from("admin_otps").delete().eq("phone", phone);
    return NextResponse.json(
      { error: "Failed to send OTP via WhatsApp" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
