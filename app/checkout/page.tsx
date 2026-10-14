'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../lib/supabase';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (bookId) {
      fetchBookDetails();
    } else {
      setLoading(false);
    }
  }, [bookId]);

  async function fetchBookDetails() {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();

    if (data) {
      setBook(data);
    }
    setLoading(false);
  }

  const handleSimulatePayment = async () => {
    setSuccess(true);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#12161F] text-white flex items-center justify-center text-xs">Yuklanmoqda...</div>;
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#12161F] text-white flex flex-col items-center justify-center p-6 text-center">
        <p className="text-xs text-slate-400 mb-4">Kitob topilmadi yoki ID ko'rsatilmadi.</p>
        <Link href="/books" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Katalogga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full bg-[#1A202C] border border-slate-800 p-8 rounded-3xl shadow-2xl mt-12">
      <Link href="/books" className="text-xs text-blue-400 font-bold hover:underline mb-4 inline-block">
        ← Katalogga qaytish
      </Link>
      
      <h1 className="text-xl font-black mb-2 text-slate-100">Kitobni Xarid Qilish</h1>
      <p className="text-xs text-slate-400 mb-6">Mualliflik huquqi asosida xavfsiz to'lov sahifasi</p>

      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 mb-6 space-y-2">
        <p className="text-sm font-bold text-white">{book.title}</p>
        <p className="text-xs text-slate-400">Muallif: {book.author_name}</p>
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400">Summa:</span>
          <span className="text-sm font-black text-indigo-400">{Number(book.price).toLocaleString()} so'm</span>
        </div>
      </div>

      {success ? (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold">
            To'lov muvaffaqiyatli amalga oshirildi! Endi kitobni mutolaa qilishingiz mumkin.
          </div>
          <a
            href={book.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md text-center"
          >
            Kitobni O'qish (PDF) 📖
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] text-slate-400">Plastik karta orqali to'lov qilish uchun pastdagi tugmani bosing:</p>
          <button
            onClick={handleSimulatePayment}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            To'lov qilish ({Number(book.price).toLocaleString()} so'm) 💳
          </button>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#12161F] text-slate-100 flex flex-col justify-between font-sans p-6">
      <Suspense fallback={<div className="text-center text-white text-xs py-20">Yuklanmoqda...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}