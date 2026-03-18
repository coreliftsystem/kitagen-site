import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Link from "next/link";
import MobileNav from "./components/MobileNav";
import ClientLayout from "./components/ClientLayout";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "きたげん｜居酒屋",
  description: "落ち着いて飲める、ちゃんとした居酒屋。きたげんの公式サイトです。",
};

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex flex-col items-start leading-tight hover:opacity-70 transition-opacity duration-200"
        >
          <span className="text-sm font-bold text-accent tracking-[0.2em]">
            きたげん
          </span>
          <span className="text-[8px] tracking-[0.42em] text-muted font-normal mt-0.5">
            IZAKAYA
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex gap-6 text-sm">
          <li>
            <Link href="/" className="hover:text-accent transition-colors">
              トップ
            </Link>
          </li>
          <li>
            <Link href="/menu" className="hover:text-accent transition-colors">
              メニュー
            </Link>
          </li>
          <li>
            <Link href="/info" className="hover:text-accent transition-colors">
              店舗情報
            </Link>
          </li>
          <li>
            <Link href="/news" className="hover:text-accent transition-colors">
              お知らせ
            </Link>
          </li>
          <li>
            <Link href="/survey" className="hover:text-accent transition-colors">
              アンケート
            </Link>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <MobileNav />
      </nav>
    </header>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-card-bg">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-lg font-bold text-accent">きたげん</p>
            <p className="text-sm text-muted">落ち着いて飲める、ちゃんとした居酒屋。</p>
          </div>
          <ul className="flex gap-6 text-sm text-muted">
            <li>
              <Link href="/menu" className="hover:text-foreground transition-colors">
                メニュー
              </Link>
            </li>
            <li>
              <Link href="/info" className="hover:text-foreground transition-colors">
                店舗情報
              </Link>
            </li>
            <li>
              <Link href="/survey" className="hover:text-foreground transition-colors">
                アンケート
              </Link>
            </li>
          </ul>
        </div>
        <p className="text-center text-xs text-muted mt-6">
          &copy; {currentYear} きたげん All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <ClientLayout header={<Header />} footer={<Footer />}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
