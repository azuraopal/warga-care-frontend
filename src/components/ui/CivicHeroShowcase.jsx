import { useState, useEffect } from 'react';
import { Clock, MapPin, Wallet, FileText, TrendingUp } from 'lucide-react';
import CommunityHero3D from './CommunityHero3D';
import { reportsApi } from '../../api/reports';
import { kasApi } from '../../api/kas';

export default function CivicHeroShowcase() {
  const [activeTab, setActiveTab] = useState('laporan'); // 'laporan' | 'kas'
  const [reportData, setReportData] = useState(null);
  const [kasData, setKasData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadShowcaseData = async () => {
      try {
        const [reportsRes, kasRes] = await Promise.all([
          reportsApi.getAll({ page: 0, size: 5 }).catch(() => null),
          kasApi.getTransactions().catch(() => null),
        ]);

        if (!isMounted) return;

        // Parse real report
        const reportsList = reportsRes?.data?.content || reportsRes?.content || reportsRes?.data || [];
        if (Array.isArray(reportsList) && reportsList.length > 0) {
          const latest = reportsList[0];
          setReportData({
            id: latest.id,
            title: latest.title || 'Laporan Pengaduan Fasilitas Lingkungan',
            category: latest.category || 'FASILITAS',
            location: latest.location || 'Wilayah RT 03 Setempat',
            status: latest.status || 'DIPROSES',
            reporterName: latest.user?.fullName || latest.user?.name || latest.reporterName || 'Warga RT',
            createdAt: latest.createdAt || new Date().toISOString(),
          });
        } else {
          setReportData({
            id: 'demo-1',
            title: 'Perbaikan Lampu Penerangan Jalan Gang 2',
            category: 'FASILITAS',
            location: 'Titik Lampu Pos Ronda RT 03',
            status: 'DIPROSES',
            reporterName: 'Budi Santoso',
            createdAt: new Date().toISOString(),
          });
        }

        // Parse real kas transactions
        const txs = kasRes?.data || [];
        if (Array.isArray(txs) && txs.length > 0) {
          let totalIncome = 0;
          let totalExpense = 0;
          let firstIncome = null;
          let firstExpense = null;

          txs.forEach((tx) => {
            const amt = Number(tx.amount) || 0;
            if (tx.type === 'INCOME') {
              totalIncome += amt;
              if (!firstIncome) firstIncome = tx;
            } else {
              totalExpense += amt;
              if (!firstExpense) firstExpense = tx;
            }
          });

          const currentBalance = totalIncome - totalExpense;
          setKasData({
            saldo: currentBalance > 0 ? currentBalance : totalIncome,
            latestIncome: firstIncome ? { title: firstIncome.title, amount: firstIncome.amount } : null,
            latestExpense: firstExpense ? { title: firstExpense.title, amount: firstExpense.amount } : null,
            totalTx: txs.length,
          });
        } else {
          setKasData({
            saldo: 14850000,
            latestIncome: { title: 'Iuran Warga Terhimpun (Bulan Ini)', amount: 1500000 },
            latestExpense: { title: 'Perawatan Lampu & Kebersihan', amount: 350000 },
            totalTx: 12,
          });
        }
      } catch (err) {
        console.warn('Gagal memuat data dinamis showcase:', err);
      }
    };

    loadShowcaseData();
    return () => { isMounted = false; };
  }, []);

  const reportStatus = reportData?.status || 'DIPROSES';
  const isDone = reportStatus === 'SELESAI';
  const isInProgress = reportStatus === 'DIPROSES';

  return (
    <div
      className="interactive-card"
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Civic Header Bar (Never wraps to 2 lines) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid #f1f5f9',
          background: '#ffffff',
          gap: '0.5rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <span
            className="pulse-dot-active"
            style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block', flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Portal Layanan RT/RW
          </span>
          <span className="civic-header-divider" style={{ color: '#cbd5e1', fontSize: '0.75rem', flexShrink: 0 }}>|</span>
          <span
            className="civic-header-sub"
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#059669',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Sistem Aktif 24 Jam
          </span>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#1d4ed8',
            background: '#eff6ff',
            padding: '0.2rem 0.5rem',
            borderRadius: '6px',
            border: '1px solid #bfdbfe',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            letterSpacing: '0.01em',
          }}
        >
          Terintegrasi Warga
        </span>
      </div>

      {/* 3D Atmosphere Showcase Banner */}
      <div
        style={{
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          padding: '0.5rem 0.75rem 0.25rem',
          borderBottom: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        <CommunityHero3D style={{ maxHeight: '220px', margin: '0 auto' }} />
      </div>

      {/* Interactive Dynamic Civic Surface */}
      <div style={{ padding: '0.9rem 1.15rem' }}>
        {/* Tab Controls */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.4rem',
            background: '#f1f5f9',
            padding: '0.25rem',
            borderRadius: '10px',
            marginBottom: '0.85rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('laporan')}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'laporan' ? '#ffffff' : 'transparent',
              color: activeTab === 'laporan' ? '#1d4ed8' : '#64748b',
              boxShadow: activeTab === 'laporan' ? '0 2px 6px rgba(15, 23, 42, 0.06)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <FileText size={14} />
            <span className="tab-desktop-text">Pengaduan Warga</span>
            <span className="tab-mobile-text">Pengaduan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kas')}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'kas' ? '#ffffff' : 'transparent',
              color: activeTab === 'kas' ? '#059669' : '#64748b',
              boxShadow: activeTab === 'kas' ? '0 2px 6px rgba(15, 23, 42, 0.06)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <Wallet size={14} />
            <span className="tab-desktop-text">Transparansi Kas RW</span>
            <span className="tab-mobile-text">Kas RW</span>
          </button>
        </div>

        {/* Tab 1: Live Dynamic Pengaduan Warga */}
        {activeTab === 'laporan' && (
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '0.85rem 1rem',
              animation: 'wcFadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
                <Clock size={12} /> Laporan Terkini {reportData?.id ? `(#${reportData.id})` : ''}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: isDone ? '#15803d' : isInProgress ? '#0369a1' : '#b45309',
                  background: isDone ? '#dcfce7' : isInProgress ? '#e0f2fe' : '#fef3c7',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  border: isDone ? '1px solid #bbf7d0' : isInProgress ? '1px solid #bae6fd' : '1px solid #fde68a',
                  whiteSpace: 'nowrap',
                }}
              >
                {isDone ? 'Selesai Tuntas' : isInProgress ? 'Sedang Ditangani' : 'Menunggu Tindak Lanjut'}
              </span>
            </div>

            <div style={{ fontWeight: 800, fontSize: '0.925rem', color: '#0f172a', marginBottom: '0.25rem', lineHeight: 1.35 }}>
              {reportData?.title || 'Perbaikan Lampu Penerangan Jalan Gang 2'}
            </div>

            <div style={{ fontSize: '0.775rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.65rem' }}>
              <MapPin size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {reportData?.location || 'Wilayah RT 03 Setempat'} • Disertai Foto Bukti
              </span>
            </div>

            {/* Dynamic Step Progress Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', marginTop: '0.4rem' }}>
              <div style={{ background: '#3b82f6', borderRadius: '4px', height: '5px' }} />
              <div style={{ background: isInProgress || isDone ? '#3b82f6' : '#e2e8f0', borderRadius: '4px', height: '5px' }} />
              <div style={{ background: isDone ? '#16a34a' : '#e2e8f0', borderRadius: '4px', height: '5px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.675rem', color: '#64748b', marginTop: '0.3rem', fontWeight: 600 }}>
              <span style={{ color: '#1d4ed8' }}>1. Laporan Masuk</span>
              <span style={{ color: isInProgress || isDone ? '#1d4ed8' : '#64748b' }}>2. Tinjau RT</span>
              <span style={{ color: isDone ? '#16a34a' : '#64748b' }}>3. Selesai</span>
            </div>
          </div>
        )}

        {/* Tab 2: Live Dynamic Kas RT */}
        {activeTab === 'kas' && (
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '0.85rem 1rem',
              animation: 'wcFadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
                <TrendingUp size={12} /> Saldo Kas RW Terbuka
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#059669',
                  background: '#dcfce7',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #bbf7d0',
                  whiteSpace: 'nowrap',
                }}
              >
                100% Terverifikasi
              </span>
            </div>

            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
              Rp {(kasData?.saldo ?? 14850000).toLocaleString('id-ID')}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.45rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem' }}>
                <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
                  + {kasData?.latestIncome?.title || 'Iuran Bulanan Warga'}
                </span>
                <strong style={{ color: '#16a34a', flexShrink: 0 }}>
                  +Rp {(kasData?.latestIncome?.amount ?? 1500000).toLocaleString('id-ID')}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem' }}>
                <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
                  - {kasData?.latestExpense?.title || 'Kebersihan & Pemeliharaan RW'}
                </span>
                <strong style={{ color: '#dc2626', flexShrink: 0 }}>
                  -Rp {(kasData?.latestExpense?.amount ?? 350000).toLocaleString('id-ID')}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* 3 Pillar Summary Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.85rem', textAlign: 'center' }}>
          <div style={{ background: '#f8fafc', padding: '0.55rem 0.4rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Kecepatan</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>Real-Time</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '0.55rem 0.4rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Akuntabilitas</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#16a34a' }}>100% Kas</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '0.55rem 0.4rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Warga Guyub</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#2563eb' }}>Rukun</div>
          </div>
        </div>
      </div>
    </div>
  );
}
