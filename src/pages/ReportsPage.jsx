import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { reportsApi } from '../api/reports';
import { uploadApi } from '../api/upload';
import ConfirmModal from '../components/ui/ConfirmModal';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import LocationPicker from '../components/ui/LocationPicker';
import { formatImageUrl } from '../utils/image';
import { compressAndConvertImage } from '../utils/imageConverter';
import { MapPin, Lightbulb, CheckCircle2, Lock, AlertCircle, Trash2, Plus, Search, Image as ImageIcon, Upload, Camera } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_CATEGORIES = [
  { value: 'JALAN_RUSAK', label: 'Jalan Rusak' },
  { value: 'SAMPAH', label: 'Pengelolaan Sampah' },
  { value: 'LAMPU_MATI', label: 'Lampu Penerangan Jalan' },
  { value: 'BANJIR', label: 'Banjir / Drainase' },
  { value: 'HEWAN_HILANG', label: 'Hewan Peliharaan / Liar' },
  { value: 'BANTUAN_WARGA', label: 'Bantuan Sosial Warga' },
  { value: 'KEAMANAN', label: 'Keamanan / Ketertiban' },
  { value: 'LAINNYA', label: 'Lainnya' },
];

const DEFAULT_STATUSES = [
  { value: 'PENDING', label: 'Menunggu (Pending)', badgeClass: 'badge-pending' },
  { value: 'DIPROSES', label: 'Sedang Diproses', badgeClass: 'badge-diproses' },
  { value: 'SELESAI', label: 'Selesai', badgeClass: 'badge-selesai' },
  { value: 'DITOLAK', label: 'Ditolak', badgeClass: 'badge-ditolak' },
];

const SAMPLE_EVIDENCE_PHOTOS = [
  { label: 'Foto Perbaikan Jalan', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Foto Perbaikan Lampu', url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Foto Gotong Royong / Drainage', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80' },
];

function parseCompletionEvidence(evidenceStr) {
  if (!evidenceStr) return { photoUrl: '', notes: '' };
  try {
    const obj = JSON.parse(evidenceStr);
    if (obj && typeof obj === 'object') {
      return {
        photoUrl: obj.photoUrl || '',
        notes: obj.notes || obj.text || '',
      };
    }
  } catch (e) {
    if (evidenceStr.startsWith('http') || evidenceStr.startsWith('data:image') || evidenceStr.startsWith('/')) {
      return { photoUrl: evidenceStr, notes: '' };
    }
    return { photoUrl: '', notes: evidenceStr };
  }
  return { photoUrl: '', notes: evidenceStr };
}

function formatCompletionEvidence(photoUrl, notes) {
  return JSON.stringify({ photoUrl: photoUrl?.trim() || '', notes: notes?.trim() || '' });
}

export default function ReportsPage() {
  const { user, isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [statuses, setStatuses] = useState(DEFAULT_STATUSES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailReport, setDetailReport] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [devicePreviewUrl, setDevicePreviewUrl] = useState('');

  const [createForm, setCreateForm] = useState({ title: '', description: '', category: 'JALAN_RUSAK', location: '', latitude: null, longitude: null, photoEvidence: '' });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [statusForm, setStatusForm] = useState({ status: 'DIPROSES', adminNotes: '', evidencePhoto: '', evidenceNotes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, stRes] = await Promise.all([
          reportsApi.getCategories(),
          reportsApi.getStatuses(),
        ]);
        const catData = catRes?.data || catRes;
        const stData = stRes?.data || stRes;
        if (Array.isArray(catData) && catData.length > 0) {
          setCategories(catData);
          if (catData[0]?.value) {
            setCreateForm((prev) => ({ ...prev, category: catData[0].value }));
          }
        }
        if (Array.isArray(stData) && stData.length > 0) {
          setStatuses(stData.map((s) => ({
            ...s,
            badgeClass: s.value === 'PENDING' ? 'badge-pending'
              : s.value === 'DIPROSES' ? 'badge-diproses'
              : s.value === 'SELESAI' ? 'badge-selesai'
              : 'badge-ditolak',
          })));
        }
      } catch (err) {
        console.warn('Metadata categories/statuses API fallback:', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      if (isAdmin) {
        const res = await reportsApi.getAll({
          category: filterCategory || undefined,
          status: filterStatus || undefined,
          keyword: searchKeyword || undefined,
          page: 0,
          size: 20,
        });
        const content = res?.data?.content || res?.content || res?.data || [];
        setReports(Array.isArray(content) ? content : []);
      } else {
        const res = await reportsApi.getMyReports(0, 20);
        const content = res?.data?.content || res?.content || res?.data || [];
        setReports(Array.isArray(content) ? content : []);
      }
    } catch (err) {
      setError(err?.message || 'Gagal mengambil daftar laporan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [isAdmin, filterCategory, filterStatus, searchKeyword]);

  const handleEvidenceFileUpload = async (e) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    setUploadingEvidence(true);
    setModalMessage('');
    try {
      const fileToUpload = await compressAndConvertImage(originalFile);
      const localObjectUrl = URL.createObjectURL(fileToUpload);
      setDevicePreviewUrl(localObjectUrl);

      const res = await uploadApi.uploadFile(fileToUpload, 'reports');
      const rawUrl = res?.data?.url || res?.url || res?.data?.data?.url || (typeof res?.data === 'string' ? res.data : '');
      if (rawUrl) {
        setStatusForm((prev) => ({ ...prev, evidencePhoto: rawUrl }));
        setModalMessage('Foto bukti dari device berhasil diupload!');
        setTimeout(() => setModalMessage(''), 4000);
      }
    } catch (err) {
      setError(err?.message || 'Gagal meng-upload foto dari device.');
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;
    setUploadingPhoto(true);
    setError('');
    try {
      const fileToUpload = await compressAndConvertImage(originalFile);
      const localUrl = URL.createObjectURL(fileToUpload);
      setPhotoPreviewUrl(localUrl);
      const res = await uploadApi.uploadFile(fileToUpload, 'reports');
      const rawUrl = res?.data?.url || res?.url || res?.data?.data?.url || (typeof res?.data === 'string' ? res.data : '');
      if (rawUrl) {
        setCreateForm((prev) => ({ ...prev, photoEvidence: rawUrl }));
      }
    } catch (err) {
      setError(err?.message || 'Gagal meng-upload foto bukti.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await reportsApi.create(createForm);
      setShowCreateModal(false);
      setCreateForm({ title: '', description: '', category: 'JALAN_RUSAK', location: '', latitude: null, longitude: null, photoEvidence: '' });
      setPhotoPreviewUrl('');
      setActionMessage('Laporan pengaduan berhasil dikirim!');
      fetchReports();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setError(err?.message || 'Gagal membuat laporan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenStatusModal = (reportItem) => {
    if (reportItem.status === 'SELESAI') return;
    setSelectedReport(reportItem);
    setModalMessage('');
    setDevicePreviewUrl('');
    const parsedEvidence = parseCompletionEvidence(reportItem.completionEvidence);
    setStatusForm({
      status: reportItem.status || 'DIPROSES',
      adminNotes: reportItem.adminNotes || '',
      evidencePhoto: parsedEvidence.photoUrl || '',
      evidenceNotes: parsedEvidence.notes || 'Pekerjaan penanganan pengaduan telah diselesaikan tuntas oleh pengurus RT.',
    });
    setShowStatusModal(true);
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setSubmitting(true);
    setError('');
    try {
      const completionEvidencePayload = statusForm.status === 'SELESAI'
        ? formatCompletionEvidence(statusForm.evidencePhoto, statusForm.evidenceNotes)
        : null;

      await reportsApi.updateStatus(selectedReport.id, {
        status: statusForm.status,
        adminNotes: statusForm.adminNotes,
        completionEvidence: completionEvidencePayload,
      });

      setShowStatusModal(false);
      setSelectedReport(null);
      setActionMessage('Status laporan berhasil diperbarui!');
      fetchReports();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setError(err?.message || 'Gagal memperbarui status laporan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteReport = async () => {
    if (!reportToDelete) return;
    setDeleting(true);
    try {
      await reportsApi.delete(reportToDelete.id);
      setReportToDelete(null);
      setActionMessage('Laporan berhasil dihapus.');
      fetchReports();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setError(err?.message || 'Gagal menghapus laporan.');
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenDetail = async (id) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    setError('');
    try {
      const res = await reportsApi.getById(id);
      const data = res?.data || res;
      setDetailReport(data);
    } catch (err) {
      setError(err?.message || 'Gagal memuat detail laporan.');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusBadge = (status) => {
    const found = statuses.find((s) => s.value === status);
    return (
      <span className={`badge ${found ? (found.badgeClass || 'badge-pending') : 'badge-pending'}`}>
        {found ? found.label : status}
      </span>
    );
  };

  const getCategoryLabel = (cat) => {
    const found = categories.find((c) => c.value === cat);
    return found ? found.label : cat;
  };

  return (
    <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <span className={`badge ${isAdmin ? 'badge-role-admin' : 'badge-role-warga'}`} style={{ marginBottom: '0.5rem' }}>
            {isAdmin ? 'Panel Pengurus Admin RT' : 'Portal Pengaduan Warga'}
          </span>
          <h1 style={{ fontSize: '1.85rem', margin: '0.2rem 0 0.35rem' }}>
            {isAdmin ? 'Manajemen Laporan Pengaduan' : 'Laporan Pengaduan Saya'}
          </h1>
          <p style={{ color: '#64748b' }}>
            {isAdmin
              ? 'Pantau pengaduan fasilitas/wilayah, perbarui status penanganan, dan upload bukti foto penyelesaian.'
              : 'Sampaikan pengaduan atau masalah lingkungan RT/RW Anda secara langsung ke pengurus.'}
          </p>
        </div>

        {!isAdmin && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb', color: 'white', padding: '0.8rem 1.4rem', borderRadius: '999px', fontWeight: 700, boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)' }}
          >
            <Plus size={18} /> Buat Laporan Pengaduan
          </button>
        )}
      </div>

      <SearchFilterBar
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        placeholder="Cari judul/deskripsi laporan pengaduan..."
        filters={
          isAdmin
            ? [
                {
                  value: filterCategory,
                  onChange: setFilterCategory,
                  options: categories,
                  defaultLabel: 'Semua Kategori',
                },
                {
                  value: filterStatus,
                  onChange: setFilterStatus,
                  options: statuses,
                  defaultLabel: 'Semua Status',
                },
              ]
            : []
        }
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
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>Sedang memuat laporan...</div>
      ) : reports.length === 0 ? (
        <div style={{ background: 'white', padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Belum ada laporan pengaduan</h3>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {isAdmin ? 'Tidak ada laporan pengaduan masuk saat ini.' : 'Anda belum pernah mengirimkan laporan pengaduan.'}
          </p>
          {!isAdmin && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb', color: 'white', padding: '0.75rem 1.35rem', borderRadius: '999px', fontWeight: 700 }}
            >
              <Plus size={16} /> Buat Laporan Pertama
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {reports.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
                border: item.status === 'SELESAI' ? '1px solid #bbf7d0' : '1px solid #f1f5f9',
                display: 'grid',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    {getStatusBadge(item.status)}
                    <span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px', color: '#475569', fontWeight: 600 }}>
                      {getCategoryLabel(item.category)}
                    </span>
                    {item.location && (
                      <span style={{ fontSize: '0.825rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <MapPin size={14} /> {item.location}
                      </span>
                    )}
                    {item.latitude && item.longitude && (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                        ({item.latitude.toFixed(4)}, {item.longitude.toFixed(4)})
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.3rem', margin: 0 }}>{item.title}</h2>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.825rem', color: '#94a3b8' }}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </div>
              </div>

              <p style={{ color: '#334155', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {item.description}
              </p>

              {item.photoEvidence && (
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', maxHeight: '200px' }}>
                  <img
                    src={formatImageUrl(item.photoEvidence)}
                    alt="Foto Bukti Pengaduan"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              {item.latitude && item.longitude && (
                <div className="report-mini-map">
                  <MapContainer
                    center={[item.latitude, item.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    dragging={false}
                    zoomControl={false}
                    attributionControl={false}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[item.latitude, item.longitude]} icon={redIcon} />
                  </MapContainer>
                </div>
              )}

              {isAdmin && (item.reporter || item.user) && (
                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.875rem', color: '#475569', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span><strong>Pelapor:</strong> {(item.reporter || item.user).fullName || (item.reporter || item.user).email}</span>
                  {(item.reporter || item.user).rt && <span><strong>RT:</strong> {(item.reporter || item.user).rt}</span>}
                  {(item.reporter || item.user).rw && <span><strong>RW:</strong> {(item.reporter || item.user).rw}</span>}
                </div>
              )}

              {item.adminNotes && (
                <div style={{ background: '#fffbe8', border: '1px solid #fef08a', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.875rem', color: '#854d0e', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Lightbulb size={16} style={{ color: '#ca8a04', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong>Catatan Pengurus RT:</strong> {item.adminNotes}
                  </div>
                </div>
              )}

              {item.status === 'SELESAI' && (() => {
                const { photoUrl, notes } = parseCompletionEvidence(item.completionEvidence);
                const displayPhoto = photoUrl;
                return (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '16px', display: 'grid', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 700, fontSize: '0.875rem' }}>
                      <CheckCircle2 size={18} /> Bukti Foto Penanganan Selesai (Final)
                    </div>

                    {displayPhoto && (
                      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #bbf7d0', maxHeight: '280px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <img
                          key={displayPhoto}
                          src={formatImageUrl(displayPhoto)}
                          alt="Foto Bukti Penanganan"
                          style={{ width: '100%', height: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block', position: 'absolute', top: 0, left: 0 }}
                          onLoad={(e) => {
                            e.target.style.display = 'block';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'none';
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', padding: '2rem' }}>
                          <ImageIcon size={32} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Foto Bukti Penanganan</span>
                        </div>
                      </div>
                    )}

                    {notes && (
                      <div style={{ fontSize: '0.9rem', color: '#15803d', fontWeight: 500, lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                        {notes}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleOpenDetail(item.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.6rem 1.15rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 600 }}
                >
                  <Search size={14} /> Detail
                </button>
                {isAdmin ? (
                  item.status === 'SELESAI' ? (
                    <button
                      disabled
                      type="button"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '0.6rem 1.15rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, cursor: 'not-allowed' }}
                    >
                      <Lock size={14} /> Status Selesai (Final)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenStatusModal(item)}
                      style={{ background: '#0f172a', color: 'white', padding: '0.6rem 1.15rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 600 }}
                    >
                      Ubah Status Laporan
                    </button>
                  )
                ) : (
                  item.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => setReportToDelete(item)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.6rem 1.15rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 600 }}
                    >
                      <Trash2 size={14} /> Hapus Laporan
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Buat Laporan Pengaduan Baru</h2>
            <p style={{ color: '#64748b', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              Laporkan masalah ketertiban, kebersihan, atau kerusakan fasilitas umum lingkungan RT Anda.
            </p>

            <form onSubmit={handleCreateSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Judul Laporan</label>
                <input
                  required
                  minLength={5}
                  maxLength={200}
                  className="form-input"
                  placeholder="Contoh: Lampu Jalan Mati di Depan Blok B5"
                  value={createForm.title}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Kategori Laporan</label>
                <select
                  className="form-select"
                  value={createForm.category}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <LocationPicker
                latitude={createForm.latitude}
                longitude={createForm.longitude}
                location={createForm.location}
                onLocationChange={({ latitude, longitude, location }) =>
                  setCreateForm((prev) => ({ ...prev, latitude, longitude, location }))
                }
              />

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                  <Camera size={16} /> Foto Bukti Kejadian <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div className="photo-evidence-upload">
                  <label className="photo-evidence-upload__btn">
                    <Upload size={16} /> Upload Foto Bukti dari Device
                    <input
                      type="file"
                      accept="image/*,.heic,.heif,.webp,.avif"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {uploadingPhoto && (
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#2563eb', marginTop: '0.5rem', fontWeight: 600 }}>Meng-upload foto ke server...</span>
                  )}
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                    Upload foto kondisi jalan rusak / masalah yang dilaporkan sebagai bukti.
                  </span>
                  {(photoPreviewUrl || createForm.photoEvidence) && (
                    <div className="photo-evidence-preview">
                      <img
                        src={photoPreviewUrl || formatImageUrl(createForm.photoEvidence)}
                        alt="Preview Foto Bukti"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Deskripsi Rinci</label>
                <textarea
                  required
                  rows={4}
                  minLength={10}
                  maxLength={5000}
                  className="form-textarea"
                  placeholder="Jelaskan detail masalah yang dilaporkan secara rinci..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '0.75rem 1.25rem', borderRadius: '999px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 700 }}
                >
                  {submitting ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStatusModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Ubah Status Laporan</h2>
            <p style={{ color: '#64748b', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              Ubah status untuk laporan: <strong>"{selectedReport.title}"</strong>
            </p>

            {modalMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} /> {modalMessage}
              </div>
            )}

            <form onSubmit={handleUpdateStatusSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Pilih Status Baru</label>
                <select
                  className="form-select"
                  value={statusForm.status}
                  onChange={(e) => setStatusForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  {statuses.map((st) => (
                    <option key={st.value} value={st.value}>{st.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Catatan Pengurus RT (Opsional)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Beri penjelasan perkembangan penanganan laporan..."
                  value={statusForm.adminNotes}
                  onChange={(e) => setStatusForm((prev) => ({ ...prev, adminNotes: e.target.value }))}
                />
              </div>

              {statusForm.status === 'SELESAI' && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '16px', display: 'grid', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#166534', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                      <ImageIcon size={16} /> Foto Bukti Kegiatan Selesai <span style={{ color: '#dc2626' }}>*</span>
                    </label>

                    <div style={{ background: '#ffffff', border: '1px dashed #86efac', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#16a34a', color: 'white', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                        <Upload size={16} /> Upload Foto Bukti dari Device
                        <input
                          type="file"
                          accept="image/*,.heic,.heif,.webp,.avif"
                          onChange={handleEvidenceFileUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {uploadingEvidence && <span style={{ display: 'block', fontSize: '0.8rem', color: '#15803d', marginTop: '0.4rem', fontWeight: 600 }}>Meng-upload foto ke server...</span>}
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#166534', marginTop: '0.3rem' }}>Pilih foto hasil perbaikan dari laptop / HP Anda.</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                      Atau Pilih Foto Sampel Cepat:
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {SAMPLE_EVIDENCE_PHOTOS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setDevicePreviewUrl('');
                            setStatusForm((prev) => ({ ...prev, evidencePhoto: item.url }));
                          }}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            border: (!devicePreviewUrl && statusForm.evidencePhoto === item.url) ? '2px solid #16a34a' : '1px solid #bbf7d0',
                            background: (!devicePreviewUrl && statusForm.evidencePhoto === item.url) ? '#dcfce7' : 'white',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: '#15803d',
                            cursor: 'pointer',
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(devicePreviewUrl || statusForm.evidencePhoto) && (
                    <div style={{ padding: '0.65rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ImageIcon size={15} style={{ color: '#16a34a' }} /> Pratinjau (Preview) Foto Bukti:
                      </div>
                      <div style={{ width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <img
                          key={devicePreviewUrl || statusForm.evidencePhoto}
                          src={devicePreviewUrl || formatImageUrl(statusForm.evidencePhoto)}
                          alt="Preview Foto Bukti"
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

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, color: '#166534', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                      Keterangan Hasil Perbaikan / Gotong Royong
                    </label>
                    <textarea
                      required
                      className="form-textarea"
                      rows={3}
                      placeholder="Tuliskan detail pekerjaan penanganan yang telah selesai dilakukan..."
                      value={statusForm.evidenceNotes}
                      onChange={(e) => setStatusForm((prev) => ({ ...prev, evidenceNotes: e.target.value }))}
                    />
                  </div>

                  <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                    ⚠️ Setelah status disimpan sebagai SELESAI, status laporan akan dikunci permanen (Final).
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  style={{ padding: '0.75rem 1.25rem', borderRadius: '999px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: '#0f172a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 700 }}
                >
                  {submitting ? 'Memproses...' : 'Simpan Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!reportToDelete}
        title="Hapus Laporan Pengaduan"
        message="Apakah Anda yakin ingin menghapus laporan ini? Data yang dihapus tidak dapat dikembalikan."
        confirmText={deleting ? 'Menghapus...' : 'Ya, Hapus'}
        cancelText="Batal"
        onConfirm={handleConfirmDeleteReport}
        onCancel={() => setReportToDelete(null)}
        isDestructive
      />

      {showDetailModal && (
        <div className="modal-overlay" onClick={() => { setShowDetailModal(false); setDetailReport(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h2 style={{ margin: 0 }}>Detail Laporan Pengaduan</h2>
              <button onClick={() => { setShowDetailModal(false); setDetailReport(null); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            
            {loadingDetail ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>Sedang memuat detail...</div>
            ) : detailReport ? (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {getStatusBadge(detailReport.status)}
                  <span style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '0.3rem 0.75rem', borderRadius: '8px', color: '#475569', fontWeight: 600 }}>
                    {getCategoryLabel(detailReport.category)}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {detailReport.createdAt ? new Date(detailReport.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : ''}
                  </span>
                </div>
                
                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{detailReport.title}</h3>
                
                {detailReport.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.9rem', backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                    <MapPin size={16} /> {detailReport.location}
                    {detailReport.latitude && detailReport.longitude && (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace', marginLeft: '0.5rem' }}>
                        ({detailReport.latitude.toFixed(6)}, {detailReport.longitude.toFixed(6)})
                      </span>
                    )}
                  </div>
                )}

                {detailReport.latitude && detailReport.longitude && (
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={16} /> Lokasi di Peta
                    </h4>
                    <div className="report-detail-map">
                      <MapContainer
                        center={[detailReport.latitude, detailReport.longitude]}
                        zoom={17}
                        scrollWheelZoom={true}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[detailReport.latitude, detailReport.longitude]} icon={redIcon} />
                      </MapContainer>
                    </div>
                  </div>
                )}

                {detailReport.photoEvidence && (
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Camera size={16} /> Foto Bukti Pengaduan
                    </h4>
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <img
                        src={formatImageUrl(detailReport.photoEvidence)}
                        alt="Foto Bukti Pengaduan"
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: '#f1f5f9' }}
                      />
                    </div>
                  </div>
                )}
                
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#0f172a' }}>Deskripsi Masalah:</h4>
                  <p style={{ margin: 0, color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{detailReport.description}</p>
                </div>

                {(detailReport.reporter || detailReport.user) && (
                  <div style={{ background: '#f1f5f9', padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.9rem', color: '#334155', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                    <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Dilaporkan Oleh</span><strong>{(detailReport.reporter || detailReport.user).fullName || (detailReport.reporter || detailReport.user).email}</strong></div>
                    {(detailReport.reporter || detailReport.user).rt && <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>RT</span><strong>{(detailReport.reporter || detailReport.user).rt}</strong></div>}
                    {(detailReport.reporter || detailReport.user).rw && <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>RW</span><strong>{(detailReport.reporter || detailReport.user).rw}</strong></div>}
                  </div>
                )}

                {detailReport.adminNotes && (
                  <div style={{ background: '#fffbe8', border: '1px solid #fef08a', padding: '1rem', borderRadius: '12px', color: '#854d0e' }}>
                    <h4 style={{ margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                      <Lightbulb size={18} style={{ color: '#ca8a04' }} /> Catatan Pengurus RT
                    </h4>
                    <p style={{ margin: 0, lineHeight: '1.5' }}>{detailReport.adminNotes}</p>
                  </div>
                )}

                {detailReport.status === 'SELESAI' && (() => {
                  const { photoUrl, notes } = parseCompletionEvidence(detailReport.completionEvidence);
                  return (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontSize: '0.95rem' }}>
                        <CheckCircle2 size={18} /> Bukti Penyelesaian
                      </h4>
                      {photoUrl && (
                        <div style={{ marginBottom: '0.75rem', borderRadius: '8px', overflow: 'hidden' }}>
                          <img src={formatImageUrl(photoUrl)} alt="Bukti Selesai" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: '#000' }} />
                        </div>
                      )}
                      {notes && <p style={{ margin: 0, color: '#15803d', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{notes}</p>}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div style={{ color: '#dc2626', textAlign: 'center', padding: '2rem' }}>Laporan tidak ditemukan.</div>
            )}
            
            <div style={{ marginTop: '1.5rem', textAlign: 'right', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button type="button" onClick={() => { setShowDetailModal(false); setDetailReport(null); }} className="btn btn-secondary">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
