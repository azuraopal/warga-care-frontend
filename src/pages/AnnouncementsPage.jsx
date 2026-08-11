import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { announcementsApi } from '../api/announcements';
import ConfirmModal from '../components/ui/ConfirmModal';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { Bell, Pin, Plus, Pencil, Trash2, CheckCircle2, AlertCircle, Calendar, Search } from 'lucide-react';

export default function AnnouncementsPage() {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [form, setForm] = useState({ title: '', content: '', isPinned: false });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');
    try {
      const res = await announcementsApi.getAll(0, 50);
      const content = res?.data?.content || res?.content || res?.data || [];
      setAnnouncements(Array.isArray(content) ? content : []);
    } catch (err) {
      setError(err?.message || 'Gagal memuat pengumuman.');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleTogglePin = async (item) => {
    try {
      await announcementsApi.togglePin(item.id);
      setActionMessage(item.isPinned ? 'Sematan pengumuman dicopot.' : 'Pengumuman berhasil disematkan!');
      fetchAnnouncements(false);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setError(err?.message || 'Gagal mengubah status sematan.');
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({ title: '', content: '', isPinned: false });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({ title: item.title, content: item.content, isPinned: item.isPinned || false });
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
      fetchAnnouncements(false);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan pengumuman.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete && selectedIds.length === 0) return;
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
      fetchAnnouncements(false);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setError(err?.message || 'Gagal menghapus pengumuman.');
    } finally {
      setDeleting(false);
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
          <span className={`badge ${isAdmin ? 'badge-role-admin' : 'badge-role-warga'}`} style={{ marginBottom: '0.5rem' }}>
            Informasi Resmi RT/RW
          </span>
          <h1 style={{ fontSize: '1.85rem', margin: '0.2rem 0 0.35rem' }}>Pengumuman Warga</h1>
          <p style={{ color: '#64748b' }}>Informasi penting, kebijakan daerah, serta kabar terbaru dari pengurus RT/RW.</p>
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
              style={{
                background: '#2563eb',
                color: 'white',
                padding: '0.85rem 1.35rem',
                borderRadius: '999px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
              }}
            >
              <Plus size={18} /> Buat Pengumuman Baru
            </button>
          </div>
        )}
      </div>

      <SearchFilterBar
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        placeholder="Cari pengumuman secara langsung..."
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
          <h3 style={{ marginBottom: '0.5rem' }}>Tidak ada pengumuman ditemukan</h3>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {searchKeyword ? `Tidak ada pengumuman mencocoki kata kunci "${searchKeyword}".` : 'Pengurus RT/RW belum menerbitkan pengumuman terbaru.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {filteredAnnouncements.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (!isAdmin || !isSelectionMode) return;
                  if (selectedIds.includes(item.id)) {
                    setSelectedIds(prev => prev.filter(id => id !== item.id));
                  } else {
                    setSelectedIds(prev => [...prev, item.id]);
                  }
                }}
                style={{
                  background: selectedIds.includes(item.id) ? '#eff6ff' : 'white',
                  borderRadius: '20px',
                  padding: '1.6rem',
                  boxShadow: item.isPinned ? '0 15px 35px rgba(245, 158, 11, 0.08)' : (selectedIds.includes(item.id) ? '0 10px 30px rgba(37, 99, 235, 0.15)' : '0 10px 30px rgba(15, 23, 42, 0.05)'),
                  border: selectedIds.includes(item.id) ? '2px solid #2563eb' : (item.isPinned ? '1px solid #fde68a' : '1px solid #f1f5f9'),
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  cursor: isSelectionMode ? 'pointer' : 'default',
                  opacity: (isSelectionMode && !selectedIds.includes(item.id)) ? 0.7 : 1,
                }}
              >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {item.isPinned && (
                    <span className="badge badge-pinned" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Pin size={13} /> Disematkan (Penting)
                    </span>
                  )}
                  <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={14} /> {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru'}
                  </span>
                </div>

                {isAdmin && !isSelectionMode && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleTogglePin(item); }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: item.isPinned ? '#fef3c7' : '#f1f5f9',
                        color: item.isPinned ? '#b45309' : '#0f172a',
                        border: item.isPinned ? '1px solid #fde68a' : '1px solid #cbd5e1',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Pin size={14} /> {item.isPinned ? 'Lepas Sematan' : 'Sematkan'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f1f5f9', color: '#0f172a', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fef2f2', color: '#dc2626', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.4rem', margin: 0, color: '#0f172a' }}>{item.title}</h2>
                {isAdmin && isSelectionMode && (
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedIds.includes(item.id) ? (
                      <CheckCircle2 size={24} color="#2563eb" fill="#eff6ff" />
                    ) : (
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #cbd5e1' }} />
                    )}
                  </div>
                )}
              </div>
              <p style={{ color: '#334155', margin: 0, lineHeight: '1.65', whiteSpace: 'pre-line' }}>{item.content}</p>

              {item.authorName && (
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                  Oleh: {item.authorName}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              {editingItem ? 'Edit Pengumuman' : 'Terbitkan Pengumuman Baru'}
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              Pengumuman ini akan langsung dapat dibaca oleh seluruh warga terdaftar.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Judul Pengumuman</label>
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

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Isi Pengumuman</label>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="isPinnedCheck"
                  checked={form.isPinned}
                  onChange={(e) => setForm((prev) => ({ ...prev, isPinned: e.target.checked }))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="isPinnedCheck" style={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                  Sematan pengumuman di paling atas (Pinned)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.75rem 1.25rem', borderRadius: '999px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 700 }}
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
          description={itemToDelete === 'BULK' ? `Apakah Anda yakin ingin menghapus ${selectedIds.length} pengumuman yang dipilih? Tindakan ini tidak dapat dibatalkan.` : 'Apakah Anda yakin ingin menghapus pengumuman ini secara permanen?'}
          confirmText={itemToDelete === 'BULK' ? `Ya, Hapus ${selectedIds.length} Pengumuman` : 'Ya, Hapus Pengumuman'}
          isDanger={true}
          isLoading={deleting}
        />
      )}
    </section>
  );
}
