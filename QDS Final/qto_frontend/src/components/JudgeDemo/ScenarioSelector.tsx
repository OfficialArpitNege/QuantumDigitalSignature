export type ExtendedAttackType =
  | 'none'
  | 'forgery'
  | 'replay'
  | 'channel_manipulation'
  | 'impersonation'
  | 'unauthorized_verification';

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
  { id: 'unauthorized_verification', icon: '⛔', label: 'UNAUTH VERIFY', short: 'Unauthorized verification',   color: '#3b82f6', eveRole: 'Unauthorized Verification' },
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
          color: '#1fb6d6',
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          THREAT SCENARIO
        </span>
        <span style={{ fontSize: 11, color: 'var(--lab-text-sub)' }}>
          Select an attack scenario to perturb the quantum link
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
                background: sel ? sc.color : 'var(--card-bg)',
                border: `1.5px solid ${sel ? sc.color : 'var(--card-border)'}`,
                boxShadow: sel ? `0 6px 20px ${sc.color}50` : 'none',
              }}
            >
              <div style={{ fontSize: 18, lineHeight: 1, marginBottom: 4 }}>{sc.icon}</div>
              <div style={{
                fontSize: 10.5,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: sel ? '#ffffff' : 'var(--card-text)',
                lineHeight: 1.2,
                marginBottom: 2,
              }}>{sc.label}</div>
              <div style={{ fontSize: 9.5, color: sel ? 'rgba(255,255,255,0.85)' : 'var(--card-text-sub)', lineHeight: 1.3 }}>
                {sc.short}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
