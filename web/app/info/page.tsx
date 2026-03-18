import type { Metadata } from "next";
import {
  Clock,
  Armchair,
  CreditCard,
  Phone,
  MapPin,
  ExternalLink,
  AtSign,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "店舗情報｜きたげん",
  description: "きたげんの営業時間・アクセス・席数・お支払い方法などをご確認いただけます。",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 編集はここだけ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HOURS = {
  regular: {
    days: "月・火・水・木・金・土",
    sessions: [
      { label: "ランチ",   open: "11:30", close: "14:00", lo: "13:30" },
      { label: "ディナー", open: "17:00", close: "22:00", lo: "21:30" },
    ],
  },
  holiday: {
    days: "祝日",
    sessions: [
      { label: "ディナー", open: "17:00", close: "22:00", lo: "21:30" },
    ],
  },
  closed: "日曜日",
};

const SEATS = {
  count:    "41席",
  features: ["カウンター席あり", "貸切可能"],
  smoking:  ["電子タバコ：店内OK", "紙タバコ：2階喫煙所あり"],
  parking:  "なし",
};

const PAYMENT = ["現金", "クレジットカード", "PayPay"];

const PHONE = "070-1744-2839";

const ACCESS = {
  address:     "〒544-0033 大阪府大阪市生野区\n勝山北1丁目2-13",
  nearest:     "JR大阪環状線「桃谷駅」徒歩2分",
  parking:     "駐車場はございません。お近くのコインパーキングをご利用ください。",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.89049709441!2d135.52679927628435!3d34.65746828553037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000df000a517bf7%3A0x81ed5ec961cb5e!2zSVpBS0FZQSDjgY3jgZ_jgZLjgpM!5e0!3m2!1sja!2sjp!4v1773280180352!5m2!1sja!2sjp",
  mapUrl:      "https://www.google.co.jp/maps/place/IZAKAYA+%E3%81%8D%E3%81%9F%E3%81%92%E3%82%93/@34.6574683,135.5267993,17z/data=!3m1!4b1!4m6!3m5!1s0x6000df000a517bf7:0x81ed5ec961cb5e!8m2!3d34.6574639!4d135.5293742!16s%2Fg%2F11vwjd2bch?entry=ttu&g_ep=EgoyMDI2MDMwOS4wIKXMDSoASAFQAw%3D%3D",
};

const INSTAGRAM_URL = "https://www.instagram.com/izakaya_kitagen";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── 共通カードレイアウト ──────────────────────────────
function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-card-bg border border-border/60 flex items-center justify-center shrink-0">
          <Icon size={17} strokeWidth={1.5} className="text-accent" />
        </div>
        <h2 className="font-bold text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── 営業時間内の時間ブロック ──────────────────────────
function HourBlock({
  days,
  sessions,
}: {
  days: string;
  sessions: { label: string; open: string; close: string; lo: string }[];
}) {
  return (
    <div>
      <p className="text-[11px] text-muted tracking-wider mb-2">{days}</p>
      {sessions.map((s) => (
        <div
          key={s.label}
          className="flex items-baseline justify-between text-sm border-b border-border/40 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0"
        >
          <span className="text-muted shrink-0 mr-4 w-14">{s.label}</span>
          <div className="text-right">
            <span className="font-medium tabular-nums">{s.open}〜{s.close}</span>
            <span className="text-xs text-muted ml-2">L.O. {s.lo}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function InfoPage() {
  return (
    <div className="min-h-screen pt-16">

      {/* ── ページヘッダー ───────────────────────────────── */}
      <section className="bg-card-bg py-16 px-4 text-center">
        <p className="text-[10px] tracking-[0.45em] text-accent/80 mb-2">STORE INFO</p>
        <h1 className="text-3xl font-bold">店舗情報</h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-8 h-px bg-accent/50" />
          <div className="w-1 h-1 rounded-full bg-accent/70" />
          <div className="w-8 h-px bg-accent/50" />
        </div>
        <p className="text-sm text-muted mt-4">営業時間・アクセス・各種ご案内</p>
      </section>

      {/* ── 店舗情報カード群 ─────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* ── カードグリッド ─ 2列（スマホは1列） ─────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* 1. 営業時間 */}
            <InfoCard icon={Clock} title="営業時間">
              <div className="space-y-5">
                <HourBlock days={HOURS.regular.days} sessions={HOURS.regular.sessions} />
                <HourBlock days={HOURS.holiday.days} sessions={HOURS.holiday.sessions} />
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-xs text-muted">定休日</span>
                  <span className="text-sm font-semibold text-accent">{HOURS.closed}</span>
                </div>
              </div>
            </InfoCard>

            {/* 2. アクセス（住所・最寄り・駐車場 + 地図） */}
            <div className="rounded-xl border border-border bg-background overflow-hidden">
              {/* ヘッダー + テキスト情報 */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-card-bg border border-border/60 flex items-center justify-center shrink-0">
                    <MapPin size={17} strokeWidth={1.5} className="text-accent" />
                  </div>
                  <h2 className="font-bold text-base">アクセス</h2>
                </div>
                <dl className="text-sm space-y-3">
                  {[
                    { label: "住所",     value: ACCESS.address, pre: true  },
                    { label: "最寄り駅", value: ACCESS.nearest, pre: false },
                    { label: "駐車場",   value: ACCESS.parking, pre: false },
                  ].map(({ label, value, pre }, i, arr) => (
                    <div
                      key={label}
                      className={`flex flex-col gap-1 ${i < arr.length - 1 ? "border-b border-border/40 pb-3" : ""}`}
                    >
                      <dt className="text-[11px] text-muted tracking-wider">{label}</dt>
                      <dd className={`leading-relaxed ${pre ? "whitespace-pre-line font-medium" : ""}`}>
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              {/* 地図（カード内・余白なし） */}
              <div className="border-t border-border/40">
                <iframe
                  src={ACCESS.mapEmbedUrl}
                  className="w-full h-[200px] block"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="きたげん アクセスマップ"
                />
              </div>
              {/* Googleマップリンク */}
              <div className="px-6 py-4 border-t border-border/40">
                <a
                  href={ACCESS.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-dark transition-colors duration-200"
                >
                  <MapPin size={13} strokeWidth={1.5} />
                  Googleマップで開く
                  <ExternalLink size={11} strokeWidth={1.5} className="opacity-60" />
                </a>
              </div>
            </div>

            {/* 3. 席・設備 */}
            <InfoCard icon={Armchair} title="席・設備">
              <dl className="text-sm space-y-3">
                {[
                  { label: "席数",   value: SEATS.count    },
                  { label: "設備",   value: SEATS.features },
                  { label: "喫煙",   value: SEATS.smoking  },
                  { label: "駐車場", value: SEATS.parking  },
                ].map(({ label, value }, i, arr) => (
                  <div
                    key={label}
                    className={`flex gap-4 ${i < arr.length - 1 ? "border-b border-border/40 pb-3" : ""}`}
                  >
                    <dt className="text-muted shrink-0 w-14">{label}</dt>
                    <dd className="space-y-0.5 leading-relaxed">
                      {Array.isArray(value) ? value.map((v) => <p key={v}>{v}</p>) : value}
                    </dd>
                  </div>
                ))}
              </dl>
            </InfoCard>

            {/* 4. お支払い */}
            <InfoCard icon={CreditCard} title="お支払い">
              <div className="flex flex-wrap gap-2">
                {PAYMENT.map((p) => (
                  <span key={p} className="px-3 py-1.5 bg-card-bg border border-border rounded-lg text-sm">
                    {p}
                  </span>
                ))}
              </div>
            </InfoCard>

            {/* 5. ご予約 */}
            <InfoCard icon={Phone} title="ご予約">
              <div className="space-y-4 text-sm">
                <p className="text-muted leading-relaxed">お電話でご予約いただけます。</p>
                <div className="border-t border-border/40 pt-4">
                  <a
                    href={`tel:${PHONE}`}
                    className="block text-xl font-bold tracking-wider text-foreground hover:text-accent transition-colors duration-200 tabular-nums"
                  >
                    {PHONE}
                  </a>
                  <p className="text-xs text-muted mt-1">タップで発信できます</p>
                </div>
              </div>
            </InfoCard>

            {/* 6. 公式アカウント */}
            <InfoCard icon={AtSign} title="公式アカウント">
              <div className="space-y-3 text-sm">
                <p className="text-muted leading-relaxed">
                  料理や店内の様子をInstagramで発信しています。
                </p>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-accent hover:text-accent-dark transition-colors duration-200"
                >
                  @izakaya_kitagen
                  <ExternalLink size={12} strokeWidth={1.5} className="opacity-60" />
                </a>
              </div>
            </InfoCard>

          </div>

        </div>
      </section>

    </div>
  );
}
