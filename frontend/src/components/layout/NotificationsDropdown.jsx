import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Info, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'error': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-primary-lighter" />;
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;


    if (diff < 60000) return 'Just now';

    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;

    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg relative transition-colors ${isOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
        aria-label="Notifications"
      >
        <Bell size={20} className={unreadCount > 0 ? "text-white" : "text-gray-400"} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 glass-strong rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 flex flex-col max-h-[85vh]"
          >
            {}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-surface/40 backdrop-blur-md">
              <h3 className="font-semibold text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary-lighter text-xs font-bold">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Mark all as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Clear all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {}
            <div className="overflow-y-auto custom-scrollbar flex-1 bg-surface-card/30">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Bell size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-sm">You have no notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markAsRead(n.id)}
                      className={`p-4 flex gap-3 cursor-pointer transition-colors ${!n.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-gray-300'}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(n.timestamp)}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="shrink-0 flex items-center justify-center w-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
