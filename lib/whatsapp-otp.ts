const WHATSAPP_OTP_URL = process.env.WHATSAPP_OTP_URL!;

export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<void> {
  const res = await fetch(`${WHATSAPP_OTP_URL}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp send failed: ${err}`);
  }
}
