interface Props {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
  mono?: boolean;
}

export default function MetricCard({ label, value, unit, highlight, mono }: Props) {
  return (
    <div className="metric-card" style={highlight ? { borderColor: 'var(--blue-300)', background: 'var(--blue-50)' } : {}}>
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={mono ? { fontFamily: "'JetBrains Mono', monospace", fontSize: 20 } : {}}>
        {value}
      </div>
      {unit && <div className="metric-unit">{unit}</div>}
    </div>
  );
}
