'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Loader2, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function AttendanceReportPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiRequest(`/reports/attendance?month=${month}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [month]);

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-4 h-4", color)} />
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</p>
      </div>
      <p className={cn("text-2xl font-black", color)}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/reports" className="p-2 rounded-lg hover:bg-surface-container transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Laporan Presensi</h2>
          <p className="text-sm text-on-surface-variant">Rekapitulasi kehadiran siswa dan pegawai.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2">
          <Calendar className="w-4 h-4 text-primary" />
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="bg-transparent border-none outline-none font-bold text-sm" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : data ? (
        <div className="space-y-8">
          <div>
            <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Presensi Siswa</h3>
            <div className="grid grid-cols-5 gap-3">
              <StatCard label="Total" value={data.student.total} icon={Users} color="text-on-surface" />
              <StatCard label="Hadir" value={data.student.hadir} icon={Users} color="text-emerald-600" />
              <StatCard label="Sakit" value={data.student.sakit} icon={Users} color="text-amber-600" />
              <StatCard label="Izin" value={data.student.izin} icon={Users} color="text-blue-600" />
              <StatCard label="Alfa" value={data.student.alfa} icon={Users} color="text-red-600" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Presensi Pegawai</h3>
            <div className="grid grid-cols-5 gap-3">
              <StatCard label="Total" value={data.employee.total} icon={BookOpen} color="text-on-surface" />
              <StatCard label="Hadir" value={data.employee.hadir} icon={BookOpen} color="text-emerald-600" />
              <StatCard label="Sakit" value={data.employee.sakit} icon={BookOpen} color="text-amber-600" />
              <StatCard label="Izin" value={data.employee.izin} icon={BookOpen} color="text-blue-600" />
              <StatCard label="Alpa" value={data.employee.alpa} icon={BookOpen} color="text-red-600" />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-on-surface-variant py-10">Gagal memuat data.</p>
      )}
    </div>
  );
}
