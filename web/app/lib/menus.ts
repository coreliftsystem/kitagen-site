// web/app/lib/menus.ts
//
// 口コミ案内サポートシステムの public API からメニューを取得するデータ層。
// Next.js Server Component から呼び出す（client component からは呼ばない）。
//
// 環境変数：MENU_API_BASE_URL（.env.local に設定）

const BASE_URL = process.env.MENU_API_BASE_URL ?? "";
const SHOP_ID  = "kitagen";

// ── 型定義 ─────────────────────────────────────────────────────

export interface PublicMenuItem {
  id:            string;
  name:          string;
  description:   string | undefined;
  price:         string | undefined;    // 表示用文字列 "¥190" など
  image:         string | null;
  category_main: string;                // "food" | "drink"
  category_sub:  string;                // カテゴリ見出し（例：揚げ物、串、生ビール）
  sortOrder:     number;
}

// ── APIレスポンス → フロント型 のフィールド変換 ────────────────
//
// API（MongoDB）側のフィールド名    フロント型のフィールド名
//   category        →  category_main
//   subCategory     →  category_sub
//   imageUrl        →  image  （空文字 → null）
//   basePrice       →  price  （数値 → "¥190" 形式の文字列）

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiItem(raw: Record<string, any>): PublicMenuItem {
  const basePrice = raw.basePrice;
  const imageUrl  = raw.imageUrl;

  return {
    id:            String(raw.id ?? ""),
    name:          String(raw.name ?? ""),
    description:   raw.description ? String(raw.description) : undefined,
    price:         basePrice != null && basePrice !== ""
                     ? `¥${Number(basePrice).toLocaleString("ja-JP")}〜`
                     : undefined,
    image:         imageUrl && String(imageUrl).trim() !== ""
                     ? String(imageUrl)
                     : null,
    category_main: String(raw.category    ?? ""),
    category_sub:  String(raw.subCategory ?? ""),
    sortOrder:     Number(raw.sortOrder   ?? 0),
  };
}

// ── API 取得（内部） ───────────────────────────────────────────

async function fetchMenus(
  display: "top" | "menu" | "takeout",
): Promise<PublicMenuItem[]> {
  if (!BASE_URL) {
    console.warn("[menus] MENU_API_BASE_URL が未設定です");
    return [];
  }

  const url = `${BASE_URL}/api/public/menus?shopId=${SHOP_ID}&display=${display}`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      console.error(`[menus] fetch failed: display=${display} status=${res.status}`);
      return [];
    }

    const data = await res.json();
    return (data.items ?? []).map(mapApiItem);
  } catch (e) {
    console.error(`[menus] fetch error: display=${display}`, e);
    return [];
  }
}

// ── 公開 API ───────────────────────────────────────────────────

/** トップページ用（showOnTop: true） */
export const getMenusForTop      = () => fetchMenus("top");

/** メニューページ用（showOnMenuPage: true） */
export const getMenusForMenuPage = () => fetchMenus("menu");

/** テイクアウトページ用（showOnTakeout: true） */
export const getMenusForTakeout  = () => fetchMenus("takeout");

// ── ユーティリティ ─────────────────────────────────────────────

/**
 * items を category_sub でグループ化して返す。
 * API から sortOrder 順で返ってきた items の挿入順が
 * そのままカテゴリの表示順になる（Map は挿入順を保持する）。
 */
export function groupByCategorySub(
  items: PublicMenuItem[],
): { heading: string; items: PublicMenuItem[] }[] {
  const map = new Map<string, PublicMenuItem[]>();

  for (const item of items) {
    const group = map.get(item.category_sub) ?? [];
    group.push(item);
    map.set(item.category_sub, group);
  }

  return Array.from(map.entries()).map(([heading, items]) => ({
    heading,
    items,
  }));
}
