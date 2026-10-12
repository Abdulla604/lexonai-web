"use client";

import { useState } from "react";

export default function TelegramAuth() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    const tg = (window as any).Telegram?.WebApp;
    const userData = tg?.initDataUnsafe?.user;

    if (!userData) {
      alert("Iltimos, ilovani Telegram bot orqali oching!");
      return;
    }

    setLoading(true);
    fetch("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "/";
        } else {
          alert("Xatolik yuz berdi!");
          setLoading(false);
        }
      })
      .catch(() => {
        alert("Server bilan aloqa yo'q!");
        setLoading(false);
      });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-slate-900 text-white rounded-xl shadow-lg text-center">
      <h2 className="text-xl font-bold mb-4">Telegram orqali kirish</h2>
      <p className="text-sm text-slate-400 mb-6">
        Hech qanday kod kutmasdan, bot orqali tez kiring.
      </p>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
      >
        {loading ? "Kirilmoqda..." : "Telegram orqali kirish"}
      </button>
    </div>
  );
}