import { describe, expect, it } from "vitest";
import { average, bmiLevel, bmiOf, bodyFatLevel, valuesBetween } from "./health";

describe("BMI", () => {
  it("calculates from weight and height", () => {
    expect(bmiOf(70, 175)).toBe(22.9);
    expect(bmiOf(58, 160)).toBe(22.7);
  });

  it("classifies with the given limits (the limit itself moves up a level)", () => {
    expect(bmiLevel(18.4)).toBe("low");
    expect(bmiLevel(18.5)).toBe("standard");
    expect(bmiLevel(24.9)).toBe("standard");
    expect(bmiLevel(25)).toBe("high");
    expect(bmiLevel(29.9)).toBe("high");
    expect(bmiLevel(30)).toBe("toohigh");
    expect(bmiLevel(41)).toBe("toohigh");
  });

  it("classifies the displayed (1 decimal) value", () => {
    // 24.96 shows as 25.0, so it must be "High", not "Standard"
    const bmi = bmiOf(24.96 * 1.7 * 1.7, 170);
    expect(bmi).toBe(25);
    expect(bmiLevel(bmi)).toBe("high");
  });
});

describe("body fat", () => {
  it("classifies", () => {
    expect(bodyFatLevel(10.9)).toBe("low");
    expect(bodyFatLevel(11)).toBe("standard");
    expect(bodyFatLevel(21.9)).toBe("standard");
    expect(bodyFatLevel(22)).toBe("high");
    expect(bodyFatLevel(26.9)).toBe("high");
    expect(bodyFatLevel(27)).toBe("toohigh");
  });
});

describe("helpers", () => {
  it("averages and filters a date range", () => {
    const map = { "2026-01-01": 20, "2026-01-02": 22, "2026-01-09": 30 };
    expect(valuesBetween(map, "2026-01-01", "2026-01-07")).toEqual([20, 22]);
    expect(average([20, 22])).toBe(21);
    expect(average([])).toBeNull();
  });
});
