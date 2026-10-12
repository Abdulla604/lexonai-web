'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Profil tahrirlash shtatlari
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  // Balans va Statistika (75% muallifga, 25% platformaga)
  const [balance, setBalance] = useState<number>(0); 
  const [myBooks, setMyBooks] = useState<any[]>([]); 
  const [purchasedBooks, setPurchasedBooks] = useState<any[]>([]); 
  const [totalSpent, setTotalSpent] = useState<number>(0); 
  const [totalEarned, setTotalEarned] = useState<number>(0); 

  // Pulni yechib olish
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState('');

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUser(user);
      setFullName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');

      // 1. O'zi yuklagan kitoblar va 75% daromadni hisoblash
      const { data: books } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id);

      if (books) {
        setMyBooks(books);
        const grossEarned = books.reduce((acc, b) => acc + ((b.sales_count || 0) * (b.price || 0)), 0);
        const netEarned = grossEarned * 0.75; 
        setTotalEarned(netEarned);
        setBalance(netEarned);
      }

      // 2. Sotib olingan kitoblar
      const { data: purchases } = await supabase
        .from('purchases')
        .select('*, books(*)')
        .eq('user_id', user.id);

      if (purchases) {
        setPurchasedBooks(purchases);
        const spent = purchases.reduce((acc, p) => acc + (p.price || p.books?.price || 0), 0);
        setTotalSpent(spent);
      }

      setLoading(false);
    }

    fetchUserData();
  }, [router]);

  // Galereyadan rasm yuklash funksiyasi
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImage(true);
      setUpdateMsg('');

      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Supabase Storage "avatars" bucket'iga yuklash
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Yuklangan rasmning ochiq havolasini olish
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      setAvatarUrl(publicUrl);

      // Foydalanuvchi profiliga rasmni saqlash
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      setUpdateMsg("Profil rasmi muvaffaqiyatli yangilandi!");
    } catch (error: any) {
      setUpdateMsg("Rasm yuklashda xatolik: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Profilni янilash (Ism)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg('');

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    if (error) {
      setUpdateMsg("Xatolik yuz berdi: " + error.message);
    } else {
      setUpdateMsg("Profil ma'lumotlari muvaffaqiyatli yangilandi!");
    }
  };

  // Pulni yechib olish
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg('');

    const amount = Number(withdrawAmount);
    if (amount <= 0 || amount > balance) {
      setWithdrawMsg("Xatolik: Mablag' yetarli emas yoki noto'g'ri summa kiritildi.");
      return;
    }

    if (cardNumber.length < 16) {
      setWithdrawMsg("Iltimos, to'g'ri karta raqamini kiriting.");
      return;
    }

    const { error } = await supabase.from('withdrawals').insert([
      { user_id: user?.id, amount, card_number: cardNumber, status: 'pending' }
    ]);

    if (error) {
      setWithdrawMsg("So'rov yuborishda xatolik: " + error.message);
    } else {
      setWithdrawMsg("Pulni yechib olish so'rovi yuborildi! Tez orada kartangizga o'tkazib beriladi.");
      setBalance(balance - amount);
      setWithdrawAmount('');
      setCardNumber('');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Yuklanmoqda...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between font-sans">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
              L
            </div>
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent tracking-tight block leading-none">
                LEXON<span className="text-blue-600">AI</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-1">Shaxsiy Kabinet</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold text-slate-600 hover:text-blue-600 transition">Bosh sahifa</Link>
            <button onClick={handleSignOut} className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition">
              Chiqish
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-10 w-full">
        
        {/* PROFIL CARD & BALANS */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-black uppercase shadow-md">
                {fullName ? fullName.charAt(0) : user?.email?.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black">{fullName || "Foydalanuvchi"}</h1>
              <p className="text-blue-200 text-xs mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 p-5 rounded-2xl text-center min-w-[240px]">
            <p className="text-xs text-blue-200 uppercase font-bold">Balansingiz (75% ulush)</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">{balance.toLocaleString()} so'm</p>
          </div>
        </div>

        {/* PROFILNI TAHRIRLASH (GALEREYADAN RASM TANLASH VA ISM) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-4">⚙️ Profil Ma'lumotlarini O'zgartirish</h2>
          {updateMsg && <div className="mb-4 p-3 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold">{updateMsg}</div>}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Ism va Sharifingiz:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold outline-none text-slate-900"
                  placeholder="Ismingizni kiriting"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Galereyadan Rasm Tanlash (Telefon yoki Kompyuter):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
                {uploadingImage && <p className="text-[11px] text-blue-600 font-bold mt-1">Rasm yuklanmoqda...</p>}
              </div>
            </div>

            <div>
              <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition">
                O'zgarishlarni Saqlash
              </button>
            </div>
          </form>
        </div>

        {/* STATISTIKA KARTALARI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Sotib olinganlar</p>
            <p className="text-3xl font-black text-blue-600 mt-2">{purchasedBooks.length} ta</p>
            <p className="text-xs text-slate-500 mt-1">Sarflangan: {totalSpent.toLocaleString()} so'm</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Yuklagan kitoblarim</p>
            <p className="text-3xl font-black text-indigo-600 mt-2">{myBooks.length} ta</p>
            <p className="text-xs text-slate-500 mt-1">Sizning ulushingiz (75%): {totalEarned.toLocaleString()} so'm</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Jami ko'rishlar</p>
            <p className="text-3xl font-black text-purple-600 mt-2">
              {myBooks.reduce((acc, b) => acc + (b.views_count || 0), 0)} marta
            </p>
            <p className="text-xs text-slate-500 mt-1">Kitoblar o'qilishi</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Sotuvlar soni</p>
            <p className="text-3xl font-black text-emerald-600 mt-2">
              {myBooks.reduce((acc, b) => acc + (b.sales_count || 0), 0)} ta
            </p>
            <p className="text-xs text-slate-500 mt-1">Sotilgan adabiyotlar</p>
          </div>
        </div>

        {/* PULNI YECHIB OLISH */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-2">💳 Mablag'ni Chiqarib Olish</h2>
          <p className="text-xs text-slate-400 mb-4">Sotuvlardan tushgan sof mablag'ning 75% qismini kartangizga yechib olishingiz mumkin (25% platforma ulushi).</p>
          {withdrawMsg && <div className="mb-4 p-3 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold">{withdrawMsg}</div>}
          
          <form onSubmit={handleWithdraw} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Summa (so'm):</label>
              <input
                type="number"
                placeholder="Masalan: 50000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold outline-none text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Plastik Karta Raqami:</label>
              <input
                type="text"
                placeholder="8600 •••• •••• ••••"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold outline-none text-slate-900"
                required
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition">
                Pulni Yechish So'rovini Yuborish
              </button>
            </div>
          </form>
        </div>

        {/* SOTIB OLINGAN MAHSULOTLAR */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-6">📚 Sotib Olingan Mahsulotlar</h2>
          {purchasedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedBooks.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold">Sotib olingan</span>
                    <h3 className="font-bold text-slate-900 text-sm mt-3">{item.books?.title || "Kitob nomi"}</h3>
                    <p className="text-xs text-slate-500 mt-1">Muallif: {item.books?.author_name || "Noma'lum"}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 text-xs font-bold">
                    <span className="text-emerald-600">Narxi: {item.price || item.books?.price || 0} so'm</span>
                    <a href={item.books?.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">O'qish →</a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">Siz hali hech qanday mahsulot sotib olmagansiz.</p>
          )}
        </div>

        {/* YUKLAGAN KITOBLARIM STATISTIKASI */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-6">✍️ Men Yuklagan Adabiyotlar Statistikasi</h2>
          {myBooks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase">
                    <th className="pb-3">Kitob nomi</th>
                    <th className="pb-3">Kategoriya</th>
                    <th className="pb-3">Ko'rilgan soni</th>
                    <th className="pb-3">Sotilgani</th>
                    <th className="pb-3">Holati</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {myBooks.map((book, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-bold text-slate-900">{book.title}</td>
                      <td className="py-3 text-slate-600">{book.category}</td>
                      <td className="py-3 text-purple-600 font-bold">👁️ {book.views_count || 0}</td>
                      <td className="py-3 text-emerald-600 font-bold">🛒 {book.sales_count || 0} ta</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${book.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {book.status === 'approved' ? 'Tasdiqlangan' : 'Kutilmoqda'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">Siz hali hech qanday kitob yuklamagansiz.</p>
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="py-6 border-t border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <p>© 2026 LexonAI. Barcha huquqlar himoyalangan.</p>
          <Link href="/oferta" className="font-bold text-blue-600 hover:underline">Ommaviy Oferta</Link>
        </div>
      </footer>
    </div>
  );
}