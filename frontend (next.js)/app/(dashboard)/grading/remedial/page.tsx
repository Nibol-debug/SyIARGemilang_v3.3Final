'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Plus,
  Calendar,
  Edit,
  X,
  Loader2,
  BookOpen,
  BarChart3,
  RefreshCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/lib/useUserRole';

interface RemedialStats {
  total: number;
  pending: number;
  scheduled: number;
  completed: number;
  improved_count: number;
  pass_count: number;
  improvement_rate: number;
  pass_rate: number;
}

interface StudentNeedingRemedial {
  id: string;
  final_grade_id: string;
  student_id: string;
  nis: string;
  full_name: string;
  class_name: string;
  semester: number;
  final_score: number;
  grade_letter: string;
  needs_remedial: boolean;
  remedial_status: string;
  remedial_id?: string;
  score_after?: number | null;
  scheduled_at?: string | null;
}

export default function RemedialPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [students, setStudents] = useState<StudentNeedingRemedial[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [stats, setStats] = useState<RemedialStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'schedule' | 'update'>('create');
  const [selectedStudent, setSelectedStudent] = useState<StudentNeedingRemedial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { canManageGrades } = useUserRole();

  const [formData, setFormData] = useState({
    student_id: '',
    subject_id: '',
    score_before: 0,
    scheduled_at: '',
    exam_id: '',
    score_after: 0,
    notes: ''
  });

  const fetchSubjectsAndClasses = async () => {
    try {
      const [subjectsRes, classesRes] = await Promise.all([
        apiRequest('/subjects'),
        apiRequest('/classes')
      ]);
      setSubjects(subjectsRes.data || []);
      setClasses(classesRes.data || []);
      if (subjectsRes.data?.length > 0) {
        setSelectedSubject(subjectsRes.data[0].id);
        setFormData(prev => ({ ...prev, subject_id: subjectsRes.data[0].id }));
      }
      if (classesRes.data?.length > 0) setSelectedClass(classesRes.data[0].id);
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    }
  };

  const fetchRemedialStats = async () => {
    try {
      const res = await apiRequest('/remedial/stats');
      setStats(res);
    } catch (err) {
      console.error('Gagal mengambil statistik:', err);
    }
  };

  const fetchStudentsNeedingRemedial = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        semester: selectedSemester.toString()
      });
      if (selectedSubject) params.append('subject_id', selectedSubject);
      if (selectedClass) params.append('class_id', selectedClass);

      const res = await apiRequest(`/remedial/needs?${params}`);
      setStudents(res);
    } catch (err) {
      console.error('Gagal mengambil data siswa:', err);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!canManageGrades) return;
    fetchSubjectsAndClasses();
    fetchRemedialStats();
    fetchBatches();
  }, [canManageGrades]);

  useEffect(() => {
    fetchStudentsNeedingRemedial();
  }, [selectedSubject, selectedClass, selectedSemester]);

  const [batches, setBatches] = useState<any[]>([]);

  const fetchBatches = async () => {
    try {
      const res = await apiRequest('/batches?limit=10');
      setBatches(res.data || res || []);
    } catch (err) {
      console.error('Gagal mengambil data batch:', err);
    }
  };

  const handleCreateRemedial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const activeBatch = batches.find((b: any) => b.is_active) || batches[0];
      await apiRequest('/remedial', {
        method: 'POST',
        body: JSON.stringify({
          student_id: formData.student_id,
          subject_id: formData.subject_id,
          batch_id: activeBatch?.id || '',
          semester: selectedSemester,
          score_before: formData.score_before,
          scheduled_at: formData.scheduled_at || undefined,
          notes: formData.notes
        })
      });
      alert('Remedial berhasil dibuat!');
      setIsModalOpen(false);
      fetchStudentsNeedingRemedial();
      fetchRemedialStats();
    } catch (err: any) {
      alert('Gagal membuat remedial: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent?.remedial_id) return;
    setIsSubmitting(true);
    try {
      await apiRequest(`/remedial/${selectedStudent.remedial_id}/schedule`, {
        method: 'PUT',
        body: JSON.stringify({
          exam_id: formData.exam_id,
          scheduled_at: formData.scheduled_at
        })
      });
      alert('Jadwal remedial berhasil diatur!');
      setIsModalOpen(false);
      fetchStudentsNeedingRemedial();
      fetchRemedialStats();
    } catch (err: any) {
      alert('Gagal menjadwalkan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent?.remedial_id) return;
    setIsSubmitting(true);
    try {
      await apiRequest(`/remedial/${selectedStudent.remedial_id}/score`, {
        method: 'PUT',
        body: JSON.stringify({
          score_after: formData.score_after,
          notes: formData.notes
        })
      });
      alert('Nilai remedial berhasil diupdate!');
      setIsModalOpen(false);
      fetchStudentsNeedingRemedial();
      fetchRemedialStats();
    } catch (err: any) {
      alert('Gagal update nilai: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = async (student?: StudentNeedingRemedial) => {
    setModalMode('create');
    if (student) {
      setSelectedStudent(student);
      setFormData({
        student_id: student.student_id,
        subject_id: selectedSubject,
        score_before: student.final_score,
        scheduled_at: '',
        exam_id: '',
        score_after: 0,
        notes: ''
      });
    } else {
      // Manual add: fetch all students and reset form
      setSelectedStudent(null);
      setFormData({
        student_id: '',
        subject_id: selectedSubject,
        score_before: 0,
        scheduled_at: '',
        exam_id: '',
        score_after: 0,
        notes: ''
      });
      try {
        const studentsRes = await apiRequest('/students?limit=1000');
        setAllStudents(studentsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      }
    }
    setIsModalOpen(true);
  };

  const openScheduleModal = async (student: StudentNeedingRemedial) => {
    setModalMode('schedule');
    setSelectedStudent(student);
    setFormData({
      student_id: student.student_id,
      subject_id: selectedSubject,
      score_before: student.final_score,
      scheduled_at: '',
      exam_id: '',
      score_after: 0,
      notes: ''
    });
    try {
      const res = await apiRequest(`/exams?subject_id=${selectedSubject}`);
      setExams(res.data || res || []);
    } catch (err) {
      console.error('Gagal mengambil data ujian:', err);
      setExams([]);
    }
    setIsModalOpen(true);
  };

  const openUpdateModal = (student: StudentNeedingRemedial) => {
    setModalMode('update');
    setSelectedStudent(student);
    setFormData({
      student_id: student.student_id,
      subject_id: selectedSubject,
      score_before: student.final_score,
      scheduled_at: student.scheduled_at || '',
      exam_id: '',
      score_after: student.score_after || 0,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase bg-warning/10 text-warning border border-warning/20 flex items-center gap-1"><Clock className="w-3 h-3" />Pending</span>;
      case 'scheduled':
        return <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20 flex items-center gap-1"><Calendar className="w-3 h-3" />Scheduled</span>;
      case 'completed':
        return <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase bg-success/10 text-success border border-success/20 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Completed</span>;
      default:
        return <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase bg-surface-container-high text-on-surface-variant border border-outline-variant/30">{status}</span>;
    }
  };

  if (canManageGrades === false) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-error mb-4" />
        <h3 className="text-2xl font-bold text-on-surface mb-2">Akses Ditolak</h3>
        <p className="text-on-surface-variant max-w-[28rem]">
          Anda tidak memiliki izin untuk mengakses halaman manajemen remedial.
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
            <span className="text-primary">Remedial</span>
          </nav>
          <h2 className="text-4xl font-bold text-on-surface tracking-tight">Manajemen Remedial</h2>
          <p className="text-on-surface-variant font-medium mt-2 max-w-2xl leading-relaxed">
            Pantau dan kelola siswa yang perlu mengikuti ujian remedial untuk meningkatkan nilai mereka.
          </p>
        </div>
        <button
          onClick={() => { fetchStudentsNeedingRemedial(); fetchRemedialStats(); }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-95 transition-all active:scale-95 shadow-xl shadow-primary/20"
        >
          <RefreshCcw className="w-4.5 h-4.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Remedial"
            value={stats.total.toString()}
            icon={Users}
            color="primary"
          />
          <StatCard
            label="Menunggu"
            value={stats.pending.toString()}
            icon={Clock}
            color="warning"
          />
          <StatCard
            label="Terjadwal"
            value={stats.scheduled.toString()}
            icon={Calendar}
            color="secondary"
          />
          <StatCard
            label="Selesai"
            value={stats.completed.toString()}
            icon={CheckCircle}
            color="success"
            trend={`${stats.pass_rate}% Lulus`}
          />
        </div>
      )}

      {/* Additional Stats */}
      {stats && stats.completed > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-success/10 text-success">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">Tingkat Perbaikan</h3>
                <p className="text-xs text-on-surface-variant">Siswa dengan nilai meningkat</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-success">{stats.improvement_rate}%</span>
              <span className="text-sm text-on-surface-variant mb-1">
                dari {stats.completed} siswa ({stats.improved_count} membaik)
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">Tingkat Kelulusan</h3>
                <p className="text-xs text-on-surface-variant">Siswa mencapai KKM setelah remedial</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-primary">{stats.pass_rate}%</span>
              <span className="text-sm text-on-surface-variant mb-1">
                dari {stats.completed} siswa ({stats.pass_count} lulus)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-sm">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-outline-variant/50 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="" disabled>Pilih Mata Pelajaran</option>
            {subjects.map(subj => (
              <option key={subj.id} value={subj.id}>{subj.name}</option>
            ))}
          </select>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="flex-1 min-w-[150px] px-4 py-2.5 rounded-xl border border-outline-variant/50 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Semua Kelas</option>
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
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Siswa Perlu Remedial
          </h3>
          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Manual</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/40 border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em]">Siswa</th>
                <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Nilai</th>
                <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Grade</th>
                <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Nilai Baru</th>
                <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-on-surface-variant">
                    Tidak ada siswa perlu remedial untuk filter ini.
                  </td>
                </tr>
              ) : (
                students.map((student, i) => (
                  <tr key={student.id} className="group hover:bg-surface-container-low/20 transition-all">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-on-surface">{student.full_name}</p>
                      <p className="text-[11px] font-bold text-outline uppercase mt-1 tracking-wider">
                        NIS: {student.nis} • {student.class_name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xl font-bold text-primary">{student.final_score}</span>
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
                      {getStatusBadge(student.remedial_status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {student.score_after ? (
                        <span className={cn(
                          "text-xl font-bold",
                          student.score_after >= 75 ? "text-success" : "text-primary"
                        )}>
                          {student.score_after}
                        </span>
                      ) : (
                        <span className="text-sm text-on-surface-variant">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {student.remedial_status === 'pending' && (
                          <>
                            <button
                              onClick={() => openScheduleModal(student)}
                              className="p-2 text-primary hover:bg-primary-fixed/50 rounded-lg transition-colors"
                              title="Jadwalkan"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openUpdateModal(student)}
                              className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                              title="Update Nilai"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {student.remedial_status === 'scheduled' && (
                          <button
                            onClick={() => openUpdateModal(student)}
                            className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                            title="Update Nilai"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {student.remedial_status === 'completed' && (
                          <span className="text-xs text-on-surface-variant">Selesai</span>
                        )}
                        {!student.remedial_id && (
                          <button
                            onClick={() => openCreateModal(student)}
                            className="p-2 text-primary hover:bg-primary-fixed/50 rounded-lg transition-colors"
                            title="Buat Remedial"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface">
                {modalMode === 'create' && 'Buat Remedial'}
                {modalMode === 'schedule' && 'Jadwalkan Remedial'}
                {modalMode === 'update' && 'Update Nilai Remedial'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {modalMode === 'create' && (
                <form id="remedialForm" onSubmit={handleCreateRemedial} className="space-y-4">
                  {!selectedStudent && (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant">Mata Pelajaran</label>
                        <select
                          required
                          value={formData.subject_id}
                          onChange={e => setFormData({...formData, subject_id: e.target.value})}
                          className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                          <option value="" disabled>-- Pilih Mata Pelajaran --</option>
                          {subjects.map(subj => (
                            <option key={subj.id} value={subj.id}>{subj.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant">Siswa</label>
                        <select
                          required
                          value={formData.student_id}
                          onChange={e => setFormData({...formData, student_id: e.target.value})}
                          className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                          <option value="" disabled>-- Pilih Siswa --</option>
                          {allStudents.map(s => (
                            <option key={s.id} value={s.id}>{s.full_name} ({s.nis})</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  {selectedStudent && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <p className="text-sm font-medium text-primary">
                        Remedial untuk: <strong>{selectedStudent.full_name}</strong>
                      </p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Mapel: {subjects.find(s => s.id === selectedSubject)?.name || '-'} • Nilai: {selectedStudent.final_score}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Nilai Saat Ini (Opsional)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.score_before || ''}
                      onChange={e => setFormData({...formData, score_before: e.target.value ? parseFloat(e.target.value) : 0})}
                      className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Kosongkan untuk otomatis dari nilai akhir"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Jadwal (Opsional)</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={e => setFormData({...formData, scheduled_at: e.target.value})}
                      className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Catatan</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      rows={3}
                    />
                  </div>
                </form>
              )}

              {modalMode === 'schedule' && (
                <form id="remedialForm" onSubmit={handleSchedule} className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-4">
                    <p className="text-sm font-medium text-primary">
                      Menjadwalkan remedial untuk: <strong>{selectedStudent?.full_name}</strong>
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Nilai saat ini: {selectedStudent?.final_score}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Pilih Ujian</label>
                    <select
                      required
                      value={formData.exam_id}
                      onChange={e => setFormData({...formData, exam_id: e.target.value})}
                      className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="" disabled>-- Pilih Ujian --</option>
                      {exams.length === 0 && (
                        <option value="" disabled>Tidak ada ujian tersedia</option>
                      )}
                      {exams.map((exam: any) => (
                        <option key={exam.id} value={exam.id}>
                          {exam.title} {exam.code ? `(${exam.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Tanggal & Waktu</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.scheduled_at}
                      onChange={e => setFormData({...formData, scheduled_at: e.target.value})}
                      className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </form>
              )}

              {modalMode === 'update' && (
                <form id="remedialForm" onSubmit={handleUpdateScore} className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-4">
                    <p className="text-sm font-medium text-primary">
                      Update nilai untuk: <strong>{selectedStudent?.full_name}</strong>
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Nilai sebelum: {selectedStudent?.final_score}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Nilai Setelah Remedial</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={formData.score_after}
                      onChange={e => setFormData({...formData, score_after: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Catatan</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      rows={3}
                      placeholder="Catatan perkembangan siswa..."
                    />
                  </div>
                </form>
              )}
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors">
                Batal
              </button>
              <button type="submit" form="remedialForm" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>
                  {modalMode === 'create' && 'Buat Remedial'}
                  {modalMode === 'schedule' && 'Simpan Jadwal'}
                  {modalMode === 'update' && 'Update Nilai'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, trend }: any) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-2.5 rounded-full",
          color === 'warning' ? 'bg-warning/10 text-warning' :
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
