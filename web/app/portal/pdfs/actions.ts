"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backendFetch";

const BASE_URL = process.env.MENU_API_BASE_URL ?? "";
const SHOP_ID = "kitagen";

export async function uploadPdfAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  try {
    formData.set("shopId", SHOP_ID);
    const res = await backendFetch(`${BASE_URL}/api/admin/pdfs/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "アップロードに失敗しました" };
    revalidatePath("/portal/pdfs");
    return { ok: true };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}

export async function updatePdfAction(
  id: string,
  updates: { label?: string; active?: boolean; sortOrder?: number }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await backendFetch(`${BASE_URL}/api/admin/pdfs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId: SHOP_ID, ...updates }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "更新に失敗しました" };
    revalidatePath("/portal/pdfs");
    return { ok: true };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}

export async function bulkSortPdfsAction(ids: string[]): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await backendFetch(`${BASE_URL}/api/admin/pdfs/bulk-sort`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId: SHOP_ID, ids }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "並び順の保存に失敗しました" };
    revalidatePath("/portal/pdfs");
    return { ok: true };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}

export async function deletePdfAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await backendFetch(`${BASE_URL}/api/admin/pdfs/${id}?shopId=${SHOP_ID}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "削除に失敗しました" };
    revalidatePath("/portal/pdfs");
    return { ok: true };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}
