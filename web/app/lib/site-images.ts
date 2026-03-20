/**
 * サイト画像の一元管理
 *
 * 現在は public/images/ 配下の静的ファイルを参照している。
 * 将来的にAPIから取得する場合はここの値を差し替えるだけでよい。
 *
 * 例（API化時）:
 *   const res = await fetch("/api/site-images");
 *   const data = await res.json();
 *   export const SITE_IMAGES = data;
 */
export const SITE_IMAGES = {
  hero: {
    /** トップページ Hero 背景（SP用：縦長構図） */
    sp: "/images/hero/hero-sp.jpg",
    /** トップページ Hero 背景（PC用：横長構図） */
    pc: "/images/hero/hero-pc.jpg",
  },
  about: {
    /** ABOUTセクション — 店内全景 */
    shop: "/images/about/shop.jpg",
  },
  food: {
    /** FOODセクション — メイン料理写真 */
    main: "/images/food/main.jpg",
  },
  space: {
    /** SPACEセクション — カウンター席 */
    counter: "/images/space/counter.jpg",
  },
} as const;
