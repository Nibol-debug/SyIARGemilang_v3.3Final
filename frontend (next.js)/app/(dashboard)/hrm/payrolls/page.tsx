'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock,
  Loader2,
  AlertCircle,
  X,
  Zap,
  ChevronDown,
  ChevronRight,
  Settings,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function PayrollsPage() {
  const router = useRouter();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [salaryModal, setSalaryModal] = useState<{ open: boolean; employeeId: string; employeeName: string; config: any }>({ open: false, employeeId: '', employeeName: '', config: null });
  const [savingSalary, setSavingSalary] = useState(false);

  const fetchPayrolls = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest(`/payrolls?month=${month}&year=${year}&limit=100`);
      setPayrolls(res.data || []);
    } catch (err: any) {
      console.error('Gagal mengambil data payroll:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [month, year]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      await apiRequest(`/payrolls/generate?month=${month}&year=${year}`, { method: 'POST' });
      setSuccess('Payroll berhasil digenerate');
      fetchPayrolls();
    } catch (err: any) {
      setError(err.message || 'Gagal generate payroll');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePay = async (id: string) => {
    try {
      await apiRequest(`/payrolls/${id}/pay`, { method: 'PATCH' });
      setSuccess('Status pembayaran berhasil diubah');
      fetchPayrolls();
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah status');
    }
  };

  const parseConfig = (raw: any) => {
    const out: any = {};
    const fields = ['basic_salary','tunj_masakerja','tunj_jabatan','tunj_fungsional','tunj_keluarga','tunj_beras','tunj_transport','tunj_lainnya','pot_alpha'];
    for (const f of fields) {
      const v = raw?.[f];
      out[f] = typeof v === 'string' ? parseFloat(v) : (typeof v === 'number' ? v : 0);
    }
    return out;
  };

  const openSalaryModal = async (payroll: any) => {
    const empId = payroll.employee?.id;
    if (!empId) return;
    try {
      const config = await apiRequest(`/employees/${empId}/salary`);
      setSalaryModal({ open: true, employeeId: empId, employeeName: payroll.employee?.full_name || '', config: parseConfig(config) });
    } catch (err: any) {
      setError(err.message || 'Gagal memuat konfigurasi gaji');
    }
  };

  const closeSalaryModal = () => {
    setSalaryModal({ open: false, employeeId: '', employeeName: '', config: null });
  };

  const handleSaveSalary = async () => {
    if (!salaryModal.employeeId || !salaryModal.config) return;
    setSavingSalary(true);
    try {
      await apiRequest(`/employees/${salaryModal.employeeId}/salary`, {
        method: 'PUT',
        body: JSON.stringify(salaryModal.config),
      });
      setSuccess('Konfigurasi gaji berhasil disimpan');
      closeSalaryModal();
      fetchPayrolls();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan konfigurasi gaji');
    } finally {
      setSavingSalary(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const getMonthName = (m: number) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[m - 1] || '';
  };

  return (
    <>
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 anim-fade-in-up">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Manajemen Payroll</h2>
          <p className="text-on-surface-variant font-medium mt-1">Kelola penggajian pegawai.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-error-container/30 border border-error/20 text-error anim-slide-in-right">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError('')} className="ml-auto hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success-container/30 border border-success/20 text-success anim-slide-in-right">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="anim-fade-in-up anim-delay-100 card-hover bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Bulan</label>
            <select 
              className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][i]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tahun</label>
            <select 
              className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 active:scale-95 shadow-md"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>Auto-Generate Payroll</span>
          </button>
        </div>
      </div>

      <div className="anim-fade-in-up anim-delay-200 card-hover bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Pegawai</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Gaji Pokok</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Tunjangan</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Potongan</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Gaji Bersih</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Status</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="border-b border-surface-container-low">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-3 px-5">
                        <div className={cn("skeleton h-5", j === 0 ? "w-48" : j === 6 ? "w-32" : "w-24")} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-on-surface-variant font-medium">
                    Belum ada data payroll untuk periode ini. Klik "Auto-Generate Payroll" untuk membuat data.
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll, index) => {
                  const sc = payroll.employee?.salary_config;
                  const isExpanded = expandedRows.has(payroll.id);
                  const toggleRow = () => {
                    const next = new Set(expandedRows);
                    isExpanded ? next.delete(payroll.id) : next.add(payroll.id);
                    setExpandedRows(next);
                  };
                  return (
                    <React.Fragment key={payroll.id}>
                      <tr className="border-b border-surface-container-low hover:bg-surface-container/40 hover:scale-[1.002] transition-all even:bg-surface-container/20 cursor-pointer anim-fade-in-up" style={{ animationDelay: `${index * 50}ms` }} onClick={() => router.push(`/hrm/payrolls/${payroll.id}`)}>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <button onClick={(e) => { e.stopPropagation(); toggleRow(); }} className="p-1 text-outline-variant hover:text-on-surface transition-colors">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                              {payroll.employee?.full_name?.charAt(0)}
                            </div>
                            <span className="font-bold text-on-surface">{payroll.employee?.full_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-on-surface font-medium">{formatCurrency(payroll.basic_salary)}</td>
                        <td className="py-3 px-5 text-success font-medium">+{formatCurrency(payroll.allowances)}</td>
                        <td className="py-3 px-5 text-error font-medium">-{formatCurrency(payroll.deductions)}</td>
                        <td className="py-3 px-5">
                          <span className="font-black text-on-surface text-base">{formatCurrency(payroll.net_salary)}</span>
                        </td>
                        <td className="py-3 px-5">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            payroll.status === 'paid'
                              ? "bg-success-container/30 text-success"
                              : "bg-warning-container/30 text-warning"
                          )}>
                            {payroll.status === 'paid' ? 'Dibayar' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); openSalaryModal(payroll); }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 hover:scale-105 transition-all active:scale-95"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <span>Set Gaji</span>
                            </button>
                            {payroll.status === 'pending' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePay(payroll.id); }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success-container/30 text-success text-xs font-bold hover:bg-success-container/50 hover:scale-105 transition-all active:scale-95"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Tandai Dibayar</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && sc && (
                        <tr className="bg-surface-container-low/50">
                          <td colSpan={7} className="px-8 py-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 anim-fade-in-up">
                              <BreakdownItem label="Gaji Pokok" value={sc.basic_salary} />
                              <BreakdownItem label="Tunj. Masa Kerja" value={sc.tunj_masakerja} />
                              <BreakdownItem label="Tunj. Jabatan" value={sc.tunj_jabatan} />
                              <BreakdownItem label="Tunj. Fungsional" value={sc.tunj_fungsional} />
                              <BreakdownItem label="Tunj. Keluarga" value={sc.tunj_keluarga} />
                              <BreakdownItem label="Tunj. Beras" value={sc.tunj_beras} />
                              <BreakdownItem label="Tunj. Transport" value={sc.tunj_transport} />
                              <BreakdownItem label="Tunj. Lainnya" value={sc.tunj_lainnya} />
                              <BreakdownItem label="Potongan per Alpha" value={sc.pot_alpha} highlight />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {salaryModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 anim-fade-in" onClick={closeSalaryModal}>
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden anim-scale-in" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Set Gaji: {salaryModal.employeeName}
              </h3>
              <button onClick={closeSalaryModal} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors hover:scale-105 active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              {salaryModal.config && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'basic_salary', label: 'Gaji Pokok', placeholder: 'Rp 3.000.000' },
                    { key: 'tunj_masakerja', label: 'Tunj. Masa Kerja', placeholder: 'Rp 0' },
                    { key: 'tunj_jabatan', label: 'Tunj. Jabatan', placeholder: 'Rp 0' },
                    { key: 'tunj_fungsional', label: 'Tunj. Fungsional', placeholder: 'Rp 0' },
                    { key: 'tunj_keluarga', label: 'Tunj. Keluarga', placeholder: 'Rp 0' },
                    { key: 'tunj_beras', label: 'Tunj. Beras', placeholder: 'Rp 0' },
                    { key: 'tunj_transport', label: 'Tunj. Transport', placeholder: 'Rp 0' },
                    { key: 'tunj_lainnya', label: 'Tunj. Lainnya', placeholder: 'Rp 0' },
                  ].map(field => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{field.label}</label>
                      <input type="number" placeholder={field.placeholder} value={salaryModal.config?.[field.key] ?? ''} onChange={e => setSalaryModal(prev => ({ ...prev, config: { ...prev.config, [field.key]: e.target.value ? Number(e.target.value) : 0 } }))} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                  ))}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Potongan per Alpha</label>
                    <input type="number" placeholder="Rp 50.000" value={salaryModal.config?.pot_alpha ?? ''} onChange={e => setSalaryModal(prev => ({ ...prev, config: { ...prev.config, pot_alpha: e.target.value ? Number(e.target.value) : 0 } }))} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 sm:w-1/2" />
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
              <button onClick={closeSalaryModal} className="px-6 py-2.5 rounded-xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container hover:border-primary/30 transition-all">Batal</button>
              <button onClick={handleSaveSalary} disabled={savingSalary} className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:brightness-110 hover:shadow-xl hover:shadow-primary/30 transition-all shadow-lg shadow-primary/20 active:scale-95">
                {savingSalary ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BreakdownItem({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  const fmt = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };
  return (
    <div className={`p-3 rounded-xl border ${highlight ? 'bg-error/5 border-error/20' : 'bg-surface border-outline-variant/50'}`}>
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-black mt-0.5 ${highlight ? 'text-error' : 'text-on-surface'}`}>{fmt(value || 0)}</p>
    </div>
  );
}
