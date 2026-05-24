'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, Book, Calendar, CheckCircle, School, FileText, CalendarDays, UserCheck, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DashboardTab from '@/components/academic/DashboardTab';
import SubjectsTab from '@/components/academic/SubjectsTab';
import ScheduleTab from '@/components/academic/ScheduleTab';
import AttendanceTab from '@/components/academic/AttendanceTab';
import SelfAttendanceTab from '@/components/academic/SelfAttendanceTab';
import RombelTab from '@/components/academic/RombelTab';
import TeachingLogTab from '@/components/academic/TeachingLogTab';
import CalendarTab from '@/components/academic/CalendarTab';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'subjects', label: 'Mata Pelajaran', icon: Book },
  { id: 'schedule', label: 'Jadwal', icon: Calendar },
  { id: 'attendance', label: 'Presensi', icon: CheckCircle },
  { id: 'self-attendance', label: 'Presensi Mandiri', icon: UserCheck },
  { id: 'rombel', label: 'Rombel', icon: School },
  { id: 'teaching-log', label: 'Jurnal', icon: FileText },
  { id: 'calendar', label: 'Kalender', icon: CalendarDays },
];

const AcademicPage = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && TABS.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Manajemen Akademik</h2>
          <p className="text-on-surface-variant font-medium mt-1">
            Kelola kurikulum, jadwal, presensi, dan kegiatan belajar mengajar.
          </p>
        </div>
        <a
          href="/grading"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 shrink-0"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Penilaian</span>
        </a>
      </div>

      {/* Tab Navigation */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-1.5 shadow-sm overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && <DashboardTab onTabChange={setActiveTab} />}
        {activeTab === 'subjects' && <SubjectsTab />}
        {activeTab === 'schedule' && <ScheduleTab />}
        {activeTab === 'attendance' && <AttendanceTab />}
        {activeTab === 'self-attendance' && <SelfAttendanceTab />}
        {activeTab === 'rombel' && <RombelTab />}
        {activeTab === 'teaching-log' && <TeachingLogTab />}
        {activeTab === 'calendar' && <CalendarTab />}
      </div>
    </div>
  );
};

export default AcademicPage;
