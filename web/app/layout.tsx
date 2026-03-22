import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Link from "next/link";
import Header from "./components/Header";
import ClientLayout from "./components/ClientLayout";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const SITE_URL = "https://kitagen-izakaya.com";
const OG_IMAGE = "/og.png";

const TITLE       = "きたげん｜桃谷の居酒屋・アットホームで気軽に飲める店";
const DESCRIPTION = "桃谷の居酒屋「きたげん」は、アットホームで気軽に立ち寄れる優しい居酒屋。宴会や一人飲み、仕事帰りにも最適。人気メニューや営業時間、アクセス情報を掲載する公式サイトです。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["きたげん", "桃谷 居酒屋", "大阪 居酒屋"],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "きたげん",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
};


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
