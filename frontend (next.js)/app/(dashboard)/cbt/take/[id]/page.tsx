'use client';

import React, { useEffect, useState, useCallback, useRef, use } from 'react';
import { apiRequest } from '@/lib/api';
import { Loader2, AlertCircle, Clock, Send, CheckCircle2, Lock, ArrowLeft, ArrowRight, Monitor, Shield, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, useParams } from 'next/navigation';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TakeExamPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [exam, setExam] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [showWarningOverlay, setShowWarningOverlay] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');
  const WARNING_LIMIT = exam?.violation_limit || 3;
  const warningsRef = useRef(0);

  useEffect(() => {
    const t = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    if (t && id) {
      apiRequest(`/exams/${id}`).then(d => setExam(d)).catch(e => setError(e.message)).finally(() => setIsLoading(false));
    }
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (!session || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); forceSubmitExam(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  // Anti-cheat listeners
  useEffect(() => {
    if (!session || timeLeft <= 0 || isDisqualified || isSubmitting) return;

    const onVisibility = () => { if (document.hidden) handleViolation('tab_switch', 'Pindah tab terdeteksi!'); };
    const onBlur = () => handleViolation('window_blur', 'Jendela ujian kehilangan fokus!');
    const onFullscreen = () => { if (!document.fullscreenElement) handleViolation('exit_fullscreen', 'Keluar dari mode fullscreen!'); };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || (e.ctrlKey && e.key === 'u')) {
        e.preventDefault(); handleViolation('devtools', 'Percobaan membuka DevTools!');
      }
    };
    const onContext = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreen);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('contextmenu', onContext);
    return () => {
      window.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreen);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('contextmenu', onContext);
    };
  }, [session, timeLeft, isDisqualified, isSubmitting]);

  const handleViolation = useCallback(async (type: string, message: string) => {
    if (!session || isSubmitting) return;
    const newW = warningsRef.current + 1;
    warningsRef.current = newW;
    setWarnings(newW);

    try { await apiRequest(`/exams/sessions/${session.id}/log`, { method: 'POST', body: JSON.stringify({ type, description: message }) }); } catch {}

    if (newW >= WARNING_LIMIT) {
      setIsDisqualified(true);
      forceSubmitExam();
    } else {
      setWarningMsg(`PERINGATAN ${newW}/${WARNING_LIMIT}: ${message}`);
      setShowWarningOverlay(true);
      setTimeout(() => setShowWarningOverlay(false), 4000);
      if (type === 'exit_fullscreen') { try { await document.documentElement.requestFullscreen(); } catch {} }
    }
  }, [session, isSubmitting]);

  const forceSubmitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await apiRequest(`/exams/sessions/${session.id}/submit`, { method: 'POST' });
    } catch {}
    if (document.fullscreenElement) try { await document.exitFullscreen(); } catch {}
  };

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true); setError('');
    try {
      try { await document.documentElement.requestFullscreen(); } catch {}
      // 1. Start exam session dengan token
      const sess = await apiRequest(`/exams/${id}/start`, { method: 'POST', body: JSON.stringify({ token, device_id: navigator.userAgent }) });
      setSession(sess);
      
      // 2. Fetch questions dari session (endpoint baru untuk siswa)
      const qs = await apiRequest(`/exams/sessions/${sess.id}/questions`);
      setQuestions(shuffleArray(qs).map((q: any) => ({ ...q, options: q.options ? shuffleArray(q.options) : [] })));
      
      const dur = exam.duration * 60;
      const elapsed = (Date.now() - new Date(sess.start_time).getTime()) / 1000;
      setTimeLeft(Math.max(0, Math.floor(dur - elapsed)));
      if (sess.warning_count) { warningsRef.current = sess.warning_count; setWarnings(sess.warning_count); }
      if (sess.answers) {
        const loaded: Record<string, string> = {};
        sess.answers.forEach((a: any) => { loaded[a.question_id] = a.answer; });
        setAnswers(loaded);
      }
    } catch (err: any) { setError(err.message); }
    finally { setIsStarting(false); }
  };

  const handleSelectOption = async (qId: string, text: string) => {
    setAnswers(prev => ({ ...prev, [qId]: text }));
    try { await apiRequest(`/exams/sessions/${session.id}/answers`, { method: 'POST', body: JSON.stringify({ question_id: qId, answer: text }) }); } catch {}
  };

  const handleEssayAnswer = (qId: string, text: string) => {
    setAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const saveEssay = async (qId: string, text: string) => {
    if (!text) return;
    try { await apiRequest(`/exams/sessions/${session.id}/answers`, { method: 'POST', body: JSON.stringify({ question_id: qId, answer: text }) }); } catch {}
  };

  const handleSubmitExam = async () => {
    if (timeLeft > 0 && !confirm('Yakin ingin mengakhiri ujian sekarang?')) return;
    setIsSubmitting(true);
    try {
      const result = await apiRequest(`/exams/sessions/${session.id}/submit`, { method: 'POST' });
      if (document.fullscreenElement) try { await document.exitFullscreen(); } catch {}
      alert(`Ujian berhasil dikumpulkan!\nNilai: ${result.score?.toFixed(1)} (${result.total_correct}/${result.total_questions} benar)`);
      router.push('/cbt');
    } catch (err: any) { alert('Gagal: ' + err.message); setIsSubmitting(false); }
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // --- DISQUALIFIED SCREEN ---
  if (isDisqualified) return (
    <div className="min-h-screen bg-error/5 flex items-center justify-center p-6">
      <div className="bg-surface-container-lowest border-2 border-error/30 rounded-3xl p-12 max-w-[28rem] w-full shadow-2xl text-center space-y-6">
        <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mx-auto"><XCircle className="w-14 h-14 text-error" /></div>
        <h2 className="text-2xl font-black text-error">DISKUALIFIKASI</h2>
        <p className="text-on-surface-variant font-medium leading-relaxed">Anda telah melanggar aturan ujian sebanyak <strong className="text-error">{WARNING_LIMIT} kali</strong>. Ujian telah dikumpulkan otomatis dan dilaporkan ke pengawas.</p>
        <button onClick={() => router.push('/cbt')} className="w-full bg-error text-on-error py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-error/20">Kembali ke Dashboard</button>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-on-surface-variant font-bold uppercase tracking-widest text-sm">Menyiapkan Lembar Ujian...</p>
    </div>
  );

  // --- TOKEN ENTRY SCREEN ---
  if (!session) return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-10 max-w-[28rem] w-full shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4"><Lock className="w-8 h-8" /></div>
          <h2 className="text-2xl font-black text-on-surface tracking-tight">Konfirmasi Token</h2>
          <p className="text-sm font-medium text-on-surface-variant">Masukkan token ujian untuk memulai <strong>{exam?.title}</strong>.</p>
        </div>
        {error && (
          <div className="bg-error-container/20 border border-error/20 p-4 rounded-xl flex gap-3 text-error text-sm font-bold">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /><p>{error}</p>
          </div>
        )}
        <form onSubmit={handleStartExam} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">Token Ujian</label>
            <input type="text" required value={token} onChange={e => setToken(e.target.value.toUpperCase())} placeholder="ABCDEF"
              className="w-full px-6 py-4 bg-surface-container border-2 border-outline-variant rounded-2xl text-center text-2xl font-black text-primary tracking-[0.3em] focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" />
          </div>
          <div className="p-4 bg-surface-container-high rounded-2xl space-y-2">
            <div className="flex gap-3"><Shield className="w-5 h-5 text-error flex-shrink-0" /><p className="text-[10px] font-bold text-on-surface-variant uppercase leading-relaxed tracking-wider">Fitur Anti-Cheat aktif: Fullscreen, Focus Tracking, Device Lock. Batas pelanggaran: 3x.</p></div>
          </div>
          <button disabled={isStarting} className="w-full bg-primary text-on-primary py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
            {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Mulai Ujian Sekarang
          </button>
        </form>
      </div>
    </div>
  );

  // --- EXAM TAKING UI ---
  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-surface flex flex-col select-none">
      {/* Warning Overlay */}
      {showWarningOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-error/20 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-none">
          <div className="bg-error text-on-error px-10 py-8 rounded-3xl shadow-2xl text-center max-w-[28rem] pointer-events-auto">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-black">{warningMsg}</p>
            <p className="text-sm font-bold mt-3 opacity-80">Jika mencapai {WARNING_LIMIT}x, ujian otomatis dikumpulkan!</p>
          </div>
        </div>
      )}

      {/* Exam Header */}
      <header className="bg-surface-container-lowest border-b border-outline-variant px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div><h1 className="text-base font-black text-on-surface">{exam.title}</h1><p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{exam.subject?.name}</p></div>
        </div>
        <div className="flex items-center gap-4">
          {/* Warning Badge */}
          <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border",
            warnings >= 2 ? "bg-error/10 text-error border-error/20 animate-pulse" : warnings >= 1 ? "bg-primary/10 text-primary border-primary/20" : "bg-surface-container-high text-on-surface-variant border-outline-variant"
          )}>
            <Shield className="w-3.5 h-3.5" />
            <span>⚠️ {warnings}/{WARNING_LIMIT}</span>
          </div>
          {/* Timer */}
          <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-mono text-lg font-black",
            timeLeft < 300 ? "bg-error-container/20 text-error border-error/20 animate-pulse" : "bg-surface-container-high text-on-surface border-outline-variant"
          )}>
            <Clock className="w-4 h-4" />{formatTime(timeLeft)}
          </div>
          <button onClick={handleSubmitExam} disabled={isSubmitting}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-95 shadow-lg shadow-primary/20 flex items-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Kumpulkan
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-12 gap-8">
        {/* Question Nav */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
            <h3 className="text-[10px] font-black text-outline uppercase tracking-[0.2em] mb-4">Navigasi Soal</h3>
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
              {questions.map((q, idx) => (
                <button key={q.id} onClick={() => setCurrentIdx(idx)}
                  className={cn("w-full aspect-square rounded-lg flex items-center justify-center text-xs font-black transition-all",
                    currentIdx === idx ? "bg-primary text-on-primary ring-4 ring-primary/20 scale-110" :
                    answers[q.id] ? "bg-secondary text-on-secondary" : "bg-surface-container-high text-on-surface-variant hover:bg-outline-variant/30"
                  )}>{idx + 1}</button>
              ))}
            </div>
          </div>
          <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Progres</span>
              <span className="text-xs font-black text-primary">{questions.length > 0 ? Math.round((Object.keys(answers).length / questions.length) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0}%` }} />
            </div>
            <p className="text-[10px] font-bold text-outline mt-2">{Object.keys(answers).length}/{questions.length} terjawab</p>
          </div>
        </aside>

        {/* Question Content */}
        <section className="col-span-12 lg:col-span-9">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <span className="px-4 py-1.5 rounded-full bg-surface-container-high text-[10px] font-black uppercase tracking-widest text-on-surface-variant border border-outline-variant/30">
                Soal {currentIdx + 1} / {questions.length}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-outline">{currentQ?.type === 'mcq' ? 'Pilihan Ganda' : 'Essay'}</span>
            </div>

            <div className="flex-1 space-y-8">
              <h2 className="text-lg font-bold text-on-surface leading-relaxed whitespace-pre-wrap">{currentQ?.question_text}</h2>

              {currentQ?.type === 'mcq' ? (
                <div className="grid grid-cols-1 gap-3">
                  {currentQ?.options?.map((opt: any, idx: number) => (
                    <button key={opt.id} onClick={() => handleSelectOption(currentQ.id, opt.option_text)}
                      className={cn("w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all group",
                        answers[currentQ.id] === opt.option_text ? "bg-primary/5 border-primary ring-2 ring-primary/10" : "bg-surface border-outline-variant/50 hover:border-outline-variant hover:bg-surface-container-low"
                      )}>
                      <span className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black",
                        answers[currentQ.id] === opt.option_text ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "bg-surface-container-high text-outline"
                      )}>{String.fromCharCode(65 + idx)}</span>
                      <span className={cn("text-sm font-semibold", answers[currentQ.id] === opt.option_text ? "text-primary" : "text-on-surface-variant")}>{opt.option_text}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea value={answers[currentQ?.id] || ''} onChange={e => handleEssayAnswer(currentQ.id, e.target.value)} onBlur={(e) => saveEssay(currentQ.id, e.target.value)}
                    placeholder="Tulis jawaban essay Anda di sini..." rows={8}
                    className="w-full px-5 py-4 bg-surface border-2 border-outline-variant rounded-2xl text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none resize-none font-medium" />
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Jawaban akan tersimpan otomatis saat Anda berpindah soal.</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-outline-variant/30">
              <button disabled={currentIdx === 0} onClick={() => { if (currentQ?.type === 'essay') saveEssay(currentQ.id, answers[currentQ.id]); setCurrentIdx(p => p - 1); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant font-bold text-sm text-on-surface-variant hover:bg-surface-container disabled:opacity-30">
                <ArrowLeft className="w-4 h-4" /> Sebelumnya
              </button>
              {currentIdx < questions.length - 1 ? (
                <button onClick={() => { if (currentQ?.type === 'essay') saveEssay(currentQ.id, answers[currentQ.id]); setCurrentIdx(p => p + 1); }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-surface-container-high font-bold text-sm text-on-surface hover:bg-outline-variant/30 shadow-sm">
                  Selanjutnya <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmitExam}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-on-secondary font-bold text-sm hover:opacity-95 shadow-lg shadow-secondary/20">
                  <Send className="w-4 h-4" /> Selesai & Kumpulkan
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
