export type ExtendedAttackType =
  | 'none'
  | 'forgery'
  | 'replay'
  | 'channel_manipulation'
  | 'impersonation';

interface ScenarioDef {
  id: ExtendedAttackType;
  icon: string;
  label: string;
  short: string;
  color: string;
  eveRole: string;
}

export const SCENARIOS: ScenarioDef[] = [
  { id: 'none',                    icon: '✓', label: 'NO ATTACK',         short: 'Clean transmission',          color: '#10b981', eveRole: '' },
  { id: 'forgery',                 icon: '✎', label: 'FORGERY',           short: 'Signature tampered',          color: '#0284c7', eveRole: 'Signature Tampering' },
  { id: 'replay',                  icon: '↩', label: 'REPLAY',            short: 'Old session replayed',        color: '#7c6cf6', eveRole: 'Session Replay' },
  { id: 'channel_manipulation',    icon: '⚡', label: 'CHANNEL NOISE',     short: 'Quantum channel perturbed',   color: '#06b6d4', eveRole: 'Quantum Channel Noise' },
  { id: 'impersonation',           icon: '👤', label: 'IMPERSONATION',     short: 'Identity spoofing',           color: '#8b5cf6', eveRole: 'Identity Spoofing' },
];

interface Props {
  selectedAttack: ExtendedAttackType;
  onSelect: (a: ExtendedAttackType) => void;
}

export default function ScenarioSelector({ selectedAttack, onSelect }: Props) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#0F0F0F',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          THREAT SCENARIO
        </span>
      </div>

      <div className="scenario-grid">
        {SCENARIOS.map((sc) => {
          const sel = selectedAttack === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => onSelect(sc.id)}
              title={sc.short}
              className={`scenario-card ${sel ? 'selected' : ''}`}
              style={{
                background: sel ? '#FEF08A' : '#FAF9F5',
                border: '2px solid #0F0F0F',
                boxShadow: sel ? '3px 3px 0px #0F0F0F' : '2px 2px 0px #0F0F0F',
              }}
            >
              <div style={{ fontSize: 16, lineHeight: 1, marginBottom: 4 }}>{sc.icon}</div>
              <div style={{
                fontSize: 10.5,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#0F0F0F',
                lineHeight: 1.2,
                marginBottom: 2,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{sc.label}</div>
              <div style={{ fontSize: 9.5, color: '#444444', lineHeight: 1.3, fontFamily: "'JetBrains Mono', monospace" }}>
                {sc.short}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
