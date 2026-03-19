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

const SITE_URL = "https://kitagen-izakaya.com";
const OG_IMAGE = "/og.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "IZAKAYAきたげん | 桃谷の居酒屋",
  description:
    "桃谷の居酒屋「きたげん」。こだわりの料理とお酒を楽しめるお店です。宴会や飲み会にも最適。",
  keywords: ["きたげん", "桃谷 居酒屋", "大阪 居酒屋"],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "IZAKAYAきたげん | 桃谷の居酒屋",
    description:
      "桃谷の居酒屋「きたげん」。こだわりの料理とお酒を楽しめるお店です。",
    url: SITE_URL,
    siteName: "IZAKAYAきたげん",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "IZAKAYAきたげん | 桃谷の居酒屋",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IZAKAYAきたげん | 桃谷の居酒屋",
    description:
      "桃谷の居酒屋「きたげん」。こだわりの料理とお酒を楽しめるお店です。",
    images: [OG_IMAGE],
  },
};
