export default function OfertaPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <h1 className="text-3xl font-black text-slate-900 border-b pb-4">Ommaviy Oferta va Foydalanish Shartlari</h1>
        
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-blue-600">1. Umimiy qoidalar</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Ushbu Ommaviy oferta "LexonAI" elektron kutubxona va intellektual platformasi (keyingi o'rinlarda — "Platforma") xizmatlaridan foydalanish shartlarini belgilaydi. Saytdan foydalanish orqali siz ushbu shartlarga to'liq qo'shilasiz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-blue-600">2. Huquq va Majburiyatlar</h2>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 leading-relaxed">
            <li><strong>Platforma majburiyatlari:</strong> Foydalanuvchilar yuklagan materiallarni xavfsiz saqlash, ularning sotuvini ta'minlash va shaffof statistikani yuritish.</li>
            <li><strong>Muallif majburiyatlari:</strong> Faqat o'ziga tegishli bo'lgan yoki tarqatish huquqiga ega bo'lgan intellektual mulk (kitob, darslik, qo'llanma) yuklash. Plagiat va mualliflik huquqini buzuvchi materiallarni joylash qat'iyan taqiqlanadi.</li>
            <li><strong>Foydalanuvchi huquqlari:</strong> Sotib olingan resurslardan shaxsiy maqsadlarda cheklovsiz foydalanish.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-blue-600">3. Mualliflik Huquqi va Intellektual Mulk</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Platformaga joylashtirilgan barcha adabiyotlar va materiallar mualliflarining intellektual mulki hisoblanadi. Muallif o'z materialining huquqiy egasi bo'lib qoladi. Platforma materiallarni faqat sotish va tarqatish uchun litsenziya asosida joylashtiradi. Ruxsatsiz nusxalash va boshqa manbalarga tarqatish taqiqlanadi.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-blue-600">4. Moliyaviy shartlar va Foiz taqsimoti</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Platformada muallif tomonidan sotilgan har bir raqamli mahsulot (kitob/resurs) narxi quyidagicha taqsimlanadi:
          </p>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-sm font-bold text-blue-900 space-y-1">
            <p>📌 Mahsulot sotilgandan tushgan mablag'ning <strong>25% miqdori</strong> — Platforma rivoji va xizmat haqi sifatida loyihada qoladi.</p>
            <p>📌 Mablag'ning qolgan <strong>75% miqdori</strong> — To'g'ridan-to'g'ri mahsulotni yaratgan va sotgan muallifning balansiga o'tkazib beriladi.</p>
          </div>
        </section>

        <div className="pt-6 border-t text-xs text-slate-400 text-center">
          © 2026 LexonAI. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </div>
  );
}