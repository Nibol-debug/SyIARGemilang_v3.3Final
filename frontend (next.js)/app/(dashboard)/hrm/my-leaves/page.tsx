'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useUserRole } from '@/lib/useUserRole';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  FileText,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MyLeavesPage() {
  const { employeeId } = useUserRole();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'sick',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLeaves = async () => {
    if (!employeeId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiRequest(`/leaves?employee_id=${employeeId}&limit=50`);
      setLeaves(res.data || []);
    } catch (err: any) {
      console.error('Gagal mengambil data cuti:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!formData.start_date || !formData.end_date || !formData.reason) {
      setError('Semua field wajib diisi');
      setIsSubmitting(false);
      return;
    }

    try {
      await apiRequest('/leaves', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          employee_id: employeeId,
          start_date: `${formData.start_date}T00:00:00.000Z`,
          end_date: `${formData.end_date}T23:59:59.999Z`,
        }),
      });
      setSuccess('Pengajuan cuti berhasil dikirim');
      setShowForm(false);
      setFormData({ type: 'sick', start_date: '', end_date: '', reason: '' });
      fetchLeaves();
    } catch (err: any) {
      setError(err.message || 'Gagal mengajukan cuti');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success-container/30 text-success">Disetujui</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-error-container/30 text-error">Ditolak</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-warning-container/30 text-warning">Menunggu</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sick': return 'Sakit';
      case 'annual_leave': return 'Cuti Tahunan';
      case 'emergency': return 'Darurat';
      case 'maternity': return 'Cuti Melahirkan';
      default: return type;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="anim-fade-in-down">
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Pengajuan Cuti & Izin</h2>
          <p className="text-on-surface-variant font-medium mt-1">Ajukan dan lacak status cuti Anda.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Tutup Form' : 'Ajukan Cuti'}</span>
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
            <FileText className="w-5 h-5 text-primary" />
            Form Pengajuan Cuti
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Jenis Cuti</label>
                <select 
                  className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="sick">Sakit</option>
                  <option value="annual_leave">Cuti Tahunan</option>
                  <option value="emergency">Darurat</option>
                  <option value="maternity">Cuti Melahirkan</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tanggal Mulai</label>
                <input 
                  type="date"
                  className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tanggal Selesai</label>
                <input 
                  type="date"
                  className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Alasan</label>
              <textarea 
                className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-y"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Jelaskan alasan pengajuan cuti..."
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
                <span>Ajukan Cuti</span>
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
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Jenis</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Periode</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Alasan</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Status</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Tanggal Pengajuan</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="border-b border-surface-container-low">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="py-3 px-5">
                        <div className={cn("skeleton h-5", j === 0 ? "w-28" : j === 4 ? "w-32" : "w-24")} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !employeeId ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-error font-medium">
                    Akun Anda tidak terhubung dengan data pegawai. Hubungi administrator.
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-on-surface-variant font-medium">
                    Belum ada pengajuan cuti.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20">
                    <td className="py-3 px-5">
                      <span className="font-semibold text-on-surface">{getTypeLabel(leave.type)}</span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                        <Calendar className="w-3.5 h-3.5 text-outline" />
                        {new Date(leave.start_date).toLocaleDateString('id-ID')} - {new Date(leave.end_date).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-on-surface-variant max-w-[200px] truncate">{leave.reason}</td>
                    <td className="py-3 px-5">{getStatusBadge(leave.status)}</td>
                    <td className="py-3 px-5 text-on-surface-variant font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-outline" />
                        {new Date(leave.created_at).toLocaleDateString('id-ID')}
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
