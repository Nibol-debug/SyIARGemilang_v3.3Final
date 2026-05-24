'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Menu, X, ChevronRight, ExternalLink, MapPin, GraduationCap, Users,
  TrendingUp, Award, Laptop, Camera, Palette, FileText, Wrench,
  Code, Utensils, ShieldCheck, Database, UserPlus, ScrollText, Wallet,
  Package, BadgeCheck, Lock, RotateCcw, Play, Monitor, Eye,
  Fingerprint, Shuffle, Clock, CheckCircle2, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedCounter from '@/components/AnimatedCounter';

const NAV_ITEMS = [
  { label: 'Beranda', href: '#hero' },
  { label: 'Profil', href: '#about' },
  { label: 'ERP', href: '#erp' },
  { label: 'Program', href: '#programs' },
  { label: 'Mitra', href: '#partners' },
  { label: 'Kontak', href: '#footer' },
];

const PROGRAMS = [
  { name: 'Tata Busana', slug: 'tata-busana', locations: 'Depok, Surabaya', icon: Award, image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/TATABUSANA-1.jpg' },
  { name: 'Teknik Komputer & Jaringan', slug: 'tkj', locations: 'Depok', icon: Laptop, image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/TKJ-1.jpg' },
  { name: 'Fotografi & Videografi', slug: 'fotografi-videografi', locations: 'Depok', icon: Camera, image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/FOTO-VIDEO-1.jpg' },
  { name: 'Desain Grafis', slug: 'desain-grafis', locations: 'Depok, Magelang', icon: Palette, image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/DESAIN-GRAFIS.jpg' },
  { name: 'Aplikasi Perkantoran', slug: 'aplikasi-perkantoran', locations: 'Depok, Jakarta Timur', icon: FileText, image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/APLIKASI-PERKANTORAN-1.jpg' },
  { name: 'Teknik Sepeda Motor', slug: 'tsm', locations: 'Depok', icon: Wrench, image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/TSM-1.jpg' },
  { name: 'Rekayasa Perangkat Lunak', slug: 'rpl', locations: 'Surabaya', icon: Code, image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/RPL-1.jpg' },
  { name: 'Kuliner Halal', slug: 'kuliner-halal', locations: 'Yogyakarta', icon: Utensils, image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/KULINER-HALAL-1.jpg' },
];

const PARTNERS = [
  { name: 'Universitas Al-Azhar Indonesia', logo: 'https://rumahgemilang.com/wp-content/uploads/2025/02/cropped-logo_Universitas-Al-Azhar-Indonesia.png' },
  { name: 'Paragon Corp', logo: 'https://rumahgemilang.com/wp-content/uploads/2025/02/paragon-corp.98d5977b.png' },
  { name: 'Palija', logo: 'https://rumahgemilang.com/wp-content/uploads/2025/02/logo_Palija.png' },
  { name: 'Adira', logo: 'https://rumahgemilang.com/wp-content/uploads/2025/02/cropped-adira-green.png' },
  { name: '25044480', logo: 'https://rumahgemilang.com/wp-content/uploads/2025/02/25044480.png' },
  { name: 'BAMUIS', logo: 'https://rumahgemilang.com/wp-content/uploads/2025/02/LOGO-BAMUIS-2048x499-1.png' },
  { name: 'YBM', logo: 'https://rumahgemilang.com/wp-content/uploads/2019/04/ybm.png' },
  { name: 'Prudential Syariah', logo: 'https://rumahgemilang.com/wp-content/uploads/2023/09/cropped-Prudential-Syariah-min-min-scaled-1.jpg' },
  { name: 'BAZMA Pertamina', logo: 'https://rumahgemilang.com/wp-content/uploads/2023/06/cropped-BAZMA-PERTAMINA-365x365-1-1.png' },
  { name: 'FP90', logo: 'https://rumahgemilang.com/wp-content/uploads/2023/06/cropped-FP90.jpg' },
  { name: 'CIMB', logo: 'https://rumahgemilang.com/wp-content/uploads/2019/04/cimb.jpg' },
  { name: 'Bank Permata', logo: 'https://rumahgemilang.com/wp-content/uploads/2019/04/logo-permata-bank-png-8.png' },
  { name: 'Wadah', logo: 'https://rumahgemilang.com/wp-content/uploads/2019/04/wadah.png' },
  { name: 'MTT', logo: 'https://rumahgemilang.com/wp-content/uploads/2019/04/mtt1.png' },
  { name: 'Tokopedia', logo: 'https://rumahgemilang.com/wp-content/uploads/2019/04/tokped.jpg' },
  { name: 'JSC', logo: 'https://rumahgemilang.com/wp-content/uploads/2019/04/JSC.png' },
];

const ERP_MODULES = [
  {
    icon: ScrollText,
    title: 'Ujian Online (CBT)',
    desc: 'Bank soal terintegrasi, auto-scoring, anti-cheat engine dengan focus tracking dan fullscreen enforcement.',
  },
  {
    icon: UserPlus,
    title: 'PPDB Online',
    desc: 'Pendaftaran digital, verifikasi berkas, integrasi tes seleksi masuk, hingga daftar ulang otomatis.',
  },
  {
    icon: BadgeCheck,
    title: 'Penilaian & Sertifikat Hasil Belajar (SHB)',
    desc: 'Weighted scoring, KKM otomatis, cetak rapor PDF standar Dapodik dengan tanda tangan digital & QR Code.',
  },
  {
    icon: Users,
    title: 'HRM Kepegawaian',
    desc: 'Profil instruktur, e-wallet sertifikat mengajar, presensi digital, dan dashboard personalia.',
  },
  {
    icon: Wallet,
    title: 'Keuangan & SPP',
    desc: 'Mass billing bulanan, kuitansi PDF dengan QR Code, notifikasi pengingat, dan rekapitulasi kas real-time.',
  },
  {
    icon: Package,
    title: 'Inventaris Aset',
    desc: 'Kategorisasi sarpras, cetak QR Code label aset, stock opname via smartphone, dan log perawatan.',
  },
];

function useScrollState() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return scrolled;
}

function useRevealAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('anim-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function useHashScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    };
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useScrollState();
  useRevealAnimation();
  useHashScroll();

  // CBT Anti-Cheat Simulator
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM] Koneksi WebSocket aktif — port 3307',
    '[SYSTEM] Anti-cheat engine initialized',
    '[SYSTEM] Menunggu aktivitas siswa...',
  ]);
  const [warnings, setWarnings] = useState(0);
  const [status, setStatus] = useState<'active' | 'banned'>('active');

  const simulateCheat = useCallback(() => {
    if (status === 'banned') return;
    const next = warnings + 1;
    const scenarios = [
      '[WARNING] Focus lost — siswa membuka tab baru',
      '[WARNING] Fullscreen exit — siswa keluar mode layar penuh',
      '[WARNING] Secondary display — koneksi monitor eksternal terdeteksi',
    ];
    if (next > 3) return;
    setLogs(prev => [...prev, scenarios[warnings]]);
    setWarnings(next);
    if (next >= 3) {
      setTimeout(() => {
        setLogs(prev => [
          ...prev,
          '[CRITICAL] Batas pelanggaran tercapai (3/3)',
          '[SYSTEM] AUTO-SUBMIT — ujian dikunci otomatis',
        ]);
        setStatus('banned');
      }, 400);
    }
  }, [warnings, status]);

  const resetSim = useCallback(() => {
    setLogs([
      '[SYSTEM] Koneksi WebSocket aktif — port 3307',
      '[SYSTEM] Anti-cheat engine initialized',
      '[SYSTEM] Menunggu aktivitas siswa...',
    ]);
    setWarnings(0);
    setStatus('active');
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface">

      {/* ── Navbar ── */}
      <nav className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-surface-container-lowest/95 backdrop-blur-lg shadow-md shadow-black/[.03] border-b border-outline-variant/40'
          : 'bg-surface-container-lowest border-b border-outline-variant/30'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[72px]">

            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <img src="/A.webp" alt="Syiar Gemilang" className="h-9 w-9 object-cover" />
              <span className="font-black text-[13px] md:text-sm tracking-tight leading-[1.15]">
                <span className="text-on-surface">SYIAR</span><br />
                <span className="text-secondary">GEMILANG</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-[13px] font-semibold text-on-surface-variant hover:text-primary rounded-lg transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-[13px] font-bold text-on-surface-variant hover:text-primary transition-colors">
                Masuk
              </Link>
              <Link
                href="/ppdb"
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-[13px] font-bold shadow-sm hover:shadow-md hover:shadow-primary/15 transition-all active:scale-[.97]"
              >
                Daftar PPDB
              </Link>
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 -mr-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
              aria-label="Buka menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 inset-y-0 w-72 bg-surface-container-lowest shadow-2xl notification-enter flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <img src="/A.webp" alt="Syiar Gemilang" className="h-7 w-7 object-cover" />
                <span className="font-black text-xs tracking-tight">
                  SYIAR <span className="text-secondary">GEMILANG</span>
                </span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 p-4 space-y-0.5">
              {NAV_ITEMS.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all anim-fade-in-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-5 space-y-2.5">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-center px-4 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-bold text-sm transition-all hover:bg-surface-container-low">
                  Masuk
                </Link>
                <Link href="/ppdb" onClick={() => setMobileOpen(false)} className="block text-center px-4 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-sm transition-all">
                  Daftar PPDB
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section id="hero" className="relative pt-[72px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://rumahgemilang.com/wp-content/uploads/2025/02/begron-biru.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#091929]/95 via-[#0d2137]/92 to-[#0f2a4a]/85" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Left — Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[.06] border border-white/[.08] text-[11px] font-semibold text-blue-200/90 uppercase tracking-widest anim-fade-in-up">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Angkatan 35 Gelombang 2 — Kuota Terbatas
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.12] tracking-tight anim-fade-in-up anim-delay-100">
                Pusat Digitalisasi &amp;<br />
                Pemberdayaan Pemuda
              </h1>

              <p className="text-[15px] sm:text-base text-blue-100/70 leading-relaxed max-w-lg anim-fade-in-up anim-delay-200">
                Rumah Gemilang Indonesia mengintegrasikan pendidikan non-formal terakreditasi dengan ekosistem digital <strong className="text-white/90">Syiar Gemilang ERP</strong> — platform terpadu untuk ±1.300 siswa mencakup ujian anti-curang, administrasi, keuangan, dan inventaris.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1 anim-fade-in-up anim-delay-300">
                <Link
                  href="/ppdb"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#091929] font-bold text-sm shadow-lg shadow-black/10 hover:shadow-xl transition-all active:scale-[.97]"
                >
                  Daftar PPDB Online
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#erp"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white/90 font-semibold text-sm border border-white/15 hover:bg-white/[.06] transition-all"
                >
                  Jelajahi Fitur ERP
                </a>
              </div>
            </div>

            {/* Right — CBT Simulator */}
            <div className="lg:col-span-6 anim-fade-in-up anim-delay-200">
              <div className="bg-[#0a1929]/80 backdrop-blur border border-white/[.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/20">

                {/* Title bar */}
                <div className="px-5 py-3.5 bg-white/[.03] border-b border-white/[.06] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="text-[10px] font-semibold text-blue-200/60 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Secure CBT Session
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Ujian Akhir — TKJ</h3>
                      <p className="text-[11px] text-blue-200/50 mt-0.5">Siswa: M. Fathir Maulana</p>
                    </div>
                    <span className={cn(
                      'px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider',
                      status === 'banned'
                        ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                    )}>
                      {status === 'banned' ? 'Auto-Submitted' : 'Secured'}
                    </span>
                  </div>

                  {/* Log output */}
                  <div className="bg-black/30 rounded-xl p-4 border border-white/[.04]">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[.05]">
                      <span className="text-[10px] font-semibold text-blue-300/70 uppercase tracking-wider">Anti-Cheat Logs</span>
                      <span className="text-[10px] text-white/40 font-mono">
                        Warnings: <strong className={cn(warnings >= 3 ? 'text-red-400' : 'text-yellow-400')}>{Math.min(warnings, 3)}/3</strong>
                      </span>
                    </div>
                    <div className="space-y-1 h-[104px] overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed">
                      {logs.map((log, i) => (
                        <div key={i} className={cn(
                          'flex gap-1.5',
                          log.includes('[WARNING]') ? 'text-yellow-300/80' :
                          log.includes('[CRITICAL]') ? 'text-red-400 font-semibold' :
                          'text-emerald-400/70'
                        )}>
                          <span className="shrink-0 text-white/20">&gt;</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Simulator buttons */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={simulateCheat}
                      disabled={status === 'banned'}
                      className={cn(
                        'py-2.5 px-3 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 border transition-all',
                        status === 'banned'
                          ? 'bg-white/[.02] border-white/[.05] text-white/25 cursor-not-allowed'
                          : 'bg-white/[.04] border-white/[.08] text-white/80 hover:bg-white/[.07] active:scale-[.97]'
                      )}
                    >
                      <Play className="w-3 h-3" /> Simulasikan Contek
                    </button>
                    <button
                      onClick={resetSim}
                      className="py-2.5 px-3 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 border border-white/[.08] bg-white/[.04] text-white/80 hover:bg-white/[.07] transition-all active:scale-[.97]"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-2.5 bg-white/[.02] border-t border-white/[.05] flex items-center justify-between text-[9px] text-blue-200/30 font-mono">
                  <span>WebSocket: Active</span>
                  <span>Port 3307 • TLS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative -mt-10 z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 md:p-8 shadow-lg shadow-black/[.03]">
          {[
            { icon: Users, label: 'Santri Aktif', value: 1300, suffix: '+', color: 'text-primary' },
            { icon: TrendingUp, label: 'Alumni Mandiri', value: 8500, suffix: '+', color: 'text-secondary' },
            { icon: GraduationCap, label: 'Jurusan', value: 8, suffix: '', color: 'text-primary' },
            { icon: Award, label: 'Mitra Industri', value: 30, suffix: '+', color: 'text-secondary' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className={cn('w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center mx-auto mb-2.5', stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">
                <AnimatedCounter target={stat.value} duration={1200} suffix={stat.suffix} />
              </div>
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Profil RGI ── */}
      <section id="about" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="md:col-span-7 reveal opacity-0 space-y-5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Profil Institusi</span>
              <h2 className="text-2xl md:text-4xl font-black text-on-surface tracking-tight leading-tight">
                Rumah Gemilang<br />Indonesia
              </h2>
              <div className="w-12 h-0.5 bg-primary rounded-full" />
              <p className="text-on-surface-variant leading-relaxed text-[15px]">
                Berawal dari lahan wakaf di Kampung Kebon Kopi, Kelurahan Pengasinan, Kecamatan Sawangan, Kota Depok — RGI merupakan unit program pemberdayaan dan pusat pelatihan unggulan di bawah naungan <strong>Lembaga Amil Zakat Nasional (LAZ) Al Azhar</strong>.
              </p>
              <p className="text-on-surface-variant leading-relaxed text-[15px]">
                Beroperasi resmi sejak 1 Juni 2009, RGI mengadopsi konsep pesantren dengan diklat kursus singkat. Santri tidak hanya ditempa keterampilan praktis siap kerja, namun juga dibekali pemahaman akidah, ibadah, dan karakter berintegritas.
              </p>
              <div className="pt-1">
                <Link href="/about" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline underline-offset-4 transition-all">
                  Selengkapnya tentang RGI
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="md:col-span-5 reveal opacity-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-2xl shadow-md">
                    <img src="https://rumahgemilang.com/wp-content/uploads/2026/05/IMG_9180-scaled.jpg" alt="RGI" className="w-full h-44 md:h-52 object-cover hover:scale-[1.03] transition-transform duration-500" />
                  </div>
                  <div className="overflow-hidden rounded-2xl shadow-md">
                    <img src="https://rumahgemilang.com/wp-content/uploads/2026/05/photo_6082591599117843794_w-3.jpg" alt="Kegiatan" className="w-full h-28 object-cover hover:scale-[1.03] transition-transform duration-500" />
                  </div>
                </div>
                <div className="pt-6">
                  <div className="overflow-hidden rounded-2xl shadow-md">
                    <img src="https://rumahgemilang.com/wp-content/uploads/2025/02/cropped-cropped-Untitled-3-compressed-scaled-1.jpg" alt="Suasana" className="w-full h-52 md:h-64 object-cover hover:scale-[1.03] transition-transform duration-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ERP Ecosystem ── */}
      <section id="erp" className="py-20 md:py-28 bg-surface-container-low/50 border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 reveal opacity-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Ekosistem Digital</span>
            <h2 className="text-2xl md:text-4xl font-black text-on-surface tracking-tight leading-tight mt-2">
              Syiar Gemilang ERP
            </h2>
            <div className="w-12 h-0.5 bg-primary rounded-full mx-auto mt-3 mb-4" />
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              Sistem ERP terintegrasi untuk mengotomasi seluruh operasional sekolah — dari pendaftaran siswa hingga cetak rapor digital — melayani ±1.300 siswa secara efisien dan paperless.
            </p>
          </div>

          {/* Advantage cards */}
          <div className="grid md:grid-cols-3 gap-5 mb-16 stagger-parent">
            {[
              {
                icon: ShieldCheck,
                title: 'Integritas Ujian',
                desc: 'CBT Core dilindungi focus tracking, device locking, fullscreen enforcement, dan auto-submit bertahap untuk menjamin keaslian nilai siswa.',
                accent: 'text-primary bg-primary/[.06]',
              },
              {
                icon: Database,
                title: 'Single Source of Truth',
                desc: 'Data ±1.300 siswa terintegrasi otomatis dari registrasi PPDB, presensi harian, nilai rapor, status SPP, hingga kelulusan.',
                accent: 'text-secondary bg-secondary/[.06]',
              },
              {
                icon: BadgeCheck,
                title: 'Paperless & Efisien',
                desc: 'Mengeliminasi biaya cetak soal, kuitansi, dan logistik sekolah secara permanen dengan operasional 100% digital.',
                accent: 'text-primary bg-primary/[.06]',
              },
            ].map((adv, i) => (
              <div key={i} className="stagger-child bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 md:p-7 shadow-sm card-hover">
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-4', adv.accent)}>
                  <adv.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-on-surface text-base mb-1.5">{adv.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{adv.desc}</p>
              </div>
            ))}
          </div>

          {/* Module grid */}
          <div className="text-center mb-10 reveal opacity-0">
            <h3 className="text-lg font-bold text-on-surface">Cakupan Layanan Modul</h3>
            <p className="text-xs text-on-surface-variant mt-1">Platform terintegrasi untuk siswa, instruktur, keuangan, dan aset</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-parent">
            {ERP_MODULES.map((mod, i) => (
              <div key={i} className="stagger-child bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 shadow-sm card-hover hover:border-primary/20 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-primary/[.06] flex items-center justify-center shrink-0 text-primary">
                  <mod.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-[15px]">{mod.title}</h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{mod.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Anti-cheat feature highlights */}
          <div className="mt-16 reveal opacity-0">
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/[.06] flex items-center justify-center text-primary">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-base">Sistem Keamanan CBT Anti-Cheat</h3>
                  <p className="text-xs text-on-surface-variant">Proteksi berlapis untuk menjamin integritas ujian digital</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: Eye, label: 'Focus Tracking', desc: 'Deteksi perpindahan tab, window, atau minimalisasi browser secara real-time' },
                  { icon: Monitor, label: 'Fullscreen Enforcement', desc: 'Memaksa mode layar penuh selama ujian berlangsung' },
                  { icon: Fingerprint, label: 'Device Locking', desc: 'Mengunci sesi ujian ke satu perangkat — mencegah login ganda' },
                  { icon: Shuffle, label: 'Acak Soal & Jawaban', desc: 'Setiap siswa mendapat urutan soal dan opsi jawaban berbeda' },
                  { icon: Clock, label: 'Auto-Submit Bertahap', desc: 'Peringatan bertahap lalu force submit jika batas toleransi tercapai' },
                  { icon: CheckCircle2, label: 'Token Sesi & Monitoring', desc: 'Pengawas memantau status siswa secara real-time dari dashboard' },
                ].map((feat, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-surface-container-low/50">
                    <feat.icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface">{feat.label}</h4>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-10 reveal opacity-0">
            <Link href="/about#erp-tech" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline underline-offset-4 transition-all">
              Lihat Spesifikasi Teknis Lengkap
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Programs ── */}
      <section id="programs" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 reveal opacity-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">Jurusan Diklat</span>
            <h2 className="text-2xl md:text-4xl font-black text-on-surface tracking-tight leading-tight mt-2">
              Program Keahlian
            </h2>
            <div className="w-12 h-0.5 bg-primary rounded-full mx-auto mt-3 mb-4" />
            <p className="text-on-surface-variant text-[15px]">
              8 program studi kompeten siap kerja untuk masa depan gemilang.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-parent">
            {PROGRAMS.map((prog, i) => (
              <Link key={i} href={`/${prog.slug}`} className="stagger-child group">
                <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/50 shadow-sm card-hover">
                  <div className="relative overflow-hidden h-44">
                    <img src={prog.image} alt={prog.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/[.06] flex items-center justify-center mb-2.5 group-hover:bg-primary/10 transition-colors">
                      <prog.icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-bold text-on-surface text-sm leading-snug">{prog.name}</h3>
                    <div className="flex items-center gap-1 mt-2 text-[11px] font-medium text-on-surface-variant">
                      <MapPin className="w-3 h-3 text-primary" />
                      {prog.locations}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section id="partners" className="py-20 md:py-28 bg-surface-container-low/30 border-t border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 reveal opacity-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Kolaborasi</span>
            <h2 className="text-2xl md:text-4xl font-black text-on-surface tracking-tight leading-tight mt-2">
              Mitra & Kerjasama
            </h2>
            <div className="w-12 h-0.5 bg-primary rounded-full mx-auto mt-3 mb-4" />
            <p className="text-on-surface-variant text-[15px]">
              Sinergi dengan puluhan perusahaan dan universitas untuk mendukung pelatihan serta penyaluran kerja santri.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger-parent">
            {PARTNERS.map((p, i) => (
              <div key={i} className="stagger-child group">
                <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 h-20 flex items-center justify-center card-hover hover:border-primary/15 transition-all">
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 opacity-50 group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#0f2a4a] to-[#1e3a5f]" />
        <div className="absolute inset-0 opacity-[.08]">
          <div className="absolute top-10 left-10 w-80 h-80 bg-blue-300 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-[140px]" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center reveal opacity-0 space-y-5">
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Mulai Langkah Menuju<br />Masa Depan Gemilang
          </h2>
          <p className="text-blue-100/60 text-[15px] max-w-lg mx-auto leading-relaxed">
            Daftarkan diri Anda, kerabat, atau rekan terbaik untuk bergabung bersama angkatan terbaru Rumah Gemilang Indonesia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/ppdb"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-primary font-bold text-sm shadow-lg transition-all hover:shadow-xl active:scale-[.97]"
            >
              Daftar Sekarang
              <ChevronRight className="w-4 h-4" />
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=6282123630394&text=Assalammualaikum"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white/90 font-semibold text-sm border border-white/15 hover:bg-white/[.06] transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              WhatsApp Admin
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="footer" className="bg-[#111827] text-white/80 py-14 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-8 lg:gap-12">

            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <img src="/A.webp" alt="Syiar Gemilang" className="h-8 w-8 object-cover" />
                <span className="font-black text-xs tracking-tight leading-[1.15]">
                  <span className="text-white">SYIAR</span><br />
                  <span className="text-emerald-400">GEMILANG</span>
                </span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed max-w-sm">
                Sistem Informasi Manajemen Pendidikan, Administrasi Akademik, Keuangan, dan Penyaluran Santri terintegrasi untuk Rumah Gemilang Indonesia.
              </p>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider">Tautan</h4>
              <ul className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-sm text-white/40 hover:text-white transition-colors">{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider">Kontak</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li className="flex gap-2 items-start">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Kp. Kebon Kopi, Kel. Pengasinan, Kec. Sawangan, Kota Depok, Jawa Barat</span>
                </li>
                <li>
                  <a href="https://api.whatsapp.com/send?phone=6282123630394" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3 text-emerald-400" />
                    0821-2363-0394 (Admin)
                  </a>
                </li>
                <li>
                  <a href="https://rumahgemilang.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3 text-emerald-400" />
                    rumahgemilang.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/[.06] flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-white/25">&copy; {new Date().getFullYear()} Syiar Gemilang — Rumah Gemilang Indonesia</p>
            <div className="flex items-center gap-4 text-xs text-white/25">
              <Link href="/login" className="hover:text-white transition-colors">Portal ERP</Link>
              <Link href="/ppdb" className="hover:text-white transition-colors">PPDB</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
