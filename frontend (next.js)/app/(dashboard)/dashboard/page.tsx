'use client';

import React from 'react';
import { 
  Users, 
  BadgeCheck, 
  ClipboardList,
  ScrollText, 
  GraduationCap, 
  Wallet,
  Package,
  ShieldCheck,
  CheckSquare,
  PlusCircle,
  Upload,
  CreditCard,
  Plus,
  TrendingUp, 
  ArrowRight,
  MoreVertical,
  Loader2,
  BookOpen,
  Layers,
  Calendar,
  CheckCircle2,
  CheckCircle,
  HeartHandshake,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import AnimatedCounter from '@/components/AnimatedCounter';
import Staggered from '@/components/Staggered';
import { cn, getUserFromToken } from '@/lib/utils';

export default function DashboardPage() {
  const [user, setUser] = React.useState<any>(null);
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, logsRes] = await Promise.all([
        apiRequest('/stats/dashboard'),
        apiRequest('/audit-logs?limit=5').catch(() => ({ items: [] }))
      ]);
      setData({ ...res, auditLogs: logsRes.items || [] });
    } catch (err) {
      console.error('Gagal mengambil data dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const currentUser = getUserFromToken();
    setUser(currentUser);
    if (currentUser) {
      fetchData();
    }
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-on-surface-variant font-medium">Memuat Portal {user?.role || ''}...</p>
      </div>
    );
  }

  if (user?.role === 'Instruktur' || user?.role === 'Wali Kelas') {
    return <GuruDashboard data={data} user={user} />;
  }

  if (user?.role === 'Orang Tua') {
    return <ParentDashboard data={data} user={user} />;
  }

  if (user?.role === 'Siswa') {
    return <StudentDashboard data={data} user={user} />;
  }

  return <AdminDashboard data={data} user={user} />;
}

// --- SUB-COMPONENTS ---

function AdminDashboard({ data, user }: any) {
  const router = useRouter();
  
  const statsItems = [
    { label: 'Total Siswa Aktif', value: data?.overview?.totalStudents?.toLocaleString() || '0', icon: Users, trend: '+2.4%', color: 'primary' },
    { label: 'Total Guru & Staf', value: data?.overview?.totalEmployees?.toLocaleString() || '0', icon: BadgeCheck, trend: null, color: 'primary' },
    { label: 'Pendaftar PPDB', value: data?.overview?.applicantPPDB?.toLocaleString() || '0', icon: ClipboardList, trend: null, color: 'primary' },
    { label: 'Ujian Berlangsung', value: data?.overview?.ongoingExams?.toLocaleString() || '0', icon: ScrollText, trend: 'LIVE', color: 'error' },
    { label: 'Kehadiran Siswa', value: `${data?.overview?.attendancePercentage || 0}%`, icon: GraduationCap, trend: 'Hari Ini', color: 'secondary' },
    { label: 'Tagihan SPP Lunas', value: `${data?.overview?.paymentPercentage || 0}%`, icon: Wallet, trend: 'Bulan Ini', color: 'primary' },
    { label: 'Total Aset Inventaris', value: data?.overview?.totalAssets?.toLocaleString() || '0', icon: Package, trend: null, color: 'primary' },
    { label: 'Pengguna Sistem', value: data?.overview?.systemUsers?.toLocaleString() || '0', icon: ShieldCheck, trend: 'Online', color: 'primary' },
  ];

  return (
    <div className="space-y-10">
      <DashboardHeader title="Dashboard ERP Utama" subtitle="Pusat kendali operasional akademik, kesiswaan, keuangan, dan aset Syiar Gemilang." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-parent">
        {statsItems.map((stat, i) => <div key={i} className="stagger-child"><StatCard {...stat} /></div>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm anim-fade-in-up">
          <h3 className="text-xl font-bold text-on-surface mb-8">Distribusi Siswa per Jurusan</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.majorDistribution?.length > 0 ? data.majorDistribution : CHART_DATA_DEFAULT}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#444653', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#444653', fontSize: 12, fontWeight: 500 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                  {(data?.majorDistribution || CHART_DATA_DEFAULT).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 50%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-8">
           <QuickActions items={[
              { label: 'Kelola Jurusan', icon: BookOpen, path: '/majors' },
              { label: 'Kelola Angkatan', icon: Calendar, path: '/batches' },
              { label: 'Kelola Kelas', icon: Layers, path: '/classes' },
              { label: 'Verifikasi PPDB', icon: CheckSquare, path: '/ppdb-admin' },
           ]} />
           <RecentActivity logs={data?.auditLogs} />
        </div>
      </div>
    </div>
  );
}

function GuruDashboard({ data, user }: any) {
  const [isPresensiLoading, setIsPresensiLoading] = React.useState(false);
  
  const handleSelfPresensi = async () => {
    setIsPresensiLoading(true);
    try {
      await apiRequest('/employee-attendance/self', { method: 'POST' });
      alert('Presensi berhasil dicatat! Selamat bertugas.');
    } catch (err: any) {
      alert(err.message || 'Gagal melakukan presensi.');
    } finally {
      setIsPresensiLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <DashboardHeader title={`Selamat Datang, ${user.username}`} subtitle="Portal Guru: Kelola kelas, bank soal, dan pantau ujian yang sedang berlangsung." />
        <button 
          onClick={handleSelfPresensi}
          disabled={isPresensiLoading}
          className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {isPresensiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          PRESENSI HARI INI
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-parent">
        <div className="stagger-child"><StatCard label="Kelas Diampu" value={data?.totalClasses || '0'} icon={Layers} color="primary" /></div>
        <div className="stagger-child"><StatCard label="Ujian Aktif" value={data?.ongoingExams || '0'} icon={ScrollText} color="error" trend="Live" /></div>
        <div className="stagger-child"><StatCard label="Ujian Mendatang" value={data?.upcomingExams || '0'} icon={Calendar} color="secondary" /></div>
        <div className="stagger-child"><StatCard label="Jurnal Masuk" value={data?.recentTeachingLogs?.length || '0'} icon={BookOpen} color="primary" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
               <h3 className="text-xl font-bold text-on-surface mb-6">Jurnal Mengajar Terakhir</h3>
               <div className="space-y-4">
                  {data?.recentTeachingLogs?.length > 0 ? data.recentTeachingLogs.map((log: any) => (
                    <div key={log.id} className="p-4 border border-outline-variant rounded-xl flex justify-between items-center bg-surface">
                       <div>
                          <p className="font-bold text-on-surface">{log.subject?.name}</p>
                          <p className="text-xs text-on-surface-variant">Kelas: {log.class?.name} • {new Date(log.date).toLocaleDateString()}</p>
                       </div>
                       <div className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full uppercase tracking-tighter">Terkirim</div>
                    </div>
                  )) : (
                    <p className="text-sm text-on-surface-variant italic">Belum ada jurnal mengajar.</p>
                  )}
               </div>
            </div>
         </div>
         <div className="flex flex-col gap-8">
            <QuickActions items={[
              { label: 'Manajemen Kelas', icon: Layers, path: '/academic' },
              { label: 'Bank Soal CBT', icon: ScrollText, path: '/cbt' },
              { label: 'Input Nilai', icon: CheckSquare, path: '/grading' },
              { label: 'Presensi Siswa', icon: Users, path: '/academic' },
            ]} />
            <RecentActivity logs={data?.auditLogs} />
         </div>
      </div>
    </div>
  );
}

function StudentDashboard({ data, user }: any) {
  const [isPresensiLoading, setIsPresensiLoading] = React.useState(false);
  const [todaySchedules, setTodaySchedules] = React.useState<any[]>([]);
  const [showPresensi, setShowPresensi] = React.useState(false);

  React.useEffect(() => {
    const fetchTodaySchedule = async () => {
      try {
        const studentRes = await apiRequest(`/students/${user?.studentId}`);
        const classId = studentRes?.class_id;
        if (classId) {
          const schedRes = await apiRequest(`/schedules?class_id=${classId}`);
          const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
          const todayName = days[new Date().getDay()];
          setTodaySchedules((Array.isArray(schedRes) ? schedRes : schedRes?.data || []).filter((s: any) => s.day === todayName));
        }
      } catch {}
    };
    if (user?.studentId) fetchTodaySchedule();
  }, [user]);

  const handleSelfPresensi = async (scheduleId: string) => {
    setIsPresensiLoading(true);
    try {
      await apiRequest('/attendance/self', {
        method: 'POST',
        body: JSON.stringify({ schedule_id: scheduleId })
      });
      alert('Presensi berhasil!');
      setShowPresensi(false);
    } catch (err: any) {
      alert(err.message || 'Gagal melakukan presensi.');
    } finally {
      setIsPresensiLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <DashboardHeader title={`Halo, ${user.username}`} subtitle="Portal Siswa: Pantau jadwal ujian, nilai terbaru, dan status administrasi Anda." />
        <button 
          onClick={() => setShowPresensi(!showPresensi)}
          className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-600/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <CheckCircle2 className="w-5 h-5" />
          PRESENSI MANDIRI
        </button>
      </div>

      {showPresensi && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-on-surface mb-4">Presensi Mandiri - Jadwal Hari Ini</h3>
          {todaySchedules.length > 0 ? (
            <div className="space-y-3">
              {todaySchedules.map((sched: any) => (
                <div key={sched.id} className="flex justify-between items-center p-4 border border-outline-variant rounded-xl">
                  <div>
                    <p className="font-bold text-on-surface">{sched.subject?.name || 'Mapel'}</p>
                    <p className="text-xs text-on-surface-variant">{sched.start_time} - {sched.end_time} • {sched.room || 'Ruang'}</p>
                  </div>
                  <button
                    onClick={() => handleSelfPresensi(sched.id)}
                    disabled={isPresensiLoading}
                    className="px-6 py-2 bg-primary text-on-primary text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {isPresensiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Presensi'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant italic">Tidak ada jadwal untuk hari ini.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-parent">
        <div className="stagger-child"><StatCard label="Ujian Berlangsung" value={data?.ongoingExams || '0'} icon={ScrollText} color="error" trend="Akses Sekarang" /></div>
        <div className="stagger-child"><StatCard label="Kehadiran" value={`${data?.attendanceCount || 0}`} icon={Users} color="secondary" trend="Total Hadir" /></div>
        <div className="stagger-child"><StatCard label="Tunggakan SPP" value={data?.unpaidFees?.length || '0'} icon={Wallet} color="primary" trend="Bulan ini" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-on-surface mb-6">Nilai Terakhir</h3>
            <div className="space-y-4">
               {data?.recentGrades?.length > 0 ? data.recentGrades.map((grade: any) => (
                 <div key={grade.id} className="flex justify-between items-center p-4 border-b border-outline-variant/30">
                    <div>
                       <p className="font-bold text-on-surface">{grade.subject?.name}</p>
                       <p className="text-xs text-on-surface-variant capitalize">{grade.type?.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="text-2xl font-black text-primary">{grade.score}</div>
                 </div>
               )) : (
                 <p className="text-sm text-on-surface-variant italic">Belum ada nilai yang diinput.</p>
               )}
            </div>
         </div>
         <div className="flex flex-col gap-8">
            <QuickActions items={[
              { label: 'Ikuti Ujian', icon: ScrollText, path: '/cbt' },
              { label: 'Lihat Rapor', icon: GraduationCap, path: '/grading' },
              { label: 'Bayar SPP', icon: Wallet, path: '/finance' },
            ]} />
         </div>
      </div>
    </div>
  );
}

function ParentDashboard({ data, user }: any) {
  return (
    <div className="space-y-10">
      <DashboardHeader
        title={`Bapak/Ibu ${user.username}`}
        subtitle="Portal Orang Tua: Pantau perkembangan belajar, kehadiran, dan administrasi putra/putri Anda."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-parent">
        <div className="stagger-child"><StatCard label="Kehadiran" value={`${data?.attendanceCount || 0}`} icon={Users} color="secondary" trend="Total Hadir" /></div>
        <div className="stagger-child"><StatCard label="Nilai Terakhir" value={data?.recentGrades?.length || '0'} icon={BarChart3} color="primary" trend="Mata Pelajaran" /></div>
        <div className="stagger-child"><StatCard label="Tagihan SPP" value={data?.unpaidFees?.length || '0'} icon={Wallet} color="error" trend={data?.unpaidFees?.length > 0 ? 'Tertunggak' : 'Lunas'} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-on-surface mb-6">Nilai Terakhir Putra/Putri</h3>
            <div className="space-y-4">
               {data?.recentGrades?.length > 0 ? data.recentGrades.map((grade: any) => (
                 <div key={grade.id} className="flex justify-between items-center p-4 border-b border-outline-variant/30">
                    <div>
                       <p className="font-bold text-on-surface">{grade.subject?.name}</p>
                       <p className="text-xs text-on-surface-variant capitalize">{grade.type}</p>
                    </div>
                    <div className="text-2xl font-black text-primary">{grade.score}</div>
                 </div>
               )) : (
                 <p className="text-sm text-on-surface-variant italic">Belum ada nilai yang diinput.</p>
               )}
            </div>
         </div>
         <div className="flex flex-col gap-8">
            <QuickActions items={[
              { label: 'Lihat Rapor', icon: GraduationCap, path: '/grading' },
              { label: 'Cek Tagihan', icon: Wallet, path: '/finance' },
              { label: 'Penilaian Perilaku', icon: HeartHandshake, path: '/academic/behavior' },
            ]} />
         </div>
      </div>
    </div>
  );
}

// --- REUSABLE WIDGETS ---

function DashboardHeader({ title, subtitle }: any) {
  return (
    <div className="flex justify-between items-end anim-fade-in-down">
      <div>
        <h2 className="text-3xl font-bold text-on-surface tracking-tight">{title}</h2>
        <p className="text-on-surface-variant font-medium mt-1">{subtitle}</p>
      </div>
      <div className="bg-surface-container font-semibold text-on-surface-variant px-5 py-2.5 rounded-lg text-sm border border-outline-variant shadow-sm hidden md:block">
        {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color }: any) {
  const numericValue = parseInt(value?.replace(/[^0-9]/g, '')) || 0;
  const hasPercent = typeof value === 'string' && value.includes('%');

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden group card-hover">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2.5 rounded-full", color === 'error' ? 'bg-error/10 text-error' : color === 'secondary' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary')}>
          <Icon className="w-5 h-5 flex-shrink-0 icon-bounce-group" />
        </div>
        {trend && (
          <span className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 px-2 py-1 rounded-full", color === 'error' ? 'bg-error/10 text-error animate-pulse' : 'bg-secondary-container/30 text-secondary')}>
            {trend.includes('+') && <TrendingUp className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-on-surface tracking-tight">
        {hasPercent ? (
          <>{value}</>
        ) : (
          <AnimatedCounter target={numericValue} duration={900} />
        )}
      </h3>
    </div>
  );
}

function QuickActions({ items }: { items: any[] }) {
  const router = useRouter();
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm anim-fade-in-up anim-delay-200">
      <h3 className="text-xl font-bold text-on-surface mb-6">Aksi Cepat</h3>
      <div className="space-y-4 stagger-parent">
        {items.map((action, i) => (
          <div key={i} className="stagger-child">
            <button 
              onClick={() => router.push(action.path)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-surface-container transition-all group btn-press-soft"
            >
              <div className="flex items-center gap-3 text-on-surface">
                <action.icon className="w-5 h-5 text-outline group-hover:text-primary transition-colors icon-bounce-group" />
                <span className="text-sm font-semibold">{action.label}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-outline-variant group-hover:text-primary transition-all group-hover:translate-x-1" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity({ logs }: { logs?: any[] }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm flex-1 anim-fade-in-up anim-delay-350">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-on-surface">Log Aktivitas</h3>
        <a href="#" className="text-xs font-bold text-primary link-underline">Lihat Semua</a>
      </div>
      <div className="relative pl-6 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/30">
        {logs && logs.length > 0 ? logs.map((log, i) => (
          <div key={i} className="relative anim-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className={`absolute -left-[23px] w-5 h-5 bg-surface-container-lowest border-2 ${i === 0 ? 'border-primary' : 'border-outline-variant'} rounded-full flex items-center justify-center ${i === 0 ? 'anim-scale-in' : ''}`}>
              {i === 0 && <div className="w-2 h-2 bg-primary rounded-full anim-pulse-soft"></div>}
            </div>
            <p className="text-sm text-on-surface leading-snug">
              <span className="font-bold">{log.user?.username || 'Sistem'}</span> {log.action} pada modul {log.module}.
            </p>
            <p className="text-xs font-medium text-outline mt-1.5">{new Date(log.created_at).toLocaleString('id-ID')}</p>
          </div>
        )) : (
          <p className="text-sm text-on-surface-variant italic">Belum ada aktivitas tercatat.</p>
        )}
      </div>
    </div>
  );
}

const CHART_DATA_DEFAULT = [
  { name: 'TKJ', value: 510, color: '#1e40af' },
  { name: 'DBS', value: 360, color: '#173bab' },
  { name: 'DG', value: 430, color: '#3755c3' },
];
