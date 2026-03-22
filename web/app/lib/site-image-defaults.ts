/** ブラウザ・サーバー両方から安全にインポートできる定数のみ */
export const DEFAULT_SITE_IMAGES = {
  hero: {
    sp: "/images/hero/hero-sp.jpg",
    pc: "/images/hero/hero-pc.jpg",
  },
  about: {
    shop: "/images/about/shop.jpg",
  },
  food: {
    main: "/images/food/main.jpg",
  },
  space: {
    counter: "/images/space/counter.jpg",
  },
} as const;
