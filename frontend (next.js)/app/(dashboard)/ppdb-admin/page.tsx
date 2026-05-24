'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Eye, Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { ViewApplicantModal } from '@/components/PPDBModals';

export default function PPDBAdminPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const fetchData = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });
      const response = await apiRequest(`/applicants?${query}`);
      setData(response.data);
      setPagination(prev => ({
        ...prev,
        page: response.meta.page,
        total: response.meta.total,
        totalPages: response.meta.last_page
      }));
    } catch (err) {
      console.error('Failed to fetch applicants', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => {
    fetchData(1);
  }, [filters, fetchData]);

  const handleView = (applicant: any) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  const handleDelete = async (applicant: any) => {
    if (!confirm(`Hapus pendaftar "${applicant.full_name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await apiRequest(`/applicants/${applicant.id}`, { method: 'DELETE' });
      fetchData(pagination.page);
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-on-surface tracking-tight">Verifikasi PPDB Online</h2>
          <p className="text-on-surface-variant font-medium mt-1">Kelola dan verifikasi berkas pendaftaran calon siswa baru.</p>
        </div>
        <div className="flex gap-4">
           <StatMini label="Pending" value={data.filter(a => a.status === 'pending').length} color="amber" />
           <StatMini label="Verified" value={data.filter(a => a.status === 'verified').length} color="blue" />
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[300px] space-y-2">
          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Cari Nama / Email</label>
          <div className="relative">
            <Search className="absolute left-4 top-3 w-4 h-4 text-outline" />
            <input 
              type="text" 
              placeholder="Ketik nama calon siswa..."
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
              className="w-full pl-11 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
        <div className="w-full sm:w-48 space-y-2">
           <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Status</label>
           <select 
             value={filters.status}
             onChange={e => setFilters({...filters, status: e.target.value})}
             className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm font-semibold outline-none cursor-pointer"
           >
             <option value="">Semua Status</option>
             <option value="pending">Pending</option>
             <option value="verified">Verified</option>
             <option value="rejected">Rejected</option>
           </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-4 px-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Nama Calon Siswa</th>
                <th className="py-4 px-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Asal Sekolah</th>
                <th className="py-4 px-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest text-center">Status</th>
                <th className="py-4 px-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Tgl Daftar</th>
                <th className="py-4 px-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                    <p className="mt-4 text-on-surface-variant font-bold">Memuat data pendaftar...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-20 text-center text-on-surface-variant font-bold opacity-50">Belum ada data pendaftaran.</td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20 group">
                    <td className="py-3 px-5">
                      <div className="flex flex-col">
                        <span className="font-black text-on-surface">{item.full_name}</span>
                        <span className="text-[10px] font-bold text-on-surface-variant">{item.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 font-bold text-on-surface-variant">{item.previous_school}</td>
                    <td className="py-3 px-5 text-center">
                       <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-5 text-on-surface-variant font-medium">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-5 text-right">
                       <button 
                         onClick={() => handleView(item)}
                         className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                       >
                         <Eye className="w-5 h-5" />
                       </button>
                        {item.status === 'rejected' && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-error hover:bg-error/10 rounded-xl transition-all ml-1"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-8 py-6 border-t border-outline-variant bg-surface-container-low">
          <span className="text-xs font-bold text-on-surface-variant">Halaman {pagination.page} dari {pagination.totalPages}</span>
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setPagination(p => ({...p, page: Math.max(1, p.page - 1)}))}
               disabled={pagination.page === 1}
               className="p-2 rounded-xl text-outline hover:bg-white disabled:opacity-30 transition-all"
             >
               <ChevronLeft className="w-6 h-6" />
             </button>
             <button className="w-10 h-10 rounded-xl bg-primary text-on-primary font-black text-sm shadow-lg shadow-primary/20">{pagination.page}</button>
             <button 
               onClick={() => setPagination(p => ({...p, page: Math.min(pagination.totalPages, p.page + 1)}))}
               disabled={pagination.page === pagination.totalPages}
               className="p-2 rounded-xl text-on-surface hover:bg-white disabled:opacity-30 transition-all"
             >
               <ChevronRight className="w-6 h-6" />
             </button>
          </div>
        </div>
      </div>

      <ViewApplicantModal 
        applicant={selectedApplicant} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUpdate={() => fetchData(pagination.page)}
      />
    </div>
  );
}

function StatMini({ label, value, color }: any) {
  return (
    <div className="px-4 py-2 rounded-2xl bg-surface-container border border-outline-variant flex items-center gap-3">
       <div className={cn(
         "w-2 h-2 rounded-full",
         color === 'amber' ? "bg-amber-500" : "bg-blue-500"
       )} />
       <div className="flex flex-col">
          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{label}</span>
          <span className="text-sm font-black text-on-surface leading-none">{value}</span>
       </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    verified: "bg-blue-100 text-blue-700 border-blue-200",
    accepted: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200"
  };
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
      styles[status] || "bg-outline-variant text-on-surface-variant"
    )}>
      {status}
    </span>
  );
}
