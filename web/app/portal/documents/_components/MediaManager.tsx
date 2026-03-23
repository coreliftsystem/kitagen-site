"use client";

import { useState } from "react";
import { ImageIcon, FolderOpen } from "lucide-react";
import type { DocumentItem } from "../../../lib/adminDocuments";
import SiteImageManager from "../../top/_components/SiteImageManager";
import DocumentManager from "./DocumentManager";

type Tab = "images" | "docs";

const TABS: { key: Tab; label: string; icon: React.ElementType; hint: string }[] = [
  {
    key:   "images",
    label: "サイト画像",
    icon:  ImageIcon,
    hint:  "トップ・テイクアウトページに表示する写真を管理します",
  },
  {
    key:   "docs",
    label: "資料管理",
    icon:  FolderOpen,
    hint:  "ランチ・ディナー・テイクアウト・カレンダーの画像を種別ごとに管理します",
  },
];

interface Props {
  topDocs:      DocumentItem[];
  shopDocs:     DocumentItem[];
  takeoutDocs:  DocumentItem[];
  lunchDocs:    DocumentItem[];
  dinnerDocs:   DocumentItem[];
  calendarDocs: DocumentItem[];
}

export default function MediaManager({
  topDocs, shopDocs, takeoutDocs,
  lunchDocs, dinnerDocs, calendarDocs,
}: Props) {
  const [tab, setTab] = useState<Tab>("images");
  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <div>
      {/* ── タブ ── */}
      <div className="flex gap-1 mb-2 border-b border-slate-200">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? "border-slate-800 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Icon size={15} strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </div>

      {/* ── タブ説明 ── */}
      <p className="text-xs text-slate-400 mb-6 pt-2">{activeTab.hint}</p>

      {/* ── サイト画像 ── */}
      {tab === "images" && (
        <SiteImageManager
          topDocs={topDocs}
          shopDocs={shopDocs}
          takeoutDocs={takeoutDocs}
        />
      )}

      {/* ── 資料管理 ── */}
      {tab === "docs" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <DocumentManager
            lunchDocs={lunchDocs}
            dinnerDocs={dinnerDocs}
            calendarDocs={calendarDocs}
            takeoutDocs={takeoutDocs}
          />
        </div>
      )}
    </div>
  );
}
