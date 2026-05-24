'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (e) {
        console.error('Invalid token:', e);
      }
    }
  }, []);

  return (
    <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 md:hidden text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="md:hidden">
          <h1 className="text-sm font-black text-primary tracking-tighter leading-none">SYIAR<br/><span className="text-secondary">GEMILANG</span></h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationBell />
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
}
