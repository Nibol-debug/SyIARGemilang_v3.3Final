'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { 
  ArrowLeft, 
  Calendar, 
  Save, 
  Loader2, 
  Search,
  BarChart2,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  Hadir: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  Sakit: { label: 'Sakit', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  Izin: { label: 'Izin', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  Alpa: { label: 'Alpa', color: 'bg-red-100 text-red-700 border-red-300' },
};

const STATUS_KEYS = Object.keys(STATUS_CONFIG);

export default function EmployeeAttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [fetchError, setFetchError] = useState('');

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const data = await apiRequest(`/employee-attendance/daily?date=${date}`);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setFetchError(err.message || 'Gagal memuat data presensi');
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleStatusChange = (employeeId: string, status: string) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId ? { ...emp, status } : emp
    ));
  };

  const setAllStatus = (status: string) => {
    setEmployees(prev => prev.map(emp => ({ ...emp, status })));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        date,
        attendances: employees.map(emp => ({
          employee_id: emp.id,
          status: emp.status
        })).filter(r => r.status)
      };

      await apiRequest('/employee-attendance/bulk', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      alert('Presensi berhasil disimpan!');
    } catch (err: any) {
      alert('Gagal menyimpan presensi: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredEmployees = (employees || []).filter(emp => 
    (emp.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (emp.position || '').toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    Hadir: employees.filter(e => e.status === 'Hadir').length,
    Sakit: employees.filter(e => e.status === 'Sakit').length,
    Izin: employees.filter(e => e.status === 'Izin').length,
    Alpa: employees.filter(e => e.status === 'Alpa').length,
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-1 anim-fade-in-down">
          <Link href="/hrm" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline mb-2">
            <ArrowLeft className="w-3 h-3" />
            Kembali ke HRM
          </Link>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Presensi Pegawai</h2>
          <p className="text-on-surface-variant font-medium">Pencatatan kehadiran guru dan staf harian.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Link 
             href="/hrm/attendance/monthly"
             className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary border border-primary/20 rounded-xl hover:bg-primary/5 transition-all"
           >
              <BarChart2 className="w-4 h-4" />
              Laporan Bulanan
           </Link>
           <div className="flex items-center gap-4 bg-surface-container-lowest border border-outline-variant rounded-2xl p-2 px-4 shadow-sm">
           <Calendar className="w-5 h-5 text-primary" />
           <input 
             type="date" 
             value={date} 
             onChange={(e) => setDate(e.target.value)}
             className="bg-transparent border-none outline-none font-bold text-on-surface cursor-pointer"
           />
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="md:col-span-3">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden anim-fade-in-up">
                <div className="p-6 border-b border-outline-variant bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="relative flex-1 max-w-[28rem] w-full">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
                    <input 
                      type="text" 
                      placeholder="Cari nama atau jabatan..." 
                      className="w-full pl-12 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest">
                     <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Hadir</span>
                     <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Sakit</span>
                     <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Izin</span>
                     <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Alpa</span>
                  </div>
               </div>

               {/* Quick Actions */}
               {filteredEmployees.length > 0 && (
                 <div className="px-6 py-3 border-b border-outline-variant bg-surface-container/30 flex flex-wrap items-center gap-3">
                   <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Set Semua:</span>
                   {STATUS_KEYS.map(key => (
                     <button
                       key={key}
                       onClick={() => setAllStatus(key)}
                       className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all hover:scale-105", STATUS_CONFIG[key].color)}
                     >
                       {STATUS_CONFIG[key].label}
                     </button>
                   ))}
                   <div className="ml-auto flex gap-3 text-[11px] font-bold text-on-surface-variant">
                     <span className="text-emerald-600">{counts.Hadir}H</span>
                     <span className="text-amber-600">{counts.Sakit}S</span>
                     <span className="text-blue-600">{counts.Izin}I</span>
                     <span className="text-red-600">{counts.Alpa}A</span>
                   </div>
                 </div>
               )}

               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-surface-container-low border-b border-outline-variant">
                       <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Pegawai</th>
                       <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Status Presensi</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm">
                       {isLoading ? (
                         Array.from({ length: 4 }).map((_, i) => (
                           <tr key={`skel-${i}`} className="border-b border-surface-container-low">
                             {Array.from({ length: 2 }).map((_, j) => (
                               <td key={j} className="py-3 px-5">
                                 <div className={cn("skeleton h-5", j === 0 ? "w-48" : "w-24")} />
                               </td>
                             ))}
                           </tr>
                         ))
                       ) : fetchError ? (
                        <tr>
                          <td colSpan={2} className="py-20 text-center">
                            <AlertCircle className="w-10 h-10 text-error mx-auto" />
                            <p className="mt-4 font-bold text-error uppercase tracking-widest text-xs">{fetchError}</p>
                          </td>
                        </tr>
                      ) : filteredEmployees.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="py-20 text-center text-on-surface-variant font-bold">Tidak ada data pegawai yang ditemukan.</td>
                        </tr>
                      ) : (
                       filteredEmployees.map((emp) => (
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
                           <td className="py-3 px-5">
                              <div className="flex items-center justify-center gap-1.5">
                                {STATUS_KEYS.map(key => {
                                  const cfg = STATUS_CONFIG[key];
                                  const isActive = emp.status === key;
                                  return (
                                    <button
                                      key={key}
                                      onClick={() => handleStatusChange(emp.id, key)}
                                      className={cn(
                                        "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                                        isActive
                                          ? cfg.color + ' scale-105 shadow-sm'
                                          : 'bg-surface-container text-on-surface-variant border-outline-variant/50 opacity-50 hover:opacity-80'
                                      )}
                                    >
                                      {cfg.label}
                                    </button>
                                  );
                                })}
                              </div>
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
         </div>

         <aside className="space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
               <h3 className="text-xs font-black text-on-surface uppercase tracking-widest">Ringkasan Hari Ini</h3>
               <div className="space-y-4">
                  <SummaryItem label="Total Pegawai" value={employees.length} />
                  <SummaryItem label="Sudah Diabsen" value={employees.filter(e => e.status).length} color="primary" />
                  <SummaryItem label="Belum Diabsen" value={employees.filter(e => !e.status).length} color="error" />
               </div>
               
               <button 
                 onClick={handleSave}
                 disabled={isSaving || employees.length === 0}
                 className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:opacity-95 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
               >
                 {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                 Simpan Presensi
               </button>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
               <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Tips</h4>
               <p className="text-xs font-medium text-primary/80 leading-relaxed">
                 Data presensi akan digunakan sebagai dasar rekapitulasi kinerja bulanan dan perhitungan honorarium jika berlaku.
               </p>
            </div>
         </aside>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, color = "outline" }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-outline-variant/30 last:border-0">
      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{label}</span>
      <span className={cn(
        "text-sm font-black",
        color === 'primary' ? "text-primary" : color === 'error' ? "text-error" : "text-on-surface"
      )}>{value}</span>
    </div>
  );
}
