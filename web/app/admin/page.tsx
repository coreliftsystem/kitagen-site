import Link from "next/link";
import { Megaphone, UtensilsCrossed, ChevronRight } from "lucide-react";

const sections = [
  {
    href: "/admin/news",
    icon: Megaphone,
    label: "お知らせ管理",
    description: "お知らせの確認・追加・編集・削除",
  },
  {
    href: "/admin/menus",
    icon: UtensilsCrossed,
    label: "メニュー管理",
    description: "メニューの表示設定・並び順を管理",
  },
];

export default function AdminDashboard() {
  return (
    <div>
      {/* ── ページヘッダー ────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-800">ダッシュボード</h1>
        <p className="text-sm text-slate-500 mt-1">管理項目を選択してください。</p>
      </div>

      {/* ── 管理セクション一覧 ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                <Icon size={18} strokeWidth={1.8} className="text-slate-600" />
              </div>
              <ChevronRight
                size={15}
                className="text-slate-300 group-hover:text-slate-500 mt-1 transition-colors"
              />
            </div>
            <div className="mt-4">
              <h2 className="font-semibold text-slate-800 text-sm">{label}</h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── 補足 ──────────────────────────────────────── */}
      <div className="mt-10 p-5 bg-white rounded-xl border border-slate-200">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">
          今後追加予定
        </h2>
        <ul className="text-xs text-slate-500 space-y-1 leading-relaxed">
          <li>・店舗情報管理（営業時間・定休日の更新）</li>
        </ul>
      </div>
    </div>
  );
}
