import { describePlan, type PlanResult } from "@/lib/plan";

/** Shows how the calorie target is worked out and whether the safety guard has reduced the deficit. */
export function PlanNote({ result, userId }: { result: PlanResult; userId: string }) {
  const { maintenance, deficit, targets, guard } = result;
  const tone = guard.factor === 1 ? "full" : guard.factor === 0.5 ? "half" : "none";
  return (
    <div className={`panel plan-note plan-${tone}`}>
      <div>
        <strong>{Math.round(targets.calories)} kcal</strong>
        <span className="muted">
          {" "}
          = {Math.round(maintenance)} maintenance − {Math.round(deficit)} deficit
        </span>
      </div>
      <div className="muted small">{describePlan(result, userId)}</div>
    </div>
  );
}
