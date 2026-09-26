import type { AttackType } from '../types/api';

interface Props {
  message: string;
  attack: AttackType;
  attackStrength: number;
  theta: number;
  phi: number;
  shots: number;
  maxSymbols: number;
  loading: boolean;
  onChange: (field: string, value: string | number) => void;
  onRunExperiment: () => void;
}

const ATTACK_OPTIONS: { value: AttackType; label: string; icon: string; description: string }[] = [
  { value: 'none',               label: 'No Attack',             icon: '✓', description: 'Baseline — no adversary' },
  { value: 'forgery',            label: 'Forgery',               icon: '✎', description: 'Rotates qubit phase' },
  { value: 'impersonation',      label: 'Impersonation',         icon: '👤', description: 'Replaces quantum identity' },
  { value: 'replay',             label: 'Replay',                icon: '↺', description: 'Duplicate signature reuse' },
  { value: 'channel_manipulation', label: 'Channel Manip.',      icon: '∿', description: 'Intercepts the channel' },
];

export default function ExperimentForm({
  message, attack, attackStrength, theta, phi, shots, maxSymbols,
  loading, onChange, onRunExperiment,
}: Props) {
  return (
    <div className="card section">
      <div style={{ marginBottom: 20 }}>
        <div className="section-label">Configuration</div>
        <div className="section-title">Experiment Setup</div>
        <div className="section-sub">Configure the quantum signature and attack simulation parameters</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Message */}
          <div className="form-group">
            <label className="form-label">Message</label>
            <input
              id="input-message"
              className="form-input form-input-wide"
              type="text"
              value={message}
              onChange={e => onChange('message', e.target.value)}
              placeholder="e.g. HELLO"
              disabled={loading}
            />
          </div>

          {/* Attack type */}
          <div className="form-group">
            <label className="form-label">Attack Type</label>
            <div className="attack-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {ATTACK_OPTIONS.map(opt => (
                <div
                  key={opt.value}
                  className={`attack-option ${attack === opt.value ? 'selected' : ''}`}
                  onClick={() => !loading && onChange('attack', opt.value)}
                  title={opt.description}
                >
                  <span className="attack-option-icon">{opt.icon}</span>
                  {opt.label}
                </div>
              ))}
            </div>
          </div>

          {/* Attack strength */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Attack Strength
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--color-primary)' }}>
                {attackStrength.toFixed(2)}
              </span>
            </label>
            <input
              id="input-attack-strength"
              type="range"
              min={0} max={1} step={0.01}
              value={attackStrength}
              onChange={e => onChange('attackStrength', parseFloat(e.target.value))}
              disabled={loading || attack === 'none' || attack === 'replay'}
              style={{ opacity: (attack === 'none' || attack === 'replay') ? 0.4 : 1 }}
            />
            {(attack === 'none' || attack === 'replay') && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Not applicable for {attack === 'none' ? 'baseline' : 'replay'} attack
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="input-theta">Theta (θ)</label>
              <input
                id="input-theta"
                className="form-input"
                type="number"
                value={theta}
                step={0.1}
                onChange={e => onChange('theta', parseFloat(e.target.value) || 0)}
                disabled={loading}
                placeholder="1.2"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="input-phi">Phi (φ)</label>
              <input
                id="input-phi"
                className="form-input"
                type="number"
                value={phi}
                step={0.1}
                onChange={e => onChange('phi', parseFloat(e.target.value) || 0)}
                disabled={loading}
                placeholder="0.7"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="input-shots">Shots</label>
              <input
                id="input-shots"
                className="form-input"
                type="number"
                value={shots}
                min={100} max={100000} step={100}
                onChange={e => onChange('shots', parseInt(e.target.value) || 2048)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="input-max-symbols">Max Symbols</label>
              <input
                id="input-max-symbols"
                className="form-input"
                type="number"
                value={maxSymbols}
                min={1} max={8}
                onChange={e => onChange('maxSymbols', parseInt(e.target.value) || 4)}
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ background: 'var(--blue-50)', border: 'var(--border-light)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue-700)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Experiment Summary
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <div>Message: <strong style={{ color: 'var(--text-primary)' }}>{message || '—'}</strong></div>
              <div>Attack: <strong style={{ color: 'var(--text-primary)' }}>{attack}</strong>{attack !== 'none' && attack !== 'replay' ? ` @ ${attackStrength.toFixed(2)}` : ''}</div>
              <div>Symbols: <strong style={{ color: 'var(--text-primary)' }}>{maxSymbols}</strong> bits × {shots} shots</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--blue-100)', display: 'flex', gap: 10 }}>
        <button
          id="btn-run-experiment"
          className="btn btn-primary btn-lg"
          onClick={onRunExperiment}
          disabled={loading || !message.trim()}
        >
          {loading ? (
            <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Running…</>
          ) : (
            '▶  Run Experiment'
          )}
        </button>
        {!message.trim() && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
            Enter a message to proceed
          </div>
        )}
      </div>
    </div>
  );
}
