'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function AIChatPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: "Assalomu alaykum! Men Lexon AI — Lex.uz va Norma.uz qonunchilik bazalari asosida ishlaydigan professional yuridik maslahatchiman. Sizni qanday huquqiy masala qiziqtirmoqda?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const updatedMessages = [...messages, { role: 'user' as const, content: queryText }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (res.ok && data.result) {
        setMessages([...updatedMessages, { role: 'assistant', content: data.result }]);
      } else {
        setMessages([
          ...updatedMessages,
          { role: 'assistant', content: "Kechirasiz, tarmoq xatoligi yuz berdi. Iltimos qaytadan urinib ko'ring." },
        ]);
      }
    } catch (err) {
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: "Server bilan bog'lanishda xatolik kelib chiqdi." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input;
    setInput('');
    await sendQuery(text);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              L
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 bg-clip-text text-transparent tracking-tight">
              LEXON<span className="text-blue-600">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-semibold text-slate-600 text-sm">
            <Link href="/" className="hover:text-blue-600 transition">Bosh sahifa</Link>
            <Link href="/books" className="hover:text-blue-600 transition">Kitoblar</Link>
            <Link href="/courses" className="hover:text-blue-600 transition">Videokurslar</Link>
            <Link href="/ai-chat" className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              Lexon AI Chat (Lex.uz bazasi)
            </Link>
          </nav>

          <Link href="/profile" className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-xs transition border border-blue-200">
            Shaxsiy Kabinet 👤
          </Link>
        </div>
      </header>

      {/* CHAT CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 py-6 w-full flex-1 flex flex-col justify-between">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-4 sm:p-6 flex-1 flex flex-col justify-between min-h-[75vh]">
          
          {/* TEZKOR SAVOLLAR */}
          <div className="mb-4 pb-3 border-b border-slate-100 flex gap-2 overflow-x-auto text-[11px] font-bold">
            <span className="text-slate-400 self-center whitespace-nowrap">Tezkor savollar:</span>
            <button onClick={() => sendQuery("Mehnat shartnomasini xodimning tashabbusi bilan bekor qilish tartibi qanday?")} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg whitespace-nowrap hover:bg-indigo-100">
              💼 Mehnat shartnomasini bekor qilish
            </button>
            <button onClick={() => sendQuery("Aliment miqdori qanday belgilanadi va qancha qism undiriladi?")} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg whitespace-nowrap hover:bg-indigo-100">
              👶 Aliment miqdori
            </button>
            <button onClick={() => sendQuery("Tadbirkorlik faoliyatini boshlash uchun qanday litsenziyalar kerak?")} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg whitespace-nowrap hover:bg-indigo-100">
              🏢 Tadbirkorlik va litsenziya
            </button>
          </div>

          {/* CHAT MESSAGES */}
          <div className="space-y-4 overflow-y-auto max-h-[55vh] pr-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-md shadow-blue-500/10'
                      : 'bg-slate-100 text-slate-800 border border-slate-200/60 rounded-tl-none font-normal'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start items-center text-slate-400 text-xs font-semibold">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs animate-pulse">
                  AI
                </div>
                <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200/60 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200"></span>
                  <span className="ml-2 text-[11px] text-slate-500 font-medium">Lex.uz va Norma.uz qonunchilik bazasidan izlanmoqda...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Qonun moddalari yoki yuridik savolingizni yozing..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm outline-none focus:border-indigo-600 font-medium transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition disabled:opacity-50 whitespace-nowrap"
            >
              Izlash va Javob olish 🔍
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}