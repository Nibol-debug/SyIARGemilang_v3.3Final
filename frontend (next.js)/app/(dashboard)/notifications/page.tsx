'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Filter, X } from 'lucide-react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationIcon,
  getNotificationColor,
  Notification,
} from '@/lib/notifications';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [page, filterType]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(page, 20);
      setNotifications(response.data);
      setTotalPages(response.meta.last_page);
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
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus semua notifikasi?')) return;
    
    try {
      await deleteAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error('Failed to delete all:', err);
    }
  };

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filterType);

  const notificationTypes = [
    { value: 'all', label: 'Semua', icon: '🔔' },
    { value: 'payment', label: 'Pembayaran', icon: '💰' },
    { value: 'exam', label: 'Ujian', icon: '📝' },
    { value: 'announcement', label: 'Pengumuman', icon: '📢' },
    { value: 'attendance', label: 'Absensi', icon: '📅' },
    { value: 'ppdb', label: 'PPDB', icon: '🎓' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">Notifikasi</h1>
              <p className="text-sm text-on-surface-variant">
                Kelola notifikasi dan pengumuman sistem
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-full text-sm font-semibold text-on-surface transition-colors"
            >
              <Check className="w-4 h-4" />
              Tandai semua dibaca
            </button>
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2 bg-error/10 hover:bg-error/20 rounded-full text-sm font-semibold text-error transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Hapus semua
            </button>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full text-sm font-semibold text-on-surface transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
            {showFilter && <X className="w-4 h-4" />}
          </button>
        </div>

        {/* Filter Options */}
        {showFilter && (
          <div className="mt-4 p-4 bg-surface-container rounded-lg border border-outline-variant">
            <div className="flex flex-wrap gap-2">
              {notificationTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    filterType === type.value
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span>{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden">
        {loading && (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-on-surface-variant">Memuat notifikasi...</p>
          </div>
        )}

        {error && (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-error opacity-20" />
            <p className="text-error font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && filteredNotifications.length === 0 && (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-on-surface-variant opacity-20" />
            <p className="text-on-surface-variant font-semibold">
              {filterType === 'all'
                ? 'Tidak ada notifikasi'
                : `Tidak ada notifikasi ${notificationTypes.find(t => t.value === filterType)?.label}`}
            </p>
          </div>
        )}

        {!loading && !error && filteredNotifications.length > 0 && (
          <>
            <div className="divide-y divide-outline-variant">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-surface-container transition-colors ${
                    !notification.is_read ? 'bg-surface-container-high' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-full ${getNotificationColor(
                        notification.type
                      )} flex items-center justify-center text-2xl flex-shrink-0`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3
                            className={`text-base font-bold mb-1 ${
                              !notification.is_read
                                ? 'text-on-surface'
                                : 'text-on-surface-variant'
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-sm text-on-surface-variant">
                            {notification.message}
                          </p>
                          {notification.link && (
                            <a
                              href={notification.link}
                              className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:text-on-surface transition-colors"
                            >
                              Lihat detail
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                              title="Tandai sudah dibaca"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-2 text-error hover:bg-error/10 rounded-full transition-colors"
                            title="Hapus notifikasi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs px-2 py-1 bg-surface rounded-full text-on-surface-variant font-medium">
                          {notification.type}
                        </span>
                        <span className="text-xs text-outline-variant">
                          {new Date(notification.created_at).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-outline-variant flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">
                  Halaman {page} dari {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-full text-sm font-semibold text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-full text-sm font-semibold text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
