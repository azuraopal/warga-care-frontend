import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { usersApi } from '../api/users';
import ConfirmModal from '../components/ui/ConfirmModal';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { Crown, User, Mail, Home, Phone, Ban, CheckCircle2, Trash2, AlertCircle, Plus, UserPlus, X, Lock, Shield, MapPin, ShieldAlert } from 'lucide-react';

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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    fullName: '', email: '', password: '', role: 'WARGA', rt: '', rw: '', phone: '', address: ''
  });

  const [userToToggleStatus, setUserToToggleStatus] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await usersApi.getAll({ role: filterRole || undefined });
      const content = res?.data?.content || res?.content || res?.data || [];
      setUsers(Array.isArray(content) ? content : []);
    } catch (err) {
      setError(err?.message || 'Gagal mengambil data warga.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await usersApi.create(createFormData);
      setActionMessage(`Berhasil mendaftarkan warga ${createFormData.fullName || createFormData.email}`);
      setShowCreateModal(false);
      setCreateFormData({ fullName: '', email: '', password: '', role: 'WARGA', rt: '', rw: '', phone: '', address: '' });
      fetchUsers();
    } catch (err) {
      setError(err?.message || 'Gagal menambahkan warga baru.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenRoleModal = (u) => {
    setSelectedUser(u);
    setSelectedRole(u.role);
    setShowRoleModal(true);
  };

  const handleUpdateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setError('');
    try {
      await usersApi.updateRole(selectedUser.id, selectedRole);
      setActionMessage(`Berhasil memperbarui peran ${selectedUser.fullName || selectedUser.email} menjadi ${selectedRole}`);
      setShowRoleModal(false);
      fetchUsers();
    } catch (err) {
      setError(err?.message || 'Gagal memperbarui peran pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!userToToggleStatus) return;
    setProcessingAction(true);
    try {
      if (userToToggleStatus.isActive) {
        await usersApi.deactivate(userToToggleStatus.id);
        setActionMessage(`Akun ${userToToggleStatus.fullName || userToToggleStatus.email} berhasil dinonaktifkan.`);
      } else {
        await usersApi.activate(userToToggleStatus.id);
        setActionMessage(`Akun ${userToToggleStatus.fullName || userToToggleStatus.email} berhasil diaktifkan kembali.`);
      }
      setUserToToggleStatus(null);
      fetchUsers();
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
      if (userToDelete === 'BULK') {
        await Promise.all(selectedIds.map(id => usersApi.delete(id)));
        setActionMessage(`Berhasil menghapus ${selectedIds.length} pengguna.`);
        setSelectedIds([]);
        setIsSelectionMode(false);
      } else {
        await usersApi.delete(userToDelete.id);
        setActionMessage(`Berhasil menghapus akun ${userToDelete.fullName || userToDelete.email}.`);
      }
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      setError(err?.message || 'Gagal menghapus pengguna.');
    } finally {
      setProcessingAction(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(kw)) ||
      (u.email && u.email.toLowerCase().includes(kw)) ||
      (u.phone && u.phone.includes(kw)) ||
      (u.rt && u.rt.includes(kw)) ||
      (u.rw && u.rw.includes(kw))
    );
  });

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
            Panel Pengurus Admin RT
          </span>
          <h1 style={{ fontSize: '1.85rem', margin: '0.2rem 0 0.35rem' }}>
            Manajemen Data Warga & Pengurus
          </h1>
          <p style={{ color: '#64748b' }}>
            Kelola pendaftaran warga, peran pengurus RT/RW, dan status aktif keanggotaan warga lingkungan.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (isSelectionMode) setSelectedIds([]);
            }}
            style={{
              background: isSelectionMode ? '#e2e8f0' : 'white',
              color: '#334155',
              padding: '0.85rem 1.35rem',
              borderRadius: '999px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              border: '1px solid #cbd5e1'
            }}
          >
            {isSelectionMode ? 'Batal Pilih' : 'Pilih'}
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb', color: 'white', padding: '0.8rem 1.4rem', borderRadius: '999px', fontWeight: 700, boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)' }}
          >
            <UserPlus size={18} /> Tambah Warga Baru
          </button>
        </div>
      </div>

      <SearchFilterBar
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        placeholder="Cari nama, email, RT/RW, atau no HP warga..."
        filters={[
          {
            value: filterRole,
            onChange: setFilterRole,
            options: [
              { value: 'WARGA', label: 'Warga Biasa' },
              { value: 'ADMIN_RT', label: 'Admin RT' },
            ],
            defaultLabel: 'Semua Peran',
          },
        ]}
      />

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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>Sedang memuat data warga...</div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ background: 'white', padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Tidak ada data warga ditemukan</h3>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Belum ada warga yang terdaftar atau sesuai dengan filter pencarian saat ini.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb', color: 'white', padding: '0.75rem 1.35rem', borderRadius: '999px', fontWeight: 700 }}
          >
            <UserPlus size={16} /> Tambah Warga Sekarang
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => {
                if (isSelectionMode && u.id !== currentUser?.id) {
                  if (selectedIds.includes(u.id)) {
                    setSelectedIds(prev => prev.filter(id => id !== u.id));
                  } else {
                    setSelectedIds(prev => [...prev, u.id]);
                  }
                }
              }}
              style={{
                background: selectedIds.includes(u.id) ? '#eff6ff' : 'white',
                borderRadius: '20px',
                padding: '1.4rem',
                boxShadow: selectedIds.includes(u.id) ? '0 10px 30px rgba(37, 99, 235, 0.15)' : '0 10px 30px rgba(15, 23, 42, 0.04)',
                border: selectedIds.includes(u.id) ? '2px solid #2563eb' : (u.isActive ? '1px solid #f1f5f9' : '1px solid #fecaca'),
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                position: 'relative',
                transition: 'all 0.2s ease',
                cursor: (isSelectionMode && u.id !== currentUser?.id) ? 'pointer' : 'default',
                opacity: (!u.isActive ? 0.75 : 1)
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: u.role === 'ADMIN_RT' ? '#eff6ff' : '#f1f5f9',
                    color: u.role === 'ADMIN_RT' ? '#2563eb' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    flexShrink: 0
                  }}>
                    {u.fullName ? u.fullName.charAt(0).toUpperCase() : <User size={20} />}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.fullName || 'Warga Tanpa Nama'}</h3>
                      {u.role === 'ADMIN_RT' && <Crown size={15} color="#ca8a04" style={{ flexShrink: 0 }} />}
                    </div>
                    <span style={{ fontSize: '0.825rem', color: '#64748b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                  <span className={u.role === 'ADMIN_RT' ? 'badge badge-role-admin' : 'badge badge-role-warga'} style={{ whiteSpace: 'nowrap' }}>
                    {u.role === 'ADMIN_RT' ? 'Admin RT' : 'Warga'}
                  </span>
                  {!u.isActive && (
                    <span style={{ fontSize: '0.725rem', color: '#dc2626', fontWeight: 600, background: '#fef2f2', padding: '0.15rem 0.5rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                      Nonaktif
                    </span>
                  )}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: '#475569' }}>
                <div><strong>RT/RW:</strong> {u.rt || '-'}/{u.rw || '-'}</div>
                <div><strong>No HP:</strong> {u.phone || '-'}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleOpenRoleModal(u); }}
                  style={{ fontSize: '0.825rem', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Ubah Peran
                </button>

                {u.id !== currentUser?.id && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setUserToToggleStatus(u); }}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: u.isActive ? '#fff1f2' : '#f0fdf4',
                        color: u.isActive ? '#e11d48' : '#166534',
                        border: u.isActive ? '1px solid #fecdd3' : '1px solid #bbf7d0',
                        cursor: 'pointer'
                      }}
                    >
                      {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setUserToDelete(u); }}
                      style={{ padding: '0.4rem 0.6rem', borderRadius: '999px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Hapus Warga"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <div className="modal-title-icon">
                  <UserPlus size={22} />
                </div>
                <div>
                  <h2 className="modal-title">Tambah Warga Baru</h2>
                  <p className="modal-subtitle">Masukkan data warga yang akan didaftarkan ke dalam sistem RT/RW.</p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit}>
              <div className="modal-body" style={{ display: 'grid', gap: '1.15rem' }}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Nama Lengkap <span className="form-label-required">*</span>
                    </label>
                    <div className="input-icon-group">
                      <User className="input-icon" size={18} />
                      <input
                        required
                        className="form-input input-with-icon"
                        type="text"
                        placeholder="Contoh: Ahmad Subagja"
                        value={createFormData.fullName}
                        onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Email <span className="form-label-required">*</span>
                    </label>
                    <div className="input-icon-group">
                      <Mail className="input-icon" size={18} />
                      <input
                        required
                        className="form-input input-with-icon"
                        type="email"
                        placeholder="nama@email.com"
                        value={createFormData.email}
                        onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Password <span className="form-label-required">*</span>
                    </label>
                    <div className="input-icon-group">
                      <Lock className="input-icon" size={18} />
                      <input
                        required
                        minLength={6}
                        className="form-input input-with-icon"
                        type="password"
                        placeholder="Minimal 6 karakter"
                        value={createFormData.password}
                        onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Peran <span className="form-label-required">*</span>
                    </label>
                    <div className="input-icon-group">
                      <Shield className="input-icon" size={18} />
                      <select
                        className="form-select input-with-icon"
                        value={createFormData.role}
                        onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                      >
                        <option value="WARGA">WARGA (Warga Biasa)</option>
                        <option value="ADMIN_RT">ADMIN RT (Pengurus RT)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">RT</label>
                    <div className="input-icon-group">
                      <Home className="input-icon" size={18} />
                      <input
                        className="form-input input-with-icon"
                        type="text"
                        placeholder="01"
                        value={createFormData.rt}
                        onChange={(e) => setCreateFormData({ ...createFormData, rt: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">RW</label>
                    <div className="input-icon-group">
                      <Home className="input-icon" size={18} />
                      <input
                        className="form-input input-with-icon"
                        type="text"
                        placeholder="05"
                        value={createFormData.rw}
                        onChange={(e) => setCreateFormData({ ...createFormData, rw: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">No HP / Whatsapp</label>
                    <div className="input-icon-group">
                      <Phone className="input-icon" size={18} />
                      <input
                        className="form-input input-with-icon"
                        type="text"
                        placeholder="081234567890"
                        value={createFormData.phone}
                        onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Rumah</label>
                  <div className="input-icon-group">
                    <MapPin className="input-icon" size={18} style={{ top: '1rem' }} />
                    <textarea
                      className="form-textarea input-with-icon"
                      rows="2"
                      placeholder="Jl. Merdeka No. 12, Blok A..."
                      value={createFormData.address}
                      onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Menyimpan...' : 'Tambah Warga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRoleModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <div className="modal-title-icon" style={{ background: '#fef3c7', color: '#ca8a04' }}>
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h2 className="modal-title">Ubah Peran Pengguna</h2>
                  <p className="modal-subtitle">Atur hak akses untuk: <strong>{selectedUser.fullName || selectedUser.email}</strong></p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowRoleModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateRoleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Pilih Peran Baru</label>
                  <div className="input-icon-group">
                    <Shield className="input-icon" size={18} />
                    <select
                      className="form-select input-with-icon"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="WARGA">WARGA (Warga Biasa)</option>
                      <option value="ADMIN_RT">Admin RT (Pengurus RT)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowRoleModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
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

      {isSelectionMode && selectedIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          zIndex: 100,
          border: '1px solid #e2e8f0',
          animation: 'slideUp 0.3s ease'
        }}>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedIds.length} pengguna dipilih</span>
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />
          <button
            onClick={() => {
              const selectableUsers = users.filter(u => u.id !== currentUser?.id);
              if (selectedIds.length === selectableUsers.length) setSelectedIds([]);
              else setSelectedIds(selectableUsers.map(e => e.id));
            }}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {selectedIds.length === users.filter(u => u.id !== currentUser?.id).length ? 'Batal Semua' : 'Pilih Semua'}
          </button>
          <button
            onClick={() => {
              setIsSelectionMode(false);
              setSelectedIds([]);
            }}
            style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            Batalkan
          </button>
          <button
            onClick={() => setUserToDelete('BULK')}
            style={{ background: '#dc2626', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Trash2 size={16} /> Hapus
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDeleteUser}
        loading={processingAction}
        title={userToDelete === 'BULK' ? 'Hapus Pengguna Terpilih?' : 'Hapus Akun Pengguna?'}
        message={userToDelete === 'BULK' ? `Apakah Anda yakin ingin menghapus ${selectedIds.length} pengguna yang dipilih secara permanen?` : (userToDelete ? `Apakah Anda yakin ingin menghapus akun ${userToDelete.fullName || userToDelete.email} secara permanen?` : '')}
        confirmText={userToDelete === 'BULK' ? `Ya, Hapus ${selectedIds.length} Pengguna` : 'Ya, Hapus Pengguna'}
        icon={Trash2}
        variant="danger"
      />
    </section>
  );
}
