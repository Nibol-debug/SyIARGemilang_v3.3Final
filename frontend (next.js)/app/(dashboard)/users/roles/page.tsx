'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Loader2,
  ArrowLeft,
  Settings,
  Lock,
  Save,
  X,
  Trash2,
  Check,
  Users,
  GraduationCap,
  BarChart3,
  Wallet,
  BadgeCheck,
  Package,
  BookOpen,
  Calendar,
  Layers,
  School,
  Bell,
  FileText,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';

const PERMISSION_LABELS: Record<string, string> = {
  manage_students: 'Kelola Santri',
  view_students: 'Lihat Santri',
  manage_academic: 'Kelola Akademik',
  view_academic: 'Lihat Akademik',
  manage_exams: 'Kelola Ujian',
  view_exams: 'Lihat Ujian',
  manage_grades: 'Kelola Nilai',
  view_grades: 'Lihat Nilai',
  manage_finance: 'Kelola Keuangan',
  view_finance: 'Lihat Keuangan',
  manage_hrm: 'Kelola SDM',
  view_hrm: 'Lihat SDM',
  manage_assets: 'Kelola Aset',
  view_assets: 'Lihat Aset',
  manage_majors: 'Kelola Jurusan',
  view_majors: 'Lihat Jurusan',
  manage_batches: 'Kelola Angkatan',
  view_batches: 'Lihat Angkatan',
  manage_classes: 'Kelola Kelas',
  view_classes: 'Lihat Kelas',
  manage_users: 'Kelola Pengguna',
  view_users: 'Lihat Pengguna',
  manage_applicants: 'Kelola Pendaftar',
  view_applicants: 'Lihat Pendaftar',
  view_reports: 'Lihat Laporan',
  view_notifications: 'Lihat Notifikasi',
};

const PERMISSION_GROUPS: { label: string; icon: React.ElementType; perms: string[] }[] = [
  { label: 'Santri', icon: Users, perms: ['manage_students', 'view_students'] },
  { label: 'Akademik', icon: GraduationCap, perms: ['manage_academic', 'view_academic'] },
  { label: 'Ujian', icon: ClipboardList, perms: ['manage_exams', 'view_exams'] },
  { label: 'Penilaian', icon: BarChart3, perms: ['manage_grades', 'view_grades'] },
  { label: 'Keuangan', icon: Wallet, perms: ['manage_finance', 'view_finance'] },
  { label: 'SDM', icon: BadgeCheck, perms: ['manage_hrm', 'view_hrm'] },
  { label: 'Aset & Inventaris', icon: Package, perms: ['manage_assets', 'view_assets'] },
  { label: 'Jurusan', icon: BookOpen, perms: ['manage_majors', 'view_majors'] },
  { label: 'Angkatan', icon: Calendar, perms: ['manage_batches', 'view_batches'] },
  { label: 'Kelas', icon: Layers, perms: ['manage_classes', 'view_classes'] },
  { label: 'Pengguna', icon: School, perms: ['manage_users', 'view_users'] },
  { label: 'Pendaftar', icon: ClipboardList, perms: ['manage_applicants', 'view_applicants'] },
  { label: 'Laporan & Notifikasi', icon: FileText, perms: ['view_reports', 'view_notifications'] },
];

const isManagePerm = (name: string) => name.startsWith('manage_');

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        apiRequest('/roles'),
        apiRequest('/permissions')
      ]);
      setRoles(rolesRes);
      setPermissions(permsRes);
    } catch (err) {
      console.error('Failed to fetch roles/permissions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditPermissions = (role: any) => {
    setSelectedRole(role);
    setRolePermissions(role.permissions.map((p: any) => p.permission_id));
  };

  const togglePermission = (permId: string) => {
    setRolePermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(id => id !== permId) 
        : [...prev, permId]
    );
  };

  const toggleGroup = (groupPerms: string[], checked: boolean) => {
    const permIds = groupPerms
      .map(name => permissions.find(p => p.name === name)?.id)
      .filter(Boolean) as string[];
    setRolePermissions(prev => {
      const set = new Set(prev);
      for (const id of permIds) {
        if (checked) set.add(id);
        else set.delete(id);
      }
      return Array.from(set);
    });
  };

  const isGroupFullyChecked = (groupPerms: string[]) => {
    const ids = groupPerms.map(name => permissions.find(p => p.name === name)?.id).filter(Boolean);
    return ids.length > 0 && ids.every(id => rolePermissions.includes(id));
  };

  const isGroupPartiallyChecked = (groupPerms: string[]) => {
    const ids = groupPerms.map(name => permissions.find(p => p.name === name)?.id).filter(Boolean);
    return ids.some(id => rolePermissions.includes(id)) && !ids.every(id => rolePermissions.includes(id));
  };

  const savePermissions = async () => {
    setIsSaving(true);
    try {
      await apiRequest(`/roles/${selectedRole.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ permissionIds: rolePermissions })
      });
      setSelectedRole(null);
      fetchData();
    } catch (err: any) {
      alert('Gagal menyimpan izin: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const createRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      await apiRequest('/roles', { method: 'POST', body: JSON.stringify({ name: newRoleName.trim() }) });
      setShowCreateRole(false);
      setNewRoleName('');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      await apiRequest(`/roles/${roleId}`, { method: 'DELETE' });
      setShowDeleteConfirm(null);
      setSelectedRole(null);
      fetchData();
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const permCount = (role: any) => role.permissions?.length || 0;

  const selectedRolePermIds = selectedRole
    ? new Set((selectedRole.permissions || []).map((p: any) => p.permission_id))
    : new Set<string>();

  const filteredGroups = PERMISSION_GROUPS.filter(g => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return g.label.toLowerCase().includes(q) || g.perms.some(p => p.includes(q) || (PERMISSION_LABELS[p] || '').toLowerCase().includes(q));
  });

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <Link href="/users" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline mb-2">
            <ArrowLeft className="w-3 h-3" />
            Kembali ke Pengguna
          </Link>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Peran & Hak Akses
          </h2>
          <p className="text-on-surface-variant font-medium">Kelola Role-Based Access Control (RBAC) untuk seluruh fitur sistem.</p>
        </div>
        <button 
          onClick={() => setShowCreateRole(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Peran
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roles List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] px-2">Daftar Peran</h3>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-2">
              {roles.map((role) => (
                <div 
                  key={role.id} 
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer group",
                    selectedRole?.id === role.id 
                      ? "bg-primary/5 border-primary shadow-sm" 
                      : "bg-surface-container-lowest border-outline-variant hover:border-primary/50"
                  )}
                >
                  <div onClick={() => handleEditPermissions(role)}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        selectedRole?.id === role.id ? "bg-primary text-on-primary" : "bg-surface-container text-outline group-hover:text-primary"
                      )}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface truncate">{role.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            permCount(role) === permissions.length ? "text-success" : "text-on-surface-variant"
                          )}>
                            {permCount(role)} / {permissions.length} izin
                          </div>
                        </div>
                      </div>
                      <Settings className={cn(
                        "w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                        selectedRole?.id === role.id ? "text-primary opacity-100" : "text-outline"
                      )} />
                    </div>
                    {/* Permission bar */}
                    <div className="mt-3 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${permissions.length > 0 ? (permCount(role) / permissions.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  {/* Delete button */}
                  {role.name !== 'Administrator Utama' && (
                    <div className="mt-2 pt-2 border-t border-outline-variant/30 flex justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(role.id); }}
                        className="flex items-center gap-1 text-[10px] font-bold text-error/60 hover:text-error transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Permissions Editor */}
        <div className="lg:col-span-2 space-y-4">
          {selectedRole ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Editor Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-outline-variant">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface">Hak Akses: {selectedRole.name}</h4>
                    <p className="text-sm font-medium text-on-surface-variant">
                      <span className="font-bold text-primary">{rolePermissions.length}</span> dari <span className="font-bold">{permissions.length}</span> izin dipilih
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setSelectedRole(null)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline text-on-surface font-bold text-sm hover:bg-surface-container transition-all"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Tutup</span>
                  </button>
                  <button 
                    onClick={savePermissions}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input
                  type="text"
                  placeholder="Cari permission..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Grouped Permissions */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredGroups.map((group) => {
                  const Icon = group.icon;
                  const groupPermObjs = group.perms
                    .map(name => permissions.find(p => p.name === name))
                    .filter(Boolean);
                  if (groupPermObjs.length === 0) return null;

                  const fullyChecked = isGroupFullyChecked(group.perms);
                  const partiallyChecked = isGroupPartiallyChecked(group.perms);

                  return (
                    <div key={group.label} className="border border-outline-variant rounded-2xl overflow-hidden">
                      {/* Group Header */}
                      <div 
                        className="flex items-center gap-3 px-4 py-3 bg-surface-container cursor-pointer hover:bg-surface-container-hover transition-colors"
                        onClick={() => toggleGroup(group.perms, !fullyChecked)}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          fullyChecked ? "bg-primary/15 text-primary" : "bg-surface text-outline"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-on-surface">{group.label}</p>
                          <p className="text-[10px] font-medium text-on-surface-variant">
                            {groupPermObjs.filter(p => rolePermissions.includes(p.id)).length}/{groupPermObjs.length} dipilih
                          </p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                          fullyChecked 
                            ? "bg-primary border-primary" 
                            : partiallyChecked 
                              ? "border-primary/50 bg-primary/10" 
                              : "border-outline"
                        )}>
                          {fullyChecked && <Check className="w-3 h-3 text-on-primary" />}
                          {partiallyChecked && <div className="w-2 h-0.5 bg-primary rounded" />}
                        </div>
                      </div>

                      {/* Permissions within group */}
                      <div className="px-4 pb-3 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {groupPermObjs.map((perm) => {
                            const isActive = rolePermissions.includes(perm.id);
                            const isManage = isManagePerm(perm.name);
                            return (
                              <div 
                                key={perm.id} 
                                onClick={() => togglePermission(perm.id)}
                                className={cn(
                                  "flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all",
                                  isActive 
                                    ? "bg-primary/5 text-on-surface" 
                                    : "text-on-surface-variant hover:bg-surface-container"
                                )}
                              >
                                <div className={cn(
                                  "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                  isActive ? "bg-primary border-primary" : "border-outline"
                                )}>
                                  {isActive && <Check className="w-2.5 h-2.5 text-on-primary" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={cn("text-xs font-bold truncate", isActive && "text-primary")}>
                                    {PERMISSION_LABELS[perm.name] || perm.name}
                                  </p>
                                </div>
                                <span className={cn(
                                  "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded",
                                  isManage ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                                )}>
                                  {isManage ? 'tulis' : 'baca'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-low border border-dashed border-outline-variant rounded-3xl p-20 flex flex-col items-center justify-center text-center opacity-60">
              <Shield className="w-16 h-16 text-outline mb-6" />
              <h4 className="text-xl font-bold text-on-surface mb-2">Pilih Peran untuk Mengelola Izin</h4>
              <p className="max-w-xs text-sm font-medium text-on-surface-variant">
                Klik salah satu peran di sebelah kiri untuk melihat dan mengubah hak akses fiturnya.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateRole(false)}>
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-on-surface">Tambah Peran Baru</h3>
              <button onClick={() => setShowCreateRole(false)} className="p-1 rounded-lg hover:bg-surface-container transition-colors">
                <X className="w-5 h-5 text-outline" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Nama peran (contoh: Wali Kelas)"
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createRole()}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowCreateRole(false)}
                className="px-5 py-2.5 rounded-xl border border-outline text-on-surface font-bold text-sm hover:bg-surface-container transition-all"
              >
                Batal
              </button>
              <button 
                onClick={createRole}
                disabled={!newRoleName.trim()}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40"
              >
                Buat Peran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">Hapus Peran</h3>
                <p className="text-sm text-on-surface-variant">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="px-5 py-2.5 rounded-xl border border-outline text-on-surface font-bold text-sm hover:bg-surface-container transition-all"
              >
                Batal
              </button>
              <button 
                onClick={() => deleteRole(showDeleteConfirm)}
                className="px-5 py-2.5 rounded-xl bg-error text-on-error font-bold text-sm hover:opacity-90 transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
