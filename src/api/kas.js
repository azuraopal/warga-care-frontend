import api from './client';

const INITIAL_TRANSACTIONS = [
  {
    id: 'kas-1',
    rt: 'RT 01',
    type: 'INCOME',
    title: 'Iuran Bulanan Warga (Agustus 2026)',
    amount: 1750000,
    category: 'Iuran Bulanan',
    date: '2026-08-01',
    recordedBy: 'Budi Santoso (Admin RT 01)',
    notes: 'Pembayaran iuran dari 35 KK @ Rp 50.000',
    proofUrl: '',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'kas-2',
    rt: 'RT 01',
    type: 'EXPENSE',
    title: 'Honorarium Petugas Kebersihan & Keamanan',
    amount: 800000,
    category: 'Kebersihan & Keamanan',
    date: '2026-08-05',
    recordedBy: 'Budi Santoso (Admin RT 01)',
    notes: 'Gaji 2 petugas kebersihan minggu ke-1 & 2',
    proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
    createdAt: '2026-08-05T10:30:00Z',
  },
  {
    id: 'kas-3',
    rt: 'RT 01',
    type: 'EXPENSE',
    title: 'Pembelian Lampu LED & Kabel POS Ronda',
    amount: 250000,
    category: 'Pemeliharaan Fasilitas',
    date: '2026-08-10',
    recordedBy: 'Budi Santoso (Admin RT 01)',
    notes: 'Penggantian lampu pos ronda RT 01 yang padam',
    proofUrl: '',
    createdAt: '2026-08-10T14:15:00Z',
  },
  {
    id: 'kas-4',
    rt: 'RT 01',
    type: 'INCOME',
    title: 'Donasi Peringatan HUT RI Ke-81',
    amount: 1200000,
    category: 'Donasi/Sumbangan',
    date: '2026-08-12',
    recordedBy: 'Budi Santoso (Admin RT 01)',
    notes: 'Sumbangan dari hamba Allah untuk lomba warga',
    proofUrl: '',
    createdAt: '2026-08-12T16:00:00Z',
  },
  {
    id: 'kas-5',
    rt: 'RT 02',
    type: 'INCOME',
    title: 'Iuran Bulanan Warga RT 02 (Agustus 2026)',
    amount: 1400000,
    category: 'Iuran Bulanan',
    date: '2026-08-02',
    recordedBy: 'Siti Rahma (Admin RT 02)',
    notes: 'Iuran 28 KK',
    proofUrl: '',
    createdAt: '2026-08-02T09:00:00Z',
  },
  {
    id: 'kas-6',
    rt: 'RT 02',
    type: 'EXPENSE',
    title: 'Perbaikan Pintu Pos Kamling RT 02',
    amount: 350000,
    category: 'Pemeliharaan Fasilitas',
    date: '2026-08-08',
    recordedBy: 'Siti Rahma (Admin RT 02)',
    notes: 'Engsel dan kunci pos kamling',
    proofUrl: '',
    createdAt: '2026-08-08T11:00:00Z',
  }
];

const INITIAL_WARGA_IURAN = [
  { id: 'w1', name: 'Ahmad Subagja', block: 'Blok A No. 12', rt: 'RT 01', monthlyDues: 50000, status: { '2026-08': { paid: true, date: '2026-08-01', method: 'Transfer' }, '2026-07': { paid: true, date: '2026-07-02', method: 'Tunai' } } },
  { id: 'w2', name: 'Budi Santoso', block: 'Blok A No. 05', rt: 'RT 01', monthlyDues: 50000, status: { '2026-08': { paid: true, date: '2026-08-01', method: 'Tunai' }, '2026-07': { paid: true, date: '2026-07-01', method: 'Tunai' } } },
  { id: 'w3', name: 'Citra Dewi', block: 'Blok B No. 08', rt: 'RT 01', monthlyDues: 50000, status: { '2026-08': { paid: false }, '2026-07': { paid: true, date: '2026-07-05', method: 'Transfer' } } },
  { id: 'w4', name: 'Dedi Kurniawan', block: 'Blok B No. 15', rt: 'RT 01', monthlyDues: 50000, status: { '2026-08': { paid: true, date: '2026-08-03', method: 'Transfer' }, '2026-07': { paid: true, date: '2026-07-03', method: 'Transfer' } } },
  { id: 'w5', name: 'Eka Prasetya', block: 'Blok C No. 03', rt: 'RT 01', monthlyDues: 50000, status: { '2026-08': { paid: false }, '2026-07': { paid: false } } },
  { id: 'w6', name: 'Fani Wijaya', block: 'Blok C No. 09', rt: 'RT 01', monthlyDues: 50000, status: { '2026-08': { paid: true, date: '2026-08-05', method: 'Tunai' }, '2026-07': { paid: true, date: '2026-07-04', method: 'Tunai' } } },
  { id: 'w7', name: 'Gita Gutawa', block: 'Blok D No. 01', rt: 'RT 02', monthlyDues: 50000, status: { '2026-08': { paid: true, date: '2026-08-02', method: 'Transfer' } } },
  { id: 'w8', name: 'Hendra Setiawan', block: 'Blok D No. 04', rt: 'RT 02', monthlyDues: 50000, status: { '2026-08': { paid: false } } }
];

function getStoredTransactions() {
  const saved = localStorage.getItem('wc_kas_transactions');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  localStorage.setItem('wc_kas_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
  return INITIAL_TRANSACTIONS;
}

function saveStoredTransactions(txs) {
  localStorage.setItem('wc_kas_transactions', JSON.stringify(txs));
}

function getStoredIuranWarga() {
  let wargas = [];
  const saved = localStorage.getItem('wc_kas_iuran_warga');
  if (saved) {
    try { wargas = JSON.parse(saved); } catch (e) { console.error(e); }
  } else {
    wargas = [...INITIAL_WARGA_IURAN];
  }

  try {
    const activeUser = JSON.parse(localStorage.getItem('wc_user') || 'null');
    if (activeUser && (activeUser.fullName || activeUser.name)) {
      const activeName = activeUser.fullName || activeUser.name;
      const exists = wargas.some(w => (w.name || w.wargaName || '').toLowerCase() === activeName.toLowerCase());
      if (!exists) {
        wargas.push({
          id: 'w-' + (activeUser.id || Date.now()),
          name: activeName,
          wargaName: activeName,
          block: activeUser.blockAddress || activeUser.block || 'Blok A No. 01',
          blockAddress: activeUser.blockAddress || activeUser.block || 'Blok A No. 01',
          rt: activeUser.rt || 'RT 01',
          category: activeUser.occupationCategory || 'PEKERJA',
          categoryLabel: activeUser.occupationCategory === 'PELAJAR' ? 'Pelajar / Sekolah' : 'Sudah Bekerja',
          weeklyDuesRate: activeUser.occupationCategory === 'PELAJAR' ? 2000 : 5000,
          monthlyDues: 50000,
          status: {}
        });
      }
    }
  } catch (err) {
    console.error('Error auto syncing active user to iuran:', err);
  }

  localStorage.setItem('wc_kas_iuran_warga', JSON.stringify(wargas));
  return wargas;
}


function saveStoredIuranWarga(wargas) {
  localStorage.setItem('wc_kas_iuran_warga', JSON.stringify(wargas));
}

export const KAS_CATEGORIES = [
  'Iuran Bulanan',
  'Kebersihan & Keamanan',
  'Pemeliharaan Fasilitas',
  'Acara RT / Kegiatan',
  'Donasi/Sumbangan',
  'Kas Darurat / Sosial',
  'Lain-lain'
];

export const kasApi = {

  getTransactions: async (params = {}) => {
    try {
      const res = await api.get('/kas/transactions', { params });
      return res;
    } catch (err) {

      let txs = getStoredTransactions();
      const rtFilter = params.rt || 'RT 01';

      txs = txs.filter(t => !rtFilter || t.rt === rtFilter);

      if (params.type && params.type !== 'ALL') {
        txs = txs.filter(t => t.type === params.type);
      }
      if (params.category && params.category !== 'ALL') {
        txs = txs.filter(t => t.category === params.category);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        txs = txs.filter(t =>
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
        );
      }

      txs.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

      return { data: txs };
    }
  },

  createTransaction: async (data) => {
    try {
      const res = await api.post('/kas/transactions', data);
      return res;
    } catch (err) {
      const txs = getStoredTransactions();
      const newTx = {
        id: 'kas-' + Date.now(),
        ...data,
        amount: Number(data.amount) || 0,
        createdAt: new Date().toISOString(),
      };
      txs.unshift(newTx);
      saveStoredTransactions(txs);
      return { data: newTx };
    }
  },

  updateTransaction: async (id, data) => {
    try {
      const res = await api.put(`/kas/transactions/${id}`, data);
      return res;
    } catch (err) {
      const txs = getStoredTransactions();
      const idx = txs.findIndex(t => t.id === id);
      if (idx !== -1) {
        txs[idx] = { ...txs[idx], ...data, amount: Number(data.amount) || txs[idx].amount };
        saveStoredTransactions(txs);
        return { data: txs[idx] };
      }
      throw new Error('Transaksi tidak ditemukan');
    }
  },

  deleteTransaction: async (id) => {
    try {
      const res = await api.delete(`/kas/transactions/${id}`);
      return res;
    } catch (err) {
      let txs = getStoredTransactions();
      txs = txs.filter(t => t.id !== id);
      saveStoredTransactions(txs);
      return { success: true };
    }
  },

  getSummary: async (rt = 'RT 01') => {
    try {
      const res = await api.get(`/kas/summary?rt=${encodeURIComponent(rt)}`);
      return res;
    } catch (err) {
      const txs = getStoredTransactions().filter(t => t.rt === rt);
      let totalIncome = 0;
      let totalExpense = 0;

      txs.forEach(t => {
        if (t.type === 'INCOME') totalIncome += Number(t.amount) || 0;
        if (t.type === 'EXPENSE') totalExpense += Number(t.amount) || 0;
      });

      const currentBalance = totalIncome - totalExpense;

      const currentYearMonth = '2026-08';
      let monthIncome = 0;
      let monthExpense = 0;

      txs.forEach(t => {
        if (t.date && t.date.startsWith(currentYearMonth)) {
          if (t.type === 'INCOME') monthIncome += Number(t.amount) || 0;
          if (t.type === 'EXPENSE') monthExpense += Number(t.amount) || 0;
        }
      });

      return {
        data: {
          rt,
          currentBalance,
          totalIncome,
          totalExpense,
          monthIncome,
          monthExpense,
          transactionCount: txs.length
        }
      };
    }
  },
  registerMasterWarga: async (data) => {
    try {
      const res = await api.post('/kas/warga', data);
      return res;
    } catch (err) {
      const allWarga = getStoredIuranWarga();
      const existing = allWarga.find(w => w.name.toLowerCase() === data.wargaName.toLowerCase());
      if (existing) {
        existing.block = data.blockAddress || existing.block;
        existing.category = data.category || existing.category || 'PEKERJA';
        existing.weeklyDuesRate = (data.category === 'PELAJAR') ? 2000 : 5000;
        saveStoredIuranWarga(allWarga);
        return { data: existing };
      } else {
        const newWarga = {
          id: 'wm-' + Date.now(),
          name: data.wargaName,
          wargaName: data.wargaName,
          block: data.blockAddress || 'Blok A',
          blockAddress: data.blockAddress || 'Blok A',
          rt: 'RT 01',
          category: data.category || 'PEKERJA',
          categoryLabel: data.category === 'PELAJAR' ? 'Pelajar / Sekolah' : 'Sudah Bekerja',
          weeklyDuesRate: data.category === 'PELAJAR' ? 2000 : 5000,
          status: {}
        };
        allWarga.push(newWarga);
        saveStoredIuranWarga(allWarga);
        return { data: newWarga };
      }
    }
  },

  getMasterWarga: async () => {
    try {
      const res = await api.get('/kas/warga');
      return res;
    } catch (err) {
      const allWarga = getStoredIuranWarga();
      const formatted = allWarga.map(w => ({
        id: w.id,
        wargaName: w.name || w.wargaName,
        blockAddress: w.block || w.blockAddress,
        rt: w.rt || 'RT 01',
        category: w.category || 'PEKERJA',
        categoryLabel: (w.category === 'PELAJAR') ? 'Pelajar / Sekolah' : 'Sudah Bekerja',
        weeklyDuesRate: (w.category === 'PELAJAR') ? 2000 : 5000
      }));
      return { data: formatted };
    }
  },

  getIuranWeekly: async (periodWeek = '2026-W33') => {
    try {
      const res = await api.get(`/kas/iuran/weekly?periodWeek=${encodeURIComponent(periodWeek)}`);
      return res;
    } catch (err) {
      const allWarga = getStoredIuranWarga();
      const list = allWarga.map(w => {
        const isPaid = w.weeklyStatus && w.weeklyStatus[periodWeek] ? w.weeklyStatus[periodWeek].paid : false;
        const rate = (w.category === 'PELAJAR') ? 2000 : 5000;
        return {
          wargaMasterId: w.id,
          wargaName: w.name || w.wargaName,
          blockAddress: w.block || w.blockAddress,
          rt: w.rt || 'RT 01',
          category: w.category || 'PEKERJA',
          categoryLabel: (w.category === 'PELAJAR') ? 'Pelajar / Sekolah' : 'Sudah Bekerja',
          weeklyDuesRate: rate,
          periodWeek,
          isPaid,
          paidDate: isPaid ? w.weeklyStatus[periodWeek].date : null,
          paymentMethod: isPaid ? w.weeklyStatus[periodWeek].method : null,
          recordedBy: isPaid ? (w.weeklyStatus[periodWeek].recordedBy || 'Admin RT') : null,
          totalArrearsWeeks: isPaid ? 0 : 1,
          totalArrearsAmount: isPaid ? 0 : rate
        };
      });
      return { data: list };
    }
  },

  payIuranWeekly: async ({ wargaMasterId, wargaName, periodWeek = '2026-W33', paymentMethod = 'Tunai', amount }) => {
    try {
      const res = await api.post('/kas/iuran/pay-weekly', { wargaMasterId, wargaName, periodWeek, paymentMethod, amount });
      return res;
    } catch (err) {
      const allWarga = getStoredIuranWarga();
      let target = allWarga.find(w => (wargaMasterId && w.id === wargaMasterId) || (wargaName && w.name.toLowerCase() === wargaName.toLowerCase()));

      if (!target && wargaName) {
        target = {
          id: 'wm-' + Date.now(),
          name: wargaName,
          wargaName: wargaName,
          block: 'Blok A',
          blockAddress: 'Blok A',
          rt: 'RT 01',
          category: 'PEKERJA',
          categoryLabel: 'Sudah Bekerja',
          weeklyDuesRate: 5000,
          weeklyStatus: {}
        };
        allWarga.push(target);
      }

      if (!target) throw new Error('Warga tidak ditemukan');

      if (!target.weeklyStatus) target.weeklyStatus = {};
      const todayStr = new Date().toISOString().split('T')[0];
      const rate = amount || (target.category === 'PELAJAR' ? 2000 : 5000);
      
      target.weeklyStatus[periodWeek] = {
        paid: true,
        date: todayStr,
        method: paymentMethod,
        amount: rate
      };

      saveStoredIuranWarga(allWarga);

      const txs = getStoredTransactions();
      const newTx = {
        id: 'kas-w-' + Date.now(),
        rt: target.rt || 'RT 01',
        type: 'INCOME',
        title: `Iuran Mingguan ${target.name} (${periodWeek})`,
        amount: rate,
        category: 'Iuran Mingguan',
        date: todayStr,
        recordedBy: 'Admin RT 01',
        notes: `Kategori: ${target.category === 'PELAJAR' ? 'Pelajar (Rp 2rb)' : 'Pekerja (Rp 5rb)'} | Metode: ${paymentMethod}`,
        proofUrl: '',
        createdAt: new Date().toISOString()
      };
      txs.unshift(newTx);
      saveStoredTransactions(txs);

      return {
        data: {
          wargaMasterId: target.id,
          wargaName: target.name,
          blockAddress: target.block,
          rt: target.rt || 'RT 01',
          category: target.category || 'PEKERJA',
          categoryLabel: target.category === 'PELAJAR' ? 'Pelajar / Sekolah' : 'Sudah Bekerja',
          weeklyDuesRate: rate,
          periodWeek,
          isPaid: true,
          paidDate: todayStr,
          paymentMethod
        }
      };
    }
  },

  getIuranWarga: async (rt = 'RT 01') => {
    try {
      const res = await api.get(`/kas/iuran?rt=${encodeURIComponent(rt)}`);
      return res;
    } catch (err) {
      const allWarga = getStoredIuranWarga();
      const filtered = allWarga.filter(w => w.rt === rt);
      return { data: filtered };
    }
  },

  payIuran: async ({ wargaId, wargaName, blockAddress, periodMonth, month, paymentMethod, method = 'Tunai', recordedBy = 'Admin RT', amount = 50000 }) => {
    const targetMonth = periodMonth || month || '2026-08';
    const targetMethod = paymentMethod || method || 'Tunai';

    try {
      const res = await api.post('/kas/iuran/pay', {
        wargaId,
        wargaName,
        blockAddress,
        periodMonth: targetMonth,
        amount,
        paymentMethod: targetMethod
      });
      return res;
    } catch (err) {
      const allWarga = getStoredIuranWarga();
      let target = allWarga.find(w => (wargaId && w.id === wargaId) || (wargaName && w.name.toLowerCase() === wargaName.toLowerCase()));

      if (!target && wargaName) {
        target = {
          id: 'w-' + Date.now(),
          name: wargaName,
          block: blockAddress || 'Blok A',
          rt: 'RT 01',
          monthlyDues: Number(amount) || 50000,
          status: {}
        };
        allWarga.push(target);
      }

      if (!target) throw new Error('Nama warga wajib diisi');

      if (!target.status) target.status = {};
      const todayStr = new Date().toISOString().split('T')[0];
      target.status[targetMonth] = {
        paid: true,
        date: todayStr,
        method: targetMethod
      };

      saveStoredIuranWarga(allWarga);

      const txs = getStoredTransactions();
      const newTx = {
        id: 'kas-iuran-' + Date.now(),
        rt: target.rt || 'RT 01',
        type: 'INCOME',
        title: `Iuran Bulanan ${target.name} (${targetMonth})`,
        amount: Number(amount) || 50000,
        category: 'Iuran Bulanan',
        date: todayStr,
        recordedBy: recordedBy,
        notes: `Metode: ${targetMethod} (${target.block || ''})`,
        proofUrl: '',
        createdAt: new Date().toISOString()
      };
      txs.unshift(newTx);
      saveStoredTransactions(txs);

      return { data: target, transaction: newTx };
    }
  }
};
