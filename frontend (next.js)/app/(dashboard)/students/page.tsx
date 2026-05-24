'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import {
  Plus, Upload, Download, Search, Eye, Edit2, Trash2,
  ChevronLeft, ChevronRight, MoreHorizontal, X, Loader2,
  AlertCircle, Users, UserCheck, UserX, User, GraduationCap,
  ArrowUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ViewStudentModal, EditStudentModal, DeleteStudentModal } from '@/components/StudentModals';
import ImportPreviewModal from '@/components/ImportPreviewModal';
import { MapPicker } from '@/components/MapPicker';
import { useUserRole } from '@/lib/useUserRole';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_COLORS = ['#1e40af', '#10b981', '#f59e0b', '#ef4444'];

const EMPTY_FORM = {
  nis: '', nik: '', full_name: '', gender: 'L',
  birth_place: '', birth_date: '', address: '',
  phone: '', email: '', branch_id: '', major_id: '',
  batch_id: '', class_id: '', status: 'active',
  health_history: '', latitude: '', longitude: '',
  profile_picture: '',
  parents: { father_name: '', mother_name: '', phone: '', address: '' },
};

const EMPTY_STATS = {
  total: 0, male: 0, female: 0, active: 0, alumni: 0, moved: 0,
  ageDistribution: [], locationDistribution: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? '';
}

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function buildQuery(params: Record<string, string>) {
  return new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => Boolean(v)))
  ).toString();
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'tertiary' | 'success';
};

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorMap = {
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

// ─── StudentRow ───────────────────────────────────────────────────────────────

function StudentRow({
  student,
  canManage,
  onOpenModal,
}: {
  student: any;
  canManage: boolean;
  onOpenModal: (type: 'view' | 'edit' | 'delete', student: any) => void;
}) {
  const apiBase = getApiBase();

  return (
    <tr className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20 group">
      <td className="py-3 px-5">
        <div className="flex items-center gap-3">
          {student.profile_picture ? (
            <img
              src={`${apiBase}${student.profile_picture}`}
              alt=""
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
              {student.full_name?.charAt(0)}
            </div>
          )}
          <span className="font-semibold text-on-surface">{student.full_name}</span>
        </div>
      </td>
      <td className="py-3 px-5 font-semibold text-on-surface">{student.nis}</td>
      <td className="py-3 px-5 text-on-surface font-medium">{student.branch?.name ?? '—'}</td>
      <td className="py-3 px-5 text-on-surface font-medium">{student.class?.name  ?? '—'}</td>
      <td className="py-3 px-5 text-on-surface font-medium">{student.major?.name  ?? '—'}</td>
      <td className="py-3 px-5 text-on-surface font-medium">{student.batch?.name  ?? '—'}</td>
      <td className="py-3 px-5">
        <span className={cn(
          'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
          student.status === 'active'
            ? 'bg-secondary-container/20 text-secondary'
            : 'bg-outline-variant/20 text-on-surface-variant',
        )}>
          {student.status === 'active' ? 'Aktif' : student.status}
        </span>
      </td>
      <td className="py-3 px-5 text-right">
        <div className="flex justify-end gap-1">
          <button
            onClick={() => onOpenModal('view', student)}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
            title="Lihat"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canManage && (
            <>
              <button
                onClick={() => onOpenModal('edit', student)}
                className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenModal('delete', student)}
                className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        <MoreHorizontal className="w-4 h-4 text-on-surface-variant hidden ml-auto" />
      </td>
    </tr>
  );
}

// ─── ListTab ──────────────────────────────────────────────────────────────────

type ListTabProps = {
  students: any[];
  isLoading: boolean;
  error: string;
  filters: any;
  filteredMajors: any[];
  branches: any[];
  pagination: any;
  canManageStudents: boolean;
  onFilterChange: (key: string, value: string) => void;
  onPageChange: (page: number) => void;
  onOpenModal: (type: 'view' | 'edit' | 'delete', student: any) => void;
};

function ListTab({
  students, isLoading, error, filters, filteredMajors, branches,
  pagination, canManageStudents, onFilterChange, onPageChange, onOpenModal,
}: ListTabProps) {
  const selectClass = 'border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer';
  const labelClass  = 'text-xs font-bold text-on-surface-variant uppercase tracking-wider';

  const TABLE_HEADERS = ['Nama', 'NIS', 'Cabang', 'Kelas', 'Jurusan', 'Angkatan', 'Status', ''];

  return (
    <>
      {/* ── Filter bar ── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Search */}
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Pencarian</label>
            <div className="flex items-center border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container focus-within:ring-2 focus-within:ring-primary/20 transition-all relative">
              <Search className="w-4 h-4 text-outline mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cari NIS atau Nama..."
                className="bg-transparent outline-none text-sm w-full text-on-surface placeholder:text-outline-variant pr-8"
                value={filters.search}
                onChange={e => onFilterChange('search', e.target.value)}
              />
              {filters.search && (
                <button
                  onClick={() => onFilterChange('search', '')}
                  className="absolute right-3 text-outline hover:text-on-surface transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Jenis Kelamin</label>
            <select className={selectClass} value={filters.gender} onChange={e => onFilterChange('gender', e.target.value)}>
              <option value="">Semua</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          {/* Branch */}
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Cabang</label>
            <select className={selectClass} value={filters.branch_id} onChange={e => onFilterChange('branch_id', e.target.value)}>
              <option value="">Semua Cabang</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* Major */}
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Jurusan</label>
            <select className={selectClass} value={filters.major_id} onChange={e => onFilterChange('major_id', e.target.value)}>
              <option value="">Semua Jurusan</option>
              {filteredMajors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {TABLE_HEADERS.map((h, i) => (
                  <th
                    key={i}
                    className={cn(
                      'py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]',
                      h === '' && 'text-right',
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-on-surface-variant font-medium text-sm">Memuat data siswa...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-error">
                      <AlertCircle className="w-8 h-8 opacity-50" />
                      <p className="font-medium text-sm">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                      <AlertCircle className="w-8 h-8 opacity-20" />
                      <p className="font-medium">Belum ada data siswa.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map(student => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    canManage={canManageStudents}
                    onOpenModal={onOpenModal}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-outline-variant bg-surface-container-lowest">
          <span className="text-xs font-medium text-on-surface-variant">
            Halaman {pagination.page} dari {pagination.last_page}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg text-outline hover:bg-surface-container disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="w-9 h-9 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow-md">
              {pagination.page}
            </span>
            <button
              onClick={() => onPageChange(Math.min(pagination.last_page, pagination.page + 1))}
              disabled={pagination.page === pagination.last_page}
              className="p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── StatsTab ─────────────────────────────────────────────────────────────────

function StatsTab({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
        <h3 className="text-lg font-bold text-on-surface mb-6">Persebaran Usia</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="value" fill="#1e40af" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
        <h3 className="text-lg font-bold text-on-surface mb-6">Persebaran Wilayah (Kampus)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.locationDistribution}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.locationDistribution.map((_: any, i: number) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {stats.locationDistribution.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="text-xs font-bold text-on-surface-variant">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AddStudentModal ──────────────────────────────────────────────────────────

type AddStudentModalProps = {
  formData: typeof EMPTY_FORM;
  formError: string;
  isSubmitting: boolean;
  isUploading: boolean;
  apiBase: string;
  branches: any[];
  formMajors: any[];
  batches: any[];
  formClasses: any[];
  onFormChange: (update: Partial<typeof EMPTY_FORM>) => void;
  onParentsChange: (update: Partial<typeof EMPTY_FORM.parents>) => void;
  onBranchChange: (id: string) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
};

function AddStudentModal({
  formData, formError, isSubmitting, isUploading, apiBase,
  branches, formMajors, batches, formClasses,
  onFormChange, onParentsChange, onBranchChange, onPhotoUpload, onSubmit, onClose,
}: AddStudentModalProps) {
  const fieldClass = 'w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none';
  const labelClass = 'text-xs font-bold text-on-surface-variant uppercase tracking-wider';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
          <h3 className="text-lg font-bold text-on-surface">Tambah Siswa Baru</h3>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="studentForm" onSubmit={onSubmit} className="space-y-6">

            {/* Photo upload */}
            <div className="flex items-center gap-6 bg-surface-container p-4 rounded-2xl border border-outline-variant/30">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  {formData.profile_picture
                    ? <img src={`${apiBase}${formData.profile_picture}`} className="w-full h-full object-cover" alt="" />
                    : <User className="w-8 h-8 text-primary" />
                  }
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 p-2 bg-primary text-on-primary rounded-xl cursor-pointer shadow-lg hover:scale-105 transition-all">
                  <Upload className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={onPhotoUpload} />
                </label>
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-sm uppercase tracking-wider">Foto Profil Santri</h4>
                <p className="text-[10px] font-medium text-on-surface-variant">Klik tombol biru untuk mengunggah foto.</p>
              </div>
            </div>

            {/* NIS / NIK */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>NIS</label>
                <input required type="text" className={fieldClass} value={formData.nis} onChange={e => onFormChange({ nis: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>NIK</label>
                <input required type="text" className={fieldClass} value={formData.nik} onChange={e => onFormChange({ nik: e.target.value })} />
              </div>
            </div>

            {/* Full name */}
            <div className="space-y-1">
              <label className={labelClass}>Nama Lengkap</label>
              <input required type="text" className={fieldClass} value={formData.full_name} onChange={e => onFormChange({ full_name: e.target.value })} />
            </div>

            {/* Map */}
            <div className="space-y-1">
              <label className={labelClass}>Lokasi Rumah (Pilih di Peta)</label>
              <MapPicker
                onLocationSelect={(lat: number, lng: number, addr?: string) =>
                  onFormChange({ latitude: lat.toString(), longitude: lng.toString(), address: addr ?? formData.address })
                }
              />
            </div>

            {/* Birth place / date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Tempat Lahir</label>
                <input required type="text" className={fieldClass} value={formData.birth_place} onChange={e => onFormChange({ birth_place: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Tanggal Lahir</label>
                <input required type="date" className={fieldClass} value={formData.birth_date} onChange={e => onFormChange({ birth_date: e.target.value })} />
              </div>
            </div>

            {/* Gender / Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Jenis Kelamin</label>
                <select required className={fieldClass} value={formData.gender} onChange={e => onFormChange({ gender: e.target.value })}>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Email</label>
                <input required type="email" className={fieldClass} value={formData.email} onChange={e => onFormChange({ email: e.target.value })} />
              </div>
            </div>

            {/* Phone / Branch */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Telepon</label>
                <input required type="text" className={fieldClass} value={formData.phone} onChange={e => onFormChange({ phone: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Cabang RGI</label>
                <select required className={fieldClass} value={formData.branch_id} onChange={e => onBranchChange(e.target.value)}>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            {/* Major / Batch */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Jurusan</label>
                <select required className={fieldClass} value={formData.major_id} onChange={e => onFormChange({ major_id: e.target.value, class_id: '' })}>
                  <option value="">Pilih Jurusan</option>
                  {formMajors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Angkatan</label>
                <select required className={fieldClass} value={formData.batch_id} onChange={e => onFormChange({ batch_id: e.target.value })}>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            {/* Class / Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Kelas</label>
                <select required className={fieldClass} value={formData.class_id} onChange={e => onFormChange({ class_id: e.target.value })}>
                  <option value="">Pilih Kelas</option>
                  {formClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Status</label>
                <select className={fieldClass} value={formData.status} onChange={e => onFormChange({ status: e.target.value })}>
                  <option value="active">Aktif</option>
                  <option value="alumni">Alumni</option>
                  <option value="moved">Pindah</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className={labelClass}>Alamat Lengkap (Auto-fill)</label>
              <textarea required className={cn(fieldClass, 'h-20 resize-none')} value={formData.address} onChange={e => onFormChange({ address: e.target.value })} />
            </div>

            {/* Health history */}
            <div className="space-y-1">
              <label className={labelClass}>Riwayat Kesehatan</label>
              <textarea
                className={cn(fieldClass, 'h-20 resize-none')}
                placeholder="Alergi, penyakit kronis, dll..."
                value={formData.health_history}
                onChange={e => onFormChange({ health_history: e.target.value })}
              />
            </div>

            {/* Parents */}
            <div className="pt-4 border-t border-outline-variant">
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Data Orang Tua</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Nama Ayah</label>
                  <input required type="text" className={fieldClass} value={formData.parents.father_name} onChange={e => onParentsChange({ father_name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Nama Ibu</label>
                  <input required type="text" className={fieldClass} value={formData.parents.mother_name} onChange={e => onParentsChange({ mother_name: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1 mt-4">
                <label className={labelClass}>Telepon Orang Tua</label>
                <input required type="text" className={fieldClass} value={formData.parents.phone} onChange={e => onParentsChange({ phone: e.target.value })} />
              </div>
            </div>

            {/* Form error */}
            {formError && (
              <div role="alert" className="bg-error-container/30 border border-error/20 text-on-error-container text-sm font-semibold p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                {formError}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="studentForm"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Simpan Siswa</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const { canManageStudents } = useUserRole();
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');

  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats]       = useState<any>(EMPTY_STATS);
  const [branches, setBranches] = useState<any[]>([]);
  const [majors, setMajors]     = useState<any[]>([]);
  const [batches, setBatches]   = useState<any[]>([]);
  const [classes, setClasses]   = useState<any[]>([]);

  const [isLoading, setIsLoading]       = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading]   = useState(false);
  const [error, setError]               = useState('');
  const [formError, setFormError]       = useState('');

  const [filters, setFilters] = useState({
    branch_id: '', major_id: '', batch_id: '', gender: '', search: '',
  });

  const [pagination, setPagination] = useState({
    page: 1, limit: 10, total: 0, last_page: 1,
  });

  const [isAddModalOpen, setIsAddModalOpen]   = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [modalType, setModalType]             = useState<'view' | 'edit' | 'delete' | null>(null);
  const [formData, setFormData]               = useState({ ...EMPTY_FORM });
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [promoteFromId, setPromoteFromId] = useState('');
  const [promoteToId, setPromoteToId] = useState('');
  const [promoting, setPromoting] = useState(false);

  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFilters, setExportFilters] = useState({ branch_id: '', major_id: '', class_id: '', batch_id: '' });
  const [exportPreview, setExportPreview] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState(false);

  // ── Fetchers ─────────────────────────────────────────────────────────────────

  const fetchStats = async () => {
    try {
      setStats(await apiRequest('/stats/students'));
    } catch { /* non-critical */ }
  };

  const fetchMasterData = async () => {
    try {
      const [brRes, mRes, bRes, cRes] = await Promise.all([
        apiRequest('/branches'),
        apiRequest('/majors?limit=100'),
        apiRequest('/batches?limit=100'),
        apiRequest('/classes?limit=100'),
      ]);

      const branchList = brRes        || [];
      const majorList  = mRes.data    || [];
      const batchList  = bRes.data    || [];
      const classList  = cRes.data    || [];

      setBranches(branchList);
      setMajors(majorList);
      setBatches(batchList);
      setClasses(classList);

      setFormData(prev => ({
        ...prev,
        branch_id: branchList[0]?.id ?? '',
        major_id:  majorList[0]?.id  ?? '',
        batch_id:  batchList[0]?.id  ?? '',
      }));
    } catch { /* non-critical */ }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const query = buildQuery({
        page:      pagination.page.toString(),
        limit:     pagination.limit.toString(),
        branch_id: filters.branch_id,
        major_id:  filters.major_id,
        batch_id:  filters.batch_id,
        gender:    filters.gender,
        search:    filters.search,
      });

      const res = await apiRequest(`/students?${query}`);
      setStudents(res.data || []);
      setPagination(prev => ({ ...prev, total: res.meta.total, last_page: res.meta.last_page }));
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data siswa');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters.branch_id, filters.major_id, filters.batch_id, filters.gender, filters.search]);

  // Debounced fetch
  useEffect(() => {
    if (!getToken()) return;
    const timer = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timer);
  }, [filters, pagination.page]);

  // Init
  useEffect(() => {
    if (!getToken()) return;
    fetchMasterData();
    fetchStats();
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'branch_id' ? { major_id: '' } : {}),
    }));
  };

  const handleBranchChange = (branchId: string) => {
    const firstMajor = majors.find(m => m.branch_id === branchId);
    setFormData(prev => ({ ...prev, branch_id: branchId, major_id: firstMajor?.id ?? '', class_id: '' }));
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const payload: Record<string, any> = {
        nis:         formData.nis,
        nik:         formData.nik,
        full_name:   formData.full_name,
        gender:      formData.gender,
        birth_place: formData.birth_place,
        birth_date:  new Date(formData.birth_date).toISOString(),
        address:     formData.address,
        phone:       formData.phone,
        email:       formData.email,
        status:      formData.status || 'active',
      };

      const optionalFields = ['branch_id', 'major_id', 'batch_id', 'class_id', 'health_history', 'profile_picture'] as const;
      optionalFields.forEach(key => { if (formData[key]) payload[key] = formData[key]; });

      if (formData.latitude)  payload.latitude  = parseFloat(formData.latitude);
      if (formData.longitude) payload.longitude = parseFloat(formData.longitude);
      if (formData.parents?.father_name || formData.parents?.mother_name) {
        const { address, ...parentData } = formData.parents;
        payload.parents = address ? formData.parents : parentData;
      }

      await apiRequest('/students', { method: 'POST', body: JSON.stringify(payload) });

      setIsAddModalOpen(false);
      setFormData({ ...EMPTY_FORM });
      fetchStudents();
      fetchStats();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menambahkan siswa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('photo', file);
      const res = await apiRequest('/students/upload-photo', { method: 'POST', body: form });
      setFormData(prev => ({ ...prev, profile_picture: res.url }));
    } catch {
      setFormError('Gagal mengunggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExport = async () => {
    setIsExportModalOpen(true);
    loadExportPreview();
  };

  const loadExportPreview = async () => {
    setExportLoading(true);
    try {
      const data = await apiRequest('/students/export-preview', {
        method: 'POST',
        body: JSON.stringify(exportFilters),
      });
      setExportPreview(data);
    } catch { /* ignore */ }
    finally { setExportLoading(false); }
  };

  const handleExportDownload = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(exportFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const qs = params.toString();
      const url = `${getApiBase()}/api/v1/students/export${qs ? '?' + qs : ''}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error('Gagal mengekspor data');
      const blob = await res.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: dlUrl, download: `data_siswa_${new Date().toISOString().split('T')[0]}.xlsx` });
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dlUrl);
      setIsExportModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Gagal mengekspor data');
    }
  };

  const handleExportFilterChange = (key: string, value: string) => {
    setExportFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setIsImportModalOpen(true);
    e.target.value = '';
  };

  const handleImportDone = () => {
    fetchStudents();
    fetchStats();
    setError('');
  };

  const openModal  = (type: 'view' | 'edit' | 'delete', student: any) => { setSelectedStudent(student); setModalType(type); };
  const closeModal = () => setModalType(null);
  const afterMutation = () => { fetchStudents(); fetchStats(); };

  // ── Derived ──────────────────────────────────────────────────────────────────

  const filteredMajors = majors.filter(m => !filters.branch_id || m.branch_id === filters.branch_id);
  const formMajors     = majors.filter(m => m.branch_id === formData.branch_id);
  const formClasses    = classes.filter(c => c.major_id === formData.major_id && c.batch_id === formData.batch_id);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Manajemen Siswa</h2>
          <p className="text-on-surface-variant font-medium mt-1">Kelola data, status, dan informasi akademik siswa.</p>
        </div>

        {canManageStudents && (
          <div className="flex flex-wrap w-full sm:w-auto gap-3">
            <div className="flex w-full sm:w-auto gap-3">
              <label className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors active:scale-95 shadow-sm cursor-pointer whitespace-nowrap">
                <Upload className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Import Excel</span>
                <span className="sm:hidden">Import</span>
                <input type="file" className="hidden" accept=".xlsx,.csv" onChange={handleFileSelect} />
              </label>
              <button onClick={handleExport} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors active:scale-95 shadow-sm whitespace-nowrap">
                <Download className="w-4 h-4 flex-shrink-0" />
                <span>Export</span>
              </button>
            </div>
            <button onClick={() => { setPromoteFromId(''); setPromoteToId(''); setPromoteModalOpen(true); }} className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 text-primary text-sm font-bold hover:bg-primary/5 transition-colors active:scale-95 whitespace-nowrap">
              <ArrowUp className="w-4 h-4 flex-shrink-0" />
              <span>Naik Kelas</span>
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-primary/20 whitespace-nowrap">
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span>Tambah Siswa</span>
            </button>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard title="Total Siswa"  value={stats.total}  icon={<Users          className="w-5 h-5 sm:w-6 sm:h-6" />} color="primary"   />
        <StatCard title="Aktif"        value={stats.active} icon={<UserCheck      className="w-5 h-5 sm:w-6 sm:h-6" />} color="success"   />
        <StatCard title="Alumni"       value={stats.alumni} icon={<GraduationCap  className="w-5 h-5 sm:w-6 sm:h-6" />} color="secondary" />
        <StatCard title="Pindah"       value={stats.moved}  icon={<UserX          className="w-5 h-5 sm:w-6 sm:h-6" />} color="tertiary"  />
        <StatCard title="Laki-laki"    value={stats.male}   icon={<Users          className="w-5 h-5 sm:w-6 sm:h-6" />} color="primary"   />
        <StatCard title="Perempuan"    value={stats.female} icon={<Users          className="w-5 h-5 sm:w-6 sm:h-6" />} color="tertiary"  />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl w-fit">
        {(['list', 'stats'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-6 py-2 rounded-lg text-sm font-bold transition-all',
              activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {tab === 'list' ? 'Daftar Siswa' : 'Statistik Visual'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'list' ? (
        <ListTab
          students={students}
          isLoading={isLoading}
          error={error}
          filters={filters}
          filteredMajors={filteredMajors}
          branches={branches}
          pagination={pagination}
          canManageStudents={canManageStudents}
          onFilterChange={handleFilterChange}
          onPageChange={page => setPagination(prev => ({ ...prev, page }))}
          onOpenModal={openModal}
        />
      ) : (
        <StatsTab stats={stats} />
      )}

      {/* Modals */}
      <ViewStudentModal   isOpen={modalType === 'view'}   onClose={closeModal} student={selectedStudent} />
      <EditStudentModal   isOpen={modalType === 'edit'}   onClose={closeModal} student={selectedStudent} onSuccess={afterMutation} branches={branches} majors={majors} batches={batches} classes={classes} />
      <DeleteStudentModal isOpen={modalType === 'delete'} onClose={closeModal} student={selectedStudent} onSuccess={afterMutation} />

      {/* Add student modal */}
      {isAddModalOpen && (
        <AddStudentModal
          formData={formData}
          formError={formError}
          isSubmitting={isSubmitting}
          isUploading={isUploading}
          apiBase={getApiBase()}
          branches={branches}
          formMajors={formMajors}
          batches={batches}
          formClasses={formClasses}
          onFormChange={update => setFormData(prev => ({ ...prev, ...update }))}
          onParentsChange={update => setFormData(prev => ({ ...prev, parents: { ...prev.parents, ...update } }))}
          onBranchChange={handleBranchChange}
          onPhotoUpload={handlePhotoUpload}
          onSubmit={handleCreateStudent}
          onClose={() => { setIsAddModalOpen(false); setFormError(''); }}
        />
      )}

      <ImportPreviewModal
        isOpen={isImportModalOpen}
        onClose={() => { setIsImportModalOpen(false); setImportFile(null); }}
        onSuccess={handleImportDone}
        file={importFile}
        batches={batches}
      />

      {/* Export Dialog */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Export Data Siswa
              </h3>
              <button onClick={() => setIsExportModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Cabang</label>
                  <select className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    value={exportFilters.branch_id} onChange={e => { handleExportFilterChange('branch_id', e.target.value); setTimeout(loadExportPreview, 100); }}>
                    <option value="">Semua Cabang</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Jurusan</label>
                  <select className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    value={exportFilters.major_id} onChange={e => { handleExportFilterChange('major_id', e.target.value); setTimeout(loadExportPreview, 100); }}>
                    <option value="">Semua Jurusan</option>
                    {majors.filter(m => !exportFilters.branch_id || m.branch_id === exportFilters.branch_id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Kelas</label>
                  <select className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    value={exportFilters.class_id} onChange={e => { handleExportFilterChange('class_id', e.target.value); setTimeout(loadExportPreview, 100); }}>
                    <option value="">Semua Kelas</option>
                    {classes.filter(c => !exportFilters.major_id || c.major_id === exportFilters.major_id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Angkatan</label>
                  <select className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    value={exportFilters.batch_id} onChange={e => { handleExportFilterChange('batch_id', e.target.value); setTimeout(loadExportPreview, 100); }}>
                    <option value="">Semua Angkatan</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="border border-outline-variant rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">NIS</th>
                        <th className="text-left px-4 py-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Nama</th>
                        <th className="text-left px-4 py-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Cabang</th>
                        <th className="text-left px-4 py-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Kelas</th>
                        <th className="text-left px-4 py-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Jurusan</th>
                        <th className="text-left px-4 py-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exportLoading ? (
                        <tr><td colSpan={6} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></td></tr>
                      ) : exportPreview?.rows?.length > 0 ? (
                        exportPreview.rows.map((row: any, i: number) => (
                          <tr key={i} className="border-b border-outline-variant/30">
                            <td className="px-4 py-2 font-mono text-xs font-semibold">{row.nis}</td>
                            <td className="px-4 py-2 font-medium">{row.full_name}</td>
                            <td className="px-4 py-2 text-on-surface-variant">{row.branch}</td>
                            <td className="px-4 py-2 text-on-surface-variant">{row.class}</td>
                            <td className="px-4 py-2 text-on-surface-variant">{row.major}</td>
                            <td className="px-4 py-2"><span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-bold", row.status === 'active' ? "bg-success/10 text-success" : "bg-outline-variant/20 text-on-surface-variant")}>{row.status}</span></td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={6} className="text-center py-8 text-on-surface-variant font-medium">Tidak ada data</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {exportPreview && (
                <div className="bg-surface-container rounded-xl p-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-on-surface-variant">
                    Total: <span className="text-on-surface font-black">{exportPreview.total}</span> siswa
                    {exportPreview.total > exportPreview.preview_count && (
                      <span className="text-on-surface-variant"> (menampilkan {exportPreview.preview_count} pertama)</span>
                    )}
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3 bg-surface">
              <button onClick={() => setIsExportModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-outline text-on-surface font-bold text-sm hover:bg-surface-container transition-all">Batal</button>
              <button onClick={handleExportDownload} className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
                <Download className="w-5 h-5" /> Download Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {promoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-xl font-black text-on-surface tracking-tight">Naik Kelas Massal</h3>
              <button onClick={() => setPromoteModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!promoteFromId || !promoteToId) { alert('Pilih kelas asal dan tujuan'); return; }
              setPromoting(true);
              try {
                const res = await apiRequest('/students/bulk-promote', {
                  method: 'POST',
                  body: JSON.stringify({ from_class_id: promoteFromId, to_class_id: promoteToId })
                });
                alert(`Berhasil menaikkan ${res.promoted} siswa dari ${res.from} ke ${res.to}`);
                setPromoteModalOpen(false);
                fetchStudents();
              } catch (err: any) { alert('Gagal: ' + err.message); }
              finally { setPromoting(false); }
            }} className="p-8 space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Kelas Asal</label>
                <select required value={promoteFromId} onChange={e => setPromoteFromId(e.target.value)} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  <option value="">Pilih Kelas</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Kelas Tujuan</label>
                <select required value={promoteToId} onChange={e => setPromoteToId(e.target.value)} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  <option value="">Pilih Kelas</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs text-primary/80">
                <p className="font-bold mb-1">&#9888; Informasi</p>
                <p>Semua siswa dari kelas asal akan dipindahkan ke kelas tujuan. Data major, batch, dan branch akan mengikuti kelas baru. Pastikan kelas tujuan sudah sesuai dengan tingkat/angkatan yang tepat.</p>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setPromoteModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl border border-outline text-on-surface font-bold hover:bg-surface-container transition-all">Batal</button>
                <button type="submit" disabled={promoting} className="flex-[2] flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-on-primary font-black shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                  {promoting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />} Naikkan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}