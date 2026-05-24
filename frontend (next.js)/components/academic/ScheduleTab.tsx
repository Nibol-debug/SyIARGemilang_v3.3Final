'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, Loader2, Save, Edit3, Calendar, Clock, Users, Book, User, MapPin } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useUserRole } from '@/lib/useUserRole';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_LABELS: Record<string, string> = {
  Monday: 'Senin', Tuesday: 'Selasa', Wednesday: 'Rabu',
  Thursday: 'Kamis', Friday: 'Jumat', Saturday: 'Sabtu', Sunday: 'Minggu'
};
const DAY_COLORS: Record<string, string> = {
  Monday: 'bg-blue-500/10 text-blue-700 border-blue-200',
  Tuesday: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  Wednesday: 'bg-amber-500/10 text-amber-700 border-amber-200',
  Thursday: 'bg-purple-500/10 text-purple-700 border-purple-200',
  Friday: 'bg-rose-500/10 text-rose-700 border-rose-200',
  Saturday: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
};

const emptyForm = {
  class_id: '', subject_id: '', teacher_id: '',
  day: 'Monday', start_time: '08:00', end_time: '10:00', room: ''
};

export default function ScheduleTab() {
  const { canManageAcademic } = useUserRole();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDay, setFilterDay] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams({ ...(filterDay && { day: filterDay }), ...(filterClass && { class_id: filterClass }) });
      const res = await apiRequest(`/schedules?${q}`);
      setSchedules(Array.isArray(res) ? res : []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const fetchMasterData = async () => {
    try {
      const [sRes, eRes, cRes] = await Promise.all([
        apiRequest('/subjects?limit=100'), apiRequest('/employees'), apiRequest('/classes?limit=100')
      ]);
      setSubjects(sRes.data || sRes);
      setEmployees(Array.isArray(eRes) ? eRes : (eRes.data || []));
      setClasses(Array.isArray(cRes) ? cRes : (cRes.data || []));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchMasterData(); }, []);
  useEffect(() => { fetchSchedules(); }, [filterDay, filterClass]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      const s = await apiRequest(`/schedules/${id}`);
      setEditingId(id);
      setFormData({
        class_id: s.class_id || '',
        subject_id: s.subject_id || '',
        teacher_id: s.teacher_id || '',
        day: s.day || 'Monday',
        start_time: s.start_time || '08:00',
        end_time: s.end_time || '10:00',
        room: s.room || '',
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
      const body = { ...formData, major_id: sc.major_id, batch_id: sc.batch_id };

      if (editingId) {
        await apiRequest(`/schedules/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(body)
        });
      } else {
        await apiRequest('/schedules', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      }
      setModalOpen(false);
      fetchSchedules();
    } catch (err: any) { alert('Gagal: ' + err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal ini?')) return;
    try { await apiRequest(`/schedules/${id}`, { method: 'DELETE' }); fetchSchedules(); }
    catch (err: any) { alert('Gagal: ' + err.message); }
  };

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = schedules.filter(s => s.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-on-surface">Jadwal Pelajaran</h3>
          <p className="text-sm text-on-surface-variant mt-1">Timetable mingguan dengan deteksi bentrok otomatis.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-surface-container-low p-1 rounded-xl">
            <button onClick={() => setViewMode('grid')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}>Grid</button>
            <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}>Tabel</button>
          </div>
          {canManageAcademic && (
            <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/20 active:scale-95 transition-all">
              <Plus className="w-4 h-4" /> Tambah Jadwal
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Hari</label>
            <select value={filterDay} onChange={e => setFilterDay(e.target.value)} className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option value="">Semua Hari</option>
              {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Kelas</label>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option value="">Semua Kelas</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DAYS.map(day => (
            <div key={day} className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
              <div className={`px-5 py-3 border-b border-outline-variant font-bold text-sm ${DAY_COLORS[day]} bg-opacity-50`}>
                {DAY_LABELS[day]}
                <span className="ml-2 text-[10px] opacity-60 font-medium">({grouped[day]?.length || 0} jadwal)</span>
              </div>
              <div className="p-3 space-y-2 min-h-[100px]">
                {(grouped[day]?.length || 0) === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-6 opacity-50">Tidak ada jadwal</p>
                ) : grouped[day].map(s => (
                  <div key={s.id} className="p-3 bg-surface-container rounded-xl border border-outline-variant/50 hover:border-primary/30 transition-all group relative">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-primary mb-1">
                      <Clock className="w-3 h-3" /> {s.start_time} - {s.end_time}
                      {s.room && <span className="ml-auto text-[10px] text-on-surface-variant font-medium"><MapPin className="w-3 h-3 inline" /> {s.room}</span>}
                    </div>
                    <p className="font-bold text-sm text-on-surface">{s.subject?.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">{s.class?.name}</span>
                      <span className="text-[10px] text-on-surface-variant">{s.teacher?.full_name}</span>
                    </div>
                    {canManageAcademic && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(s.id)} className="p-1 text-on-surface-variant hover:text-primary rounded"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(s.id)} className="p-1 text-on-surface-variant hover:text-error rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Hari</th>
                <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Waktu</th>
                <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Ruangan</th>
                <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Mata Pelajaran</th>
                <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Kelas</th>
                <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Guru</th>
                <th className="py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {schedules.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-on-surface-variant">Tidak ada jadwal.</td></tr>
              ) : schedules.map(s => (
                <tr key={s.id} className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors group">
                  <td className="py-3 px-6"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${DAY_COLORS[s.day]}`}>{DAY_LABELS[s.day]}</span></td>
                  <td className="py-3 px-6 font-medium">{s.start_time} - {s.end_time}</td>
                  <td className="py-3 px-6 text-on-surface-variant text-[11px]">{s.room || '-'}</td>
                  <td className="py-3 px-6 font-semibold">{s.subject?.name}</td>
                  <td className="py-3 px-6"><span className="px-2 py-0.5 bg-surface-container border border-outline-variant rounded text-[11px] font-bold">{s.class?.name}</span></td>
                  <td className="py-3 px-6 text-on-surface-variant">{s.teacher?.full_name}</td>
                  <td className="py-3 px-6 text-right">
                    {canManageAcademic && (
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(s.id)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-md"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant flex justify-between items-center bg-surface">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl"><Calendar className="w-6 h-6" /></div>
                <h3 className="text-xl font-black text-on-surface tracking-tight">{editingId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3" /> Hari</label>
                  <select required value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                    {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Mulai</label>
                    <input type="time" required value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Selesai</label>
                    <input type="time" required value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-1"><MapPin className="w-3 h-3" /> Ruangan</label>
                <input type="text" value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} placeholder="Contoh: Lab Komputer, R. 201" className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-1"><Users className="w-3 h-3" /> Kelas</label>
                <select required value={formData.class_id} onChange={e => setFormData({ ...formData, class_id: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  <option value="">Pilih Kelas</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-1"><Book className="w-3 h-3" /> Mata Pelajaran</label>
                <select required value={formData.subject_id} onChange={e => setFormData({ ...formData, subject_id: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  <option value="">Pilih Mata Pelajaran</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-1"><User className="w-3 h-3" /> Guru Pengajar</label>
                <select required value={formData.teacher_id} onChange={e => setFormData({ ...formData, teacher_id: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  <option value="">Pilih Guru</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                </select>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl border border-outline text-on-surface font-bold hover:bg-surface-container transition-all">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-on-primary font-black shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} {editingId ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
