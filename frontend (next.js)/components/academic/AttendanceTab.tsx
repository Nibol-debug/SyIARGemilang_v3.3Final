'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Save, CheckCircle, XCircle, AlertCircle, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { useUserRole } from '@/lib/useUserRole';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  hadir: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle },
  sakit: { label: 'Sakit', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: AlertCircle },
  izin: { label: 'Izin', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Clock },
  alfa: { label: 'Alfa', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
};

export default function AttendanceTab() {
  const { isTeacher } = useUserRole();
  const [classes, setClasses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await apiRequest('/classes?limit=100');
        setClasses(Array.isArray(res) ? res : (res.data || []));
      } catch (err) { console.error(err); }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) { setSchedules([]); return; }
    const fetchSchedules = async () => {
      try {
        const res = await apiRequest(`/schedules?class_id=${selectedClass}`);
        setSchedules(Array.isArray(res) ? res : []);
      } catch (err) { console.error(err); }
    };
    fetchSchedules();
  }, [selectedClass]);

  const loadStudents = async () => {
    if (!selectedClass) return;
    setIsLoading(true);
    setSubmitted(false);
    try {
      const res = await apiRequest(`/classes/${selectedClass}/students`);
      setStudents(Array.isArray(res) ? res : []);
      const initial: Record<string, string> = {};
      res.forEach((s: any) => { initial[s.id] = 'hadir'; });
      setAttendanceData(initial);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const fetchSummary = async () => {
    try {
      const month = selectedDate.substring(0, 7);
      const q = new URLSearchParams({ ...(selectedClass && { class_id: selectedClass }), month });
      const res = await apiRequest(`/attendance/summary?${q}`);
      setSummary(res);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { 
    if (selectedClass) { 
      loadStudents(); 
      fetchSummary(); 
    } 
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    const fetchExistingAttendance = async () => {
      if (!selectedClass || !selectedSchedule || !selectedDate || students.length === 0) return;
      setIsLoading(true);
      try {
        const res = await apiRequest(`/attendance/schedule/${selectedSchedule}?date=${selectedDate}`);
        if (Array.isArray(res) && res.length > 0) {
          const updated: Record<string, string> = {};
          res.forEach((att: any) => { updated[att.student_id] = att.status; });
          
          setAttendanceData(prev => {
            const newData = { ...prev };
            Object.keys(newData).forEach(id => {
              if (updated[id]) newData[id] = updated[id];
            });
            return newData;
          });
          setSubmitted(true);
        } else {
          setAttendanceData(prev => {
            const newData = { ...prev };
            Object.keys(newData).forEach(id => { newData[id] = 'hadir'; });
            return newData;
          });
          setSubmitted(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExistingAttendance();
  }, [selectedSchedule, selectedDate, students.length]);

  const handleSubmit = async () => {
    if (!selectedSchedule) { alert('Pilih jadwal/mata pelajaran terlebih dahulu'); return; }
    setIsSubmitting(true);
    try {
      await apiRequest('/attendance', {
        method: 'POST',
        body: JSON.stringify({
          schedule_id: selectedSchedule,
          date: new Date(selectedDate).toISOString(),
          attendances: Object.entries(attendanceData).map(([student_id, status]) => ({ student_id, status }))
        })
      });
      setSubmitted(true);
      fetchSummary();
    } catch (err: any) { alert('Gagal menyimpan: ' + err.message); }
    finally { setIsSubmitting(false); }
  };

  const setAllStatus = (status: string) => {
    const updated: Record<string, string> = {};
    students.forEach(s => { updated[s.id] = status; });
    setAttendanceData(updated);
    setSubmitted(false);
  };

  const counts = {
    hadir: Object.values(attendanceData).filter(s => s === 'hadir').length,
    sakit: Object.values(attendanceData).filter(s => s === 'sakit').length,
    izin: Object.values(attendanceData).filter(s => s === 'izin').length,
    alfa: Object.values(attendanceData).filter(s => s === 'alfa').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-on-surface">Presensi Digital</h3>
        <p className="text-sm text-on-surface-variant mt-1">Catat kehadiran siswa secara real-time per sesi pelajaran.</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Record', value: summary.total, color: 'text-on-surface' },
            { label: 'Hadir', value: summary.hadir, color: 'text-emerald-600' },
            { label: 'Sakit', value: summary.sakit, color: 'text-amber-600' },
            { label: 'Izin', value: summary.izin, color: 'text-blue-600' },
            { label: 'Alfa', value: summary.alfa, color: 'text-red-600' },
          ].map(item => (
            <div key={item.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{item.label}</p>
              <p className={cn("text-2xl font-black mt-1", item.color)}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Kelas</label>
            <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSchedule(''); }} className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option value="">Pilih Kelas</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Jadwal / Mapel</label>
            <select value={selectedSchedule} onChange={e => setSelectedSchedule(e.target.value)} className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option value="">Pilih Jadwal</option>
              {schedules.map(s => <option key={s.id} value={s.id}>{s.subject?.name} ({s.day} {s.start_time})</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Tanggal</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {students.length > 0 && isTeacher && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Set Semua:</span>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setAllStatus(key)} className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all hover:scale-105", cfg.color)}>
              {cfg.label}
            </button>
          ))}
          <div className="ml-auto flex gap-2 text-xs font-bold text-on-surface-variant">
            <span className="text-emerald-600">{counts.hadir}H</span>
            <span className="text-amber-600">{counts.sakit}S</span>
            <span className="text-blue-600">{counts.izin}I</span>
            <span className="text-red-600">{counts.alfa}A</span>
          </div>
        </div>
      )}

      {/* Student List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : !selectedClass ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center shadow-sm">
          <Users className="w-12 h-12 text-outline mx-auto mb-3 opacity-30" />
          <p className="text-on-surface-variant font-medium">Pilih kelas untuk menampilkan daftar siswa.</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center shadow-sm">
          <p className="text-on-surface-variant font-medium">Tidak ada siswa aktif di kelas ini.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-outline-variant/50">
            {students.map((student, index) => (
              <div key={student.id} className="flex items-center gap-4 px-6 py-3 hover:bg-surface-container/30 transition-colors">
                <span className="text-xs font-bold text-on-surface-variant w-8">{index + 1}</span>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase flex-shrink-0">
                  {student.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-on-surface truncate">{student.full_name}</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">{student.nis}</p>
                </div>
                <div className="flex gap-1.5">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const isActive = attendanceData[student.id] === key;
                    return (
                      <button
                        key={key}
                        disabled={!isTeacher}
                        onClick={() => {
                          setAttendanceData({ ...attendanceData, [student.id]: key });
                          setSubmitted(false);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                          isActive ? cfg.color + ' scale-105 shadow-sm' : 'bg-surface-container text-on-surface-variant border-outline-variant/50 opacity-50 hover:opacity-80',
                          !isTeacher && 'cursor-default hover:scale-100 hover:opacity-50'
                        )}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-between items-center">
            <span className="text-xs font-medium text-on-surface-variant">{students.length} siswa</span>
            {submitted ? (
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm"><CheckCircle className="w-5 h-5" /> Presensi tersimpan!</div>
            ) : isTeacher ? (
              <button onClick={handleSubmit} disabled={isSubmitting || !selectedSchedule} className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan Presensi
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
