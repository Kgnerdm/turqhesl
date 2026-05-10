import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Check,
  CheckCircle2,
  XCircle,
  Calendar,
  CreditCard,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import {
  listNotifications,
  markAllRead,
  markRead,
  type AppNotification,
  type NotificationType,
} from '@/api/notifications';
import { useAuth } from '@/contexts/AuthContext';

const POLL_INTERVAL_MS = 5000;

const ICON_BY_TYPE: Record<NotificationType, React.FC<React.SVGProps<SVGSVGElement>>> = {
  booking_confirmed: CheckCircle2,
  booking_status_changed: Calendar,
  booking_cancelled: XCircle,
  booking_new: Calendar,
  provider_verified: ShieldCheck,
  provider_rejected: AlertCircle,
  payment_succeeded: CreditCard,
  payment_failed: AlertCircle,
  system: Bell,
};

const TONE_BY_TYPE: Record<NotificationType, string> = {
  booking_confirmed: 'text-green-600 bg-green-50',
  booking_status_changed: 'text-blue-600 bg-blue-50',
  booking_cancelled: 'text-red-600 bg-red-50',
  booking_new: 'text-primary-600 bg-primary-50',
  provider_verified: 'text-green-600 bg-green-50',
  provider_rejected: 'text-amber-600 bg-amber-50',
  payment_succeeded: 'text-green-600 bg-green-50',
  payment_failed: 'text-red-600 bg-red-50',
  system: 'text-gray-600 bg-gray-100',
};

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString();
};

export const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Poll for notifications
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setUnread(0);
      return;
    }

    let cancelled = false;
    const tick = async () => {
      try {
        const resp = await listNotifications(false, 20);
        if (cancelled) return;
        setItems(resp.data);
        setUnread(resp.unread_count);
      } catch {
        // Silent — endpoint might be down momentarily
      }
    };
    tick();
    const id = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [isAuthenticated]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleClick = async (n: AppNotification) => {
    if (!n.is_read) {
      try {
        await markRead(n.id);
      } catch {
        // ignore
      }
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)),
      );
      setUnread((u) => Math.max(0, u - 1));
    }
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
  };

  const handleMarkAll = async () => {
    setLoading(true);
    try {
      const resp = await markAllRead();
      setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
      setUnread(0);
      void resp;
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unread > 99 ? '99+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <p className="text-xs text-gray-500">
                  {unread > 0 ? `${unread} unread` : 'You are all caught up'}
                </p>
              </div>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  disabled={loading}
                  className="text-xs text-primary-600 hover:underline flex items-center gap-1 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No notifications yet.
                </div>
              ) : (
                items.map((n) => {
                  const Icon = ICON_BY_TYPE[n.notification_type] ?? Bell;
                  const tone = TONE_BY_TYPE[n.notification_type] ?? 'text-gray-600 bg-gray-100';
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleClick(n)}
                      className={`w-full text-left flex gap-3 p-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-b-0 ${
                        n.is_read ? '' : 'bg-blue-50/30'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${tone}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${n.is_read ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">{formatTime(n.created_at)}</p>
                      </div>
                      {!n.is_read && (
                        <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
