// web/app/lib/adminAnnouncements.ts
//
// 管理画面用 お知らせ取得データ層（Server Component から呼ぶ）
// 書き込み操作は app/admin/news/actions.ts の Server Actions を使う

const BASE_URL = process.env.MENU_API_BASE_URL ?? "http://localhost:3000";

// ── 型定義 ─────────────────────────────────────────────────

export interface AdminAnnouncement {
  id: string;
  title: string;
  body: string;
  sortOrder: number;
  isPublished: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  shopId: string;
  publishAt: string | null; // ISO8601 or null（null = 即時公開）
}

/**
 * 現時点でユーザーに見える状態か判定する。
 * - isPublished=false → 下書き → false
 * - isPublished=true && publishAt=null → 公開中 → true
 * - isPublished=true && publishAt=過去 → 公開中 → true
 * - isPublished=true && publishAt=将来 → 予約済み → false
 */
export function isEffectivelyPublished(item: AdminAnnouncement): boolean {
  if (!item.isPublished) return false;
  if (!item.publishAt) return true;
  return new Date(item.publishAt) <= new Date();
}

// ── 一覧取得 ───────────────────────────────────────────────

export async function getAdminAnnouncements(): Promise<AdminAnnouncement[]> {
  const url = `${BASE_URL}/api/admin/announcements`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`[adminAnnouncements] list failed: status=${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data.items ?? []) as AdminAnnouncement[];
  } catch (e) {
    console.error("[adminAnnouncements] list error:", e);
    return [];
  }
}

// ── 1件取得 ────────────────────────────────────────────────

export async function getAdminAnnouncement(
  id: string,
): Promise<AdminAnnouncement | null> {
  const url = `${BASE_URL}/api/admin/announcements/${id}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.item ?? null) as AdminAnnouncement | null;
  } catch (e) {
    console.error("[adminAnnouncements] get error:", e);
    return null;
  }
}
