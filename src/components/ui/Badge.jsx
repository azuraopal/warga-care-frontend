import './Badge.css';

const STATUS_MAP = {
  PENDING: { label: 'Menunggu', className: 'badge-pending' },
  DIPROSES: { label: 'Diproses', className: 'badge-process' },
  SELESAI: { label: 'Selesai', className: 'badge-done' },
  DITOLAK: { label: 'Ditolak', className: 'badge-rejected' },
};

const CATEGORY_MAP = {
  JALAN_RUSAK: 'Jalan Rusak',
  SAMPAH: 'Sampah',
  LAMPU_MATI: 'Lampu Mati',
  BANJIR: 'Banjir',
  HEWAN_HILANG: 'Hewan Hilang',
  BANTUAN_WARGA: 'Bantuan Warga',
  KEAMANAN: 'Keamanan',
  LAINNYA: 'Lainnya',
};

export function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { label: status, className: '' };
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}

export function CategoryBadge({ category }) {
  const label = CATEGORY_MAP[category] || category;
  return <span className="badge badge-category">{label}</span>;
}

export function PinnedBadge() {
  return <span className="badge badge-pinned">📌 Disematkan</span>;
}
