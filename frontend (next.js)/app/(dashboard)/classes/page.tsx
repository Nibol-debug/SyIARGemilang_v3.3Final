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
  Users,
  Save,
  UserCheck,
  MapPin,
  GraduationCap,
  Layers,
  BookOpen
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

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Master Data for Dropdowns
  const [majors, setMajors] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

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
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade_level: 1,
    major_id: '',
    batch_id: '',
    homeroom_teacher_id: ''
  });

  const fetchMasterData = async () => {
    try {
      const [mRes, bRes, eRes] = await Promise.all([
        apiRequest('/majors?limit=100'),
        apiRequest('/batches?limit=100'),
        apiRequest('/employees?limit=100')
      ]);
      setMajors(mRes.data || []);
      setBatches(bRes.data || []);
      setEmployees(eRes.data || []);
    } catch (err) {
      console.error('Gagal mengambil data master:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiRequest('/classes');
      setStats({ total: res.meta.total });
    } catch (err) {
      console.error('Gagal mengambil statistik:', err);
    }
  };

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      }).toString();

      const response = await apiRequest(`/classes?${query}`);
      setClasses(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total,
        last_page: response.meta.last_page
      }));
    } catch (err: any) {
      console.error('Gagal mengambil data kelas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    if (token) {
      fetchClasses();
      fetchStats();
      fetchMasterData();
    }
  }, [pagination.page, search]);

  const handleOpenModal = (cls: any = null) => {
    if (cls) {
      setSelectedClass(cls);
      setFormData({
        name: cls.name,
        grade_level: cls.grade_level,
        major_id: cls.major_id,
        batch_id: cls.batch_id,
        homeroom_teacher_id: cls.homeroom_teacher_id || ''
      });
    } else {
      setSelectedClass(null);
      setFormData({
        name: '',
        grade_level: 1,
        major_id: majors[0]?.id || '',
        batch_id: batches.find(b => b.is_active)?.id || batches[0]?.id || '',
        homeroom_teacher_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        grade_level: parseInt(formData.grade_level.toString()),
        homeroom_teacher_id: formData.homeroom_teacher_id || undefined
      };

      if (selectedClass) {
        await apiRequest(`/classes/${selectedClass.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest('/classes', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchClasses();
      fetchStats();
    } catch (err: any) {
      alert('Gagal menyimpan data: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/classes/${selectedClass.id}`, {
        method: 'DELETE'
      });
      setShowDeleteConfirm(false);
      fetchClasses();
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
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Data Kelas</h2>
          <p className="text-on-surface-variant font-medium mt-1">Gunakan tabel ini untuk pemantauan rombongan belajar santri.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas</span>
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Kelas" value={stats.total} icon={<Layers className="w-6 h-6" />} color="primary" />
        <StatCard title="Total Jurusan" value={majors.length} icon={<BookOpen className="w-6 h-6" />} color="secondary" />
      </div>

      {/* Filter Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
        <div className="w-full sm:max-w-[28rem]">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cari Rombel</label>
            <div className="flex items-center border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container focus-within:ring-2 focus-within:ring-primary/20 transition-all relative">
              <Search className="w-4 h-4 text-outline mr-3" />
              <input 
                type="text" 
                placeholder="Cari Nama Kelas..." 
                className="bg-transparent outline-none text-sm w-full text-on-surface placeholder:text-outline-variant pr-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 text-outline hover:text-on-surface transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
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
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Jurusan</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Cabang</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Angkatan</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Wali Kelas</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-on-surface-variant font-medium text-sm">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : classes.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-10 text-center text-on-surface-variant font-medium">
                     Belum ada data kelas.
                   </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls.id} className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20 group">
                    <td className="py-3 px-5 font-bold text-on-surface">{cls.major?.name || '-'}</td>
                    <td className="py-3 px-5">
                      <span className="flex items-center gap-2 text-on-surface-variant font-bold text-xs uppercase tracking-wider">
                        <MapPin className="w-3 h-3 text-primary" />
                        {cls.major?.branch?.name || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                       <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-black text-xs">
                         Angkatan {cls.batch?.name || '-'}
                       </span>
                    </td>
                    <td className="py-3 px-5 text-on-surface-variant font-medium">{cls.homeroom_teacher?.full_name || '-'}</td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleOpenModal(cls)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedClass(cls); setShowDeleteConfirm(true); }}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors" title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg text-outline hover:bg-surface-container disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow-md">{pagination.page}</button>
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.last_page, prev.page + 1) }))}
              disabled={pagination.page === pagination.last_page}
              className="p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface">{selectedClass ? 'Edit Rombel' : 'Tambah Rombel'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="classForm" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nama Rombongan Belajar</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Contoh: 34 FD DPK 1"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Jurusan & Cabang</label>
                  <select 
                    required 
                    value={formData.major_id} 
                    onChange={e => setFormData({...formData, major_id: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                  >
                    <option value="" disabled>Pilih Jurusan</option>
                    {majors.map(m => <option key={m.id} value={m.id}>{m.name} ({m.branch?.name})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Angkatan</label>
                  <select 
                    required 
                    value={formData.batch_id} 
                    onChange={e => setFormData({...formData, batch_id: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                  >
                    <option value="" disabled>Pilih Angkatan</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Wali Kelas</label>
                <select 
                  value={formData.homeroom_teacher_id} 
                  onChange={e => setFormData({...formData, homeroom_teacher_id: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                >
                  <option value="">Pilih Wali Kelas</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                </select>
              </div>
            </form>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2.5 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="classForm"
                disabled={isSubmitting} 
                className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Simpan Kelas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-[28rem] rounded-2xl shadow-2xl overflow-hidden p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto text-error shadow-inner">
              <Trash2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-on-surface tracking-tight">Hapus Rombel?</h3>
              <p className="text-on-surface-variant font-medium leading-relaxed">
                Menghapus rombel <span className="text-on-surface font-bold">"{selectedClass?.name}"</span> akan melepaskan referensi kelas dari para santri di dalamnya.
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
