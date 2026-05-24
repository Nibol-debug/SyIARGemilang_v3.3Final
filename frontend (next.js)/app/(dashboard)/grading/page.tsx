'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import {
  Download,
  CheckCircle2,
  BarChart2,
  AlertCircle,
  Search,
  ChevronRight,
  ChevronLeft,
  Edit,
  History,
  TrendingUp,
  RefreshCcw,
  Verified,
  X,
  Loader2,
  BarChart3,
  AlertTriangle,
  FileText,
  Save,
  Settings,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/lib/useUserRole';
import { StudentGradingView } from '@/components/grading/StudentGradingView';

function TeacherGradingView() {
  const router = useRouter();
  const [grades, setGrades] = useState<any[]>([]);
  const [gradingStats, setGradingStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1);

  const [formData, setFormData] = useState({
    student_id: '',
    subject_id: '',
    semester: 1
  });

  const [inputData, setInputData] = useState({
    student_id: '',
    type: 'assignment',
    score: '',
    weight: '1.0'
  });

  const [presensiModal, setPresensiModal] = useState<{ open: boolean; studentId: string; studentName: string; subjectId: string; data: any; loading: boolean }>({
    open: false, studentId: '', studentName: '', subjectId: '', data: null, loading: false,
  });

  const openPresensiDetail = async (studentId: string, studentName: string) => {
    setPresensiModal({ ...presensiModal, open: true, studentId, studentName, subjectId: selectedSubject, data: null, loading: true });
    try {
      const res = await apiRequest(`/attendance/student/${studentId}?subject_id=${selectedSubject}`);
      setPresensiModal(prev => ({ ...prev, data: res, loading: false }));
    } catch {
      setPresensiModal(prev => ({ ...prev, loading: false }));
    }
  };

  const gradeTypeLabels: Record<string, string> = {
    assignment: 'Tugas',
    ujian_awal: 'Ujian Awal',
    ujian_akhir: 'Ujian Akhir',
    quiz: 'Quiz',
    presensi: 'Presensi',
  };

  const fetchGradingStats = async () => {
    try {
      const res = await apiRequest('/stats/grading');
      setGradingStats(res);
    } catch (err) {
      console.error('Gagal mengambil statistik nilai:', err);
    }
  };

  const handleInputGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest('/grades', {
        method: 'POST',
        body: JSON.stringify({
          student_id: inputData.student_id,
          subject_id: selectedSubject,
          type: inputData.type,
          score: Number(inputData.score),
          weight: Number(inputData.weight)
        })
      });
      alert('Input nilai berhasil!');
      setIsInputModalOpen(false);
      setInputData({ ...inputData, score: '' });
      fetchGrades();
      fetchGradingStats();
    } catch (err: any) {
      alert('Gagal input nilai: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        apiRequest('/classes'),
        apiRequest('/subjects')
      ]);
      setClasses(classesRes.data || []);
      setSubjects(subjectsRes.data || []);
      
      if (classesRes.data?.length > 0) setSelectedClass(classesRes.data[0].id);
      if (subjectsRes.data?.length > 0) {
        setSelectedSubject(subjectsRes.data[0].id);
        setFormData(prev => ({ ...prev, subject_id: subjectsRes.data[0].id }));
      }
      fetchGradingStats();
    } catch (err) {
      console.error('Gagal mengambil data awal:', err);
    }
  };

  const fetchGrades = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest(`/grades/class/${selectedClass}?subject_id=${selectedSubject}`);
      setGrades(response || []);
      // Also update student list for modal
      setStudents(response || []);
      if (response.length > 0) {
        setFormData(prev => ({ ...prev, student_id: response[0].id }));
      }
    } catch (err) {
      console.error('Gagal mengambil data nilai:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      fetchInitialData();
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && selectedClass && selectedSubject) {
      fetchGrades();
    }
  }, [selectedClass, selectedSubject]);

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await apiRequest('/grades/finalize-class', {
        method: 'POST',
        body: JSON.stringify({
          class_id: selectedClass,
          subject_id: selectedSubject,
          semester: Number(formData.semester)
        })
      });
      alert(response.message || 'Finalisasi nilai kelas berhasil!');
      setIsModalOpen(false);
      fetchGrades();
      fetchGradingStats();
    } catch (err: any) {
      alert('Gagal finalisasi: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStats = [
    { label: 'Total Nilai Diproses', value: gradingStats?.totalGrades?.toLocaleString() || '0', trend: '+12%', icon: BarChart2, color: 'primary' },
    { label: 'Rata-rata Nilai', value: gradingStats?.averageScore?.toString() || '0', trend: 'Target 75', icon: TrendingUp, color: 'secondary' },
    { label: 'Siswa Lulus (KKM)', value: gradingStats?.passedCount?.toLocaleString() || '0', trend: `${gradingStats?.passPercentage || 0}% Siswa`, icon: CheckCircle2, color: 'success' },
    { label: 'Perlu Remedial', value: gradingStats?.remedialCount?.toLocaleString() || '0', trend: 'Tindakan Dibutuhkan', icon: AlertCircle, color: 'error' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-1.5 text-xs font-bold text-outline uppercase tracking-wider mb-2">
            <a href="/academic" className="hover:text-primary transition-colors">Akademik</a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary">Sistem Penilaian</span>
          </nav>
          <h2 className="text-4xl font-bold text-on-surface tracking-tight">Sistem Penilaian</h2>
          <p className="text-on-surface-variant font-medium mt-2 max-w-2xl leading-relaxed">
            Manajemen evaluasi hasil belajar siswa yang komprehensif, mencakup integrasi nilai CBT, tugas harian, dan ujian akhir semester.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push('/grading/settings')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-all active:scale-95"
          >
            <Settings className="w-4.5 h-4.5" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => router.push('/grading/report-cards')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-all active:scale-95"
          >

            <FileText className="w-4.5 h-4.5" />
            <span>Sertifikat Hasil Belajar (SHB)</span>
          </button>
          <button
            onClick={() => router.push('/grading/analysis')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-all active:scale-95"
          >
            <BarChart3 className="w-4.5 h-4.5" />
            <span>Analisis Butir Soal</span>
          </button>
          <button
            onClick={() => router.push('/grading/remedial')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-all active:scale-95"
          >
            <AlertTriangle className="w-4.5 h-4.5" />
            <span>Remedial</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-all active:scale-95"
          >
            <Download className="w-4.5 h-4.5" />
            <span>Ekspor PDF</span>
          </button>
          <button
            onClick={() => {
              if (grades.length > 0) {
                setInputData({ ...inputData, student_id: grades[0].id });
              }
              setIsInputModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-all active:scale-95"
          >
            <Edit className="w-4.5 h-4.5" />
            <span>Input Nilai</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-95 transition-all active:scale-95 shadow-xl shadow-primary/20"
          >
            <Verified className="w-4.5 h-4.5" />
            <span>Finalisasi Nilai</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeStats.map((stat, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "p-3 rounded-2xl transition-transform group-hover:scale-110 duration-500",
                stat.color === 'primary' ? "bg-primary/10 text-primary" :
                stat.color === 'secondary' ? "bg-secondary/10 text-secondary" :
                stat.color === 'success' ? "bg-on-secondary-container/10 text-on-secondary-container" :
                "bg-error/10 text-error"
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2.5 py-1.5 rounded-full border shadow-sm transition-all",
                stat.color === 'primary' ? "bg-secondary-container/30 text-secondary border-secondary/10" :
                stat.color === 'secondary' ? "bg-surface-container-high text-on-surface-variant border-outline-variant/30" :
                stat.color === 'success' ? "bg-on-secondary-container/10 text-on-secondary-container border-on-secondary-container/10" :
                "bg-error/10 text-error border-error/10"
              )}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[11px] font-bold text-outline uppercase tracking-[0.1em] mb-1">{stat.label}</p>
            <h4 className="text-3xl font-black text-on-surface tracking-tighter">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <select 
            value={selectedClass} 
            onChange={e => setSelectedClass(e.target.value)}
            className="bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/50 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
          >
            <option value="" disabled>Pilih Kelas</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select 
            value={selectedSubject} 
            onChange={e => setSelectedSubject(e.target.value)}
            className="bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/50 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
          >
            <option value="" disabled>Pilih Mata Pelajaran</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select 
            value={selectedSemester} 
            onChange={e => setSelectedSemester(Number(e.target.value))}
            className="bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/50 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
          >
            <option value={1}>Semester Ganjil</option>
            <option value={2}>Semester Genap</option>
          </select>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Nama/NIS..." 
              className="w-full pl-10 pr-4 py-2.5 border border-outline-variant/50 rounded-xl bg-surface-container text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
        <button 
          onClick={fetchGrades}
          className="px-6 py-2.5 bg-surface-container-high text-on-surface-variant font-bold text-sm rounded-xl hover:bg-outline-variant/30 transition-all active:scale-95"
        >
          Refresh Data
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/40 border-b border-outline-variant">
              <tr>
                <th className="px-5 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em]">Nama Siswa & NIS</th>
                <th className="px-5 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Tugas</th>
                <th className="px-5 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Quiz</th>
                <th className="px-5 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Ujian Awal</th>
                <th className="px-5 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Ujian Akhir</th>
                <th className="px-5 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Presensi</th>
                <th className="px-5 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-center">Nilai Akhir</th>
                <th className="px-5 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em]">Status</th>
                <th className="px-5 py-4 text-[11px] font-bold text-outline uppercase tracking-[0.1em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : grades.length === 0 ? (
                 <tr>
                   <td colSpan={9} className="text-center py-10 text-on-surface-variant">Data nilai tidak ditemukan untuk filter ini.</td>
                 </tr>
              ) : grades.map((item, i) => (
                <tr key={item.id || i} className="group hover:bg-surface-container-low/20 even:bg-surface-container/20 transition-all">
                  <td className="px-5 py-3">
                    <p className="text-sm font-bold text-on-surface">{item.full_name}</p>
                    <p className="text-[11px] font-bold text-outline uppercase mt-1 tracking-wider">NIS: {item.nis}</p>
                  </td>
                  <td className="px-5 py-3 text-center text-sm font-bold text-on-surface-variant">{item.grades?.tugas || '-'}</td>
                  <td className="px-5 py-3 text-center text-sm font-bold text-on-surface-variant">{item.grades?.quiz || '-'}</td>
                  <td className="px-5 py-3 text-center text-sm font-bold text-on-surface-variant">{item.grades?.ujian_awal || '-'}</td>
                  <td className="px-5 py-3 text-center text-sm font-bold text-on-surface-variant">{item.grades?.ujian_akhir || '-'}</td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => openPresensiDetail(item.id, item.full_name)}
                      className="text-sm font-bold text-primary hover:text-primary/70 underline-offset-2 hover:underline transition-all"
                      title="Lihat detail presensi"
                    >
                      {item.grades?.presensi || '-'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={cn(
                      "text-2xl font-bold font-mono tracking-tighter",
                      item.final_score >= 75 ? "text-success" : "text-primary"
                    )}>
                      {item.final_score || '-'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      "px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                      item.status === 'Lulus' ? "bg-success-container/30 text-success border-success/20" :
                      item.status === 'Remedial' ? "bg-error-container/20 text-error border-error/20" :
                      "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button 
                        onClick={() => {
                          setInputData({ ...inputData, student_id: item.id });
                          setIsInputModalOpen(true);
                        }}
                        className="p-2 text-primary hover:bg-primary-fixed/50 rounded-lg transition-colors" 
                        title="Input Nilai"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-outline hover:bg-surface-container-high rounded-lg transition-colors" title="History">
                        <History className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Finalisasi Nilai */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface">Finalisasi Nilai Satu Kelas</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="finalizeForm" onSubmit={handleFinalize} className="space-y-4">
                <div className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-outline uppercase">Kelas</span>
                    <span className="text-sm font-bold text-on-surface">{classes.find(c => c.id === selectedClass)?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-outline uppercase">Mata Pelajaran</span>
                    <span className="text-sm font-bold text-on-surface">{subjects.find(s => s.id === selectedSubject)?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-outline uppercase">Total Siswa</span>
                    <span className="text-sm font-bold text-primary">{students.length} Siswa</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">Semester</label>
                  <select required value={formData.semester} onChange={e => setFormData({...formData, semester: Number(e.target.value)})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none font-semibold">
                    <option value={1}>1 (Ganjil)</option>
                    <option value={2}>2 (Genap)</option>
                  </select>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-[11px] font-medium text-primary leading-relaxed">
                    Peringatan: Finalisasi akan memproses seluruh nilai komponen (Tugas, Quiz, Ujian Awal, Ujian Akhir, Presensi) menjadi nilai rapor akhir untuk <span className="font-bold underline">seluruh siswa</span> di kelas ini secara otomatis.
                  </p>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors">Batal</button>
              <button type="submit" form="finalizeForm" disabled={isSubmitting || !selectedClass || !selectedSubject} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Verified className="w-4 h-4" />}
                <span>Proses Finalisasi Kelas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Presensi */}
      {presensiModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Detail Presensi - {presensiModal.studentName}
              </h3>
              <button onClick={() => setPresensiModal({ ...presensiModal, open: false })} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {presensiModal.loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
              ) : presensiModal.data ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { label: 'Total', value: presensiModal.data.total, color: 'text-on-surface' },
                      { label: 'Hadir', value: presensiModal.data.hadir, color: 'text-emerald-600' },
                      { label: 'Sakit', value: presensiModal.data.sakit, color: 'text-amber-600' },
                      { label: 'Izin', value: presensiModal.data.izin, color: 'text-blue-600' },
                      { label: 'Alfa', value: presensiModal.data.alfa, color: 'text-red-600' },
                    ].map(item => (
                      <div key={item.label} className="bg-surface-container rounded-xl p-3 text-center border border-outline-variant/50">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{item.label}</p>
                        <p className={cn("text-xl font-black mt-1", item.color)}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Presensi Score */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-on-surface">Skor Presensi</span>
                    <span className="text-2xl font-black text-primary">{presensiModal.data.presensi_score}</span>
                  </div>

                  {/* Attendance Records */}
                  <div>
                    <h4 className="font-bold text-sm text-on-surface mb-3">Riwayat Presensi</h4>
                    {presensiModal.data.records?.length > 0 ? (
                      <div className="space-y-2">
                        {presensiModal.data.records.map((rec: any) => (
                          <div key={rec.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-outline-variant/50">
                            <div className={cn(
                              "w-2 h-2 rounded-full flex-shrink-0",
                              rec.status === 'hadir' ? 'bg-emerald-500' :
                              rec.status === 'sakit' ? 'bg-amber-500' :
                              rec.status === 'izin' ? 'bg-blue-500' : 'bg-red-500'
                            )} />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-on-surface">{rec.schedule?.subject?.name}</p>
                              <p className="text-[10px] text-on-surface-variant font-medium">
                                {new Date(rec.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                {' • '}{rec.schedule?.class?.name}
                              </p>
                            </div>
                            <span className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-bold",
                              rec.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' :
                              rec.status === 'sakit' ? 'bg-amber-100 text-amber-700' :
                              rec.status === 'izin' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            )}>
                              {rec.status.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-on-surface-variant text-center py-4">Belum ada data presensi.</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <a
                      href={`/academic?tab=self-attendance`}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container text-on-surface font-semibold text-sm hover:bg-surface-container-high transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      Lihat di Akademik
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-center py-10 text-on-surface-variant">Gagal memuat data presensi.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Input Nilai Manual */}
      {isInputModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2"><Edit className="w-5 h-5 text-primary" />Input Nilai Manual</h3>
              <button onClick={() => setIsInputModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="inputGradeForm" onSubmit={handleInputGrade} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">Pilih Siswa</label>
                  <select required value={inputData.student_id} onChange={e => setInputData({...inputData, student_id: e.target.value})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="" disabled>-- Pilih Siswa --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.nis})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Tipe Nilai</label>
                    <select required value={inputData.type} onChange={e => setInputData({...inputData, type: e.target.value})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="assignment">Tugas</option>
                      <option value="quiz">Quiz</option>
                      <option value="ujian_awal">Ujian Awal</option>
                      <option value="ujian_akhir">Ujian Akhir</option>
                    </select>
                    <p className="text-[10px] text-on-surface-variant mt-1">Presensi dihitung otomatis dari data kehadiran</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Bobot (0-1)</label>
                    <input 
                      type="number" step="0.1" min="0" max="1" required 
                      value={inputData.weight} 
                      onChange={e => setInputData({...inputData, weight: e.target.value})}
                      className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">Nilai (0-100)</label>
                  <input 
                    type="number" min="0" max="100" required 
                    value={inputData.score} 
                    onChange={e => setInputData({...inputData, score: e.target.value})}
                    placeholder="Masukkan nilai siswa..."
                    className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <p className="text-[11px] font-medium text-primary leading-relaxed">
                    Catatan: Nilai yang diinput akan diakumulasikan dalam perhitungan nilai akhir saat proses finalisasi dilakukan.
                  </p>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
              <button type="button" onClick={() => setIsInputModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors">Batal</button>
              <button type="submit" form="inputGradeForm" disabled={isSubmitting || !inputData.student_id} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Simpan Nilai</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GradingPage() {
  const { canManageGrades, user } = useUserRole();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return canManageGrades ? <TeacherGradingView /> : <StudentGradingView user={user} />;
}
