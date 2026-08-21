import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { announcementsApi } from './api/announcements'
import { dashboardApi } from './api/dashboard'
import { eventsApi } from './api/events'
import { useAuth } from './hooks/useAuth'
import { formatImageUrl } from './utils/image'
import heroImg from './assets/hero.png'
import LiveChatWidget from './components/ui/LiveChatWidget'
import ReportsPage from './pages/ReportsPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import EventsPage from './pages/EventsPage'
import ProfilePage from './pages/ProfilePage'
import UsersManagementPage from './pages/UsersManagementPage'
import KasRtPage from './pages/KasRtPage'
import { NotificationProvider } from './context/NotificationContext'
import NotificationBell from './components/ui/NotificationBell'
import ConfirmModal from './components/ui/ConfirmModal'
import { SkeletonCard, SkeletonStats } from './components/ui/Skeleton'
import { LogOut, ShieldCheck, User, Lightbulb, Megaphone, Calendar, FileText, CheckCircle2, Hourglass, MapPin, Pin, Menu, X, LayoutDashboard, Users, Wallet, ChevronRight, Grid } from 'lucide-react'

function AppShell({ children }) {
  const { user, logout, isAdmin } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const openChatbot = () => window.dispatchEvent(new Event('wc-open-chat'))

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eef4ff 100%)', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      <header className="no-print" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(15, 23, 42, 0.08)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to={user ? "/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', textDecoration: 'none' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)', fontWeight: 800 }}>WC</span>
              <span>WargaCare</span>
            </Link>
            {user && (
              <span className={`badge ${isAdmin ? 'badge-role-admin' : 'badge-role-warga'}`} style={{ fontSize: '0.725rem', padding: '0.2rem 0.65rem', borderRadius: '999px', fontWeight: 700 }}>
                {isAdmin ? 'ADMIN RT' : 'WARGA'}
              </span>
            )}
          </div>

          <nav className="desktop-nav" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {user ? (
              <>
                <NavLink to="/dashboard" style={({ isActive }) => ({ padding: '0.45rem 0.75rem', borderRadius: '999px', color: isActive ? '#2563eb' : '#475569', background: isActive ? '#eff6ff' : 'transparent', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', textDecoration: 'none' })}>
                  Dashboard
                </NavLink>
                <NavLink to="/reports" style={({ isActive }) => ({ padding: '0.45rem 0.75rem', borderRadius: '999px', color: isActive ? '#2563eb' : '#475569', background: isActive ? '#eff6ff' : 'transparent', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', textDecoration: 'none' })}>
                  {isAdmin ? 'Laporan Warga' : 'Laporan Saya'}
                </NavLink>
                {isAdmin && (
                  <NavLink to="/users" style={({ isActive }) => ({ padding: '0.45rem 0.75rem', borderRadius: '999px', color: isActive ? '#2563eb' : '#475569', background: isActive ? '#eff6ff' : 'transparent', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', textDecoration: 'none' })}>
                    Kelola Warga
                  </NavLink>
                )}
                <NavLink to="/announcements" style={({ isActive }) => ({ padding: '0.45rem 0.75rem', borderRadius: '999px', color: isActive ? '#2563eb' : '#475569', background: isActive ? '#eff6ff' : 'transparent', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', textDecoration: 'none' })}>
                  Pengumuman
                </NavLink>
                <NavLink to="/events" style={({ isActive }) => ({ padding: '0.45rem 0.75rem', borderRadius: '999px', color: isActive ? '#2563eb' : '#475569', background: isActive ? '#eff6ff' : 'transparent', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', textDecoration: 'none' })}>
                  Kegiatan
                </NavLink>
                <NavLink to="/kas" style={({ isActive }) => ({ padding: '0.45rem 0.75rem', borderRadius: '999px', color: isActive ? '#2563eb' : '#475569', background: isActive ? '#eff6ff' : 'transparent', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', textDecoration: 'none' })}>
                  Kas RT
                </NavLink>
                <NavLink to="/profile" style={({ isActive }) => ({ padding: '0.45rem 0.75rem', borderRadius: '999px', color: isActive ? '#2563eb' : '#475569', background: isActive ? '#eff6ff' : 'transparent', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', textDecoration: 'none' })}>
                  Profil
                </NavLink>
                {isAdmin && <NotificationBell />}
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem', borderRadius: '999px', border: '1px solid #fee2e2', background: '#fff5f5', fontWeight: 600, fontSize: '0.825rem', color: '#dc2626', cursor: 'pointer', marginLeft: '0.35rem', whiteSpace: 'nowrap' }}
                >
                  <LogOut size={14} /> Keluar
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" style={({ isActive }) => ({ padding: '0.45rem 0.85rem', borderRadius: '999px', color: isActive ? '#2563eb' : '#475569', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' })}>Masuk</NavLink>
                <NavLink to="/register" style={{ padding: '0.45rem 1rem', borderRadius: '999px', background: '#2563eb', color: 'white', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>Daftar</NavLink>
              </>
            )}
          </nav>

          <div className="mobile-toggle-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {user && isAdmin && <div className="mobile-notif-btn"><NotificationBell /></div>}
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 998,
              animation: 'backdropFadeIn 0.2s ease-out'
            }}
          />
          <nav
            className="mobile-drawer"
            style={{
              position: 'fixed',
              bottom: '64px',
              left: 0,
              right: 0,
              maxHeight: '82vh',
              overflowY: 'auto',
              zIndex: 999,
              background: '#ffffff',
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              padding: '1.25rem 1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              boxShadow: '0 -15px 40px rgba(15, 23, 42, 0.18)',
              animation: 'mobileSheetSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '999px', margin: '0 auto 1rem' }} />

            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.15rem', background: '#f4f8ff', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', flexShrink: 0, boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)' }}>
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.fullName || 'Warga'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                      <span>RT {user.rt || '-'}/RW {user.rw || '-'}</span> • <strong style={{ color: isAdmin ? '#2563eb' : '#475569' }}>{isAdmin ? 'ADMIN RT' : 'WARGA'}</strong>
                    </div>
                  </div>
                </div>

                <NavLink
                  onClick={() => setMobileMenuOpen(false)}
                  to="/dashboard"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '16px',
                    color: isActive ? '#2563eb' : '#1e293b',
                    background: isActive ? '#eff6ff' : 'transparent',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    border: isActive ? '1px solid #bfdbfe' : '1px solid transparent'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <LayoutDashboard size={20} style={{ color: '#2563eb' }} />
                    <span>Dashboard</span>
                  </div>
                  <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                </NavLink>

                <NavLink
                  onClick={() => setMobileMenuOpen(false)}
                  to="/reports"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '16px',
                    color: isActive ? '#2563eb' : '#1e293b',
                    background: isActive ? '#eff6ff' : 'transparent',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    border: isActive ? '1px solid #bfdbfe' : '1px solid transparent'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <FileText size={20} style={{ color: '#2563eb' }} />
                    <span>{isAdmin ? 'Laporan Warga' : 'Laporan Saya'}</span>
                  </div>
                  <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                </NavLink>

                {isAdmin && (
                  <NavLink
                    onClick={() => setMobileMenuOpen(false)}
                    to="/users"
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: '16px',
                      color: isActive ? '#2563eb' : '#1e293b',
                      background: isActive ? '#eff6ff' : 'transparent',
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.95rem',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      border: isActive ? '1px solid #bfdbfe' : '1px solid transparent'
                    })}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <Users size={20} style={{ color: '#2563eb' }} />
                      <span>Kelola Warga</span>
                    </div>
                    <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                  </NavLink>
                )}

                <NavLink
                  onClick={() => setMobileMenuOpen(false)}
                  to="/announcements"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '16px',
                    color: isActive ? '#2563eb' : '#1e293b',
                    background: isActive ? '#eff6ff' : 'transparent',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    border: isActive ? '1px solid #bfdbfe' : '1px solid transparent'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <Megaphone size={20} style={{ color: '#2563eb' }} />
                    <span>Pengumuman</span>
                  </div>
                  <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                </NavLink>

                <NavLink
                  onClick={() => setMobileMenuOpen(false)}
                  to="/events"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '16px',
                    color: isActive ? '#2563eb' : '#1e293b',
                    background: isActive ? '#eff6ff' : 'transparent',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    border: isActive ? '1px solid #bfdbfe' : '1px solid transparent'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <Calendar size={20} style={{ color: '#2563eb' }} />
                    <span>Kegiatan Warga</span>
                  </div>
                  <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                </NavLink>

                <NavLink
                  onClick={() => setMobileMenuOpen(false)}
                  to="/kas"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '16px',
                    color: isActive ? '#2563eb' : '#1e293b',
                    background: isActive ? '#eff6ff' : 'transparent',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    border: isActive ? '1px solid #bfdbfe' : '1px solid transparent'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <Wallet size={20} style={{ color: '#2563eb' }} />
                    <span>Kas RT</span>
                  </div>
                  <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                </NavLink>

                <NavLink
                  onClick={() => setMobileMenuOpen(false)}
                  to="/profile"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '16px',
                    color: isActive ? '#2563eb' : '#1e293b',
                    background: isActive ? '#eff6ff' : 'transparent',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    border: isActive ? '1px solid #bfdbfe' : '1px solid transparent'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <User size={20} style={{ color: '#2563eb' }} />
                    <span>Profil Saya</span>
                  </div>
                  <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                </NavLink>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setShowLogoutModal(true)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    padding: '0.9rem 1rem',
                    borderRadius: '20px',
                    border: '1px solid #fee2e2',
                    background: '#fff1f2',
                    fontWeight: 800,
                    fontSize: '0.975rem',
                    color: '#e11d48',
                    cursor: 'pointer',
                    marginTop: '0.75rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <LogOut size={19} /> Keluar Akun
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.5rem 0' }}>
                <NavLink onClick={() => setMobileMenuOpen(false)} to="/login" style={{ padding: '0.85rem 1rem', textAlign: 'center', borderRadius: '16px', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>Masuk</NavLink>
                <NavLink onClick={() => setMobileMenuOpen(false)} to="/register" style={{ padding: '0.85rem 1rem', textAlign: 'center', borderRadius: '16px', background: '#2563eb', color: 'white', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}>Daftar Akun Warga</NavLink>
              </div>
            )}
          </nav>
        </>
      )}

      <main style={{ flex: 1 }}>{children}</main>
      <div className="mobile-bottom-nav-spacer" />
      <nav className="mobile-bottom-nav">
        <NavLink
          to={user ? "/dashboard" : "/"}
          onClick={() => setMobileMenuOpen(false)}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            flex: 1,
            height: '100%',
            color: isActive && !mobileMenuOpen ? '#2563eb' : '#64748b',
            fontWeight: isActive && !mobileMenuOpen ? 700 : 600,
            fontSize: '0.725rem',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          })}
        >
          <LayoutDashboard size={20} />
          <span>Beranda</span>
        </NavLink>

        <NavLink
          to="/announcements"
          onClick={() => setMobileMenuOpen(false)}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            flex: 1,
            height: '100%',
            color: isActive && !mobileMenuOpen ? '#2563eb' : '#64748b',
            fontWeight: isActive && !mobileMenuOpen ? 700 : 600,
            fontSize: '0.725rem',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          })}
        >
          <Megaphone size={20} />
          <span>Pengumuman</span>
        </NavLink>

        {/* Elevated Floating Center Action Button (FAB) */}
        <NavLink
          to="/reports"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            height: '100%',
            textDecoration: 'none',
            position: 'relative',
            zIndex: 10,
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        >
          {({ isActive }) => {
            const activeState = isActive && !mobileMenuOpen
            return (
              <>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'translateY(-14px)',
                    boxShadow: activeState ? '0 10px 28px rgba(37, 99, 235, 0.65)' : '0 8px 22px rgba(37, 99, 235, 0.45)',
                    border: '4px solid #ffffff',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <FileText size={22} />
                </div>
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: activeState ? 800 : 600,
                    color: activeState ? '#2563eb' : '#475569',
                    transform: 'translateY(-10px)',
                    lineHeight: 1
                  }}
                >
                  Laporan
                </span>
              </>
            )
          }}
        </NavLink>

        <NavLink
          to="/events"
          onClick={() => setMobileMenuOpen(false)}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            flex: 1,
            height: '100%',
            color: isActive && !mobileMenuOpen ? '#2563eb' : '#64748b',
            fontWeight: isActive && !mobileMenuOpen ? 700 : 600,
            fontSize: '0.725rem',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          })}
        >
          <Calendar size={20} />
          <span>Kegiatan</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(prev => !prev)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            flex: 1,
            height: '100%',
            background: 'none',
            border: 'none',
            color: mobileMenuOpen ? '#2563eb' : '#64748b',
            fontWeight: mobileMenuOpen ? 700 : 600,
            fontSize: '0.725rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Grid size={20} />}
          <span>{mobileMenuOpen ? 'Tutup' : 'Menu'}</span>
        </button>
      </nav>

      <footer className="no-print" style={{ borderTop: '1px solid rgba(15, 23, 42, 0.06)', background: 'white', padding: '1.75rem 1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span>© {new Date().getFullYear()} WargaCare — Platform Komunikasi RT/RW Terpadu</span>
          <span style={{ fontSize: '0.85rem' }}>Siap Go-Live</span>
        </div>
      </footer>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false)
          logout()
        }}
        title="Keluar dari Akun?"
        message="Apakah Anda yakin ingin keluar dari WargaCare? Anda perlu login kembali untuk mengakses aplikasi."
        confirmText="Ya, Keluar"
        icon={LogOut}
        variant="danger"
      />
      <div className="no-print">
        <LiveChatWidget isMobileMenuOpen={mobileMenuOpen} />
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <ScreenState title="Memuat akun Anda" description="Harap tunggu sebentar." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function ScreenState({ title, description }) {
  return (
    <section style={{ maxWidth: '720px', margin: '0 auto', padding: '5rem 1.25rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{title}</h1>
      <p style={{ color: '#64748b', fontSize: '1rem' }}>{description}</p>
    </section>
  )
}

function LandingPage() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const openChatbot = () => window.dispatchEvent(new Event('wc-open-chat'))

  useEffect(() => {
    if (user) return
    const fetchPublicData = async () => {
      try {
        const [annRes, evRes] = await Promise.all([
          announcementsApi.getAll(0, 3),
          eventsApi.getUpcoming(0, 3),
        ])
        const annContent = annRes?.data?.content || annRes?.content || annRes?.data || []
        const evContent = evRes?.data?.content || evRes?.content || evRes?.data || []
        setAnnouncements(Array.isArray(annContent) ? annContent : [])
        setEvents(Array.isArray(evContent) ? evContent : [])
      } catch (err) {
        console.warn('Gagal memuat data publik landing page:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPublicData()
  }, [user])

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '3.5rem 1.25rem 5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
        <div>
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', borderRadius: '999px', background: '#dbeafe', color: '#1d4ed8', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem' }}>
            <CheckCircle2 size={14} /> Platform Komunikasi RT/RW Terintegrasi
          </p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', lineHeight: 1.15, marginBottom: '1.2rem', fontWeight: 800 }}>
            Kelola Pengumuman, Agenda Kegiatan & Pengaduan Warga Secara Real-Time.
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#475569', marginBottom: '1.75rem', lineHeight: '1.6' }}>
            WargaCare membantu warga menyampaikan aspirasi dan kendala lingkungan, serta mempermudah pengurus RT/RW dalam publikasi pengumuman & jadwal kerja bakti.
          </p>
          <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: '#2563eb', color: 'white', fontWeight: 700, boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)' }}>
              Mulai Daftar Akun Warga
            </Link>
            <Link to="/login" style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 700 }}>
              Masuk ke Akun
            </Link>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '28px', padding: '1.5rem', boxShadow: '0 25px 70px rgba(15, 23, 42, 0.08)', border: '1px solid #f1f5f9' }}>
          <img src={heroImg} alt="WargaCare App Preview" style={{ width: '100%', maxWidth: '440px', margin: '0 auto', display: 'block' }} />
        </div>
      </div>

      <div style={{ marginTop: '4.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Publikasi Resmi</span>
            <h2 style={{ fontSize: '1.75rem', margin: '0.2rem 0 0', fontWeight: 800 }}>Pengumuman RT/RW Terbaru</h2>
          </div>
          <Link to="/announcements" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.95rem' }}>
            Lihat Semua Pengumuman →
          </Link>
        </div>

        {announcements.length === 0 ? (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1' }}>
            Belum ada pengumuman terbaru saat ini.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {announcements.map((item, idx) => (
              <div
                key={item.id || item.title || idx}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '1.4rem',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
                  border: item.isPinned ? '1px solid #fde68a' : '1px solid #f1f5f9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} style={{ color: '#2563eb' }} />
                    {(item.eventDate || item.date) ? `Pelaksanaan: ${new Date(item.eventDate || item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` : (item.createdAt ? `Diterbitkan: ${new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Terbaru')}
                  </span>
                  {item.isPinned && (
                    <span className="badge badge-pinned" style={{ fontSize: '0.75rem' }}>Disematkan</span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.15rem', margin: 0, color: '#0f172a' }}>{item.title}</h3>
                {item.location && (
                  <span style={{ fontSize: '0.8rem', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={13} style={{ color: '#ef4444' }} /> {item.location}
                  </span>
                )}
                <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agenda Warga</span>
            <h2 style={{ fontSize: '1.75rem', margin: '0.2rem 0 0', fontWeight: 800 }}>Jadwal Kegiatan & Gotong Royong</h2>
          </div>
          <Link to="/events" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.95rem' }}>
            Lihat Semua Kegiatan →
          </Link>
        </div>

        {events.length === 0 ? (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1' }}>
            Belum ada agenda mendatang saat ini.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {events.map((item, idx) => {
              const eventDateObj = item.eventDate ? new Date(item.eventDate) : null
              return (
                <div
                  key={item.id || item.title || idx}
                  style={{
                    background: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                {/* Banner Image (Always rendered with fallback image) */}
                <div style={{ padding: '0.85rem 0.85rem 0 0.85rem' }}>
                  <div style={{
                    aspectRatio: '16 / 9',
                    maxHeight: '260px',
                    width: '100%',
                    overflow: 'hidden',
                    position: 'relative',
                    borderRadius: '16px',
                    background: '#0f172a'
                  }}>
                    <img
                      src={item.imageUrl ? formatImageUrl(item.imageUrl) : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.05) 50%, rgba(0, 0, 0, 0) 100%)',
                      pointerEvents: 'none',
                    }} />
                    
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '10px',
                      color: '#1e40af',
                      fontWeight: 700,
                      fontSize: '0.775rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      zIndex: 2,
                    }}>
                      <Calendar size={13} style={{ color: '#2563eb' }} />
                      <span>{eventDateObj ? eventDateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Mendatang'}</span>
                    </div>
                  </div>
                </div>

                  <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a', lineHeight: 1.35 }}>{item.title}</h3>

                    {item.location && (
                      <div style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={15} style={{ color: '#ef4444' }} />
                        <span>{item.location}</span>
                      </div>
                    )}

                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function AuthForm({ mode }) {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'WARGA' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register({ fullName: form.name, email: form.email, password: form.password, role: form.role })
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || 'Gagal memproses akun. Coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemoAdmin = () => {
    setForm((prev) => ({ ...prev, email: 'admin@wargacare.id', password: 'admin123' }))
  }

  const fillDemoWarga = () => {
    setForm((prev) => ({ ...prev, email: 'warga@wargacare.id', password: 'warga123' }))
  }

  return (
    <section style={{ maxWidth: '460px', margin: '0 auto', padding: '4rem 1.25rem 5rem' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)', border: '1px solid #f1f5f9' }}>
        <h1 style={{ marginBottom: '0.45rem', fontSize: '1.8rem', fontWeight: 800 }}>
          {mode === 'login' ? 'Masuk ke WargaCare' : 'Buat Akun Baru'}
        </h1>
        <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          {mode === 'login' ? 'Gunakan email dan kata sandi Anda untuk melanjutkan.' : 'Daftarkan akun Anda untuk mengakses portal RT/RW.'}
        </p>

        {mode === 'login' && (
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.6rem' }}>
              <Lightbulb size={14} style={{ color: '#eab308' }} /> Uji Coba Cepat (Demo Account):
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={fillDemoAdmin}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.55rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}
              >
                <ShieldCheck size={15} /> Demo Admin RT
              </button>
              <button
                type="button"
                onClick={fillDemoWarga}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.55rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}
              >
                <User size={15} /> Demo Warga
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.875rem' }}>Nama Lengkap</label>
                <input
                  required
                  placeholder="Nama lengkap sesuai KTP"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.875rem' }}>Daftar Sebagai</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="WARGA">Warga Biasa (Warga RT/RW)</option>
                  <option value="ADMIN_RT">Admin RT (Pengurus RT/RW)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.875rem' }}>Alamat Email</label>
            <input
              required
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.875rem' }}>Kata Sandi</label>
            <input
              required
              type="password"
              placeholder="Kata sandi (minimal 8 karakter)"
              minLength={8}
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              style={inputStyle}
            />
          </div>

          {error ? <div style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem' }}>{error}</div> : null}

          <button type="submit" disabled={loading} style={{ padding: '0.9rem 1rem', borderRadius: '999px', background: '#2563eb', color: 'white', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)' }}>
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar Sekarang'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
            {mode === 'login' ? (
              <span>Belum punya akun? <Link to="/register" style={{ color: '#2563eb', fontWeight: 700 }}>Daftar di sini</Link></span>
            ) : (
              <span>Sudah punya akun? <Link to="/login" style={{ color: '#2563eb', fontWeight: 700 }}>Masuk di sini</Link></span>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}

function DashboardPage() {
  const { user, logout, isAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const promises = [
          announcementsApi.getAll(0, 5).catch(() => null),
          eventsApi.getUpcoming(0, 5).catch(() => null),
          isAdmin ? dashboardApi.getStats().catch(() => null) : dashboardApi.getMyStats().catch(() => null)
        ]

        const [announcementRes, eventRes, statsRes] = await Promise.all(promises)

        if (statsRes) {
          setStats(statsRes?.data || statsRes)
        }

        const annContent = announcementRes?.data?.content || announcementRes?.content || announcementRes?.data || []
        const evtContent = eventRes?.data?.content || eventRes?.content || eventRes?.data || []

        setAnnouncements(Array.isArray(annContent) ? annContent : [])
        setEvents(Array.isArray(evtContent) ? evtContent : [])
      } catch (err) {
        setError(err?.message || 'Gagal memuat data dashboard.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAdmin])

  if (loading) {
    return (
      <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
        <SkeletonStats count={4} />
        <SkeletonCard count={2} />
      </section>
    )
  }

  return (
    <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        <div>
          <span className={`badge ${isAdmin ? 'badge-role-admin' : 'badge-role-warga'}`} style={{ marginBottom: '0.4rem' }}>
            {isAdmin ? 'Mode Pengurus Admin RT' : 'Portal Informasi Warga'}
          </span>
          <h1 style={{ fontSize: '1.9rem', margin: '0.2rem 0 0.35rem' }}>Selamat datang, {user?.fullName || user?.name || user?.email || 'Warga'}</h1>
          <p style={{ color: '#64748b' }}>Ringkasan statistik dan kabar terkini di lingkungan RT/RW Anda.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/reports" style={{ padding: '0.75rem 1.25rem', borderRadius: '999px', background: '#2563eb', color: 'white', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(37,99,235,0.2)' }}>
            {isAdmin ? 'Kelola Laporan Warga' : '+ Buat Laporan Pengaduan'}
          </Link>
        </div>
      </div>

      {error ? <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.9rem 1rem', borderRadius: '14px', marginBottom: '1rem' }}>{error}</div> : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Pengumuman Aktif', value: stats?.totalPengumuman ?? announcements.length, icon: <Megaphone size={28} style={{ color: '#8b5cf6' }} /> },
          { label: 'Acara Mendatang', value: stats?.totalKegiatan ?? events.length, icon: <Calendar size={28} style={{ color: '#3b82f6' }} /> },
          { label: isAdmin ? 'Total Laporan Masuk' : 'Laporan Selesai', value: isAdmin ? (stats?.totalLaporan ?? '—') : (stats?.totalLaporanSelesai ?? '—'), icon: isAdmin ? <FileText size={28} style={{ color: '#10b981' }} /> : <CheckCircle2 size={28} style={{ color: '#10b981' }} /> },
          { label: 'Laporan Menunggu', value: stats?.totalLaporanPending ?? '—', icon: <Hourglass size={28} style={{ color: '#f59e0b' }} /> },
        ].map((card) => (
          <div key={card.label} style={{ background: 'white', borderRadius: '20px', padding: '1.25rem', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{card.label}</p>
              <h2 style={{ fontSize: '1.6rem', marginTop: '0.2rem', marginBottom: 0, color: '#0f172a' }}>{card.value}</h2>
            </div>
            <span style={{ fontSize: '1.8rem', opacity: 0.8 }}>{card.icon}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <section style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Pengumuman Terbaru</h3>
            <Link to="/announcements" style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.9rem' }}>Lihat Semua →</Link>
          </div>
          {announcements.length === 0 ? (
            <p style={{ color: '#64748b' }}>Belum ada pengumuman.</p>
          ) : (
            announcements.slice(0, 4).map((item) => {
              const displayDate = item.eventDate || item.date || item.createdAt;
              return (
                <div key={item.id || item.title} style={{ padding: '0.85rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {item.isPinned && (
                        <span className="badge badge-pinned" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Pin size={11} /> Pinned
                        </span>
                      )}
                      <strong style={{ color: '#0f172a' }}>{item.title}</strong>
                    </div>
                    {displayDate && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(displayDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.content}
                  </p>
                </div>
              );
            })
          )}
        </section>

        <section style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Agenda Kegiatan</h3>
            <Link to="/events" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.9rem' }}>Lihat Semua →</Link>
          </div>
          {events.length === 0 ? (
            <p style={{ color: '#64748b' }}>Belum ada kegiatan mendatang.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.slice(0, 4).map((item) => (
                <div
                  key={item.id || item.title}
                  style={{
                    display: 'flex',
                    gap: '0.85rem',
                    alignItems: 'center',
                    padding: '0.75rem',
                    borderRadius: '16px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Event Thumbnail Image (Always rendered with fallback) */}
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      position: 'relative',
                      background: '#0f172a'
                    }}
                  >
                    <img
                      src={item.imageUrl ? formatImageUrl(item.imageUrl) : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>

                  {/* Event Info */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <strong style={{ color: '#0f172a', fontSize: '0.95rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.title}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#2563eb', background: '#eff6ff', padding: '0.25rem 0.6rem', borderRadius: '8px', fontWeight: 700, flexShrink: 0, border: '1px solid #dbeafe' }}>
                        {item.eventDate ? new Date(item.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Agenda'}
                      </span>
                    </div>

                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.825rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description || item.location || 'Agenda kegiatan warga RT/RW.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

function App() {
  return (
    <NotificationProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthForm mode="login" />} />
          <Route path="/register" element={<AuthForm mode="register" />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersManagementPage /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
          <Route path="/kas" element={<ProtectedRoute><KasRtPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </AppShell>
    </NotificationProvider>
  )
}

const inputStyle = {
  width: '100%',
  padding: '0.8rem 1rem',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  outline: 'none',
  fontSize: '0.95rem',
}

export default App
