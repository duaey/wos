import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WOS İttifak Takip",
  description: "Whiteout Survival ittifak canlı takip paneli",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
            <Link href="/" className="text-lg font-bold text-sky-300 no-underline">
              ❄️ WOS Takip
            </Link>
            <Link href="/">Dashboard</Link>
            <Link href="/members">Üyeler</Link>
            <Link href="/events">Etkinlikler</Link>
            <Link href="/chat">Chat</Link>
            <Link href="/admin">Yönetim</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
