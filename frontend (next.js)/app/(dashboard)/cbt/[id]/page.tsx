'use client';

import React, { useEffect, useState, use } from 'react';
import { apiRequest } from '@/lib/api';
import { 
  Plus, Trash2, ChevronLeft, Save, CheckSquare, Type, Loader2,
  AlertCircle, GripVertical, Activity, Users, Eye, Shield, BookOpen,
  RefreshCw, StopCircle, Clock, AlertTriangle, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [exam, setExam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'soal' | 'monitoring'>('soal');

  // Monitoring
  const [monitoring, setMonitoring] = useState<any>(null);
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState(false);

  // Evaluation
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [evalDetail, setEvalDetail] = useState<any>(null);
  const [isLoadingEval, setIsLoadingEval] = useState(false);
  const [evalScores, setEvalScores] = useState<Record<string, number>>({});

  // Question Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    type: 'mcq',
    question_text: '',
    difficulty: 'medium',
    options: [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
    ]
  });

  const fetchExam = async () => {
    try {
      const response = await apiRequest(`/exams/${id}`);
      setExam(response);
    } catch (err) {
      console.error('Failed to fetch exam', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMonitoring = async () => {
    setIsLoadingMonitoring(true);
    try {
      const data = await apiRequest(`/exams/${id}/monitoring`);
      setMonitoring(data);
    } catch (err) {
      console.error('Failed to fetch monitoring', err);
    } finally {
      setIsLoadingMonitoring(false);
    }
  };

  useEffect(() => {
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    if (token && id) fetchExam();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'monitoring') {
      fetchMonitoring();
      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchMonitoring, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest(`/exams/${id}/questions`, {
        method: 'POST',
        body: JSON.stringify(newQuestion)
      });
      fetchExam();
      setShowAddForm(false);
      setNewQuestion({
        type: 'mcq', question_text: '', difficulty: 'medium',
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ]
      });
    } catch (err: any) {
      alert('Gagal menambah soal: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Hapus soal ini?')) return;
    try {
      await apiRequest(`/exams/questions/${questionId}`, { method: 'DELETE' });
      fetchExam();
    } catch (err: any) {
      alert('Gagal menghapus soal: ' + err.message);
    }
  };

  const handleForceSubmit = async (sessionId: string) => {
    if (!confirm('Paksa kumpulkan ujian siswa ini? Ujian akan dihitung dan status diblokir.')) return;
    try {
      await apiRequest(`/exams/sessions/${sessionId}/force-submit`, { method: 'POST' });
      fetchMonitoring();
    } catch (err: any) {
      alert('Gagal: ' + err.message);
    }
  };

  const handleOpenEval = async (session: any) => {
    setSelectedSession(session);
    setIsEvalModalOpen(true);
    setIsLoadingEval(true);
    try {
      const data = await apiRequest(`/exams/sessions/${session.id}/answers-detail`);
      setEvalDetail(data);
      // Initialize scores from existing data
      const initialScores: Record<string, number> = {};
      data.questions.forEach((q: any) => {
        if (q.type === 'essay' && q.student_answer) {
          initialScores[q.student_answer.id] = Number(q.student_answer.score || 0);
        }
      });
      setEvalScores(initialScores);
    } catch (err) {
      console.error('Failed to fetch evaluation detail', err);
    } finally {
      setIsLoadingEval(false);
    }
  };

  const handleUpdateEssayScore = async (answerId: string) => {
    try {
      await apiRequest(`/exams/answers/${answerId}/score`, {
        method: 'PATCH',
        body: JSON.stringify({ score: Number(evalScores[answerId] || 0) })
      });
      alert('Nilai berhasil disimpan!');
    } catch (err: any) {
      alert('Gagal menyimpan nilai: ' + err.message);
    }
  };

  // Import From Question Bank
  const [isImportBankModalOpen, setIsImportBankModalOpen] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [isLoadingBank, setIsLoadingBank] = useState(false);
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);

  const fetchBankQuestions = async () => {
    setIsLoadingBank(true);
    try {
      const res = await apiRequest(`/question-banks?limit=200`);
      setBankQuestions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch bank questions', err);
    } finally {
      setIsLoadingBank(false);
    }
  };

  const handleImportFromBank = async () => {
    if (selectedBankIds.length === 0) { alert('Pilih minimal 1 soal dari bank'); return; }
    setIsSubmitting(true);
    try {
      await apiRequest(`/question-banks/import-to-exam/${id}`, {
        method: 'POST',
        body: JSON.stringify({ question_bank_ids: selectedBankIds })
      });
      setIsImportBankModalOpen(false);
      setSelectedBankIds([]);
      fetchExam();
      alert(`Berhasil mengimport ${selectedBankIds.length} soal dari Bank Soal!`);
    } catch (err: any) {
      alert('Gagal import: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-on-surface-variant font-medium">Memuat Detail Ujian...</p>
    </div>
  );

  if (!exam) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <AlertCircle className="w-10 h-10 text-error" />
      <p className="text-on-surface-variant font-medium">Ujian tidak ditemukan.</p>
      <Link href="/cbt" className="text-primary hover:underline font-bold mt-2">Kembali ke Daftar</Link>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/cbt" className="p-2 hover:bg-surface-container rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-on-surface" />
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">{exam.title}</h2>
          <p className="text-on-surface-variant font-medium mt-1 uppercase tracking-wider text-xs">
            {exam.subject?.name} • {exam.major?.name} • {exam.duration} Menit • Token: <span className="font-mono text-primary font-bold">{exam.token}</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('soal')}
          className={cn(
            "px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'soal' ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <CheckSquare className="w-4 h-4" />
          Bank Soal ({exam.questions?.length || 0})
        </button>
        <button 
          onClick={() => setActiveTab('monitoring')}
          className={cn(
            "px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'monitoring' ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <Activity className="w-4 h-4" />
          Monitoring Sesi ({exam._count?.sessions || 0})
        </button>
      </div>

      {/* TAB: Bank Soal */}
      {activeTab === 'soal' && (
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h3 className="text-xl font-bold text-on-surface">Daftar Soal</h3>
              <div className="flex gap-2">
                <button onClick={() => { setIsImportBankModalOpen(true); fetchBankQuestions(); setSelectedBankIds([]); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-secondary/30 text-secondary text-sm font-bold hover:bg-secondary/5 transition-colors active:scale-95 shadow-sm">
                  <BookOpen className="w-4 h-4" /> <span className="hidden sm:inline">Import Bank Soal</span>
                </button>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95 shadow-md",
                    showAddForm ? "bg-error text-on-error" : "bg-primary text-on-primary"
                  )}
                >
                  {showAddForm ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{showAddForm ? 'Batal' : 'Tambah Soal'}</span>
                </button>
              </div>
            </div>

            {showAddForm && (
              <div className="bg-surface-container-lowest border-2 border-primary/20 rounded-2xl p-8 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
                <form onSubmit={handleAddQuestion} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tipe Soal</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setNewQuestion({...newQuestion, type: 'mcq'})}
                          className={cn("flex-1 py-2.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all",
                            newQuestion.type === 'mcq' ? "bg-primary text-on-primary border-primary" : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container"
                          )}>
                          <CheckSquare className="w-4 h-4" /> Pilihan Ganda
                        </button>
                        <button type="button" onClick={() => setNewQuestion({...newQuestion, type: 'essay'})}
                          className={cn("flex-1 py-2.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all",
                            newQuestion.type === 'essay' ? "bg-primary text-on-primary border-primary" : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container"
                          )}>
                          <Type className="w-4 h-4" /> Essay
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tingkat Kesulitan</label>
                      <select value={newQuestion.difficulty} onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                        className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none">
                        <option value="easy">Mudah</option>
                        <option value="medium">Sedang</option>
                        <option value="hard">Sulit</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Teks Pertanyaan</label>
                    <textarea required value={newQuestion.question_text} onChange={e => setNewQuestion({...newQuestion, question_text: e.target.value})}
                      placeholder="Masukkan pertanyaan di sini..." rows={4}
                      className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
                  </div>

                  {newQuestion.type === 'mcq' && (
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Opsi Jawaban (Centang yang Benar)</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {newQuestion.options.map((opt, idx) => (
                          <div key={idx} className="flex gap-3">
                            <input type="checkbox" checked={opt.is_correct}
                              onChange={e => {
                                const newOpts = [...newQuestion.options];
                                newOpts[idx].is_correct = e.target.checked;
                                setNewQuestion({...newQuestion, options: newOpts});
                              }} className="w-5 h-5 mt-2 rounded border-outline-variant text-primary focus:ring-primary" />
                            <input type="text" required={newQuestion.type === 'mcq'} value={opt.option_text}
                              onChange={e => {
                                const newOpts = [...newQuestion.options];
                                newOpts[idx].option_text = e.target.value;
                                setNewQuestion({...newQuestion, options: newOpts});
                              }} placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                              className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button disabled={isSubmitting}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-on-primary font-bold hover:opacity-95 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      <span>Simpan Soal</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Question List */}
            <div className="space-y-4">
              {exam.questions?.length === 0 ? (
                <div className="bg-surface-container-low/30 border-2 border-dashed border-outline-variant rounded-2xl p-12 text-center">
                  <p className="text-on-surface-variant font-medium">Belum ada soal dalam ujian ini.</p>
                  <button onClick={() => setShowAddForm(true)} className="text-primary font-bold mt-2 hover:underline">Tambah soal pertama Anda</button>
                </div>
              ) : (
                exam.questions.map((q: any, idx: number) => (
                  <div key={q.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden group hover:border-primary/30 transition-all">
                    <div className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-4">
                          <div className="text-xs font-black text-outline uppercase tracking-widest mt-1">#{idx + 1}</div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border",
                                q.type === 'mcq' ? "bg-secondary-container/20 text-secondary border-secondary/10" : "bg-tertiary-container/20 text-tertiary border-tertiary/10"
                              )}>{q.type === 'mcq' ? 'Pilihan Ganda' : 'Essay'}</span>
                              <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border",
                                q.difficulty === 'easy' ? "bg-secondary-container/30 text-secondary border-secondary/10" :
                                q.difficulty === 'hard' ? "bg-error-container/20 text-error border-error/10" :
                                "bg-primary-container/20 text-primary border-primary/10"
                              )}>{q.difficulty}</span>
                            </div>
                            <p className="text-on-surface font-semibold leading-relaxed whitespace-pre-wrap">{q.question_text}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {q.type === 'mcq' && q.options && (
                        <div className="mt-6 ml-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt: any, oIdx: number) => (
                            <div key={opt.id} className={cn("p-3 rounded-xl border flex items-center gap-3 text-sm font-medium",
                              opt.is_correct ? "bg-secondary-container/20 border-secondary/30 text-secondary" : "bg-surface border-outline-variant/50 text-on-surface-variant"
                            )}>
                              <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black uppercase",
                                opt.is_correct ? "bg-secondary text-on-secondary" : "bg-outline-variant/30 text-outline"
                              )}>{String.fromCharCode(65 + oIdx)}</span>
                              {opt.option_text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-on-surface mb-6">Informasi Ujian</h3>
              <div className="space-y-5">
                <InfoItem label="Mata Pelajaran" value={exam.subject?.name} />
                <InfoItem label="Jurusan" value={exam.major?.name} />
                <InfoItem label="Durasi" value={`${exam.duration} Menit`} />
                <InfoItem label="Token Ujian" value={exam.token} isCode />
                <InfoItem label="Waktu Mulai" value={new Date(exam.start_time).toLocaleString('id-ID')} />
                <InfoItem label="Waktu Selesai" value={new Date(exam.end_time).toLocaleString('id-ID')} />
              </div>
            </div>
            <div className="bg-primary-container/20 border border-primary/10 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Anti-Cheat Aktif</h3>
              <ul className="text-xs text-on-surface-variant font-medium space-y-1.5 leading-relaxed">
                <li>✅ Focus Tracking (deteksi pindah tab)</li>
                <li>✅ Fullscreen Enforcement</li>
                <li>✅ Auto-Submit (3x pelanggaran)</li>
                <li>✅ Device Locking</li>
                <li>✅ Shuffle soal & jawaban</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Monitoring */}
      {activeTab === 'monitoring' && (
        <>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-on-surface">Monitor Sesi Ujian Real-time</h3>
            <button onClick={fetchMonitoring} disabled={isLoadingMonitoring}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-all">
              <RefreshCw className={cn("w-4 h-4", isLoadingMonitoring && "animate-spin")} />
              Refresh (Auto 10s)
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant">
                  <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Peserta</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Status</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Jawaban</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Pelanggaran</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Mulai</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoadingMonitoring && !monitoring ? (
                  <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" /></td></tr>
                ) : !monitoring?.sessions?.length ? (
                  <tr><td colSpan={6} className="text-center py-12 text-on-surface-variant font-medium">Belum ada sesi ujian untuk ujian ini.</td></tr>
                ) : (
                  monitoring.sessions.map((s: any) => {
                    const name = s.student?.full_name || s.applicant?.full_name || 'Unknown';
                    const statusConfig: any = {
                      ongoing: { label: 'Mengerjakan', icon: '🟢', color: 'bg-secondary-container/20 text-secondary border-secondary/20' },
                      submitted: { label: 'Selesai', icon: '✅', color: 'bg-outline-variant/20 text-on-surface-variant border-outline-variant' },
                      blocked: { label: 'Diblokir', icon: '🔴', color: 'bg-error-container/20 text-error border-error/20' },
                    };
                    const st = statusConfig[s.status] || statusConfig.ongoing;

                    return (
                      <tr key={s.id} className="group border-b border-surface-container-low/50 hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-on-surface">{name}</p>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">
                            {s.student?.nis || 'Calon Siswa'} {s.student?.class?.name ? `• ${s.student.class.name}` : ''}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider", st.color)}>
                            {st.icon} {st.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-on-surface">{s._count?.answers || 0}</span>
                          <span className="text-[10px] text-outline font-bold ml-1">/ {exam.questions?.length || '?'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={cn(
                            "font-bold",
                            (s._count?.logs || 0) >= 3 ? "text-error" : (s._count?.logs || 0) > 0 ? "text-primary" : "text-on-surface-variant"
                          )}>
                            {s._count?.logs || 0}x
                          </span>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant font-medium text-xs">
                          {new Date(s.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            {s.status === 'submitted' && (
                              <button onClick={() => handleOpenEval(s)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors"
                                title="Evaluasi Jawaban">
                                <CheckSquare className="w-3.5 h-3.5" />
                                Evaluasi
                              </button>
                            )}
                            {s.status === 'ongoing' && (
                              <button onClick={() => handleForceSubmit(s.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error/10 text-error text-[10px] font-bold uppercase tracking-wider hover:bg-error/20 transition-colors"
                                title="Paksa kumpulkan">
                                <StopCircle className="w-3.5 h-3.5" />
                                Force Submit
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

        {/* Evaluation Modal */}
        {isEvalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-on-surface">Evaluasi Jawaban Siswa</h3>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    {selectedSession?.student?.full_name || selectedSession?.applicant?.full_name}
                  </p>
                </div>
                <button onClick={() => setIsEvalModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                {isLoadingEval ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-xs font-bold text-outline uppercase tracking-widest">Memuat Jawaban...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {evalDetail?.questions.map((q: any, i: number) => (
                      <div key={q.id} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">Pertanyaan {i + 1} ({q.type})</span>
                          {q.type === 'mcq' && (
                            <span className={cn(
                              "px-2 py-0.5 text-[10px] font-bold rounded uppercase",
                              q.student_answer?.answer === q.options.find((o: any) => o.is_correct)?.option_text 
                                ? "bg-success-container/30 text-success" 
                                : "bg-error-container/20 text-error"
                            )}>
                              {q.student_answer?.answer === q.options.find((o: any) => o.is_correct)?.option_text ? 'Benar' : 'Salah'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-on-surface mb-3">{q.question_text}</p>
                        
                        <div className="bg-surface p-3 rounded-lg border border-outline-variant/50">
                          <label className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1 block">Jawaban Siswa:</label>
                          <p className="text-sm text-on-surface-variant font-medium italic whitespace-pre-wrap">
                            {q.student_answer?.answer || <span className="text-error font-bold not-italic">TIDAK MENJAWAB</span>}
                          </p>
                        </div>

                        {q.type === 'essay' && q.student_answer && (
                          <div className="mt-4 flex items-center gap-4 pt-4 border-t border-outline-variant/30">
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 block">Berikan Nilai (0-1):</label>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="number" step="0.1" min="0" max="1"
                                  value={evalScores[q.student_answer.id] ?? 0}
                                  onChange={(e) => setEvalScores({...evalScores, [q.student_answer.id]: Number(e.target.value)})}
                                  className="w-24 px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                <button 
                                  onClick={() => handleUpdateEssayScore(q.student_answer.id)}
                                  className="px-4 py-2 bg-primary text-on-primary text-[11px] font-bold rounded-lg hover:opacity-90 transition-opacity"
                                >
                                  Simpan
                                </button>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-outline uppercase">Maksimal</p>
                              <p className="text-lg font-bold text-on-surface">1.0</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-between items-center">
                <p className="text-xs font-bold text-on-surface-variant">
                  * MCQ dihitung otomatis 1.0 jika benar, Essay dinilai manual (0-1).
                </p>
                <button onClick={() => { setIsEvalModalOpen(false); fetchMonitoring(); }} className="px-6 py-2.5 rounded-xl bg-outline-variant/20 text-on-surface-variant text-sm font-bold hover:bg-outline-variant/30 transition-all">
                  Selesai & Tutup
                </button>
              </div>
            </div>
          </div>
        )}
        </>
      )}

      {/* ── IMPORT FROM QUESTION BANK MODAL ── */}
      {isImportBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-secondary" /> Import dari Bank Soal
              </h3>
              <button onClick={() => setIsImportBankModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingBank ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-xs font-bold text-outline uppercase tracking-widest">Memuat Bank Soal...</p>
                </div>
              ) : bankQuestions.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant font-medium">
                  Belum ada soal di Bank Soal.
                </div>
              ) : (
                <div className="space-y-2">
                  {bankQuestions.length > 0 && (
                    <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/30">
                      <label className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant cursor-pointer">
                        <input type="checkbox" checked={selectedBankIds.length === bankQuestions.length}
                          onChange={e => setSelectedBankIds(e.target.checked ? bankQuestions.map(q => q.id) : [])}
                          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                        Pilih Semua ({bankQuestions.length})
                      </label>
                    </div>
                  )}
                  {bankQuestions.map(qb => (
                    <label key={qb.id} className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                      selectedBankIds.includes(qb.id) ? "bg-secondary/5 border-secondary/30" : "bg-surface border-outline-variant/50 hover:border-outline-variant"
                    )}>
                      <input type="checkbox" checked={selectedBankIds.includes(qb.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedBankIds([...selectedBankIds, qb.id]);
                          } else {
                            setSelectedBankIds(selectedBankIds.filter(id => id !== qb.id));
                          }
                        }}
                        className="w-4 h-4 mt-1 rounded border-outline-variant text-secondary focus:ring-secondary" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-on-surface">{qb.title}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">{qb.question_text}</p>
                        <div className="flex gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                            qb.type === 'mcq' ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary/10 text-secondary border-secondary/20"
                          )}>{qb.type === 'mcq' ? 'Pilihan Ganda' : 'Essai'}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-surface-container text-on-surface-variant border-outline-variant/30">{qb.difficulty}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-between items-center gap-3">
              <p className="text-xs text-on-surface-variant font-medium">{selectedBankIds.length} soal dipilih</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsImportBankModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all">Batal</button>
                <button type="button" onClick={handleImportFromBank} disabled={isSubmitting || selectedBankIds.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-on-secondary font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                  Import {selectedBankIds.length > 0 ? `${selectedBankIds.length} Soal` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value, isCode }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">{label}</span>
      <span className={cn("text-sm font-bold text-on-surface", isCode && "font-mono text-primary text-base")}>{value}</span>
    </div>
  );
}
