'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useUserRole } from '@/lib/useUserRole';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Award,
  Loader2,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MyAppraisalPage() {
  const { employeeId } = useUserRole();
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppraisals = async () => {
    if (!employeeId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiRequest(`/appraisals?employee_id=${employeeId}&limit=20`);
      setAppraisals(res.data || []);
    } catch (err: any) {
      console.error('Gagal mengambil data appraisal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppraisals();
  }, [employeeId]);

  const getRadarData = (appraisal: any) => {
    return [
      { subject: 'Kedisiplinan', score: parseFloat(appraisal.discipline_score) || 0 },
      { subject: 'Pedagogik', score: parseFloat(appraisal.pedagogic_score) || 0 },
      { subject: 'Profesionalisme', score: parseFloat(appraisal.professional_score) || 0 },
    ];
  };

  const getAverageScore = (appraisal: any) => {
    const d = parseFloat(appraisal.discipline_score) || 0;
    const p = parseFloat(appraisal.pedagogic_score) || 0;
    const pr = parseFloat(appraisal.professional_score) || 0;
    return ((d + p + pr) / 3).toFixed(1);
  };

  const getScoreCategory = (score: number) => {
    if (score >= 90) return { label: 'Sangat Baik', color: 'text-success' };
    if (score >= 75) return { label: 'Baik', color: 'text-primary' };
    if (score >= 60) return { label: 'Cukup', color: 'text-warning' };
    return { label: 'Perlu Peningkatan', color: 'text-error' };
  };

  return (
    <div className="space-y-8">
      <div className="anim-fade-in-down">
        <h2 className="text-3xl font-bold text-on-surface tracking-tight">Penilaian Kinerja (PKG)</h2>
        <p className="text-on-surface-variant font-medium mt-1">Laporan kinerja dan evaluasi Anda.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : !employeeId ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center anim-fade-in-up">
          <BookOpen className="w-12 h-12 text-error mx-auto mb-4" />
          <p className="text-error font-medium">Akun Anda tidak terhubung dengan data pegawai. Hubungi administrator.</p>
        </div>
      ) : appraisals.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center anim-fade-in-up">
          <BookOpen className="w-12 h-12 text-outline mx-auto mb-4" />
          <p className="text-on-surface-variant font-medium">Belum ada penilaian kinerja.</p>
        </div>
      ) : (
        appraisals.map((appraisal) => {
          const avgScore = parseFloat(getAverageScore(appraisal));
          const category = getScoreCategory(avgScore);

          return (
            <div key={appraisal.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm anim-fade-in-up">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-on-surface">Periode: {appraisal.period}</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70">Kedisiplinan</p>
                      <p className="text-2xl font-black text-primary">{appraisal.discipline_score}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-secondary/70">Pedagogik</p>
                      <p className="text-2xl font-black text-secondary">{appraisal.pedagogic_score}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-tertiary/10 border border-tertiary/20">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Profesionalisme</p>
                      <p className="text-2xl font-black text-tertiary">{appraisal.professional_score}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container border border-outline-variant">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className={cn("w-5 h-5", category.color)} />
                      <span className="font-bold text-on-surface">Rata-rata: {avgScore}</span>
                      <span className={cn("text-sm font-bold", category.color)}>({category.label})</span>
                    </div>
                    {appraisal.notes && (
                      <p className="text-sm text-on-surface-variant mt-2">
                        <span className="font-bold text-on-surface">Catatan:</span> {appraisal.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-full lg:w-[350px] h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getRadarData(appraisal)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'currentColor' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Skor" dataKey="score" stroke="#1e40af" fill="#3b82f6" fillOpacity={0.5} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
