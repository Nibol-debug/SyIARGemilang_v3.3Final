'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, Loader2, Save, Edit3, ChevronLeft, ChevronRight, Calendar, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { useUserRole } from '@/lib/useUserRole';

const EVENT_TYPES: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  ujian: { label: 'Ujian', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', bg: 'bg-red-500/15' },
  libur: { label: 'Libur', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', bg: 'bg-emerald-500/15' },
  kegiatan: { label: 'Kegiatan', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', bg: 'bg-blue-500/15' },
  rapat: { label: 'Rapat', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', bg: 'bg-amber-500/15' },
  other: { label: 'Lainnya', color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-500', bg: 'bg-gray-500/15' },
};

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function CalendarTab() {
  const { canManageAcademic } = useUserRole();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', type: 'kegiatan' });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/academic-calendar');
      setEvents(Array.isArray(res) ? res : []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const openEdit = (ev: any) => {
    setEditingId(ev.id);
    setFormData({
      title: ev.title || '',
      date: ev.date ? ev.date.split('T')[0] : '',
      type: ev.type || 'kegiatan',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, date: new Date(formData.date + 'T00:00:00').toISOString() };
      if (editingId) {
        await apiRequest(`/academic-calendar/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await apiRequest('/academic-calendar', { method: 'POST', body: JSON.stringify(payload) });
      }
      setModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', date: '', type: 'kegiatan' });
      fetchEvents();
    } catch (err: any) { alert('Gagal: ' + err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus event ini?')) return;
    try { await apiRequest(`/academic-calendar/${id}`, { method: 'DELETE' }); fetchEvents(); }
    catch (err: any) { alert('Gagal: ' + err.message); }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const dateStr = e.date.split('T')[0];
      const parts = dateStr.split('-');
      return parseInt(parts[0]) === year && parseInt(parts[1]) - 1 === month && parseInt(parts[2]) === day;
    });
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const toLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const formatTanggal = (dateStr: string) => {
    const d = toLocalDate(dateStr);
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  };

  const upcoming = events
    .filter(e => {
      const d = toLocalDate(e.date);
      const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= -1 && diff <= 60;
    })
    .sort((a, b) => toLocalDate(a.date).getTime() - toLocalDate(b.date).getTime())
    .slice(0, 10);

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-on-surface">Kalender Akademik</h3>
          <p className="text-sm text-on-surface-variant mt-1">Jadwal ujian, libur, dan kegiatan sekolah.</p>
        </div>
        {canManageAcademic && (
          <button onClick={() => { setEditingId(null); setFormData({ title: '', date: '', type: 'kegiatan' }); setModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/20 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> Tambah Event
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(EVENT_TYPES).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn("w-2.5 h-2.5 rounded-full", cfg.dot)} />
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{cfg.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-surface-container transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <h4 className="text-lg font-black text-on-surface min-w-[180px] text-center">{MONTH_NAMES[month]} {year}</h4>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-surface-container transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <button onClick={goToday} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all">Hari Ini</button>
          </div>

          {isLoading ? (
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-surface-container animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-7 mb-2">
                {DAY_NAMES.map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (day === null) return <div key={`empty-${idx}`} className="aspect-square" />;
                  const dayEvents = getEventsForDay(day);
                  const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                  const isSelected = selectedDay === day;
                  const eventCount = dayEvents.length;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className={cn(
                        "aspect-square rounded-xl p-1.5 border transition-all relative flex flex-col items-start justify-start",
                        isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : isToday
                          ? 'bg-primary/10 border-primary/30'
                          : 'border-transparent hover:bg-surface-container hover:border-outline-variant/50',
                        eventCount > 0 && 'bg-surface-container-low'
                      )}
                    >
                      <span className={cn("text-xs font-bold", isToday ? 'text-primary' : 'text-on-surface')}>{day}</span>
                      {eventCount > 0 && (
                        <div className="flex flex-col gap-1 mt-auto w-full">
                          {Array.from(new Set(dayEvents.map(ev => ev.type))).slice(0, 2).map(type => {
                            const cfg = EVENT_TYPES[type] || EVENT_TYPES.other;
                            return <div key={type} className={cn("w-full h-1.5 rounded-full", cfg.dot)} />;
                          })}
                        </div>
                      )}
                      {eventCount > 1 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[8px] font-black text-on-primary flex items-center justify-center shadow-sm">
                          {eventCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-outline-variant bg-surface">
            <h4 className="font-bold text-sm text-on-surface">Agenda Mendatang</h4>
          </div>
          <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[500px]">
            {isLoading ? (
              <div className="py-8 text-center"><Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" /></div>
            ) : upcoming.length === 0 ? (
              <div className="py-10 text-center">
                <CalendarDays className="w-10 h-10 text-outline mx-auto mb-3 opacity-20" />
                <p className="text-xs text-on-surface-variant font-medium">Belum ada agenda.</p>
                <p className="text-[10px] text-on-surface-variant mt-1 opacity-60">Tambahkan event untuk mulai.</p>
              </div>
            ) : (
              upcoming.map(ev => {
                const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.other;
                const d = toLocalDate(ev.date);
                return (
                  <div key={ev.id} className={cn("p-3 rounded-xl border group relative transition-all hover:shadow-sm", cfg.color)}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{cfg.label}</span>
                    </div>
                    <p className="text-sm font-bold leading-tight">{ev.title}</p>
                    <p className="text-[10px] font-medium mt-1.5 opacity-70">{d.getDate()} {MONTH_NAMES[d.getMonth()]} {d.getFullYear()}</p>
                    {canManageAcademic && (
                      <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(ev)} className="p-1.5 hover:bg-black/10 rounded-lg"><Edit3 className="w-3 h-3" /></button>
                        <button onClick={() => handleDelete(ev.id)} className="p-1.5 hover:bg-black/10 rounded-lg"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedDay && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface flex items-center justify-between">
            <h4 className="font-bold text-on-surface flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {selectedDay} {MONTH_NAMES[month]} {year}
              <span className="text-xs font-medium text-on-surface-variant ml-1">({selectedDayEvents.length} event)</span>
            </h4>
            <button onClick={() => setSelectedDay(null)} className="text-xs font-bold text-on-surface-variant hover:text-on-surface px-3 py-1 rounded-lg hover:bg-surface-container transition-all">Tutup</button>
          </div>
          <div className="p-4 space-y-2">
            {selectedDayEvents.length === 0 ? (
              <p className="text-center text-sm text-on-surface-variant py-4">Tidak ada event di tanggal ini.</p>
            ) : (
              selectedDayEvents.map(ev => {
                const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.other;
                return (
                  <div key={ev.id} className={cn("flex items-center justify-between gap-4 p-4 rounded-xl border", cfg.color)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-3 h-3 rounded-full flex-shrink-0", cfg.dot)} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{ev.title}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{cfg.label}</p>
                      </div>
                    </div>
                    {canManageAcademic && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(ev)} className="p-2 rounded-lg hover:bg-black/10 transition-all"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(ev.id)} className="p-2 rounded-lg hover:bg-black/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-[28rem] rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-xl font-black text-on-surface tracking-tight">{editingId ? 'Edit Event' : 'Tambah Event'}</h3>
              <button onClick={() => { setModalOpen(false); setEditingId(null); }} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Judul Event</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Contoh: UTS Semester Ganjil" className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Tanggal</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Tipe</label>
                  <select required value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                    {Object.entries(EVENT_TYPES).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => { setModalOpen(false); setEditingId(null); }} className="flex-1 px-6 py-3 rounded-xl border border-outline text-on-surface font-bold hover:bg-surface-container transition-all">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-on-primary font-black shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} {editingId ? 'Update Event' : 'Simpan Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
