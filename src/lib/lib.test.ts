import { describe, expect, it } from "vitest";
import { calculateTargets } from "./formulas";
import { buildWeeks, gradeForChange } from "./weeks";

describe("calculateTargets", () => {
  it("applies the formulas to a 80 kg body weight", () => {
    const t = calculateTargets(80);
    expect(t.calories).toBe(2080);
    expect(t.protein).toBe(160);
    expect(t.fat).toBeCloseTo(69.33, 2);
    expect(t.fibre).toBeCloseTo(29.12, 2);
    expect(t.carbs).toBe(2080 - 640);
    expect(t.water).toBeCloseTo(2.667, 3);
  });
});

describe("gradeForChange", () => {
  it("grades by weekly loss", () => {
    expect(gradeForChange(-0.7)).toBe("A");
    expect(gradeForChange(-0.3)).toBe("B");
    expect(gradeForChange(-1.4)).toBe("B");
    expect(gradeForChange(-0.1)).toBe("C");
    expect(gradeForChange(0)).toBe("C");
    expect(gradeForChange(0.2)).toBe("D");
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
