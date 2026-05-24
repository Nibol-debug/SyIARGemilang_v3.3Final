'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit2, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Loader2,
  Package,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { ViewAssetModal, EditAssetModal, DeleteAssetModal } from '@/components/AssetModals';
import { useUserRole } from '@/lib/useUserRole';

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

export default function AssetsPage() {
  const { canManageAssets } = useUserRole();
  const [assets, setAssets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, good: 0, fair: 0, broken: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'delete' | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    location: '',
    condition: 'good',
    status: 'available'
  });
  
  // Filters & Search
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    last_page: 1
  });

  const fetchStats = async () => {
    try {
      const res = await apiRequest('/stats/dashboard');
      setStats({
        total: res.overview.totalAssets,
        // Mocking other stats for now as the backend doesn't provide them in detail yet
        good: Math.round(res.overview.totalAssets * 0.8),
        fair: Math.round(res.overview.totalAssets * 0.15),
        broken: Math.round(res.overview.totalAssets * 0.05),
      });
    } catch { /* non-critical */ }
  };

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
      }).toString();

      const response = await apiRequest(`/assets?${query}`);
      setAssets(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total,
        last_page: response.meta.last_page
      }));
    } catch (err: any) {
      console.error('Gagal mengambil data aset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    if (token) {
      fetchAssets();
      fetchStats();
    }
  }, [filters, pagination.page]);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest('/assets', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      fetchAssets();
      setFormData({
        code: '',
        name: '',
        category: '',
        location: '',
        condition: 'good',
        status: 'available'
      });
    } catch (err: any) {
      alert('Gagal menambah aset: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Manajemen Aset & Inventaris</h2>
          <p className="text-on-surface-variant font-medium mt-1">Lacak dan kelola seluruh aset operasional sekolah.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canManageAssets && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Aset</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Aset" value={stats.total} icon={<Package className="w-6 h-6" />} color="primary" />
        <StatCard title="Kondisi Baik" value={stats.good} icon={<Package className="w-6 h-6" />} color="success" />
        <StatCard title="Kondisi Cukup" value={stats.fair} icon={<Package className="w-6 h-6" />} color="secondary" />
        <StatCard title="Kondisi Rusak" value={stats.broken} icon={<Package className="w-6 h-6" />} color="tertiary" />
      </div>

      {/* Filter Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2 col-span-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pencarian Aset</label>
            <div className="flex items-center border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container focus-within:ring-2 focus-within:ring-primary/20 transition-all relative">
              <Search className="w-4 h-4 text-outline mr-3" />
              <input 
                type="text" 
                placeholder="Cari Kode atau Nama Aset..." 
                className="bg-transparent outline-none text-sm w-full text-on-surface placeholder:text-outline-variant pr-8"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              {filters.search && (
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="absolute right-3 text-outline hover:text-on-surface transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Kondisi</label>
            <select 
              className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Semua Kondisi</option>
              <option value="good">Baik</option>
              <option value="fair">Cukup</option>
              <option value="broken">Rusak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Kode Aset</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Nama Aset</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Kategori</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Lokasi</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Kondisi</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-on-surface-variant font-medium text-sm">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                   <td colSpan={6} className="py-10 text-center text-on-surface-variant font-medium">
                     Tidak ada data aset.
                   </td>
                </tr>
              ) : (
                assets.map((item) => (
                  <tr key={item.id} className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20 group">
                    <td className="py-3 px-5 font-bold text-primary text-xs uppercase tracking-wider">{item.code}</td>
                    <td className="py-3 px-5 font-semibold text-on-surface">{item.name}</td>
                    <td className="py-3 px-5 text-on-surface font-medium">{item.category}</td>
                    <td className="py-3 px-5 text-on-surface-variant font-medium">{item.location}</td>
                    <td className="py-3 px-5 text-on-surface">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        item.condition === 'good' ? "bg-success-container/30 text-success" :
                        item.condition === 'fair' ? "bg-secondary-container/20 text-secondary" :
                        "bg-error-container/20 text-error"
                      )}>
                        {item.condition === 'good' ? 'Baik' : 
                         item.condition === 'fair' ? 'Cukup' : 'Rusak'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => { setSelectedAsset(item); setModalType('view'); }}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManageAssets && (
                          <>
                            <button 
                              onClick={() => { setSelectedAsset(item); setModalType('edit'); }}
                              className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => { setSelectedAsset(item); setModalType('delete'); }}
                              className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors" title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
          <span className="text-xs font-medium text-on-surface-variant">Menampilkan halaman {pagination.page} dari {pagination.last_page}</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg text-outline hover:bg-surface-container disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow-md">{pagination.page}</button>
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.last_page, prev.page + 1) }))}
              disabled={pagination.page === pagination.last_page}
              className="p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ViewAssetModal 
        isOpen={modalType === 'view'} 
        onClose={() => setModalType(null)} 
        asset={selectedAsset} 
      />
      
      <EditAssetModal 
        isOpen={modalType === 'edit'} 
        onClose={() => setModalType(null)} 
        asset={selectedAsset} 
        onSuccess={() => fetchAssets()}
      />

      <DeleteAssetModal 
        isOpen={modalType === 'delete'} 
        onClose={() => setModalType(null)} 
        asset={selectedAsset} 
        onSuccess={() => fetchAssets()}
      />

      {/* Modal Tambah Aset */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface">Tambah Aset Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="assetForm" onSubmit={handleCreateAsset} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Kode Aset</label>
                    <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="e.g. AST-001" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Nama Aset</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. MacBook Pro" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Kategori</label>
                    <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Elektronik" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Lokasi</label>
                    <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Lab 1" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Kondisi</label>
                    <select required value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="good">Baik</option>
                      <option value="fair">Cukup</option>
                      <option value="broken">Rusak</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Status</label>
                    <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="available">Tersedia</option>
                      <option value="loaned">Dipinjam</option>
                      <option value="maintenance">Perbaikan</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors">Batal</button>
              <button type="submit" form="assetForm" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Simpan Aset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
