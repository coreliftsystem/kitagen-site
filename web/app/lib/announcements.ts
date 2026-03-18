// web/app/lib/announcements.ts
//
// 口コミ案内サポートシステムの public API からお知らせを取得するデータ層。
// Next.js Server Component から呼び出す（client component からは呼ばない）。
//
// 環境変数：MENU_API_BASE_URL（.env.local に設定済み）

const BASE_URL = process.env.MENU_API_BASE_URL ?? "http://localhost:3000";
const SHOP_ID = "kitagen";

// ── 型定義 ─────────────────────────────────────────────────────

export interface PublicAnnouncement {
  id: string;
  title: string;
  body: string | undefined;
  createdAt: string | undefined; // ISO8601 文字列
  sortOrder: number | undefined;
  publishAt: string | null | undefined; // ISO8601 or null（null = 即時公開）
}

// ── 公開判定 ───────────────────────────────────────────────────

/**
 * publishAt が設定されている場合、その日時を過ぎているものだけを表示する。
 * publishAt が null / undefined の場合は常に表示対象とする。
 */
function isVisibleNow(item: PublicAnnouncement): boolean {
  if (!item.publishAt) return true;
  return new Date(item.publishAt) <= new Date();
}

// ── API 取得 ───────────────────────────────────────────────────

export async function getAnnouncements(): Promise<PublicAnnouncement[]> {
  const url = `${BASE_URL}/api/public/announcements?shopId=${SHOP_ID}`;

  try {
    // キャッシュ時間を短めに設定し、予約公開が遅れすぎないようにする
    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) {
      console.error(`[announcements] fetch failed: status=${res.status}`);
      return [];
    }

    const data = await res.json();
    const items = (data.items ?? []) as PublicAnnouncement[];

    // publishAt による表示フィルタリング
    return items.filter(isVisibleNow);
  } catch (e) {
    console.error("[announcements] fetch error:", e);
    return [];
  }
}
