'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, GraduationCap, Users, TrendingUp, Award, ChevronRight,
  ExternalLink, ArrowLeft, Laptop, Camera, Palette, FileText,
  Wrench, Code, Utensils, CheckCircle2, School,
  Scissors, Layout, Monitor, Settings, Pen, Camera as CameraIcon,
  BookOpen, Wrench as WrenchIcon, ChefHat, Globe, Database, Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedCounter from '@/components/AnimatedCounter';

const PROGRAMS = [
  {
    name: 'Tata Busana', slug: 'tata-busana', locations: 'Depok, Surabaya', icon: Award,
    image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/TATABUSANA-1.jpg',
    skills: [
      { icon: Scissors, label: 'Mendesain & memotong pola busana' },
      { icon: Award, label: 'Mengoperasikan mesin jahit industri' },
      { icon: Palette, label: 'Kombinasi warna & bahan kain' },
      { icon: Layout, label: 'Membuat busana ready-to-wear' },
      { icon: Pen, label: 'Membuat sketsa fashion & moodboard' },
      { icon: Globe, label: 'Mengikuti tren fashion global' },
    ]
  },
  {
    name: 'Teknik Komputer & Jaringan', slug: 'tkj', locations: 'Depok', icon: Laptop,
    image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/TKJ-1.jpg',
    skills: [
      { icon: Monitor, label: 'Merakit & memperbaiki komputer' },
      { icon: Globe, label: 'Konfigurasi jaringan LAN & WAN' },
      { icon: Settings, label: 'Mikrotik & Cisco router' },
      { icon: Database, label: 'Manajemen server & sistem operasi' },
      { icon: WrenchIcon, label: 'Instalasi kabel fiber optik' },
      { icon: Award, label: 'Keamanan jaringan dasar' },
    ]
  },
  {
    name: 'Fotografi & Videografi', slug: 'fotografi-videografi', locations: 'Depok', icon: Camera,
    image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/FOTO-VIDEO-1.jpg',
    skills: [
      { icon: CameraIcon, label: 'Teknik pengambilan gambar profesional' },
      { icon: Monitor, label: 'Editing foto dengan Lightroom & Photoshop' },
      { icon: Laptop, label: 'Editing video dengan Premiere & CapCut' },
      { icon: Pen, label: 'Naskah & storyboard konten' },
      { icon: Settings, label: 'Setting lighting & komposisi' },
      { icon: Globe, label: 'Content marketing untuk media sosial' },
    ]
  },
  {
    name: 'Desain Grafis', slug: 'desain-grafis', locations: 'Depok, Magelang', icon: Palette,
    image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/DESAIN-GRAFIS.jpg',
    skills: [
      { icon: Pen, label: 'Desain logo & brand identity' },
      { icon: Layout, label: 'Layout majalah, brosur & katalog' },
      { icon: Monitor, label: 'Mastering Adobe Illustrator & Photoshop' },
      { icon: Smartphone, label: 'Desain UI/UX untuk website & apps' },
      { icon: Palette, label: 'Teori warna & tipografi' },
      { icon: Globe, label: 'Desain konten sosial media' },
    ]
  },
  {
    name: 'Aplikasi Perkantoran', slug: 'aplikasi-perkantoran', locations: 'Depok, Jakarta Timur', icon: FileText,
    image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/APLIKASI-PERKANTORAN-1.jpg',
    skills: [
      { icon: FileText, label: 'Microsoft Office (Word, Excel, PPT) lanjutan' },
      { icon: Database, label: 'Manajemen data & administrasi kantor' },
      { icon: Globe, label: 'Surat menyurat & kearsipan digital' },
      { icon: Monitor, label: 'Google Workspace & cloud computing' },
      { icon: Settings, label: 'Sistem informasi manajemen' },
      { icon: Users, label: 'Pelayanan publik & customer service' },
    ]
  },
  {
    name: 'Teknik Sepeda Motor', slug: 'tsm', locations: 'Depok', icon: Wrench,
    image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/TSM-1.jpg',
    skills: [
      { icon: Wrench, label: 'Perbaikan mesin motor 4-tak & 2-tak' },
      { icon: Settings, label: 'Sistem kelistrikan & injeksi motor' },
      { icon: WrenchIcon, label: 'Service & tune-up berkala' },
      { icon: Award, label: 'Manajemen bengkel sederhana' },
      { icon: BookOpen, label: 'Membaca wiring diagram' },
      { icon: CheckCircle2, label: 'Diagnosis kerusakan sistematis' },
    ]
  },
  {
    name: 'Rekayasa Perangkat Lunak', slug: 'rpl', locations: 'Surabaya', icon: Code,
    image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/RPL-1.jpg',
    skills: [
      { icon: Code, label: 'HTML, CSS, JavaScript & framework modern' },
      { icon: Database, label: 'Database MySQL, PostgreSQL & Firebase' },
      { icon: Smartphone, label: 'Membangun website & aplikasi mobile' },
      { icon: Settings, label: 'Version control dengan Git & GitHub' },
      { icon: Globe, label: 'Deployment & hosting aplikasi' },
      { icon: Users, label: 'Kolaborasi tim agile/scrum' },
    ]
  },
  {
    name: 'Kuliner Halal', slug: 'kuliner-halal', locations: 'Yogyakarta', icon: Utensils,
    image: 'https://rumahgemilang.com/wp-content/uploads/2024/05/KULINER-HALAL-1.jpg',
    skills: [
      { icon: ChefHat, label: 'Teknik memasak profesional' },
      { icon: Utensils, label: 'Menu planning & recipe development' },
      { icon: Award, label: 'Standarisasi halal & keamanan pangan' },
      { icon: Users, label: 'Manajemen dapur & catering' },
      { icon: Globe, label: 'Food photography & marketing' },
      { icon: Smartphone, label: 'Manajemen bisnis kuliner digital' },
    ]
  },
];

const BENEFITS = [
  'Gratis biaya pendidikan & asrama',
  'Uang saku bulanan',
  'Sertifikat kompetensi resmi',
  'Bimbingan karakter & akidah',
  'Penyaluran kerja mitra industri',
  'Komersilkan keterampilan',
];

export default function ProgramDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const program = useMemo(() => PROGRAMS.find(p => p.slug === slug), [slug]);

  if (!program) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-4 anim-fade-in-up">
          <School className="w-16 h-16 text-outline-variant mx-auto" />
          <h2 className="text-2xl font-bold text-on-surface">Program tidak ditemukan</h2>
          <p className="text-sm text-on-surface-variant">Program keahlian yang kamu cari tidak tersedia.</p>
          <Link href="/" className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm transition-all hover:opacity-90">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const Icon = program.icon;

  return (
    <div className="min-h-screen bg-surface text-on-surface anim-fade-in-up">

      {/* Hero */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={program.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#091929]/95 via-[#0d2137]/90 to-[#0f2a4a]/85" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-200/80 hover:text-white transition-colors mb-8 anim-fade-in-up">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-5 anim-fade-in-up anim-delay-100">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {program.name}
              </h1>
              <div className="flex items-center gap-2 text-blue-200/80 text-sm font-medium">
                <MapPin className="w-4 h-4" />
                {program.locations}
              </div>
              <p className="text-blue-100/70 leading-relaxed text-[15px] max-w-lg">
                Program keahlian unggulan di Rumah Gemilang Indonesia yang siap membekali kamu dengan keterampilan praktis, pengetahuan akidah, dan karakter kuat untuk masa depan gemilang.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/ppdb" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#091929] font-bold text-sm shadow-lg transition-all hover:shadow-xl active:scale-[.97]">
                  Daftar Sekarang
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <a href="https://api.whatsapp.com/send?phone=6282123630394&text=Assalammualaikum" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white/90 font-semibold text-sm border border-white/15 hover:bg-white/[.06] transition-all">
                  <ExternalLink className="w-4 h-4" />
                  Tanya Admin
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 anim-fade-in-up anim-delay-200">
              {[
                { icon: Users, label: 'Santri Aktif', value: 160, suffix: '+', color: 'text-emerald-400' },
                { icon: GraduationCap, label: 'Alumni', value: 1200, suffix: '+', color: 'text-blue-300' },
                { icon: TrendingUp, label: 'Terserap Kerja', value: 85, suffix: '%', color: 'text-yellow-300' },
                { icon: Award, label: 'Mitra Industri', value: 8, suffix: '+', color: 'text-cyan-300' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/[.06] backdrop-blur border border-white/[.08] rounded-xl p-4 text-center">
                  <div className={cn('w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-2', stat.color)}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div className={cn('text-xl md:text-2xl font-black', stat.color)}>
                    <AnimatedCounter target={stat.value} duration={1000} suffix={stat.suffix} />
                  </div>
                  <p className="text-[10px] font-semibold text-blue-200/60 uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 anim-fade-in-up">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Keahlian</span>
            <h2 className="text-2xl md:text-4xl font-black text-on-surface tracking-tight leading-tight mt-2">
              Yang Akan Kamu Kuasai
            </h2>
            <div className="w-12 h-0.5 bg-primary rounded-full mx-auto mt-3 mb-4" />
            <p className="text-on-surface-variant text-[15px] max-w-lg mx-auto">
              6 kompetensi inti yang bakal kamu dapetin di program {program.name}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {program.skills.map((skill, i) => {
              const SkillIcon = skill.icon;
              return (
                <div key={i} className="anim-fade-in-up group bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 shadow-sm card-hover" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <SkillIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm font-bold text-on-surface leading-snug">{skill.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="py-16 md:py-24 bg-surface-container-low/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="anim-fade-in-up space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Mengapa {program.name}?</span>
              <h2 className="text-2xl md:text-4xl font-black text-on-surface tracking-tight leading-tight">
                Keunggulan Program
              </h2>
              <div className="w-12 h-0.5 bg-primary rounded-full" />
              <p className="text-on-surface-variant leading-relaxed text-[15px]">
                Program ini dirancang untuk memberikan keterampilan teknis yang relevan dengan kebutuhan industri saat ini, dipadukan dengan pembinaan karakter islami dan kewirausahaan.
              </p>
              <Link href="/about" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline underline-offset-4 transition-all">
                Pelajari Selengkapnya
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="anim-fade-in-up anim-delay-100 space-y-4">
              <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 md:p-8 shadow-sm">
                <h3 className="font-bold text-on-surface text-base mb-5 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Benefit untuk Santri
                </h3>
                <ul className="space-y-3">
                  {BENEFITS.map((b, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#0f2a4a] to-[#1e3a5f]" />
        <div className="absolute inset-0 opacity-[.08]">
          <div className="absolute top-10 left-10 w-80 h-80 bg-blue-300 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-[140px]" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center anim-fade-in-up space-y-5">
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Tertarik dengan {program.name}?
          </h2>
          <p className="text-blue-100/60 text-[15px] max-w-lg mx-auto leading-relaxed">
            Daftarkan dirimu sekarang juga! Kuota terbatas untuk setiap angkatan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/ppdb" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-primary font-bold text-sm shadow-lg transition-all hover:shadow-xl active:scale-[.97]">
              Daftar Sekarang
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111827] text-white/80 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/25">&copy; {new Date().getFullYear()} Syiar Gemilang — Rumah Gemilang Indonesia</p>
            <Link href="/" className="text-xs text-white/25 hover:text-white transition-colors">Kembali ke Beranda</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
