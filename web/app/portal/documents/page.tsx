import type { Metadata } from "next";
import { listDocuments } from "../../lib/adminDocuments";
import MediaManager from "./_components/MediaManager";

export const metadata: Metadata = { title: "メディア管理 | きたげん管理画面" };

export default async function MediaPage() {
  const [topDocs, shopDocs, takeoutDocs, lunchDocs, dinnerDocs, calendarDocs] = await Promise.all([
    listDocuments("top"),
    listDocuments("shop"),
    listDocuments("takeout"),
    listDocuments("lunch"),
    listDocuments("dinner"),
    listDocuments("calendar"),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-800">メディア管理</h1>
        <p className="text-sm text-slate-500 mt-1">
          サイト画像・各種PDF・資料をまとめて管理します。
        </p>
      </div>

      <MediaManager
        topDocs={topDocs}
        shopDocs={shopDocs}
        takeoutDocs={takeoutDocs}
        lunchDocs={lunchDocs}
        dinnerDocs={dinnerDocs}
        calendarDocs={calendarDocs}
      />
    </div>
  );
}
