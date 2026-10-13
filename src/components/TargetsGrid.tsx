import { TARGET_META, type Targets } from "@/lib/formulas";

export function TargetsGrid({ targets }: { targets: Targets }) {
  return (
    <div className="targets">
      {TARGET_META.map((m) => (
        <div key={m.key} className={`card t-${m.key}`}>
          <div className="label">{m.label}</div>
          <div className="value">
            {targets[m.key].toFixed(m.decimals)} <small>{m.unit}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
