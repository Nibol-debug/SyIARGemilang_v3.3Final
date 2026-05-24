'use client';

import React, { useEffect, useState } from 'react';
import { Book, Calendar, Clock, Users, FileText, CheckCircle, School, ArrowRight, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const DAY_LABELS: Record<string, string> = {
  Monday: 'Senin', Tuesday: 'Selasa', Wednesday: 'Rabu',
  Thursday: 'Kamis', Friday: 'Jumat', Saturday: 'Sabtu', Sunday: 'Minggu'
};

const JS_TO_DAY: Record<number, string> = {
  0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
  4: 'Thursday', 5: 'Friday', 6: 'Saturday'
};

export default function DashboardTab({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const [subjects, setSubjects] = useState(0);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [classes, setClasses] = useState(0);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sRes, schRes, logRes, evRes, cRes] = await Promise.all([
          apiRequest('/subjects?limit=1').catch(() => ({ meta: { total: 0 } })),
          apiRequest('/schedules').catch(() => []),
          apiRequest('/teaching-log').catch(() => []),
          apiRequest('/academic-calendar').catch(() => []),
          apiRequest('/classes?limit=1').catch(() => ({ meta: { total: 0 } })),
        ]);
        setSubjects(sRes.meta?.total || 0);
        const allSchedules = Array.isArray(schRes) ? schRes : [];
        setSchedules(allSchedules);
        setClasses(cRes.meta?.total || 0);

        const today = JS_TO_DAY[new Date().getDay()];
        setTodaySchedules(allSchedules.filter((s: any) => s.day === today).sort((a: any, b: any) => a.start_time.localeCompare(b.start_time)));

        const allLogs = Array.isArray(logRes) ? logRes : [];
        setLogs(allLogs.slice(0, 5));

        const allEvents = Array.isArray(evRes) ? evRes : [];
        const now = new Date();
        setEvents(allEvents.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5));

        // Attendance summary for current month
        try {
          const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const attRes = await apiRequest(`/attendance/summary?month=${month}`);
          setAttendanceSummary(attRes);
        } catch { setAttendanceSummary(null); }
      } catch (err) { console.error(err); }
    };
    fetchAll();
  }, []);

  const statCards = [
    { label: 'Mata Pelajaran', value: subjects, icon: Book, color: 'bg-primary/10 text-primary', onClick: () => onTabChange('subjects') },
    { label: 'Total Jadwal', value: schedules.length, icon: Calendar, color: 'bg-secondary/10 text-secondary', onClick: () => onTabChange('schedule') },
    { label: 'Total Kelas', value: classes, icon: School, color: 'bg-tertiary/10 text-tertiary', onClick: () => onTabChange('rombel') },
    { label: 'Jurnal Bulan Ini', value: logs.length, icon: FileText, color: 'bg-blue-500/10 text-blue-600', onClick: () => onTabChange('teaching-log') },
  ];

  const EVENT_COLORS: Record<string, string> = {
    ujian: 'bg-red-500', libur: 'bg-emerald-500', kegiatan: 'bg-blue-500', rapat: 'bg-amber-500', other: 'bg-gray-500',
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <button key={card.label} onClick={card.onClick} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-left group">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", card.color)}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{card.label}</p>
            <p className="text-3xl font-black text-on-surface mt-1">{card.value}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-on-surface">Jadwal Hari Ini</h4>
              <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{DAY_LABELS[JS_TO_DAY[new Date().getDay()]]}, {formatDate(new Date())}</p>
            </div>
            <button onClick={() => onTabChange('schedule')} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4">
            {todaySchedules.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-10 h-10 text-outline mx-auto mb-2 opacity-30" />
                <p className="text-sm text-on-surface-variant">Tidak ada jadwal hari ini.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todaySchedules.map(s => (
                  <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary min-w-[100px]">
                      <Clock className="w-3.5 h-3.5" /> {s.start_time} - {s.end_time}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-on-surface">{s.subject?.name}</p>
                      <p className="text-[10px] text-on-surface-variant font-medium">{s.teacher?.full_name}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-surface-container-lowest border border-outline-variant rounded-lg text-[10px] font-bold text-on-surface-variant">
                      {s.class?.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant bg-surface flex justify-between items-center">
            <h4 className="font-bold text-sm text-on-surface">Agenda Mendatang</h4>
            <button onClick={() => onTabChange('calendar')} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
              Kalender <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-3 space-y-2">
            {events.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-6">Tidak ada agenda mendatang.</p>
            ) : events.map(ev => (
              <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container/50 transition-colors">
                <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", EVENT_COLORS[ev.type] || EVENT_COLORS.other)} />
                <div>
                  <p className="text-sm font-bold text-on-surface">{ev.title}</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">{formatDate(ev.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Summary + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Summary */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <h4 className="font-bold text-sm text-on-surface mb-4">Rekap Presensi Bulan Ini</h4>
          {attendanceSummary && attendanceSummary.total > 0 ? (
            <div className="space-y-3">
              {[
                { label: 'Hadir', value: attendanceSummary.hadir, total: attendanceSummary.total, color: 'bg-emerald-500' },
                { label: 'Sakit', value: attendanceSummary.sakit, total: attendanceSummary.total, color: 'bg-amber-500' },
                { label: 'Izin', value: attendanceSummary.izin, total: attendanceSummary.total, color: 'bg-blue-500' },
                { label: 'Alfa', value: attendanceSummary.alfa, total: attendanceSummary.total, color: 'bg-red-500' },
              ].map(item => {
                const pct = item.total > 0 ? (item.value / item.total * 100) : 0;
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-on-surface-variant">{item.label}</span>
                      <span className="text-on-surface">{item.value} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-700", item.color)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant text-center py-4">Belum ada data presensi bulan ini.</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <h4 className="font-bold text-sm text-on-surface mb-4">Aksi Cepat</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Ambil Presensi', icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-600', tab: 'attendance' },
              { label: 'Tulis Jurnal', icon: FileText, color: 'bg-blue-500/10 text-blue-600', tab: 'teaching-log' },
              { label: 'Tambah Jadwal', icon: Calendar, color: 'bg-primary/10 text-primary', tab: 'schedule' },
              { label: 'Lihat Rombel', icon: Users, color: 'bg-tertiary/10 text-tertiary', tab: 'rombel' },
              { label: 'Lihat Penilaian', icon: GraduationCap, color: 'bg-purple-500/10 text-purple-600', tab: 'grading', external: true },
            ].map(action => (
              action.external ? (
                <a key={action.label} href="/grading" className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant hover:border-primary/30 hover:shadow-sm transition-all text-left group">
                  <div className={cn("p-2 rounded-lg group-hover:scale-110 transition-transform", action.color)}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-on-surface">{action.label}</span>
                </a>
              ) : (
                <button key={action.label} onClick={() => onTabChange(action.tab)} className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant hover:border-primary/30 hover:shadow-sm transition-all text-left group">
                  <div className={cn("p-2 rounded-lg group-hover:scale-110 transition-transform", action.color)}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-on-surface">{action.label}</span>
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Recent Teaching Logs */}
      {logs.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface flex justify-between items-center">
            <h4 className="font-bold text-sm text-on-surface">Jurnal Terbaru</h4>
            <button onClick={() => onTabChange('teaching-log')} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
              Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-outline-variant/50">
            {logs.map(log => (
              <div key={log.id} className="px-6 py-3 flex items-center gap-4 hover:bg-surface-container/30 transition-colors">
                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-primary to-secondary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{log.note}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-on-surface-variant">
                    <span className="font-bold">{log.subject?.name}</span> • <span>{log.class?.name}</span> • <span>{log.teacher?.full_name}</span>
                  </div>
                </div>
                <span className="text-[10px] text-on-surface-variant font-medium flex-shrink-0">{formatDate(log.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
