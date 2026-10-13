import { describe, expect, it } from "vitest";
import { computePlan, describePlan, guardFor, planFor, recentValue } from "./plan";

const NO_DATA = { heightCm: null, bodyFat: {}, asOf: "2026-10-13" };

describe("guardFor", () => {
  const chandan = planFor("chandan");

  it("applies the full deficit when comfortably above the limits, or with no readings", () => {
    expect(guardFor(chandan, { bmi: 24, bodyFat: 20 })).toEqual({ factor: 1, basis: "bodyFat" });
    expect(guardFor(chandan, { bmi: 24, bodyFat: null })).toEqual({ factor: 1, basis: "bmi" });
    expect(guardFor(chandan, { bmi: null, bodyFat: null })).toEqual({ factor: 1, basis: "none" });
  });

  it("halves the deficit near the lower limit and removes it below", () => {
    expect(guardFor(chandan, { bmi: null, bodyFat: 13.9 }).factor).toBe(0.5);
    expect(guardFor(chandan, { bmi: null, bodyFat: 14 }).factor).toBe(1);
    expect(guardFor(chandan, { bmi: null, bodyFat: 10.9 }).factor).toBe(0);
    expect(guardFor(chandan, { bmi: 20.4, bodyFat: null }).factor).toBe(0.5);
    expect(guardFor(chandan, { bmi: 18.4, bodyFat: null }).factor).toBe(0);
  });

  it("lets the more cautious reading win", () => {
    expect(guardFor(chandan, { bmi: 18, bodyFat: 20 })).toEqual({ factor: 0, basis: "bmi" });
    expect(guardFor(chandan, { bmi: 24, bodyFat: 12 })).toEqual({ factor: 0.5, basis: "bodyFat" });
  });

  it("uses higher body fat limits for Ankita", () => {
    const ankita = planFor("ankita");
    expect(guardFor(ankita, { bmi: null, bodyFat: 17.9 }).factor).toBe(0);
    expect(guardFor(ankita, { bmi: null, bodyFat: 20 }).factor).toBe(0.5);
    expect(guardFor(ankita, { bmi: null, bodyFat: 21 }).factor).toBe(1);
  });
});

describe("recentValue", () => {
  const map = { "2026-09-20": 20, "2026-10-05": 21, "2026-10-12": 22 };
  it("returns the latest reading on or before the date, within 14 days", () => {
    expect(recentValue(map, "2026-10-13")).toBe(22);
    expect(recentValue(map, "2026-10-08")).toBe(21);
    expect(recentValue(map, "2026-10-30")).toBeNull();
    expect(recentValue(map, "2026-09-01")).toBeNull();
  });
});

describe("computePlan", () => {
  it("gives Chandan about 1658 kcal at 83 kg (maintenance 2158 minus 500)", () => {
    const r = computePlan("chandan", 83, NO_DATA);
    expect(r.maintenance).toBe(2158);
    expect(r.targets.calories).toBe(1658);
    expect(r.deficit).toBe(500);
    expect(r.targets.protein).toBe(166);
    expect(r.targets.fat).toBeCloseTo(1658 / 30, 5);
  });

  it("makes protein, fat and carbs add up to the calorie target", () => {
    const { targets: t } = computePlan("chandan", 83, NO_DATA);
    expect(t.protein * 4 + t.fat * 9 + t.carbs).toBeCloseTo(t.calories, 5);
    const a = computePlan("ankita", 58, NO_DATA).targets;
    expect(a.protein * 4 + a.fat * 9 + a.carbs).toBeCloseTo(a.calories, 5);
  });

  it("gives Ankita about 1208 kcal at 58 kg (maintenance 1508 minus 300)", () => {
    const r = computePlan("ankita", 58, NO_DATA);
    expect(r.targets.calories).toBe(1208);
    expect(r.floored).toBe(false);
  });

  it("scales the deficit with the guard", () => {
    const half = computePlan("chandan", 83, { heightCm: null, bodyFat: { "2026-10-12": 12 }, asOf: "2026-10-13" });
    expect(half.targets.calories).toBe(1908);
    const none = computePlan("chandan", 83, { heightCm: null, bodyFat: { "2026-10-12": 9 }, asOf: "2026-10-13" });
    expect(none.targets.calories).toBe(2158);
    expect(none.deficit).toBe(0);
  });

  it("ignores a stale body fat reading and falls back to BMI", () => {
    const r = computePlan("chandan", 83, { heightCm: 180, bodyFat: { "2026-08-01": 9 }, asOf: "2026-10-13" });
    expect(r.guard.basis).toBe("bmi");
    expect(r.targets.calories).toBe(1658);
  });

  it("applies the calorie floor, but never above maintenance", () => {
    const light = computePlan("chandan", 60, NO_DATA); // 1560 - 500 = 1060 -> floor 1500
    expect(light.targets.calories).toBe(1500);
    expect(light.floored).toBe(true);
    const tiny = computePlan("chandan", 50, NO_DATA); // maintenance 1300 is below the floor
    expect(tiny.targets.calories).toBe(1300);
    expect(tiny.deficit).toBe(0);
  });

  it("explains itself", () => {
    expect(describePlan(computePlan("chandan", 83, NO_DATA), "chandan")).toMatch(/Add your height/);
    expect(describePlan(computePlan("chandan", 83, { heightCm: null, bodyFat: { "2026-10-12": 12 }, asOf: "2026-10-13" }), "chandan")).toMatch(/Half deficit/);
    expect(describePlan(computePlan("chandan", 83, { heightCm: null, bodyFat: { "2026-10-12": 9 }, asOf: "2026-10-13" }), "chandan")).toMatch(/No deficit/);
  });
});
