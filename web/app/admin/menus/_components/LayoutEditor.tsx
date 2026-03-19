"use client";

import { useState, useTransition, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  RotateCcw,
  Save,
  Loader2,
  Check,
  Plus,
  X,
  Search,
  Utensils,
  ShoppingBag,
  Menu,
} from "lucide-react";
import { saveLayout } from "../actions";
import type { AdminMenuItem } from "../../../lib/adminMenus";

// ── 定数 ─────────────────────────────────────────────────────

type Tab = "top" | "menu" | "takeout";

const TABS: { key: Tab; label: string; description: string; field: keyof AdminMenuItem }[] = [
  { key: "top",     label: "TOPページ",     description: "おすすめメニュー（上位3件が/トップに表示）",     field: "showOnTop" },
  { key: "menu",    label: "メニューページ", description: "/menu のフード・ドリンク一覧",                   field: "showOnMenuPage" },
  { key: "takeout", label: "テイクアウト",   description: "/takeout に表示されるメニュー",                 field: "showOnTakeout" },
];

const DRINK_ORDER = [
  "生ビール", "瓶ビール", "ハイボール", "サワー", "果実酒",
  "梅酒", "日本酒", "焼酎", "ワイン", "ノンアル", "ソフトドリンク",
];

const CATEGORY_OPTIONS = [
  { value: "",      label: "すべて" },
  { value: "food",  label: "フード" },
  { value: "drink", label: "ドリンク" },
];

// ── メニューページセクション計算 ─────────────────────────────

type MenuSection = { category: "food" | "drink"; subCategory: string; ids: string[] };

function computeMenuSections(
  placedIds: string[],
  itemMap: Map<string, AdminMenuItem>,
): { food: MenuSection[]; drink: MenuSection[] } {
  const foodMap  = new Map<string, string[]>();
  const drinkMap = new Map<string, string[]>();

  for (const id of placedIds) {
    const item = itemMap.get(id);
    if (!item) continue;
    const target = item.category === "food" ? foodMap : drinkMap;
    const list = target.get(item.subCategory) ?? [];
    list.push(id);
    target.set(item.subCategory, list);
  }

  const food = Array.from(foodMap.entries()).map(([subCategory, ids]) => ({
    category: "food" as const, subCategory, ids,
  }));

  const drink = Array.from(drinkMap.entries())
    .sort(([a], [b]) => {
      const ai = DRINK_ORDER.indexOf(a);
      const bi = DRINK_ORDER.indexOf(b);
      return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
    })
    .map(([subCategory, ids]) => ({ category: "drink" as const, subCategory, ids }));

  return { food, drink };
}

function fmtPrice(item: AdminMenuItem): string | null {
  return item.basePrice != null
    ? `¥${Number(item.basePrice).toLocaleString("ja-JP")}〜`
    : null;
}

// ── スマホプレビュー内: TOPカード（ソータブル） ──────────────

function TopSortableCard({
  item, index, onRemove,
}: {
  item: AdminMenuItem; index: number; onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const price = fmtPrice(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border overflow-hidden transition-all ${
        isDragging ? "opacity-40 shadow-lg" : "bg-card-bg border-border hover:border-accent/50"
      }`}
    >
      {/* 画像 */}
      <div className="h-24 bg-border/30 relative overflow-hidden">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Utensils size={18} strokeWidth={1.2} className="text-muted/30" />
          </div>
        )}
        {/* 順位 */}
        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-foreground/60 flex items-center justify-center">
          <span className="text-[9px] font-bold text-background/90">{index + 1}</span>
        </div>
      </div>
      {/* テキスト */}
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1.5 mb-0.5">
          <h3 className="font-bold text-foreground text-[11px] leading-snug line-clamp-2">{item.name}</h3>
          {price && <span className="text-[11px] text-accent font-medium shrink-0 tabular-nums">{price}</span>}
        </div>
        {item.description && (
          <p className="text-[10px] text-muted line-clamp-1">{item.description}</p>
        )}
      </div>
      {/* 操作（ホバー） */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center bg-foreground/70 hover:bg-red-500 text-white rounded-full transition-colors"
          aria-label="外す"
        ><X size={13} /></button>
        <button {...attributes} {...listeners}
          className="w-7 h-7 flex items-center justify-center bg-foreground/70 hover:bg-foreground/90 text-white rounded-full cursor-grab active:cursor-grabbing touch-none transition-colors"
          aria-label="ドラッグ"
        ><GripVertical size={13} /></button>
      </div>
    </div>
  );
}

// ── スマホプレビュー内: メニュー行（ソータブル） ─────────────

function MenuSortableRow({
  item, onRemove,
}: {
  item: AdminMenuItem; onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const price = fmtPrice(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 px-1 py-2.5 border-b border-border/70 last:border-0 transition-all rounded-lg ${
        isDragging
          ? "opacity-50 bg-accent/10 shadow-md border-transparent"
          : "hover:bg-black/[0.03]"
      }`}
    >
      {/* ドラッグハンドル（常時表示・左端） */}
      <button
        {...attributes}
        {...listeners}
        className="text-muted/25 group-hover:text-muted/60 hover:!text-muted cursor-grab active:cursor-grabbing touch-none transition-colors shrink-0 p-0.5"
        aria-label="ドラッグで並び替え"
      >
        <GripVertical size={17} />
      </button>
      {/* テキスト */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-[13px] leading-snug">
          {item.name}
        </p>
        {item.description && (
          <p className="text-[11px] text-muted mt-0.5 line-clamp-1">{item.description}</p>
        )}
      </div>
      {/* 価格 */}
      {price && <span className="text-[13px] text-accent font-medium tabular-nums shrink-0">{price}</span>}
      {/* × ボタン（常時表示・右端） */}
      <button
        onClick={onRemove}
        className="text-muted/25 group-hover:text-muted/50 hover:!text-red-500 transition-colors shrink-0 p-0.5"
        aria-label="外す"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ── スマホプレビュー内: テイクアウトカード（ソータブル） ──────

function TakeoutSortableCard({
  item, onRemove,
}: {
  item: AdminMenuItem; onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const price = fmtPrice(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border px-3 py-2.5 transition-all ${
        isDragging
          ? "opacity-50 shadow-lg border-accent/50 bg-background"
          : "bg-background border-border hover:border-accent/40 hover:shadow-sm"
      }`}
    >
      {/* 上段: ハンドル + ドット + 名前 + 価格 + × */}
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="text-muted/25 group-hover:text-muted/60 hover:!text-muted cursor-grab active:cursor-grabbing touch-none transition-colors shrink-0"
          aria-label="ドラッグで並び替え"
        >
          <GripVertical size={17} />
        </button>
        <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
        <h3 className="flex-1 font-bold text-[13px] text-foreground">{item.name}</h3>
        {price && <span className="text-[13px] font-medium text-accent shrink-0 tabular-nums">{price}</span>}
        <button
          onClick={onRemove}
          className="text-muted/25 group-hover:text-muted/50 hover:!text-red-500 transition-colors shrink-0"
          aria-label="外す"
        >
          <X size={13} />
        </button>
      </div>
      {/* 説明文（ある場合のみ） */}
      {item.description && (
        <p className="text-[12px] text-muted mt-1 leading-relaxed line-clamp-2 pl-6">{item.description}</p>
      )}
    </div>
  );
}

// ── DragOverlay コンテンツ ─────────────────────────────────────

function TopOverlay({ item, index }: { item: AdminMenuItem; index: number }) {
  const price = fmtPrice(item);
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden bg-card-bg shadow-2xl rotate-1 scale-105">
      <div className="h-24 bg-border/30 relative overflow-hidden">
        {item.imageUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          : <div className="absolute inset-0 flex items-center justify-center"><Utensils size={18} className="text-muted/30" /></div>
        }
        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-foreground/60 flex items-center justify-center">
          <span className="text-[9px] font-bold text-background/90">{index + 1}</span>
        </div>
      </div>
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1.5">
          <p className="font-bold text-foreground text-[11px]">{item.name}</p>
          {price && <span className="text-[11px] text-accent shrink-0">{price}</span>}
        </div>
      </div>
    </div>
  );
}

function MenuOverlay({ item }: { item: AdminMenuItem }) {
  const price = fmtPrice(item);
  return (
    <div className="flex items-center justify-between gap-3 py-3.5 px-4 bg-background rounded-xl border border-border/80 shadow-2xl rotate-[0.5deg] scale-[1.02]">
      <p className="font-medium text-foreground text-[13px]">{item.name}</p>
      {price && <span className="text-[13px] text-accent font-medium shrink-0">{price}</span>}
    </div>
  );
}

function TakeoutOverlay({ item }: { item: AdminMenuItem }) {
  const price = fmtPrice(item);
  return (
    <div className="rounded-xl border border-border/80 p-4 flex items-start gap-3 bg-background shadow-2xl rotate-[0.5deg] scale-[1.02]">
      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-bold text-[13px] text-foreground">{item.name}</h3>
          {price && <span className="text-[13px] font-medium text-accent shrink-0">{price}</span>}
        </div>
        {item.description && <p className="text-[12px] text-muted mt-0.5 line-clamp-1">{item.description}</p>}
      </div>
    </div>
  );
}

// ── 左パネル: 追加可能アイテム行 ─────────────────────────────

function AvailableRow({ item, onAdd }: { item: AdminMenuItem; onAdd: () => void }) {
  const price = fmtPrice(item);
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-xl hover:bg-slate-50 group transition-all border border-transparent hover:border-slate-200/80">
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt={item.name}
          className="flex-shrink-0 w-9 h-9 rounded-lg object-cover bg-slate-100"
        />
      ) : (
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
          <Utensils size={11} className="text-slate-300" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-slate-900 transition-colors">{item.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          {item.subCategory && (
            <span className="text-[10px] text-slate-400">{item.subCategory}</span>
          )}
          {price && <span className="text-[10px] text-slate-400">· {price}</span>}
        </div>
      </div>
      <button
        onClick={onAdd}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-500 rounded-lg transition-colors"
        aria-label="追加"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

// ── スマホフレーム内: 空の状態 ────────────────────────────────

function PhoneEmptyState() {
  return (
    <div className="py-16 text-center">
      <p className="text-muted/50 text-sm">まだ表示するメニューがありません</p>
      <p className="text-xs text-muted/35 mt-1.5">左の一覧から + ボタンで追加してください</p>
    </div>
  );
}

// ── スマホフレーム: ページ別コンテンツ ───────────────────────

function PhoneContentTop({
  placedIds,
  itemMap,
  onRemove,
}: {
  placedIds: string[];
  itemMap: Map<string, AdminMenuItem>;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="px-4 py-8 bg-background min-h-full">
      {/* Section header */}
      <div className="mb-6 text-center">
        <p className="text-[9px] tracking-[0.45em] text-accent/80 mb-1.5">POPULAR</p>
        <h2 className="text-base font-bold text-foreground">人気メニュー</h2>
        <div className="flex items-center justify-center gap-3 mt-2">
          <div className="w-6 h-px bg-accent/50" />
          <div className="w-1 h-1 rounded-full bg-accent/60" />
          <div className="w-6 h-px bg-accent/50" />
        </div>
      </div>
      {placedIds.length === 0 ? (
        <PhoneEmptyState />
      ) : (
        <SortableContext items={placedIds} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-2 gap-3">
            {placedIds.map((id, i) => {
              const item = itemMap.get(id);
              if (!item) return null;
              return (
                <TopSortableCard key={id} item={item} index={i} onRemove={() => onRemove(id)} />
              );
            })}
          </div>
        </SortableContext>
      )}
      {placedIds.length > 0 && (
        <p className="text-[10px] text-muted/50 text-center mt-4">
          ※ TOPページでは上位3件が「おすすめ」に表示
        </p>
      )}
    </div>
  );
}

function PhoneContentMenu({
  sections,
  itemMap,
  onRemove,
}: {
  sections: { food: MenuSection[]; drink: MenuSection[] };
  itemMap: Map<string, AdminMenuItem>;
  onRemove: (id: string) => void;
}) {
  const hasContent = sections.food.length > 0 || sections.drink.length > 0;
  if (!hasContent) {
    return <div className="bg-background min-h-full py-4"><PhoneEmptyState /></div>;
  }
  return (
    <div className="bg-background min-h-full">
      {/* Sticky sub-nav (simplified) */}
      <div className="sticky top-0 z-10 bg-background border-b border-border/50">
        <div className="flex px-2">
          {["フード", "ドリンク"].map((label) => (
            <span key={label} className="flex-1 text-center py-3 text-[11px] text-muted border-b-2 border-transparent">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* フードセクション */}
      {sections.food.length > 0 && (
        <section className="py-8 px-4 bg-card-bg">
          <div className="mb-5">
            <p className="text-[9px] tracking-[0.45em] text-accent/80 mb-1">FOOD</p>
            <h2 className="text-sm font-bold text-foreground">フード</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-5 h-px bg-accent/50" />
              <div className="w-1 h-1 rounded-full bg-accent/60" />
              <div className="w-5 h-px bg-accent/50" />
            </div>
          </div>
          <div className="space-y-4">
            {sections.food.map((section) => (
              <div key={section.subCategory}>
                <h3 className="text-[9px] tracking-widest text-muted mb-0.5 uppercase">
                  {section.subCategory}
                </h3>
                <div className="bg-background rounded-xl border border-border px-4">
                  <SortableContext items={section.ids} strategy={verticalListSortingStrategy}>
                    {section.ids.map((id) => {
                      const item = itemMap.get(id);
                      if (!item) return null;
                      return (
                        <MenuSortableRow key={id} item={item} onRemove={() => onRemove(id)} />
                      );
                    })}
                  </SortableContext>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ドリンクセクション */}
      {sections.drink.length > 0 && (
        <section className="py-8 px-4 bg-card-bg border-t border-border/30">
          <div className="mb-5">
            <p className="text-[9px] tracking-[0.45em] text-accent/80 mb-1">DRINK</p>
            <h2 className="text-sm font-bold text-foreground">ドリンク</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-5 h-px bg-accent/50" />
              <div className="w-1 h-1 rounded-full bg-accent/60" />
              <div className="w-5 h-px bg-accent/50" />
            </div>
          </div>
          <div className="space-y-4">
            {sections.drink.map((section) => (
              <div key={section.subCategory}>
                <h3 className="text-[9px] tracking-widest text-muted mb-0.5 uppercase">
                  {section.subCategory}
                </h3>
                <div className="bg-background rounded-xl border border-border px-4">
                  <SortableContext items={section.ids} strategy={verticalListSortingStrategy}>
                    {section.ids.map((id) => {
                      const item = itemMap.get(id);
                      if (!item) return null;
                      return (
                        <MenuSortableRow key={id} item={item} onRemove={() => onRemove(id)} />
                      );
                    })}
                  </SortableContext>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted/50 mt-4">
            ※ ドリンクのセクション順は固定（生ビール→…）です
          </p>
        </section>
      )}
    </div>
  );
}

function PhoneContentTakeout({
  placedIds,
  itemMap,
  onRemove,
}: {
  placedIds: string[];
  itemMap: Map<string, AdminMenuItem>;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="bg-card-bg min-h-full py-8 px-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-background border border-border/60 flex items-center justify-center shrink-0">
          <ShoppingBag size={15} strokeWidth={1.5} className="text-accent" />
        </div>
        <h2 className="font-bold text-sm text-foreground">テイクアウトメニュー</h2>
      </div>
      {placedIds.length === 0 ? (
        <PhoneEmptyState />
      ) : (
        <SortableContext items={placedIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5">
            {placedIds.map((id) => {
              const item = itemMap.get(id);
              if (!item) return null;
              return (
                <TakeoutSortableCard key={id} item={item} onRemove={() => onRemove(id)} />
              );
            })}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

// ── メインコンポーネント ──────────────────────────────────────

interface Props { items: AdminMenuItem[] }

export default function LayoutEditor({ items }: Props) {
  const [activeTab, setActiveTab]       = useState<Tab>("top");
  const [isPending, startTransition]    = useTransition();
  const [saved, setSaved]               = useState(false);
  const [activeId, setActiveId]         = useState<string | null>(null);
  const [leftSearch, setLeftSearch]     = useState("");
  const [leftCategory, setLeftCategory] = useState("");

  const [placed, setPlaced] = useState<Record<Tab, string[]>>(() => {
    const sort = (field: keyof AdminMenuItem) =>
      items
        .filter((item) => item[field] === true)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => item.id);
    return {
      top:     sort("showOnTop"),
      menu:    sort("showOnMenuPage"),
      takeout: sort("showOnTakeout"),
    };
  });

  const [committed, setCommitted] = useState(placed);

  const itemMap = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const currentPlacedIds = placed[activeTab];
  const isDirty = JSON.stringify(placed[activeTab]) !== JSON.stringify(committed[activeTab]);

  const menuSections = useMemo(
    () => computeMenuSections(placed.menu, itemMap),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [placed.menu, itemMap],
  );

  // 左パネル: 未配置アイテム
  const placedSet = new Set(currentPlacedIds);
  const availableItems = items.filter((item) => {
    if (placedSet.has(item.id)) return false;
    if (!item.isActive) return false;
    if (leftCategory && item.category !== leftCategory) return false;
    if (leftSearch) {
      const q = leftSearch.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.subCategory.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  const availableFoodItems  = availableItems.filter((item) => item.category === "food");
  const availableDrinkItems = availableItems.filter((item) => item.category === "drink");

  // ── DnD ─────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeStr = String(active.id);
    const overStr   = String(over.id);
    const ids       = placed[activeTab];
    const oldIndex  = ids.indexOf(activeStr);
    const newIndex  = ids.indexOf(overStr);
    if (oldIndex === -1 || newIndex === -1) return;

    // メニュータブ: 同セクション内のみ
    if (activeTab === "menu") {
      const a = itemMap.get(activeStr);
      const o = itemMap.get(overStr);
      if (!a || !o || a.category !== o.category || a.subCategory !== o.subCategory) return;
    }

    setPlaced((prev) => ({
      ...prev,
      [activeTab]: arrayMove(prev[activeTab], oldIndex, newIndex),
    }));
    setSaved(false);
  }

  function handleAdd(id: string) {
    setPlaced((prev) => ({ ...prev, [activeTab]: [...prev[activeTab], id] }));
    setSaved(false);
  }

  function handleRemove(id: string) {
    setPlaced((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((x) => x !== id),
    }));
    setSaved(false);
  }

  function handleSave() {
    const placedCurrentSet = new Set(placed[activeTab]);
    const removedIds = committed[activeTab].filter((id) => !placedCurrentSet.has(id));
    startTransition(async () => {
      await saveLayout(activeTab, placed[activeTab], removedIds);
      setCommitted((prev) => ({ ...prev, [activeTab]: [...placed[activeTab]] }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  function handleReset() {
    setPlaced((prev) => ({ ...prev, [activeTab]: [...committed[activeTab]] }));
    setSaved(false);
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setSaved(false);
    setLeftSearch("");
    setLeftCategory("");
  }

  const activeItem  = activeId ? itemMap.get(activeId) : null;
  const activeIndex = activeId ? currentPlacedIds.indexOf(activeId) : -1;
  const currentTabInfo = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 7.5rem)" }}>

      {/* ── ヘッダーバー ──────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">メニュー管理</h1>
          <p className="text-xs text-slate-400 mt-0.5">{currentTabInfo.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={!isDirty || isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw size={12} />
            元に戻す
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg transition-all shadow-sm ${
              saved
                ? "bg-emerald-500 text-white shadow-emerald-200"
                : isPending
                ? "bg-indigo-400 text-white cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200/60"
            }`}
          >
            {isPending ? <Loader2 size={12} className="animate-spin" />
              : saved ? <Check size={12} />
              : <Save size={12} />}
            {isPending ? "保存中…" : saved ? "保存しました" : "この並びで保存"}
          </button>
        </div>
      </div>

      {/* ── 2カラム ──────────────────────────────────────── */}
      <div className="flex gap-5 flex-1 min-h-0">

        {/* ── 左パネル: ページ選択 + 追加可能メニュー ──── */}
        <div className="w-72 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* ページ選択タブ */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">表示ページ</p>
            <div className="flex flex-col gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                    activeTab === tab.key
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}>{placed[tab.key].length}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 検索 + フィルター */}
          <div className="px-3 pt-3 pb-2 flex-shrink-0">
            <div className="relative mb-2">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={leftSearch}
                onChange={(e) => setLeftSearch(e.target.value)}
                placeholder="名前で検索…"
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 placeholder:text-slate-400 transition-colors"
              />
            </div>
            <div className="flex gap-1">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLeftCategory(opt.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    leftCategory === opt.value
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* アイテムリスト（カテゴリ別セクション） */}
          <div className="flex-1 overflow-y-auto px-2 py-1">
            {availableItems.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                {leftSearch || leftCategory ? "条件に一致するメニューがありません" : "全メニューが配置済みです"}
              </p>
            ) : (
              <>
                {availableFoodItems.length > 0 && (
                  <div className="mb-1">
                    <p className="px-2 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      フード · {availableFoodItems.length}件
                    </p>
                    {availableFoodItems.map((item) => (
                      <AvailableRow key={item.id} item={item} onAdd={() => handleAdd(item.id)} />
                    ))}
                  </div>
                )}
                {availableDrinkItems.length > 0 && (
                  <div>
                    <p className="px-2 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      ドリンク · {availableDrinkItems.length}件
                    </p>
                    {availableDrinkItems.map((item) => (
                      <AvailableRow key={item.id} item={item} onAdd={() => handleAdd(item.id)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-slate-100 flex-shrink-0">
            <p className="text-[10px] text-slate-400">
              {availableItems.length}件の未配置メニュー · + で追加
            </p>
          </div>
        </div>

        {/* ── 右パネル: スマホプレビュー（カード） ──────── */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-0">

          {/* カードヘッダー */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-semibold text-slate-700">スマホプレビュー</span>
            </div>
            <span className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              {currentTabInfo.label}
            </span>
          </div>

          {/* プレビュー本体 */}
          <div className="flex-1 flex items-start justify-center py-6 px-4 bg-slate-50/60 overflow-y-auto">
            {/* スマホフレーム */}
            <div className="w-[375px] flex-shrink-0">
              <div className="rounded-[2.25rem] overflow-hidden shadow-2xl border-[6px] border-slate-800">

                {/* ステータスバー */}
                <div className="bg-slate-900 h-9 flex items-center justify-between px-6">
                  <span className="text-white/60 text-[11px] font-semibold">9:41</span>
                  <div className="w-[88px] h-7 bg-slate-950 rounded-full" />
                  <div className="flex items-center gap-1">
                    <div className="flex gap-[2px] items-end h-3">
                      {[3, 5, 7, 9].map((h, i) => (
                        <div key={i} className="w-1 bg-white/60 rounded-[1px]" style={{ height: `${h}px` }} />
                      ))}
                    </div>
                    <div className="w-4 h-2.5 border border-white/50 rounded-[2px] ml-1 flex items-center px-[2px]">
                      <div className="w-2.5 h-1.5 bg-white/50 rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* サイトヘッダー */}
                <div className="h-12 bg-background border-b border-border/40 flex items-center justify-between px-5">
                  <span className="font-bold text-foreground text-sm tracking-wide">きたげん</span>
                  <Menu size={18} strokeWidth={1.5} className="text-foreground/60" />
                </div>

                {/* ページコンテンツ（固定高さ・内部スクロール） */}
                <div className="overflow-y-auto h-[680px]">
                  <DndContext
                    id="layout-editor-dnd"
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    {activeTab === "top" && (
                      <PhoneContentTop
                        placedIds={currentPlacedIds}
                        itemMap={itemMap}
                        onRemove={handleRemove}
                      />
                    )}
                    {activeTab === "menu" && (
                      <PhoneContentMenu
                        sections={menuSections}
                        itemMap={itemMap}
                        onRemove={handleRemove}
                      />
                    )}
                    {activeTab === "takeout" && (
                      <PhoneContentTakeout
                        placedIds={currentPlacedIds}
                        itemMap={itemMap}
                        onRemove={handleRemove}
                      />
                    )}

                    <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
                      {activeItem && activeTab === "top"     && <TopOverlay     item={activeItem} index={activeIndex} />}
                      {activeItem && activeTab === "menu"    && <MenuOverlay    item={activeItem} />}
                      {activeItem && activeTab === "takeout" && <TakeoutOverlay item={activeItem} />}
                    </DragOverlay>
                  </DndContext>
                </div>

              </div>
            </div>
          </div>

          {/* カードフッター（ヒント） */}
          <div className="px-6 py-2.5 border-t border-slate-100 flex-shrink-0 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              ホバーで ×（外す）と ≡（並び替え）が表示されます
            </p>
            <p className="text-[11px] text-slate-400">
              sortOrder は全タブ共通
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
