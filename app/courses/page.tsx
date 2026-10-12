'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '../lib/supabase';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal va Yuklash
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthor, setIsAuthor] = useState(false);

  // Form shtatlari
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Huquqshunoslik');
  const [description, setDescription] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState<number>(0);
  const [authorName, setAuthorName] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [showOfertaModal, setShowOfertaModal] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchApprovedCourses();
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

  async function fetchApprovedCourses() {
    setLoading(true);
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (data) setCourses(data);
    setLoading(false);
  }

  const handleOpenModal = () => {
    if (!user) {
      alert("Videokurs yuklash uchun avval tizimga kiring!");
      return;
    }
    if (!isAuthor) {
      alert("Kurs yuklash uchun Profilingizdagi Sozlamalardan maqomingizni '✍️ Muallif'ga o'tkazing!");
      return;
    }
    setIsModalOpen(true);
  };

  const handleUploadCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerAccepted) {
      setMsg("Xatolik: Ommaviy oferta shartlariga rozilik berishingiz shart!");
      return;
    }

    setUploading(true);
    setMsg('');

    try {
      let finalVideoUrl = videoUrlInput;

      if (uploadType === 'file' && videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `courses/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: storageErr } = await supabase.storage
          .from('avatars')
          .upload(fileName, videoFile, { cacheControl: '3600', upsert: true });

        if (storageErr) throw storageErr;

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        finalVideoUrl = urlData.publicUrl;
      }

      if (!finalVideoUrl) {
        setMsg("Xatolik: Video manbasini kiriting yoki fayl yuklang!");
        setUploading(false);
        return;
      }

      const { error: dbError } = await supabase.from('courses').insert([
        {
          title,
          category,
          description,
          is_free: isFree,
          price: isFree ? 0 : Number(price),
          author_name: authorName,
          video_url: finalVideoUrl,
          author_id: user?.id,
          status: 'pending',
        },
      ]);

      if (dbError) throw dbError;

      alert("Videokurs moderatsiyaga yuborildi! Administrator ko'rib chiqqach katalogda paydo bo'ladi.");
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setVideoUrlInput('');
      setVideoFile(null);
      setOfferAccepted(false);
    } catch (err: any) {
      setMsg("Xatolik: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesQuery = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || c.author_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
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
            <Link href="/books" className="hover:text-blue-600 transition">Kitoblar</Link>
            <Link href="/courses" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Videokurslar</Link>
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
            <h1 className="text-3xl font-black text-slate-900">Videokurslar Katalogi</h1>
            <p className="text-xs text-slate-500 mt-1">Tasdiqlangan amaliy video va sohaga oid o'quv kurslari</p>
          </div>

          <button
            onClick={handleOpenModal}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <span>🎥 Kurs yuklash (Mualliflar uchun)</span>
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kurs yoki spiker nomi..."
            className="sm:col-span-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium outline-none focus:border-indigo-600 shadow-sm"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 shadow-sm"
          >
            <option value="All">Barcha yo'nalishlar</option>
            <option value="Huquqshunoslik">Huquqshunoslik</option>
            <option value="Sodda Qonunchilik">Sodda Qonunchilik</option>
            <option value="Advokatura">Advokatura</option>
            <option value="Sud Amaliyoti">Sud Amaliyoti</option>
          </select>
        </div>

        {/* COURSE CARDS */}
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400 font-medium">Videokurslar yuklanmoqda...</div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md uppercase">
                      {course.category}
                    </span>
                    <span className={`text-xs font-black ${course.is_free ? 'text-emerald-600' : 'text-indigo-600'}`}>
                      {course.is_free ? 'BEPUL' : `${Number(course.price).toLocaleString()} so'm`}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">Spiker: {course.author_name}</p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3">{course.description || "Tavsif kiritilmagan."}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={course.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md"
                  >
                    Videoni Tomosha Qilish 🎬
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-xs text-slate-400 font-medium">Hali tasdiqlangan videokurslar mavjud emas.</div>
        )}
      </main>

      {/* YUKLASH MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Yangi Videokurs Yuklash</h3>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">⚠️ Video moderatsiyadan so'ng katalogga chiqariladi</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>

            {msg && (
              <div className={`p-3 rounded-xl text-xs font-bold mb-4 ${msg.includes('Xatolik') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {msg}
              </div>
            )}

            <form onSubmit={handleUploadCourse} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Kurs Nomi</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Sud Jarayonlarida Himoyalanish San'ati"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Kurs Haqida Tavsif</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kursda qanday bilimlar berilishi..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Kategoriya</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  >
                    <option value="Huquqshunoslik">Huquqshunoslik</option>
                    <option value="Sodda Qonunchilik">Sodda Qonunchilik</option>
                    <option value="Advokatura">Advokatura</option>
                    <option value="Sud Amaliyoti">Sud Amaliyoti</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Sotuv Turi</label>
                  <select
                    value={isFree ? 'free' : 'paid'}
                    onChange={(e) => setIsFree(e.target.value === 'free')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  >
                    <option value="free">🟢 Bepul Darslik</option>
                    <option value="paid">💳 Pullik Kurs</option>
                  </select>
                </div>
              </div>

              {!isFree && (
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Kurs Narxi (So'mda)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="50000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">* Sotuvdan 90% sizning balansingizga o'tadi, 10% platforma komissiyasi.</p>
                </div>
              )}

              {/* VIDEO YUKLASH TURI */}
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Video Manbasi Turi</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input type="radio" name="vtype" checked={uploadType === 'url'} onChange={() => setUploadType('url')} />
                    <span>YouTube / Vimeolar Linki</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input type="radio" name="vtype" checked={uploadType === 'file'} onChange={() => setUploadType('file')} />
                    <span>MP4 Video Fayl Yuklash</span>
                  </label>
                </div>

                {uploadType === 'url' ? (
                  <input
                    type="url"
                    required
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-indigo-600"
                  />
                ) : (
                  <input
                    type="file"
                    accept="video/mp4,video/mkv"
                    required
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700"
                  />
                )}
              </div>

              {/* OMMAVIY OFFERTA SHARTNOMASI TASDIQ CHECKBOX */}
              <div className="pt-2">
                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="offer"
                    checked={offerAccepted}
                    onChange={(e) => setOfferAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-indigo-600 rounded cursor-pointer"
                  />
                  <label htmlFor="offer" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
                    Ushbu video materialga egalik huquqim borligini va platformaning{' '}
                    <button
                      type="button"
                      onClick={() => setShowOfertaModal(true)}
                      className="text-indigo-600 underline font-bold"
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
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {uploading ? 'Yuborilmoqda...' : 'Moderatsiyaga Yuborish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OMMAVIY OFFERTA SHARTNOMASI MATN MODAL OYNASI */}
      {showOfertaModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[80vh] flex flex-col justify-between shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-4">LexonAI Platformasi Ommaviy Oferta Shartnomasi</h3>

            <div className="overflow-y-auto pr-2 space-y-3 text-xs text-slate-600 leading-relaxed font-normal">
              <p className="font-bold text-slate-800">1. Umumiy qoidalar va shartlar</p>
              <p>
                Ushbu shartnoma LexonAI raqamli platformasi (ijrochi) va platformaga mualliflik yoki o'quv materiallarini joylashtiruvchi foydalanuvchi (Muallif) o'rtasidagi munosabatlarni tartibga soladi.
              </p>

              <p className="font-bold text-slate-800">2. Mualliflik va egalik huquqlari</p>
              <p>
                Muallif platformaga yuklayotgan video darslik, kurs va qo'llanmalarning mualliflik huquqi o'ziga tegishli ekanligini yoki ochiq nashr etish ruxsatnomasi mavjudligini kafolatlaydi. Mualliflik huquqi buzilgan taqdirda barcha huquqiy javobgarlik Muallif zimmasiga tushadi.
              </p>

              <p className="font-bold text-slate-800">3. Sotuv va platforma komissiyasi (10%)</p>
              <p>
                Pullik videokurslar sotilganda, umumiy sotuv summasining 90% (to'qson foiz) qismi Muallifning ichki hamyoniga o'tkaziladi. Qolgan 10% (o'n foiz) qismi platformaga xizmat ko'rsatish va bank komissiyalari uchun o'tib qoladi.
              </p>

              <p className="font-bold text-slate-800">4. Moderatsiya va Tasdiqlash</p>
              <p>
                Platformaga yuklangan har bir video material mualliflik huquqiga muvofiqligi bo'yicha administrator tomonidan tekshiriladi va faqat tasdiqlangandan so'ng umumiy katalogga chiqariladi.
              </p>
            </div>

            <button
              onClick={() => setShowOfertaModal(false)}
              className="mt-6 w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Tushundim va Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}