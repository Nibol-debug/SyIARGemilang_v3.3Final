'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Loader2, DollarSign, TrendingUp, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';

export default function FinanceReportPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiRequest(`/reports/finance?month=${month}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [month]);

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-4 h-4", color)} />
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</p>
      </div>
      <p className={cn("text-2xl font-black", color)}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/reports" className="p-2 rounded-lg hover:bg-surface-container transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Laporan Keuangan</h2>
          <p className="text-sm text-on-surface-variant">Rekapitulasi pemasukan dan status pembayaran.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2">
          <Calendar className="w-4 h-4 text-primary" />
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="bg-transparent border-none outline-none font-bold text-sm" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : data ? (
        <div className="space-y-8">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-4">Total Pemasukan</h3>
            <p className="text-4xl font-black text-primary">{formatCurrency(data.total_revenue)}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Sukses" value={data.successful} icon={TrendingUp} color="text-emerald-600" />
            <StatCard label="Pending" value={data.pending} icon={Clock} color="text-amber-600" />
            <StatCard label="Gagal" value={data.failed} icon={XCircle} color="text-red-600" />
          </div>
          {data.by_method && Object.keys(data.by_method).length > 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-on-surface mb-4">Per Metode Pembayaran</h3>
              <div className="space-y-3">
                {Object.entries(data.by_method).map(([method, amount]: any) => (
                  <div key={method} className="flex justify-between items-center p-3 border-b border-outline-variant/30 last:border-0">
                    <span className="font-semibold capitalize">{method}</span>
                    <span className="font-bold text-primary">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-on-surface-variant py-10">Gagal memuat data.</p>
      )}
    </div>
  );
}
