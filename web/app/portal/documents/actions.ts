"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backendFetch";
import type { DocumentItem } from "../../lib/adminDocuments";

const BASE_URL = process.env.MENU_API_BASE_URL ?? "";
const SHOP_ID  = "kitagen";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDocument(raw: Record<string, any>): DocumentItem {
  const VALID_TYPES = ["lunch", "dinner", "menu", "calendar", "top", "shop", "takeout"] as const;
  return {
    _id:                String(raw._id ?? ""),
    shopId:             String(raw.shopId ?? ""),
    type:               VALID_TYPES.includes(raw.type) ? raw.type : "menu",
    slot:               raw.slot ? String(raw.slot) : null,
    title:              String(raw.title ?? ""),
    fileUrl:            /^https?:\/\//.test(raw.fileUrl ?? "") ? String(raw.fileUrl) : "",
    cloudinaryPublicId: raw.cloudinaryPublicId ? String(raw.cloudinaryPublicId) : null,
    sourceType:         raw.sourceType === "url" ? "url" : "upload",
    resourceType:       raw.resourceType === "raw" ? "raw" : "image",
    format:             String(raw.format ?? ""),
    sortOrder:          Number(raw.sortOrder ?? 0),
    isActive:           raw.isActive !== false,
    createdAt:          String(raw.createdAt ?? ""),
    updatedAt:          String(raw.updatedAt ?? ""),
  };
}

export async function registerDocumentUrlAction(
  fileUrl: string,
  title: string,
  type: "lunch" | "dinner" | "takeout" | "calendar",
  slot?: string
): Promise<{ ok: boolean; document?: DocumentItem; error?: string }> {
  try {
    const res = await backendFetch(`${BASE_URL}/api/admin/documents/register-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId: SHOP_ID, type, fileUrl, title, slot: slot ?? null }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "登録に失敗しました" };
    revalidatePath("/portal/documents");
    return { ok: true, document: parseDocument(data.document) };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}

export async function uploadDocumentAction(
  formData: FormData
): Promise<{ ok: boolean; document?: DocumentItem; error?: string }> {
  try {
    formData.set("shopId", SHOP_ID);
    const res = await backendFetch(`${BASE_URL}/api/admin/documents/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "アップロードに失敗しました" };
    revalidatePath("/portal/documents");
    return { ok: true, document: parseDocument(data.document) };
  } catch {
    return { ok: false, error: "通信エラーが発生しました" };
  }
}

export async function updateDocumentAction(
  id: string,
  updates: { title?: string; isActive?: boolean; sortOrder?: number }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await backendFetch(`${BASE_URL}/api/admin/documents/${id}`, {
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
    const res = await backendFetch(`${BASE_URL}/api/admin/documents/bulk-sort`, {
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
    const res = await backendFetch(
      `${BASE_URL}/api/admin/documents/${id}?shopId=${SHOP_ID}`,
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
