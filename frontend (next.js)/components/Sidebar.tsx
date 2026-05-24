'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  BadgeCheck, 
  GraduationCap, 
  ScrollText as QuizIcon, 
  BarChart3, 
  Settings, 
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  ClipboardList,
  Wallet,
  Package,
  BookOpen,
  Calendar,
  Layers,
  HeartHandshake,
  Clock,
  DollarSign,
  Award,
  ArrowRightLeft,
  History,
  ChevronDown,
  ChevronRight,
  FileText,
  Book,
  CheckSquare,
  Target,
  FileSpreadsheet,
  School,
  UserCheck,
  User
} from 'lucide-react';
import { cn, getUserFromToken } from '../lib/utils';

const mainModules = [
  {
    icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard',
    permissions: [],
  },
  {
    icon: Users, label: 'Manajemen Siswa', path: '/students',
    permissions: ['manage_students', 'view_students'],
  },
  {
    icon: BadgeCheck, label: 'Kepegawaian (HRM)', path: '/hrm', hasSubmenu: true,
    permissions: ['manage_hrm', 'view_hrm'],
    subItems: [
      { label: 'Manajemen Pegawai', path: '/hrm', icon: Users },
      { label: 'Presensi Pegawai', path: '/hrm/attendance', icon: Clock },
      { label: 'Cuti & Izin Saya', path: '/hrm/my-leaves', icon: Calendar },
      { label: 'Approval Cuti', path: '/hrm/leaves-approval', icon: ShieldCheck },
      { label: 'Slip Gaji Saya', path: '/hrm/my-payroll', icon: DollarSign },
      { label: 'Manajemen Payroll', path: '/hrm/payrolls', icon: DollarSign },
      { label: 'PKG Saya', path: '/hrm/my-appraisal', icon: Award },
      { label: 'Evaluasi Kinerja', path: '/hrm/appraisals', icon: Award },
      { label: 'Riwayat Pegawai', path: '/hrm/history', icon: History },
    ],
  },
  {
    icon: GraduationCap, label: 'Akademik', path: '/academic', hasSubmenu: true,
    permissions: ['manage_academic', 'view_academic'],
    subItems: [
      { label: 'Dashboard Akademik', path: '/academic', icon: LayoutDashboard },
      { label: 'Mata Pelajaran', path: '/academic?tab=subjects', icon: Book },
      { label: 'Jadwal Pelajaran', path: '/academic?tab=schedule', icon: Calendar },
      { label: 'Presensi Siswa', path: '/academic?tab=attendance', icon: UserCheck },
      { label: 'Rombel', path: '/academic?tab=rombel', icon: Layers },
      { label: 'Jurnal Mengajar', path: '/academic?tab=teaching-log', icon: FileText },
      { label: 'Kalender Akademik', path: '/academic?tab=calendar', icon: Clock },
      { label: 'Penilaian Perilaku', path: '/academic/behavior', icon: HeartHandshake },
    ],
  },
  {
    icon: QuizIcon, label: 'Modul Ujian (CBT)', path: '/cbt', hasSubmenu: true,
    permissions: ['manage_exams', 'view_exams'],
    subItems: [
      { label: 'Kelola Ujian', path: '/cbt', icon: FileSpreadsheet },
      { label: 'Bank Soal', path: '/cbt/question-banks', icon: BookOpen },
    ],
  },
  {
    icon: BarChart3, label: 'Penilaian', path: '/grading', hasSubmenu: true,
    permissions: ['manage_grades', 'view_grades'],
    subItems: [
      { label: 'Input Nilai', path: '/grading', icon: CheckSquare },
      { label: 'Analisis Nilai', path: '/grading/analysis', icon: Target },
      { label: 'Remedial', path: '/grading/remedial', icon: Award },
      { label: 'SHB', path: '/grading/report-cards', icon: FileText },
      { label: 'Pengaturan Nilai', path: '/grading/settings', icon: Settings },
    ],
  },
  {
    icon: ClipboardList, label: 'PPDB Online', path: '/ppdb-admin',
    permissions: ['manage_applicants', 'view_applicants'],
  },
  {
    icon: Wallet, label: 'Keuangan', path: '/finance', hasSubmenu: false,
    permissions: ['manage_finance', 'view_finance'],
  },
  {
    icon: Package, label: 'Inventaris', path: '/assets', hasSubmenu: true,
    permissions: ['manage_assets', 'view_assets'],
    subItems: [
      { label: 'Daftar Inventaris', path: '/assets', icon: Package },
      { label: 'Peminjaman Aset', path: '/assets/loans', icon: ArrowRightLeft },
    ],
  },
  {
    icon: BarChart3, label: 'Laporan', path: '/reports', hasSubmenu: true,
    permissions: ['view_reports'],
    subItems: [
      { label: 'Ringkasan', path: '/reports', icon: LayoutDashboard },
      { label: 'Presensi', path: '/reports/attendance', icon: Clock },
      { label: 'Keuangan', path: '/reports/finance', icon: Wallet },
      { label: 'Akademik', path: '/reports/academic', icon: GraduationCap },
    ],
  },
];

const masterDataItems = [
  { icon: BookOpen, label: 'Data Jurusan', path: '/majors', permissions: ['manage_majors', 'view_majors'] },
  { icon: Calendar, label: 'Data Angkatan', path: '/batches', permissions: ['manage_batches', 'view_batches'] },
  { icon: Layers, label: 'Data Kelas', path: '/classes', permissions: ['manage_classes', 'view_classes'] },
  { icon: ShieldCheck, label: 'Manajemen Pengguna', path: '/users', permissions: ['manage_users', 'view_users'] },
];

const hasAnyPermission = (userPerms: string[], itemPerms: string[]) => {
  if (!itemPerms || itemPerms.length === 0) return true;
  return itemPerms.some(p => userPerms.includes(p));
};

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [user, setUser] = React.useState<any>(null);
  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setUser(getUserFromToken());
  }, []);

  React.useEffect(() => {
    const expanded: Record<string, boolean> = {};
    mainModules.forEach(m => {
      if (m.hasSubmenu && (pathname === m.path || pathname?.startsWith(m.path + '/'))) {
        expanded[m.path] = true;
      }
    });
    setExpandedMenus(prev => ({ ...prev, ...expanded }));
  }, [pathname]);

  const toggleMenu = (path: string) => {
    setExpandedMenus(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const userPerms: string[] = user?.permissions || [];
  const filteredMain = mainModules.filter(item => !user || hasAnyPermission(userPerms, item.permissions));
  const filteredMaster = masterDataItems.filter(item => !user || hasAnyPermission(userPerms, item.permissions));

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  const submenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={onClose} />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-full w-[240px] bg-surface-container-lowest border-r border-outline-variant flex flex-col py-6 z-50 transition-transform duration-300 md:translate-x-0 overflow-hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-6 mb-8 text-center md:text-left flex-shrink-0">
          <h1 className="text-2xl font-black text-primary tracking-tighter leading-none">SYIAR<br/><span className="text-secondary">GEMILANG</span></h1>
          <p className="text-[10px] text-on-surface-variant font-bold mt-2 uppercase tracking-[0.2em] opacity-60">Educational ERP v3.0</p>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
          <div className="px-4 mb-2 text-[10px] font-black text-outline uppercase tracking-widest opacity-40">Main Modules</div>
          {filteredMain.map((item) => {
            const isItemActive = isActive(item.path);

            if (!item.hasSubmenu) {
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                    isItemActive
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/20 scale-[1.02]"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isItemActive ? "text-on-primary" : "text-outline")} />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <div key={item.path}>
                <button
                  onClick={() => toggleMenu(item.path)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 w-full btn-press-soft",
                    isItemActive
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/20 scale-[1.02]"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 icon-bounce-group", isItemActive ? "text-on-primary" : "text-outline")} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    expandedMenus[item.path] ? "rotate-0" : "-rotate-90"
                  )} />
                </button>
                <div
                  ref={(el) => { submenuRefs.current[item.path] = el; }}
                  className={cn(
                    "ml-6 mt-1 space-y-1 border-l-2 border-outline-variant/30 pl-4 overflow-hidden transition-all duration-300 cubic-bezier(0.16,1,0.3,1)",
                    expandedMenus[item.path]
                      ? "opacity-100 max-h-96 pointer-events-auto"
                      : "opacity-0 max-h-0 pointer-events-none"
                  )}
                >
                  <div className="pt-1 space-y-1">
                    {item.subItems?.map((subItem) => {
                      const isSubActive = pathname === subItem.path || pathname?.startsWith(subItem.path + '/');
                      return (
                        <Link
                          key={subItem.path}
                          href={subItem.path}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200",
                            isSubActive
                              ? "bg-primary/20 text-primary"
                              : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                          )}
                        >
                          <subItem.icon className={cn("w-3.5 h-3.5 icon-bounce-group", isSubActive ? "text-primary" : "text-outline")} />
                          <span>{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredMaster.length > 0 && (
            <>
              <div className="px-4 mt-8 mb-2 text-[10px] font-black text-outline uppercase tracking-widest opacity-40">Master Data & Access</div>
              {filteredMaster.map((item) => {
                const isItemActive = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                      isItemActive
                        ? "bg-secondary-container text-on-secondary-container shadow-sm"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isItemActive ? "text-on-secondary-container" : "text-outline")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="px-3 mt-auto pt-4 border-t border-outline-variant flex-shrink-0">
          <ul className="space-y-1">
            <li>
              <Link href="/profil" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
                <User className="w-5 h-5" />
                <span>Profil</span>
              </Link>
            </li>
            <li>
              <Link href="/settings" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
                <Settings className="w-5 h-5" />
                <span>Pengaturan</span>
              </Link>
            </li>
            <li>
              <button onClick={() => { if (confirm('Yakin ingin keluar?')) { localStorage.removeItem('token'); sessionStorage.removeItem('token'); if (onClose) onClose(); window.location.href = '/login'; } }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Keluar</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}
