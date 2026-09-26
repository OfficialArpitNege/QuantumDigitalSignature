import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  verdict: 'ACCEPT' | 'REJECT' | null;
  attackType?: string;
  reason?: string;
  onViewAnalysis?: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  onClose,
  verdict,
  attackType,
  reason,
  onViewAnalysis,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !verdict) return null;

  const isAccept = verdict === 'ACCEPT';

  const handleViewAnalysis = () => {
    onClose();
    if (onViewAnalysis) {
      onViewAnalysis();
    } else {
      navigate('/simulator/analysis');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        animation: 'qds-fade-in 0.25s ease-out',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#FAF9F5',
          border: '2px solid #0F0F0F',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25), 6px 6px 0px #0F0F0F',
          padding: '32px 28px 28px 28px',
          position: 'relative',
          color: '#0F0F0F',
          textAlign: 'center',
          animation: 'qds-scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            fontSize: '18px',
            fontWeight: 700,
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px 8px',
            lineHeight: 1,
          }}
          title="Close modal"
        >
          ✕
        </button>

        {/* Status Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            margin: '0 auto 18px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            background: isAccept ? '#DCFCE7' : '#FEE2E2',
            border: `2px solid ${isAccept ? '#166534' : '#DC2626'}`,
            color: isAccept ? '#166534' : '#DC2626',
            boxShadow: `0 4px 14px ${isAccept ? 'rgba(22, 101, 52, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`,
          }}
        >
          {isAccept ? '✓' : '✕'}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            margin: '0 0 10px 0',
            fontFamily: "'Space Grotesk', sans-serif",
            color: isAccept ? '#166534' : '#DC2626',
            textTransform: 'uppercase',
          }}
        >
          {isAccept ? 'MESSAGE ACCEPTED' : 'MESSAGE REJECTED'}
        </h3>

        {/* Details / Attack Info */}
        <div
          style={{
            background: isAccept ? '#F0FDF4' : '#FEF2F2',
            border: `1.5px solid ${isAccept ? '#BBF7D0' : '#FECACA'}`,
            borderRadius: '8px',
            padding: '14px 16px',
            margin: '16px 0 24px 0',
            textAlign: 'left',
          }}
        >
          {isAccept ? (
            <div style={{ fontSize: '13px', color: '#166534', fontWeight: 600, lineHeight: 1.5 }}>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.06em', marginBottom: '4px', color: '#15803D' }}>
                SECURITY VERIFICATION: PASSED
              </div>
              No attack detected across quantum channels. All deterministic verification gates passed clean.
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: '#991B1B', fontWeight: 600, lineHeight: 1.5 }}>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.06em', marginBottom: '4px', color: '#DC2626' }}>
                ATTACK DETECTED
              </div>
              <div style={{ marginBottom: '4px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                Attack Type: <span style={{ color: '#DC2626' }}>{attackType || 'Quantum Channel Interception'}</span>
              </div>
              {reason && (
                <div style={{ fontSize: '12px', color: '#7F1D1D', marginTop: '4px', fontStyle: 'italic' }}>
                  Reason: {reason}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={handleViewAnalysis}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
              color: '#FFFFFF',
              border: '1.5px solid #0F0F0F',
              borderRadius: '6px',
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              fontFamily: "'Space Grotesk', 'JetBrains Mono', sans-serif",
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #0F0F0F',
              transition: 'transform 0.15s ease, boxShadow 0.15s ease',
            }}
            className="hover:opacity-95"
          >
            VIEW ANALYSIS →
          </button>
        </div>
      </div>
    </div>
  );
};
