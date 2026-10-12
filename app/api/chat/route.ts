import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("GROQ_API_KEY topilmadi!");
      return NextResponse.json({ result: "API kalit topilmadi. .env.local faylini tekshiring." });
    }

    const systemPrompt = {
      role: 'system',
      content: `Siz O'zbekiston Respublikasining rasmiy qonunchilik bazalari (Lex.uz va Norma.uz) ma'lumotlariga asoslanuvchi professional "Lexon AI" yuridik maslahatchisisiz. Foydalanuvchining huquqiy va yuridik savollariga O'zbekiston Respublikasining amaldagi Kodekslari hamda qonunlariga tayanib, moddalarini aniq ko'rsatgan holda o'zbek tilida batafsil javob bering.`
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [systemPrompt, ...messages],
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API xatoligi:", data);
      throw new Error(data.error?.message || "Groq API ulanishida xatolik");
    }

    const aiMessage = data.choices[0]?.message?.content || "Javob shakllantirilmadi.";

    return NextResponse.json({ result: aiMessage });
  } catch (error: any) {
    console.error("Server xatoligi:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}