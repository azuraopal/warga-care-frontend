import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { announcementsApi } from '../api/announcements';
import ConfirmModal from '../components/ui/ConfirmModal';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Bell, Pin, Plus, Pencil, Trash2, CheckCircle2, AlertCircle, Calendar, Search, X, Megaphone, MapPin, Clock } from 'lucide-react';

export default function AnnouncementsPage() {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', eventDate: '', location: '', isPinned: false });
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
    setForm({ title: '', content: '', eventDate: '', location: '', isPinned: false });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    let formattedDate = '';
    if (item.eventDate || item.date) {
      const d = new Date(item.eventDate || item.date);
      const pad = (n) => String(n).padStart(2, '0');
      if (!isNaN(d.getTime())) {
        formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    }
    setForm({
      title: item.title || '',
      content: item.content || '',
      eventDate: formattedDate,
      location: item.location || '',
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
        <SkeletonCard count={3} />
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
                padding: '1.25rem',
                boxShadow: selectedIds.includes(item.id) ? '0 10px 30px rgba(37, 99, 235, 0.15)' : '0 10px 30px rgba(15, 23, 42, 0.04)',
                border: selectedIds.includes(item.id) ? '2px solid #2563eb' : (item.isPinned ? '2px solid #3b82f6' : '1px solid #f1f5f9'),
                position: 'relative',
                transition: 'all 0.2s ease',
                cursor: (isAdmin && isSelectionMode) ? 'pointer' : 'default',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                  {item.isPinned && (
                    <div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.725rem', fontWeight: 800, letterSpacing: '0.02em', flexShrink: 0, border: '1px solid #bfdbfe' }}>
                        <Pin size={12} style={{ transform: 'rotate(45deg)' }} /> PINNED
                      </span>
                    </div>
                  )}
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 750, color: '#0f172a', wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.4 }}>{item.title}</h3>
                </div>

                {isAdmin && !isSelectionMode && (
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleTogglePin(item); }}
                      style={{
                        background: item.isPinned ? '#fef3c7' : '#f1f5f9',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        color: item.isPinned ? '#d97706' : '#475569',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      title={item.isPinned ? "Lepas Pin" : "Sematkan Pengumuman"}
                    >
                      <Pin size={16} style={{ transform: item.isPinned ? 'rotate(45deg)' : 'none' }} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}
                      style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', color: '#475569', transition: 'all 0.2s ease' }}
                      title="Edit Pengumuman"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }}
                      style={{ background: '#fef2f2', border: 'none', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', color: '#e11d48', transition: 'all 0.2s ease' }}
                      title="Hapus Pengumuman"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {(item.eventDate || item.date || item.location) && (
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem 1.25rem',
                  alignItems: 'center',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  {(item.eventDate || item.date) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0369a1', fontWeight: 600, fontSize: '0.875rem', minWidth: 0 }}>
                      <Calendar size={16} style={{ color: '#0284c7', flexShrink: 0 }} />
                      <span style={{ wordBreak: 'break-word' }}>Waktu Pelaksanaan: {new Date(item.eventDate || item.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</span>
                    </div>
                  )}
                  {item.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#334155', fontWeight: 500, fontSize: '0.85rem', minWidth: 0 }}>
                      <MapPin size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
                      <span style={{ wordBreak: 'break-word' }}>Lokasi: {item.location}</span>
                    </div>
                  )}
                </div>
              )}

              <p style={{ color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line', margin: '0 0 1rem 0' }}>
                {item.content}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} /> Diterbitkan: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru saja'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
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

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Waktu & Tanggal Pelaksanaan (Opsional)
                    </label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={form.eventDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Lokasi Pelaksanaan (Opsional)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Balai Warga RT 01 / Lapangan"
                      value={form.location}
                      onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
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
        <div className="bulk-selection-bar">
          <span className="bulk-count-text" style={{ fontWeight: 600, color: '#0f172a' }}>{selectedIds.length} pengumuman dipilih</span>
          <div className="divider" style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />
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
