import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { usersApi } from '../api/users';
import ConfirmModal from '../components/ui/ConfirmModal';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { Crown, User, Mail, Home, Phone, Ban, CheckCircle2, Trash2, AlertCircle } from 'lucide-react';

export default function UsersManagementPage() {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [filterRole, setFilterRole] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('WARGA');
  const [submitting, setSubmitting] = useState(false);

  const [userToDelete, setUserToDelete] = useState(null);
  const [userToToggleStatus, setUserToToggleStatus] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await usersApi.getAll({
        role: filterRole || undefined,
        keyword: searchKeyword || undefined,
        page: 0,
        size: 50,
      });
      const content = res?.data?.content || res?.content || res?.data || [];
      setUsers(Array.isArray(content) ? content : []);
    } catch (err) {
      setError(err?.message || 'Gagal mengambil daftar pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, filterRole, searchKeyword]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenRoleModal = (userItem) => {
    setSelectedUser(userItem);
    setSelectedRole(userItem.role || 'WARGA');
    setShowRoleModal(true);
  };

  const handleUpdateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setError('');
    try {
      await usersApi.updateRole(selectedUser.id, selectedRole);
      setShowRoleModal(false);
      setSelectedUser(null);
      setActionMessage('Role pengguna berhasil diperbarui!');
      fetchUsers();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setError(err?.message || 'Gagal mengubah role pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!userToToggleStatus) return;
    const newStatus = !userToToggleStatus.isActive;
    setProcessingAction(true);
    try {
      await usersApi.updateStatus(userToToggleStatus.id, newStatus);
      setUserToToggleStatus(null);
      setActionMessage(`Status akun berhasil diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`);
      fetchUsers();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setError(err?.message || 'Gagal mengubah status akun.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setProcessingAction(true);
    try {
      await usersApi.delete(userToDelete.id);
      setUserToDelete(null);
      setActionMessage('Pengguna berhasil dihapus.');
      fetchUsers();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setError(err?.message || 'Gagal menghapus pengguna.');
    } finally {
      setProcessingAction(false);
    }
  };

  if (!isAdmin) {
    return (
      <section style={{ maxWidth: '640px', margin: '4rem auto', textAlign: 'center' }}>
        <h2 style={{ color: '#dc2626' }}>Akses Ditolak</h2>
        <p style={{ color: '#64748b' }}>Halaman Manajemen Pengguna hanya dapat diakses oleh Admin RT.</p>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <span className="badge badge-role-admin" style={{ marginBottom: '0.5rem' }}>
            Panel Kelola User Admin RT
          </span>
          <h1 style={{ fontSize: '1.85rem', margin: '0.2rem 0 0.35rem' }}>Manajemen Data Warga</h1>
          <p style={{ color: '#64748b' }}>Kelola daftar warga terdaftar, ubah peran (Role), dan atur hak akses akun.</p>
        </div>
      </div>

      {actionMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.85rem 1.15rem', borderRadius: '14px', marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} /> {actionMessage}
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.85rem 1.15rem', borderRadius: '14px', marginBottom: '1.25rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <SearchFilterBar
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        placeholder="Cari nama, email, RT..."
        filters={[
          {
            value: filterRole,
            onChange: setFilterRole,
            options: [
              { value: 'WARGA', label: 'Warga Biasa' },
              { value: 'ADMIN_RT', label: 'Admin RT' },
            ],
            defaultLabel: 'Semua Peran (Role)',
          },
        ]}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>Sedang mengambil data warga...</div>
      ) : users.length === 0 ? (
        <div style={{ background: 'white', padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Tidak ada warga ditemukan</h3>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
            Tidak ada pengguna terdaftar yang sesuai dengan filter pencarian.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {users.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'white',
                borderRadius: '18px',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: item.role === 'ADMIN_RT' ? '#2563eb' : '#94a3b8',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                  }}
                >
                  {(item.fullName || item.email || 'W')[0].toUpperCase()}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{item.fullName || 'Warga'}</strong>
                    <span className={`badge ${item.role === 'ADMIN_RT' ? 'badge-role-admin' : 'badge-role-warga'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {item.role === 'ADMIN_RT' ? <Crown size={12} /> : <User size={12} />}
                      {item.role === 'ADMIN_RT' ? 'ADMIN RT' : 'WARGA'}
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '999px', background: item.isActive ? '#dcfce7' : '#fee2e2', color: item.isActive ? '#166534' : '#991b1b', fontWeight: 600 }}>
                      {item.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={13} /> {item.email}</span>
                    {item.rt && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Home size={13} /> RT {item.rt}/RW {item.rw || '—'}</span>}
                    {item.phone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={13} /> {item.phone}</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleOpenRoleModal(item)}
                  style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.5rem 0.85rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  Ubah Role
                </button>

                <button
                  type="button"
                  onClick={() => setUserToToggleStatus(item)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: item.isActive ? '#fff7ed' : '#f0fdf4', color: item.isActive ? '#c2410c' : '#15803d', border: item.isActive ? '1px solid #ffedd5' : '1px solid #bbf7d0', padding: '0.5rem 0.85rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  {item.isActive ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                  {item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>

                {item.id !== currentUser?.id && (
                  <button
                    type="button"
                    onClick={() => setUserToDelete(item)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.5rem 0.85rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showRoleModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Ubah Peran (Role) Pengguna</h2>
            <p style={{ color: '#64748b', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              Ubah perizinan akses untuk: <strong>{selectedUser.fullName || selectedUser.email}</strong>
            </p>

            <form onSubmit={handleUpdateRoleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Pilih Peran Baru</label>
                <select
                  className="form-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="WARGA">WARGA (Warga Biasa)</option>
                  <option value="ADMIN_RT">Admin RT (Pengurus RT)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  style={{ padding: '0.75rem 1.25rem', borderRadius: '999px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 700 }}
                >
                  {submitting ? 'Memproses...' : 'Simpan Peran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(userToToggleStatus)}
        onClose={() => setUserToToggleStatus(null)}
        onConfirm={handleConfirmToggleStatus}
        loading={processingAction}
        title={userToToggleStatus?.isActive ? 'Nonaktifkan Akun Warga?' : 'Aktifkan Akun Warga?'}
        message={
          userToToggleStatus
            ? `Apakah Anda yakin ingin ${userToToggleStatus.isActive ? 'menonaktifkan' : 'mengaktifkan'} akun ${userToToggleStatus.fullName || userToToggleStatus.email}?`
            : ''
        }
        confirmText={userToToggleStatus?.isActive ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
        icon={userToToggleStatus?.isActive ? Ban : CheckCircle2}
        variant={userToToggleStatus?.isActive ? 'danger' : 'primary'}
      />

      <ConfirmModal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDeleteUser}
        loading={processingAction}
        title="Hapus Akun Pengguna?"
        message={userToDelete ? `Apakah Anda yakin ingin menghapus akun ${userToDelete.fullName || userToDelete.email} secara permanen?` : ''}
        confirmText="Ya, Hapus Pengguna"
        icon={Trash2}
        variant="danger"
      />
    </section>
  );
}
