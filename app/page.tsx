'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from './lib/supabase';
import { User } from '@supabase/supabase-js';

const rotatingTitles = [
  "Huquqiy adabiyotlar, darsliklar va AI maslahatchi",
  "O'zbekiston Respublikasi qonunlari va kodekslar bazasi",
  "Ilmiy monografiyalar, sharhlar va xalqaro huquq",
  "Sizning shaxsiy intellektual yuridik yordamchingiz"
];

const faqData = [
  {
    question: "LexonAI dan foydalanish bepulmi?",
    answer: "Platformamizda ba'zi qonunchilik resurslari va AI chatdan bepul foydalanish mumkin. Shuningdek, mualliflarning maxsus darslik va monografiyalarini xarid qilish imkoniyati mavjud."
  },
  {
    question: "Mualliflar uchun daromad qanday taqsimlanadi?",
    answer: "Siz yuklagan mahsulot sotilgandan tushgan mablag'ning asosiy qismi to'g'ridan-to'g'ri sizning balansingizga o'tadi, qolgan qismi esa platforma xizmat haqi sifatida qoladi."
  },
  {
    question: "Pulni qanday qilib kartaga yechib olish mumkin?",
    answer: "Shaxsiy kabinetingizdagi 'Mablag'ni chiqarib olish' bo'limiga o'z plastik karta raqamingizni kiritib, istalgan vaqtda so'rov yuborishingiz mumkin."
  },
  {
    question: "Platformaga qanday qilib o'z kitobimni yuklay olaman?",
    answer: "Ro'yxatdan o'tayotganda yoki profilingizda hisob turini 'Muallif' deb belgilab, o'z intellektual mulkingizni yuklashingiz mumkin. Moderatsiyadan o'tgach, u umumiy katalogga chiqadi."
  }
];

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userRole, setUserRole] = useState<'user' | 'author'>('user');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [totalResources, setTotalResources] = useState<number>(0);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [totalViews, setTotalViews] = useState<number>(0);
  const [booksList, setBooksList] = useState<any[]>([]);

  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);

  const [animatedRes, setAnimatedRes] = useState(0);
  const [animatedCat, setAnimatedCat] = useState(0);
  const [animatedViews, setAnimatedViews] = useState(0);

  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [currentStreakDay, setCurrentStreakDay] = useState<number>(1); 
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [canClaimToday, setCanClaimToday] = useState<boolean>(true);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showCookie, setShowCookie] = useState(true);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function initData() {
      const savedCoins = localStorage.getItem('lexon_coins');
      const savedStreak = localStorage.getItem('lexon_streak');
      const lastClaimDateStr = localStorage.getItem('lexon_last_date');

      if (savedCoins) setCoinBalance(parseInt(savedCoins));
      if (savedStreak) setCurrentStreakDay(parseInt(savedStreak));

      const todayStr = new Date().toDateString();

      if (lastClaimDateStr) {
        if (lastClaimDateStr === todayStr) {
          setCanClaimToday(false);
        } else {
          const lastDate = new Date(lastClaimDateStr);
          const currentDate = new Date(todayStr);
          const diffTime = currentDate.getTime() - lastDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

          if (diffDays > 1) {
            setCurrentStreakDay(1);
            localStorage.setItem('lexon_streak', '1');
          }
          setCanClaimToday(true);
        }
      } else {
        setCanClaimToday(true);
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: books, count } = await supabase
        .from('books')
        .select('*', { count: 'exact' })
        .eq('status', 'approved');

      const resCount = count || (books ? books.length : 0);
      const catCount = books ? new Set(books.map(b => b.category)).size : 0;
      
      const calculatedViews = books ? books.reduce((acc, b) => acc + (b.views_count || 0), 0) : 124;
      const finalViews = calculatedViews > 0 ? calculatedViews : 124;

      if (books) {
        setBooksList(books);
      }
      setTotalResources(resCount);
      setTotalCategories(catCount);
      setTotalViews(finalViews);

      let currentRes = 0;
      const resTimer = setInterval(() => {
        currentRes += 1;
        if (currentRes >= resCount) {
          setAnimatedRes(resCount);
          clearInterval(resTimer);
        } else {
          setAnimatedRes(currentRes);
        }
      }, 40);

      let currentCat = 0;
      const catTimer = setInterval(() => {
        currentCat += 1;
        if (currentCat >= catCount) {
          setAnimatedCat(catCount);
          clearInterval(catTimer);
        } else {
          setAnimatedCat(currentCat);
        }
      }, 80);

      let currentV = 0;
      const vStep = Math.max(1, Math.floor(finalViews / 25));
      const vTimer = setInterval(() => {
        currentV += vStep;
        if (currentV >= finalViews) {
          setAnimatedViews(finalViews);
          clearInterval(vTimer);
        } else {
          setAnimatedViews(currentV);
        }
      }, 30);
    }

    initData();

    // Telegram Login Widget skriptini dinamik yuklash
    const container = document.getElementById("telegram-login-container");
    if (container && container.childElementCount === 0) {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute("data-telegram-login", "lexonaiuz_bot"); // <-- Faqat botning username'i (https://siz qatnashgan qism olib tashlandi)
      script.setAttribute("data-size", "large");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");
      container.appendChild(script);
    }

    // Telegram orqali kelgan foydalanuvchini tasdiqlash funksiyasi
    (window as any).onTelegramAuth = function (user: any) {
      fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      }).then(async (res) => {
        if (res.ok) {
          alert(`Xush kelibsiz, ${user.first_name}!`);
          window.location.href = "/profile";
        } else {
          alert("Telegram orqali kirishda xatolik yuz berdi!");
        }
      });
    };

    const titleInterval = setInterval(() => {
      setCurrentTitleIndex((prev) => (prev + 1) % rotatingTitles.length);
    }, 4000);

    return () => clearInterval(titleInterval);
  }, []);

  const handleClaimReward = (day: number) => {
    if (!canClaimToday || day !== currentStreakDay) return;

    const todayStr = new Date().toDateString();
    const newCoins = coinBalance + day;
    const nextDay = currentStreakDay < 7 ? currentStreakDay + 1 : 1;

    setCoinBalance(newCoins);
    setCurrentStreakDay(nextDay);
    setCanClaimToday(false);

    localStorage.setItem('lexon_coins', newCoins.toString());
    localStorage.setItem('lexon_streak', nextDay.toString());
    localStorage.setItem('lexon_last_date', todayStr);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setErrorMsg("Email yoki parol noto'g'ri!");
    } else {
      router.push('/profile');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: fullName,
          role: userRole
        } 
      },
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Ro'yxatdan o'tish muvaffaqiyatli! Tizimga kirishingiz mumkin.");
      setMode('signin');
      setPassword('');
    }
  };

  const currentTitleText = rotatingTitles[currentTitleIndex];

  return (
    <div className="min-h-screen bg-[#12161F] text-slate-100 flex flex-col justify-between font-sans selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      
      {/* HEADER */}
      <header className="bg-[#12161F]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
              L
            </div>
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent tracking-tight block leading-none">
                LEXON<span className="text-blue-500">AI</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-1">Elektron Kutubxona & AI</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-semibold text-slate-300 text-sm">
            <Link href="/" className="text-blue-400 font-bold border-b-2 border-blue-500 pb-1">Bosh sahifa</Link>
            <Link href="/books" className="hover:text-blue-400 transition">Kitoblar</Link>
            <Link href="/courses" className="hover:text-blue-400 transition">Videokurslar</Link>
            <Link href="/ai-chat" className="text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              Lexon AI Chat
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRewardsModal(true)}
              className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs rounded-xl transition border border-amber-500/30 flex items-center gap-2 shadow-md cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
                L
              </div>
              <span>{coinBalance} Coin</span>
              <span className="bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">Mukofot</span>
            </button>

            {user ? (
              <Link
                href="/profile"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-2"
              >
                <span>Shaxsiy Kabinet</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </Link>
            ) : (
              <button
                onClick={() => setMode('signin')}
                className="px-5 py-2.5 text-xs font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 rounded-xl transition border border-orange-500/20"
              >
                Kirish
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-[#181D2A] to-[#12161F] text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute top-10 left-10 text-slate-800/40 text-7xl font-black select-none pointer-events-none">⚖️</div>
        <div className="absolute bottom-10 right-16 text-slate-800/30 text-8xl font-black select-none pointer-events-none">📜</div>
        <div className="absolute top-1/2 right-1/4 text-slate-800/20 text-6xl font-black select-none pointer-events-none">⚖️</div>
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 border border-blue-400/20 rounded-full text-xs font-bold text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              {animatedRes} ta Tasdiqlangan Resurslar
            </div>

            <div className="min-h-[130px] flex items-center lg:items-start overflow-hidden">
              <h1 
                key={currentTitleIndex}
                className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight animate-slide-right"
              >
                {currentTitleText.includes("AI maslahatchi") ? (
                  <>
                    {currentTitleText.replace("AI maslahatchi", "")}
                    <span className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">AI maslahatchi</span>
                  </>
                ) : currentTitleText.includes("kodekslar bazasi") ? (
                  <>
                    {currentTitleText.replace("kodekslar bazasi", "")}
                    <span className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">kodekslar bazasi</span>
                  </>
                ) : currentTitleText.includes("xalqaro huquq") ? (
                  <>
                    {currentTitleText.replace("xalqaro huquq", "")}
                    <span className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">xalqaro huquq</span>
                  </>
                ) : (
                  <>
                    {currentTitleText.replace("yordamchingiz", "")}
                    <span className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">yordamchingiz</span>
                  </>
                )}
              </h1>
            </div>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 font-normal">
              O'zbekiston Respublikasi qonunchiligi, sharhlar, monografiya va xalqaro huquqiy adabiyotlar bazasi. Barchasi bir joyda, 24/7 ochiq.
            </p>
          </div>

          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
            <div className="bg-[#1A202C]/90 backdrop-blur-xl text-slate-100 p-7 rounded-3xl shadow-2xl border border-slate-800 relative w-full max-w-md">
              {errorMsg && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">{errorMsg}</div>}
              {successMsg && <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center">{successMsg}</div>}

              {user ? (
                <div className="text-center space-y-4 py-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md uppercase">
                    {user.email?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-100">Muvaffaqiyatli Kirdingiz</h3>
                    <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-500/20 text-center"
                  >
                    Shaxsiy Kabinetga O'tish 👤
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center mb-5">
                    <h2 className="text-xl font-black text-slate-100">
                      {mode === 'signin' && "Kutubxonaga Kirish"}
                      {mode === 'signup' && "Ro'yxatdan O'tish"}
                    </h2>
                  </div>

                  <div className="flex bg-slate-800 p-1 rounded-xl mb-4 text-xs font-bold text-center border border-slate-700">
                    <button
                      onClick={() => setMode('signin')}
                      className={`flex-1 py-2 rounded-lg transition ${mode === 'signin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}
                    >
                      Kirish
                    </button>
                    <button
                      onClick={() => setMode('signup')}
                      className={`flex-1 py-2 rounded-lg transition ${mode === 'signup' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}
                    >
                      Ro'yxatdan o'tish
                    </button>
                  </div>

                  {mode === 'signin' && (
                    <form onSubmit={handleSignIn} className="space-y-3">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nomi@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 outline-none text-xs font-medium text-slate-100"
                      />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 outline-none text-xs font-medium text-slate-100"
                      />
                      <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md">
                        {loading ? 'Kirilmoqda...' : 'Kirish'}
                      </button>
                    </form>
                  )}

                  {mode === 'signup' && (
                    <form onSubmit={handleSignUp} className="space-y-3">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ism va Sharifingiz"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100"
                      />
                      
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Hisob Turi (Kategoriya):</label>
                        <select
                          value={userRole}
                          onChange={(e: any) => setUserRole(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 outline-none"
                        >
                          <option value="user">📚 Kitobxon / Kitob o'quvchi</option>
                          <option value="author">✍️ Muallif / Ilmiy xodim (Kitob yuklash ruxsati)</option>
                        </select>
                      </div>

                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nomi@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100"
                      />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100"
                      />
                      <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md">
                        {loading ? 'Yaratilmoqda...' : "Ro'yxatdan O'tish"}
                      </button>
                    </form>
                  )}

                  {/* TELEGRAM ORQALI KIRISH TUGMASI */}
                  <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                    <p className="text-[11px] text-slate-400 mb-3 font-semibold">Yoki Telegram orqali bir kunda kiring:</p>
                    <div id="telegram-login-container" className="flex justify-center"></div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* STATISTIKA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1A202C] p-6 rounded-2xl border border-slate-800 shadow-xl text-center">
            <p className="text-2xl sm:text-3xl font-black text-blue-400">{animatedRes} ta</p>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">Tasdiqlangan Resurslar</p>
          </div>
          <div className="bg-[#1A202C] p-6 rounded-2xl border border-slate-800 shadow-xl text-center">
            <p className="text-2xl sm:text-3xl font-black text-indigo-400">{animatedCat} ta</p>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">Kategoriyalar</p>
          </div>
          <div className="bg-[#1A202C] p-6 rounded-2xl border border-slate-800 shadow-xl text-center">
            <p className="text-2xl sm:text-3xl font-black text-purple-400">{animatedViews.toLocaleString()}</p>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">O'qishlar Soni</p>
          </div>
          <div className="bg-[#1A202C] p-6 rounded-2xl border border-slate-800 shadow-xl text-center">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">24 / 7</p>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">Onlayn Kirish</p>
          </div>
        </div>
      </section>

      {/* TAVSIYA ETILGAN ADABIYOTLAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-100">Tavsiya Etilgan Adabiyotlar</h2>
            <p className="text-xs text-slate-400 mt-1">Tasdiqlangan darslik va huquqiy qo'llanmalar</p>
          </div>
          <Link href="/books" className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1">
            <span>Barchasini ko'rish</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {booksList.length > 0 ? (
            booksList.slice(0, 4).map((book, idx) => (
              <div key={idx} className="bg-[#1A202C] rounded-2xl p-5 border border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-bold mb-3">
                    {book.category}
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm line-clamp-2">{book.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{book.author_name}</p>
                </div>
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs font-medium text-slate-400">
                  <span>👁️ {book.views_count || 0} ko'rish</span>
                  <a href={book.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 font-bold hover:underline">O'qish</a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 col-span-4 text-center py-8">Hali tasdiqlangan adabiyotlar mavjud emas.</p>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <span className="text-orange-500 text-xs font-bold uppercase tracking-wider block mb-2">SAVOL-JAVOB</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100">Boshlashdan oldin bilishingiz kerak bo'lganlar</h2>
        </div>

        <div className="space-y-4">
          {faqData.map((item, idx) => (
            <div key={idx} className="bg-[#1A202C] border border-slate-800 rounded-2xl overflow-hidden transition">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-200 text-sm sm:text-base hover:text-blue-400 transition cursor-pointer"
              >
                <span>{item.question}</span>
                <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-lg font-black text-slate-400">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#181D2A] border-t border-slate-800 pt-16 pb-12 mt-16 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
          
          <div className="md:col-span-4 space-y-4 bg-[#1A202C] p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg">
                L
              </div>
              <span className="text-xl font-black text-white tracking-tight">LEXONAI</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed font-medium">
              O'zbekiston Respublikasi qonunchiligi, huquqiy darsliklar, sun'iy intellekt yordamchisi, mualliflar uchun daromad ulushi va kunlik mukofotlar platformasi.
            </p>
            <div className="pt-2">
              <p className="font-bold text-white mb-2">Platforma kimlar uchun?</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-bold border border-blue-500/20">⚖️ Huquqshunoslar</span>
                <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-bold border border-indigo-500/20">📚 Talabalar</span>
                <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-[10px] font-bold border border-purple-500/20">✍️ Mualliflar</span>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold border border-emerald-500/20">💼 Tadbirkorlar</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Platforma Imkoniyatlari</h4>
            <ul className="space-y-2">
              <li><Link href="/books" className="hover:text-white transition">Elektron Kutubxona</Link></li>
              <li><Link href="/ai-chat" className="hover:text-white transition">Lexon AI Maslahatchi</Link></li>
              <li><Link href="/profile" className="hover:text-white transition">Mualliflik Ulushi</Link></li>
              <li><Link href="/profile" className="hover:text-white transition">Balans va Karta yechish</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Kompaniya</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white transition">Biz haqimizda</Link></li>
              <li><Link href="/oferta" className="hover:text-white transition">Ommaviy Oferta</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Rasmiy Tarmoqlar</h4>
            <p className="text-slate-400 text-xs">Bizni kuzatib boring:</p>
            <div className="flex flex-col gap-2.5">
              <a 
                href="https://t.me/lexonaiuz" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 hover:bg-[#229ED9]/20 text-slate-200 hover:text-[#229ED9] rounded-xl font-bold transition border border-slate-800 group"
              >
                <svg className="w-5 h-5 fill-[#229ED9]" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.06-.78 4.16-1.82 6.94-3.02 8.34-3.61 3.97-1.67 4.79-1.96 5.33-1.97.12 0 .38.03.55.17.14.12.18.28.2.45z"/>
                </svg>
                <span>Telegram Kanal</span>
              </a>

              <a 
                href="https://www.instagram.com/lexonai_uz" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 hover:bg-[#E4405F]/20 text-slate-200 hover:text-[#E4405F] rounded-xl font-bold transition border border-slate-800 group"
              >
                <svg className="w-5 h-5 fill-[#E4405F]" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram Sahifa</span>
              </a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-12 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500">
          <p>© 2026 LexonAI. Barcha huquqlar himoyalangan.</p>
          <p className="mt-2 sm:mt-0">Intellektual huquqiy platforma</p>
        </div>
      </footer>

      {/* KUNLIK MUKOFOTLAR MODAL OYNASI */}
      {showRewardsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181D2A] border border-slate-800 max-w-2xl w-full p-6 sm:p-8 rounded-3xl shadow-2xl relative text-slate-100">
            <button 
              onClick={() => setShowRewardsModal(false)}
              className="absolute top-5 right-5 w-9 h-9 bg-slate-800 hover:bg-rose-600/20 text-slate-300 hover:text-rose-400 rounded-full flex items-center justify-center font-black text-lg transition border border-slate-700 z-50 cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="inline-block px-4 py-1.5 bg-blue-600 text-white font-black text-xs rounded-full shadow-lg shadow-blue-500/30 mb-2">
                KUNLIK MUKOFOTLAR
              </div>
              <h3 className="text-xl sm:text-2xl font-black">Har kuni kirish orqali coinlar yig'ing!</h3>
              <p className="text-xs text-slate-400 mt-1">
                {canClaimToday ? `Bugungi (${currentStreakDay}-kun) mukofotingizni oling!` : "Bugungi mukofot olindi. Ertaga keyingi kun ochiladi!"}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isClaimed = day < currentStreakDay || (day === currentStreakDay && !canClaimToday);
                const isCurrent = day === currentStreakDay && canClaimToday;

                return (
                  <div 
                    key={day}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-between text-center transition ${
                      isClaimed 
                        ? 'bg-blue-950/30 border-blue-500/50 text-blue-300' 
                        : isCurrent 
                        ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/20 animate-pulse' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-60'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-400">Kun {day}</p>
                      
                      <div className="w-12 h-12 my-3 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border border-amber-200 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
                        Lexon
                      </div>

                      <p className="text-xs font-black text-slate-200">{day} ta coin</p>
                    </div>

                    <div className="mt-4 w-full">
                      {isClaimed ? (
                        <span className="inline-block w-full py-1.5 bg-emerald-500/10 text-emerald-400 font-bold text-[10px] rounded-lg border border-emerald-500/20">
                          ✓ Olingan
                        </span>
                      ) : isCurrent ? (
                        <button
                          onClick={() => handleClaimReward(day)}
                          className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] rounded-xl shadow-md transition cursor-pointer"
                        >
                          Olish
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold">Kundan keyin</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowRewardsModal(false)}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COOKIE */}
      {showCookie && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md bg-[#1A202C] border border-slate-800 p-5 rounded-2xl shadow-2xl z-50 flex flex-col gap-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Sayt ishlashi uchun zarur cookie fayllardan foydalanamiz. Tahlil cookie fayllari faqat roziligingizdan keyin yoqiladi. <Link href="/oferta" className="text-blue-400 underline">Maxfiylik siyosati</Link>
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCookie(false)}
              className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer"
            >
              Ruxsat berish
            </button>
            <button
              onClick={() => setShowCookie(false)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition border border-slate-700 cursor-pointer"
            >
              Rad etish
            </button>
          </div>
        </div>
      )}

    </div>
  );
}