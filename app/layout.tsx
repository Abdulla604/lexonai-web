import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LexonAI - Elektron Kutubxona",
  description: "O'zbekiston Respublikasi qonunchiligi va yuridik yordamchi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <meta name="google-site-verification" content="U7XFnzXckTjTykFQLhuir-ECgFYSuk2WjH0Tg_3EKOA" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}