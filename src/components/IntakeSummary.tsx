import type { Targets } from "@/lib/formulas";
import type { Nutrients } from "@/lib/nutrition";

const fmt = (n: number, d = 0) => n.toFixed(d);

function IntakeCard(props: {
  label: string;
  tone: string;
  eaten: string;
  unit: string;
  sub?: string;
  ratio: number | null;
  target?: string | null;
}) {
  return (
    <div className={`card t-${props.tone}`}>
      <div className="label">{props.label}</div>
      <div className="value">
        {props.eaten} <small>{props.unit}</small>
      </div>
      {props.ratio !== null && (
        <>
          <div className="bar" aria-hidden>
            <span style={{ width: `${Math.min(props.ratio, 1) * 100}%` }} />
          </div>
          <div className="muted small of">
            of {props.target} · {Math.round(props.ratio * 100)}%
          </div>
        </>
      )}
      {props.sub && <div className="muted small sub">{props.sub}</div>}
    </div>
  );
}

/**
 * What was eaten versus the daily targets. `compact` is the slim version used in
 * sticky bars: it scrolls sideways on phones.
 */
export function IntakeSummary({
  totals,
  targets,
  compact = false,
}: {
  totals: Nutrients;
  targets: Targets | null;
  compact?: boolean;
}) {
  const carbKcal = totals.carbs * 4; // the carbs target is in kcal (Calories - protein x 4)
  const ratio = (eaten: number, target: number | undefined) => (targets && target ? eaten / target : null);
  return (
    <div className={compact ? "targets compact strip" : "targets"}>
      <IntakeCard label="Calories" tone="calories" eaten={fmt(totals.kcal)} unit="kcal"
        ratio={ratio(totals.kcal, targets?.calories)} target={targets && `${fmt(targets.calories)} kcal`} />
      <IntakeCard label="Protein" tone="protein" eaten={fmt(totals.protein, 1)} unit="g"
        ratio={ratio(totals.protein, targets?.protein)} target={targets && `${fmt(targets.protein)} g`} />
      <IntakeCard label="Fat" tone="fat" eaten={fmt(totals.fat, 1)} unit="g"
        ratio={ratio(totals.fat, targets?.fat)} target={targets && `${fmt(targets.fat, 1)} g`} />
      <IntakeCard label="Fibre" tone="fibre" eaten={fmt(totals.fibre, 1)} unit="g"
        ratio={ratio(totals.fibre, targets?.fibre)} target={targets && `${fmt(targets.fibre, 1)} g`} />
      <IntakeCard label="Carbs" tone="carbs" eaten={fmt(carbKcal)} unit="kcal" sub={`${fmt(totals.carbs, 1)} g carbs`}
        ratio={ratio(carbKcal, targets?.carbs)} target={targets && `${fmt(targets.carbs)} kcal`} />
      <IntakeCard label="Water" tone="water" eaten={fmt(totals.waterMl / 1000, 2)} unit="L"
        ratio={ratio(totals.waterMl / 1000, targets?.water)} target={targets && `${fmt(targets.water, 1)} L`} />
    </div>
  );
}
