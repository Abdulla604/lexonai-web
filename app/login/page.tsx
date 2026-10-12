"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Bu yerda backend API orqali tekshiriladi
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        window.location.href = "/";
      } else {
        setError(data.message || "Email yoki parol xato!");
      }
    } catch (err) {
      setError("Server bilan aloqa yo'q!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-slate-900 text-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-center">Kutubxonaga Kirish</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-600/30 border border-red-500 text-red-200 text-sm rounded-lg text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="nomi@gmail.com"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Parol</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="********"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
        >
          {loading ? "Kirilmoqda..." : "Kirish"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Hisobingiz yo'qmi?{" "}
        <a href="/register" className="text-blue-400 hover:underline">
          Ro'yxatdan o'tish
        </a>
      </div>
    </div>
  );
}