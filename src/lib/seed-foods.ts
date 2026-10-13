import type { FoodUnit } from "./nutrition";

export interface SeedFood {
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fibre: number;
  waterMl?: number;
  units?: FoodUnit[];
}

/**
 * Starter foods, per 100 g (or ml). These are approximate values from common
 * USDA / Indian food tables; piece weights vary a lot. Edit them on the
 * Foods page to match your own food or packet labels.
 */
export const SEED_FOODS: SeedFood[] = [
  { name: "Chapati (whole wheat)", kcal: 300, protein: 10, fat: 4, carbs: 55, fibre: 8, units: [{ label: "chapati", grams: 40 }, { label: "roti", grams: 40 }] },
  { name: "Rice, white, cooked", kcal: 130, protein: 2.7, fat: 0.3, carbs: 28, fibre: 0.4, units: [{ label: "katori", grams: 150 }] },
  { name: "Rice, white, raw", kcal: 365, protein: 7.1, fat: 0.7, carbs: 80, fibre: 1.3 },
  { name: "Chole / chickpeas, raw (dry)", kcal: 378, protein: 20.5, fat: 6, carbs: 63, fibre: 12.2 },
  { name: "Chole / chickpeas, boiled", kcal: 164, protein: 8.9, fat: 2.6, carbs: 27.4, fibre: 7.6, units: [{ label: "katori", grams: 150 }] },
  { name: "Toor dal, raw", kcal: 343, protein: 21.7, fat: 1.5, carbs: 62.8, fibre: 15 },
  { name: "Moong dal, raw", kcal: 347, protein: 24, fat: 1.2, carbs: 63, fibre: 16.3 },
  { name: "Masoor dal, raw", kcal: 352, protein: 24.6, fat: 1.1, carbs: 63, fibre: 10.7 },
  { name: "Soya chunks (Nutrela), raw", kcal: 345, protein: 52, fat: 0.5, carbs: 33, fibre: 13 },
  { name: "Paneer", kcal: 300, protein: 18, fat: 23, carbs: 3.5, fibre: 0 },
  { name: "Egg, whole", kcal: 143, protein: 12.6, fat: 9.5, carbs: 0.7, fibre: 0, units: [{ label: "egg", grams: 50 }] },
  { name: "Chicken breast, raw", kcal: 120, protein: 22.5, fat: 2.6, carbs: 0, fibre: 0 },
  { name: "Milk, full fat", kcal: 61, protein: 3.2, fat: 3.3, carbs: 4.8, fibre: 0, units: [{ label: "glass", grams: 250 }] },
  { name: "Curd (dahi), full fat", kcal: 61, protein: 3.5, fat: 3.3, carbs: 4.7, fibre: 0, units: [{ label: "katori", grams: 150 }] },
  { name: "Banana", kcal: 89, protein: 1.1, fat: 0.3, carbs: 22.8, fibre: 2.6, units: [{ label: "banana", grams: 118 }] },
  { name: "Apple", kcal: 52, protein: 0.3, fat: 0.2, carbs: 13.8, fibre: 2.4, units: [{ label: "apple", grams: 180 }] },
  { name: "Potato", kcal: 77, protein: 2, fat: 0.1, carbs: 17, fibre: 2.2, units: [{ label: "potato", grams: 150 }] },
  { name: "Onion", kcal: 40, protein: 1.1, fat: 0.1, carbs: 9.3, fibre: 1.7 },
  { name: "Tomato", kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fibre: 1.2 },
  { name: "Oats, rolled, raw", kcal: 389, protein: 16.9, fat: 6.9, carbs: 66.3, fibre: 10.6 },
  { name: "Peanuts", kcal: 567, protein: 25.8, fat: 49.2, carbs: 16.1, fibre: 8.5 },
  { name: "Almonds", kcal: 579, protein: 21.2, fat: 49.9, carbs: 21.6, fibre: 12.5, units: [{ label: "almond", grams: 1.2 }] },
  {
    name: "Cooking oil",
    kcal: 884, protein: 0, fat: 100, carbs: 0, fibre: 0,
    units: [{ label: "tsp", grams: 4.5 }, { label: "tbsp", grams: 13.5 }],
  },
  {
    name: "Ghee",
    kcal: 900, protein: 0, fat: 100, carbs: 0, fibre: 0,
    units: [{ label: "tsp", grams: 5 }, { label: "tbsp", grams: 14 }],
  },
  { name: "Sugar", kcal: 387, protein: 0, fat: 0, carbs: 100, fibre: 0, units: [{ label: "tsp", grams: 4 }] },
  {
    name: "Water",
    kcal: 0, protein: 0, fat: 0, carbs: 0, fibre: 0, waterMl: 100,
    units: [{ label: "glass", grams: 250 }, { label: "bottle (1 L)", grams: 1000 }],
  },

  // ---- Diet plan foods (approximate; check against your packets/labels) ----
  { name: "Muesli", kcal: 360, protein: 10, fat: 6, carbs: 66, fibre: 8 },
  // Label, per 35 g scoop: 137 kcal, 25 g protein, 4.7 g carbs, 2 g fat (shown here per 100 g).
  { name: "Whey protein", kcal: 391.43, protein: 71.43, fat: 5.71, carbs: 13.43, fibre: 0, units: [{ label: "scoop", grams: 35 }] },
  { name: "Skimmed milk", kcal: 34, protein: 3.4, fat: 0.1, carbs: 5, fibre: 0, units: [{ label: "glass", grams: 250 }] },
  { name: "Black coffee", kcal: 1, protein: 0.1, fat: 0, carbs: 0, fibre: 0, units: [{ label: "cup", grams: 200 }] },
  // Tea/coffee with milk, no sugar. Mostly milk: ~47% full-fat milk in tea, ~60% in coffee. Adjust to your own cup.
  { name: "Milk tea (sugar free, full-fat milk)", kcal: 29, protein: 1.5, fat: 1.5, carbs: 2.3, fibre: 0, units: [{ label: "cup", grams: 150 }] },
  { name: "Milk coffee (sugar free, full-fat milk)", kcal: 38, protein: 1.9, fat: 2, carbs: 2.9, fibre: 0, units: [{ label: "cup", grams: 200 }] },
  { name: "Coconut water", kcal: 19, protein: 0.7, fat: 0.2, carbs: 3.7, fibre: 1.1, units: [{ label: "glass", grams: 250 }] },
  { name: "Watermelon", kcal: 30, protein: 0.6, fat: 0.2, carbs: 7.6, fibre: 0.4 },
  { name: "Muskmelon", kcal: 34, protein: 0.8, fat: 0.2, carbs: 8.2, fibre: 0.9 },
  { name: "Mango", kcal: 60, protein: 0.8, fat: 0.4, carbs: 15, fibre: 1.6 },
  { name: "Peach", kcal: 39, protein: 0.9, fat: 0.3, carbs: 9.5, fibre: 1.5, units: [{ label: "peach", grams: 150 }] },
  { name: "Kiwi", kcal: 61, protein: 1.1, fat: 0.5, carbs: 14.7, fibre: 3, units: [{ label: "kiwi", grams: 70 }] },
  { name: "Orange", kcal: 47, protein: 0.9, fat: 0.1, carbs: 11.8, fibre: 2.4, units: [{ label: "orange", grams: 130 }] },
  { name: "Papaya", kcal: 43, protein: 0.5, fat: 0.3, carbs: 10.8, fibre: 1.7 },
  { name: "Strawberries", kcal: 32, protein: 0.7, fat: 0.3, carbs: 7.7, fibre: 2 },
  { name: "Blueberries", kcal: 57, protein: 0.7, fat: 0.3, carbs: 14.5, fibre: 2.4 },
  { name: "Pear", kcal: 57, protein: 0.4, fat: 0.1, carbs: 15.2, fibre: 3.1, units: [{ label: "pear", grams: 180 }] },
  { name: "Poha, raw", kcal: 346, protein: 6.6, fat: 1.2, carbs: 77, fibre: 1 },
  { name: "Rava / semolina (suji), raw", kcal: 360, protein: 12.7, fat: 1.1, carbs: 73, fibre: 3.9 },
  { name: "Besan (gram flour), raw", kcal: 387, protein: 22, fat: 6.7, carbs: 58, fibre: 10.8, units: [{ label: "tbsp", grams: 8 }] },
  { name: "Besan chilla, cooked (no oil)", kcal: 190, protein: 10, fat: 7, carbs: 22, fibre: 5, units: [{ label: "small chilla", grams: 45 }] },
  { name: "Oats chilla, cooked (no oil)", kcal: 160, protein: 6, fat: 4, carbs: 25, fibre: 3.5, units: [{ label: "small chilla", grams: 45 }] },
  { name: "Idli", kcal: 148, protein: 4.5, fat: 0.4, carbs: 31, fibre: 1, units: [{ label: "idli", grams: 39 }] },
  { name: "Plain dosa, cooked (no oil)", kcal: 135, protein: 4, fat: 0.7, carbs: 28, fibre: 1, units: [{ label: "small dosa", grams: 60 }] },
  { name: "Sambhar", kcal: 50, protein: 2.3, fat: 1.5, carbs: 7, fibre: 1.8, units: [{ label: "small bowl", grams: 150 }] },
  {
    name: "Bread slice (wheat/white)",
    kcal: 265, protein: 9, fat: 3.2, carbs: 49, fibre: 2.7,
    units: [{ label: "big slice", grams: 35 }, { label: "small slice", grams: 25 }],
  },
  { name: "Egg white", kcal: 52, protein: 10.9, fat: 0.2, carbs: 0.7, fibre: 0, units: [{ label: "egg white", grams: 33 }] },
  { name: "Paneer, low fat", kcal: 185, protein: 18, fat: 10, carbs: 4, fibre: 0 },
  { name: "Tofu", kcal: 76, protein: 8.1, fat: 4.8, carbs: 1.9, fibre: 0.3 },
  { name: "Rajma / kidney beans, boiled", kcal: 127, protein: 8.7, fat: 0.5, carbs: 22.8, fibre: 6.4, units: [{ label: "katori", grams: 150 }] },
  { name: "Moong dal (green gram), boiled", kcal: 105, protein: 7, fat: 0.4, carbs: 19, fibre: 7.6, units: [{ label: "katori", grams: 150 }] },
  { name: "Salmon, raw", kcal: 208, protein: 20.4, fat: 13.4, carbs: 0, fibre: 0 },
  { name: "Tuna, raw", kcal: 109, protein: 24.4, fat: 0.5, carbs: 0, fibre: 0 },
  { name: "Mutton (goat), raw", kcal: 109, protein: 20.6, fat: 2.3, carbs: 0, fibre: 0 },
  { name: "Mixed vegetables / salad, raw", kcal: 25, protein: 1.2, fat: 0.2, carbs: 5, fibre: 2 },
  { name: "Green vegetables, raw", kcal: 30, protein: 2.5, fat: 0.3, carbs: 5, fibre: 2.5 },
  { name: "Mixed vegetable soup", kcal: 35, protein: 1.2, fat: 0.8, carbs: 6, fibre: 1, units: [{ label: "bowl", grams: 250 }] },
  { name: "Walnuts", kcal: 654, protein: 15.2, fat: 65.2, carbs: 13.7, fibre: 6.7 },
  { name: "Olive oil", kcal: 884, protein: 0, fat: 100, carbs: 0, fibre: 0, units: [{ label: "tsp", grams: 4.5 }, { label: "tbsp", grams: 13.5 }] },

  // ---- More fruits (per 100 g edible part; approximate, from USDA / Indian food tables) ----
  { name: "Grapes", kcal: 69, protein: 0.7, fat: 0.2, carbs: 18.1, fibre: 0.9 },
  { name: "Pomegranate (arils)", kcal: 83, protein: 1.7, fat: 1.2, carbs: 18.7, fibre: 4 },
  { name: "Guava", kcal: 68, protein: 2.6, fat: 1, carbs: 14.3, fibre: 5.4, units: [{ label: "guava", grams: 100 }] },
  { name: "Pineapple", kcal: 50, protein: 0.5, fat: 0.1, carbs: 13.1, fibre: 1.4 },
  { name: "Lychee", kcal: 66, protein: 0.8, fat: 0.4, carbs: 16.5, fibre: 1.3, units: [{ label: "lychee", grams: 10 }] },
  { name: "Custard apple (sitaphal)", kcal: 94, protein: 2.1, fat: 0.3, carbs: 23.6, fibre: 4.4 },
  { name: "Sapota (chikoo)", kcal: 83, protein: 0.4, fat: 1.1, carbs: 20, fibre: 5.3, units: [{ label: "chikoo", grams: 80 }] },
  { name: "Jackfruit", kcal: 95, protein: 1.7, fat: 0.6, carbs: 23.3, fibre: 1.5 },
  { name: "Dragon fruit", kcal: 60, protein: 1.2, fat: 0.4, carbs: 13, fibre: 3 },
  { name: "Plum", kcal: 46, protein: 0.7, fat: 0.3, carbs: 11.4, fibre: 1.4, units: [{ label: "plum", grams: 66 }] },
  { name: "Apricot", kcal: 48, protein: 1.4, fat: 0.4, carbs: 11.1, fibre: 2, units: [{ label: "apricot", grams: 35 }] },
  { name: "Nectarine", kcal: 44, protein: 1.1, fat: 0.3, carbs: 10.6, fibre: 1.7 },
  { name: "Cherries", kcal: 63, protein: 1.1, fat: 0.2, carbs: 16, fibre: 2.1 },
  { name: "Blackberries", kcal: 43, protein: 1.4, fat: 0.5, carbs: 9.6, fibre: 5.3 },
  { name: "Raspberries", kcal: 52, protein: 1.2, fat: 0.7, carbs: 11.9, fibre: 6.5 },
  { name: "Cranberries", kcal: 46, protein: 0.4, fat: 0.1, carbs: 12.2, fibre: 4.6 },
  { name: "Mulberries", kcal: 43, protein: 1.4, fat: 0.4, carbs: 9.8, fibre: 1.7 },
  { name: "Grapefruit", kcal: 42, protein: 0.8, fat: 0.1, carbs: 10.7, fibre: 1.6 },
  { name: "Pomelo", kcal: 38, protein: 0.8, fat: 0, carbs: 9.6, fibre: 1 },
  { name: "Sweet lime (mosambi)", kcal: 43, protein: 0.8, fat: 0.3, carbs: 9.3, fibre: 0.5 },
  { name: "Tangerine / mandarin / kinnow", kcal: 53, protein: 0.8, fat: 0.3, carbs: 13.3, fibre: 1.8, units: [{ label: "piece", grams: 90 }] },
  { name: "Lemon", kcal: 29, protein: 1.1, fat: 0.3, carbs: 9.3, fibre: 2.8 },
  { name: "Honeydew melon", kcal: 36, protein: 0.5, fat: 0.1, carbs: 9.1, fibre: 0.8 },
  { name: "Coconut, fresh (kernel)", kcal: 354, protein: 3.3, fat: 33.5, carbs: 15.2, fibre: 9 },
  { name: "Fig, fresh (anjeer)", kcal: 74, protein: 0.8, fat: 0.3, carbs: 19.2, fibre: 2.9, units: [{ label: "fig", grams: 50 }] },
  { name: "Jamun (black plum)", kcal: 62, protein: 0.7, fat: 0.2, carbs: 14, fibre: 0.9 },
  { name: "Amla (Indian gooseberry)", kcal: 44, protein: 0.9, fat: 0.6, carbs: 10.2, fibre: 4.3, units: [{ label: "amla", grams: 25 }] },
  { name: "Ber (Indian jujube)", kcal: 79, protein: 1.2, fat: 0.2, carbs: 20.2, fibre: 10 },
  { name: "Star fruit (carambola)", kcal: 31, protein: 1, fat: 0.3, carbs: 6.7, fibre: 2.8 },
  { name: "Passion fruit", kcal: 97, protein: 2.2, fat: 0.7, carbs: 23.4, fibre: 10.4 },
  { name: "Persimmon", kcal: 70, protein: 0.6, fat: 0.2, carbs: 18.6, fibre: 3.6 },
  { name: "Longan", kcal: 60, protein: 1.3, fat: 0.1, carbs: 15.1, fibre: 1.1 },
  { name: "Avocado", kcal: 160, protein: 2, fat: 14.7, carbs: 8.5, fibre: 6.7, units: [{ label: "avocado", grams: 150 }] },

  // ---- Dry fruits, seeds and pudding ----
  { name: "Chia seeds", kcal: 486, protein: 16.5, fat: 30.7, carbs: 42.1, fibre: 34.4, units: [{ label: "tbsp", grams: 12 }] },
  { name: "Cashews", kcal: 553, protein: 18.2, fat: 43.9, carbs: 30.2, fibre: 3.3 },
  { name: "Pistachios", kcal: 560, protein: 20.2, fat: 45.3, carbs: 27.2, fibre: 10.6 },
  { name: "Raisins", kcal: 299, protein: 3.1, fat: 0.5, carbs: 79.2, fibre: 3.7 },
  { name: "Dates, dried (khajoor)", kcal: 277, protein: 1.8, fat: 0.2, carbs: 75, fibre: 6.7, units: [{ label: "date", grams: 10 }] },
  { name: "Figs, dried (anjeer)", kcal: 249, protein: 3.3, fat: 0.9, carbs: 63.9, fibre: 9.8, units: [{ label: "fig", grams: 10 }] },
  { name: "Apricots, dried", kcal: 241, protein: 3.4, fat: 0.5, carbs: 62.6, fibre: 7.3 },
  { name: "Prunes (dried plums)", kcal: 240, protein: 2.2, fat: 0.4, carbs: 63.9, fibre: 7.1 },
  { name: "Mixed dry fruits & nuts (equal mix)", kcal: 472, protein: 11.9, fat: 31.9, carbs: 44, fibre: 6.6 },
  // Estimated per 100 g: 25 g apple, 25 g banana, 8 g chia, 7 g almonds, 10 g mixed dry fruits, ~25 g water. No milk or sugar.
  { name: "Fruit & chia pudding (with dry fruits)", kcal: 162, protein: 4.3, fat: 9.3, carbs: 18.4, fibre: 5.5, units: [{ label: "serving", grams: 100 }] },

  // ---- Zero-sugar colas (per 100 ml). Labels list 0 kcal / 0 g fat, carbs, sugars, protein. Caffeine (~10 mg/100 ml) isn't tracked. ----
  { name: "Diet Coke", kcal: 0, protein: 0, fat: 0, carbs: 0, fibre: 0, units: [{ label: "can", grams: 300 }, { label: "glass", grams: 250 }] },
  { name: "Pepsi Zero Sugar", kcal: 0, protein: 0, fat: 0, carbs: 0, fibre: 0, units: [{ label: "can", grams: 300 }, { label: "glass", grams: 250 }] },
  { name: "Coca-Cola Zero Sugar", kcal: 0, protein: 0, fat: 0, carbs: 0, fibre: 0, units: [{ label: "can", grams: 300 }, { label: "glass", grams: 250 }] },

  // Per 10 g serving on the label: 35.9 kcal, 0.45 g protein, 8.2 g carbs, 1.0 g fibre, 0.12 g fat (shown here per 100 g).
  { name: "Supply 360", kcal: 359, protein: 4.5, fat: 1.2, carbs: 82, fibre: 10, units: [{ label: "serving", grams: 10 }] },

  // Label: 1 serving = 2 capsules = 3.704 g = 33.3 kcal. 33.3 kcal is 3.704 g x 9, so the label's "4 g fat" is 3.7 g rounded up.
  { name: "Omega 3", kcal: 900, protein: 0, fat: 100, carbs: 0, fibre: 0, units: [{ label: "serving", grams: 3.704 }] },
];
