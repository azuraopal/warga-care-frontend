import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { eventsApi } from '../api/events';
import { uploadApi } from '../api/upload';
import ConfirmModal from '../components/ui/ConfirmModal';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { formatImageUrl } from '../utils/image';
import { compressAndConvertImage } from '../utils/imageConverter';
import { Calendar, MapPin, Plus, Pencil, Trash2, CheckCircle2, AlertCircle, Image as ImageIcon, Upload, X, CalendarDays } from 'lucide-react';

const SAMPLE_EVENT_PHOTOS = [
  { label: 'Gotong Royong', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80' },
  { label: 'Rapat Warga', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80' },
  { label: 'Posyandu / Kesehatan', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80' },
];

export default function EventsPage() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    imageUrl: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [devicePreviewUrl, setDevicePreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await eventsApi.getAll();
      const content = res?.data?.content || res?.content || res?.data || [];
      setEvents(Array.isArray(content) ? content : []);
    } catch (err) {
      setError(err?.message || 'Gagal mengambil daftar kegiatan.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({ title: '', description: '', eventDate: '', location: '', imageUrl: '' });
    setDevicePreviewUrl('');
    setModalMessage('');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    let formattedDate = '';
    if (item.eventDate) {
      const d = new Date(item.eventDate);
      formattedDate = d.toISOString().slice(0, 16);
    }
    setForm({
      title: item.title || '',
      description: item.description || '',
      eventDate: formattedDate,
      location: item.location || '',
      imageUrl: item.imageUrl || '',
    });
    setDevicePreviewUrl('');
    setModalMessage('');
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const localUrl = URL.createObjectURL(file);
      setDevicePreviewUrl(localUrl);

      setUploadingImage(true);
      setModalMessage('');
      const processedFile = await compressAndConvertImage(file);
      const uploadedUrl = await uploadApi.uploadFile(processedFile);
      setForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      setModalMessage('Foto banner berhasil diupload!');
    } catch (err) {
      setError(err?.message || 'Gagal meng-upload foto banner.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingItem) {
        await eventsApi.update(editingItem.id, form);
        setActionMessage('Kegiatan berhasil diperbarui!');
      } else {
        await eventsApi.create(form);
        setActionMessage('Kegiatan baru berhasil dibuat!');
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan kegiatan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      if (itemToDelete === 'BULK') {
        await Promise.all(selectedIds.map(id => eventsApi.delete(id)));
        setActionMessage(`${selectedIds.length} kegiatan berhasil dihapus.`);
        setSelectedIds([]);
        setIsSelectionMode(false);
      } else {
        await eventsApi.delete(itemToDelete.id);
        setActionMessage('Kegiatan berhasil dihapus.');
      }
      setItemToDelete(null);
      fetchEvents();
    } catch (err) {
      setError(err?.message || 'Gagal menghapus kegiatan.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredEvents = events.filter((item) => {
    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.location && item.location.toLowerCase().includes(kw)) ||
      (item.description && item.description.toLowerCase().includes(kw))
    );
  });

  return (
    <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <span className="badge badge-role-warga" style={{ marginBottom: '0.5rem' }}>
            Agenda Lingkungan
          </span>
          <h1 style={{ fontSize: '1.85rem', margin: '0.2rem 0 0.35rem' }}>Jadwal Kegiatan Warga</h1>
          <p style={{ color: '#64748b' }}>Agenda gotong royong, posyandu, dan rapat warga di lingkungan RT/RW.</p>
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
              <Plus size={18} /> Buat Agenda Kegiatan
            </button>
          </div>
        )}
      </div>

      <SearchFilterBar
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        placeholder="Cari kegiatan, lokasi..."
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
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>Sedang mengambil jadwal kegiatan...</div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ background: 'white', padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
          <Calendar size={42} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Belum Ada Agenda Kegiatan</h3>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Saat ini belum ada jadwal kegiatan mendatang yang terdaftar.
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenCreate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb', color: 'white', padding: '0.75rem 1.35rem', borderRadius: '999px', fontWeight: 700 }}
            >
              <Plus size={16} /> Buat Agenda Pertama
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredEvents.map((item) => {
            const eventDateObj = item.eventDate ? new Date(item.eventDate) : null;
            return (
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
                  overflow: 'hidden',
                  boxShadow: selectedIds.includes(item.id) ? '0 10px 30px rgba(37, 99, 235, 0.15)' : '0 10px 30px rgba(15, 23, 42, 0.04)',
                  border: selectedIds.includes(item.id) ? '2px solid #2563eb' : '1px solid #f1f5f9',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  cursor: (isAdmin && isSelectionMode) ? 'pointer' : 'default',
                }}
              >
                {item.imageUrl && (
                  <div style={{ height: '160px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={formatImageUrl(item.imageUrl)}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    />
                  </div>
                )}

                <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}>
                      <Calendar size={15} />
                      <span>{eventDateObj ? eventDateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Tanggal Belum Diatur'}</span>
                    </div>

                    {isAdmin && !isSelectionMode && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          style={{ background: '#f1f5f9', border: 'none', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', color: '#475569' }}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          style={{ background: '#fef2f2', border: 'none', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', color: '#dc2626' }}
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#0f172a' }}>{item.title}</h3>

                  {item.location && (
                    <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} style={{ color: '#ef4444' }} /> {item.location}
                    </div>
                  )}

                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, margin: 0, flex: 1, whiteSpace: 'pre-line' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <div className="modal-title-icon">
                  <CalendarDays size={22} />
                </div>
                <div>
                  <h2 className="modal-title">{editingItem ? 'Edit Jadwal Kegiatan' : 'Buat Jadwal Kegiatan Baru'}</h2>
                  <p className="modal-subtitle">Publikasikan jadwal kegiatan RT/RW untuk partisipasi seluruh warga.</p>
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
                    Nama / Judul Kegiatan <span className="form-label-required">*</span>
                  </label>
                  <input
                    required
                    minLength={5}
                    maxLength={200}
                    className="form-input"
                    placeholder="Contoh: Kerja Bakti Membersihkan Saluran Air"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Tanggal & Waktu Pelaksanaan <span className="form-label-required">*</span>
                    </label>
                    <input
                      required
                      type="datetime-local"
                      className="form-input"
                      value={form.eventDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lokasi Kegiatan</label>
                    <input
                      className="form-input"
                      placeholder="Contoh: Balai Warga RT 01 / Lapangan Voli"
                      value={form.location}
                      onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <ImageIcon size={16} /> Foto Banner Kegiatan (Opsional)
                  </label>
                  <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb', color: 'white', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                      <Upload size={16} /> Upload Foto dari Device
                      <input
                        type="file"
                        accept="image/*,.heic,.heif,.webp,.avif"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {uploadingImage && <span style={{ display: 'block', fontSize: '0.8rem', color: '#2563eb', marginTop: '0.4rem', fontWeight: 600 }}>Meng-upload foto ke server...</span>}
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>Pilih foto langsung dari komputer / HP Anda.</span>
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                      Atau Pilih Sampel Foto Cepat:
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {SAMPLE_EVENT_PHOTOS.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setDevicePreviewUrl('');
                            setForm((prev) => ({ ...prev, imageUrl: sample.url }));
                          }}
                          style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '8px',
                            border: (!devicePreviewUrl && form.imageUrl === sample.url) ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            background: (!devicePreviewUrl && form.imageUrl === sample.url) ? '#eff6ff' : '#f8fafc',
                            fontSize: '0.775rem',
                            fontWeight: 600,
                            color: '#1d4ed8',
                            cursor: 'pointer',
                          }}
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(devicePreviewUrl || form.imageUrl) && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                      <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ImageIcon size={15} style={{ color: '#2563eb' }} /> Pratinjau Foto Banner:
                      </div>
                      <div style={{ width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0', border: '1px solid #cbd5e1', position: 'relative' }}>
                        <img
                          src={devicePreviewUrl || formatImageUrl(form.imageUrl)}
                          alt="Preview Banner Kegiatan"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Deskripsi Rinci <span className="form-label-required">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    minLength={10}
                    maxLength={5000}
                    className="form-textarea"
                    placeholder="Jelaskan perlengkapan yang perlu dibawa warga & rincian kegiatan..."
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
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
                  {submitting ? 'Menyimpan...' : editingItem ? 'Update Kegiatan' : 'Buat Kegiatan'}
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
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedIds.length} event dipilih</span>
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />
          <button
            onClick={() => {
              if (selectedIds.length === filteredEvents.length) setSelectedIds([]);
              else setSelectedIds(filteredEvents.map(e => e.id));
            }}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {selectedIds.length === filteredEvents.length ? 'Batal Semua' : 'Pilih Semua'}
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
          title={itemToDelete === 'BULK' ? 'Hapus Kegiatan Terpilih?' : 'Hapus Jadwal Kegiatan?'}
          message={itemToDelete === 'BULK' ? `Apakah Anda yakin ingin menghapus ${selectedIds.length} kegiatan yang dipilih? Tindakan ini tidak dapat dibatalkan.` : 'Apakah Anda yakin ingin menghapus jadwal kegiatan ini? Tindakan ini tidak dapat dibatalkan.'}
          confirmText={itemToDelete === 'BULK' ? `Ya, Hapus ${selectedIds.length} Kegiatan` : 'Ya, Hapus Kegiatan'}
          icon={Trash2}
          variant="danger"
          loading={deleting}
        />
      )}
    </section>
  );
}
