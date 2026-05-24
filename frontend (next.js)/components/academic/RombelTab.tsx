'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Users, User, School } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';

export default function RombelTab() {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const res = await apiRequest('/classes?limit=100');
        setClasses(Array.isArray(res) ? res : (res.data || []));
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchClasses();
  }, []);

  const selectClass = async (cls: any) => {
    setSelectedClass(cls);
    setLoadingStudents(true);
    try {
      const res = await apiRequest(`/classes/${cls.id}/students`);
      setStudents(Array.isArray(res) ? res : []);
    } catch (err) { console.error(err); setStudents([]); }
    finally { setLoadingStudents(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-on-surface">Rombongan Belajar</h3>
        <p className="text-sm text-on-surface-variant mt-1">Kelola wali kelas dan daftar anggota kelas per tahun ajaran.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.length === 0 ? (
              <div className="col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center">
                <School className="w-12 h-12 text-outline mx-auto mb-3 opacity-30" />
                <p className="text-on-surface-variant font-medium">Belum ada data kelas.</p>
              </div>
            ) : classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => selectClass(cls)}
                className={cn(
                  "bg-surface-container-lowest border rounded-2xl p-5 text-left transition-all hover:shadow-md hover:border-primary/30 group",
                  selectedClass?.id === cls.id ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-outline-variant shadow-sm'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <School className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container px-2 py-1 rounded-lg">
                    {cls.major?.name || '-'}
                  </span>
                </div>
                <h4 className="font-black text-lg text-on-surface">{cls.name}</h4>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-semibold">{cls.homeroom_teacher?.full_name || 'Belum ada wali kelas'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-on-surface-variant">
                  <span className="font-medium">{cls.batch?.name || '-'}</span>
                  <span>•</span>
                  <span className="font-medium">{cls.major?.branch?.name || '-'}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Student List Panel */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant bg-surface">
              <h4 className="font-bold text-sm text-on-surface">
                {selectedClass ? `Anggota: ${selectedClass.name}` : 'Pilih Kelas'}
              </h4>
              {selectedClass?.homeroom_teacher && (
                <p className="text-[10px] text-on-surface-variant font-medium mt-1">
                  Wali Kelas: {selectedClass.homeroom_teacher.full_name}
                </p>
              )}
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {!selectedClass ? (
                <div className="p-8 text-center">
                  <Users className="w-10 h-10 text-outline mx-auto mb-2 opacity-30" />
                  <p className="text-xs text-on-surface-variant">Klik kelas untuk melihat anggota.</p>
                </div>
              ) : loadingStudents ? (
                <div className="p-8 text-center"><Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" /></div>
              ) : students.length === 0 ? (
                <div className="p-8 text-center"><p className="text-xs text-on-surface-variant">Belum ada siswa di kelas ini.</p></div>
              ) : (
                <div className="divide-y divide-outline-variant/50">
                  {students.map((student, i) => (
                    <div key={student.id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-container/30 transition-colors">
                      <span className="text-[10px] font-bold text-on-surface-variant w-6">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] uppercase flex-shrink-0">
                        {student.full_name?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-on-surface truncate">{student.full_name}</p>
                        <p className="text-[10px] text-on-surface-variant">{student.nis} • {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {students.length > 0 && (
              <div className="px-5 py-3 border-t border-outline-variant bg-surface text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Total: {students.length} siswa
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
