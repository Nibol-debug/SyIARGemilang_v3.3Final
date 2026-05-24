'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { 
  Plus, 
  Package, 
  Calendar, 
  CheckCircle2, 
  Clock,
  Loader2,
  AlertCircle,
  X,
  ArrowRightLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AssetLoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    asset_id: '',
    employee_id: '',
    expected_return_date: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [returningId, setReturningId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [loanRes, assetRes, employeeRes] = await Promise.all([
        apiRequest('/asset-loans?limit=50'),
        apiRequest('/assets?limit=100'),
        apiRequest('/employees?limit=100'),
      ]);
      setLoans(loanRes.data || []);
      setAssets(assetRes.data || []);
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

    if (!formData.asset_id || !formData.employee_id) {
      setError('Aset dan pegawai wajib dipilih');
      setIsSubmitting(false);
      return;
    }

    try {
      await apiRequest('/asset-loans', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setSuccess('Peminjaman berhasil dicatat');
      setShowForm(false);
      setFormData({ asset_id: '', employee_id: '', expected_return_date: '', notes: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Gagal mencatat peminjaman');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async (id: string) => {
    setReturningId(id);
    try {
      await apiRequest(`/asset-loans/${id}/return`, {
        method: 'PATCH',
        body: JSON.stringify({ condition: 'good' }),
      });
      setSuccess('Aset berhasil dikembalikan');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Gagal mengembalikan aset');
    } finally {
      setReturningId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'returned':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success-container/30 text-success">Dikembalikan</span>;
      case 'overdue':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-error-container/30 text-error">Terlambat</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-warning-container/30 text-warning">Dipinjam</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Peminjaman Aset</h2>
          <p className="text-on-surface-variant font-medium mt-1">Kelola peminjaman dan pengembalian alat kerja.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Tutup Form' : 'Catat Peminjaman'}</span>
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
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            Form Peminjaman Aset
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Aset</label>
                <select 
                  className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  value={formData.asset_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, asset_id: e.target.value }))}
                >
                  <option value="">Pilih Aset</option>
                  {assets.filter((a) => a.status === 'available').map((asset) => (
                    <option key={asset.id} value={asset.id}>{asset.code} - {asset.name}</option>
                  ))}
                </select>
              </div>
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
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tenggat Pengembalian</label>
                <input 
                  type="date"
                  className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.expected_return_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expected_return_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Catatan</label>
              <textarea 
                className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-y"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan tambahan..."
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
                <span>Catat Peminjaman</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Aset</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Peminjam</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Tanggal Pinjam</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Tenggat</th>
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
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-on-surface-variant font-medium">
                    Belum ada data peminjaman.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan.id} className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-on-surface block">{loan.asset?.name}</span>
                          <span className="text-[10px] text-on-surface-variant font-bold">{loan.asset?.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 font-medium text-on-surface">{loan.employee?.full_name}</td>
                    <td className="py-3 px-5 text-on-surface-variant font-medium">
                      {new Date(loan.loan_date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 px-5 text-on-surface-variant font-medium">
                      {loan.expected_return_date ? new Date(loan.expected_return_date).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="py-3 px-5">{getStatusBadge(loan.status)}</td>
                    <td className="py-3 px-5 text-right">
                      {loan.status === 'borrowed' && (
                        <button
                          onClick={() => handleReturn(loan.id)}
                          disabled={returningId === loan.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success-container/30 text-success text-xs font-bold hover:bg-success-container/50 transition-colors disabled:opacity-50 ml-auto"
                        >
                          {returningId === loan.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>Kembalikan</span>
                        </button>
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
