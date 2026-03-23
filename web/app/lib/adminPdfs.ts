// web/app/lib/adminPdfs.ts
// PDF管理用データ層（Server Component から呼ぶ）

const BASE_URL = process.env.MENU_API_BASE_URL ?? "";
const SHOP_ID = "kitagen";

export interface PdfItem {
  _id: string;
  shopId: string;
  type: "menu" | "calendar" | "takeout";
  label: string;
  url: string;
  cloudinaryPublicId: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export async function listPdfs(type?: "menu" | "calendar" | "takeout"): Promise<PdfItem[]> {
  if (!BASE_URL) return [];
  try {
    const params = new URLSearchParams({ shopId: SHOP_ID });
    if (type) params.set("type", type);
    const res = await fetch(`${BASE_URL}/api/admin/pdfs?${params}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.pdfs ?? []).map(mapPdf);
  } catch {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPdf(raw: Record<string, any>): PdfItem {
  return {
    _id: String(raw._id ?? ""),
    shopId: String(raw.shopId ?? ""),
    type: raw.type === "calendar" ? "calendar" : raw.type === "takeout" ? "takeout" : "menu",
    label: String(raw.label ?? ""),
    url: String(raw.url ?? ""),
    cloudinaryPublicId: String(raw.cloudinaryPublicId ?? ""),
    active: raw.active !== false,
    sortOrder: Number(raw.sortOrder ?? 0),
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}
