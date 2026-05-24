'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { 
  Users, Key, AlertTriangle, Plus, FolderSearch, Search, 
  MoreVertical, Activity, X, Loader2, ClipboardList, Play,
  Trash2, Eye, Shield, BookOpen, Timer, Monitor, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserFromToken } from '@/lib/utils';
import Link from 'next/link';
import { useUserRole } from '@/lib/useUserRole';
import { useLockBodyScroll } from '@/lib/useLockBodyScroll';

export default function CBTPage() {
  const { canManageExams } = useUserRole();
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  useLockBodyScroll(!!deleteTarget);
  const [exams, setExams] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Master data
  const [subjects, setSubjects] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [questionBanks, setQuestionBanks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'quiz',
    subject_id: '',
    major_id: '',
    duration: 120,
    token: '',
    start_time: '',
    end_time: '',
    question_bank_ids: [] as string[]
  });

  const fetchExams = async () => {
    try {
      const query = searchQuery ? `&search=${searchQuery}` : '';
      const response = await apiRequest(`/exams?limit=50${query}`);
      let examsData = response.data || [];
      
      // Filter untuk siswa: hanya yang sedang active dan sesuai major mereka
      const user = getUserFromToken();
      if (user?.role === 'Siswa' || user?.role === 'Orang Tua') {
        const now = new Date();
        examsData = examsData.filter((exam: any) => {
          const startTime = new Date(exam.start_time);
          const endTime = new Date(exam.end_time);
          // Hanya tampilkan ujian yang sedang berlangsung
          return startTime <= now && endTime >= now;
        });
      }
      
      setExams(examsData);
    } catch (err) {
      console.error('Failed to fetch exams', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiRequest('/exams/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch cbt stats', err);
    }
  };

  const fetchViolations = async () => {
    try {
      const data = await apiRequest('/exams/violations?limit=5');
      setViolations(data || []);
    } catch (err) {
      console.error('Failed to fetch violations', err);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [subRes, majRes, qbRes] = await Promise.all([
        apiRequest('/subjects?limit=100'),
        apiRequest('/majors?limit=100'),
        apiRequest('/question-banks?limit=100')
      ]);
      setSubjects(subRes.data || []);
      setMajors(majRes.data || []);
      setQuestionBanks(qbRes.data || []);
    } catch (err) {
      console.error('Failed to fetch master data', err);
    }
  };

  useEffect(() => {
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    if (token) {
      fetchMasterData();
      fetchStats();
      fetchViolations();
    }
  }, []);

  useEffect(() => {
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    if (token) {
      const timer = setTimeout(() => fetchExams(), 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for(let i=0; i<6; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
    return token;
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject_id) {
      alert('Pilih Mata Pelajaran terlebih dahulu.'); return;
    }
    if (!formData.major_id) {
      alert('Pilih Jurusan terlebih dahulu.'); return;
    }
    if (!formData.start_time || !formData.end_time) {
      alert('Waktu mulai dan selesai harus diisi.'); return;
    }

    setIsSubmitting(true);
    try {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
         throw new Error("Format tanggal tidak valid.");
      }

      if (end <= start) {
         throw new Error("Waktu selesai harus lebih besar dari waktu mulai.");
      }

      const payload: any = {
        title: formData.title,
        type: formData.type,
        subject_id: formData.subject_id,
        major_id: formData.major_id,
        duration: Number(formData.duration),
        token: formData.token,
        start_time: start.toISOString(),
        end_time: end.toISOString()
      };
      const createdExam = await apiRequest('/exams', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      // If a question bank is selected, import its questions
      if (formData.question_bank_ids.length > 0) {
         await apiRequest(`/question-banks/import-to-exam/${createdExam.id}`, {
            method: 'POST',
            body: JSON.stringify({ question_bank_ids: formData.question_bank_ids })
         });
      }

      setIsModalOpen(false);
      fetchExams();
      fetchStats();
      setFormData({ title: '', type: 'quiz', subject_id: '', major_id: '', duration: 120, token: '', start_time: '', end_time: '', question_bank_ids: [] });
    } catch (err: any) {
      alert('Gagal membuat ujian: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/exams/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      fetchExams();
      fetchStats();
    } catch (err: any) {
      alert('Gagal menghapus ujian: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getExamStatus = (exam: any) => {
    const now = new Date();
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);
    if (now < start) return { label: 'Mendatang', color: 'bg-primary-container/20 text-primary border-primary/20' };
    if (now >= start && now <= end) return { label: 'Aktif', color: 'bg-secondary-container/20 text-secondary border-secondary/20' };
    return { label: 'Selesai', color: 'bg-outline-variant/20 text-on-surface-variant border-outline-variant' };
  };

  const formatViolationType = (type: string) => {
    const map: Record<string, string> = {
      tab_switch: '🔄 Pindah Tab',
      window_blur: '👁️ Kehilangan Fokus',
      exit_fullscreen: '🖥️ Keluar Fullscreen',
      auto_submit: '⛔ Auto Submit',
      warning: '⚠️ Peringatan',
    };
    return map[type] || type;
  };

  const timeAgo = (date: string) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff/60)}m lalu`;
    if (diff < 86400) return `${Math.floor(diff/3600)}j lalu`;
    return `${Math.floor(diff/86400)}h lalu`;
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Modul Ujian Online (CBT)</h2>
          <p className="text-on-surface-variant font-medium mt-1">Kelola bank soal, jadwal ujian, dan pantau pelaksanaan secara real-time.</p>
        </div>
        {canManageExams && (
        <div className="flex gap-3 flex-wrap">
          <Link 
            href="/cbt/question-banks"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-primary/20 text-primary text-sm font-bold hover:bg-primary/5 transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Bank Soal</span>
          </Link>
          <button 
            onClick={() => {
              setFormData({...formData, token: generateToken()});
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Ujian Baru</span>
          </button>
        </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Ujian" value={stats?.totalExams ?? '...'} icon={<ClipboardList className="w-5 h-5" />} color="primary" />
        <StatCard title="Ujian Aktif" value={stats?.activeExams ?? '...'} icon={<Activity className="w-5 h-5" />} color="secondary" pulse={stats?.activeExams > 0} />
        <StatCard title="Sesi Berlangsung" value={stats?.ongoingSessions ?? '...'} icon={<Users className="w-5 h-5" />} color="tertiary" pulse={stats?.ongoingSessions > 0} />
        <StatCard title="Pelanggaran Hari Ini" value={stats?.todayViolations ?? '...'} icon={<AlertTriangle className="w-5 h-5" />} color="error" />
        <StatCard title="Total Bank Soal" value={stats?.totalQuestions ?? '...'} icon={<BookOpen className="w-5 h-5" />} color="primary" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Exam Table */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-low/30">
            <h3 className="text-lg font-bold text-on-surface">Daftar Ujian</h3>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input 
                  type="text" 
                  placeholder="Cari ujian..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-surface-container placeholder:text-outline" 
                />
              </div>
              <button onClick={() => { fetchExams(); fetchStats(); fetchViolations(); }} className="p-2.5 border border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant">
                  <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Judul Ujian</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Mapel</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Soal</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Waktu</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Status</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-on-surface-variant">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : exams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-on-surface-variant font-medium">
                      Belum ada data ujian. Klik "Buat Ujian Baru" untuk memulai.
                    </td>
                  </tr>
                ) : (
                  exams.map((exam) => {
                    const status = getExamStatus(exam);
                    return (
                      <tr key={exam.id} className="group hover:bg-surface-container-low/30 transition-colors even:bg-surface-container/20 border-b border-surface-container-low/50">
                        <td className="py-4 px-6">
                          <p className="font-bold text-on-surface">{exam.title}</p>
                          <p className="text-[10px] font-bold text-on-surface-variant mt-1 uppercase tracking-wider">{exam.major?.name} • <span className="font-mono text-primary">{exam.token}</span></p>
                        </td>
                        <td className="py-4 px-6 font-semibold text-on-surface-variant">{exam.subject?.name}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-on-surface">{exam._count?.questions || 0}</span>
                            <span className="text-[10px] text-outline font-bold">soal</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-on-surface text-xs">{new Date(exam.start_time).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-[10px] font-medium text-outline mt-0.5">{exam.duration} menit</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider", status.color)}>
                            {status.label === 'Aktif' && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-1">
                            {canManageExams && (
                            <Link href={`/cbt/${exam.id}`} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Bank Soal & Detail">
                              <Eye className="w-4 h-4" />
                            </Link>
                            )}
                            {status.label === 'Aktif' && (
                              <Link href={`/cbt/take/${exam.id}`} className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors" title="Mulai Ujian">
                                <Play className="w-4 h-4" />
                              </Link>
                            )}
                            {canManageExams && (
                            <button onClick={() => setDeleteTarget(exam)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Violation Feed */}
        <div className="col-span-12 lg:col-span-4 bg-error-container/30 border border-error/10 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-5">
            <h3 className="text-sm font-bold text-on-error-container uppercase tracking-wider">Pelanggaran Terbaru</h3>
            <div className="p-2 bg-error/10 rounded-full text-error animate-pulse">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px]">
            {violations.length === 0 ? (
              <div className="text-center py-8 text-on-error-container/50 font-medium text-sm">
                Tidak ada pelanggaran tercatat.
              </div>
            ) : (
              violations.map((v, i) => (
                <div key={i} className="bg-white/50 p-3 rounded-xl border border-error/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-on-error-container">
                        {v.session?.student?.full_name || v.session?.applicant?.full_name || 'Unknown'}
                      </p>
                      <p className="text-[10px] font-bold text-on-error-container/60 mt-0.5">
                        {v.session?.exam?.title || '-'}
                        {v.session?.student?.class?.name ? ` • ${v.session.student.class.name}` : ''}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-error uppercase whitespace-nowrap">{timeAgo(v.timestamp)}</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-on-error-container/80">
                    {formatViolationType(v.type)}
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={fetchViolations}
            className="w-full mt-4 bg-white py-2.5 rounded-xl border border-error/20 text-xs font-bold text-on-error-container hover:bg-error-container/20 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Create Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-surface-container-lowest w-full sm:max-w-[36rem] rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Buat Ujian Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="examForm" onSubmit={handleCreateExam} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Judul Ujian</label>
                    <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Contoh: UTS Matematika Kelas XI" className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tipe Ujian</label>
                    <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                      <option value="quiz">Kuis (Harian)</option>
                      <option value="ujian_awal">Ujian Tengah Semester</option>
                      <option value="ujian_akhir">Ujian Akhir Semester</option>
                      <option value="assignment">Tugas Mandiri</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Mata Pelajaran</label>
                    <select required value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                      <option value="">Pilih Mapel</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Jurusan</label>
                    <select required value={formData.major_id} onChange={e => setFormData({...formData, major_id: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                      <option value="">Pilih Jurusan</option>
                      {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Waktu Mulai</label>
                    <input type="datetime-local" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Waktu Selesai</label>
                    <input type="datetime-local" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Gunakan Bank Soal (Opsional) {formData.question_bank_ids.length > 0 && <span className="text-primary">— {formData.question_bank_ids.length} dipilih</span>}</label>
                  <div className="max-h-48 overflow-y-auto border border-outline-variant rounded-xl p-2 space-y-1 bg-surface">
                    {questionBanks.filter(qb => 
                      (!formData.subject_id || qb.subject_id === formData.subject_id) && 
                      (!formData.major_id || qb.major_id === formData.major_id)
                    ).length === 0 ? (
                      <p className="text-xs text-on-surface-variant text-center py-3 font-medium">Tidak ada bank soal untuk mapel/jurusan ini</p>
                    ) : (
                      questionBanks.filter(qb => 
                        (!formData.subject_id || qb.subject_id === formData.subject_id) && 
                        (!formData.major_id || qb.major_id === formData.major_id)
                      ).map(qb => (
                        <label key={qb.id} className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                          formData.question_bank_ids.includes(qb.id) ? "bg-primary/10 text-primary" : "hover:bg-surface-container text-on-surface"
                        )}>
                          <input type="checkbox" checked={formData.question_bank_ids.includes(qb.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setFormData({...formData, question_bank_ids: [...formData.question_bank_ids, qb.id]});
                              } else {
                                setFormData({...formData, question_bank_ids: formData.question_bank_ids.filter(id => id !== qb.id)});
                              }
                            }}
                            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{qb.title}</p>
                            <p className="text-[10px] text-outline font-medium truncate">{qb.type === 'mcq' ? 'Pilihan Ganda' : 'Essai'} • {qb.difficulty}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Durasi (Menit)</label>
                    <input type="number" required value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Token Ujian</label>
                    <div className="flex gap-2">
                      <input type="text" readOnly value={formData.token} className="w-full px-4 py-2.5 bg-surface-container font-mono border border-outline-variant rounded-xl text-sm font-bold text-primary outline-none" />
                      <button type="button" onClick={() => setFormData({...formData, token: generateToken()})} className="px-3 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all" title="Regenerate">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-high rounded-xl flex gap-3 mt-2">
                  <Monitor className="w-5 h-5 text-outline-variant flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase leading-relaxed tracking-wider">
                    Anti-cheat aktif: Focus Tracking, Fullscreen Mode, Device Locking, Auto-Submit (3x pelanggaran).
                  </p>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex flex-col sm:flex-row justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all text-center">Batal</button>
              <button type="submit" form="examForm" disabled={isSubmitting} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Simpan Ujian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-surface-container-lowest w-full sm:max-w-[28rem] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-6 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto text-error shadow-inner">
              <Trash2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-on-surface tracking-tight">Hapus Ujian?</h3>
              <p className="text-on-surface-variant font-medium leading-relaxed">
                Anda akan menghapus ujian <span className="text-on-surface font-bold">"{deleteTarget.title}"</span> beserta semua soal, sesi, dan nilai terkait. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button autoFocus onClick={() => setDeleteTarget(null)} className="flex-1 px-6 py-3 rounded-xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all">Batal</button>
              <button onClick={handleDeleteExam} disabled={isDeleting} className="flex-1 px-6 py-3 rounded-xl bg-error text-on-error font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-error/20">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Hapus Ujian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, pulse }: any) {
  const colorClasses: any = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    tertiary: "bg-tertiary/10 text-tertiary border-tertiary/20",
    error: "bg-error/10 text-error border-error/20",
  };

  return (
    <div className={cn("p-5 rounded-2xl border flex items-center gap-4 bg-surface-container-lowest shadow-sm relative overflow-hidden", colorClasses[color])}>
      <div className={cn("p-2.5 rounded-xl bg-current/10", pulse && "animate-pulse")}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{title}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}
