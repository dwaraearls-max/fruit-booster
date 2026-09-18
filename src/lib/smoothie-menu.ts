/**
 * Fruit Booster smoothie menu — 18 signature regular blends.
 */
export const FRUIT_BOOSTER_CUP_IMAGE = "/products/fruit-booster-cup.jpg";

export type SmoothieMenuItem = {
  name: string;
  slug: string;
  flavour: string;
  description: string;
  imageUrl: string;
  bestSeller?: boolean;
  featured?: boolean;
  isNew?: boolean;
  sortOrder: number;
  /** Optional per-product size prices; defaults to Small 50 / Regular 70. */
  sizes?: Array<{ name: "small" | "regular"; label: string; priceGhs: number; sortOrder: number }>;
};

export const SMOOTHIE_MENU: SmoothieMenuItem[] = [
  {
    name: "Regular Mango Hurrican",
    slug: "regular-mango-hurrican",
    flavour: "mango",
    description: "Bold double mango blended smooth — our hurricane-strength tropical classic.",
    imageUrl: "/products/mango-hurrican.jpg",
    bestSeller: true,
    featured: true,
    sortOrder: 1,
  },
  {
    name: "Mango Hurrican - Tropical",
    slug: "mango-hurrican-tropical",
    flavour: "tropical",
    description: "Mango meets passion fruit and pineapple for an upgraded tropical twist.",
    imageUrl: "/products/mango-hurrican-tropical.jpg",
    featured: true,
    sortOrder: 2,
  },
  {
    name: "Orange Natural",
    slug: "orange-natural",
    flavour: "orange",
    description: "Fresh orange blended bright and smooth — pure citrus sunshine in every sip.",
    imageUrl: "/products/orange-natural.jpg",
    bestSeller: true,
    sortOrder: 3,
  },
  {
    name: "Regular Breezy Banana",
    slug: "regular-breezy-banana",
    flavour: "banana",
    description: "Light, creamy banana refreshment — easy, breezy and naturally sweet.",
    imageUrl: "/products/regular-breezy-banana.jpg",
    sortOrder: 4,
  },
  {
    name: "Regular Strawberry Sunshine",
    slug: "regular-strawbery-sunshine",
    flavour: "strawberry",
    description: "Bright strawberry blended golden — sunshine in a cup.",
    imageUrl: "/products/regular-strawbery-sunshine.jpg",
    bestSeller: true,
    sortOrder: 5,
  },
  {
    name: "Strawberry Sunshine - Berry",
    slug: "strawberry-sunshine-berry",
    flavour: "berry",
    description: "Strawberry sunshine boosted with mixed berries for extra berry bliss.",
    imageUrl: "/products/strawberry-sunshine-berry.jpg",
    isNew: true,
    sortOrder: 6,
  },
  {
    name: "Regular Very Berry",
    slug: "regular-very-berry",
    flavour: "berry",
    description: "A vibrant blend of Ghana's finest berries — very berry, very delicious.",
    imageUrl: "/products/regular-very-berry.jpg",
    featured: true,
    sortOrder: 7,
    sizes: [
      { name: "regular", label: "Regular", priceGhs: 85, sortOrder: 1 },
      { name: "small", label: "Small", priceGhs: 65, sortOrder: 2 },
    ],
  },
  {
    name: "Regular The Original",
    slug: "regular-the-original",
    flavour: "classic",
    description: "The blend that started it all — timeless Fruit Booster flavour.",
    imageUrl: "/products/regular-the-original.jpg",
    bestSeller: true,
    featured: true,
    sortOrder: 8,
  },
  {
    name: "Regular Banana - A- Whey",
    slug: "regular-banana-a-whey",
    flavour: "banana",
    description: "Creamy banana and whey — fuel up after your workout.",
    imageUrl: "/products/regular-banana-a-whey.jpg",
    sortOrder: 9,
  },
  {
    name: "Regular Ripped Berry",
    slug: "regular-ripped-berry",
    flavour: "berry",
    description: "Mixed berries and whey — lean, clean and berry powered.",
    imageUrl: "/products/regular-ripped-berry.jpg",
    sortOrder: 10,
    sizes: [
      { name: "regular", label: "Regular", priceGhs: 85, sortOrder: 1 },
      { name: "small", label: "Small", priceGhs: 65, sortOrder: 2 },
    ],
  },
  {
    name: "Regular Strawberry Storm",
    slug: "regular-strawberry-storm",
    flavour: "strawberry",
    description: "Intense strawberry flavour — a storm of fresh fruity taste.",
    imageUrl: "/products/regular-strawberry-storm.jpg",
    sortOrder: 11,
  },
  {
    name: "Regular Nuttin Butter",
    slug: "regular-nuttin-butter",
    flavour: "nut",
    description: "Peanut butter, banana and honey — nuttin beats this combo.",
    imageUrl: "/products/regular-nuttin-butter.jpg",
    bestSeller: true,
    sortOrder: 12,
  },
  {
    name: "Regular Coco Crush",
    slug: "regular-coco-crush",
    flavour: "coconut",
    description: "Coconut cream and tropical fruit — crush your cravings.",
    imageUrl: "/products/regular-coco-crush.jpg",
    sortOrder: 13,
  },
  {
    name: "Regular Pineapple Freeze",
    slug: "regular-pineapple-freeze",
    flavour: "pineapple",
    description: "Icy pineapple refreshment — cool, crisp and tropical.",
    imageUrl: "/products/regular-pineapple-freeze.jpg",
    isNew: true,
    sortOrder: 14,
  },
  {
    name: "Regular Funky Monkey",
    slug: "regular-funky-monkey",
    flavour: "banana",
    description: "Banana, chocolate and peanut butter — the ultimate crowd pleaser.",
    imageUrl: "/products/regular-funky-monkey.jpg",
    featured: true,
    sortOrder: 15,
  },
  {
    name: "Regular Gh-Favorite",
    slug: "regular-gh-favorite",
    flavour: "banana",
    description: "Our Ghana favourite blend — creamy, comforting and always a hit.",
    imageUrl: "/products/regular-gh-favorite.jpg",
    bestSeller: true,
    sortOrder: 16,
  },
  {
    name: "Berry Cream Sensation",
    slug: "berry-cream-sensation",
    flavour: "berry",
    description: "Creamy mixed berries blended velvety smooth — pure sensation.",
    imageUrl: "/products/berry-cream-sensation.jpg",
    featured: true,
    sortOrder: 17,
    sizes: [
      { name: "regular", label: "Regular", priceGhs: 85, sortOrder: 1 },
      { name: "small", label: "Small", priceGhs: 65, sortOrder: 2 },
    ],
  },
  {
    name: "Paw-Paw Passion",
    slug: "paw-paw-passion",
    flavour: "tropical",
    description: "Ghana pawpaw and passion fruit — exotic, golden and unforgettable.",
    imageUrl: "/products/paw-paw-passion.jpg",
    isNew: true,
    sortOrder: 18,
  },
];

export const SMOOTHIE_COUNT = SMOOTHIE_MENU.length;
