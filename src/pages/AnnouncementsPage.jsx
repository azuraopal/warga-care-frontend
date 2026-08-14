import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { announcementsApi } from '../api/announcements';
import ConfirmModal from '../components/ui/ConfirmModal';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { Bell, Pin, Plus, Pencil, Trash2, CheckCircle2, AlertCircle, Calendar, Search, X, Megaphone } from 'lucide-react';

export default function AnnouncementsPage() {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', isPinned: false });
  const [submitting, setSubmitting] = useState(false);

  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await announcementsApi.getAll();
      const content = res?.data?.content || res?.content || res?.data || [];
      setAnnouncements(Array.isArray(content) ? content : []);
    } catch (err) {
      setError(err?.message || 'Gagal mengambil daftar pengumuman.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({ title: '', content: '', isPinned: false });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title || '',
      content: item.content || '',
      isPinned: item.isPinned || false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingItem) {
        await announcementsApi.update(editingItem.id, form);
        setActionMessage('Pengumuman berhasil diperbarui!');
      } else {
        await announcementsApi.create(form);
        setActionMessage('Pengumuman baru berhasil diterbitkan!');
      }
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan pengumuman.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      if (itemToDelete === 'BULK') {
        await Promise.all(selectedIds.map(id => announcementsApi.delete(id)));
        setActionMessage(`${selectedIds.length} pengumuman berhasil dihapus.`);
        setSelectedIds([]);
        setIsSelectionMode(false);
      } else {
        await announcementsApi.delete(itemToDelete.id);
        setActionMessage('Pengumuman berhasil dihapus.');
      }
      setItemToDelete(null);
      fetchAnnouncements();
    } catch (err) {
      setError(err?.message || 'Gagal menghapus pengumuman.');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePin = async (item) => {
    try {
      await announcementsApi.togglePin(item.id);
      setActionMessage(item.isPinned ? 'Pin pengumuman berhasil dilepas.' : 'Pengumuman berhasil disematkan (Pinned)!');
      fetchAnnouncements();
    } catch (err) {
      setError(err?.message || 'Gagal mengubah status pin pengumuman.');
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.content && item.content.toLowerCase().includes(kw))
    );
  });

  return (
    <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <span className="badge badge-role-warga" style={{ marginBottom: '0.5rem' }}>
            Informasi Resmi RT/RW
          </span>
          <h1 style={{ fontSize: '1.85rem', margin: '0.2rem 0 0.35rem' }}>Papan Pengumuman Warga</h1>
          <p style={{ color: '#64748b' }}>Dapatkan berita terbaru, imbauan, dan informasi resmi dari pengurus RT/RW.</p>
        </div>

        {isAdmin && (
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
              onClick={handleOpenCreate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb', color: 'white', padding: '0.8rem 1.4rem', borderRadius: '999px', fontWeight: 700, boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)' }}
            >
              <Plus size={18} /> Buat Pengumuman Baru
            </button>
          </div>
        )}
      </div>

      <SearchFilterBar
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        placeholder="Cari judul pengumuman, isi berita..."
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
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>Sedang mengambil data pengumuman...</div>
      ) : filteredAnnouncements.length === 0 ? (
        <div style={{ background: 'white', padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
          <Bell size={42} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Belum Ada Pengumuman</h3>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Saat ini belum ada pengumuman resmi yang diterbitkan oleh pengurus.
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenCreate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb', color: 'white', padding: '0.75rem 1.35rem', borderRadius: '999px', fontWeight: 700 }}
            >
              <Plus size={16} /> Buat Pengumuman Pertama
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (isAdmin && isSelectionMode) {
                  if (selectedIds.includes(item.id)) {
                    setSelectedIds(prev => prev.filter(id => id !== item.id));
                  } else {
                    setSelectedIds(prev => [...prev, item.id]);
                  }
                }
              }}
              style={{
                background: selectedIds.includes(item.id) ? '#eff6ff' : 'white',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: selectedIds.includes(item.id) ? '0 10px 30px rgba(37, 99, 235, 0.15)' : '0 10px 30px rgba(15, 23, 42, 0.04)',
                border: selectedIds.includes(item.id) ? '2px solid #2563eb' : (item.isPinned ? '2px solid #3b82f6' : '1px solid #f1f5f9'),
                position: 'relative',
                transition: 'all 0.2s ease',
                cursor: (isAdmin && isSelectionMode) ? 'pointer' : 'default',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {item.isPinned && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                      <Pin size={12} /> Pinned
                    </span>
                  )}
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{item.title}</h3>
                </div>

                {isAdmin && !isSelectionMode && (
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleTogglePin(item)}
                      style={{
                        background: item.isPinned ? '#fef3c7' : '#f1f5f9',
                        border: item.isPinned ? '1px solid #fde68a' : 'none',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: item.isPinned ? '#ca8a04' : '#475569',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                      title={item.isPinned ? "Lepas Pin" : "Sematkan (Pin) Pengumuman"}
                    >
                      <Pin size={14} /> {item.isPinned ? 'Lepas Pin' : 'Pin'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      style={{ background: '#f1f5f9', border: 'none', padding: '0.45rem', borderRadius: '8px', cursor: 'pointer', color: '#475569' }}
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      style={{ background: '#fef2f2', border: 'none', padding: '0.45rem', borderRadius: '8px', cursor: 'pointer', color: '#dc2626' }}
                      title="Hapus"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              <p style={{ color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line', margin: '0 0 1rem 0' }}>
                {item.content}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={14} /> {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru saja'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <div className="modal-title-icon">
                  <Megaphone size={22} />
                </div>
                <div>
                  <h2 className="modal-title">{editingItem ? 'Edit Pengumuman' : 'Terbitkan Pengumuman Baru'}</h2>
                  <p className="modal-subtitle">Pengumuman ini akan langsung dapat dibaca oleh seluruh warga terdaftar.</p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'grid', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    Judul Pengumuman <span className="form-label-required">*</span>
                  </label>
                  <input
                    required
                    minLength={5}
                    maxLength={200}
                    className="form-input"
                    placeholder="Contoh: Kerja Bakti Massal Sambut Hari Kemerdekaan"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Isi Pengumuman <span className="form-label-required">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    minLength={10}
                    maxLength={5000}
                    className="form-textarea"
                    placeholder="Tuliskan isi informasi pengumuman secara rinci..."
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0' }}>
                  <input
                    type="checkbox"
                    id="isPinnedCheck"
                    checked={form.isPinned}
                    onChange={(e) => setForm((prev) => ({ ...prev, isPinned: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isPinnedCheck" style={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', color: '#1e293b' }}>
                    Sematan pengumuman di paling atas (Pinned)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Menyimpan...' : editingItem ? 'Update Pengumuman' : 'Terbitkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdmin && isSelectionMode && selectedIds.length > 0 && (
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
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedIds.length} pengumuman dipilih</span>
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />
          <button
            onClick={() => {
              if (selectedIds.length === filteredAnnouncements.length) setSelectedIds([]);
              else setSelectedIds(filteredAnnouncements.map(e => e.id));
            }}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {selectedIds.length === filteredAnnouncements.length ? 'Batal Semua' : 'Pilih Semua'}
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
            onClick={() => setItemToDelete('BULK')}
            style={{ background: '#dc2626', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Trash2 size={16} /> Hapus
          </button>
        </div>
      )}

      {itemToDelete && (
        <ConfirmModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
          title={itemToDelete === 'BULK' ? 'Hapus Pengumuman Terpilih?' : 'Hapus Pengumuman RT?'}
          message={itemToDelete === 'BULK' ? `Apakah Anda yakin ingin menghapus ${selectedIds.length} pengumuman yang dipilih? Tindakan ini tidak dapat dibatalkan.` : 'Apakah Anda yakin ingin menghapus pengumuman ini secara permanen?'}
          confirmText={itemToDelete === 'BULK' ? `Ya, Hapus ${selectedIds.length} Pengumuman` : 'Ya, Hapus Pengumuman'}
          icon={Trash2}
          variant="danger"
          loading={deleting}
        />
      )}
    </section>
  );
}
