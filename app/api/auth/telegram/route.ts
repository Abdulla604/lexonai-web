export async function POST(req: Request) {
  try {
    const user = await req.json();
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    // Token mavjudligini tekshirish
    if (!TOKEN) {
      return Response.json({ success: false, error: "Bot token topilmadi" }, { status: 500 });
    }

    // Telegram bot orqali foydalanuvchiga xabar yuborish
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: user.id,
        text: `Salom ${user.first_name}! LexonAI ga muvaffaqiyatli kirdingiz.`,
      }),
    });

    const data = await response.json();
    return Response.json({ success: data.ok });
  } catch (error) {
    return Response.json({ success: false, error: "Server xatoligi" }, { status: 500 });
  }
}