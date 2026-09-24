export default function WargaCareLogo({ size = 34, showText = true, textVariant = 'dark' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, borderRadius: '9px', boxShadow: '0 2px 8px rgba(30, 64, 175, 0.18)' }}
        aria-label="WargaCare Emblem"
      >
        <rect width="36" height="36" rx="9" fill="url(#wc-grad-bg)" />
        {/* Atap Pelindung / Lingkungan Warga */}
        <path
          d="M8.5 16.5L18 8.5L27.5 16.5"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Figur Warga Kiri */}
        <circle cx="13.5" cy="17" r="2.25" fill="#ffffff" />
        <path
          d="M10 25.5C10 22.8 11.8 21.2 14 21.2C15.2 21.2 16.2 21.8 16.8 22.5"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Figur Warga Kanan */}
        <circle cx="22.5" cy="17" r="2.25" fill="#93c5fd" />
        <path
          d="M19.2 22.5C19.8 21.8 20.8 21.2 22 21.2C24.2 21.2 26 22.8 26 25.5"
          stroke="#93c5fd"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Titik harmoni / gotong royong */}
        <circle cx="18" cy="24.2" r="1.4" fill="#34d399" />
        <defs>
          <linearGradient id="wc-grad-bg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e3a8a" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: textVariant === 'light' ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em' }}>
              Warga
            </span>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#2563eb', letterSpacing: '-0.02em' }}>
              Care
            </span>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', marginLeft: '3px', marginBottom: '2px', display: 'inline-block' }} />
          </div>
          <span style={{ fontSize: '0.675rem', fontWeight: 600, color: textVariant === 'light' ? '#94a3b8' : '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Portal Warga RT/RW
          </span>
        </div>
      )}
    </div>
  );
}
