import { describe, expect, it } from "vitest";
import { parseCustomNutrition, parseFoodInput } from "./food-validation";
import { SEED_FOODS } from "./seed-foods";
import { MEALS, gramsFor, groupByMeal, isMealId, nutrientsFor, totalsFor, type Food } from "./nutrition";

const toFood = (name: string, id: number): Food => {
  const s = SEED_FOODS.find((f) => f.name === name)!;
  return { id, name: s.name, kcal: s.kcal, protein: s.protein, fat: s.fat, carbs: s.carbs, fibre: s.fibre, waterMl: s.waterMl ?? 0, units: s.units ?? [] };
};

describe("nutrition", () => {
  const chole = toFood("Chole / chickpeas, raw (dry)", 1);
  const oil = toFood("Cooking oil", 2);
  const chapati = toFood("Chapati (whole wheat)", 3);

  it("converts amounts to grams", () => {
    expect(gramsFor(chapati, 2, "chapati")).toBe(80);
    expect(gramsFor(oil, 1, "tsp")).toBe(4.5);
    expect(gramsFor(chole, 40, "g")).toBe(40);
    expect(gramsFor(chole, 1, "cup")).toBeNull();
  });

  it("scales nutrition per 100 g", () => {
    const n = nutrientsFor(chole, 40);
    expect(n.protein).toBeCloseTo(8.2, 2);
    expect(n.carbs).toBeCloseTo(25.2, 2);
    expect(n.fibre).toBeCloseTo(4.88, 2);
  });

  it("totals a day: 40 g raw chole + 1 tsp oil + 1 chapati", () => {
    const t = totalsFor(
      [
        { id: 1, foodId: 1, amount: 40, unit: "g", grams: 40 },
        { id: 2, foodId: 2, amount: 1, unit: "tsp", grams: 4.5 },
        { id: 3, foodId: 3, amount: 1, unit: "chapati", grams: 40 },
        { id: 4, foodId: 99, amount: 1, unit: "g", grams: 1 }, // unknown food is skipped
      ],
      [chole, oil, chapati],
    );
    expect(t.protein).toBeCloseTo(8.2 + 4, 2);
    expect(t.fat).toBeCloseTo(2.4 + 4.5 + 1.6, 2);
    expect(t.kcal).toBeCloseTo(151.2 + 39.78 + 120, 2);
  });
});

describe("parseFoodInput", () => {
  const ok = { name: " Roti ", kcal: 300, protein: 10, fat: 4, carbs: 55, fibre: 8, units: [{ label: "piece", grams: 40 }] };

  it("cleans a valid food", () => {
    expect(parseFoodInput(ok)).toMatchObject({ name: "Roti", waterMl: 0 });
  });

  it("rejects bad input", () => {
    expect(typeof parseFoodInput({ ...ok, name: "" })).toBe("string");
    expect(typeof parseFoodInput({ ...ok, protein: 120 })).toBe("string");
    expect(typeof parseFoodInput({ ...ok, units: [{ label: "g", grams: 1 }] })).toBe("string");
    expect(typeof parseFoodInput({ ...ok, units: [{ label: "a", grams: 1 }, { label: "A", grams: 2 }] })).toBe("string");
  });
});

describe("manual (Others) entries", () => {
  const oil = toFood("Cooking oil", 2);

  it("counts custom nutrition in the day's totals", () => {
    const t = totalsFor(
      [
        { id: 1, foodId: 2, amount: 1, unit: "tsp", grams: 4.5 },
        { id: 2, foodId: null, amount: 1, unit: "serving", grams: 0, custom: { name: "Biryani", kcal: 600, protein: 25, fat: 20, carbs: 80, fibre: 4 } },
      ],
      [oil],
    );
    expect(t.kcal).toBeCloseTo(39.78 + 600, 2);
    expect(t.protein).toBe(25);
    expect(t.fibre).toBe(4);
    expect(t.waterMl).toBe(0);
  });

  it("validates manual values", () => {
    expect(parseCustomNutrition({ name: "  Biryani ", kcal: "600", protein: 25, fat: "", carbs: 80, fibre: 4 })).toEqual({
      name: "Biryani", kcal: 600, protein: 25, fat: 0, carbs: 80, fibre: 4,
    });
    expect(parseCustomNutrition({ kcal: 100 })).toMatchObject({ name: "Other", kcal: 100 });
    expect(typeof parseCustomNutrition({ kcal: -5 })).toBe("string");
    expect(typeof parseCustomNutrition({ kcal: "abc" })).toBe("string");
    expect(typeof parseCustomNutrition({ protein: 5000 })).toBe("string");
    expect(typeof parseCustomNutrition(null)).toBe("string");
  });
});

describe("meals", () => {
  it("offers the five meals in order", () => {
    expect(MEALS.map((m) => m.label)).toEqual(["Breakfast", "Lunch", "Dinner", "Snacks", "Supplements"]);
    expect(isMealId("snacks")).toBe(true);
    expect(isMealId("brunch")).toBe(false);
    expect(isMealId(null)).toBe(false);
  });

  it("groups entries by meal in order, with uncategorised ones last and empty groups omitted", () => {
    const entries = [
      { id: 1, category: "dinner" as const },
      { id: 2, category: null },
      { id: 3, category: "breakfast" as const },
      { id: 4 },
      { id: 5, category: "breakfast" as const },
    ];
    const groups = groupByMeal(entries);
    expect(groups.map((g) => g.label)).toEqual(["Breakfast", "Dinner", "No meal"]);
    expect(groups[0].entries.map((e) => e.id)).toEqual([3, 5]);
    expect(groups[2].entries.map((e) => e.id)).toEqual([2, 4]);
    expect(groupByMeal([])).toEqual([]);
  });
});
