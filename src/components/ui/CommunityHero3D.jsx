export default function CommunityHero3D({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 520 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '100%', height: 'auto', display: 'block', ...style }}
      role="img"
      aria-label="Ilustrasi 3D Kolaborasi Warga dan Pengurus RT WargaCare"
    >
      <defs>
        {/* Soft 3D Lighting Gradients */}
        <linearGradient id="groundGrad" x1="260" y1="230" x2="260" y2="330" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f1f5f9" />
          <stop offset="1" stopColor="#e2e8f0" />
        </linearGradient>

        <linearGradient id="primaryBlueGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>

        <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="amberGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="houseWallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#e2e8f0" />
        </linearGradient>

        <linearGradient id="roofGrad1" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>

        <linearGradient id="roofGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#0284c7" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>

        <linearGradient id="skinGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>

        <linearGradient id="skinGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fed7aa" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>

        <linearGradient id="glassPill" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#f8fafc" stopOpacity="0.85" />
        </linearGradient>

        {/* 3D Shadows */}
        <filter id="soft3DShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.12" />
        </filter>

        <filter id="badgeShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#1e40af" floodOpacity="0.16" />
        </filter>

        <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#dc2626" floodOpacity="0.25" />
        </filter>
        {/* Subtle, organic 3D float keyframes */}
        <style>{`
          @keyframes heroFloatA {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-7px); }
          }
          @keyframes heroFloatB {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          @keyframes heroFloatC {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          @keyframes pinBob {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          @keyframes checkPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
          .anim-badge-1 {
            animation: heroFloatA 4.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
            will-change: transform;
          }
          .anim-badge-2 {
            animation: heroFloatB 5.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) 0.8s infinite;
            will-change: transform;
          }
          .anim-badge-3 {
            animation: heroFloatC 5.0s cubic-bezier(0.45, 0.05, 0.55, 0.95) 1.5s infinite;
            will-change: transform;
          }
          .anim-pin {
            animation: pinBob 3.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
            will-change: transform;
          }
          .anim-check {
            animation: checkPulse 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
            transform-origin: 15px 24px;
            will-change: transform;
          }
          @media (prefers-reduced-motion: reduce) {
            .anim-badge-1, .anim-badge-2, .anim-badge-3, .anim-pin, .anim-check {
              animation: none !important;
            }
          }
        `}</style>
      </defs>
      {/* 3D Base Platform / Ground Island */}
      <g filter="url(#soft3DShadow)">
        <ellipse cx="260" cy="275" rx="220" ry="50" fill="url(#groundGrad)" />
        <ellipse cx="260" cy="270" rx="210" ry="44" fill="#ffffff" />
        {/* Subtle grass circle in platform */}
        <ellipse cx="260" cy="270" rx="195" ry="38" fill="#f8fafc" />
        <ellipse cx="260" cy="272" rx="170" ry="28" fill="#eff6ff" opacity="0.6" />
      </g>

      {/* Background Neighborhood Houses (Lingkungan RT/RW 3D) */}
      <g opacity="0.95">
        {/* House Left (Background) */}
        <g transform="translate(65, 130)">
          {/* Wall */}
          <rect x="20" y="55" width="70" height="65" rx="8" fill="url(#houseWallGrad)" />
          {/* Door */}
          <rect x="45" y="85" width="20" height="35" rx="4" fill="#cbd5e1" />
          {/* Window */}
          <rect x="30" y="65" width="16" height="16" rx="3" fill="#93c5fd" opacity="0.8" />
          <rect x="64" y="65" width="16" height="16" rx="3" fill="#93c5fd" opacity="0.8" />
          {/* 3D Roof */}
          <polygon points="10,58 55,20 100,58" fill="url(#roofGrad2)" />
          <polygon points="55,20 100,58 92,62 55,24" fill="#0284c7" opacity="0.7" />
          {/* Chimney */}
          <rect x="75" y="32" width="10" height="18" rx="2" fill="#94a3b8" />
        </g>

        {/* Tree Behind Left House */}
        <g transform="translate(38, 145)">
          <rect x="18" y="55" width="8" height="30" rx="3" fill="#92400e" opacity="0.8" />
          <circle cx="22" cy="45" r="26" fill="#10b981" />
          <circle cx="28" cy="38" r="18" fill="#34d399" opacity="0.85" />
          <circle cx="16" cy="50" r="14" fill="#059669" opacity="0.7" />
        </g>

        {/* House Right (Background) */}
        <g transform="translate(365, 125)">
          {/* Wall */}
          <rect x="15" y="60" width="75" height="70" rx="8" fill="url(#houseWallGrad)" />
          {/* Door */}
          <rect x="42" y="92" width="20" height="38" rx="4" fill="#94a3b8" />
          {/* Window */}
          <rect x="25" y="70" width="18" height="18" rx="4" fill="#fef08a" />
          <rect x="67" y="70" width="15" height="18" rx="4" fill="#93c5fd" opacity="0.8" />
          {/* 3D Roof */}
          <polygon points="5,62 52,18 100,62" fill="url(#roofGrad1)" />
        </g>

        {/* Tree Right */}
        <g transform="translate(440, 155)">
          <rect x="16" y="50" width="8" height="30" rx="3" fill="#92400e" opacity="0.8" />
          <circle cx="20" cy="40" r="24" fill="#10b981" />
          <circle cx="26" cy="34" r="16" fill="#34d399" opacity="0.9" />
        </g>
      </g>

      {/* Floating 3D Map Pin / Lokasi Pengaduan */}
      <g transform="translate(115, 65)">
        <g className="anim-pin" filter="url(#pinShadow)">
          <path
            d="M28 0C12.5 0 0 12.5 0 28C0 46 24 66 26.5 68C27.3 68.7 28.7 68.7 29.5 68C32 66 56 46 56 28C56 12.5 43.5 0 28 0Z"
            fill="url(#primaryBlueGrad)"
          />
          <circle cx="28" cy="27" r="11" fill="#ffffff" />
          <circle cx="28" cy="27" r="6" fill="#1d4ed8" />
        </g>
      </g>

      {/* 3D Characters (Figures Warga & Pengurus RT) */}
      <g>
        {/* CHARACTER 1: WARGA (Holding Digital Phone with Checklist) - Left Center */}
        <g transform="translate(150, 110)">
          {/* 3D Shadow under feet */}
          <ellipse cx="45" cy="180" rx="28" ry="8" fill="#0f172a" opacity="0.12" />

          {/* Legs */}
          <rect x="30" y="130" width="13" height="48" rx="6" fill="#1e293b" />
          <rect x="47" y="130" width="13" height="48" rx="6" fill="#0f172a" />
          {/* Shoes */}
          <rect x="25" y="172" width="20" height="9" rx="4" fill="#ffffff" />
          <rect x="45" y="172" width="20" height="9" rx="4" fill="#e2e8f0" />

          {/* Body / Torso (Civic Blue Shirt 3D) */}
          <rect x="24" y="65" width="42" height="68" rx="14" fill="url(#primaryBlueGrad)" />
          {/* Collar & Tie/Badge */}
          <polygon points="40,65 45,76 50,65" fill="#ffffff" />
          <rect x="42" y="78" width="6" height="14" rx="2" fill="#93c5fd" />

          {/* Neck */}
          <rect x="39" y="52" width="12" height="16" rx="4" fill="#fed7aa" />

          {/* Head 3D */}
          <circle cx="45" cy="40" r="22" fill="#fed7aa" />
          {/* Hair 3D */}
          <path d="M23 36C23 22 34 16 48 16C58 16 67 22 67 34C67 36 62 30 56 28C50 26 38 27 31 32C27 35 24 37 23 36Z" fill="#1e293b" />
          {/* Friendly Eyes & Smile */}
          <circle cx="39" cy="38" r="2.2" fill="#0f172a" />
          <circle cx="51" cy="38" r="2.2" fill="#0f172a" />
          <path d="M41 45C43 48 47 48 49 45" stroke="#9a3412" strokeWidth="1.8" strokeLinecap="round" />
          {/* Cheerful blush */}
          <circle cx="35" cy="42" r="3" fill="#fca5a5" opacity="0.6" />
          <circle cx="55" cy="42" r="3" fill="#fca5a5" opacity="0.6" />

          {/* Left Arm holding phone forward */}
          <rect x="52" y="75" width="28" height="11" rx="5" transform="rotate(25 52 75)" fill="#2563eb" />
          <circle cx="76" cy="88" r="6" fill="#fed7aa" />

          {/* 3D Smartphone Device with Civic App UI */}
          <g transform="translate(68, 62) rotate(-8)" filter="url(#badgeShadow)">
            <rect x="0" y="0" width="30" height="52" rx="6" fill="#0f172a" />
            <rect x="2" y="2" width="26" height="48" rx="4" fill="#ffffff" />
            {/* Screen content: WargaCare Report Success */}
            <rect x="5" y="6" width="20" height="5" rx="2" fill="#2563eb" />
            <g className="anim-check">
              <circle cx="15" cy="24" r="9" fill="#dcfce7" />
              <path d="M12 24L14.5 26.5L18.5 21.5" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <rect x="8" y="43" width="14" height="2.5" rx="1" fill="#94a3b8" />
          </g>

          {/* Right Arm resting */}
          <rect x="15" y="75" width="12" height="36" rx="6" fill="#1d4ed8" />
          <circle cx="21" cy="112" r="6" fill="#fed7aa" />
        </g>

        {/* CHARACTER 2: PENGURUS RT / ADMIN (Holding Verified Clipboard) - Right Center */}
        <g transform="translate(265, 100)">
          {/* 3D Shadow under feet */}
          <ellipse cx="50" cy="190" rx="30" ry="8" fill="#0f172a" opacity="0.12" />

          {/* Legs */}
          <rect x="34" y="140" width="14" height="50" rx="6" fill="#334155" />
          <rect x="52" y="140" width="14" height="50" rx="6" fill="#1e293b" />
          {/* Shoes */}
          <rect x="28" y="184" width="22" height="9" rx="4" fill="#0f172a" />
          <rect x="50" y="184" width="22" height="9" rx="4" fill="#0f172a" />

          {/* Body / Torso (Emerald Green Vest / Polo for RT Service) */}
          <rect x="26" y="70" width="48" height="74" rx="14" fill="url(#emeraldGrad)" />
          {/* ID Badge on Chest */}
          <rect x="33" y="80" width="13" height="16" rx="2" fill="#ffffff" />
          <rect x="35" y="83" width="9" height="3" rx="1" fill="#2563eb" />
          <rect x="35" y="88" width="9" height="2" rx="0.8" fill="#64748b" />
          <circle cx="39.5" cy="77" r="1.5" fill="#334155" />

          {/* Neck */}
          <rect x="44" y="56" width="12" height="18" rx="4" fill="#fde047" />

          {/* Head 3D */}
          <circle cx="50" cy="44" r="23" fill="#fde047" />
          {/* Glasses 3D */}
          <rect x="38" y="40" width="10" height="9" rx="2" stroke="#1e293b" strokeWidth="2" fill="none" />
          <rect x="52" y="40" width="10" height="9" rx="2" stroke="#1e293b" strokeWidth="2" fill="none" />
          <line x1="48" y1="44" x2="52" y2="44" stroke="#1e293b" strokeWidth="2" />
          {/* Hair 3D with peci/cap or neat haircut */}
          <path d="M28 38C28 24 38 18 52 18C64 18 72 24 72 38C68 32 60 28 50 28C40 28 32 32 28 38Z" fill="#334155" />
          {/* Friendly Eyes & Warm Smile */}
          <circle cx="43" cy="44" r="2" fill="#0f172a" />
          <circle cx="57" cy="44" r="2" fill="#0f172a" />
          <path d="M46 51C48 54 52 54 54 51" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />

          {/* Left Arm holding clipboard forward */}
          <rect x="15" y="85" width="24" height="12" rx="6" transform="rotate(-15 15 85)" fill="#059669" />
          <circle cx="10" cy="98" r="6" fill="#fde047" />

          {/* 3D Clipboard with RT Verification */}
          <g transform="translate(-16, 75) rotate(12)" filter="url(#badgeShadow)">
            <rect x="0" y="0" width="38" height="52" rx="4" fill="#b45309" />
            <rect x="12" y="-3" width="14" height="6" rx="2" fill="#94a3b8" />
            <rect x="3" y="6" width="32" height="42" rx="3" fill="#ffffff" />
            {/* Checklist lines */}
            <circle cx="9" cy="14" r="3" fill="#10b981" />
            <rect x="15" y="13" width="16" height="2.5" rx="1" fill="#334155" />
            <circle cx="9" cy="22" r="3" fill="#10b981" />
            <rect x="15" y="21" width="16" height="2.5" rx="1" fill="#334155" />
            <circle cx="9" cy="30" r="3" fill="#2563eb" />
            <rect x="15" y="29" width="16" height="2.5" rx="1" fill="#334155" />
            {/* Official Stamp */}
            <circle cx="26" cy="38" r="5" stroke="#ef4444" strokeWidth="1.2" fill="none" opacity="0.8" />
          </g>

          {/* Right Arm giving thumbs up / wave */}
          <g transform="translate(68, 72) rotate(-35)">
            <rect x="0" y="0" width="26" height="12" rx="6" fill="#059669" />
            <circle cx="26" cy="6" r="6" fill="#fde047" />
            {/* Thumb */}
            <rect x="24" y="-3" width="5" height="7" rx="2.5" fill="#fde047" />
          </g>
        </g>
      </g>

      {/* Floating 3D Civic Badges (Real WargaCare context) */}
      {/* Badge 1: Pengaduan Terverifikasi (Top Right) */}
      <g transform="translate(340, 48)">
        <g className="anim-badge-1" filter="url(#badgeShadow)">
          <rect x="0" y="0" width="155" height="38" rx="19" fill="url(#glassPill)" stroke="#bfdbfe" strokeWidth="1" />
          <circle cx="19" cy="19" r="11" fill="#dbeafe" />
          <path d="M14 19L17.5 22.5L24 16" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="36" y="17" fill="#0f172a" fontSize="10" fontWeight="700" fontFamily="sans-serif">Laporan Warga</text>
          <text x="36" y="28" fill="#16a34a" fontSize="9" fontWeight="600" fontFamily="sans-serif">Ditanggapi Cepat</text>
        </g>
      </g>

      {/* Badge 2: Kas RT Transparan (Bottom Left) */}
      <g transform="translate(35, 230)">
        <g className="anim-badge-2" filter="url(#badgeShadow)">
          <rect x="0" y="0" width="145" height="36" rx="18" fill="url(#glassPill)" stroke="#bbf7d0" strokeWidth="1" />
          <circle cx="18" cy="18" r="10" fill="#dcfce7" />
          <text x="14" y="22" fill="#059669" fontSize="12" fontWeight="800" fontFamily="sans-serif">Rp</text>
          <text x="34" y="16" fill="#0f172a" fontSize="10" fontWeight="700" fontFamily="sans-serif">Iuran Kas RW</text>
          <text x="34" y="27" fill="#059669" fontSize="9" fontWeight="600" fontFamily="sans-serif">100% Terbuka</text>
        </g>
      </g>

      {/* Badge 3: Agenda Gotong Royong (Bottom Right) */}
      <g transform="translate(345, 235)">
        <g className="anim-badge-3" filter="url(#badgeShadow)">
          <rect x="0" y="0" width="140" height="36" rx="18" fill="url(#glassPill)" stroke="#fed7aa" strokeWidth="1" />
          <circle cx="18" cy="18" r="10" fill="#ffedd5" />
          <text x="13" y="22" fill="#ea580c" fontSize="12" fontWeight="800" fontFamily="sans-serif">★</text>
          <text x="34" y="16" fill="#0f172a" fontSize="10" fontWeight="700" fontFamily="sans-serif">Gotong Royong</text>
          <text x="34" y="27" fill="#d97706" fontSize="9" fontWeight="600" fontFamily="sans-serif">Guyub & Rukun</text>
        </g>
      </g>
    </svg>
  );
}
