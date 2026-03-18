import Link from "next/link";
import Image from "next/image";
import { UtensilsCrossed, MapPin, ClipboardList, ChefHat, Wine, Lamp, ShoppingBag, Utensils } from "lucide-react";
import { getMenusForTop } from "./lib/menus";
import { getAnnouncements } from "./lib/announcements";
import ParallaxHero from "./components/ParallaxHero";
import ScrollReveal from "./components/ScrollReveal";
import NavCard from "./components/NavCard";
import PhotoStrip from "./components/PhotoStrip";
import NewsCard from "./components/NewsCard";

export default async function Home() {
  const [topItems, announcements] = await Promise.all([
    getMenusForTop(),
    getAnnouncements(),
  ]);
  const photoItems = topItems.map((i) => ({ ...i, image: i.image ?? "" }));
  const recentNews = announcements.slice(0, 3);
  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────── */}
      {/* bg-foreground = 写真がないときの温かいダークブラウン背景 */}
      <section className="relative h-[55vh] md:h-auto md:min-h-[82vh] flex items-center justify-center overflow-hidden bg-foreground">
        {/* 背景写真 (パララックス付き) */}
        <ParallaxHero />

        {/* 半透明オーバーレイ — 写真の上に重ねてテキストを読みやすくする */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

        {/* 装飾コーナー（スマホでは非表示） */}
        <div className="hidden sm:block absolute top-20 left-8 w-8 h-8 border-t border-l border-white/25 z-10 hero-animate" />
        <div className="hidden sm:block absolute top-20 right-8 w-8 h-8 border-t border-r border-white/25 z-10 hero-animate" />
        <div className="hidden sm:block absolute bottom-12 left-8 w-8 h-8 border-b border-l border-white/25 z-10 hero-animate" />
        <div className="hidden sm:block absolute bottom-12 right-8 w-8 h-8 border-b border-r border-white/25 z-10 hero-animate" />

        <div className="relative z-10 text-center px-4">
          <p className="text-xs tracking-[0.5em] text-white/60 mb-4 hero-animate">
            IZAKAYA
          </p>
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold mb-4 hero-animate-delay text-white text-shadow">
            きたげん
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4 hero-animate-delay">
            <div className="w-10 h-px bg-white/35" />
            <div className="w-1 h-1 rounded-full bg-accent" />
            <div className="w-10 h-px bg-white/35" />
          </div>
          <p className="text-sm sm:text-lg md:text-xl text-white/65 tracking-wide hero-animate-delay-2 text-shadow">
            落ち着いて飲める、ちゃんとした居酒屋。
          </p>
        </div>
      </section>

      {/* ── 料理写真 ──────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10">
              <p className="text-[10px] tracking-[0.45em] text-accent/80 mb-2">
                GALLERY
              </p>
              <h2 className="text-2xl font-bold">きたげんの料理</h2>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="w-8 h-px bg-accent/50" />
                <div className="w-1 h-1 rounded-full bg-accent/70" />
                <div className="w-8 h-px bg-accent/50" />
              </div>
              <p className="text-sm text-muted mt-4">
                定番から季節のひと品まで。
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <PhotoStrip items={photoItems} />
          </ScrollReveal>
        </div>
      </section>

      {/* ── Navigation Cards ─────────────────────────────── */}
      <section className="py-14 px-4 bg-card-bg">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <ScrollReveal delay={0}>
            <NavCard
              href="/menu"
              icon={UtensilsCrossed}
              title="メニュー"
              description="料理・ドリンクをご覧いただけます"
            />
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <NavCard
              href="/info"
              icon={MapPin}
              title="店舗情報"
              description="営業時間・アクセスはこちら"
            />
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <NavCard
              href="/takeout"
              icon={ShoppingBag}
              title="テイクアウト"
              description="人気メニューをご自宅でもどうぞ"
            />
          </ScrollReveal>
          <ScrollReveal delay={240}>
            <NavCard
              href="/survey"
              icon={ClipboardList}
              title="アンケート"
              description="ご意見・ご感想をお聞かせください"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ── こだわり ──────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-xs tracking-[0.4em] text-accent mb-3">
                CONCEPT
              </p>
              <h2 className="text-2xl font-bold">きたげんのこだわり</h2>
              <div className="flex items-center justify-center gap-3 mt-5">
                <div className="w-8 h-px bg-accent/60" />
                <div className="w-1 h-1 rounded-full bg-accent" />
                <div className="w-8 h-px bg-accent/60" />
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: ChefHat,
                title: "料理",
                body: "手作りにこだわった、季節の食材を活かした一品。派手さより、うまさを大切にしています。",
                delay: 0,
              },
              {
                icon: Wine,
                title: "お酒",
                body: "定番から地酒まで、料理に合うお酒を取り揃えています。迷ったらお気軽にどうぞ。",
                delay: 120,
              },
              {
                icon: Lamp,
                title: "雰囲気",
                body: "ふらっと寄れて、ゆっくり過ごせる。肩肘張らない、居心地の良い空間です。",
                delay: 240,
              },
            ].map(({ icon: Icon, title, body, delay }) => (
              <ScrollReveal key={title} delay={delay}>
                <div className="group flex flex-row md:flex-col items-center md:items-center gap-5 md:gap-0 p-6 md:p-8 bg-background rounded-xl border border-border">
                  <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl bg-card-bg border border-border/60 flex items-center justify-center md:mx-auto md:mb-5 transition-all duration-300 group-hover:bg-accent/10 group-hover:border-accent/30">
                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      className="text-accent transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="md:text-center">
                    <h3 className="font-bold mb-1.5 text-base">{title}</h3>
                    <p className="text-sm text-muted leading-loose">{body}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── お知らせ ──────────────────────────────────────── */}
      {recentNews.length > 0 && (
        <section className="py-20 px-4 bg-card-bg">
          <div className="max-w-2xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p className="text-[10px] tracking-[0.5em] text-accent/70 mb-2">NEWS</p>
                <h2 className="text-2xl font-bold tracking-wide">お知らせ</h2>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <div className="w-8 h-px bg-accent/50" />
                  <div className="w-1 h-1 rounded-full bg-accent/70" />
                  <div className="w-8 h-px bg-accent/50" />
                </div>
                <p className="text-xs text-muted mt-4 tracking-wider">きたげんからのご案内</p>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              {recentNews.map((item, i) => (
                <ScrollReveal key={item.id} delay={i * 80}>
                  <NewsCard item={item} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── おすすめメニュー ──────────────────────────────── */}
      <section className="py-24 px-4 bg-card-bg">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-xs tracking-[0.4em] text-accent mb-3">MENU</p>
              <h2 className="text-2xl font-bold">おすすめメニュー</h2>
              <div className="flex items-center justify-center gap-3 mt-5">
                <div className="w-8 h-px bg-accent/60" />
                <div className="w-1 h-1 rounded-full bg-accent" />
                <div className="w-8 h-px bg-accent/60" />
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topItems.slice(0, 3).map((item, i) => (
              <ScrollReveal key={item.id} delay={i * 150}>
                <div className="card-lift bg-background rounded-lg overflow-hidden border border-border group">
                  <div className="h-48 bg-card-bg relative overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Utensils size={28} strokeWidth={1.2} className="text-muted/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold mb-1">{item.name}</h3>
                    <p className="text-sm text-muted mt-1">{item.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="text-center mt-12">
              <Link
                href="/menu"
                className="btn-lift inline-block px-10 py-3 border border-accent text-accent rounded-sm hover:bg-accent hover:text-background transition-colors text-sm tracking-[0.2em]"
              >
                メニューをもっと見る
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 初めての方へ ──────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-xs tracking-[0.4em] text-accent mb-3">VISIT</p>
            <h2 className="text-2xl font-bold mb-6">初めてご来店の方へ</h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-8 h-px bg-accent/60" />
              <div className="w-1 h-1 rounded-full bg-accent" />
              <div className="w-8 h-px bg-accent/60" />
            </div>
            <p className="text-muted leading-loose mb-10">
              きたげんは、ふらっと立ち寄れる居酒屋です。
              お一人様でも、グループでも、お気軽にお越しください。
              わからないことがあれば、スタッフにお声がけください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/info"
                className="btn-lift px-8 py-3 border border-border rounded-sm hover:border-accent transition-colors text-sm tracking-wider"
              >
                店舗情報を見る
              </Link>
              <Link
                href="/menu"
                className="btn-lift px-8 py-3 border border-border rounded-sm hover:border-accent transition-colors text-sm tracking-wider"
              >
                メニューを見る
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
