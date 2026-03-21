import type { Metadata } from "next";
import Image from "next/image";
import { Utensils } from "lucide-react";
import Link from "next/link";
import { getMenusForLunch, groupByCategorySub } from "../../lib/menus";

export const metadata: Metadata = {
  title: "ランチメニュー｜きたげん",
  description: "きたげんのランチメニューをご覧いただけます。",
};

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-10">
      <p className="text-[10px] tracking-[0.45em] text-accent/80 mb-2">{label}</p>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="flex items-center gap-3 mt-3">
        <div className="w-8 h-px bg-accent/50" />
        <div className="w-1 h-1 rounded-full bg-accent/60" />
        <div className="w-8 h-px bg-accent/50" />
      </div>
    </div>
  );
}

function MenuItemRow({
  name,
  description,
  price,
}: {
  name:         string;
  description?: string;
  price?:       string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border/70 last:border-0 group">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm leading-snug group-hover:text-accent transition-colors duration-200">
          {name}
        </p>
        {description && (
          <p className="text-xs text-muted mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      {price && (
        <p className="text-sm text-accent font-medium shrink-0 tabular-nums">{price}</p>
      )}
    </div>
  );
}

export default async function LunchMenuPage() {
  const allItems = await getMenusForLunch();
  const foodSections = groupByCategorySub(allItems.filter((i) => i.category_main === "food"));
  const hasItems = allItems.length > 0;

  return (
    <div className="min-h-screen">

      {/* ── ページヘッダー ─────────────────────────────────── */}
      <section className="section-warm border-b border-border py-16 px-4 text-center">
        <p className="text-[10px] tracking-[0.5em] text-accent/80 mb-3">LUNCH</p>
        <h1 className="text-4xl font-bold text-foreground mb-4">ランチメニュー</h1>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-px bg-accent/50" />
          <div className="w-1 h-1 rounded-full bg-accent/70" />
          <div className="w-8 h-px bg-accent/50" />
        </div>
        <p className="text-sm text-muted mb-3">
          営業時間：11:30〜14:00（L.O. 13:30）／ 月〜土
        </p>
        <Link href="/menu/dinner" className="text-xs text-accent/70 hover:text-accent transition-colors duration-200">
          ディナーメニューはこちら →
        </Link>
      </section>

      {/* ── ランチメニュー ─────────────────────────────────── */}
      {hasItems ? (
        <section className="py-16 px-4 section-light">
          <div className="max-w-3xl mx-auto">
            <SectionHeading label="LUNCH" title="ランチメニュー" />
            <div className="space-y-10">
              {foodSections.map((sec) => (
                <div key={sec.heading}>
                  <h3 className="text-xs tracking-widest text-muted mb-1 uppercase">{sec.heading}</h3>
                  <div className="bg-background rounded-xl border border-border px-5">
                    {sec.items.map((item) => (
                      <MenuItemRow
                        key={item.id}
                        name={item.name}
                        description={item.description}
                        price={item.price}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-24 px-4 section-light">
          <div className="max-w-md mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              <Utensils size={32} strokeWidth={1.2} className="text-accent/40" />
            </div>
            <p className="text-[10px] tracking-[0.45em] text-accent/70 mb-4">COMING SOON</p>
            <h2 className="text-xl font-bold mb-4">ランチメニューを準備中です</h2>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-px bg-accent/40" />
              <div className="w-1 h-1 rounded-full bg-accent/50" />
              <div className="w-8 h-px bg-accent/40" />
            </div>
            <p className="text-sm text-muted leading-[2.0]">
              ランチの詳細メニューは現在準備中です。<br />
              最新情報はInstagramまたは店頭にてご確認ください。
            </p>
          </div>
        </section>
      )}

      {/* ── PDF ───────────────────────────────────────────── */}
      <section className="py-16 px-4 section-warm border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-[0.4em] text-accent/80 mb-3">PDF</p>
          <h2 className="text-xl font-bold text-foreground mb-3">全メニューを見る</h2>
          <p className="text-sm text-muted mb-8">
            全品目・価格を掲載したPDFメニューをご用意しています。
          </p>
          <button
            disabled
            className="inline-block px-10 py-3 border border-border text-muted rounded-sm text-sm tracking-wider cursor-not-allowed"
            title="準備中"
          >
            全メニューPDFを見る（準備中）
          </button>
          <p className="text-xs text-muted/60 mt-4">
            ※ 現在準備中です。しばらくお待ちください。
          </p>
        </div>
      </section>

    </div>
  );
}
