'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Loader2, 
  Trash2, 
  Save, 
  Eye, 
  User, 
  Shield, 
  Key, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Edit,
  Lock,
  Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { useLockBodyScroll } from '@/lib/useLockBodyScroll';

// --- View Detail Modal (Includes Device Management) ---
export const ViewUserModal = ({ user, isOpen, onClose }: any) => {
  useLockBodyScroll(isOpen);
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchDevices();
    }
  }, [isOpen, user]);

  const fetchDevices = async () => {
    setIsLoadingDevices(true);
    try {
      const data = await apiRequest(`/users/${user.id}/devices`);
      setDevices(data);
    } catch (err) {
      console.error('Failed to fetch devices', err);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const toggleDevice = async (deviceId: string, isActive: boolean) => {
    try {
      await apiRequest(`/users/${user.id}/devices/${deviceId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive })
      });
      fetchDevices();
    } catch (err: any) {
      alert('Gagal mengubah status perangkat: ' + err.message);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Detail Pengguna
          </h3>
          <button autoFocus onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-8 overflow-y-auto flex-1 text-sm space-y-8">
          {/* User Basic Info */}
          <div className="flex items-center gap-6 pb-6 border-b border-outline-variant/50">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-bold text-on-surface">@{user.username}</h4>
              <p className="text-on-surface-variant font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-outline" />
                Peran: <span className="text-primary font-bold">{user.role?.name}</span>
              </p>
              {user.student && (
                <p className="text-xs font-bold text-secondary uppercase tracking-widest mt-1">Siswa: {user.student.full_name}</p>
              )}
              {user.employee && (
                <p className="text-xs font-bold text-secondary uppercase tracking-widest mt-1">Pegawai: {user.employee.full_name}</p>
              )}
            </div>
          </div>

          {/* Device Management Section */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Perangkat Terdaftar (Device Locking)
            </h5>
            
            {isLoadingDevices ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : devices.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-surface-container-low">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        device.is_active ? "bg-success-container/30 text-success" : "bg-outline-variant/30 text-on-surface-variant"
                      )}>
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">ID: {device.device_id}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                          Status: {device.is_active ? 'AKTIF' : 'TERKUNCI'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleDevice(device.id, !device.is_active)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all active:scale-95",
                        device.is_active 
                          ? "bg-error/10 text-error hover:bg-error/20" 
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      )}
                    >
                      {device.is_active ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      {device.is_active ? 'Kunci' : 'Buka Kunci'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-outline-variant rounded-2xl opacity-50">
                <p className="text-xs font-bold uppercase tracking-widest">Belum ada perangkat terdaftar</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-surface-container-high text-on-surface-variant font-bold text-sm hover:bg-outline-variant/30 transition-all">Tutup</button>
        </div>
      </div>
    </div>
  );
};

// --- Edit & Create User Modal ---
export const EditUserModal = ({ user, isOpen, onClose, onSuccess, roles, isCreate = false }: any) => {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isCreate) {
      setFormData({
        username: user.username,
        role_id: user.role_id,
        password: '', // Empty for edit unless changed
      });
    } else {
      setFormData({
        username: '',
        role_id: '',
        password: '',
      });
    }
  }, [user, isOpen, isCreate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = isCreate ? '/users' : `/users/${user.id}`;
      const method = isCreate ? 'POST' : 'PATCH';
      
      const payload: any = { ...formData };
      if (!isCreate && !payload.password) {
        delete payload.password;
      }
      if (isCreate) {
        payload.password_hash = payload.password;
        delete payload.password;
      }

      await apiRequest(url, {
        method,
        body: JSON.stringify(payload)
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('Gagal menyimpan data pengguna: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-[28rem] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            {isCreate ? <Plus className="w-5 h-5 text-primary" /> : <Edit className="w-5 h-5 text-primary" />}
            {isCreate ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
          </h3>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <form id="userForm" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-outline" />
                <input 
                  type="text" 
                  required 
                  placeholder="admin_baru"
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {isCreate ? 'Password' : 'Ganti Password (Kosongkan jika tidak diubah)'}
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-4 h-4 text-outline" />
                <input 
                  type="password" 
                  required={isCreate}
                  placeholder="••••••••"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Peran (Role)</label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 w-4 h-4 text-outline" />
                <select 
                  required 
                  value={formData.role_id} 
                  onChange={e => setFormData({...formData, role_id: e.target.value})} 
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none"
                >
                  <option value="">Pilih Peran</option>
                  {roles.map((role: any) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant bg-surface flex flex-col sm:flex-row justify-end gap-3 w-full">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all">Batal</button>
          <button type="submit" form="userForm" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isCreate ? 'Simpan' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Delete User Confirmation ---
export const DeleteUserModal = ({ user, isOpen, onClose, onSuccess }: any) => {
  useLockBodyScroll(isOpen);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiRequest(`/users/${user.id}`, { method: 'DELETE' });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('Gagal menghapus pengguna: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-[28rem] rounded-2xl shadow-2xl overflow-hidden p-4 md:p-8 text-center space-y-6 animate-in fade-in zoom-in duration-200">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto text-error shadow-inner">
          <Trash2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-on-surface tracking-tight">Hapus Pengguna?</h3>
          <p className="text-on-surface-variant font-medium leading-relaxed">
            Anda akan menghapus akun <span className="text-on-surface font-bold">"@{user.username}"</span>. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
          <button autoFocus onClick={onClose} className="flex-1 px-6 py-3 rounded-xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all active:scale-95">Batal</button>
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
  );
};
