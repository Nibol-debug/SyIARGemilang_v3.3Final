'use client';

import React, { useState } from 'react';
import { Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProfileDropdownProps {
  user: any;
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    if (!confirm('Yakin ingin keluar?')) return;
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    router.push('/login');
  };

  const getInitials = (username?: string) => {
    if (!username) return 'U';
    return username.substring(0, 2).toUpperCase();
  };

  const getRoleDisplay = (role?: string) => {
    if (!role) return 'User';
    return role;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 bg-surface-container hover:bg-surface-container-high rounded-full transition-colors"
      >
        <div className="w-8 h-8 rounded-full border border-outline-variant shadow-sm bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
          {getInitials(user?.username)}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-semibold text-on-surface leading-tight">
            {user?.username || 'User'}
          </p>
          <p className="text-xs text-outline">
            {getRoleDisplay(user?.role)}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-outline-variant bg-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-primary shadow-sm bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-lg">
                  {getInitials(user?.username)}
                </div>
                <div>
                  <p className="font-bold text-on-surface">{user?.username || 'User'}</p>
                  <p className="text-xs text-on-surface-variant">{getRoleDisplay(user?.role)}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Pengaturan Akun</span>
              </Link>
              <Link
                href="/profil"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Profil Saya</span>
              </Link>
            </div>

            {/* Divider */}
            <div className="border-t border-outline-variant" />

            {/* Logout */}
            <div className="py-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
