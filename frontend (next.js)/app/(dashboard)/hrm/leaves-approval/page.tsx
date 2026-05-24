'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LeavesApprovalPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const query = filter !== 'all' ? `?status=${filter}&limit=50` : '?limit=50';
      const res = await apiRequest(`/leaves${query}`);
      setLeaves(res.data || []);
    } catch (err: any) {
      console.error('Gagal mengambil data cuti:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    setError('');
    setSuccess('');

    try {
      await apiRequest(`/leaves/${id}/${action}`, { method: 'PATCH' });
      setSuccess(action === 'approve' ? 'Cuti berhasil disetujui' : 'Cuti berhasil ditolak');
      fetchLeaves();
    } catch (err: any) {
      setError(err.message || 'Gagal memproses cuti');
    } finally {
      setProcessingId(null);
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
      <div className="anim-fade-in-down">
        <h2 className="text-3xl font-bold text-on-surface tracking-tight">Approval Cuti & Izin</h2>
        <p className="text-on-surface-variant font-medium mt-1">Kelola pengajuan cuti dari pegawai.</p>
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

      <div className="flex gap-3">
        {['pending', 'approved', 'rejected', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              filter === f
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            {f === 'all' ? 'Semua' : f === 'pending' ? 'Menunggu' : f === 'approved' ? 'Disetujui' : 'Ditolak'}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden anim-fade-in-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Pegawai</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Jenis</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Periode</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Alasan</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Status</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-on-surface-variant font-medium">
                    Tidak ada data cuti.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                          {leave.employee?.full_name?.charAt(0)}
                        </div>
                        <span className="font-bold text-on-surface">{leave.employee?.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className="font-semibold text-on-surface">{getTypeLabel(leave.type)}</span>
                    </td>
                    <td className="py-3 px-5 text-on-surface-variant font-medium">
                      {new Date(leave.start_date).toLocaleDateString('id-ID')} - {new Date(leave.end_date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 px-5 text-on-surface-variant max-w-[200px] truncate">{leave.reason}</td>
                    <td className="py-3 px-5">{getStatusBadge(leave.status)}</td>
                    <td className="py-3 px-5 text-right">
                      {leave.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleAction(leave.id, 'approve')}
                            disabled={processingId === leave.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success-container/30 text-success text-xs font-bold hover:bg-success-container/50 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                          <button
                            onClick={() => handleAction(leave.id, 'reject')}
                            disabled={processingId === leave.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-error-container/30 text-error text-xs font-bold hover:bg-error-container/50 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      )}
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
