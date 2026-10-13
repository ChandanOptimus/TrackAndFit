import { describe, expect, it } from "vitest";
import { calculateTargets } from "./formulas";
import { buildWeeks, gradeForChange } from "./weeks";

describe("calculateTargets", () => {
  it("applies the formulas to an 80 kg body weight at maintenance calories", () => {
    const t = calculateTargets(80);
    expect(t.calories).toBe(2080);
    expect(t.protein).toBe(160);
    expect(t.fat).toBeCloseTo(69.33, 2);
    expect(t.fibre).toBeCloseTo(29.12, 2);
    expect(t.water).toBeCloseTo(2.667, 3);
  });

  it("gives carbs whatever calories are left after protein and fat", () => {
    const t = calculateTargets(80);
    expect(t.carbs).toBeCloseTo(2080 - 160 * 4 - (2080 / 30) * 9, 5);
    expect(t.protein * 4 + t.fat * 9 + t.carbs).toBeCloseTo(t.calories, 5);
  });

  it("uses a lower calorie target when given one", () => {
    const t = calculateTargets(83, 1650);
    expect(t.calories).toBe(1650);
    expect(t.protein).toBe(166);
    expect(t.fat).toBe(55);
    expect(t.fibre).toBeCloseTo(23.1, 5);
    expect(t.carbs).toBeCloseTo(1650 - 664 - 495, 5);
  });

  it("never returns negative carbs", () => {
    expect(calculateTargets(100, 500).carbs).toBe(0);
  });
});

describe("gradeForChange", () => {
  it("grades by weekly loss as a percentage of body weight", () => {
    expect(gradeForChange(-0.7, 80)).toBe("A"); // 0.875 %
    expect(gradeForChange(-0.3, 80)).toBe("B"); // 0.375 %
    expect(gradeForChange(-1.4, 80)).toBe("B"); // 1.75 % (too fast)
    expect(gradeForChange(-0.1, 80)).toBe("C"); // 0.125 %
    expect(gradeForChange(0, 80)).toBe("C");
    expect(gradeForChange(0.2, 80)).toBe("D");
  });

  it("scales the same loss differently for a lighter person", () => {
    expect(gradeForChange(-0.4, 83)).toBe("B"); // 0.48 %
    expect(gradeForChange(-0.4, 58)).toBe("A"); // 0.69 %
    expect(gradeForChange(-0.6, 58)).toBe("B"); // 1.03 %: just over 1 %, so too fast
  });
});

describe("buildWeeks", () => {
  const entries = {
    "2026-01-01": 80, "2026-01-02": 80, "2026-01-07": 80, // week 1 avg 80
    "2026-01-08": 79.5, "2026-01-14": 79, // week 2 avg 79.25
    "2026-01-15": 78, // week 3, in progress
  };

  it("averages weeks, tracks change and grades completed weeks", () => {
    const weeks = buildWeeks(entries, "2026-01-16");
    expect(weeks).toHaveLength(3);
    expect(weeks[0].average).toBe(80);
    expect(weeks[0].grade).toBeNull();
    expect(weeks[0].complete).toBe(true);
    expect(weeks[1].average).toBeCloseTo(79.25);
    expect(weeks[1].change).toBeCloseTo(-0.75);
    expect(weeks[1].grade).toBe("A");
    expect(weeks[1].targets?.calories).toBeCloseTo(79.25 * 26);
    expect(weeks[2].complete).toBe(false);
    expect(weeks[2].grade).toBeNull();
    expect(weeks[2].targets).toBeNull();
  });

  it("returns nothing without entries", () => {
    expect(buildWeeks({}, "2026-01-16")).toEqual([]);
  });
});
