'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { 
  Plus, 
  History, 
  Calendar, 
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  Award,
  TrendingUp,
  ArrowRightLeft,
  GraduationCap,
  Edit2,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmployeeHistoryPage() {
  const [histories, setHistories] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    type: 'promotion',
    description: '',
    date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [historyRes, employeeRes] = await Promise.all([
        apiRequest('/employee-history?limit=50'),
        apiRequest('/employees?limit=100'),
      ]);
      setHistories(historyRes.data || []);
      setEmployees(employeeRes.data || []);
    } catch (err: any) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!formData.employee_id || !formData.description || !formData.date) {
      setError('Semua field wajib diisi');
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        await apiRequest(`/employee-history/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            ...formData,
            date: `${formData.date}T00:00:00.000Z`,
          }),
        });
        setSuccess('Riwayat berhasil diperbarui');
      } else {
        await apiRequest('/employee-history', {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            date: `${formData.date}T00:00:00.000Z`,
          }),
        });
        setSuccess('Riwayat berhasil ditambahkan');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ employee_id: '', type: 'promotion', description: '', date: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan riwayat');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (history: any) => {
    setEditingId(history.id);
    setShowForm(true);
    setFormData({
      employee_id: history.employee_id,
      type: history.type,
      description: history.description,
      date: new Date(history.date).toISOString().split('T')[0],
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus riwayat ini?')) return;
    try {
      await apiRequest(`/employee-history/${id}`, { method: 'DELETE' });
      setSuccess('Riwayat berhasil dihapus');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus riwayat');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'promotion': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'education': return <GraduationCap className="w-4 h-4 text-primary" />;
      case 'mutation': return <ArrowRightLeft className="w-4 h-4 text-secondary" />;
      case 'achievement': return <Award className="w-4 h-4 text-warning" />;
      default: return <History className="w-4 h-4 text-outline" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'promotion': return 'Promosi';
      case 'education': return 'Pendidikan';
      case 'mutation': return 'Mutasi';
      case 'achievement': return 'Prestasi';
      default: return type;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="anim-fade-in-down">
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Riwayat Pegawai</h2>
          <p className="text-on-surface-variant font-medium mt-1">Rekam jejak karir dan pendidikan pegawai.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Tutup Form' : 'Tambah Riwayat'}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-error-container/30 border border-error/20 text-error">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success-container/30 border border-success/20 text-success">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {showForm && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm anim-fade-in-up">
          <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            {editingId ? 'Edit Riwayat Pegawai' : 'Form Riwayat Pegawai'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pegawai</label>
                <select 
                  className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  value={formData.employee_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                >
                  <option value="">Pilih Pegawai</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.full_name} - {emp.position}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Jenis</label>
                <select 
                  className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="promotion">Promosi</option>
                  <option value="education">Pendidikan</option>
                  <option value="mutation">Mutasi</option>
                  <option value="achievement">Prestasi</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tanggal</label>
                <input 
                  type="date"
                  className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Deskripsi</label>
              <textarea 
                className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-y"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detail riwayat..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-lg border border-outline text-on-surface-variant text-sm font-bold hover:bg-surface-container transition-all"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{editingId ? 'Perbarui Riwayat' : 'Simpan Riwayat'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden anim-fade-in-up anim-delay-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Pegawai</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Jenis</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Tanggal</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Deskripsi</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="border-b border-surface-container-low">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="py-3 px-5">
                        <div className={cn("skeleton h-5", j === 0 ? "w-48" : j === 4 ? "w-32" : "w-24")} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : histories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-on-surface-variant font-medium">
                    Belum ada riwayat pegawai.
                  </td>
                </tr>
              ) : (
                histories.map((history) => (
                  <tr key={history.id} className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20 group">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                          {history.employee?.full_name?.charAt(0)}
                        </div>
                        <span className="font-bold text-on-surface">{history.employee?.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2 font-semibold text-on-surface">
                        {getTypeIcon(history.type)}
                        {getTypeLabel(history.type)}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-on-surface-variant font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-outline" />
                        {new Date(history.date).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-on-surface-variant max-w-[300px] truncate">{history.description}</td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleEdit(history)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(history.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
