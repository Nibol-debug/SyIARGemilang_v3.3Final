'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    link: string | null;
    created_at: string;
  };
  onMarkAsRead: (id: string) => void;
  onClick: (link: string | null) => void;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return '💰';
      case 'exam':
        return '📝';
      case 'announcement':
        return '📢';
      case 'attendance':
        return '📅';
      case 'ppdb':
        return '🎓';
      default:
        return '🔔';
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'bg-green-50';
      case 'exam':
        return 'bg-blue-50';
      case 'announcement':
        return 'bg-purple-50';
      case 'attendance':
        return 'bg-orange-50';
      case 'ppdb':
        return 'bg-pink-50';
      default:
        return 'bg-gray-50';
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: localeId,
  });

  return (
    <div
      className={`p-4 border-b border-outline-variant hover:bg-surface-container transition-colors cursor-pointer ${
        !notification.is_read ? 'bg-surface-container-high' : ''
      }`}
      onClick={() => {
        if (!notification.is_read) {
          onMarkAsRead(notification.id);
        }
        onClick(notification.link);
      }}
    >
      <div className="flex gap-3">
        <div className={`w-10 h-10 rounded-full ${getBgColor(notification.type)} flex items-center justify-center text-xl flex-shrink-0`}>
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-semibold truncate ${!notification.is_read ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              {notification.title}
            </h4>
            {!notification.is_read && (
              <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></span>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
            {notification.message}
          </p>
          <span className="text-xs text-outline-variant mt-2 block">
            {timeAgo}
          </span>
        </div>
      </div>
    </div>
  );
}
