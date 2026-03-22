import {
  Clock,
  Armchair,
  CreditCard,
  Phone,
  type LucideIcon,
} from "lucide-react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 店舗情報の編集はここだけ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HOURS = {
  regular: {
    days: "月・火・水・木・金・土",
    sessions: [
      { label: "ランチ", open: "11:30", close: "14:00", lo: "13:30" },
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
  count: "41席",
  features: ["カウンター席あり", "貸切可能"],
  smoking: ["電子タバコ：店内OK", "紙タバコ：2階喫煙所あり"],
  parking: "なし",
};

const PAYMENT = ["現金", "クレジットカード", "PayPay"];

const RESERVATION = "お電話でご予約いただけます。";
const PHONE       = "070-1744-2839";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── カード共通レイアウト ───────────────────────────────
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
        <h3 className="font-bold text-base">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── 時間ブロック（ランチ・ディナー行） ────────────────
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
            <span className="font-medium tabular-nums">
              {s.open}〜{s.close}
            </span>
            <span className="text-xs text-muted ml-2">L.O. {s.lo}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function StoreInfo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 営業時間 */}
      <InfoCard icon={Clock} title="営業時間">
        <div className="space-y-5">
          <HourBlock
            days={HOURS.regular.days}
            sessions={HOURS.regular.sessions}
          />
          <HourBlock
            days={HOURS.holiday.days}
            sessions={HOURS.holiday.sessions}
          />
          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <span className="text-xs text-muted">定休日</span>
            <span className="text-sm font-semibold text-accent">
              {HOURS.closed}
            </span>
          </div>
        </div>
      </InfoCard>

      {/* 席・設備 */}
      <InfoCard icon={Armchair} title="席・設備">
        <dl className="text-sm space-y-3">
          {[
            { label: "席数", value: SEATS.count },
            { label: "設備", value: SEATS.features },
            { label: "喫煙", value: SEATS.smoking },
            { label: "駐車場", value: SEATS.parking },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0"
            >
              <dt className="text-muted shrink-0 w-14">{label}</dt>
              <dd className="space-y-0.5 leading-relaxed">
                {Array.isArray(value)
                  ? value.map((v) => <p key={v}>{v}</p>)
                  : value}
              </dd>
            </div>
          ))}
        </dl>
      </InfoCard>

      {/* お支払い */}
      <InfoCard icon={CreditCard} title="お支払い">
        <div className="flex flex-wrap gap-2">
          {PAYMENT.map((p) => (
            <span
              key={p}
              className="px-3 py-1.5 bg-card-bg border border-border rounded-lg text-sm"
            >
              {p}
            </span>
          ))}
        </div>
      </InfoCard>

      {/* ご予約 */}
      <InfoCard icon={Phone} title="ご予約">
        <div className="space-y-4 text-sm">
          <p className="text-muted leading-relaxed">{RESERVATION}</p>
          <div className="border-t border-border/40 pt-4">
            <a
              href={`tel:${PHONE}`}
              className="block text-xl font-bold tracking-wider text-foreground hover:text-accent transition-colors duration-200 tabular-nums"
            >
              {PHONE}
            </a>
            <p className="text-xs text-muted mt-1">タップで発信できます</p>
            <p className="text-xs text-muted/60 mt-2 leading-relaxed">
              「ホームページを見た」とお伝えいただくと<br />ご案内がスムーズです。
            </p>
          </div>
        </div>
      </InfoCard>
    </div>
  );
}
