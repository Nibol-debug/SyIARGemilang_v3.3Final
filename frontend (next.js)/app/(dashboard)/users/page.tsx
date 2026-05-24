'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  ShieldCheck,
  UserCheck,
  UserX,
  ShieldAlert,
  X,
  History,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { ViewUserModal, EditUserModal, DeleteUserModal } from '@/components/UserModals';
import { useUserRole } from '@/lib/useUserRole';

export default function UsersPage() {
  const { canManageUsers } = useUserRole();
  const [data, setData] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  
  // Modals State
  const [modals, setModals] = useState({
    view: false,
    edit: false,
    delete: false,
    isCreate: false
  });
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    roleId: ''
  });

  const fetchData = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: meta.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.roleId && { roleId: filters.roleId })
      });
      const response = await apiRequest(`/users?${query}`);
      setData(response.items);
      setMeta(response.meta);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, meta.limit]);

  const fetchRoles = async () => {
    try {
      const response = await apiRequest('/roles');
      setRoles(response);
    } catch (err) {
      console.error('Failed to fetch roles', err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters, fetchData]);

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  const openModal = (type: 'view' | 'edit' | 'delete', user: any = null, isCreate = false) => {
    setSelectedUser(user);
    setModals(prev => ({ ...prev, [type]: true, isCreate }));
  };

  const closeModal = () => {
    setModals({ view: false, edit: false, delete: false, isCreate: false });
    setSelectedUser(null);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Manajemen Pengguna</h2>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-on-surface-variant font-medium">Kelola akun, peran, dan hak akses.</p>
            <div className="flex gap-2">
              <Link href="/users/roles" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <Settings2 className="w-3 h-3" />
                Atur Peran
              </Link>
              <Link href="/users/logs" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <History className="w-3 h-3" />
                Audit Log
              </Link>
            </div>
          </div>
        </div>
        {canManageUsers && (
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => openModal('edit', null, true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        </div>
        )}
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Pengguna" value={meta.total} icon={<ShieldCheck className="w-6 h-6" />} color="primary" />
        <StatCard title="Total Peran" value={roles.length} icon={<ShieldAlert className="w-6 h-6" />} color="secondary" />
        <StatCard title="Halaman" value={`${meta.page} / ${meta.totalPages}`} icon={<UserCheck className="w-6 h-6" />} color="success" />
      </div>

      {/* Filter Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2 col-span-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pencarian</label>
            <div className="flex items-center border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container focus-within:ring-2 focus-within:ring-primary/20 transition-all relative">
              <Search className="w-4 h-4 text-outline mr-3" />
              <input 
                type="text" 
                placeholder="Cari Username atau Nama..." 
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
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Peran (Role)</label>
            <select 
              className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              value={filters.roleId}
              onChange={(e) => setFilters(prev => ({ ...prev, roleId: e.target.value }))}
            >
              <option value="">Semua Peran</option>
              {roles.map((role: any) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
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
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Username</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Tipe Akun</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Peran</th>
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
              ) : data.length === 0 ? (
                <tr>
                   <td colSpan={4} className="py-10 text-center text-on-surface-variant font-medium">
                     Tidak ada data yang sesuai dengan filter.
                   </td>
                </tr>
              ) : (
                data.map((user) => (
                  <tr key={user.id} className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20 group">
                    <td className="py-3 px-5 font-semibold text-on-surface">@{user.username}</td>
                    <td className="py-3 px-5 text-on-surface font-medium">
                      {user.student ? (
                        <span className="flex flex-col">
                          <span className="text-xs font-bold text-secondary uppercase tracking-tighter">Siswa</span>
                          <span>{user.student.full_name}</span>
                        </span>
                      ) : user.employee ? (
                        <span className="flex flex-col">
                          <span className="text-xs font-bold text-tertiary uppercase tracking-tighter">Pegawai</span>
                          <span>{user.employee.full_name}</span>
                        </span>
                      ) : (
                        <span className="text-outline-variant italic">System User</span>
                      )}
                    </td>
                    <td className="py-3 px-5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                            {user.role?.name}
                        </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => openModal('view', user)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" 
                          title="View / Devices"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManageUsers && <>
                        <button 
                          onClick={() => openModal('edit', user)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openModal('delete', user)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        </>}
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
          <span className="text-xs font-medium text-on-surface-variant">Menampilkan {data.length} dari {meta.total} pengguna</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page === 1}
              className="p-2 rounded-lg text-outline hover:bg-surface-container disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow-md">{meta.page}</button>
            <button 
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page === meta.totalPages}
              className="p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ViewUserModal 
        user={selectedUser} 
        isOpen={modals.view} 
        onClose={closeModal} 
      />
      <EditUserModal 
        user={selectedUser} 
        isOpen={modals.edit} 
        onClose={closeModal} 
        onSuccess={() => fetchData(meta.page)} 
        roles={roles}
        isCreate={modals.isCreate}
      />
      <DeleteUserModal 
        user={selectedUser} 
        isOpen={modals.delete} 
        onClose={closeModal} 
        onSuccess={() => fetchData(1)} 
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
    <div className={cn("p-6 rounded-2xl border flex items-center gap-4 bg-surface-container-lowest shadow-sm relative overflow-hidden", colorClasses[color])}>
      <div className="p-3 rounded-xl bg-current opacity-10 flex-shrink-0" />
      <div className="absolute p-3">{icon}</div>
      <div className="ml-4">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{title}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}
