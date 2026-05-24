'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Download,
  RefreshCcw,
  Loader2,
  BookOpen,
  Target,
  Users,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/lib/useUserRole';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface QuestionStatistic {
  id: string;
  question_text: string;
  type: 'mcq' | 'essay';
  difficulty: string;
  total_attempts: number;
  correct_count: number;
  correct_percentage: number;
  discrimination_index?: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
}

interface ClassGradeDistribution {
  grade_range: string;
  count: number;
  percentage: number;
}

interface ExamStatistics {
  exam_title: string;
  subject_name: string;
  total_students: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  standard_deviation: number;
  questions: QuestionStatistic[];
  grade_distribution: ClassGradeDistribution[];
}

export default function GradeAnalysisPage() {
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [activeTab, setActiveTab] = useState<'exam' | 'class'>('exam');
  const [examStats, setExamStats] = useState<ExamStatistics | null>(null);
  const [classStats, setClassStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { canManageGrades } = useUserRole();

  const loadInitialData = async () => {
    try {
      const [classesRes, subjectsRes, examsRes] = await Promise.all([
        apiRequest('/classes'),
        apiRequest('/subjects?limit=200'),
        apiRequest('/exams?limit=200')
      ]);

      const classesData = classesRes?.data || [];
      const subjectsData = subjectsRes?.data || [];
      const examsData = examsRes?.data || [];

      setClasses(classesData);
      setSubjects(subjectsData);
      setFilteredSubjects(subjectsData);
      setExams(examsData);

      // Auto-select first item if available
      if (classesData.length > 0 && !selectedClass) setSelectedClass(classesData[0].id);
      if (subjectsData.length > 0 && !selectedSubject) setSelectedSubject(subjectsData[0].id);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    }
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);

    // Filter exams by selected subject
    if (activeTab === 'exam') {
      loadExamsForSubject(subjectId);
    }

    // Filter subjects by selected class in class tab
    if (activeTab === 'class' && selectedClass) {
      const cls = classes.find(c => c.id === selectedClass);
      if (cls) {
        const majorSubjects = subjects.filter(s => s.major_id === cls.major_id || !s.major_id);
        setFilteredSubjects(majorSubjects);
      }
    }
  };

  const loadExamsForSubject = async (subjectId: string) => {
    try {
      const res = await apiRequest(`/exams?subject_id=${subjectId}&limit=200`);
      setExams(res?.data || []);
      setSelectedExam('');
    } catch (err) {
      console.error('Gagal memuat ujian:', err);
    }
  };

  const handleClassSelect = async (classId: string) => {
    setSelectedClass(classId);
    setSelectedSubject('');

    try {
      const res = await apiRequest(`/classes/${classId}`);
      const majorId = res?.major_id;
      const majorSubjects = subjects.filter(s => s.major_id === majorId || !s.major_id);
      setFilteredSubjects(majorSubjects.length > 0 ? majorSubjects : subjects);
    } catch (err) {
      setFilteredSubjects(subjects);
    }
  };

  const fetchExamAnalysis = async () => {
    if (!selectedExam) return;
    setIsLoading(true);
    try {
      const res = await apiRequest(`/grade-analysis/exam/${selectedExam}/statistics`);
      setExamStats(res);
    } catch (err) {
      console.error('Gagal analisis ujian:', err);
      setExamStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClassAnalysis = async () => {
    if (!selectedClass || !selectedSubject) return;
    setIsLoading(true);
    try {
      const res = await apiRequest(`/grade-analysis/class/${selectedClass}/subject/${selectedSubject}`);
      setClassStats(res);
    } catch (err) {
      console.error('Gagal analisis kelas:', err);
      setClassStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'exam' && selectedExam) {
      fetchExamAnalysis();
    }
  }, [selectedExam, activeTab]);

  useEffect(() => {
    if (activeTab === 'class' && selectedClass && selectedSubject) {
      fetchClassAnalysis();
    }
  }, [selectedClass, selectedSubject, activeTab]);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'text-success bg-success/10';
      case 'medium': return 'text-primary bg-primary/10';
      case 'hard': return 'text-error bg-error/10';
      default: return 'text-on-surface-variant bg-surface-container-high';
    }
  };

  const getDiscriminationStatus = (index?: number) => {
    if (index === undefined) return { label: 'N/A', color: 'text-on-surface-variant' };
    if (index >= 0.4) return { label: 'Excellent', color: 'text-success' };
    if (index >= 0.2) return { label: 'Good', color: 'text-primary' };
    if (index >= 0) return { label: 'Poor', color: 'text-warning' };
    return { label: 'Negative', color: 'text-error' };
  };

  const needsReview = (q: QuestionStatistic) => {
    const poorDiscrimination = q.discrimination_index !== undefined && q.discrimination_index < 0.2;
    const tooEasy = q.correct_percentage > 90;
    const tooHard = q.correct_percentage < 20;
    return poorDiscrimination || tooEasy || tooHard;
  };

  if (canManageGrades === false) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-error mb-4" />
        <h3 className="text-2xl font-bold text-on-surface mb-2">Akses Ditolak</h3>
        <p className="text-on-surface-variant max-w-[28rem]">
          Anda tidak memiliki izin untuk mengakses halaman analisis penilaian.
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
            <ArrowLeft className="w-3 h-3 rotate-180" />
            <span className="text-primary">Analisis Butir Soal</span>
          </nav>
          <h2 className="text-4xl font-bold text-on-surface tracking-tight">Analisis Penilaian</h2>
          <p className="text-on-surface-variant font-medium mt-2 max-w-2xl leading-relaxed">
            Statistik dan analisis mendalam untuk evaluasi kualitas soal dan distribusi nilai siswa.
          </p>
        </div>
        <button
          onClick={() => activeTab === 'exam' ? fetchExamAnalysis() : fetchClassAnalysis()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-95 transition-all active:scale-95 shadow-xl shadow-primary/20"
        >
          <RefreshCcw className="w-4.5 h-4.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant">
        <button
          onClick={() => setActiveTab('exam')}
          className={cn(
            "px-6 py-3 text-sm font-bold border-b-2 transition-colors",
            activeTab === 'exam'
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          )}
        >
          Analisis Ujian
        </button>
        <button
          onClick={() => setActiveTab('class')}
          className={cn(
            "px-6 py-3 text-sm font-bold border-b-2 transition-colors",
            activeTab === 'class'
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          )}
        >
          Analisis Per Kelas
        </button>
      </div>

      {/* Filters */}
      {activeTab === 'exam' ? (
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-sm">
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectSelect(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-outline-variant/50 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Pilih Mata Pelajaran</option>
              {subjects.map(subj => (
                <option key={subj.id} value={subj.id}>{subj.name}</option>
              ))}
            </select>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="flex-1 min-w-[300px] px-4 py-2.5 rounded-xl border border-outline-variant/50 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="" disabled>Pilih Ujian</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.title}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-sm">
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedClass}
              onChange={(e) => handleClassSelect(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-outline-variant/50 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="" disabled>Pilih Kelas</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-outline-variant/50 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="" disabled>Pilih Mata Pelajaran</option>
              {filteredSubjects.map(subj => (
                <option key={subj.id} value={subj.id}>{subj.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      )}

      {/* Content */}
      {!isLoading && activeTab === 'exam' && examStats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Total Peserta"
              value={examStats.total_students.toString()}
              icon={Users}
              color="primary"
            />
            <StatCard
              label="Nilai Rata-rata"
              value={examStats.average_score.toFixed(1)}
              icon={TrendingUp}
              color="secondary"
            />
            <StatCard
              label="Nilai Tertinggi"
              value={examStats.highest_score.toFixed(1)}
              icon={Award}
              color="success"
            />
            <StatCard
              label="Nilai Terendah"
              value={examStats.lowest_score.toFixed(1)}
              icon={Target}
              color="error"
            />
          </div>

          {/* Grade Distribution Chart */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
            <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Distribusi Nilai
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examStats.grade_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="grade_range"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#444653', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#444653', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={60}>
                    {examStats.grade_distribution.map((entry, index) => (
                      <Cell key={index} fill={getColorForGrade(entry.grade_range)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Question Analysis Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Analisis Butir Soal
              </h3>
              <span className="text-xs font-bold text-outline bg-surface-container px-3 py-1.5 rounded-full">
                {examStats.questions.length} Soal
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low/40 border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em]">Soal</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Tipe</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Kesulitan</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">% Benar</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Daya Pembeda</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low font-medium">
                  {examStats.questions.map((q, i) => {
                    const review = needsReview(q);
                    const discrimStatus = getDiscriminationStatus(q.discrimination_index);
                    return (
                      <tr key={q.id} className={cn("group hover:bg-surface-container-low/20 transition-all", review && "bg-error/5")}>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-on-surface max-w-[28rem] truncate">
                            {q.question_text}
                          </p>
                          <p className="text-[10px] text-outline mt-1">
                            Attempts: {q.total_attempts} | Benar: {q.correct_count}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                            q.type === 'mcq' ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                          )}>
                            {q.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase", getDifficultyColor(q.difficulty_level))}>
                            {q.difficulty_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "text-sm font-bold",
                            q.correct_percentage >= 70 ? "text-success" :
                            q.correct_percentage >= 40 ? "text-primary" : "text-error"
                          )}>
                            {q.correct_percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn("text-sm font-bold", discrimStatus.color)}>
                            {q.discrimination_index !== undefined ? q.discrimination_index.toFixed(2) : 'N/A'}
                          </span>
                          <p className="text-[10px] text-outline mt-0.5">{discrimStatus.label}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {review ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase bg-error/10 text-error border border-error/20">
                              <AlertTriangle className="w-3 h-3" />
                              Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase bg-success/10 text-success border border-success/20">
                              <CheckCircle className="w-3 h-3" />
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!isLoading && activeTab === 'class' && classStats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Total Siswa"
              value={classStats.total_students.toString()}
              icon={Users}
              color="primary"
            />
            <StatCard
              label="Nilai Rata-rata"
              value={classStats.average_score.toFixed(1)}
              icon={TrendingUp}
              color="secondary"
            />
            <StatCard
              label="Siswa Lulus"
              value={classStats.passed_count.toString()}
              icon={CheckCircle}
              color="success"
              trend={`${classStats.pass_percentage}%`}
            />
            <StatCard
              label="Perlu Remedial"
              value={classStats.remedial_count.toString()}
              icon={AlertTriangle}
              color="error"
            />
          </div>

          {/* Grade Distribution */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
            <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Distribusi Nilai - {classStats.class_name} ({classStats.subject_name})
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classStats.grade_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="grade_range"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#444653', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#444653', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={60}>
                    {classStats.grade_distribution.map((entry: any, index: number) => (
                      <Cell key={index} fill={getColorForGrade(entry.grade_range)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant">
              <h3 className="text-xl font-bold text-on-surface">Daftar Nilai Siswa</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low/40 border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em]">Nama & NIS</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Nilai Akhir</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Grade</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low font-medium">
                  {classStats.students.map((student: any) => (
                    <tr key={student.id} className="group hover:bg-surface-container-low/20 transition-all">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-on-surface">{student.full_name}</p>
                        <p className="text-[11px] font-bold text-outline uppercase mt-1 tracking-wider">NIS: {student.nis}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "text-xl font-bold font-mono",
                          student.final_score && student.final_score >= 75 ? "text-success" : "text-primary"
                        )}>
                          {student.final_score || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-sm font-bold",
                          student.grade_letter === 'A' ? "bg-success/10 text-success" :
                          student.grade_letter === 'B' ? "bg-primary/10 text-primary" :
                          student.grade_letter === 'C' ? "bg-warning/10 text-warning" :
                          student.grade_letter === 'D' ? "bg-orange-500/10 text-orange-500" :
                          "bg-error/10 text-error"
                        )}>
                          {student.grade_letter}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border",
                          student.is_passed === true ? "bg-success/10 text-success border-success/20" :
                          student.final_score ? "bg-error/10 text-error border-error/20" :
                          "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
                        )}>
                          {student.is_passed === true ? 'Lulus' : student.final_score ? 'Remedial' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- Helper Components ---

function StatCard({ label, value, icon: Icon, color, trend }: any) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-2.5 rounded-full",
          color === 'error' ? 'bg-error/10 text-error' :
          color === 'success' ? 'bg-success/10 text-success' :
          color === 'secondary' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-success/10 text-success">
            {trend}
          </span>
        )}
      </div>
      <p className="text-[11px] font-bold text-outline uppercase tracking-[0.1em] mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-on-surface tracking-tight">{value}</h3>
    </div>
  );
}

function getColorForGrade(range: string): string {
  if (range.includes('A')) return '#22c55d';
  if (range.includes('B')) return '#3b82f6';
  if (range.includes('C')) return '#eab308';
  if (range.includes('D')) return '#f97316';
  return '#ef4444';
}
