// web/app/lib/adminDocuments.ts
// 資料管理用データ層（Server Component から呼ぶ）

const BASE_URL = process.env.MENU_API_BASE_URL ?? "";
const SHOP_ID  = "kitagen";

export interface DocumentItem {
  _id:                string;
  shopId:             string;
  type:               "lunch" | "dinner" | "menu" | "calendar" | "top" | "shop" | "takeout";
  slot:               string | null;
  title:              string;
  fileUrl:            string;
  cloudinaryPublicId: string | null;
  sourceType:         "upload" | "url"; // 登録方法（upload = Cloudinary経由 / url = URLのみ）
  resourceType:       "image" | "raw";
  format:             string; // "pdf" | "jpg" | "png" | "webp" | "url"
  sortOrder:          number;
  isActive:           boolean;
  createdAt:          string;
  updatedAt:          string;
}

export async function listDocuments(
  type?: "lunch" | "dinner" | "menu" | "calendar" | "top" | "shop" | "takeout"
): Promise<DocumentItem[]> {
  if (!BASE_URL) return [];
  try {
    const params = new URLSearchParams({ shopId: SHOP_ID });
    if (type) params.set("type", type);
    const res = await fetch(`${BASE_URL}/api/admin/documents?${params}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    const VALID_TYPES = ["lunch", "dinner", "menu", "calendar", "top", "shop", "takeout"] as const;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.documents ?? []).map((raw: Record<string, any>): DocumentItem => ({
      _id:                String(raw._id ?? ""),
      shopId:             String(raw.shopId ?? ""),
      type:               VALID_TYPES.includes(raw.type) ? raw.type : "menu",
      slot:               raw.slot ? String(raw.slot) : null,
      title:              String(raw.title ?? ""),
      fileUrl:            String(raw.fileUrl ?? ""),
      cloudinaryPublicId: raw.cloudinaryPublicId ? String(raw.cloudinaryPublicId) : null,
      sourceType:         raw.sourceType === "url" ? "url" : "upload",
      resourceType:       raw.resourceType === "raw" ? "raw" : "image",
      format:             String(raw.format ?? ""),
      sortOrder:          Number(raw.sortOrder ?? 0),
      isActive:           raw.isActive !== false,
      createdAt:          String(raw.createdAt ?? ""),
      updatedAt:          String(raw.updatedAt ?? ""),
    }));
  } catch {
    return [];
  }
}
