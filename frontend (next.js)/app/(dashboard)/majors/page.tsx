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
  BookOpen,
  MapPin,
  Save,
  Layers,
  Users
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

export default function MajorsPage() {
  const [majors, setMajors] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, branchCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1, limit: 10, total: 0, last_page: 1
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    branch_id: ''
  });

  const fetchMasterData = async () => {
    try {
      const res = await apiRequest('/branches');
      setBranches(res || []);
      setStats((prev: any) => ({ ...prev, branchCount: res?.length || 0 }));
    } catch (err) {
      console.error('Gagal mengambil data cabang:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiRequest('/majors');
      setStats((prev: any) => ({
        ...prev,
        total: res.meta.total
      }));
    } catch (err) {
      console.error('Gagal mengambil statistik:', err);
    }
  };

  const fetchMajors = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (search) params.set('search', search);
      if (branchFilter) params.set('branch_id', branchFilter);

      const response = await apiRequest(`/majors?${params.toString()}`);
      setMajors(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total,
        last_page: response.meta.last_page
      }));
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data jurusan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      fetchMajors();
      fetchStats();
      fetchMasterData();
    }
  }, [pagination.page, search, branchFilter]);

  const handleOpenModal = (major: any = null) => {
    if (major) {
      setSelectedMajor(major);
      setFormData({
        code: major.code,
        name: major.name,
        branch_id: major.branch_id
      });
    } else {
      setSelectedMajor(null);
      setFormData({
        code: '',
        name: '',
        branch_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleAddBranch = async () => {
    const name = prompt("Masukkan Nama Cabang Baru:");
    if (!name) return;
    try {
      await apiRequest('/branches', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      fetchMasterData();
    } catch (err: any) {
      alert("Gagal menambah cabang: " + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branch_id) {
      alert('Pilih cabang terlebih dahulu');
      return;
    }
    setIsSubmitting(true);
    try {
      if (selectedMajor) {
        await apiRequest(`/majors/${selectedMajor.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData)
        });
      } else {
        await apiRequest('/majors', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setIsModalOpen(false);
      fetchMajors();
      fetchStats();
    } catch (err: any) {
      alert('Gagal menyimpan data: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMajor) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/majors/${selectedMajor.id}`, {
        method: 'DELETE'
      });
      setShowDeleteConfirm(false);
      fetchMajors();
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
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Data Jurusan & Cabang</h2>
          <p className="text-on-surface-variant font-medium mt-1">Kelola program keahlian per lokasi kampus RGI.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jurusan</span>
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Jurusan" value={stats.total} icon={<BookOpen className="w-6 h-6" />} color="primary" />
        <StatCard title="Total Cabang" value={stats.branchCount} icon={<MapPin className="w-6 h-6" />} color="secondary" />
      </div>

      {/* Filter Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] sm:max-w-[28rem]">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cari Jurusan</label>
              <div className="flex items-center border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container focus-within:ring-2 focus-within:ring-primary/20 transition-all relative">
                <Search className="w-4 h-4 text-outline mr-3" />
                <input 
                  type="text" 
                  placeholder="Cari Kode atau Nama Jurusan..." 
                  className="bg-transparent outline-none text-sm w-full text-on-surface placeholder:text-outline-variant pr-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && <button onClick={() => setSearch('')} className="absolute right-3 text-outline hover:text-on-surface transition-colors"><X className="w-4 h-4" /></button>}
              </div>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Filter Cabang</label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">Semua Cabang</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
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
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Kode</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Nama Jurusan</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Cabang / Lokasi</th>
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
              ) : majors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-on-surface-variant font-medium">Belum ada data jurusan.</td>
                </tr>
              ) : (
                majors.map((major) => (
                  <tr key={major.id} className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20 group">
                    <td className="py-3 px-5 font-bold text-primary uppercase tracking-wider">{major.code}</td>
                    <td className="py-3 px-5 font-semibold text-on-surface">{major.name}</td>
                    <td className="py-3 px-5">
                       <span className="flex items-center gap-2 text-on-surface-variant font-bold text-xs uppercase">
                         <MapPin className="w-3 h-3 text-primary" />
                         {major.branch?.name || '-'}
                       </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleOpenModal(major)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => { setSelectedMajor(major); setShowDeleteConfirm(true); }} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface">{selectedMajor ? 'Edit Jurusan' : 'Tambah Jurusan'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="majorForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Kode Jurusan</label>
                  <input type="text" required placeholder="Contoh: TKJ, FD" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nama Jurusan</label>
                  <input type="text" required placeholder="Contoh: Teknik Komputer Jaringan" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cabang RGI</label>
                    <button type="button" onClick={handleAddBranch} className="text-[10px] font-bold text-primary hover:underline">+ Tambah Cabang</button>
                  </div>
                  <select required value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                    <option value="">-- Pilih Cabang --</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors">Batal</button>
              <button type="submit" form="majorForm" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Simpan Jurusan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-[28rem] rounded-2xl shadow-2xl overflow-hidden p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto text-error shadow-inner">
              <Trash2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-on-surface tracking-tight">Hapus Jurusan?</h3>
              <p className="text-on-surface-variant font-medium">Anda akan menghapus data <span className="text-on-surface font-bold">"{selectedMajor?.name}"</span>.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-6 py-3 rounded-xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all active:scale-95">Batal</button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 px-6 py-3 rounded-xl bg-error text-on-error font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-error/20">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
