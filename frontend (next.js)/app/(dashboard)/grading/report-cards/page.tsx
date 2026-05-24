'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import {
  ArrowLeft,
  FileText,
  Download,
  Search,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  BookOpen,
  ChevronRight,
  FileCheck,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/lib/useUserRole';

interface ReportCardData {
  student: {
    id: string;
    nis: string;
    full_name: string;
    class_name: string;
    major_name: string;
    batch_name: string;
    address: string;
  };
  parents: {
    father_name: string;
    mother_name: string;
    phone: string;
  } | null;
  semester: number;
  grades: {
    subject_name: string;
    final_score: number;
    grade_letter: string;
    is_passed: boolean;
    description: string;
    competencies_achieved: string;
  }[];
  attendance: {
    by_subject: Record<string, { present: number; total: number }>;
    total_present: number;
    total_meetings: number;
  };
  generated_at: string;
}

interface ClassReportCard {
  student_id: string;
  nis: string;
  full_name: string;
  has_report_card: boolean;
  subject_count: number;
}

export default function ReportCardsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [classReportCards, setClassReportCards] = useState<ClassReportCard[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [reportCardData, setReportCardData] = useState<ReportCardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeResult, setFinalizeResult] = useState<any>(null);
  const { canManageGrades } = useUserRole();

  const filteredCards = useMemo(() => {
    if (!searchQuery) return classReportCards;
    const q = searchQuery.toLowerCase();
    return classReportCards.filter(s =>
      s.full_name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q)
    );
  }, [classReportCards, searchQuery]);

  const fetchClassesAndStudents = async () => {
    try {
      const [classesRes, studentsRes] = await Promise.all([
        apiRequest('/classes'),
        apiRequest('/students?limit=100')
      ]);
      setClasses(classesRes.data || []);
      setStudents(studentsRes.data || []);
      if (classesRes.data?.length > 0) setSelectedClass(classesRes.data[0].id);
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    }
  };

  const fetchClassReportCards = async () => {
    if (!selectedClass) return;
    setIsLoading(true);
    try {
      const res = await apiRequest(`/report-cards/class/${selectedClass}/semester/${selectedSemester}`);
      setClassReportCards(res);
    } catch (err) {
      console.error('Gagal mengambil data rapor:', err);
      setClassReportCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeAll = async () => {
    if (!selectedClass) return;
    setIsFinalizing(true);
    setFinalizeResult(null);
    try {
      const res = await apiRequest('/grades/finalize-all-class', {
        method: 'POST',
        body: JSON.stringify({ class_id: selectedClass, semester: selectedSemester }),
      });
      setFinalizeResult(res);
      // Refresh the report card list after finalizing
      await fetchClassReportCards();
    } catch (err: any) {
      setFinalizeResult({ message: 'Gagal: ' + err.message, finalized_count: 0, error_count: 1 });
    } finally {
      setIsFinalizing(false);
      setShowFinalizeModal(false);
    }
  };

  const fetchReportCardPreview = async (studentId: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest(`/report-cards/student/${studentId}/semester/${selectedSemester}`);
      setReportCardData(res);
      setIsPreviewOpen(true);
    } catch (err: any) {
      alert('Gagal memuat preview rapor: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReportCard = async (studentId: string) => {
    setIsDownloading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${apiUrl}/report-cards/student/${studentId}/semester/${selectedSemester}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Gagal mengunduh rapor');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const student = classReportCards.find(s => s.student_id === studentId);
      const studentName = student?.full_name?.replace(/\s+/g, '_') || studentId;
      a.download = `Rapor_${studentName}_Semester_${selectedSemester}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Gagal mengunduh: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (canManageGrades) fetchClassesAndStudents();
  }, [canManageGrades]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassReportCards();
    }
  }, [selectedClass, selectedSemester]);

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

  if (canManageGrades === false) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-16 h-16 text-error mb-4" />
        <h3 className="text-2xl font-bold text-on-surface mb-2">Akses Ditolak</h3>
        <p className="text-on-surface-variant max-w-[28rem]">
          Anda tidak memiliki izin untuk mengakses halaman manajemen rapor kelas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-1.5 text-xs font-bold text-outline uppercase tracking-wider mb-2">
            <button onClick={() => router.push('/grading')} className="hover:text-primary transition-colors">
              Penilaian
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary">Sertifikat Hasil Belajar (SHB)</span>
          </nav>
          <h2 className="text-4xl font-bold text-on-surface tracking-tight">Cetak Rapor</h2>
          <p className="text-on-surface-variant font-medium mt-2 max-w-2xl leading-relaxed">
            Generate dan cetak rapor digital siswa dengan format resmi Kurikulum Merdeka.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Total Siswa"
          value={classReportCards.length.toString()}
          icon={Users}
          color="primary"
        />
        <StatCard
          label="Rapor Tersedia"
          value={classReportCards.filter(s => s.has_report_card).length.toString()}
          icon={FileText}
          color="success"
        />
        <StatCard
          label="Belum Ada Rapor"
          value={classReportCards.filter(s => !s.has_report_card).length.toString()}
          icon={AlertCircle}
          color="warning"
        />
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-sm">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-outline-variant/50 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="" disabled>Pilih Kelas</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
            className="w-[150px] px-4 py-2.5 rounded-xl border border-outline-variant/50 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={1}>Semester 1</option>
            <option value={2}>Semester 2</option>
          </select>
          <div className="relative group flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa..."
              className="w-full pl-10 pr-4 py-2.5 border border-outline-variant/50 rounded-xl bg-surface-container text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFinalizeModal(true)}
            disabled={isFinalizing || classReportCards.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-95 transition-all disabled:opacity-50"
          >
            {isFinalizing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileCheck className="w-4 h-4" />
            )}
            <span>Finalisasi Semua</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-outline-variant">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-on-surface">Finalisasi Semua Nilai</h3>
              <button onClick={() => { setShowFinalizeModal(false); setFinalizeResult(null); }} className="p-1 hover:bg-surface-container-high rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            {finalizeResult ? (
              <div>
                <div className={cn(
                  "p-4 rounded-xl mb-4 text-sm font-medium",
                  finalizeResult.error_count > 0
                    ? "bg-warning/10 text-warning border border-warning/20"
                    : "bg-success/10 text-success border border-success/20"
                )}>
                  {finalizeResult.message}
                </div>
                <p className="text-sm text-on-surface-variant mb-4">
                  Berhasil: {finalizeResult.finalized_count} nilai
                  {finalizeResult.error_count > 0 && ` | Gagal: ${finalizeResult.error_count}`}
                </p>
                <button
                  onClick={() => { setShowFinalizeModal(false); setFinalizeResult(null); }}
                  className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-on-surface-variant mb-6">
                  Apakah Anda yakin ingin finalisasi semua mata pelajaran untuk seluruh siswa di kelas ini? 
                  Nilai akhir akan dihitung berdasarkan bobot komponen yang sudah diatur.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowFinalizeModal(false); setFinalizeResult(null); }}
                    className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleFinalizeAll}
                    disabled={isFinalizing}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isFinalizing && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isFinalizing ? 'Memproses...' : 'Ya, Finalisasi'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Daftar Rapor Siswa
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/40 border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em]">Nama Siswa & NIS</th>
                <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Status Rapor</th>
                <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Jumlah Mapel</th>
                <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-medium">
              {isLoading && classReportCards.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-on-surface-variant">
                    {searchQuery ? 'Tidak ada siswa yang cocok.' : 'Belum ada data rapor untuk kelas ini.'}
                  </td>
                </tr>
              ) : (
                filteredCards.map((student) => (
                  <tr key={student.student_id} className="group hover:bg-surface-container-low/20 transition-all">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-on-surface">{student.full_name}</p>
                      <p className="text-[11px] font-bold text-outline uppercase mt-1 tracking-wider">NIS: {student.nis}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {student.has_report_card ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase bg-success/10 text-success border border-success/20">
                          <CheckCircle className="w-3 h-3" />
                          Siap Cetak
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase bg-warning/10 text-warning border border-warning/20">
                          <AlertCircle className="w-3 h-3" />
                          Belum Ada
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-on-surface-variant">{student.subject_count}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {student.has_report_card && (
                          <>
                            <button
                              onClick={() => fetchReportCardPreview(student.student_id)}
                              className="p-2 text-primary hover:bg-primary-fixed/50 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadReportCard(student.student_id)}
                              disabled={isDownloading}
                              className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {!student.has_report_card && (
                          <span className="text-xs text-on-surface-variant">Finalisasi nilai terlebih dahulu</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && reportCardData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col my-10">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface sticky top-0">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Preview Rapor</h3>
                <p className="text-xs text-on-surface-variant">
                  {reportCardData.student.full_name} - Semester {reportCardData.semester}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadReportCard(reportCardData.student.id)}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[600px]">
              {/* Student Info */}
              <div className="bg-surface p-4 rounded-xl border border-outline-variant mb-6">
                <h4 className="text-sm font-bold text-outline uppercase tracking-wider mb-3">Identitas Siswa</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-on-surface-variant">Nama:</span>
                    <span className="text-on-surface font-semibold ml-2">{reportCardData.student.full_name}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">NIS:</span>
                    <span className="text-on-surface font-semibold ml-2">{reportCardData.student.nis}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Kelas:</span>
                    <span className="text-on-surface font-semibold ml-2">{reportCardData.student.class_name}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Jurusan:</span>
                    <span className="text-on-surface font-semibold ml-2">{reportCardData.student.major_name}</span>
                  </div>
                </div>
              </div>

              {/* Grades Table */}
              <div className="border border-outline-variant rounded-xl overflow-hidden mb-6">
                <div className="bg-surface-container p-4 border-b border-outline-variant">
                  <h4 className="text-sm font-bold text-outline uppercase tracking-wider">Nilai Akademik</h4>
                </div>
                <div className="divide-y divide-outline-variant/30">
                  {reportCardData.grades.map((grade, i) => (
                    <div key={i} className="p-4 bg-surface">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-on-surface">{grade.subject_name}</h5>
                        <div className="flex items-center gap-3">
                          <span className={cn("px-3 py-1 rounded-lg text-sm font-bold", getGradeBadge(grade.grade_letter))}>
                            {grade.grade_letter}
                          </span>
                          <span className={cn(
                            "text-2xl font-bold font-mono",
                            grade.is_passed ? "text-success" : "text-primary"
                          )}>
                            {grade.final_score}
                          </span>
                        </div>
                      </div>
                      {grade.description && (
                        <p className="text-sm text-on-surface-variant mt-2">{grade.description}</p>
                      )}
                      {grade.competencies_achieved && (
                        <p className="text-xs text-outline mt-1">{grade.competencies_achieved}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance */}
              <div className="bg-surface p-4 rounded-xl border border-outline-variant">
                <h4 className="text-sm font-bold text-outline uppercase tracking-wider mb-3">Kehadiran</h4>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-primary">
                      {reportCardData.attendance.total_present}/{reportCardData.attendance.total_meetings}
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      Total kehadiran ({reportCardData.attendance.total_meetings > 0 ? Math.round((reportCardData.attendance.total_present / reportCardData.attendance.total_meetings) * 100) : 0}%)
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(reportCardData.attendance.by_subject).slice(0, 6).map(([subject, data]) => (
                    <div key={subject} className="text-xs p-2 bg-surface-container rounded">
                      <span className="text-on-surface-variant">{subject}:</span>
                      <span className="text-on-surface font-semibold ml-1">{data.present}/{data.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-2.5 rounded-full",
          color === 'success' ? 'bg-success/10 text-success' :
          color === 'warning' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-[11px] font-bold text-outline uppercase tracking-[0.1em] mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-on-surface tracking-tight">{value}</h3>
    </div>
  );
}
