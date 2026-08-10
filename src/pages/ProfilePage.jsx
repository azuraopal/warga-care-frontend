import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import ConfirmModal from '../components/ui/ConfirmModal';
import { LogOut, Crown, User, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, isAdmin } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <section style={{ maxWidth: '640px', margin: '0 auto', padding: '3rem 1.25rem 5rem' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800 }}>
            {(user?.fullName || user?.email || 'W')[0].toUpperCase()}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{user?.fullName || 'Warga'}</h1>
              <span className={`badge ${isAdmin ? 'badge-role-admin' : 'badge-role-warga'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                {isAdmin ? <Crown size={12} /> : <User size={12} />}
                {isAdmin ? 'ADMIN RT' : 'WARGA'}
              </span>
            </div>
            <p style={{ color: '#64748b', margin: '0.2rem 0 0', fontSize: '0.95rem' }}>{user?.email}</p>
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Informasi Warga & Wilayah</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.825rem', color: '#64748b', display: 'block' }}>Wilayah RT</span>
            <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{user?.rt || '—'}</strong>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.825rem', color: '#64748b', display: 'block' }}>Wilayah RW</span>
            <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{user?.rw || '—'}</strong>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.825rem', color: '#64748b', display: 'block' }}>Nomor Telepon</span>
            <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{user?.phone || '—'}</strong>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.825rem', color: '#64748b', display: 'block' }}>Alamat Lengkap</span>
            <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{user?.address || '—'}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.85rem', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
            <CheckCircle2 size={16} /> Status Akun: Aktif
          </span>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              padding: '0.75rem 1.35rem',
              borderRadius: '999px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} /> Keluar dari Akun
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
        title="Keluar dari Akun?"
        message="Apakah Anda yakin ingin keluar dari WargaCare? Anda perlu login kembali untuk mengakses aplikasi."
        confirmText="Ya, Keluar"
        icon={LogOut}
        variant="danger"
      />
    </section>
  );
}
