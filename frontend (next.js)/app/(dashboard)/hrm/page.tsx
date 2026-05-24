'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit2, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Loader2,
  Briefcase,
  GraduationCap,
  Users,
  Award,
  ShieldCheck,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ViewEmployeeModal, EditEmployeeModal, DeleteEmployeeModal } from '@/components/EmployeeModals';
import { useUserRole } from '@/lib/useUserRole';
import AnimatedCounter from '@/components/AnimatedCounter';
import Staggered from '@/components/Staggered';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

export default function EmployeesPage() {
  const { canManageEmployees } = useUserRole();
  const [employees, setEmployees] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, teachers: 0, staff: 0, certifiedCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  
  // Master Data
  const [majors, setMajors] = useState<any[]>([]);

  // Filters & Search
  const [filters, setFilters] = useState({
    major_id: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    last_page: 1
  });

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'view' | 'edit' | 'create' | 'delete' | null;
    employee: any;
  }>({
    isOpen: false,
    type: null,
    employee: null
  });

  const fetchStats = async () => {
    setStatsError(false);
    try {
      const res = await apiRequest('/stats/employees');
      setStats(res);
    } catch (err) {
      console.error('Gagal mengambil statistik:', err);
      setStatsError(true);
    }
  };

  const fetchMasterData = async () => {
    try {
      const mRes = await apiRequest('/majors?limit=100');
      setMajors(mRes.data || []);
    } catch (err) {
      console.error('Gagal mengambil data master:', err);
    }
  };

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.major_id && { major_id: filters.major_id }),
        ...(filters.search && { search: filters.search }),
      }).toString();

      const response = await apiRequest(`/employees?${query}`);
      setEmployees(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total,
        last_page: response.meta.last_page
      }));
    } catch (err: any) {
      console.error('Gagal mengambil data pegawai:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      fetchMasterData();
      fetchStats();
    }
  }, []);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters.major_id, filters.search]);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      const timer = setTimeout(() => {
        fetchEmployees();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filters, pagination.page]);

  const openModal = (type: 'view' | 'edit' | 'create' | 'delete', employee: any = null) => {
    setModalState({ isOpen: true, type, employee });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null, employee: null });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Manajemen Kepegawaian</h2>
          <p className="text-on-surface-variant font-medium mt-1">Kelola data Instruktur, Staf, dan dokumen kepegawaian.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canManageEmployees && (
            <>
              <Link 
                href="/hrm/attendance"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-outline text-on-surface-variant text-sm font-bold hover:bg-surface-container hover:border-primary/30 hover:text-primary transition-all active:scale-95 shadow-sm"
              >
                <Clock className="w-4 h-4 text-primary" />
                <span>Kelola Presensi</span>
              </Link>
              <button 
                onClick={() => openModal('create')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pegawai</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      {statsError && (
        <div className="flex items-center gap-3 px-5 py-3 bg-error/10 border border-error/20 rounded-xl text-sm font-semibold text-error">
          <span>Gagal memuat statistik. Data mungkin tidak akurat.</span>
          <button onClick={fetchStats} className="ml-auto px-3 py-1 bg-error/20 hover:bg-error/30 rounded-lg text-xs font-bold transition-all">
            Muat Ulang
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-parent">
        <div className="stagger-child"><StatCard title="Total Pegawai" value={stats.total} icon={<Users className="w-6 h-6" />} color="primary" /></div>
        <div className="stagger-child"><StatCard title="Instruktur / Pengajar" value={stats.teachers} icon={<Award className="w-6 h-6" />} color="secondary" /></div>
        <div className="stagger-child"><StatCard title="Staf Administrasi" value={stats.staff} icon={<ShieldCheck className="w-6 h-6" />} color="tertiary" /></div>
        <div className="stagger-child"><StatCard title="Tersertifikasi" value={stats.certifiedCount} icon={<CheckCircle2 className="w-4 h-4 text-white" />} color="success" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-hover bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm anim-fade-in-up">
           <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
             <GraduationCap className="w-5 h-5 text-primary" />
             Sebaran Pendidikan Terakhir
           </h3>
           <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={stats.educationDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {(stats.educationDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#1e40af', '#3b82f6', '#93c5fd', '#bfdbfe'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                 </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="card-hover bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm anim-fade-in-up anim-delay-200">
           <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-secondary" />
             Status Sertifikasi Instruktur
           </h3>
           <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={stats.certificationDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {(stats.certificationDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                 </PieChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="anim-fade-in-up anim-delay-200 card-hover bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pencarian</label>
            <div className="flex items-center border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container focus-within:ring-2 focus-within:ring-primary/20 transition-all relative">
              <Search className="w-4 h-4 text-outline mr-3" />
              <input 
                type="text" 
                placeholder="Cari Nama atau Jabatan..." 
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
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Jurusan (Instruktur)</label>
            <select 
              className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              value={filters.major_id}
              onChange={(e) => setFilters(prev => ({ ...prev, major_id: e.target.value }))}
            >
              <option value="">Semua Jurusan</option>
              {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="anim-fade-in-up anim-delay-200 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Pegawai</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Jabatan</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Pendidikan</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Tgl Bergabung</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Status</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-surface-container-low">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="py-3 px-5">
                        <div className={cn("skeleton h-5", j === 0 ? "w-48" : j === 5 ? "w-24" : "w-28")} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                   <td colSpan={6} className="py-10 text-center text-on-surface-variant font-medium">
                     Belum ada data pegawai.
                   </td>
                </tr>
              ) : (
                employees.map((emp, index) => (
                  <tr key={emp.id} className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20 group anim-fade-in-up" style={{ animationDelay: `${index * 60}ms` }}>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                          {emp.full_name?.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-on-surface block">{emp.full_name}</span>
                          <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">{emp.major?.code || 'Staf'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2 text-on-surface font-semibold">
                        <Briefcase className="w-3.5 h-3.5 text-outline" />
                        {emp.position}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-outline" />
                        {emp.education}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-on-surface-variant font-medium">{new Date(emp.join_date).toLocaleDateString()}</td>
                    <td className="py-3 px-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        emp.status === 'active' 
                          ? "bg-secondary-container/20 text-secondary" 
                          : "bg-outline-variant/20 text-on-surface-variant"
                      )}>
                        {emp.status === 'active' ? 'Aktif' : emp.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openModal('view', emp)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                        {canManageEmployees && <><button onClick={() => openModal('edit', emp)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => openModal('delete', emp)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button></>}
                      </div>
                      <button className="p-2 text-on-surface-variant hidden transition-all"><MoreHorizontal className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-outline-variant bg-surface-container-lowest">
          <span className="text-xs font-medium text-on-surface-variant">Menampilkan {employees.length} pegawai</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg text-outline hover:bg-surface-container hover:text-primary disabled:opacity-50 disabled:hover:text-outline transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow-md hover:shadow-lg hover:brightness-110 transition-all anim-scale-in">{pagination.page}</button>
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.last_page, prev.page + 1) }))}
              disabled={pagination.page === pagination.last_page}
              className="p-2 rounded-lg text-on-surface hover:bg-surface-container hover:text-primary disabled:opacity-50 disabled:hover:text-on-surface transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ViewEmployeeModal 
        isOpen={modalState.isOpen && modalState.type === 'view'} 
        onClose={closeModal} 
        employee={modalState.employee} 
      />
      
      <EditEmployeeModal 
        isOpen={modalState.isOpen && (modalState.type === 'edit' || modalState.type === 'create')} 
        onClose={closeModal} 
        employee={modalState.employee} 
        isCreate={modalState.type === 'create'}
        onSuccess={() => { fetchEmployees(); fetchStats(); }}
        majors={majors}
      />

      <DeleteEmployeeModal 
        isOpen={modalState.isOpen && modalState.type === 'delete'} 
        onClose={closeModal} 
        employee={modalState.employee} 
        onSuccess={() => { fetchEmployees(); fetchStats(); }}
      />
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colorClasses: any = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    tertiary: "bg-tertiary/10 text-tertiary border-tertiary/20",
    success: "bg-success-container/30 text-success border-success/20",
  };

  return (
    <div className={cn("group/card p-4 sm:p-6 rounded-2xl border flex items-center gap-3 sm:gap-4 bg-surface-container-lowest shadow-sm relative overflow-hidden card-hover cursor-default", colorClasses[color])}>
      <div className={cn(
        "p-3 rounded-xl bg-current opacity-10 group-hover/card:opacity-20 group-hover/card:scale-110 transition-all duration-300",
      )} />
      <div className="absolute left-4 sm:left-6 group-hover/card:scale-110 group-hover/card:-translate-y-0.5 transition-transform duration-300">{icon}</div>
      <div className="ml-10 sm:ml-12">
        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-70 group-hover/card:opacity-100 truncate max-w-[100px] sm:max-w-none transition-opacity duration-300">{title}</p>
        <p className="text-xl sm:text-2xl font-black leading-none mt-1">
          <AnimatedCounter target={value} duration={1000} />
        </p>
      </div>
    </div>
  );
}
