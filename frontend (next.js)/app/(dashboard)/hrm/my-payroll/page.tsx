'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useUserRole } from '@/lib/useUserRole';
import { 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock,
  Loader2,
  Download,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function MyPayrollPage() {
  const router = useRouter();
  const { employeeId } = useUserRole();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchPayrolls = async () => {
    if (!employeeId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiRequest(`/payrolls?employee_id=${employeeId}&limit=50`);
      setPayrolls(res.data || []);
    } catch (err: any) {
      console.error('Gagal mengambil data payroll:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [employeeId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[month - 1] || '';
  };

  return (
    <div className="space-y-8">
      <div className="anim-fade-in-down">
        <h2 className="text-3xl font-bold text-on-surface tracking-tight">Slip Gaji Digital</h2>
        <p className="text-on-surface-variant font-medium mt-1">Histori dan detail gaji Anda.</p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden anim-fade-in-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Periode</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Gaji Pokok</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Tunjangan</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Potongan</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Gaji Bersih</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : !employeeId ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-error font-medium">
                    Akun Anda tidak terhubung dengan data pegawai. Hubungi administrator.
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-on-surface-variant font-medium">
                    Belum ada data gaji.
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll) => {
                  const sc = payroll.employee?.salary_config;
                  const isExpanded = expandedRows.has(payroll.id);
                  const toggleRow = () => {
                    const next = new Set(expandedRows);
                    isExpanded ? next.delete(payroll.id) : next.add(payroll.id);
                    setExpandedRows(next);
                  };
                  return (
                    <React.Fragment key={payroll.id}>
                      <tr className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20 cursor-pointer" onClick={() => router.push(`/hrm/my-payroll/${payroll.id}`)}>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2 font-bold text-on-surface">
                            <button onClick={(e) => { e.stopPropagation(); toggleRow(); }} className="p-1 text-outline-variant hover:text-on-surface transition-colors -ml-1">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <Calendar className="w-4 h-4 text-outline" />
                            {getMonthName(payroll.month)} {payroll.year}
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
                      </tr>
                      {isExpanded && sc && (
                        <tr className="bg-surface-container-low/50">
                          <td colSpan={6} className="px-5 py-3">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="p-3 rounded-xl border bg-surface border-outline-variant/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Gaji Pokok</p>
                                <p className="text-sm font-black mt-0.5 text-on-surface">{formatCurrency(sc.basic_salary)}</p>
                              </div>
                              <div className="p-3 rounded-xl border bg-surface border-outline-variant/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tunj. Masa Kerja</p>
                                <p className="text-sm font-black mt-0.5 text-on-surface">{formatCurrency(sc.tunj_masakerja)}</p>
                              </div>
                              <div className="p-3 rounded-xl border bg-surface border-outline-variant/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tunj. Jabatan</p>
                                <p className="text-sm font-black mt-0.5 text-on-surface">{formatCurrency(sc.tunj_jabatan)}</p>
                              </div>
                              <div className="p-3 rounded-xl border bg-surface border-outline-variant/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tunj. Fungsional</p>
                                <p className="text-sm font-black mt-0.5 text-on-surface">{formatCurrency(sc.tunj_fungsional)}</p>
                              </div>
                              <div className="p-3 rounded-xl border bg-surface border-outline-variant/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tunj. Keluarga</p>
                                <p className="text-sm font-black mt-0.5 text-on-surface">{formatCurrency(sc.tunj_keluarga)}</p>
                              </div>
                              <div className="p-3 rounded-xl border bg-surface border-outline-variant/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tunj. Beras</p>
                                <p className="text-sm font-black mt-0.5 text-on-surface">{formatCurrency(sc.tunj_beras)}</p>
                              </div>
                              <div className="p-3 rounded-xl border bg-surface border-outline-variant/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tunj. Transport</p>
                                <p className="text-sm font-black mt-0.5 text-on-surface">{formatCurrency(sc.tunj_transport)}</p>
                              </div>
                              <div className="p-3 rounded-xl border bg-surface border-outline-variant/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tunj. Lainnya</p>
                                <p className="text-sm font-black mt-0.5 text-on-surface">{formatCurrency(sc.tunj_lainnya)}</p>
                              </div>
                              <div className="p-3 rounded-xl border bg-error/5 border-error/20">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Potongan per Alpha</p>
                                <p className="text-sm font-black mt-0.5 text-error">{formatCurrency(sc.pot_alpha)}</p>
                              </div>
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
  );
}
