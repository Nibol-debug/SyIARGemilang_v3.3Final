'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { 
  BookOpen, Plus, Search, Trash2, Edit, Loader2, X, ChevronRight, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useUserRole } from '@/lib/useUserRole';

export default function QuestionBanksPage() {
  const { canManageExams } = useUserRole();
  const [questionBanks, setQuestionBanks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isTemplateMode, setIsTemplateMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    subject_id: '',
    major_id: '',
    type: 'mcq',
    question_text: '',
    difficulty: 'easy',
    options: [
      { option_text: '', is_correct: true },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]
  });

  const fetchQuestionBanks = async () => {
    setIsLoading(true);
    try {
      const query = searchQuery ? `&search=${searchQuery}` : '';
      const response = await apiRequest(`/question-banks?limit=50${query}`);
      setQuestionBanks(response.data || []);
    } catch (err) {
      console.error('Failed to fetch question banks', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [subRes, majRes] = await Promise.all([
        apiRequest('/subjects?limit=100'),
        apiRequest('/majors?limit=100')
      ]);
      setSubjects(subRes.data || []);
      setMajors(majRes.data || []);
    } catch (err) {
      console.error('Failed to fetch master data', err);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchQuestionBanks(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const emptyBulkQuestion = () => ({
    title: '', subject_id: formData.subject_id || '', major_id: formData.major_id || '',
    type: 'mcq', question_text: '', difficulty: 'easy',
    options: [
      { option_text: '', is_correct: true },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]
  });

  const [bulkQuestions, setBulkQuestions] = useState<any[]>([emptyBulkQuestion()]);

  const updateBulkQuestion = (index: number, field: string, value: any) => {
    const copy = [...bulkQuestions];
    copy[index] = { ...copy[index], [field]: value };
    setBulkQuestions(copy);
  };

  const updateBulkOption = (qIdx: number, oIdx: number, value: string, isCorrect: boolean) => {
    const copy = [...bulkQuestions];
    if (isCorrect) copy[qIdx].options.forEach((o: any) => o.is_correct = false);
    copy[qIdx].options[oIdx] = { option_text: value, is_correct: isCorrect || copy[qIdx].options[oIdx].is_correct };
    setBulkQuestions(copy);
  };

  const addBulkQuestion = () => {
    setBulkQuestions([...bulkQuestions, emptyBulkQuestion()]);
  };

  const removeBulkQuestion = (index: number) => {
    if (bulkQuestions.length <= 1) return;
    setBulkQuestions(bulkQuestions.filter((_, i) => i !== index));
  };

  const handleBulkSubmit = async () => {
    const valid = bulkQuestions.filter(q => q.question_text.trim());
    if (valid.length === 0) { alert('Isi minimal 1 soal'); return; }
    if (!valid[0].subject_id || !valid[0].major_id) { alert('Pilih Mapel dan Jurusan terlebih dahulu'); return; }
    setIsSubmitting(true);
    try {
      await apiRequest('/question-banks/bulk', {
        method: 'POST',
        body: JSON.stringify(valid)
      });
      setIsBulkModalOpen(false);
      setBulkQuestions([emptyBulkQuestion()]);
      fetchQuestionBanks();
      alert(`Berhasil menyimpan ${valid.length} soal ke Bank Soal!`);
    } catch (err: any) {
      alert('Gagal: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!formData.subject_id || !formData.major_id) { alert('Pilih Mapel dan Jurusan terlebih dahulu'); return; }
    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('subject_id', formData.subject_id);
      form.append('major_id', formData.major_id);
      const res = await apiRequest('/question-banks/import', { method: 'POST', body: form });
      alert(`Berhasil mengimport ${res.length} soal dari Excel!`);
      fetchQuestionBanks();
    } catch (err: any) {
      alert('Gagal import Excel: ' + err.message);
    } finally {
      setIsSubmitting(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest('/question-banks', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      fetchQuestionBanks();
      setFormData({
        title: '',
        subject_id: '',
        major_id: '',
        type: 'mcq',
        question_text: '',
        difficulty: 'easy',
        options: [
          { option_text: '', is_correct: true },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false }
        ]
      });
    } catch (err: any) {
      alert('Gagal menyimpan soal: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus soal ini dari bank?')) return;
    try {
      await apiRequest(`/question-banks/${id}`, { method: 'DELETE' });
      fetchQuestionBanks();
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const updateOption = (index: number, field: string, value: any) => {
    const newOptions = [...formData.options];
    if (field === 'is_correct') {
      newOptions.forEach(o => o.is_correct = false); // only one correct answer for MCQ
    }
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  if (!canManageExams) return <div className="p-8">Unauthorized</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <nav className="flex items-center gap-1.5 text-xs font-bold text-outline uppercase tracking-wider mb-2">
            <Link href="/cbt" className="hover:text-primary transition-colors">CBT Module</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary">Bank Soal</span>
          </nav>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Bank Soal Ujian
          </h2>
          <p className="text-on-surface-variant font-medium mt-1 max-w-2xl">
            Buat dan kelola soal-soal ujian yang dapat digunakan kembali untuk berbagai sesi CBT.
          </p>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <label className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-outline text-on-surface text-sm font-bold hover:bg-surface-container transition-colors active:scale-95 shadow-sm cursor-pointer">
            <span>📂 Import Excel</span>
            <input type="file" className="hidden" accept=".xlsx" onChange={handleImportExcel} disabled={isSubmitting} />
          </label>
          <button 
            onClick={() => { setIsBulkModalOpen(true); setBulkQuestions([emptyBulkQuestion()]); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primary/30 text-primary text-sm font-bold hover:bg-primary/5 transition-colors active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Banyak</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Soal</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant bg-surface-container/30 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input 
              type="text" 
              placeholder="Cari judul soal atau pertanyaan..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-surface-container" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant">
                <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Soal</th>
                <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Mapel & Jurusan</th>
                <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Tipe / Kesulitan</th>
                <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-on-surface-variant">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : questionBanks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-on-surface-variant font-medium">
                    Belum ada soal di Bank Soal.
                  </td>
                </tr>
              ) : (
                questionBanks.map((qb) => (
                  <tr key={qb.id} className="group hover:bg-surface-container-low/30 transition-colors border-b border-surface-container-low/50">
                    <td className="py-4 px-6">
                      <p className="font-bold text-on-surface text-base">{qb.title}</p>
                      <p className="text-sm text-on-surface-variant mt-1 line-clamp-1">{qb.question_text.replace(/<[^>]+>/g, '')}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-on-surface">{qb.subject?.name}</span>
                      <p className="text-[10px] font-bold text-outline mt-0.5 uppercase tracking-wider">{qb.major?.name}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <span className={cn(
                          "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                          qb.type === 'mcq' ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary/10 text-secondary border-secondary/20"
                        )}>
                          {qb.type === 'mcq' ? 'Pilihan Ganda' : 'Essai'}
                        </span>
                        <span className={cn(
                          "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-surface-container text-on-surface-variant border-outline-variant/30"
                        )}>
                          {qb.difficulty}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleDelete(qb.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Tambah Soal ke Bank</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="qbForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Judul Soal (Identifier)</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Contoh: Soal Logika Dasar 01" className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" />
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
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tipe Soal</label>
                    <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="mcq">Pilihan Ganda</option>
                      <option value="essay">Essai</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tingkat Kesulitan</label>
                    <select required value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="easy">Mudah</option>
                      <option value="medium">Sedang</option>
                      <option value="hard">Sulit</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pertanyaan</label>
                  <textarea required value={formData.question_text} onChange={e => setFormData({...formData, question_text: e.target.value})} rows={4} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-y" placeholder="Tuliskan pertanyaan di sini..." />
                </div>

                {formData.type === 'mcq' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pilihan Jawaban (Pilih 1 yang Benar)</label>
                    {formData.options.map((opt, i) => (
                      <div key={i} className="flex gap-3">
                        <input type="text" required value={opt.option_text} onChange={e => updateOption(i, 'option_text', e.target.value)} placeholder={`Pilihan ${i+1}`} className="flex-1 px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                        <label className="flex items-center justify-center px-4 bg-surface border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container transition-colors">
                          <input type="radio" name="correct_answer" checked={opt.is_correct} onChange={() => updateOption(i, 'is_correct', true)} className="w-4 h-4 text-primary" />
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all">Batal</button>
              <button type="submit" form="qbForm" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Simpan ke Bank
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BULK ADD MODAL ── */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Tambah Banyak Soal ({bulkQuestions.length})
              </h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold text-on-surface-variant cursor-pointer select-none">
                  <span className={cn(isTemplateMode ? "text-outline" : "text-primary")}>Kartu</span>
                  <div className={cn(
                    "w-10 h-5 rounded-full border border-outline-variant relative transition-colors cursor-pointer",
                    isTemplateMode ? "bg-primary border-primary" : "bg-surface-container"
                  )} onClick={() => setIsTemplateMode(!isTemplateMode)}>
                    <div className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all",
                      isTemplateMode ? "left-5" : "left-0.5"
                    )} />
                  </div>
                  <span className={cn(isTemplateMode ? "text-primary" : "text-outline")}>Template</span>
                </label>
                <button onClick={() => setIsBulkModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-surface-container-low rounded-xl">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Mata Pelajaran (default)</label>
                  <select value={formData.subject_id} onChange={e => { setFormData({...formData, subject_id: e.target.value}); setBulkQuestions(bulkQuestions.map(q => ({...q, subject_id: e.target.value}))); }}
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                    <option value="">Pilih Mapel</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Jurusan (default)</label>
                  <select value={formData.major_id} onChange={e => { setFormData({...formData, major_id: e.target.value}); setBulkQuestions(bulkQuestions.map(q => ({...q, major_id: e.target.value}))); }}
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                    <option value="">Pilih Jurusan</option>
                    {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              {/* ── TEMPLATE VIEW (spreadsheet/table) ── */}
              {isTemplateMode ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-surface-container-high border-b border-outline-variant">
                        <th className="py-3 px-3 text-[10px] font-bold text-outline uppercase tracking-wider w-10 text-center">#</th>
                        <th className="py-3 px-3 text-[10px] font-bold text-outline uppercase tracking-wider">Judul</th>
                        <th className="py-3 px-3 text-[10px] font-bold text-outline uppercase tracking-wider min-w-[200px]">Pertanyaan</th>
                        <th className="py-3 px-3 text-[10px] font-bold text-outline uppercase tracking-wider w-20">Tipe</th>
                        <th className="py-3 px-3 text-[10px] font-bold text-outline uppercase tracking-wider w-20">Kesulitan</th>
                        <th className="py-3 px-3 text-[10px] font-bold text-outline uppercase tracking-wider min-w-[320px]">Opsi (A/B/C/D) — centang yg benar</th>
                        <th className="py-3 px-3 text-[10px] font-bold text-outline uppercase tracking-wider w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkQuestions.map((q, idx) => (
                        <tr key={idx} className="border-b border-surface-container-low/50 hover:bg-surface-container-low/30 transition-colors">
                          <td className="py-2 px-3 text-center text-xs font-bold text-outline">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <input type="text" value={q.title} onChange={e => updateBulkQuestion(idx, 'title', e.target.value)}
                              placeholder="Judul" className="w-full px-2 py-1.5 bg-surface border border-outline-variant rounded-md text-xs focus:ring-1 focus:ring-primary/20 outline-none" />
                          </td>
                          <td className="py-2 px-3">
                            <textarea value={q.question_text} onChange={e => updateBulkQuestion(idx, 'question_text', e.target.value)}
                              placeholder="Teks pertanyaan..." rows={2}
                              className="w-full px-2 py-1.5 bg-surface border border-outline-variant rounded-md text-xs focus:ring-1 focus:ring-primary/20 outline-none resize-none" />
                          </td>
                          <td className="py-2 px-3">
                            <select value={q.type} onChange={e => updateBulkQuestion(idx, 'type', e.target.value)}
                              className="w-full px-2 py-1.5 bg-surface border border-outline-variant rounded-md text-xs focus:ring-1 focus:ring-primary/20 outline-none cursor-pointer">
                              <option value="mcq">PG</option>
                              <option value="essay">Essay</option>
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <select value={q.difficulty} onChange={e => updateBulkQuestion(idx, 'difficulty', e.target.value)}
                              className="w-full px-2 py-1.5 bg-surface border border-outline-variant rounded-md text-xs focus:ring-1 focus:ring-primary/20 outline-none cursor-pointer">
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            {q.type === 'mcq' ? (
                              <div className="grid grid-cols-2 gap-1">
                                {q.options.map((opt: any, oi: number) => (
                                  <div key={oi} className="flex items-center gap-1">
                                    <input type="radio" name={`tpl_correct_${idx}`} checked={opt.is_correct}
                                      onChange={() => updateBulkOption(idx, oi, opt.option_text, true)}
                                      className="w-3 h-3 text-primary shrink-0" />
                                    <input type="text" required value={opt.option_text}
                                      onChange={e => updateBulkOption(idx, oi, e.target.value, false)}
                                      placeholder={`${String.fromCharCode(65 + oi)}`}
                                      className="w-full px-1.5 py-1 bg-surface border border-outline-variant rounded text-[11px] focus:ring-1 focus:ring-primary/20 outline-none" />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-outline font-medium">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button onClick={() => removeBulkQuestion(idx)} disabled={bulkQuestions.length <= 1}
                              className="p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors disabled:opacity-20">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={addBulkQuestion} className="w-full py-2 mt-2 border-2 border-dashed border-outline-variant rounded-xl text-xs font-bold text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Tambah Baris
                  </button>
                </div>
              ) : (
                <>
                {bulkQuestions.map((q, idx) => (
                  <div key={idx} className="p-5 border border-outline-variant rounded-2xl bg-surface-container-lowest space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-primary uppercase tracking-widest">Soal #{idx + 1}</span>
                      <button onClick={() => removeBulkQuestion(idx)} className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors" title="Hapus soal ini">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Judul</label>
                        <input type="text" value={q.title} onChange={e => updateBulkQuestion(idx, 'title', e.target.value)} placeholder="Identifier soal" className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Tipe</label>
                        <select value={q.type} onChange={e => updateBulkQuestion(idx, 'type', e.target.value)} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                          <option value="mcq">Pilihan Ganda</option>
                          <option value="essay">Essai</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Kesulitan</label>
                        <select value={q.difficulty} onChange={e => updateBulkQuestion(idx, 'difficulty', e.target.value)} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                          <option value="easy">Mudah</option>
                          <option value="medium">Sedang</option>
                          <option value="hard">Sulit</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Teks Pertanyaan</label>
                      <textarea required value={q.question_text} onChange={e => updateBulkQuestion(idx, 'question_text', e.target.value)} rows={3} placeholder="Tulis pertanyaan..." className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-y" />
                    </div>

                    {q.type === 'mcq' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Opsi Jawaban</label>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt: any, oi: number) => (
                            <div key={oi} className="flex gap-2 items-center">
                              <input type="radio" name={`correct_${idx}`} checked={opt.is_correct}
                                onChange={() => updateBulkOption(idx, oi, opt.option_text, true)}
                                className="w-4 h-4 text-primary shrink-0" />
                              <input type="text" required value={opt.option_text}
                                onChange={e => updateBulkOption(idx, oi, e.target.value, false)}
                                placeholder={`Opsi ${String.fromCharCode(65 + oi)}`}
                                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button onClick={addBulkQuestion} className="w-full py-3 border-2 border-dashed border-outline-variant rounded-2xl text-sm font-bold text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Tambah Soal Lagi
                </button>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-between items-center gap-3">
              <p className="text-xs text-on-surface-variant font-medium">{bulkQuestions.filter(q => q.question_text.trim()).length} soal akan disimpan</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsBulkModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all">Batal</button>
                <button type="button" onClick={handleBulkSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Semua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
