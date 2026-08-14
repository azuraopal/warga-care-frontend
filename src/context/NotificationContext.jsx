import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { reportsApi } from '../api/reports';
import useAuth from '../hooks/useAuth';

export const NotificationContext = createContext(null);

const STORAGE_KEY = 'wc_admin_notifications';
const BROADCAST_CHANNEL_NAME = 'wc_realtime_notifications';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-demo-1',
    reportId: 1,
    title: 'Jalan Berlubang di RT 03/RW 05',
    category: 'JALAN_RUSAK',
    reporterName: 'Budi Santoso',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isRead: false,
  },
  {
    id: 'notif-demo-2',
    reportId: 2,
    title: 'Penumpukan Sampah di Dekat Lapangan',
    category: 'SAMPAH',
    reporterName: 'Siti Rahma',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    isRead: true,
  },
];

export function NotificationProvider({ children }) {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Gagal membaca notifikasi dari localStorage:', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [toastNotif, setToastNotif] = useState(null);
  const broadcastRef = useRef(null);

  const updateNotifications = useCallback((newNotifsOrFn) => {
    setNotifications((prev) => {
      const nextState = typeof newNotifsOrFn === 'function' ? newNotifsOrFn(prev) : newNotifsOrFn;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch (e) {
        console.warn('Gagal menyimpan notifikasi ke localStorage:', e);
      }
      return nextState;
    });
  }, []);

  const playChimeSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const addNotification = useCallback((report, shouldBroadcast = true) => {
    if (!report) return;
    const notifId = `notif-${report.id || Date.now()}`;

    updateNotifications((prev) => {
      if (prev.some((n) => n.id === notifId || (n.reportId && n.reportId === report.id))) {
        return prev;
      }

      const newNotif = {
        id: notifId,
        reportId: report.id || null,
        title: report.title || 'Laporan Pengaduan Baru',
        category: report.category || 'LAINNYA',
        reporterName: report.reporterName || report.user?.fullName || report.user?.name || user?.fullName || 'Warga',
        createdAt: report.createdAt || new Date().toISOString(),
        isRead: false,
      };

      setToastNotif(newNotif);
      setTimeout(() => setToastNotif(null), 5000);

      playChimeSound();

      if (shouldBroadcast && broadcastRef.current) {
        try {
          broadcastRef.current.postMessage({ type: 'NEW_REPORT', report: newNotif });
        } catch (err) {
          console.warn('Broadcast error:', err);
        }
      }

      return [newNotif, ...prev];
    });
  }, [updateNotifications, user]);

  useEffect(() => {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      broadcastRef.current = bc;

      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_REPORT' && event.data.report) {
          addNotification(event.data.report, false);
        }
      };

      return () => {
        bc.close();
      };
    }
  }, [addNotification]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchLatestReports = async () => {
      try {
        const res = await reportsApi.getAll({ page: 0, size: 10 });
        const reportsList = res?.data?.content || res?.content || res?.data || [];
        if (Array.isArray(reportsList) && reportsList.length > 0) {
          updateNotifications((prev) => {
            let updated = [...prev];
            let addedAny = false;

            reportsList.forEach((rpt) => {
              const notifId = `notif-${rpt.id}`;
              const exists = updated.some((n) => n.id === notifId || n.reportId === rpt.id);
              if (!exists) {
                addedAny = true;
                const newNotifItem = {
                  id: notifId,
                  reportId: rpt.id,
                  title: rpt.title || 'Laporan Pengaduan Baru',
                  category: rpt.category || 'LAINNYA',
                  reporterName: rpt.user?.fullName || rpt.user?.name || 'Warga',
                  createdAt: rpt.createdAt || new Date().toISOString(),
                  isRead: false,
                };
                updated.unshift(newNotifItem);
                setToastNotif(newNotifItem);
                setTimeout(() => setToastNotif(null), 5000);
              }
            });

            if (addedAny) {
              playChimeSound();
            }
            return updated;
          });
        }
      } catch (err) {}
    };

    fetchLatestReports();
    const interval = setInterval(fetchLatestReports, 5000);

    return () => clearInterval(interval);
  }, [isAdmin, updateNotifications]);

  useEffect(() => {
    if (!isAdmin || !('EventSource' in window)) return;

    let eventSource;
    try {
      eventSource = new EventSource('/api/reports/stream');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.title) {
            addNotification(data, true);
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isAdmin, addNotification]);

  useEffect(() => {
    const handleReportCreated = (event) => {
      const report = event.detail;
      if (report) {
        addNotification(report, true);
      }
    };

    window.addEventListener('wc-report-created', handleReportCreated);
    return () => window.removeEventListener('wc-report-created', handleReportCreated);
  }, [addNotification]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setNotifications(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const markAsRead = useCallback((id) => {
    updateNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  }, [updateNotifications]);

  const markAllAsRead = useCallback(() => {
    updateNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  }, [updateNotifications]);

  const deleteNotification = useCallback((id) => {
    updateNotifications((prev) => prev.filter((item) => item.id !== id));
  }, [updateNotifications]);

  const clearAllNotifications = useCallback(() => {
    updateNotifications([]);
  }, [updateNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        toastNotif,
        setToastNotif,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
