'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import {
  Download,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Loader2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function StudentGradingView({ user }: { user: any }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(1);

  useEffect(() => {
    const fetchStudentGrades = async () => {
      if (!user?.studentId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await apiRequest(`/grades/parent/${user.studentId}`);
        setData(response);
      } catch (err) {
        console.error('Failed to fetch grades:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudentGrades();
  }, [user]);

  const downloadReportCard = async () => {
    if (!user?.studentId) return;
    setIsDownloading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${apiUrl}/report-cards/student/${user.studentId}/semester/${selectedSemester}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Gagal mengunduh rapor, pastikan rapor sudah difinalisasi oleh wali kelas.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rapor_${data?.student?.full_name}_Semester_${selectedSemester}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const getGradeBadge = (grade: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-success/10 text-success',
      'B': 'bg-primary/10 text-primary',
      'C': 'bg-warning/10 text-warning',
      'D': 'bg-orange-500/10 text-orange-500',
      'E': 'bg-error/10 text-error'
    };
    return colors[grade] || 'bg-surface-container-high text-on-surface-variant';
  };

  if (!user?.studentId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-warning mb-4" />
        <h3 className="text-2xl font-bold text-on-surface mb-2">Akses Terbatas</h3>
        <p className="text-on-surface-variant max-w-[28rem]">
          Akun Anda belum terhubung dengan data Siswa. Silakan hubungi Administrator sekolah untuk melakukan sinkronisasi data akun Anda.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-on-surface-variant font-medium">Memuat data nilai akademik...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-10 h-10 text-error mb-4" />
        <p className="text-on-surface-variant font-medium">Gagal memuat data nilai.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-on-surface tracking-tight">Portal Nilai Akademik</h2>
          <p className="text-on-surface-variant font-medium mt-2 max-w-2xl leading-relaxed">
            Pantau perkembangan nilai siswa, evaluasi pembelajaran, dan unduh Sertifikat Hasil Belajar (SHB) digital.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-lowest p-2 rounded-xl shadow-sm border border-outline-variant">
          <select 
            value={selectedSemester} 
            onChange={e => setSelectedSemester(Number(e.target.value))}
            className="px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value={1}>Semester 1</option>
            <option value={2}>Semester 2</option>
          </select>
          <button
            onClick={downloadReportCard}
            disabled={isDownloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Unduh Rapor</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Mata Pelajaran" 
          value={data.summary.total_subjects.toString()} 
          icon={BookOpen} 
          color="primary" 
        />
        <StatCard 
          label="Siswa Lulus" 
          value={data.summary.passed_subjects.toString()} 
          icon={CheckCircle2} 
          color="success" 
          trend={`${data.summary.pass_percentage}% Tuntas`}
        />
        <StatCard 
          label="Rata-rata Nilai" 
          value={data.summary.average_score.toFixed(1)} 
          icon={TrendingUp} 
          color="secondary" 
        />
        <StatCard 
          label="Perlu Remedial" 
          value={(data.summary.total_subjects - data.summary.passed_subjects).toString()} 
          icon={AlertCircle} 
          color={(data.summary.total_subjects - data.summary.passed_subjects) > 0 ? "error" : "surface"} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Grades Table */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
               <h3 className="text-xl font-bold text-on-surface">Capaian Akademik</h3>
               <span className="text-xs font-bold px-3 py-1 bg-surface-container rounded-full text-on-surface-variant">
                 Semester {selectedSemester}
               </span>
            </div>
            
            <div className="divide-y divide-outline-variant/30">
              {data.all_grades.filter((g: any) => g.semester === selectedSemester).length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">
                  <p>Belum ada data nilai final untuk semester ini.</p>
                </div>
              ) : (
                data.all_grades.filter((g: any) => g.semester === selectedSemester).map((grade: any, i: number) => (
                  <div key={i} className="p-6 hover:bg-surface-container/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-on-surface text-lg">{grade.subject_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                            grade.is_passed ? "bg-success/10 text-success" : "bg-error/10 text-error"
                          )}>
                            {grade.is_passed ? 'Tuntas' : 'Remedial'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn("px-4 py-1.5 rounded-lg text-sm font-bold", getGradeBadge(grade.grade_letter))}>
                          Grade {grade.grade_letter}
                        </span>
                        <span className={cn(
                          "text-3xl font-black font-mono",
                          grade.is_passed ? "text-success" : "text-primary"
                        )}>
                          {grade.final_score}
                        </span>
                      </div>
                    </div>
                    {grade.description && (
                      <div className="mt-3 p-3 bg-surface rounded-xl border border-outline-variant/30 text-sm text-on-surface-variant leading-relaxed italic">
                        "{grade.description}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Trend Chart */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-on-surface mb-6">Grafik Perkembangan</h3>
            <div className="h-[250px]">
              {data.chart_data?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chart_data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="semester" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="average" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-on-surface-variant">
                  Data grafik belum tersedia.
                </div>
              )}
            </div>
          </div>

          {/* Identitas Siswa */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-4">Profil Akademik</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Nama Lengkap</p>
                <p className="font-semibold text-on-surface">{data.student.full_name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">NIS</p>
                <p className="font-semibold text-on-surface">{data.student.nis}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Kelas</p>
                  <p className="font-semibold text-on-surface">{data.student.class_name || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Jurusan</p>
                  <p className="font-semibold text-on-surface">{data.student.major_name || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, trend }: any) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-2.5 rounded-full",
          color === 'success' ? 'bg-success/10 text-success' :
          color === 'error' ? 'bg-error/10 text-error' :
          color === 'secondary' ? 'bg-secondary/10 text-secondary' :
          color === 'surface' ? 'bg-surface-container text-outline' :
          'bg-primary/10 text-primary'
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-full border shadow-sm bg-on-secondary-container/10 text-on-secondary-container border-on-secondary-container/10">
            {trend}
          </span>
        )}
      </div>
      <p className="text-[11px] font-bold text-outline uppercase tracking-[0.1em] mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-on-surface tracking-tight">{value}</h3>
    </div>
  );
}
