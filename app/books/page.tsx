'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '../lib/supabase';

export default function BooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal va Yuklash shtatlari
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthor, setIsAuthor] = useState(false);

  // Form shtatlari
  const [bookTitle, setBookTitle] = useState('');
  const [bookCategory, setBookCategory] = useState('Darslik');
  const [bookDescription, setBookDescription] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [bookPrice, setBookPrice] = useState<number>(0);
  const [authorName, setAuthorName] = useState('');
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [showOfertaModal, setShowOfertaModal] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchApprovedBooks();
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const role = user.user_metadata?.role || 'user';
      setIsAuthor(role === 'author');
      setAuthorName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
    }
  }

  // FAQT MODERATSIYADAN O'TGAN (APPROVED) KITOBLARNI CHIQARISH
  async function fetchApprovedBooks() {
    setLoading(true);
    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (data) setBooks(data);
    setLoading(false);
  }

  const handleOpenUploadModal = () => {
    if (!user) {
      alert("Kitob yuklash uchun avval tizimga kiring!");
      return;
    }
    if (!isAuthor) {
      alert("Kitob yuklash uchun Profilingizdagi Sozlamalar bo'limidan maqomingizni '✍️ Muallif'ga o'tkazing!");
      return;
    }
    setIsModalOpen(true);
  };

  const handleUploadBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFile) {
      setMsg("Xatolik: PDF kitob faylini tanlang!");
      return;
    }
    if (!offerAccepted) {
      setMsg("Xatolik: Ommaviy oferta shartlariga rozilik berishingiz shart!");
      return;
    }

    setUploading(true);
    setMsg('');

    try {
      const fileExt = bookFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `books/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('avatars')
        .upload(filePath, bookFile, { cacheControl: '3600', upsert: true });

      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // status: 'pending' bilan saqlash
      const { error: dbError } = await supabase.from('books').insert([
        {
          title: bookTitle,
          category: bookCategory,
          description: bookDescription,
          is_free: isFree,
          price: isFree ? 0 : Number(bookPrice),
          author_name: authorName,
          file_url: urlData.publicUrl,
          author_id: user?.id,
          status: 'pending', // Moderatsiyaga yuborildi
        },
      ]);

      if (dbError) throw dbError;

      alert("Adabiyot moderatsiyaga yuborildi! Administrator mualliflik huquqini tasdiqlagach, kitob katalogda paydo bo'ladi.");
      setIsModalOpen(false);
      setBookTitle('');
      setBookDescription('');
      setBookFile(null);
      setOfferAccepted(false);
    } catch (err: any) {
      setMsg("Xatolik: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredBooks = books.filter(b => {
    const matchesQuery = b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || b.author_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

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
            <Link href="/books" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Kitoblar</Link>
            <Link href="/courses" className="hover:text-blue-600 transition">Videokurslar</Link>
            <Link href="/ai-chat" className="text-indigo-600 hover:text-indigo-700 transition flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              Lexon AI Chat
            </Link>
          </nav>

          {user ? (
            <Link href="/profile" className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-xs transition border border-blue-200">
              Shaxsiy Kabinet 👤
            </Link>
          ) : (
            <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md">
              Kirish
            </Link>
          )}
        </div>
      </header>

      {/* MAIN KATALOG */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Kitoblar Katalogi</h1>
            <p className="text-xs text-slate-500 mt-1">Tasdiqlangan o'quv darsliklari va elektron huquqiy adabiyotlar</p>
          </div>

          <button
            onClick={handleOpenUploadModal}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <span>➕ Kitob yuklash (Mualliflar uchun)</span>
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kitob yoki muallif nomi..."
            className="sm:col-span-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 shadow-sm"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 shadow-sm"
          >
            <option value="All">Barcha kategoriyalar</option>
            <option value="Darslik">Darslik</option>
            <option value="O'quv qo'llanma">O'quv qo'llanma</option>
            <option value="Monografiya">Monografiya</option>
            <option value="Kodeks / Qonun">Kodeks / Qonun</option>
          </select>
        </div>

        {/* LISTING */}
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400 font-medium">Tasdiqlangan kitoblar yuklanmoqda...</div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase">
                      {book.category}
                    </span>
                    <span className={`text-xs font-black ${book.is_free ? 'text-emerald-600' : 'text-indigo-600'}`}>
                      {book.is_free ? 'BEPUL' : `${Number(book.price).toLocaleString()} so'm`}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{book.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{book.author_name}</p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3">{book.description || "Tavsif kiritilmagan."}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={book.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                  >
                    Mutolaa qilish 📖
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-xs text-slate-400 font-medium">Hozircha tasdiqlangan adabiyotlar mavjud emas.</div>
        )}
      </main>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Yangi Adabiyot Yuklash</h3>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">⚠️ Yuklangan fayl moderatsiyadan so'ng katalogga chiqadi</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>

            {msg && (
              <div className={`p-3 rounded-xl text-xs font-bold mb-4 ${msg.includes('Xatolik') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {msg}
              </div>
            )}

            <form onSubmit={handleUploadBook} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Kitob / Darslik Nomi</label>
                <input
                  type="text"
                  required
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Masalan: Fuqarolik Huquqi Kodeksi Sharhlari"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Qisqacha Tavsif</label>
                <textarea
                  rows={2}
                  required
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  placeholder="Kitob mazmuni va kimlar uchun mo'ljallangani..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Kategoriya</label>
                  <select
                    value={bookCategory}
                    onChange={(e) => setBookCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  >
                    <option value="Darslik">Darslik</option>
                    <option value="O'quv qo'llanma">O'quv qo'llanma</option>
                    <option value="Monografiya">Monografiya</option>
                    <option value="Kodeks / Qonun">Kodeks / Qonun</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Sotuv Turi</label>
                  <select
                    value={isFree ? 'free' : 'paid'}
                    onChange={(e) => setIsFree(e.target.value === 'free')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  >
                    <option value="free">🟢 Bepul Mutolaa</option>
                    <option value="paid">💳 Pullik Adabiyot</option>
                  </select>
                </div>
              </div>

              {!isFree && (
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Sotuv Narxi (So'mda)</label>
                  <input
                    type="number"
                    required
                    value={bookPrice}
                    onChange={(e) => setBookPrice(Number(e.target.value))}
                    placeholder="30000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">PDF Fayl</label>
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="oferta"
                    checked={offerAccepted}
                    onChange={(e) => setOfferAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="oferta" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
                    Ushbu materialga egalik huquqim borligini va platformaning{' '}
                    <button
                      type="button"
                      onClick={() => setShowOfertaModal(true)}
                      className="text-blue-600 underline font-bold"
                    >
                      Ommaviy Oferta shartnomasi
                    </button>
                    ga to'liq roziligimni tasdiqlayman.
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {uploading ? 'Yuborilmoqda...' : 'Moderatsiyaga Yuborish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFERTA MODAL */}
      {showOfertaModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[80vh] flex flex-col justify-between shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-4">LexonAI Platformasi Ommaviy Oferta Shartnomasi</h3>
            <div className="overflow-y-auto pr-2 space-y-3 text-xs text-slate-600 leading-relaxed font-normal">
              <p className="font-bold text-slate-800">1. Moderatsiya va Tasdiqlash</p>
              <p>
                Platformaga yuklangan har bir adabiyot mualliflik huquqiga muvofiqligi bo'yicha administrator tomonidan tekshiriladi va faqat tasdiqlangandan so'ng umumiy katalogga chiqariladi.
              </p>
            </div>
            <button
              onClick={() => setShowOfertaModal(false)}
              className="mt-6 w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}