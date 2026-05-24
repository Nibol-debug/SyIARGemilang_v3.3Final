'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Loader2,
  AlertCircle,
  Calendar,
  Save,
  CheckCircle2,
  AlertTriangle,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ title, value, icon, color }: any) {
  const colorMap: any = {
    primary:   'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    tertiary:  'bg-tertiary/10 text-tertiary border-tertiary/20',
    success:   'bg-success-container/30 text-success border-success/20',
  };

  return (
    <div className={cn(
      'p-4 sm:p-6 rounded-2xl border flex items-center gap-3 sm:gap-4',
      'bg-surface-container-lowest shadow-sm relative overflow-hidden',
      colorMap[color],
    )}>
      <div className="p-3 rounded-xl bg-current opacity-10" />
      <div className="absolute left-4 sm:left-6">{icon}</div>
      <div className="ml-10 sm:ml-12">
        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-70 truncate max-w-[100px] sm:max-w-none">
          {title}
        </p>
        <p className="text-xl sm:text-2xl font-black leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    last_page: 1
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Status Confirmation State
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [targetBatch, setTargetBatch] = useState<any>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    is_active: false // Default to inactive for new batches
  });

  const fetchStats = async () => {
    try {
      const res = await apiRequest('/batches');
      setStats({ total: res.meta.total });
    } catch (err) {
      console.error('Gagal mengambil statistik:', err);
    }
  };

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      }).toString();

      const response = await apiRequest(`/batches?${query}`);
      setBatches(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total,
        last_page: response.meta.last_page
      }));
    } catch (err: any) {
      console.error('Gagal mengambil data angkatan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    if (token) {
      fetchBatches();
      fetchStats();
    }
  }, [pagination.page, search]);

  const handleOpenModal = (batch: any = null) => {
    if (batch) {
      setSelectedBatch(batch);
      setFormData({
        name: batch.name,
        start_date: new Date(batch.start_date).toISOString().split('T')[0],
        end_date: new Date(batch.end_date).toISOString().split('T')[0],
        is_active: batch.is_active ?? false
      });
    } else {
      setSelectedBatch(null);
      setFormData({
        name: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        is_active: false // Force inactive for new
      });
    }
    setIsModalOpen(true);
  };

  const handleStatusToggle = (batch: any) => {
    setTargetBatch(batch);
    setShowStatusConfirm(true);
  };

  const confirmStatusUpdate = async () => {
    if (!targetBatch) return;
    setIsUpdatingStatus(true);
    try {
      const newStatus = !targetBatch.is_active;
      await apiRequest(`/batches/${targetBatch.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: newStatus })
      });
      setShowStatusConfirm(false);
      fetchBatches();
      fetchStats();
    } catch (err: any) {
      alert('Gagal update status: ' + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };

      if (selectedBatch) {
        await apiRequest(`/batches/${selectedBatch.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest('/batches', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchBatches();
      fetchStats();
    } catch (err: any) {
      alert('Gagal menyimpan data: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBatch) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/batches/${selectedBatch.id}`, {
        method: 'DELETE'
      });
      setShowDeleteConfirm(false);
      fetchBatches();
      fetchStats();
    } catch (err: any) {
      alert('Gagal menghapus data: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Data Angkatan</h2>
          <p className="text-on-surface-variant font-medium mt-1">Siklus 6 bulan. Menonaktifkan angkatan otomatis merubah santri menjadi Alumni.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Angkatan</span>
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Angkatan" value={stats.total} icon={<Calendar className="w-6 h-6" />} color="primary" />
        <StatCard title="Status Alumni" value="Otomatis" icon={<History className="w-6 h-6" />} color="success" />
      </div>

      {/* Filter Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
        <div className="w-full sm:max-w-[28rem]">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cari Angkatan</label>
            <div className="flex items-center border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container focus-within:ring-2 focus-within:ring-primary/20 transition-all relative">
              <Search className="w-4 h-4 text-outline mr-3" />
              <input 
                type="text" 
                placeholder="Cari Nama Angkatan..." 
                className="bg-transparent outline-none text-sm w-full text-on-surface placeholder:text-outline-variant pr-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 text-outline hover:text-on-surface transition-colors"><X className="w-4 h-4" /></button>}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Nama Angkatan</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Periode</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Status</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-on-surface-variant font-medium text-sm">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-on-surface-variant font-medium">Belum ada data angkatan.</td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20 group">
                    <td className="py-3 px-5 font-bold text-on-surface">{batch.name}</td>
                    <td className="py-3 px-5 font-semibold text-on-surface-variant">
                      {new Date(batch.start_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })} - {new Date(batch.end_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-5">
                      <button 
                        onClick={() => handleStatusToggle(batch)}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95",
                          batch.is_active 
                            ? "bg-success/10 text-success border-success/20 hover:bg-success/20" 
                            : "bg-surface-container-high text-on-surface-variant border-outline-variant hover:bg-outline-variant/30"
                        )}
                      >
                        {batch.is_active ? 'AKTIF' : 'NON-AKTIF'}
                      </button>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleOpenModal(batch)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => { setSelectedBatch(batch); setShowDeleteConfirm(true); }} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-on-surface-variant hidden ml-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-outline-variant bg-surface-container-lowest">
          <span className="text-xs font-medium text-on-surface-variant">Halaman {pagination.page} dari {pagination.last_page}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))} disabled={pagination.page === 1} className="p-2 rounded-lg text-outline hover:bg-surface-container disabled:opacity-50 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button className="w-9 h-9 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow-md">{pagination.page}</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.last_page, prev.page + 1) }))} disabled={pagination.page === pagination.last_page} className="p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors active:scale-95"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Status Confirmation Modal */}
      {showStatusConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-[28rem] rounded-2xl shadow-2xl overflow-hidden p-8 text-center space-y-6 border border-outline-variant animate-in zoom-in-95 duration-200">
             <div className={cn(
               "w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner",
               targetBatch.is_active ? "bg-error/10 text-error" : "bg-primary/10 text-primary"
             )}>
               {targetBatch.is_active ? <AlertTriangle className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
             </div>
             <div className="space-y-2">
               <h3 className="text-xl font-black text-on-surface tracking-tight">
                 {targetBatch.is_active ? 'Nonaktifkan Angkatan?' : 'Aktifkan Angkatan?'}
               </h3>
               <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                 {targetBatch.is_active 
                   ? 'PERHATIAN: Seluruh santri AKTIF di angkatan ini akan otomatis berubah status menjadi ALUMNI.' 
                   : 'Angkatan ini akan menjadi aktif dan bisa digunakan di modul pendaftaran/akademik.'}
               </p>
             </div>
             <div className="flex flex-col gap-3 pt-2">
               <button 
                onClick={confirmStatusUpdate}
                disabled={isUpdatingStatus}
                className={cn(
                  "w-full py-3 rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg",
                  targetBatch.is_active ? "bg-error text-on-error shadow-error/20" : "bg-primary text-on-primary shadow-primary/20"
                )}
               >
                 {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                 YA, LANJUTKAN
               </button>
               <button 
                onClick={() => setShowStatusConfirm(false)}
                className="w-full py-3 rounded-2xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all"
               >
                 BATALKAN
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="px-6 py-4 border-b border-outline-variant flex justify-between bg-surface items-center">
              <h3 className="font-bold text-on-surface">{selectedBatch ? 'Edit Data Angkatan' : 'Tambah Angkatan Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar p-6">
              <form id="batchForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nama / Nomor Angkatan</label>
                  <input type="text" required placeholder="Contoh: 34" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tanggal Mulai</label>
                    <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tanggal Selesai</label>
                    <input type="date" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>
                <p className="text-[10px] text-on-surface-variant italic font-medium">*Catatan: Angkatan baru dibuat NON-AKTIF secara default demi keamanan data santri.</p>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors">Batal</button>
              <button type="submit" form="batchForm" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Simpan Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-[28rem] rounded-2xl shadow-2xl overflow-hidden p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto text-error shadow-inner">
              <Trash2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-on-surface tracking-tight">Hapus Angkatan?</h3>
              <p className="text-on-surface-variant font-medium leading-relaxed">
                Menghapus angkatan <span className="text-on-surface font-bold">"{selectedBatch?.name}"</span> akan menghapus seluruh relasi kelas santri.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-6 py-3 rounded-xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all active:scale-95">Batal</button>
              <button 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="flex-1 px-6 py-3 rounded-xl bg-error text-on-error font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-error/20"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
