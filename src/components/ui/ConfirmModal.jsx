import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  icon: IconComponent = AlertTriangle,
  variant = 'danger',
  loading = false,
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const getConfirmButtonStyle = () => {
    if (variant === 'danger') {
      return {
        background: '#dc2626',
        color: 'white',
        boxShadow: '0 8px 20px rgba(220, 38, 38, 0.25)',
      };
    }
    return {
      background: '#2563eb',
      color: 'white',
      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
    };
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center', padding: '2rem 1.5rem' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: variant === 'danger' ? '#fef2f2' : '#eff6ff',
            color: variant === 'danger' ? '#dc2626' : '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            border: variant === 'danger' ? '1px solid #fecaca' : '1px solid #bfdbfe',
          }}
        >
          {typeof IconComponent === 'function' || typeof IconComponent === 'object' ? (
            <IconComponent size={28} />
          ) : (
            IconComponent
          )}
        </div>

        <h2 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem', fontWeight: 800, color: '#0f172a' }}>{title}</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 1.75rem', lineHeight: '1.55' }}>{message}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '999px',
              border: '1px solid #cbd5e1',
              background: 'white',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              ...getConfirmButtonStyle(),
            }}
          >
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}