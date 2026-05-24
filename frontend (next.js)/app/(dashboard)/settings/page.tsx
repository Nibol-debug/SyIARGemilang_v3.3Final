'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, Settings as SettingsIcon, Save, Lock, Power, CheckCircle2, AlertCircle,
  Database
} from 'lucide-react';
import { useUserRole } from '@/lib/useUserRole';
import {
  getPreferences,
  updateNotificationPreferences,
  updateSystemSettings,
  toggleMaintenanceMode,
  UserPreferences,
} from '@/lib/settings';

type TabType = 'notifications' | 'system';

export default function SettingsPage() {
  const { isAdmin, isTeacher } = useUserRole();
  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const [notifSettings, setNotifSettings] = useState({
    notif_academic: true,
    notif_messages: true,
    notif_payments: true,
    notif_email_digest: false,
  });

  const [systemSettings, setSystemSettings] = useState({
    active_academic_year: '2025/2026',
    active_semester: '1',
    cbt_strict_anticheat: true,
    cbt_show_score_auto: false,
    cbt_random_questions: true,
    cbt_device_locking: true,
    maintenance_mode: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await getPreferences();
      setPreferences(data);
      setNotifSettings({
        notif_academic: data.notif_academic,
        notif_messages: data.notif_messages,
        notif_payments: data.notif_payments,
        notif_email_digest: data.notif_email_digest,
      });
      setSystemSettings({
        active_academic_year: data.active_academic_year || '2025/2026',
        active_semester: data.active_semester?.toString() || '1',
        cbt_strict_anticheat: data.cbt_strict_anticheat,
        cbt_show_score_auto: data.cbt_show_score_auto,
        cbt_random_questions: data.cbt_random_questions,
        cbt_device_locking: data.cbt_device_locking,
        maintenance_mode: data.maintenance_mode,
      });
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      await updateNotificationPreferences(notifSettings);
      setMessage({ type: 'success', text: 'Preferensi notifikasi berhasil disimpan' });
      setTimeout(() => setMessage(null), 3000);
      loadPreferences();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Gagal menyimpan preferensi: ' + (error.message || 'Error tidak dikenal') });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    try {
      setSaving(true);
      await updateSystemSettings({
        active_academic_year: systemSettings.active_academic_year,
        active_semester: parseInt(systemSettings.active_semester),
        cbt_strict_anticheat: systemSettings.cbt_strict_anticheat,
        cbt_show_score_auto: systemSettings.cbt_show_score_auto,
        cbt_random_questions: systemSettings.cbt_random_questions,
        cbt_device_locking: systemSettings.cbt_device_locking,
      });
      setMessage({ type: 'success', text: 'Konfigurasi akademik berhasil disimpan' });
      setTimeout(() => setMessage(null), 3000);
      loadPreferences();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Gagal menyimpan konfigurasi: ' + (error.message || 'Error tidak dikenal') });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenanceMode = async () => {
    const newMode = !systemSettings.maintenance_mode;
    if (!confirm(newMode ? 'Aktifkan maintenance mode? Hanya admin yang bisa login.' : 'Nonaktifkan maintenance mode?')) return;
    try {
      setSaving(true);
      await toggleMaintenanceMode(newMode);
      setSystemSettings(prev => ({ ...prev, maintenance_mode: newMode }));
      setMessage({ type: 'success', text: `Maintenance mode ${newMode ? 'diaktifkan' : 'dinonaktifkan'}` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Gagal mengubah maintenance mode: ' + (error.message || 'Error tidak dikenal') });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'notifications', label: 'Notifikasi', icon: Globe },
  ];

  if (isAdmin || isTeacher) {
    tabs.push({ id: 'system', label: 'Pengaturan Sistem', icon: SettingsIcon });
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface mb-2">Pengaturan</h1>
        <p className="text-sm text-on-surface-variant">Kelola preferensi dan konfigurasi sistem di sini.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="mb-8">
        <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all rounded-lg ${
                activeTab === tab.id
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'notifications' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Pengaturan Notifikasi</h2>
              <p className="text-sm text-on-surface-variant">Tentukan bagaimana Anda ingin menerima pembaruan dari sistem.</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key: 'notif_academic' as const, title: 'Notifikasi Akademik', desc: 'Pengumuman jadwal, tugas, dan nilai.' },
              { key: 'notif_messages' as const, title: 'Pesan & Obrolan', desc: 'Notifikasi pesan baru dari guru atau admin.' },
              { key: 'notif_payments' as const, title: 'Pembayaran (SPP)', desc: 'Pengingat tagihan dan konfirmasi pembayaran.' },
              { key: 'notif_email_digest' as const, title: 'Email Digest', desc: 'Ringkasan aktivitas mingguan via email.' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-5 bg-surface border border-outline-variant rounded-xl">
                <div>
                  <h3 className="font-bold text-on-surface">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant mt-0.5">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifSettings[item.key]}
                    onChange={(e) => setNotifSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveNotifications}
              disabled={saving}
              className="px-8 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Preferensi'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'system' && (isAdmin || isTeacher) && (
        <div className="space-y-8">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">Konfigurasi Akademik (Global)</h2>
                <p className="text-sm text-on-surface-variant">Atur tahun ajaran dan semester aktif untuk seluruh sistem.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant ml-1">Tahun Ajaran Aktif</label>
                <select
                  value={systemSettings.active_academic_year}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, active_academic_year: e.target.value }))}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                >
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface-variant ml-1">Semester Aktif</label>
                <select
                  value={systemSettings.active_semester}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, active_semester: e.target.value }))}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                >
                  <option value="1">Ganjil (1)</option>
                  <option value="2">Genap (2)</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
               <button
                 onClick={handleSaveSystemSettings}
                 disabled={saving}
                 className="px-8 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/20 disabled:opacity-50"
               >
                 {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
               </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">Pengaturan Ujian Digital (CBT)</h2>
                <p className="text-sm text-on-surface-variant">Konfigurasi keamanan dan perilaku modul ujian online.</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'cbt_strict_anticheat' as const, title: 'Strict Anti-Cheat Mode', desc: 'Blokir otomatis jika siswa pindah tab atau keluar fullscreen lebih dari 3x.' },
                { key: 'cbt_show_score_auto' as const, title: 'Tampilkan Nilai Otomatis', desc: 'Siswa dapat melihat nilai PG segera setelah selesai mengerjakan.' },
                { key: 'cbt_random_questions' as const, title: 'Acak Soal & Jawaban', desc: 'Secara default mengacak urutan soal untuk setiap siswa.' },
                { key: 'cbt_device_locking' as const, title: 'Device Locking', desc: 'Hanya izinkan satu perangkat per akun saat ujian berlangsung.' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-5 bg-surface border border-outline-variant rounded-xl">
                  <div>
                    <h3 className="font-bold text-on-surface">{item.title}</h3>
                    <p className="text-sm text-on-surface-variant mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={systemSettings[item.key]}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
               <button
                 onClick={handleSaveSystemSettings}
                 disabled={saving}
                 className="px-8 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/20 disabled:opacity-50"
               >
                 {saving ? 'Menyimpan...' : 'Simpan Pengaturan CBT'}
               </button>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-surface-container-lowest rounded-2xl border border-error/20 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
                  <Power className="w-6 h-6 text-error" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-error">Maintenance Mode</h2>
                  <p className="text-sm text-on-surface-variant">Hanya Administrator yang dapat login saat mode ini aktif.</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-error/5 border border-error/10 rounded-xl">
                <div>
                  <h3 className="font-bold text-on-surface">Aktifkan Mode Pemeliharaan</h3>
                  <p className="text-sm text-on-surface-variant mt-0.5">Sistem akan menampilkan halaman "Under Maintenance" ke pengguna lain.</p>
                </div>
                <button
                  onClick={handleToggleMaintenanceMode}
                  disabled={saving}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg disabled:opacity-50 ${
                    systemSettings.maintenance_mode
                      ? 'bg-surface-container text-on-surface border border-outline-variant hover:bg-surface-container-high'
                      : 'bg-error text-white hover:opacity-90 shadow-error/20'
                  }`}
                >
                  {systemSettings.maintenance_mode ? 'Nonaktifkan' : 'Aktifkan Sekarang'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
