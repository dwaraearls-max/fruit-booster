export type SmoothieNutrition = {
  calories: number;
  protein: string;
  carbohydrate: string;
  fibre: string;
  totalSugars: string;
  fat: string;
  saturatedFat: string;
  calcium: string;
  potassium: string;
};

export type SmoothieDetail = {
  ingredients: string;
  nutrition: SmoothieNutrition;
};

const BASE: Record<string, SmoothieDetail> = {
  "regular-mango-hurrican": {
    ingredients:
      "Brace yourself for a tropical hit with this powerful blend of mango, pineapple, banana, oat beverage and whey protein.",
    nutrition: {
      calories: 420,
      protein: "18g",
      carbohydrate: "72g",
      fibre: "5g",
      totalSugars: "58g",
      fat: "5g",
      saturatedFat: "1g",
      calcium: "220mg",
      potassium: "480mg",
    },
  },
  "mango-hurrican-tropical": {
    ingredients:
      "Mango, passion fruit, pineapple, guava and banana blended smooth for an upgraded tropical twist.",
    nutrition: {
      calories: 445,
      protein: "16g",
      carbohydrate: "78g",
      fibre: "6g",
      totalSugars: "60g",
      fat: "4g",
      saturatedFat: "1g",
      calcium: "200mg",
      potassium: "510mg",
    },
  },
  "regular-tropical-tornado": {
    ingredients:
      "Passion fruit, pineapple, guava, mango and coconut beverage — a swirling tropical storm in every sip.",
    nutrition: {
      calories: 435,
      protein: "15g",
      carbohydrate: "76g",
      fibre: "5g",
      totalSugars: "59g",
      fat: "5g",
      saturatedFat: "1.5g",
      calcium: "210mg",
      potassium: "495mg",
    },
  },
  "regular-breezy-banana": {
    ingredients:
      "Light and creamy banana, honey, oat beverage and vanilla — easy, breezy and naturally sweet.",
    nutrition: {
      calories: 380,
      protein: "14g",
      carbohydrate: "68g",
      fibre: "4g",
      totalSugars: "52g",
      fat: "4g",
      saturatedFat: "1g",
      calcium: "240mg",
      potassium: "520mg",
    },
  },
  "regular-strawbery-sunshine": {
    ingredients:
      "Bright strawberries, banana, orange and apple blended golden — sunshine in a cup.",
    nutrition: {
      calories: 365,
      protein: "12g",
      carbohydrate: "65g",
      fibre: "5g",
      totalSugars: "54g",
      fat: "3g",
      saturatedFat: "0.5g",
      calcium: "180mg",
      potassium: "420mg",
    },
  },
  "straybery-sunshine-berry": {
    ingredients:
      "Strawberries, blueberries, raspberries, banana and apple — strawberry sunshine boosted with mixed berries.",
    nutrition: {
      calories: 390,
      protein: "13g",
      carbohydrate: "70g",
      fibre: "6g",
      totalSugars: "56g",
      fat: "3g",
      saturatedFat: "0.5g",
      calcium: "190mg",
      potassium: "440mg",
    },
  },
  "regular-very-berry": {
    ingredients:
      "A vibrant blend of strawberries, blueberries, blackberries, raspberries and banana — very berry, very delicious.",
    nutrition: {
      calories: 400,
      protein: "14g",
      carbohydrate: "71g",
      fibre: "7g",
      totalSugars: "55g",
      fat: "3g",
      saturatedFat: "0.5g",
      calcium: "200mg",
      potassium: "460mg",
    },
  },
  "regular-the-original": {
    ingredients:
      "The timeless Fruit Booster blend — strawberry, mango, pineapple and banana, freshly blended daily.",
    nutrition: {
      calories: 410,
      protein: "15g",
      carbohydrate: "73g",
      fibre: "5g",
      totalSugars: "57g",
      fat: "4g",
      saturatedFat: "1g",
      calcium: "215mg",
      potassium: "470mg",
    },
  },
  "regular-banana-a-whey": {
    ingredients:
      "Creamy banana, whey protein, oat beverage, honey and vanilla — fuel up after your workout.",
    nutrition: {
      calories: 455,
      protein: "28g",
      carbohydrate: "58g",
      fibre: "4g",
      totalSugars: "48g",
      fat: "5g",
      saturatedFat: "1.5g",
      calcium: "280mg",
      potassium: "550mg",
    },
  },
  "regular-ripped-berry": {
    ingredients:
      "Mixed berries, whey protein, banana and apple — lean, clean and berry powered.",
    nutrition: {
      calories: 440,
      protein: "26g",
      carbohydrate: "62g",
      fibre: "6g",
      totalSugars: "50g",
      fat: "4g",
      saturatedFat: "1g",
      calcium: "260mg",
      potassium: "490mg",
    },
  },
  "regular-strawberry-storm": {
    ingredients:
      "Intense strawberries, banana, apple and a hint of lemon — a storm of fresh fruity taste.",
    nutrition: {
      calories: 375,
      protein: "12g",
      carbohydrate: "67g",
      fibre: "5g",
      totalSugars: "53g",
      fat: "3g",
      saturatedFat: "0.5g",
      calcium: "175mg",
      potassium: "410mg",
    },
  },
  "regular-nuttin-butter": {
    ingredients:
      "Peanut butter, banana, honey, oat beverage and whey protein — nuttin beats this combo.",
    nutrition: {
      calories: 520,
      protein: "22g",
      carbohydrate: "64g",
      fibre: "6g",
      totalSugars: "46g",
      fat: "14g",
      saturatedFat: "3g",
      calcium: "230mg",
      potassium: "580mg",
    },
  },
  "regular-coco-crush": {
    ingredients:
      "Coconut cream, pineapple, banana and mango — crush your cravings with tropical creaminess.",
    nutrition: {
      calories: 460,
      protein: "14g",
      carbohydrate: "74g",
      fibre: "5g",
      totalSugars: "58g",
      fat: "8g",
      saturatedFat: "5g",
      calcium: "190mg",
      potassium: "500mg",
    },
  },
  "regular-pineapple-freeze": {
    ingredients:
      "Icy pineapple, coconut beverage, banana and mint — cool, crisp and tropical.",
    nutrition: {
      calories: 350,
      protein: "11g",
      carbohydrate: "66g",
      fibre: "4g",
      totalSugars: "55g",
      fat: "3g",
      saturatedFat: "1g",
      calcium: "170mg",
      potassium: "430mg",
    },
  },
  "regular-funky-monkey": {
    ingredients:
      "Banana, chocolate, peanut butter and oat beverage — the ultimate crowd pleaser.",
    nutrition: {
      calories: 510,
      protein: "20g",
      carbohydrate: "68g",
      fibre: "5g",
      totalSugars: "50g",
      fat: "12g",
      saturatedFat: "3.5g",
      calcium: "220mg",
      potassium: "560mg",
    },
  },
  "canada-colada": {
    ingredients:
      "Pineapple, coconut cream, banana and vanilla — vacation vibes in every gulp.",
    nutrition: {
      calories: 475,
      protein: "13g",
      carbohydrate: "76g",
      fibre: "4g",
      totalSugars: "60g",
      fat: "9g",
      saturatedFat: "5.5g",
      calcium: "185mg",
      potassium: "490mg",
    },
  },
  "berry-cream-sensation": {
    ingredients:
      "Mixed berries, banana, yogurt and honey blended velvety smooth — pure sensation.",
    nutrition: {
      calories: 430,
      protein: "16g",
      carbohydrate: "72g",
      fibre: "6g",
      totalSugars: "57g",
      fat: "6g",
      saturatedFat: "2g",
      calcium: "250mg",
      potassium: "470mg",
    },
  },
  "paw-paw-passion": {
    ingredients:
      "Ghana pawpaw, passion fruit, mango and pineapple — exotic, golden and unforgettable.",
    nutrition: {
      calories: 395,
      protein: "13g",
      carbohydrate: "69g",
      fibre: "5g",
      totalSugars: "56g",
      fat: "4g",
      saturatedFat: "1g",
      calcium: "195mg",
      potassium: "505mg",
    },
  },
};

const FALLBACK: SmoothieDetail = {
  ingredients: "Fresh fruit blended smooth — 100% natural, no added sugar.",
  nutrition: {
    calories: 400,
    protein: "15g",
    carbohydrate: "70g",
    fibre: "5g",
    totalSugars: "55g",
    fat: "5g",
    saturatedFat: "1g",
    calcium: "200mg",
    potassium: "450mg",
  },
};

export function getSmoothieDetail(slug: string): SmoothieDetail {
  return BASE[slug] ?? FALLBACK;
}

export const NUTRITION_ROWS: Array<{ key: keyof SmoothieNutrition; label: string }> = [
  { key: "calories", label: "Calories" },
  { key: "protein", label: "Protein" },
  { key: "carbohydrate", label: "Carbohydrate" },
  { key: "fibre", label: "Fibre" },
  { key: "totalSugars", label: "Total Sugars" },
  { key: "fat", label: "Fat" },
  { key: "saturatedFat", label: "Saturated Fat" },
  { key: "calcium", label: "Calcium" },
  { key: "potassium", label: "Potassium" },
];
