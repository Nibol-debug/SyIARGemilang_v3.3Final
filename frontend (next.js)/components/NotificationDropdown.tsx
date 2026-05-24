'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2, ExternalLink, X } from 'lucide-react';
import {
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationIcon,
  Notification,
} from '@/lib/notifications';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getUnreadNotifications(10);
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications([]);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleClick = (link: string | null) => {
    if (link) {
      window.location.href = link;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-50 max-h-[500px] overflow-hidden notification-enter">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-on-surface">Notifikasi</h3>
          {notifications.length > 0 && (
            <span className="bg-primary text-on-primary text-xs px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded transition-colors"
              title="Tandai semua sudah dibaca"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[400px]">
        {loading && (
          <div className="p-8 text-center text-on-surface-variant">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Memuat notifikasi...</p>
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-error text-sm">
            {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="p-8 text-center text-on-surface-variant">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Tidak ada notifikasi baru</p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <>
            {notifications.map((notification, i) => (
              <div key={notification.id} className="relative group anim-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onClick={handleClick}
                />
                <button
                  onClick={(e) => handleDelete(e, notification.id)}
                  className="absolute right-3 top-3 p-1.5 text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus notifikasi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-outline-variant text-center">
        <a
          href="/notifications"
          className="text-sm text-primary hover:text-on-surface transition-colors inline-flex items-center gap-1 link-underline"
        >
          Lihat semua notifikasi
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
