'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Clock, Wallet, GraduationCap, Loader2, Users, BookOpen, FileText, DollarSign } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';

const reportCards = [
  { label: 'Laporan Presensi', desc: 'Rekap kehadiran siswa & pegawai per bulan', icon: Clock, path: '/reports/attendance', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  { label: 'Laporan Keuangan', desc: 'Pemasukan, tunggakan & metode pembayaran', icon: Wallet, path: '/reports/finance', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  { label: 'Laporan Akademik', desc: 'Statistik mapel, jadwal, ujian & distribusi nilai', icon: GraduationCap, path: '/reports/academic', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
];

export default function ReportsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest('/reports/summary')
      .then(setSummary)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const statCards = summary ? [
    { label: 'Siswa Aktif', value: summary.total_active_students, icon: Users },
    { label: 'Guru & Staf', value: summary.total_employees, icon: BookOpen },
    { label: 'Ujian Berlangsung', value: summary.active_exams, icon: FileText },
    { label: 'Pembayaran Sukses', value: summary.paid_payments, icon: DollarSign },
  ] : [];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-on-surface tracking-tight">Laporan</h2>
        <p className="text-on-surface-variant font-medium mt-1">Ringkasan dan rekap data operasional sekolah.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary"><s.icon className="w-5 h-5" /></div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{s.label}</p>
              </div>
              <p className="text-3xl font-black text-on-surface">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-on-surface mb-4">Jenis Laporan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportCards.map((card) => (
            <button
              key={card.path}
              onClick={() => router.push(card.path)}
              className={cn("text-left p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all active:scale-[0.98] group", card.color)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-white/80 shadow-sm"><card.icon className="w-6 h-6" /></div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">{card.label.split(' ')[0]}</span>
              </div>
              <h4 className="text-lg font-bold mb-1">{card.label}</h4>
              <p className="text-sm opacity-70">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
