export type ChildLink = {
  label: string;
  href: string;
};

export type SubItem = {
  label: string;
  href: string;
  description?: string;
  previewImage?: string;
  children?: ChildLink[];
};

export type NavItem = {
  label: string;
  href: string;
  mega?: boolean;
  subItems?: SubItem[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "/about",
    subItems: [
      { label: "Who Are We", href: "/about#who-are-we" },
      { label: "Factory", href: "/about#factory" },
      { label: "Certificate", href: "/about#certificate" },
      { label: "Download", href: "/download" },
    ],
  },
  {
    label: "Collection",
    href: "/products",
    mega: true,
    subItems: [
      {
        label: "Quartz Stone",
        href: "/products?category=quartz",
        description:
          "Quartz Stone (90% quartz sand) & Zero Silica Stone (no silica), advanced-made. Wear/stain-resistant; Ideal for kitchen countertops, bathroom vanity tops and wall surfaces.",
        previewImage: "/assets/solutions/quartz-zero-silica.jpg",
        children: [
          { label: "Natural", href: "/products#quartz" },
          { label: "Pure", href: "/products#quartz" },
          { label: "Crystal", href: "/products#quartz" },
          { label: "Multi-color", href: "/products#quartz" },
          { label: "Platinum", href: "/products#quartz" },
        ],
      },
      {
        label: "Terrazzo",
        href: "/products?category=terrazzo",
        description:
          "Natural aggregates + eco-adhesive, high-pressure-formed. Large slabs ease install; hard, wear-resistant, non-flammable for indoor and outdoor floors and walls.",
        previewImage: "/assets/solutions/terrazzo.jpg",
        children: [
          { label: "Colourful", href: "/products#terrazzo" },
          { label: "White", href: "/products#terrazzo" },
          { label: "Grey & Black", href: "/products#terrazzo" },
          { label: "Nano Tech", href: "/products#terrazzo" },
        ],
      },
      {
        label: "Flexible Stone",
        href: "/products?category=flexible-stone",
        description:
          "Stone texture + flexibility. Lightweight, easy to install on walls, floors and irregular surfaces. Toxic-free, eco-safe and suitable for modern spaces.",
        previewImage: "/assets/solutions/flexible-stone.jpg",
        children: [
          { label: "Stone Mimic", href: "/products#flexible-stone" },
          { label: "Vein Flow", href: "/products#flexible-stone" },
          { label: "Artisan Craft", href: "/products#flexible-stone" },
        ],
      },
      {
        label: "Marble",
        href: "/products?category=marble",
        description:
          "Wayon Marble features unique natural textures and elegant luxury, ideal for hotel lobbies, luxury mansions and high-end commercial interiors.",
        previewImage: "/assets/solutions/marble.jpg",
        children: [
          { label: "BEIGE", href: "/products#marble" },
          { label: "GRAY & BROWN", href: "/products#marble" },
          { label: "BLACK & WHITE", href: "/products#marble" },
          { label: "Travertine", href: "/products#marble" },
          { label: "Luxury", href: "/products#marble" },
        ],
      },
      {
        label: "Gem Stone",
        href: "/products?category=gem-stone",
        description:
          "Precision-spliced gem slices, glazed for luster. Luxurious shine and translucency for accent walls and high-end furniture tops.",
        previewImage: "/assets/solutions/gem-stone.jpg",
        children: [
          { label: "Agate Series", href: "/products#gem-stone" },
          { label: "Other Semi Precious Stone Series", href: "/products#gem-stone" },
          { label: "Crystal Series", href: "/products#gem-stone" },
        ],
      },
      {
        label: "Cement Stone",
        href: "/products?category=cement-stone",
        description:
          "High-strength cement, high-pressure-made. Rich colors, stable structure and indoor or outdoor wall suitability.",
        previewImage: "/assets/solutions/cement-stone.jpg",
        children: [
          { label: "Pure", href: "/products#cement-stone" },
          { label: "Sandstone", href: "/products#cement-stone" },
          { label: "Line", href: "/products#cement-stone" },
        ],
      },
      {
        label: "Artifical Marble",
        href: "/products?category=artificial-marble",
        description:
          "Natural mineral powder + eco-friendly binders, high-temp and high-pressure formed. Wear-resistant and versatile for vanity tops, walls and facades.",
        previewImage: "/assets/solutions/artificial-marble.webp",
        children: [
          { label: "White Series", href: "/products#artificial-marble" },
          { label: "Grey Series", href: "/products#artificial-marble" },
          { label: "Yellow Series", href: "/products#artificial-marble" },
          { label: "Black Series", href: "/products#artificial-marble" },
        ],
      },
      {
        label: "Porcelain Slab",
        href: "/products?category=porcelain-slab",
        description:
          "Wear-resistant, heat-resistant and eco-safe mineral slabs for walls, malls, hotels and furniture tops.",
        previewImage: "/assets/solutions/porcelain-slab.webp",
        children: [
          { label: "Classic Texture", href: "/products#porcelain-slab" },
          { label: "Sintered Calacatta", href: "/products#porcelain-slab" },
          { label: "Sintered Luxury Stone", href: "/products#porcelain-slab" },
          { label: "12mm", href: "/products#porcelain-slab" },
          { label: "20mm", href: "/products#porcelain-slab" },
        ],
      },
      {
        label: "Silica-Free Stone",
        href: "/products?category=silica-free",
        description:
          "Silica-free engineered stone that preserves quartz durability while eliminating crystalline silica from the formula.",
        previewImage: "/assets/categories/silica-free-stone.jpg",
      },
    ],
  },
  {
    label: "Solution",
    href: "/solution",
    subItems: [
      { label: "Finished Products", href: "/solution" },
      { label: "Application field", href: "/solution" },
      { label: "Project", href: "/solution#case" },
      { label: "360°View", href: "/solution" },
    ],
  },
  { label: "Case", href: "/solution#case" },
  { label: "News", href: "/news" },
  { label: "Contact Us", href: "/contact" },
];

export const LANGUAGES = [
  { code: "EN", label: "English", href: "/" },
  { code: "简", label: "简体中文", href: "https://wayonstone.com" },
  { code: "ES", label: "Español", href: "https://es.wayon.com" },
  { code: "عر", label: "اللغة العربية", href: "https://ar.wayon.com" },
  { code: "RU", label: "Pусский", href: "https://ru.wayon.com" },
];
