import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({ error: "Bot token topilmadi" }, { status: 500 });
    }

    // Telegramdan kelgan ma'lumotlar xavfsizligini tekshirish (Hash verification)
    const { hash, ...dataToCheck } = userData;
    const checkString = Object.keys(dataToCheck)
      .sort()
      .map((key) => `${key}=${dataToCheck[key]}`)
      .join("\n");

    const secretKey = crypto.createHash("sha256").update(botToken).digest();
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(checkString)
      .digest("hex");

    if (hmac !== hash) {
      return NextResponse.json({ error: "Xavfsizlik xatosi: Ma'lumot soxtalashtirilgan" }, { status: 403 });
    }

    // Bu yerda foydalanuvchini Supabase bazasiga saqlashingiz yoki seans (session) ochishingiz mumkin
    // Masalan, cookies yoki token o'rnatish:

    return NextResponse.json({ success: true, user: userData });
  } catch (error) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}