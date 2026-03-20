import type { Metadata } from "next";
import { getAnnouncements } from "../lib/announcements";
import NewsCard from "../components/NewsCard";

export const metadata: Metadata = {
  title: "お知らせ｜きたげん",
  description: "きたげんからのお知らせ・最新情報をご確認いただけます。",
};

export default async function NewsPage() {
  const items = await getAnnouncements();

  return (
    <div className="min-h-screen pt-16">

      {/* ── ページヘッダー ───────────────────────────────── */}
      <section className="section-warm py-16 px-4 text-center">
        <p className="text-[10px] tracking-[0.45em] text-accent/80 mb-2">NEWS</p>
        <h1 className="text-3xl font-bold">お知らせ</h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-8 h-px bg-accent/50" />
          <div className="w-1 h-1 rounded-full bg-accent/70" />
          <div className="w-8 h-px bg-accent/50" />
        </div>
        <p className="text-sm text-muted mt-4">きたげんからの最新情報</p>
      </section>

      {/* ── お知らせ一覧 ────────────────────────────────── */}
      <section className="py-12 px-4 section-light">
        <div className="max-w-2xl mx-auto">

          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted text-sm">現在お知らせはありません。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
