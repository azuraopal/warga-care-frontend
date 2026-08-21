import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../../hooks/useNotifications';
import { Bell, CheckCheck, Trash2, ExternalLink, Check, Info, X, FileText } from 'lucide-react';

function getCategoryBadgeLabel(cat) {
  const map = {
    JALAN_RUSAK: 'Jalan Rusak',
    SAMPAH: 'Pengelolaan Sampah',
    LAMPU_MATI: 'Lampu Penerangan',
    BANJIR: 'Banjir / Drainase',
    HEWAN_HILANG: 'Hewan Peliharaan',
    BANTUAN_WARGA: 'Bantuan Sosial',
    KEAMANAN: 'Keamanan',
    LAINNYA: 'Lainnya',
  };
  return map[cat] || cat || 'Laporan';
}

function formatTimeAgo(isoString) {
  if (!isoString) return 'Baru saja';
  const now = new Date();
  const past = new Date(isoString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Baru saja';
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hr lalu`;
}

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toastNotif,
    setToastNotif,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const handleNotificationClick = (item) => {
    markAsRead(item.id);
    setIsOpen(false);
    
    if (item.reportId) {
      navigate(`/reports?reportId=${item.reportId}`);
      window.dispatchEvent(new CustomEvent('wc-open-report-detail', { detail: { reportId: item.reportId } }));
    } else {
      navigate('/reports');
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: isOpen ? '1px solid #2563eb' : '1px solid #cbd5e1',
          background: isOpen ? '#eff6ff' : 'white',
          color: isOpen ? '#2563eb' : '#475569',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
          transition: 'all 0.2s ease-in-out',
        }}
        title="Pemberitahuan Laporan Warga"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              minWidth: '19px',
              height: '19px',
              padding: '0 5px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              fontSize: '0.725rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
              animation: unreadCount > 0 ? 'pulseNotif 2s infinite' : 'none',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.65rem)',
            right: '-10px',
            width: 'min(380px, 92vw)',
            maxHeight: '520px',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)',
            border: '1px solid #e2e8f0',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeInDown 0.2s ease-out',
          }}
        >
          <div
            style={{
              padding: '1.1rem 1.25rem 0.9rem',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Notifikasi Laporan
                </h3>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.55rem',
                      borderRadius: '999px',
                    }}
                  >
                    {unreadCount} Baru
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.785rem',
                    fontWeight: 700,
                    color: '#2563eb',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="Tandai semua sebagai sudah dibaca"
                >
                  <CheckCheck size={14} /> Tandai Dibaca
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  background: filter === 'ALL' ? '#2563eb' : '#e2e8f0',
                  color: filter === 'ALL' ? 'white' : '#475569',
                  cursor: 'pointer',
                }}
              >
                Semua ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('UNREAD')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  background: filter === 'UNREAD' ? '#2563eb' : '#e2e8f0',
                  color: filter === 'UNREAD' ? 'white' : '#475569',
                  cursor: 'pointer',
                }}
              >
                Belum Dibaca ({unreadCount})
              </button>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              maxHeight: '360px',
              padding: '0.35rem 0',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                }}
              >
                <Bell size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                  {filter === 'UNREAD'
                    ? 'Semua notifikasi sudah dibaca!'
                    : 'Belum ada notifikasi laporan.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    padding: '0.85rem 1.1rem',
                    borderBottom: '1px solid #f1f5f9',
                    background: item.isRead ? 'white' : '#f0f7ff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = item.isRead ? '#f8fafc' : '#e6f0fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = item.isRead ? 'white' : '#f0f7ff';
                  }}
                >
                  <div style={{ marginTop: '0.2rem', flexShrink: 0 }}>
                    {!item.isRead ? (
                      <span
                        style={{
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#2563eb',
                          boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.2)',
                        }}
                        title="Belum dibaca"
                      />
                    ) : (
                      <Check size={14} style={{ color: '#94a3b8' }} title="Sudah dibaca" />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        marginBottom: '0.2rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          color: '#2563eb',
                          background: '#dbeafe',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {getCategoryBadgeLabel(item.category)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    <h4
                      style={{
                        margin: '0.2rem 0',
                        fontSize: '0.875rem',
                        fontWeight: item.isRead ? 600 : 800,
                        color: '#0f172a',
                        lineHeight: 1.35,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.title}
                    </h4>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.35rem',
                        fontSize: '0.785rem',
                        color: '#64748b',
                      }}
                    >
                      <span>Pelapor: <strong>{item.reporterName}</strong></span>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 600,
                          color: item.isRead ? '#94a3b8' : '#2563eb',
                        }}
                      >
                        {item.isRead ? 'Sudah Dibaca' : 'Belum Dibaca'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      padding: '0.2rem',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
                    title="Hapus notifikasi"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderTop: '1px solid #f1f5f9',
              background: '#f8fafc',
              textAlign: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/reports');
              }}
              style={{
                fontSize: '0.825rem',
                fontWeight: 700,
                color: '#2563eb',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              Lihat Semua Laporan Warga <ExternalLink size={13} />
            </button>
          </div>
        </div>
      )}

      {toastNotif && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 9999,
            maxWidth: '360px',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 15px 35px rgba(15, 23, 42, 0.2)',
            borderLeft: '5px solid #2563eb',
            padding: '1rem 1.1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            style={{
              background: '#eff6ff',
              color: '#2563eb',
              borderRadius: '10px',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={20} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.2rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                }}
              >
                Laporan Warga Baru!
              </span>
              <button
                type="button"
                onClick={() => setToastNotif(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>

            <h5
              style={{
                margin: '0 0 0.2rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#0f172a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {toastNotif.title}
            </h5>

            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              Pelapor: <strong>{toastNotif.reporterName}</strong>
            </p>

            <button
              type="button"
              onClick={() => {
                setToastNotif(null);
                navigate(`/reports?reportId=${toastNotif.reportId}`);
                window.dispatchEvent(
                  new CustomEvent('wc-open-report-detail', {
                    detail: { reportId: toastNotif.reportId },
                  })
                );
              }}
              style={{
                marginTop: '0.5rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                background: '#2563eb',
                color: 'white',
                fontSize: '0.775rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Buka Detail Laporan
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseNotif {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); box-shadow: 0 0 12px rgba(239, 68, 68, 0.7); }
          100% { transform: scale(1); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
