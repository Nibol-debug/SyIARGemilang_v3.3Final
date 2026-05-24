'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, BookOpen, Calendar, FileText, ScrollText } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-emerald-500', B: 'bg-blue-500', C: 'bg-amber-500',
  D: 'bg-orange-500', E: 'bg-red-500',
};

export default function AcademicReportPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest('/reports/academic')
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const StatCard = ({ label, value, icon: Icon }: any) => (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><Icon className="w-4 h-4" /></div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-2xl font-black text-on-surface">{value}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/reports" className="p-2 rounded-lg hover:bg-surface-container transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Laporan Akademik</h2>
          <p className="text-sm text-on-surface-variant">Statistik mata pelajaran, jadwal, ujian & distribusi nilai.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : data ? (
        <div className="space-y-8">
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Mata Pelajaran" value={data.total_subjects} icon={BookOpen} />
            <StatCard label="Jadwal" value={data.total_schedules} icon={Calendar} />
            <StatCard label="Jurnal Mengajar" value={data.total_teaching_logs} icon={FileText} />
            <StatCard label="Ujian" value={data.total_exams} icon={ScrollText} />
          </div>

          {data.grade_distribution && Object.keys(data.grade_distribution).length > 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-on-surface mb-6">Distribusi Nilai</h3>
              <div className="space-y-4">
                {Object.entries(data.grade_distribution)
                  .sort(([a]: any, [b]: any) => a.localeCompare(b))
                  .map(([letter, count]: any) => {
                    const maxCount = Math.max(...Object.values(data.grade_distribution) as number[]);
                    const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                      <div key={letter} className="flex items-center gap-4">
                        <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs", GRADE_COLORS[letter] || 'bg-gray-500')}>
                          {letter}
                        </span>
                        <div className="flex-1 h-4 bg-surface-container-high rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-1000", GRADE_COLORS[letter] || 'bg-gray-500')} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-bold text-on-surface w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
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
