"use server";

import { revalidatePath } from "next/cache";

const BASE_URL = process.env.MENU_API_BASE_URL ?? "";
const SHOP_ID  = "kitagen";

export async function registerMenuUrlAction(
  fileUrl: string,
  title: string
): Promise<{ ok: boolean; error?: string }> {
  return registerDocumentUrlAction(fileUrl, title, "menu");
}

export async function registerDocumentUrlAction(
  fileUrl: string,
  title: string,
  type: "menu" | "calendar",
  slot?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/portal/documents/register-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId: SHOP_ID, type, fileUrl, title, slot: slot ?? null }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "登録に失敗しました" };
    revalidatePath("/portal/documents");
    return { ok: true };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}

export async function uploadDocumentAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    formData.set("shopId", SHOP_ID);
    const res = await fetch(`${BASE_URL}/api/portal/documents/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "アップロードに失敗しました" };
    revalidatePath("/portal/documents");
    return { ok: true };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}

export async function updateDocumentAction(
  id: string,
  updates: { title?: string; isActive?: boolean; sortOrder?: number }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/portal/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId: SHOP_ID, ...updates }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "更新に失敗しました" };
    revalidatePath("/portal/documents");
    return { ok: true };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}

export async function bulkSortDocumentsAction(
  ids: string[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/portal/documents/bulk-sort`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId: SHOP_ID, ids }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "並び順の保存に失敗しました" };
    revalidatePath("/portal/documents");
    return { ok: true };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}

export async function deleteDocumentAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/portal/documents/${id}?shopId=${SHOP_ID}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "削除に失敗しました" };
    revalidatePath("/portal/documents");
    return { ok: true };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}
