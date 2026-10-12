"use client";

import { useEffect } from "react";

export default function TelegramAuth() {
  useEffect(() => {
    // Telegram widget scriptini dinamik qo'shish
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "SIZNING_BOT_USERNAME_BUERGA"); // Bot usernameingizni yozing
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");

    // Skriptni sahifadagi biron bir div ichiga joylash uchun
    const container = document.getElementById("telegram-login-container");
    if (container) {
      container.appendChild(script);
    }

    // Telegram qaytargan ma'lumotni ushlab qoluvchifunksiya
    (window as any).onTelegramAuth = function (user: any) {
      alert(`Xush kelibsiz, ${user.first_name}! ID: ${user.id}`);
      
      // Bu yerda user ma'lumotlarini backend/Supabase ga yuborib seans ochamiz
      fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      }).then((res) => {
        if (res.ok) {
          window.location.href = "/"; // Bosh sahifaga yo'naltirish
        }
      });
    };
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-slate-900 text-white rounded-xl shadow-lg text-center">
      <h2 className="text-xl font-bold mb-4">Telegram orqali kirish</h2>
      <p className="text-sm text-slate-400 mb-6">
        Birgina tugmani bosish orqali tez va bepul kiring.
      </p>
      
      {/* Telegram tugmasi chiqadigan joy */}
      <div id="telegram-login-container" className="flex justify-center"></div>
    </div>
  );
}