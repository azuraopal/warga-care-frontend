import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { eventsApi } from '../api/events';
import { uploadApi } from '../api/upload';
import ConfirmModal from '../components/ui/ConfirmModal';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { formatImageUrl } from '../utils/image';
import { compressAndConvertImage } from '../utils/imageConverter';
import { Calendar, MapPin, Plus, Pencil, Trash2, CheckCircle2, AlertCircle, Image as ImageIcon, Upload } from 'lucide-react';

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
  const [modalMessage, setModalMessage] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [devicePreviewUrl, setDevicePreviewUrl] = useState('');

  const [form, setForm] = useState({ title: '', description: '', eventDate: '', location: '', imageUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await eventsApi.getAll(0, 50);
      const content = res?.data?.content || res?.content || res?.data || [];
      setEvents(Array.isArray(content) ? content : []);
    } catch (err) {
      setError(err?.message || 'Gagal memuat jadwal kegiatan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFileUpload = async (e) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    setUploadingImage(true);
    setModalMessage('');
    try {
      const fileToUpload = await compressAndConvertImage(originalFile);
      const localObjectUrl = URL.createObjectURL(fileToUpload);
      setDevicePreviewUrl(localObjectUrl);

      const res = await uploadApi.uploadFile(fileToUpload, 'events');
      const rawUrl = res?.data?.url || res?.url || res?.data?.data?.url || (typeof res?.data === 'string' ? res.data : '');
      if (rawUrl) {
        setForm((prev) => ({ ...prev, imageUrl: rawUrl }));
        setModalMessage('Foto dari device berhasil diupload!');
        setTimeout(() => setModalMessage(''), 4000);
      }
    } catch (err) {
      setError(err?.message || 'Gagal meng-upload foto dari device.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalMessage('');
    setDevicePreviewUrl('');
    const tomorrow = new Date(Date.now() + 86400000);
    const dateStr = tomorrow.toISOString().slice(0, 16);
    setForm({ title: '', description: '', eventDate: dateStr, location: '', imageUrl: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setModalMessage('');
    setDevicePreviewUrl('');
    const dateVal = item.eventDate ? new Date(item.eventDate).toISOString().slice(0, 16) : '';
    setForm({
      title: item.title,
      description: item.description,
      eventDate: dateVal,
      location: item.location || '',
      imageUrl: item.imageUrl || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        eventDate: new Date(form.eventDate).toISOString(),
      };

      if (editingItem) {
        await eventsApi.update(editingItem.id, payload);
        setActionMessage('Kegiatan berhasil diperbarui!');
      } else {
        await eventsApi.create(payload);
        setActionMessage('Jadwal kegiatan baru berhasil dibuat!');
      }
      setShowModal(false);
      fetchEvents();
      setTimeout(() => setActionMessage(''), 4000);
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
      await eventsApi.delete(itemToDelete.id);
      setItemToDelete(null);
      setActionMessage('Jadwal kegiatan berhasil dihapus.');
      fetchEvents();
      setTimeout(() => setActionMessage(''), 4000);
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
      (item.description && item.description.toLowerCase().includes(kw)) ||
      (item.location && item.location.toLowerCase().includes(kw))
    );
  });

  return (
    <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <span className={`badge ${isAdmin ? 'badge-role-admin' : 'badge-role-warga'}`} style={{ marginBottom: '0.5rem' }}>
            Agenda Komunitas
          </span>
          <h1 style={{ fontSize: '1.85rem', margin: '0.2rem 0 0.35rem' }}>Kegiatan & Gotong Royong</h1>
          <p style={{ color: '#64748b' }}>Jadwal kegiatan warga, kerja bakti, rapat RT, dan agenda kemasyarakatan.</p>
        </div>

        {isAdmin && (
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
            <Plus size={18} /> Buat Kegiatan Baru
          </button>
        )}
      </div>

      <SearchFilterBar
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        placeholder="Cari kegiatan secara langsung..."
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
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>Sedang mengambil agenda kegiatan...</div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ background: 'white', padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Tidak ada kegiatan ditemukan</h3>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {searchKeyword ? `Tidak ada agenda mencocoki kata kunci "${searchKeyword}".` : 'Saat ini belum ada jadwal kegiatan atau kerja bakti yang dipublikasikan.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredEvents.map((item) => {
            const eventDateObj = item.eventDate ? new Date(item.eventDate) : null;
            return (
              <div
                key={item.id}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
                  border: '1px solid #f1f5f9',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {item.imageUrl && (
                  <div style={{ height: '200px', width: '100%', overflow: 'hidden', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <img
                      key={item.imageUrl}
                      src={formatImageUrl(item.imageUrl)}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', top: 0, left: 0 }}
                      onLoad={(e) => {
                        e.target.style.display = 'block';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'none';
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
                      <ImageIcon size={32} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Foto Kegiatan</span>
                    </div>
                  </div>
                )}

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
                    <span style={{ fontSize: '0.825rem', padding: '0.4rem 0.8rem', borderRadius: '999px', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      <Calendar size={14} /> {eventDateObj ? eventDateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Mendatang'}
                    </span>

                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#f1f5f9', color: '#0f172a', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#fef2f2', color: '#dc2626', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          <Trash2 size={13} /> Hapus
                        </button>
                      </div>
                    )}
                  </div>

                  <h2 style={{ fontSize: '1.3rem', margin: 0, color: '#0f172a' }}>{item.title}</h2>

                  {item.location && (
                    <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} /> {item.location}
                    </div>
                  )}

                  <p style={{ color: '#334155', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-line' }}>{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              {editingItem ? 'Edit Jadwal Kegiatan' : 'Buat Jadwal Kegiatan Baru'}
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              Publikasikan jadwal kegiatan RT/RW untuk partisipasi warga.
            </p>

            {modalMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} /> {modalMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Nama / Judul Kegiatan</label>
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

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Tanggal & Waktu Pelaksanaan</label>
                <input
                  required
                  type="datetime-local"
                  className="form-input"
                  value={form.eventDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Lokasi Kegiatan</label>
                <input
                  className="form-input"
                  placeholder="Contoh: Balai Warga RT 01 / Lapangan Voli"
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                  <ImageIcon size={16} /> Foto Banner Kegiatan
                </div>
                <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '0.85rem', borderRadius: '12px', marginBottom: '0.75rem', textAlign: 'center' }}>
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

                <div style={{ marginTop: '0.3rem' }}>
                  <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
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
                          padding: '0.3rem 0.6rem',
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
                      <ImageIcon size={15} style={{ color: '#2563eb' }} /> Pratinjau (Preview) Foto Banner:
                    </div>
                    <div style={{ width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <img
                        key={devicePreviewUrl || form.imageUrl}
                        src={devicePreviewUrl || formatImageUrl(form.imageUrl)}
                        alt="Preview Banner Kegiatan"
                        style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block', position: 'absolute', top: 0, left: 0 }}
                        onLoad={(e) => {
                          e.target.style.display = 'block';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'none';
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', color: '#64748b' }}>
                        <CheckCircle2 size={28} style={{ color: '#16a34a' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>Foto berhasil diupload!</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Format ini tidak bisa di-preview di browser</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Deskripsi Rinci</label>
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
                  {submitting ? 'Menyimpan...' : editingItem ? 'Update Kegiatan' : 'Buat Kegiatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Hapus Jadwal Kegiatan?"
        message={itemToDelete ? `Apakah Anda yakin ingin menghapus jadwal kegiatan "${itemToDelete.title}"?` : ''}
        confirmText="Ya, Hapus Kegiatan"
        icon={Trash2}
        variant="danger"
      />
    </section>
  );
}
