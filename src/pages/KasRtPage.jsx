import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { kasApi, KAS_CATEGORIES } from '../api/kas';
import ConfirmModal from '../components/ui/ConfirmModal';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Calendar,
  UserCheck,
  ShieldCheck,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Trash2,
  Pencil,
  GraduationCap,
  Briefcase,
  MessageSquare,
  Megaphone,
  User,
  Info
} from 'lucide-react';

export default function KasRtPage() {
  const { user, isAdmin } = useAuth();
  const userRt = user?.rt || 'RT 01';

  const [activeTab, setActiveTab] = useState(isAdmin ? 'transactions' : 'iuran');

  const [summary, setSummary] = useState({
    currentBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    monthIncome: 0,
    monthExpense: 0,
    transactionCount: 0
  });

  const [transactions, setTransactions] = useState([]);
  const [loadingTxs, setLoadingTxs] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [iuranList, setIuranList] = useState([]);
  const [loadingIuran, setLoadingIuran] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2026-08');

  const [iuranMode, setIuranMode] = useState('weekly');
  const [selectedWeek, setSelectedWeek] = useState('2026-W33');
  const [weeklyIuranList, setWeeklyIuranList] = useState([]);
  const [showRegisterWargaModal, setShowRegisterWargaModal] = useState(false);
  const [registerWargaForm, setRegisterWargaForm] = useState({
    wargaName: '',
    blockAddress: '',
    category: 'PEKERJA'
  });

  const [showTxModal, setShowTxModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [txForm, setTxForm] = useState({
    type: 'INCOME',
    title: '',
    amount: '',
    category: KAS_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    notes: '',
    proofUrl: ''
  });

  const [showIuranModal, setShowIuranModal] = useState(false);
  const [iuranForm, setIuranForm] = useState({
    wargaName: '',
    blockAddress: '',
    periodMonth: '2026-08',
    amount: 50000,
    paymentMethod: 'Tunai'
  });

  const [proofPreviewUrl, setProofPreviewUrl] = useState(null);
  const [txToDelete, setTxToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);
  const [showReportPreviewModal, setShowReportPreviewModal] = useState(false);

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
    fetchIuran();
    fetchWeeklyIuran();
  }, [typeFilter, categoryFilter, searchKeyword, selectedMonth, selectedWeek]);

  const fetchSummary = async () => {
    try {
      const res = await kasApi.getSummary(userRt);
      const data = res?.data || res;
      if (data) {
        setSummary({
          currentBalance: Number(data.currentBalance || 0),
          totalIncome: Number(data.totalIncome || 0),
          totalExpense: Number(data.totalExpense || 0),
          monthIncome: Number(data.monthIncome || 0),
          monthExpense: Number(data.monthExpense || 0),
          transactionCount: Number(data.transactionCount || 0)
        });
      }
    } catch (err) {
      console.error('Gagal mengambil ringkasan kas:', err);
    }
  };

  const fetchTransactions = async () => {
    setLoadingTxs(true);
    try {
      const res = await kasApi.getTransactions({
        rt: userRt,
        type: typeFilter,
        category: categoryFilter,
        search: searchKeyword
      });
      const list = res?.data || res || [];
      setTransactions(Array.isArray(list) ? list : []);
    } catch (err) {
      setErrorMsg(err?.message || 'Gagal memuat transaksi Kas RT');
    } finally {
      setLoadingTxs(false);
    }
  };

  const ensureUserExists = (list, isWeekly = false) => {
    const rawList = Array.isArray(list) ? list : [];
    const myName = user?.fullName || user?.name || user?.username;
    if (!myName) return rawList;

    const lowerMyName = myName.toLowerCase();
    const exists = rawList.some(w => {
      const wname = (w.wargaName || w.name || '').toLowerCase();
      return wname.includes(lowerMyName) || lowerMyName.includes(wname);
    });

    if (!exists) {
      const category = user?.occupationCategory || 'PEKERJA';
      const rate = category === 'PELAJAR' ? 2000 : 5000;
      const newRow = isWeekly ? {
        wargaMasterId: `user-${user?.id || Date.now()}`,
        wargaName: myName,
        blockAddress: user?.blockAddress || user?.block || 'Blok A No. 01',
        rt: userRt,
        category: category,
        categoryLabel: category === 'PELAJAR' ? 'Pelajar / Sekolah' : 'Sudah Bekerja',
        weeklyDuesRate: rate,
        periodWeek: selectedWeek,
        isPaid: false,
        paidDate: null,
        paymentMethod: null,
        totalArrearsWeeks: 1,
        totalArrearsAmount: rate
      } : {
        id: `user-${user?.id || Date.now()}`,
        name: myName,
        wargaName: myName,
        block: user?.blockAddress || user?.block || 'Blok A No. 01',
        blockAddress: user?.blockAddress || user?.block || 'Blok A No. 01',
        rt: userRt,
        monthlyDues: 50000,
        status: {}
      };
      return [newRow, ...rawList];
    }
    return rawList;
  };

  const fetchIuran = async () => {
    setLoadingIuran(true);
    try {
      const res = await kasApi.getIuranWarga(userRt);
      const list = res?.data || res || [];
      setIuranList(ensureUserExists(list, false));
    } catch (err) {
      console.error('Gagal memuat iuran warga:', err);
    } finally {
      setLoadingIuran(false);
    }
  };

  const fetchWeeklyIuran = async () => {
    try {
      const res = await kasApi.getIuranWeekly(selectedWeek);
      const list = res?.data || res || [];
      setWeeklyIuranList(ensureUserExists(list, true));
    } catch (err) {
      console.error('Gagal memuat iuran mingguan:', err);
    }
  };

  const handleRegisterWargaSubmit = async (e) => {
    e.preventDefault();
    if (!registerWargaForm.wargaName.trim()) {
      setErrorMsg('Nama warga wajib diisi');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await kasApi.registerMasterWarga({
        wargaName: registerWargaForm.wargaName,
        blockAddress: registerWargaForm.blockAddress,
        category: registerWargaForm.category
      });
      showToast(`Berhasil mendaftarkan warga tetap: ${registerWargaForm.wargaName}`);
      setShowRegisterWargaModal(false);
      setRegisterWargaForm({ wargaName: '', blockAddress: '', category: 'PEKERJA' });
      fetchWeeklyIuran();
      fetchIuran();
    } catch (err) {
      setErrorMsg(err?.message || 'Gagal mendaftarkan warga tetap');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayWeekly1Click = async (warga) => {
    setSubmitting(true);
    try {
      await kasApi.payIuranWeekly({
        wargaMasterId: warga.wargaMasterId,
        wargaName: warga.wargaName,
        periodWeek: selectedWeek,
        paymentMethod: 'Tunai',
        amount: warga.weeklyDuesRate
      });
      showToast(`Iuran mingguan ${warga.wargaName} (${selectedWeek}) berhasil dicatat LUNAS!`);
      fetchWeeklyIuran();
      fetchSummary();
      fetchTransactions();
    } catch (err) {
      setErrorMsg(err?.message || 'Gagal mencatat pelunasan iuran mingguan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendWaReminderWeekly = (w) => {
    const categoryLabel = w.category === 'PELAJAR' ? 'Pelajar / Sekolah (Rp 2.000/minggu)' : 'Sudah Bekerja (Rp 5.000/minggu)';
    const rateStr = `Rp ${Number(w.weeklyDuesRate || (w.category === 'PELAJAR' ? 2000 : 5000)).toLocaleString('id-ID')}`;
    const text = `Halo Sdr/i *${w.wargaName}* (${w.blockAddress || 'Warga RT'}),\n\n` +
      `Pengingat Penagihan Iuran Kas Mingguan *${userRt}* periode *${selectedWeek}*:\n` +
      `- Kategori: ${categoryLabel}\n` +
      `- Nominal Tagihan: *${rateStr}*\n` +
      `- Status: MENUNGGAK\n\n` +
      `Mohon dapat disetorkan kepada Pengurus/Admin RT. Terima kasih atas partisipasi dan kerja samanya!\n\n` +
      `— Pengurus ${userRt} (WargaCare)`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendWaReminderMonthly = (w) => {
    const name = w.wargaName || w.name;
    const block = w.blockAddress || w.block || 'Warga RT';
    const text = `Halo Sdr/i *${name}* (${block}),\n\n` +
      `Pengingat Penagihan Iuran Kas Bulanan *${userRt}* periode *${selectedMonth}*:\n` +
      `- Nominal Tagihan: *Rp 50.000*\n` +
      `- Status: BELUM BAYAR\n\n` +
      `Mohon dapat disetorkan kepada Pengurus/Admin RT. Terima kasih atas partisipasi dan kebersamaannya!\n\n` +
      `— Pengurus ${userRt} (WargaCare)`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleOpenCreateTx = () => {
    setEditingTx(null);
    setTxForm({
      type: 'INCOME',
      title: '',
      amount: '',
      category: KAS_CATEGORIES[0],
      date: new Date().toISOString().split('T')[0],
      notes: '',
      proofUrl: ''
    });
    setShowTxModal(true);
  };

  const handleOpenEditTx = (tx) => {
    setEditingTx(tx);
    setTxForm({
      type: tx.type || 'INCOME',
      title: tx.title || '',
      amount: tx.amount || '',
      category: tx.category || KAS_CATEGORIES[0],
      date: tx.date ? tx.date.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: tx.notes || '',
      proofUrl: tx.proofUrl || ''
    });
    setShowTxModal(true);
  };

  const handleSaveTx = async (e) => {
    e.preventDefault();
    if (!txForm.title || !txForm.amount) {
      setErrorMsg('Judul transaksi dan nominal wajib diisi.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        ...txForm,
        rt: userRt,
        amount: Number(txForm.amount)
      };

      if (editingTx) {
        await kasApi.updateTransaction(editingTx.id, payload);
        showToast('Berhasil memperbarui transaksi Kas RT');
      } else {
        await kasApi.createTransaction(payload);
        showToast('Berhasil mencatat transaksi Kas RT baru');
      }

      setShowTxModal(false);
      fetchSummary();
      fetchTransactions();
    } catch (err) {
      setErrorMsg(err?.message || 'Gagal menyimpan transaksi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTx = async () => {
    if (!txToDelete) return;
    setSubmitting(true);
    try {
      await kasApi.deleteTransaction(txToDelete.id);
      showToast('Berhasil menghapus transaksi kas.');
      setTxToDelete(null);
      fetchSummary();
      fetchTransactions();
    } catch (err) {
      showToast(err?.message || 'Gagal menghapus transaksi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPayIuran = (wargaName = '', block = '') => {
    setIuranForm({
      wargaName: wargaName || '',
      blockAddress: block || '',
      periodMonth: selectedMonth,
      amount: 50000,
      paymentMethod: 'Tunai'
    });
    setShowIuranModal(true);
  };

  const handleSaveIuran = async (e) => {
    e.preventDefault();
    if (!iuranForm.wargaName) {
      setErrorMsg('Nama warga wajib diisi');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      await kasApi.payIuran({
        wargaName: iuranForm.wargaName,
        blockAddress: iuranForm.blockAddress,
        periodMonth: iuranForm.periodMonth,
        amount: Number(iuranForm.amount),
        paymentMethod: iuranForm.paymentMethod,
        recordedBy: user?.fullName || `Admin ${userRt}`
      });

      showToast(`Berhasil mencatat pembayaran iuran ${iuranForm.wargaName}`);
      setShowIuranModal(false);
      fetchSummary();
      fetchTransactions();
      fetchIuran();
    } catch (err) {
      setErrorMsg(err?.message || 'Gagal mencatat pembayaran iuran');
    } finally {
      setSubmitting(false);
    }
  };

  const getFormattedFileName = () => {
    const monthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).replace(/\s+/g, '_');
    const rtClean = (userRt || 'RT').replace(/[^a-zA-Z0-9]/g, '_');
    return `Laporan_Kas_${rtClean}_Periode_${monthName}`;
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'RT', 'Tanggal', 'Jenis', 'Judul', 'Kategori', 'Nominal (Rp)', 'Pencatat', 'Catatan'];
    const rows = transactions.map(t => [
      t.id,
      t.rt,
      t.date,
      t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.amount,
      `"${t.recordedBy || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileName = `${getFormattedFileName()}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Rekapitulasi Kas berhasil di-export (${fileName})`);
  };

  const handleOpenPreviewReport = () => {
    setShowReportPreviewModal(true);
  };

  const handleDirectDownloadPdf = () => {
    const originalTitle = document.title;
    document.title = getFormattedFileName();
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleCopyBroadCastMsg = () => {
    const monthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    return `*LAPORAN KAS & REKAPITULASI KEUANGAN ${userRt.toUpperCase()}*

*Total Saldo Kas RT Saat Ini:* Rp ${summary.currentBalance.toLocaleString('id-ID')}
*Pemasukan (${monthName}):* Rp ${summary.monthIncome.toLocaleString('id-ID')}
*Pengeluaran (${monthName}):* Rp ${summary.monthExpense.toLocaleString('id-ID')}

*Ringkasan Transaksi Terakhir:*
${transactions.slice(0, 5).map(t => `- [${t.date}] ${t.type === 'INCOME' ? '(+)' : '(-)'} ${t.title}: Rp ${Number(t.amount).toLocaleString('id-ID')}`).join('\n')}

Laporan ini dibuat otomatis secara transparan melalui sistem *WargaCare*.
Tertanda,
*Pengurus ${userRt}*`;
  };

  const handleCopyBroadcast = () => {
    navigator.clipboard.writeText(generateBroadcastText());
    setCopiedBroadcast(true);
    setTimeout(() => setCopiedBroadcast(false), 3000);
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '2rem 1.25rem' }}>

      {notification && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, background: '#0f172a', color: 'white', padding: '0.85rem 1.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={18} color="#22c55e" />
          <span style={{ fontSize: '0.925rem', fontWeight: 600 }}>{notification}</span>
        </div>
      )}

      <div className="no-print" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', borderRadius: '24px', padding: '2rem 2.25rem', color: 'white', marginBottom: '2rem', boxShadow: '0 12px 30px rgba(37, 99, 235, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <Building size={14} />
            <span>Manajemen Uang Kas Lingkungan</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Kas {userRt}
          </h1>
          <p style={{ margin: '0.5rem 0 0', opacity: 0.9, fontSize: '0.975rem' }}>
            {isAdmin ? `Anda login sebagai Admin ${userRt}. Kelola transaksi dan iuran warga secara transparan.` : `Status pembayaran kas/iuran lingkungan ${userRt} milik Anda.`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isAdmin && (
            <>
              <button
                onClick={handleOpenCreateTx}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', color: '#1e3a8a', padding: '0.75rem 1.25rem', borderRadius: '14px', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                <Plus size={18} /> Catat Transaksi Kas
              </button>
              <button
                onClick={handleExportCSV}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.75rem 1.1rem', borderRadius: '14px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <Download size={16} /> Export CSV
              </button>
              <button
                onClick={handleOpenPreviewReport}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.25)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '0.75rem 1.1rem', borderRadius: '14px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <Printer size={16} /> Preview & Cetak PDF
              </button>
            </>
          )}
        </div>
      </div>

      <div className="no-print" style={{ background: 'linear-gradient(135deg, #fffbe8 0%, #fef3c7 100%)', border: '1px solid #fde68a', borderRadius: '20px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(245, 158, 11, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#78350f', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Megaphone size={18} /> Pemberitahuan: Jadwal Penagihan Kas RT Hari Minggu
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' }}>
                Penagihan Hari Ini (Minggu)
              </span>
            </div>
            <p style={{ margin: '0 0 0.4rem', color: '#92400e', fontSize: '0.875rem', lineHeight: '1.5' }}>
              Hari ini adalah jadwal penagihan uang kas mingguan lingkungan <strong>{userRt}</strong> oleh Pengurus RT. Mohon warga menyiapkan iuran kas (Pelajar: Rp 2.000 / Pekerja: Rp 5.000).
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.825rem', color: '#78350f', fontWeight: 700, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'white', padding: '0.25rem 0.65rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <User size={14} /> Ketua RT {userRt}: <strong>Bpk. H. Ahmad Subagja</strong>
              </span>
              <span style={{ color: '#b45309', fontWeight: 600 }}>
                Jadwal Penagihan: Setiap Hari Minggu
              </span>
            </div>
          </div>
        </div>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Halo Pak Ketua RT ${userRt} (Bpk. H. Ahmad Subagja), saya ${user?.fullName || 'Warga'} mau konfirmasi/lunas pembayaran iuran kas RT.`)}`}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#25D366', color: 'white', padding: '0.65rem 1.1rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)', whiteSpace: 'nowrap' }}
        >
          <MessageSquare size={16} /> Hubungi Ketua RT
        </a>
      </div>

      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>

        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Saldo Kas RT Saat Ini</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Rp {summary.currentBalance.toLocaleString('id-ID')}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
            <ShieldCheck size={14} /> Terverifikasi per-RT
          </span>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Total Pemasukan</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a' }}>
            Rp {summary.totalIncome.toLocaleString('id-ID')}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', display: 'block' }}>
            Bulan Ini: Rp {summary.monthIncome.toLocaleString('id-ID')}
          </span>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Total Pengeluaran</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626' }}>
            Rp {summary.totalExpense.toLocaleString('id-ID')}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', display: 'block' }}>
            Bulan Ini: Rp {summary.monthExpense.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {isAdmin ? (
          <>
            <button
              onClick={() => setActiveTab('transactions')}
              style={{ padding: '0.85rem 1.25rem', fontWeight: 700, fontSize: '0.925rem', color: activeTab === 'transactions' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'transactions' ? '3px solid #2563eb' : '3px solid transparent', background: 'none' }}
            >
              Riwayat Transaksi Kas
            </button>
            <button
              onClick={() => setActiveTab('iuran')}
              style={{ padding: '0.85rem 1.25rem', fontWeight: 700, fontSize: '0.925rem', color: activeTab === 'iuran' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'iuran' ? '3px solid #2563eb' : '3px solid transparent', background: 'none' }}
            >
              Matriks Iuran Warga
            </button>
            <button
              onClick={() => setActiveTab('recap')}
              style={{ padding: '0.85rem 1.25rem', fontWeight: 700, fontSize: '0.925rem', color: activeTab === 'recap' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'recap' ? '3px solid #2563eb' : '3px solid transparent', background: 'none' }}
            >
              Rekapitulasi Keuangan
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              style={{ padding: '0.85rem 1.25rem', fontWeight: 700, fontSize: '0.925rem', color: activeTab === 'broadcast' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'broadcast' ? '3px solid #2563eb' : '3px solid transparent', background: 'none' }}
            >
              Bagikan ke WA Warga
            </button>
          </>
        ) : (
          <button
            onClick={() => setActiveTab('iuran')}
            style={{ padding: '0.85rem 1.25rem', fontWeight: 700, fontSize: '0.925rem', color: '#2563eb', borderBottom: '3px solid #2563eb', background: 'none' }}
          >
            Status Iuran Kas Saya
          </button>
        )}
      </div>

      {activeTab === 'transactions' && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }}>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Cari transaksi kas..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: 'white' }}
              >
                <option value="ALL">Semua Jenis</option>
                <option value="INCOME">Pemasukan (+)</option>
                <option value="EXPENSE">Pengeluaran (-)</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: 'white' }}
              >
                <option value="ALL">Semua Kategori</option>
                {KAS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenCreateTx}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb', color: 'white', padding: '0.65rem 1.1rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.875rem' }}
              >
                <Plus size={16} /> Tambah Transaksi
              </button>
            )}
          </div>

          {loadingTxs ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Memuat data transaksi kas...</div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <FileText size={40} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>Belum ada transaksi kas tercatat</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Pencatatan kas untuk {userRt} masih kosong atau filter tidak cocok.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Tanggal</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Jenis</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Judul & Kategori</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Nominal</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Pencatat / Catatan</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', fontWeight: 600, color: '#334155' }}>
                        {t.date ? new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {t.type === 'INCOME' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.65rem', borderRadius: '999px', background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.775rem' }}>
                            <ArrowUpRight size={14} /> Pemasukan
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.65rem', borderRadius: '999px', background: '#fee2e2', color: '#b91c1c', fontWeight: 700, fontSize: '0.775rem' }}>
                            <ArrowDownRight size={14} /> Pengeluaran
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{t.title}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.2rem' }}>
                          {t.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, fontSize: '0.95rem', color: t.type === 'INCOME' ? '#15803d' : '#b91c1c' }}>
                        {t.type === 'INCOME' ? '+' : '-'} Rp {Number(t.amount).toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                        <div>{t.recordedBy || 'Admin RT'}</div>
                        {t.notes && <div style={{ fontSize: '0.8rem', italic: 'true', color: '#475569' }}>"{t.notes}"</div>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {t.proofUrl && (
                          <button
                            onClick={() => setProofPreviewUrl(t.proofUrl)}
                            title="Lihat Bukti"
                            style={{ padding: '0.4rem', color: '#2563eb', background: '#eff6ff', borderRadius: '8px', marginRight: '0.35rem' }}
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEditTx(t)}
                              title="Edit Transaksi"
                              style={{ padding: '0.4rem', color: '#475569', background: '#f1f5f9', borderRadius: '8px', marginRight: '0.35rem' }}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setTxToDelete(t)}
                              title="Hapus Transaksi"
                              style={{ padding: '0.4rem', color: '#dc2626', background: '#fee2e2', borderRadius: '8px' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'iuran' && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
                  {isAdmin ? `Matriks Iuran & Kas Warga ${userRt}` : `Status Pembayaran Kas Saya (${userRt})`}
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', background: '#eff6ff', color: '#2563eb' }}>
                  {iuranMode === 'weekly' ? 'Penagihan Perminggu' : 'Penagihan Perbulan'}
                </span>
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                Data warga tetap {userRt}. Tarif mingguan: <strong>Pelajar = Rp 2.000 / mg</strong> | <strong>Pekerja = Rp 5.000 / mg</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIuranMode('weekly')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: iuranMode === 'weekly' ? '#2563eb' : 'transparent',
                    color: iuranMode === 'weekly' ? 'white' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Kas Perminggu
                </button>
                <button
                  type="button"
                  onClick={() => setIuranMode('monthly')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: iuranMode === 'monthly' ? '#2563eb' : 'transparent',
                    color: iuranMode === 'monthly' ? 'white' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Kas Perbulan
                </button>
              </div>

              {iuranMode === 'weekly' ? (
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: 'white', fontWeight: 600 }}
                >
                  <option value="2026-W33">Minggu Ke-33 (11 - 17 Agu 2026)</option>
                  <option value="2026-W34">Minggu Ke-34 (18 - 24 Agu 2026)</option>
                  <option value="2026-W35">Minggu Ke-35 (25 - 31 Agu 2026)</option>
                  <option value="2026-W36">Minggu Ke-36 (01 - 07 Sep 2026)</option>
                </select>
              ) : (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              )}

              {isAdmin && (
                <>
                  <button
                    onClick={() => setShowRegisterWargaModal(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#0284c7', color: 'white', padding: '0.55rem 0.9rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.825rem' }}
                  >
                    <Plus size={15} /> Tambah Warga Tetap
                  </button>

                  <button
                    onClick={() => handleOpenPayIuran()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#16a34a', color: 'white', padding: '0.55rem 0.9rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.825rem' }}
                  >
                    <UserCheck size={15} /> Form Bayar Bebas
                  </button>
                </>
              )}
            </div>
          </div>

          {!isAdmin && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', color: '#0f172a' }}>
                  Status Tagihan & Iuran Kas Sdr/i {user?.fullName || user?.name || 'Warga'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Lokasi: {userRt} | Status diperbarui secara otomatis oleh Pengurus RT.
                </p>
              </div>
              <div style={{ fontSize: '0.825rem', color: '#475569', background: '#ffffff', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Info size={15} style={{ color: '#2563eb' }} /> Jika status belum sesuai, Anda dapat mengonfirmasi ke Pengurus RT.
              </div>
            </div>
          )}

          {iuranMode === 'weekly' ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Nama Warga</th>
                    <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Blok / Rumah</th>
                    <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Kategori & Tarif</th>
                    <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Status ({selectedWeek})</th>
                    <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Tgl & Metode</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {isAdmin ? 'Aksi Penagihan' : 'Status / Aksi'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(isAdmin ? weeklyIuranList : weeklyIuranList.filter(w => {
                    const uname = (user?.fullName || user?.name || '').toLowerCase();
                    if (!uname) return true;
                    const wname = (w.wargaName || w.name || '').toLowerCase();
                    return wname.includes(uname) || uname.includes(wname);
                  })).map((w) => (
                    <tr key={w.wargaMasterId || w.wargaName} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {w.wargaName}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {w.blockAddress || 'Blok A'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        {w.category === 'PELAJAR' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: '#fef3c7', color: '#b45309', fontWeight: 700, fontSize: '0.775rem', whiteSpace: 'nowrap' }}>
                            <GraduationCap size={14} /> Pelajar (Rp 2.000 / mg)
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700, fontSize: '0.775rem', whiteSpace: 'nowrap' }}>
                            <Briefcase size={14} /> Bekerja (Rp 5.000 / mg)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        {w.isPaid ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: '999px', background: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            <CheckCircle2 size={14} /> LUNAS
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: '999px', background: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            <AlertCircle size={14} /> MENUNGGAK ({w.totalArrearsWeeks || 1} Mgg)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {w.isPaid ? (
                          <div>
                            <span>{w.paidDate || 'Hari ini'}</span>
                            <span style={{ background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
                              {w.paymentMethod || 'Tunai'}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.8rem' }}>Tunggakan: Rp {Number(w.weeklyDuesRate).toLocaleString('id-ID')}</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {isAdmin && !w.isPaid && (
                          <>
                            <button
                              onClick={() => handleSendWaReminderWeekly(w)}
                              title="Ingatkan Warga via WhatsApp"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.45rem 0.75rem',
                                borderRadius: '8px',
                                background: '#25D366',
                                color: 'white',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: 'none',
                                marginRight: '0.4rem',
                                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)'
                              }}
                            >
                              <MessageSquare size={14} /> Tagih WA
                            </button>
                            <button
                              onClick={() => handlePayWeekly1Click(w)}
                              disabled={submitting}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                background: '#16a34a',
                                color: 'white',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: 'none',
                                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)'
                              }}
                            >
                              <CheckCircle2 size={14} /> Catat Lunas (Rp {Number(w.weeklyDuesRate).toLocaleString('id-ID')})
                            </button>
                          </>
                        )}
                        {!isAdmin && !w.isPaid && (
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Halo Pak RT ${userRt} (Bpk. H. Ahmad Subagja), saya ${user?.fullName || w.wargaName} mau konfirmasi/bayar iuran kas RT.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.45rem 0.85rem',
                              borderRadius: '8px',
                              background: '#25D366',
                              color: 'white',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)'
                            }}
                          >
                            <MessageSquare size={14} /> Konfirmasi ke RT
                          </a>
                        )}
                        {w.isPaid && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                            <CheckCircle2 size={14} /> Lunas
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Nama Warga</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Blok / Rumah</th>
                    <th style={{ padding: '0.85rem 1rem' }}>RT</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status Periode ({selectedMonth})</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Tgl Bayar & Metode</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      {isAdmin ? 'Aksi' : 'Status / Aksi'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(isAdmin ? iuranList : iuranList.filter(w => {
                    const uname = (user?.fullName || user?.name || '').toLowerCase();
                    if (!uname) return true;
                    const wname = (w.wargaName || w.name || w.user?.fullName || '').toLowerCase();
                    return wname.includes(uname) || uname.includes(wname);
                  })).map((w) => {
                    const monthStatus = w.status ? w.status[selectedMonth] : null;
                    const isPaid = monthStatus ? monthStatus.paid : w.isPaid;
                    return (
                      <tr key={w.id || w.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                          {w.wargaName || w.name}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                          {w.blockAddress || w.block || 'Blok A'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#2563eb' }}>
                          {w.rt || userRt}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {isPaid ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: '999px', background: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.8rem' }}>
                              <CheckCircle2 size={14} /> LUNAS
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: '999px', background: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: '0.8rem' }}>
                              <AlertCircle size={14} /> MENUNGGAK
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                          {isPaid ? (
                            <div>
                              <span>{monthStatus?.date || w.paidDate || '2026-08-01'}</span>
                              <span style={{ background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                {monthStatus?.method || w.paymentMethod || 'Tunai'}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.8rem' }}>Belum Bayar</span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {isAdmin && !isPaid && (
                            <>
                              <button
                                onClick={() => handleSendWaReminderMonthly(w)}
                                title="Ingatkan Warga via WhatsApp"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.45rem 0.75rem',
                                  borderRadius: '8px',
                                  background: '#25D366',
                                  color: 'white',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: 'none',
                                  marginRight: '0.4rem',
                                  boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)'
                                }}
                              >
                                <MessageSquare size={14} /> Tagih WA
                              </button>
                              <button
                                onClick={() => handleOpenPayIuran(w.wargaName || w.name, w.blockAddress || w.block)}
                                style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', background: '#16a34a', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}
                              >
                                Catat Lunas
                              </button>
                            </>
                          )}
                          {!isAdmin && !isPaid && (
                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(`Halo Pak RT ${userRt} (Bpk. H. Ahmad Subagja), saya ${user?.fullName || w.wargaName || w.name} mau konfirmasi/bayar iuran kas RT.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                background: '#25D366',
                                color: 'white',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)'
                              }}
                            >
                              <MessageSquare size={14} /> Konfirmasi ke RT
                            </a>
                          )}
                          {isPaid && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                              <CheckCircle2 size={14} /> Lunas
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'recap' && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }} className="recap-print-document">
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.35rem' }}>Laporan Rekapitulasi Kas {userRt}</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Format siap cetak dokumen resmi pertanggungjawaban pengurus.</p>
            </div>
            <button
              onClick={handleOpenPreviewReport}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', color: 'white', padding: '0.7rem 1.4rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}
            >
              <Printer size={18} /> Preview & Cetak PDF
            </button>
          </div>

          <div id={showReportPreviewModal ? undefined : "printable-report-document"} className="printable-report-body">
            <div style={{ textAlign: 'center', borderBottom: '3px double #0f172a', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                WARGACARE · RUKUN TETANGGA
              </div>
              <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                RUKUN TETANGGA {userRt}
              </h1>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 700, color: '#334155' }}>
                LAPORAN PERTANGGUNGJAWABAN & REKAPITULASI KAS RT
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span><strong>Periode:</strong> {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                <span><strong>Tanggal Cetak:</strong> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span><strong>Penanggung Jawab:</strong> Admin {userRt}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Saldo Akhir Kas</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                  Rp {summary.currentBalance.toLocaleString('id-ID')}
                </div>
              </div>
              <div style={{ background: '#f0fdf4', padding: '1.1rem', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase' }}>Total Pemasukan</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem' }}>
                  Rp {summary.totalIncome.toLocaleString('id-ID')}
                </div>
              </div>
              <div style={{ background: '#fef2f2', padding: '1.1rem', borderRadius: '12px', border: '1px solid #fecaca', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase' }}>Total Pengeluaran</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#dc2626', marginTop: '0.25rem' }}>
                  Rp {summary.totalExpense.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.1rem', background: '#ffffff' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 800, color: '#16a34a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingUp size={16} /> Breakdown Pemasukan per Kategori
                </h4>
                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    {KAS_CATEGORIES.map(cat => {
                      const catTotal = transactions
                        .filter(t => t.type === 'INCOME' && t.category === cat)
                        .reduce((acc, curr) => acc + Number(curr.amount), 0);
                      const percent = summary.totalIncome > 0 ? ((catTotal / summary.totalIncome) * 100).toFixed(1) : 0;
                      return (
                        <tr key={cat} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '0.4rem 0', color: '#334155', fontWeight: 600 }}>{cat}</td>
                          <td style={{ padding: '0.4rem 0', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            Rp {catTotal.toLocaleString('id-ID')} <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>({percent}%)</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.1rem', background: '#ffffff' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 800, color: '#dc2626', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingDown size={16} /> Breakdown Pengeluaran per Kategori
                </h4>
                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    {KAS_CATEGORIES.map(cat => {
                      const catTotal = transactions
                        .filter(t => t.type === 'EXPENSE' && t.category === cat)
                        .reduce((acc, curr) => acc + Number(curr.amount), 0);
                      const percent = summary.totalExpense > 0 ? ((catTotal / summary.totalExpense) * 100).toFixed(1) : 0;
                      return (
                        <tr key={cat} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '0.4rem 0', color: '#334155', fontWeight: 600 }}>{cat}</td>
                          <td style={{ padding: '0.4rem 0', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            Rp {catTotal.toLocaleString('id-ID')} <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>({percent}%)</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                Transaksi Terakhir (Buku Kas RT)
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#334155', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Tanggal</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Jenis</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Kategori</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Keterangan / Judul</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((t, idx) => (
                    <tr key={t.id || idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap', fontWeight: 600, color: '#475569' }}>{t.date}</td>
                      <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 700, color: t.type === 'INCOME' ? '#16a34a' : '#dc2626' }}>
                          {t.type === 'INCOME' ? '(+) Pemasukan' : '(-) Pengeluaran'}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap', color: '#64748b' }}>{t.category}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#0f172a', fontWeight: 600 }}>{t.title}</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 800, color: t.type === 'INCOME' ? '#15803d' : '#b91c1c' }}>
                        Rp {Number(t.amount).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', textAlign: 'center', pageBreakInside: 'avoid' }}>
              <div style={{ width: '200px' }}>
                <p style={{ margin: '0 0 3.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                  Mengetahui,<br /><strong>Bendahara {userRt}</strong>
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #0f172a', fontWeight: 800, fontSize: '0.85rem', paddingBottom: '0.15rem', color: '#0f172a', whiteSpace: 'nowrap' }}>
                  <span>(</span>
                  <span style={{ color: '#94a3b8', letterSpacing: '1.5px' }}>....................</span>
                  <span>)</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Pengelola Kas {userRt}</div>
              </div>

              <div style={{ width: '200px' }}>
                <p style={{ margin: '0 0 3.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                  Disetujui Oleh,<br /><strong>Ketua {userRt}</strong>
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #0f172a', fontWeight: 800, fontSize: '0.85rem', paddingBottom: '0.15rem', color: '#0f172a', whiteSpace: 'nowrap' }}>
                  <span>(</span>
                  <span style={{ color: '#94a3b8', letterSpacing: '1.5px' }}>....................</span>
                  <span>)</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Penanggung Jawab {userRt}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'broadcast' && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem' }}>Teks Ringkasan WhatsApp Group</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Format ringkas otomatis yang disesuaikan untuk dibagikan di grup WhatsApp warga.</p>
            </div>
            <button
              onClick={handleCopyBroadcast}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: copiedBroadcast ? '#16a34a' : '#2563eb', color: 'white', padding: '0.65rem 1.25rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem' }}
            >
              {copiedBroadcast ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copiedBroadcast ? 'Tersalin!' : 'Salin Ringkasan WA'}
            </button>
          </div>

          <textarea
            readOnly
            rows={12}
            value={generateBroadcastText()}
            style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '0.9rem', background: '#f8fafc', color: '#0f172a', lineHeight: 1.6 }}
          />
        </div>
      )}

      {showTxModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '520px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{editingTx ? 'Edit Transaksi Kas' : 'Tambah Transaksi Kas'}</h3>
              <button onClick={() => setShowTxModal(false)} style={{ color: '#64748b' }}><X size={20} /></button>
            </div>

            {errorMsg && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: '#fee2e2', color: '#991b1b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveTx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div style={{ background: '#eff6ff', padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#1e40af' }}>
                <ShieldCheck size={16} />
                <span>Terunci untuk: <strong>{userRt}</strong> (Hanya Admin RT terdaftar)</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>Jenis Transaksi</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setTxForm({ ...txForm, type: 'INCOME' })}
                    style={{ padding: '0.65rem', borderRadius: '12px', border: txForm.type === 'INCOME' ? '2px solid #16a34a' : '1px solid #cbd5e1', background: txForm.type === 'INCOME' ? '#dcfce7' : 'white', color: txForm.type === 'INCOME' ? '#15803d' : '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <ArrowUpRight size={18} /> Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxForm({ ...txForm, type: 'EXPENSE' })}
                    style={{ padding: '0.65rem', borderRadius: '12px', border: txForm.type === 'EXPENSE' ? '2px solid #dc2626' : '1px solid #cbd5e1', background: txForm.type === 'EXPENSE' ? '#fee2e2' : 'white', color: txForm.type === 'EXPENSE' ? '#b91c1c' : '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <ArrowDownRight size={18} /> Pengeluaran
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>Judul Transaksi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian Lampu Pos Ronda"
                  value={txForm.title}
                  onChange={(e) => setTxForm({ ...txForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="150000"
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={txForm.date}
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>Kategori Transaksi</label>
                <select
                  value={txForm.category}
                  onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: 'white' }}
                >
                  {KAS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat / detail kwitansi..."
                  value={txForm.notes}
                  onChange={(e) => setTxForm({ ...txForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>URL Bukti / Struk (Opsional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={txForm.proofUrl}
                  onChange={(e) => setTxForm({ ...txForm, proofUrl: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#2563eb', color: 'white', fontWeight: 700 }}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIuranModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '480px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Catat Pembayaran Iuran</h3>
              <button onClick={() => setShowIuranModal(false)} style={{ color: '#64748b' }}><X size={20} /></button>
            </div>

            {errorMsg && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: '#fee2e2', color: '#991b1b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveIuran} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>Nama Warga *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Warga"
                  value={iuranForm.wargaName}
                  onChange={(e) => setIuranForm({ ...iuranForm, wargaName: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>Blok / No. Rumah</label>
                <input
                  type="text"
                  placeholder="Blok A No. 12"
                  value={iuranForm.blockAddress}
                  onChange={(e) => setIuranForm({ ...iuranForm, blockAddress: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>Periode Bulan *</label>
                  <input
                    type="month"
                    required
                    value={iuranForm.periodMonth}
                    onChange={(e) => setIuranForm({ ...iuranForm, periodMonth: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>Metode Pembayaran</label>
                  <select
                    value={iuranForm.paymentMethod}
                    onChange={(e) => setIuranForm({ ...iuranForm, paymentMethod: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: 'white' }}
                  >
                    <option value="Tunai">Tunai (Cash)</option>
                    <option value="Transfer">Transfer Bank / QRIS</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>Nominal Iuran (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="2000"
                  value={iuranForm.amount}
                  onChange={(e) => setIuranForm({ ...iuranForm, amount: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}
                />
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
                  {[2000, 3000, 5000, 10000, 50000].map(val => {
                    const isSelected = Number(iuranForm.amount) === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setIuranForm({ ...iuranForm, amount: val })}
                        style={{
                          padding: '0.45rem 0.25rem',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          color: isSelected ? '#1d4ed8' : '#475569',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'center',
                          boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.15)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Rp {val >= 1000 ? `${val / 1000}rb` : val}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowIuranModal(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#16a34a', color: 'white', fontWeight: 700 }}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRegisterWargaModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '480px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Daftarkan Warga Tetap ({userRt})</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Data ini akan tersimpan permanen untuk penagihan kas mingguan selanjutnya.</p>
              </div>
              <button onClick={() => setShowRegisterWargaModal(false)} style={{ color: '#64748b' }}><X size={20} /></button>
            </div>

            {errorMsg && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: '#fee2e2', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRegisterWargaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>Nama Lengkap Warga *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Prasetyo"
                  value={registerWargaForm.wargaName}
                  onChange={(e) => setRegisterWargaForm({ ...registerWargaForm, wargaName: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>Blok / No. Rumah</label>
                <input
                  type="text"
                  placeholder="Blok A No. 12"
                  value={registerWargaForm.blockAddress}
                  onChange={(e) => setRegisterWargaForm({ ...registerWargaForm, blockAddress: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>Kategori Penagihan Kas *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setRegisterWargaForm({ ...registerWargaForm, category: 'PELAJAR' })}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '12px',
                      border: registerWargaForm.category === 'PELAJAR' ? '2px solid #d97706' : '1px solid #cbd5e1',
                      background: registerWargaForm.category === 'PELAJAR' ? '#fef3c7' : 'white',
                      color: registerWargaForm.category === 'PELAJAR' ? '#92400e' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                      <GraduationCap size={16} /> Masih Sekolah
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#b45309' }}>Rp 2.000 / mg</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterWargaForm({ ...registerWargaForm, category: 'PEKERJA' })}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '12px',
                      border: registerWargaForm.category === 'PEKERJA' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      background: registerWargaForm.category === 'PEKERJA' ? '#e0f2fe' : 'white',
                      color: registerWargaForm.category === 'PEKERJA' ? '#0369a1' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                      <Briefcase size={16} /> Sudah Bekerja
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#0369a1' }}>Rp 5.000 / mg</div>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterWargaModal(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#0284c7', color: 'white', fontWeight: 700 }}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Warga Tetap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {proofPreviewUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0 }}>Bukti Pembayaran / Struk</h4>
              <button onClick={() => setProofPreviewUrl(null)} style={{ color: '#64748b' }}><X size={20} /></button>
            </div>
            <img src={proofPreviewUrl} alt="Bukti" style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', borderRadius: '12px' }} />
          </div>
        </div>
      )}

      {txToDelete && (
        <ConfirmModal
          isOpen={!!txToDelete}
          onClose={() => setTxToDelete(null)}
          onConfirm={handleDeleteTx}
          title="Hapus Transaksi Kas?"
          message={`Apakah Anda yakin ingin menghapus transaksi "${txToDelete.title}" sejumlah Rp ${Number(txToDelete.amount).toLocaleString('id-ID')}?`}
          confirmText="Hapus Transaksi"
          variant="danger"
        />
      )}

      {showReportPreviewModal && (
        <div className="report-preview-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', padding: '1.5rem 1rem' }}>
          <div className="no-print" style={{ width: '100%', maxWidth: '840px', background: '#0f172a', color: 'white', padding: '1rem 1.5rem', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Printer size={20} color="#38bdf8" />
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Preview Dokumen Laporan Kas {userRt}</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Periksa tampilan sebelum mencetak atau mengunduh PDF</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setShowReportPreviewModal(false)}
                style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Tutup
              </button>
              <button
                onClick={handleDirectDownloadPdf}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.25rem', borderRadius: '10px', background: '#2563eb', color: 'white', border: 'none', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)' }}
              >
                <Download size={16} /> Download / Cetak Direct
              </button>
            </div>
          </div>

          <div id={showReportPreviewModal ? "printable-report-document" : undefined} className="report-preview-modal printable-report-body" style={{ width: '100%', maxWidth: '840px', background: 'white', padding: '2rem 2.25rem', borderRadius: '0 0 16px 16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', color: '#0f172a' }}>
            <div style={{ textAlign: 'center', borderBottom: '3px double #0f172a', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                WARGACARE · RUKUN TETANGGA
              </div>
              <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                RUKUN TETANGGA {userRt}
              </h1>
              <h3 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>
                LAPORAN PERTANGGUNGJAWABAN & REKAPITULASI KAS RT
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <span><strong>Periode:</strong> {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                <span><strong>Tanggal Cetak:</strong> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span><strong>Penanggung Jawab:</strong> Admin {userRt}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Saldo Akhir Kas</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
                  Rp {summary.currentBalance.toLocaleString('id-ID')}
                </div>
              </div>
              <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '10px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase' }}>Total Pemasukan</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a', marginTop: '0.15rem' }}>
                  Rp {summary.totalIncome.toLocaleString('id-ID')}
                </div>
              </div>
              <div style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: '10px', border: '1px solid #fecaca', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase' }}>Total Pengeluaran</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626', marginTop: '0.15rem' }}>
                  Rp {summary.totalExpense.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', background: '#ffffff' }}>
                <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', fontWeight: 800, color: '#16a34a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <TrendingUp size={14} /> Breakdown Pemasukan per Kategori
                </h4>
                <table style={{ width: '100%', fontSize: '0.775rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    {KAS_CATEGORIES.map(cat => {
                      const catTotal = transactions
                        .filter(t => t.type === 'INCOME' && t.category === cat)
                        .reduce((acc, curr) => acc + Number(curr.amount), 0);
                      const percent = summary.totalIncome > 0 ? ((catTotal / summary.totalIncome) * 100).toFixed(1) : 0;
                      return (
                        <tr key={cat} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '0.25rem 0', color: '#334155', fontWeight: 600 }}>{cat}</td>
                          <td style={{ padding: '0.25rem 0', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            Rp {catTotal.toLocaleString('id-ID')} <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500 }}>({percent}%)</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', background: '#ffffff' }}>
                <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', fontWeight: 800, color: '#dc2626', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <TrendingDown size={14} /> Breakdown Pengeluaran per Kategori
                </h4>
                <table style={{ width: '100%', fontSize: '0.775rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    {KAS_CATEGORIES.map(cat => {
                      const catTotal = transactions
                        .filter(t => t.type === 'EXPENSE' && t.category === cat)
                        .reduce((acc, curr) => acc + Number(curr.amount), 0);
                      const percent = summary.totalExpense > 0 ? ((catTotal / summary.totalExpense) * 100).toFixed(1) : 0;
                      return (
                        <tr key={cat} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '0.25rem 0', color: '#334155', fontWeight: 600 }}>{cat}</td>
                          <td style={{ padding: '0.25rem 0', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            Rp {catTotal.toLocaleString('id-ID')} <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500 }}>({percent}%)</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                Transaksi Terakhir (Buku Kas RT)
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.775rem', border: '1px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1', color: '#334155', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'left' }}>Tanggal</th>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'left' }}>Jenis</th>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'left' }}>Kategori</th>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'left' }}>Keterangan / Judul</th>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'right' }}>Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 6).map((t, idx) => (
                    <tr key={t.id || idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '0.4rem 0.6rem', whiteSpace: 'nowrap', fontWeight: 600, color: '#475569' }}>{t.date}</td>
                      <td style={{ padding: '0.4rem 0.6rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 700, color: t.type === 'INCOME' ? '#16a34a' : '#dc2626' }}>
                          {t.type === 'INCOME' ? '(+) Pemasukan' : '(-) Pengeluaran'}
                        </span>
                      </td>
                      <td style={{ padding: '0.4rem 0.6rem', whiteSpace: 'nowrap', color: '#64748b' }}>{t.category}</td>
                      <td style={{ padding: '0.4rem 0.6rem', color: '#0f172a', fontWeight: 600 }}>{t.title}</td>
                      <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', fontWeight: 800, color: t.type === 'INCOME' ? '#15803d' : '#b91c1c' }}>
                        Rp {Number(t.amount).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', textAlign: 'center', breakInside: 'avoid' }}>
              <div style={{ width: '200px' }}>
                <p style={{ margin: '0 0 3rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                  Mengetahui,<br /><strong>Bendahara {userRt}</strong>
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #0f172a', fontWeight: 800, fontSize: '0.85rem', paddingBottom: '0.15rem', color: '#0f172a', whiteSpace: 'nowrap' }}>
                  <span>(</span>
                  <span style={{ color: '#94a3b8', letterSpacing: '1.5px' }}>....................</span>
                  <span>)</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>Pengelola Kas {userRt}</div>
              </div>

              <div style={{ width: '200px' }}>
                <p style={{ margin: '0 0 3rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                  Disetujui Oleh,<br /><strong>Ketua {userRt}</strong>
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #0f172a', fontWeight: 800, fontSize: '0.85rem', paddingBottom: '0.15rem', color: '#0f172a', whiteSpace: 'nowrap' }}>
                  <span>(</span>
                  <span style={{ color: '#94a3b8', letterSpacing: '1.5px' }}>....................</span>
                  <span>)</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>Penanggung Jawab {userRt}</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
