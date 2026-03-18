"use server";

import { revalidatePath } from "next/cache";

const BASE_URL = process.env.MENU_API_BASE_URL ?? "http://localhost:3000";
const SHOP_ID  = "kitagen";

// ── レイアウト一括保存 ─────────────────────────────────────

type Tab = "top" | "menu" | "takeout";

const TAB_FIELD: Record<Tab, "showOnTop" | "showOnMenuPage" | "showOnTakeout"> = {
  top:     "showOnTop",
  menu:    "showOnMenuPage",
  takeout: "showOnTakeout",
};

export async function saveLayout(
  tab: Tab,
  placedIds: string[],
  removedIds: string[],
) {
  const field = TAB_FIELD[tab];
  const updates = [
    ...placedIds.map((id, i) => ({ id, [field]: true, sortOrder: (i + 1) * 10 })),
    ...removedIds.map((id) => ({ id, [field]: false })),
  ];

  const res = await fetch(`${BASE_URL}/api/admin/menus/bulk-display`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ shopId: SHOP_ID, updates }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "レイアウトの保存に失敗しました");
  }

  revalidatePath("/admin/menus");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/takeout");
}

// ── 表示設定の更新（個別） ─────────────────────────────────

export async function updateMenuDisplay(
  id: string,
  data: {
    showOnTop:      boolean;
    showOnMenuPage: boolean;
    showOnTakeout:  boolean;
    sortOrder:      number;
  },
) {
  const res = await fetch(`${BASE_URL}/api/admin/menus/${id}/display`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      shopId: SHOP_ID,
      showOnTop:      data.showOnTop,
      showOnMenuPage: data.showOnMenuPage,
      showOnTakeout:  data.showOnTakeout,
      sortOrder:      data.sortOrder,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "更新に失敗しました");
  }

  revalidatePath("/admin/menus");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/takeout");
}
