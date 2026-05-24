'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { 
  ArrowLeft, 
  Calendar, 
  Download, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Search,
  FileText,
  BarChart2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MonthlyAttendance {
  id: string;
  full_name: string;
  position: string;
  major: string;
  hadir: number;
  izin: number;
  alpa: number;
  total_days: number;
}

export default function MonthlyAttendanceReportPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [data, setData] = useState<MonthlyAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [fetchError, setFetchError] = useState('');

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const response = await apiRequest(`/employee-attendance/monthly?month=${month}`);
      setData(Array.isArray(response) ? response : []);
    } catch (err: any) {
      setFetchError(err.message || 'Gagal memuat laporan bulanan');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const filteredData = (data || []).filter(emp => 
    (emp.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (emp.position || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['Nama Pegawai', 'Jabatan', 'Jurusan', 'Hadir', 'Izin/Sakit', 'Alpa', 'Total Pencatatan'];
    const rows = data.map(emp => [
      emp.full_name,
      emp.position,
      emp.major,
      emp.hadir,
      emp.izin,
      emp.alpa,
      emp.total_days
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Presensi_${month}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
         <div className="space-y-1 anim-fade-in-down">
          <Link href="/hrm/attendance" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline mb-2">
            <ArrowLeft className="w-3 h-3" />
            Kembali ke Presensi Harian
          </Link>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Laporan Bulanan Presensi</h2>
          <p className="text-on-surface-variant font-medium">Rekapitulasi kehadiran pegawai per bulan.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 bg-surface-container-lowest border border-outline-variant rounded-2xl p-2 px-4 shadow-sm">
             <Calendar className="w-5 h-5 text-primary" />
             <input 
               type="month" 
               value={month} 
               onChange={(e) => setMonth(e.target.value)}
               className="bg-transparent border-none outline-none font-bold text-on-surface cursor-pointer"
             />
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden anim-fade-in-up">
        <div className="p-6 border-b border-outline-variant bg-surface flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-[28rem]">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
            <input 
              type="text" 
              placeholder="Cari nama atau jabatan..." 
              className="w-full pl-12 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-6">
             <div className="text-center">
                <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Total Pegawai</p>
                <p className="text-xl font-black text-on-surface">{data.length}</p>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black text-success uppercase tracking-widest mb-1">Rata-rata Hadir</p>
                <p className="text-xl font-black text-success">
                  {data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.hadir, 0) / data.length) : 0} hari
                </p>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Pegawai</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Hadir</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Izin/Sakit</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Alpa</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Persentase</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="border-b border-surface-container-low">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="py-3 px-5">
                        <div className={cn("skeleton h-5", j === 0 ? "w-48" : "w-24")} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : fetchError ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <AlertCircle className="w-10 h-10 text-error mx-auto" />
                    <p className="mt-4 font-bold text-error uppercase tracking-widest text-xs">{fetchError}</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-on-surface-variant font-bold">Tidak ada data untuk periode ini.</td>
                </tr>
              ) : (
                filteredData.map((emp) => {
                  const attendanceRate = emp.total_days > 0 ? Math.round((emp.hadir / emp.total_days) * 100) : 0;
                  return (
                    <tr key={emp.id} className="border-b border-surface-container-low hover:bg-surface-container/20 transition-colors even:bg-surface-container/20">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                            {emp.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{emp.full_name}</p>
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{emp.position || 'Pegawai'} • {emp.major || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-center font-black text-success">{emp.hadir}</td>
                      <td className="py-3 px-5 text-center font-black text-warning">{emp.izin}</td>
                      <td className="py-3 px-5 text-center font-black text-error bg-error/5">{emp.alpa}</td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                           <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full transition-all duration-1000",
                                  attendanceRate >= 90 ? "bg-success" : attendanceRate >= 75 ? "bg-warning" : "bg-error"
                                )}
                                style={{ width: `${attendanceRate}%` }}
                              />
                           </div>
                           <span className="text-xs font-black text-on-surface w-8">{attendanceRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 flex gap-4 items-start">
         <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
         <div className="space-y-1">
            <h4 className="font-bold text-on-surface">Tentang Perhitungan Honor</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
               Data rekapitulasi ini dapat digunakan sebagai acuan dasar perhitungan honor mengajar atau tunjangan kehadiran. 
               Kolom <span className="font-bold text-error uppercase">Alpa</span> secara otomatis memberikan penalti pada persentase kehadiran pegawai.
            </p>
         </div>
      </div>
    </div>
  );
}
