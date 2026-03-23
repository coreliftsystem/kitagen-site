"use server";

import { revalidatePath } from "next/cache";

const BASE_URL = process.env.MENU_API_BASE_URL ?? "";
const SHOP_ID  = "kitagen";

/**
 * サイト画像のアップロード
 * slot: "hero.sp" | "hero.pc" | "about.shop" | "food.main" | "space.counter"
 * type: "top" (hero系) | "shop" (セクション画像)
 */
export async function uploadSiteImageAction(
  slot: string,
  type: "top" | "shop",
  formData: FormData
): Promise<{ ok: boolean; fileUrl?: string; docId?: string; error?: string }> {
  try {
    formData.set("shopId", SHOP_ID);
    formData.set("type", type);
    formData.set("slot", slot);
    formData.set("title", slot);

    const res = await fetch(`${BASE_URL}/api/admin/documents/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "アップロードに失敗しました" };

    revalidatePath("/");
    revalidatePath("/portal/top");
    revalidatePath("/takeout");
    return {
      ok:     true,
      fileUrl: data.document?.fileUrl,
      docId:   data.document?._id ? String(data.document._id) : undefined,
    };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}

/**
 * サイト画像をURLで登録（Cloudinaryなし）
 */
export async function registerSiteImageUrlAction(
  slot: string,
  type: "top" | "shop",
  fileUrl: string
): Promise<{ ok: boolean; fileUrl?: string; docId?: string; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/documents/register-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId: SHOP_ID, type, slot, fileUrl, title: slot }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "登録に失敗しました" };

    revalidatePath("/");
    revalidatePath("/portal/top");
    revalidatePath("/takeout");
    return {
      ok:     true,
      fileUrl: data.document?.fileUrl,
      docId:   data.document?._id ? String(data.document._id) : undefined,
    };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}

/**
 * サイト画像の削除（Cloudinary + DB）
 */
export async function deleteSiteImageAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/documents/${id}?shopId=${SHOP_ID}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "削除に失敗しました" };

    revalidatePath("/");
    revalidatePath("/portal/top");
    return { ok: true };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}
