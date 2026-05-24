'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Save, FileText, X, Calendar, User, Book, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useUserRole } from '@/lib/useUserRole';

const emptyForm = {
  teacher_id: '', class_id: '', major_id: '', batch_id: '', subject_id: '',
  note: '', material_summary: '', assignment_given: '', date: new Date().toISOString().split('T')[0]
};

export default function TeachingLogTab() {
  const { isTeacher } = useUserRole();
  const [logs, setLogs] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams({ ...(filterTeacher && { teacher_id: filterTeacher }), ...(filterClass && { class_id: filterClass }) });
      const res = await apiRequest(`/teaching-log?${q}`);
      setLogs(Array.isArray(res) ? res : []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const fetchMasterData = async () => {
    try {
      const [cRes, sRes, eRes] = await Promise.all([
        apiRequest('/classes?limit=100'), apiRequest('/subjects?limit=100'), apiRequest('/employees')
      ]);
      setClasses(Array.isArray(cRes) ? cRes : (cRes.data || []));
      setSubjects(sRes.data || sRes);
      setEmployees(Array.isArray(eRes) ? eRes : (eRes.data || []));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchMasterData(); }, []);
  useEffect(() => { fetchLogs(); }, [filterTeacher, filterClass]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      const log = await apiRequest(`/teaching-log/${id}`);
      setEditingId(id);
      setFormData({
        teacher_id: log.teacher_id || '',
        class_id: log.class_id || '',
        major_id: log.major_id || '',
        batch_id: log.batch_id || '',
        subject_id: log.subject_id || '',
        note: log.note || '',
        material_summary: log.material_summary || '',
        assignment_given: log.assignment_given || '',
        date: log.date ? log.date.split('T')[0] : new Date().toISOString().split('T')[0],
      });
      setModalOpen(true);
    } catch (err: any) { alert('Gagal memuat data: ' + err.message); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const sc = classes.find(c => c.id === formData.class_id);
      if (!sc) throw new Error('Pilih kelas');
      const payload = {
        ...formData,
        major_id: sc.major_id,
        batch_id: sc.batch_id,
        date: new Date(formData.date).toISOString()
      };

      if (editingId) {
        await apiRequest(`/teaching-log/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await apiRequest('/teaching-log', { method: 'POST', body: JSON.stringify(payload) });
      }
      setModalOpen(false);
      setFormData(emptyForm);
      fetchLogs();
    } catch (err: any) { alert('Gagal: ' + err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jurnal ini?')) return;
    try { await apiRequest(`/teaching-log/${id}`, { method: 'DELETE' }); fetchLogs(); }
    catch (err: any) { alert('Gagal: ' + err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-on-surface">Jurnal Mengajar</h3>
          <p className="text-sm text-on-surface-variant mt-1">Catatan materi dan tugas setiap sesi pertemuan.</p>
        </div>
        {isTeacher && (
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/20 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> Tulis Jurnal
          </button>
        )}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Filter Guru</label>
            <select value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)} className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option value="">Semua Guru</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Filter Kelas</label>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option value="">Semua Kelas</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : logs.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-outline mx-auto mb-3 opacity-30" />
          <p className="text-on-surface-variant font-medium">Belum ada jurnal mengajar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary" />
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pl-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">{log.subject?.name}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant text-[10px] font-bold text-on-surface-variant">{log.class?.name}</span>
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed mt-2 whitespace-pre-line">{log.note}</p>
                  {log.material_summary && (
                    <div className="mt-3 p-3 bg-surface-container rounded-xl border border-outline-variant/50">
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Ringkasan Materi</p>
                      <p className="text-sm text-on-surface whitespace-pre-line">{log.material_summary}</p>
                    </div>
                  )}
                  {log.assignment_given && (
                    <div className="mt-2 p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl">
                      <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Tugas</p>
                      <p className="text-sm text-amber-900 whitespace-pre-line">{log.assignment_given}</p>
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-on-surface">{formatDate(log.date)}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-on-surface-variant">
                    <User className="w-3 h-3" />
                    <span className="font-medium">{log.teacher?.full_name}</span>
                  </div>
                </div>
              </div>
              {isTeacher && (
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEdit(log.id)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(log.id)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant flex justify-between items-center bg-surface">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl"><FileText className="w-6 h-6" /></div>
                <h3 className="text-xl font-black text-on-surface tracking-tight">{editingId ? 'Edit Jurnal' : 'Tulis Jurnal Mengajar'}</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-1"><User className="w-3 h-3" /> Guru</label>
                  <select required value={formData.teacher_id} onChange={e => setFormData({ ...formData, teacher_id: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                    <option value="">Pilih Guru</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3" /> Tanggal</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Kelas</label>
                  <select required value={formData.class_id} onChange={e => setFormData({ ...formData, class_id: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                    <option value="">Pilih Kelas</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Mata Pelajaran</label>
                  <select required value={formData.subject_id} onChange={e => setFormData({ ...formData, subject_id: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                    <option value="">Pilih Mapel</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Catatan / Materi</label>
                <textarea required value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} placeholder="Tuliskan ringkasan materi yang disampaikan..." className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 h-24 resize-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Ringkasan Materi</label>
                <textarea value={formData.material_summary} onChange={e => setFormData({ ...formData, material_summary: e.target.value })} placeholder="Detail materi yang diajarkan..." className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 h-20 resize-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Tugas yang Diberikan</label>
                <textarea value={formData.assignment_given} onChange={e => setFormData({ ...formData, assignment_given: e.target.value })} placeholder="Deskripsi tugas/PR yang diberikan..." className="w-full px-4 py-3 bg-amber-50/50 border border-amber-200/50 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-300/50 h-20 resize-none" />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl border border-outline text-on-surface font-bold hover:bg-surface-container transition-all">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-on-primary font-black shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} {editingId ? 'Update Jurnal' : 'Simpan Jurnal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
