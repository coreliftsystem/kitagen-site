// web/app/lib/menus.ts

const BASE_URL = process.env.MENU_API_BASE_URL ?? "";
const SHOP_ID = "kitagen";

export interface PublicMenuItem {
  id: string;
  name: string;
  description: string | undefined;
  price: string | undefined;
  image: string | null;
  category_main: string;
  category_sub: string;
  sortOrder: number;
  isNew: boolean;
}

function mapApiItem(raw: Record<string, unknown>): PublicMenuItem {
  const record = raw as {
    id?: string;
    _id?: string;
    name?: string;
    description?: string;
    basePrice?: number | string;
    imageUrl?: string;
    category?: string;
    category_main?: string;
    subCategory?: string;
    category_sub?: string;
    sortOrder?: number | string;
    isNew?: boolean;
  };

  const basePrice = record.basePrice;
  const imageUrl = record.imageUrl;

  return {
    id: String(record.id ?? record._id ?? ""),
    name: String(record.name ?? ""),
    description: record.description ? String(record.description) : undefined,
    price:
      basePrice != null && basePrice !== ""
        ? `¥${Number(basePrice).toLocaleString("ja-JP")}〜`
        : undefined,
    image: imageUrl && String(imageUrl).trim() !== "" ? String(imageUrl) : null,
    category_main: String(record.category ?? record.category_main ?? ""),
    category_sub: String(record.subCategory ?? record.category_sub ?? ""),
    sortOrder: Number(record.sortOrder ?? 0),
    isNew: record.isNew === true,
  };
}

async function fetchMenus(
  display: "top" | "menu" | "takeout" | "lunch" | "dinner",
): Promise<PublicMenuItem[]> {
  if (!BASE_URL) {
    console.warn("[menus] MENU_API_BASE_URL が未設定です");
    return [];
  }

  const url = `${BASE_URL}/api/public/menus?shopId=${SHOP_ID}&display=${display}`;

  try {
    const fetchOptions =
      process.env.NODE_ENV === "development"
        ? { cache: "no-store" as const }
        : { next: { revalidate: 300 } };
    const res = await fetch(url, fetchOptions);

    if (!res.ok) {
      console.error(
        `[menus] fetch failed: display=${display} status=${res.status}`,
      );
      return [];
    }

    const data = await res.json();

    const items = Array.isArray(data)
      ? data
      : Array.isArray((data as { items?: unknown[] }).items)
        ? (data as { items: unknown[] }).items
        : [];

    return items.map((item) => mapApiItem(item as Record<string, unknown>));
  } catch (e) {
    console.error(`[menus] fetch error: display=${display}`, e);
    return [];
  }
}

export const getMenusForTop = () => fetchMenus("top");
export const getMenusForMenuPage = () => fetchMenus("menu");
export const getMenusForTakeout = () => fetchMenus("takeout");
export const getMenusForLunch = () => fetchMenus("lunch");
export const getMenusForDinner = () => fetchMenus("dinner");

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
