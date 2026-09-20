import { useState, type ReactNode } from 'react';

interface Props {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * A single accordion row for the "Advanced Research" area. Closed by default —
 * researchers/judges expand it when they need the underlying detail, but it
 * never competes for attention with the primary simulator workspace.
 */
export default function CollapsibleSection({ title, badge, defaultOpen = false, children }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: 'var(--lab-surface-2)',
        border: '1px solid var(--lab-border)',
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}
    >
      <button
        onClick={() => setIsOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '16px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              color: '#1fb6d6',
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              display: 'inline-block',
            }}
          >
            ▸
          </span>
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              color: 'var(--lab-text)',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {title}
          </span>
        </span>

        {badge && (
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: 'rgba(124, 108, 246, 0.14)',
              color: '#7c6cf6',
              border: '1px solid rgba(124, 108, 246, 0.3)',
              padding: '2px 9px',
              borderRadius: 100,
              whiteSpace: 'nowrap',
            }}
          >
            {badge}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            padding: '0 20px 20px',
            animation: 'qds-appear 0.25s ease',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
