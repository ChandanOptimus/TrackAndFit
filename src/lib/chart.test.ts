import { describe, expect, it } from "vitest";
import { dateDomain, dateTicks, fractionOf, inRange, nearestIndex, niceTicks, paddedDomain, rangeStart } from "./chart";

describe("niceTicks", () => {
  it("picks round steps covering the range", () => {
    expect(niceTicks(57.2, 60.8)).toEqual([58, 59, 60]);
    expect(niceTicks(0, 100)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(niceTicks(18.1, 26.4, 4)).toEqual([20, 22, 24, 26]);
  });

  it("copes with a flat range and avoids floating point noise", () => {
    expect(niceTicks(5, 5).length).toBeGreaterThan(0);
    expect(niceTicks(0.1, 0.5, 4).every((t) => Number.isFinite(t) && String(t).length < 8)).toBe(true);
  });
});

describe("domains", () => {
  it("pads the value range, with a minimum pad for flat data", () => {
    expect(paddedDomain([60, 70], 0.5)).toEqual([58, 72]); // 20% of the range each side
    expect(paddedDomain([60, 62], 0.5)).toEqual([59.5, 62.5]); // the minimum pad wins
    expect(paddedDomain([60, 60], 0.5)).toEqual([59.5, 60.5]);
  });

  it("widens a single day so the point is centred", () => {
    expect(dateDomain(["2026-10-13"])).toEqual(["2026-10-10", "2026-10-16"]);
    expect(dateDomain(["2026-10-05", "2026-10-01", "2026-10-13"])).toEqual(["2026-10-01", "2026-10-13"]);
  });
});

describe("x axis", () => {
  it("spreads date labels evenly", () => {
    expect(dateTicks("2026-10-01", "2026-10-10", 4)).toEqual(["2026-10-01", "2026-10-04", "2026-10-07", "2026-10-10"]);
    expect(dateTicks("2026-10-01", "2026-10-01")).toEqual(["2026-10-01"]);
    expect(dateTicks("2026-10-01", "2026-10-02", 4)).toEqual(["2026-10-01", "2026-10-02"]);
  });

  it("places dates and finds the nearest point", () => {
    expect(fractionOf("2026-10-06", "2026-10-01", "2026-10-11")).toBe(0.5);
    const pts = [
      { date: "2026-10-01", value: 1 },
      { date: "2026-10-05", value: 2 },
      { date: "2026-10-11", value: 3 },
    ];
    expect(nearestIndex(pts, 0.05, "2026-10-01", "2026-10-11")).toBe(0);
    expect(nearestIndex(pts, 0.55, "2026-10-01", "2026-10-11")).toBe(1);
    expect(nearestIndex(pts, 0.95, "2026-10-01", "2026-10-11")).toBe(2);
  });
});

describe("range", () => {
  const pts = [
    { date: "2026-07-01", value: 1 },
    { date: "2026-09-20", value: 2 },
    { date: "2026-10-12", value: 3 },
  ];
  it("limits points to the chosen period", () => {
    expect(rangeStart("4w", "2026-10-14")).toBe("2026-09-16");
    expect(inRange(pts, rangeStart("4w", "2026-10-14")).map((p) => p.value)).toEqual([2, 3]);
    expect(inRange(pts, rangeStart("3m", "2026-10-14")).map((p) => p.value)).toEqual([2, 3]);
    expect(rangeStart("all", "2026-10-14")).toBeNull();
    expect(inRange(pts, null)).toHaveLength(3);
  });
});
