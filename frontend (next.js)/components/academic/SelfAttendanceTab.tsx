'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Clock, Users, Calendar, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { useUserRole } from '@/lib/useUserRole';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  hadir: { label: 'Hadir', color: 'text-emerald-600 bg-emerald-100' },
  sakit: { label: 'Sakit', color: 'text-amber-600 bg-amber-100' },
  izin: { label: 'Izin', color: 'text-blue-600 bg-blue-100' },
  alfa: { label: 'Alfa', color: 'text-red-600 bg-red-100' },
};

export default function SelfAttendanceTab() {
  const { isTeacher } = useUserRole();
  const [classes, setClasses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [stats, setStats] = useState<any>(null);

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

  const loadSelfAttendance = async () => {
    if (!selectedClass) return;
    setIsLoading(true);
    setSubmitted(false);
    try {
      const params = new URLSearchParams({ class_id: selectedClass, date: selectedDate });
      const res = await apiRequest(`/attendance/self-status?${params}`);
      const data = Array.isArray(res) ? res : [];
      setStudents(data);

      const initStatus: Record<string, string> = {};
      data.forEach((s: any) => {
        if (s.has_self_attended) {
          s.attendances.forEach((a: any) => {
            initStatus[a.schedule_id + '-' + s.id] = a.status;
          });
        }
      });
      setAttendanceData(initStatus);

      const total = data.length;
      const attended = data.filter((s: any) => s.has_self_attended).length;
      const totalAttendanceRecords = data.reduce((sum: number, s: any) => sum + s.total_attended, 0);
      setStats({ total, attended, not_attended: total - attended, total_records: totalAttendanceRecords });
    } catch (err) {
      console.error(err);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSelfAttendance();
  }, [selectedClass, selectedDate]);

  const handleSetStatus = (studentId: string, scheduleId: string, status: string) => {
    const key = scheduleId + '-' + studentId;
    setAttendanceData(prev => ({ ...prev, [key]: status }));
    setSubmitted(false);
  };

  const handleSave = async () => {
    if (!selectedSchedule) { alert('Pilih jadwal terlebih dahulu'); return; }
    setIsSubmitting(true);
    try {
      const studentAttendances = students
        .filter(s => {
          const key = selectedSchedule + '-' + s.id;
          return attendanceData[key] && !s.has_self_attended;
        })
        .map(s => ({
          student_id: s.id,
          status: attendanceData[selectedSchedule + '-' + s.id],
        }));

      if (studentAttendances.length === 0) {
        alert('Semua siswa sudah melakukan presensi mandiri.');
        setIsSubmitting(false);
        return;
      }

      await apiRequest('/attendance', {
        method: 'POST',
        body: JSON.stringify({
          schedule_id: selectedSchedule,
          date: new Date(selectedDate).toISOString(),
          attendances: studentAttendances,
        }),
      });
      setSubmitted(true);
      loadSelfAttendance();
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-on-surface">Presensi Mandiri Siswa</h3>
        <p className="text-sm text-on-surface-variant mt-1">Pantau kehadiran siswa yang melakukan presensi mandiri per kelas dan tanggal.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Siswa', value: stats.total, color: 'text-on-surface' },
            { label: 'Sudah Presensi', value: stats.attended, color: 'text-emerald-600' },
            { label: 'Belum Presensi', value: stats.not_attended, color: 'text-amber-600' },
            { label: 'Total Record', value: stats.total_records, color: 'text-blue-600' },
          ].map(item => (
            <div key={item.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{item.label}</p>
              <p className={cn("text-2xl font-black mt-1", item.color)}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

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
              <option value="">Pilih Jadwal (opsional)</option>
              {schedules.map(s => <option key={s.id} value={s.id}>{s.subject?.name} ({s.day} {s.start_time})</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Tanggal</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : !selectedClass ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center shadow-sm">
          <Users className="w-12 h-12 text-outline mx-auto mb-3 opacity-30" />
          <p className="text-on-surface-variant font-medium">Pilih kelas untuk menampilkan status presensi mandiri.</p>
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
                {student.has_self_attended ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sudah Presensi ({student.total_attended}x)
                    </span>
                    {student.total_attended > 0 && selectedSchedule && (
                      <div className="flex gap-1">
                        {['hadir', 'sakit', 'izin', 'alfa'].map(status => {
                          const key = selectedSchedule + '-' + student.id;
                          const isActive = attendanceData[key] === status;
                          return (
                            <button
                              key={status}
                              onClick={() => handleSetStatus(student.id, selectedSchedule, status)}
                              className={cn(
                                "px-2 py-1 rounded text-[10px] font-bold border transition-all",
                                isActive
                                  ? STATUS_CONFIG[status].color + ' scale-105 shadow-sm'
                                  : 'bg-surface-container text-on-surface-variant border-outline-variant/50 opacity-50 hover:opacity-80'
                              )}
                            >
                              {STATUS_CONFIG[status].label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-[11px] font-bold">
                      <XCircle className="w-3.5 h-3.5" />
                      Belum Presensi
                    </span>
                    {selectedSchedule && isTeacher && (
                      <div className="flex gap-1">
                        {['hadir', 'sakit', 'izin', 'alfa'].map(status => {
                          const key = selectedSchedule + '-' + student.id;
                          const isActive = attendanceData[key] === status;
                          return (
                            <button
                              key={status}
                              onClick={() => handleSetStatus(student.id, selectedSchedule, status)}
                              className={cn(
                                "px-2 py-1 rounded text-[10px] font-bold border transition-all",
                                isActive
                                  ? STATUS_CONFIG[status].color + ' scale-105 shadow-sm'
                                  : 'bg-surface-container text-on-surface-variant border-outline-variant/50 opacity-50 hover:opacity-80'
                              )}
                            >
                              {STATUS_CONFIG[status].label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {selectedSchedule && isTeacher && (
            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-between items-center">
              <span className="text-xs font-medium text-on-surface-variant">{students.length} siswa</span>
              {submitted ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm"><CheckCircle2 className="w-5 h-5" /> Presensi tersimpan!</div>
              ) : (
                <button onClick={handleSave} disabled={isSubmitting} className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Simpan Presensi
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
