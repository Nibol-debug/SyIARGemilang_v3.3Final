'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Phone, Mail, ChevronRight, Terminal,
  Code, Shield, Zap, Globe, Sparkles, Cpu, Server, Users,
  Quote, Skull, Ghost, Flame, Crown, Swords, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TEAM = [
  {
    name: 'Gibran',
    title: 'Hacker Handal',
    phone: '0831-4656-4122',
    wa: '6283146564122',
    ig: 'gbrnmewing',
    role: 'Fullstack Developer & System Architect',
    bio: 'Spesialis dalam pengembangan sistem dan keamanan digital. Menguasai berbagai bahasa pemrograman dan framework modern.',
    icon: Crown,
    color: 'from-cyan-400 to-blue-600',
    bgGlow: 'bg-cyan-500/20',
    borderGlow: 'border-cyan-500/30',
    shadowGlow: 'shadow-cyan-500/10',
    quote: {
      text: 'Jangan Buat pelanggaran di RGI ya! bukan berarti aku peduli sama kalian hmmph-!',
      by: 'Gibran'
    }
  },
  {
    name: 'Ramzie',
    title: 'Manusia Serigala',
    phone: '0897-4795-738',
    wa: '628974795738',
    ig: 'ramzie_king',
    role: 'UI/UX Designer & Frontend Engineer',
    bio: 'Ahli dalam menciptakan antarmuka yang intuitif dan pengalaman pengguna yang memukau. Kreatif dan detail-oriented.',
    icon: Ghost,
    color: 'from-purple-400 to-pink-600',
    bgGlow: 'bg-purple-500/20',
    borderGlow: 'border-purple-500/30',
    shadowGlow: 'shadow-purple-500/10',
    quote: {
      text: 'Hidup itu indah kalau ada kamu, mmm-maksudnya kalau gak ada masalah',
      by: 'ramzie'
    }
  },
];

const SKILLS = [
  { icon: Shield, label: 'System Security', color: 'text-cyan-400' },
  { icon: Code, label: 'Fullstack Dev', color: 'text-blue-400' },
  { icon: Swords, label: 'Ethical Hacking', color: 'text-emerald-400' },
  { icon: Flame, label: '24/7 Support', color: 'text-orange-400' },
  { icon: Skull, label: 'Bug Hunter', color: 'text-red-400' },
  { icon: Crown, label: 'Elite Squad', color: 'text-yellow-400' },
];

function useMouseGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return pos;
}

export default function SupportPage() {
  const mouse = useMouseGlow();

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-hidden anim-fade-in-up">

      {/* Animated particles bg */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-cyan-500/5 to-blue-500/5 blur-[120px] transition-all duration-1000"
          style={{ left: mouse.x - 300, top: mouse.y - 300 }}
        />
        <div className="absolute inset-0 opacity-[.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* ── Hero ── */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] via-[#0d1528] to-[#0a0f1e]" />
          <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-200/60 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali
          </Link>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 anim-fade-in-up anim-delay-100">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[.04] border border-white/[.08] text-[11px] font-semibold text-cyan-300 uppercase tracking-widest">
                <Terminal className="w-3.5 h-3.5" />
                <span className="animate-pulse">●</span>
                Tim DEV-OPS
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
                Pusat Bantuan
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300">
                  &amp; Dukungan Teknis
                </span>
              </h1>
              <p className="text-blue-200/50 text-[15px] leading-relaxed">
                Tim pengembang dan teknisi handal yang siap membantu Anda 24/7.
                Hubungi kami untuk segala kebutuhan teknis.
              </p>
              <div className="flex gap-3 pt-2">
                <a href="https://wa.me/6283146564122" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[.97] transition-all">
                  <Phone className="w-4 h-4" />
                  Hubungi WA
                </a>
                <a href="#team"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white/80 font-semibold text-sm border border-white/10 hover:bg-white/[.04] transition-all">
                  Lihat Tim
                </a>
              </div>
            </div>

            {/* Skill badges grid */}
            <div className="grid grid-cols-2 gap-3 anim-fade-in-up anim-delay-200">
              {SKILLS.map((skill, i) => (
                <div key={i} className={cn(
                  'group relative px-4 py-4 rounded-2xl border border-white/[.06] bg-white/[.02] backdrop-blur',
                  'hover:bg-white/[.04] hover:border-white/[.10] transition-all hover:-translate-y-0.5'
                )}>
                  <div className={cn('text-lg mb-1.5', skill.color)}>
                    <skill.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[12px] font-bold text-blue-200/60 uppercase tracking-wider">
                    {skill.label}
                  </p>
                  <div className={cn(
                    'absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse',
                    skill.color.replace('text-', 'bg-')
                  )} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section id="team" className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 anim-fade-in-up">
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">The Squad</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mt-3">
              DEV-OPS{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">Syiar Gemilang</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full mx-auto mt-4" />
            <p className="text-blue-200/40 text-[15px] max-w-lg mx-auto mt-4">
              Para elit di balik layar yang memastikan sistem berjalan lancar
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {TEAM.map((member, i) => {
              const Icon = member.icon;
              return (
                <div key={i} className={cn(
                  'stagger-child group relative rounded-3xl overflow-hidden',
                  'border transition-all duration-500',
                  member.borderGlow,
                  'bg-gradient-to-b from-white/[.03] to-transparent',
                  'hover:shadow-xl',
                  member.shadowGlow,
                  'hover:-translate-y-1'
                )}>
                  {/* Glow bg */}
                  <div className={cn(
                    'absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-20',
                    'group-hover:opacity-40 transition-opacity duration-700',
                    member.bgGlow
                  )} />

                  {/* Top accent line */}
                  <div className={cn('h-1.5 w-full bg-gradient-to-r', member.color)} />

                  <div className="relative p-8 md:p-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={cn(
                        'w-16 h-16 rounded-2xl flex items-center justify-center',
                'bg-gradient-to-br shadow-lg shadow-black/20',
                        member.color
                      )}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-emerald-400/50" />
                        <span className="w-2 h-2 rounded-full bg-emerald-400/30" />
                      </div>
                    </div>

                    {/* Name & Title */}
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {member.name}
                    </h3>
                    <p className={cn('text-sm font-bold mt-1 bg-gradient-to-r bg-clip-text text-transparent', member.color)}>
                      {member.title}
                    </p>
                    <p className="text-xs text-blue-200/40 font-medium mt-1">
                      {member.role}
                    </p>

                    {/* Bio */}
                    <p className="text-sm text-blue-200/50 leading-relaxed mt-4 border-t border-white/[.06] pt-4">
                      {member.bio}
                    </p>

                    {/* Contacts */}
                    <div className="mt-6 space-y-3">
                      <a
                        href={`https://wa.me/${member.wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group/btn',
                          'hover:bg-white/[.04]',
                          member.borderGlow
                        )}
                      >
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br', member.color)}>
                          <Phone className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-blue-200/40 uppercase tracking-widest">WhatsApp</p>
                          <p className="text-sm font-bold text-white">{member.phone}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover/btn:translate-x-1 transition-transform" />
                      </a>

                      <a
                        href={`https://instagram.com/${member.ig}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group/btn',
                          'hover:bg-white/[.04]',
                          member.borderGlow
                        )}
                      >
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br', member.color)}>
                          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-blue-200/40 uppercase tracking-widest">Instagram</p>
                          <p className="text-sm font-bold text-white">@{member.ig}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Quotes ── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] via-[#0d1528] to-[#0a0f1e]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {TEAM.map((member, i) => (
            <div key={i} className={cn(
              'anim-fade-in-up relative p-8 md:p-10 rounded-3xl border backdrop-blur',
              member.borderGlow,
              'bg-white/[.02]'
            )} style={{ animationDelay: `${i * 150}ms` }}>
              {/* Decorative quote mark */}
              <Quote className={cn(
                'absolute -top-4 -left-2 w-12 h-12 opacity-10',
                i === 0 ? 'text-cyan-400' : 'text-purple-400'
              )} />

              <div className="flex items-start gap-5">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-lg',
                  member.color
                )}>
                  <Quote className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed italic">
                    &ldquo;{member.quote.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <div className={cn('w-1.5 h-1.5 rounded-full', i === 0 ? 'bg-cyan-400' : 'bg-purple-400')} />
                    <p className={cn(
                      'text-xs font-bold uppercase tracking-widest',
                      i === 0 ? 'text-cyan-300' : 'text-purple-300'
                    )}>
                      by: {member.quote.by}
                    </p>
                  </div>
                </div>

                {/* Anime sparkle */}
                <div className="hidden md:block">
                  <Heart className={cn(
                    'w-5 h-5 animate-pulse',
                    i === 0 ? 'text-cyan-400/30' : 'text-purple-400/30'
                  )} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#0d1528] to-[#0a0f1e]" />
        <div className="absolute inset-0 opacity-[.06]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }} />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center anim-fade-in-up space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[.04] border border-white/[.08] text-[11px] font-semibold text-cyan-300 uppercase tracking-widest">
            <Mail className="w-3.5 h-3.5" />
            Contact Support
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Ada Masalah?<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300">
              Kami Siap Membantu
            </span>
          </h2>
          <p className="text-blue-200/40 text-[15px] max-w-md mx-auto leading-relaxed">
            Tim DEV-OPS kami siap merespon laporan dan permintaan bantuan teknis dengan cepat.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a
              href="https://wa.me/6283146564122"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[.97] transition-all"
            >
              <Phone className="w-4 h-4" />
              Hubungi Via WA
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white/70 font-semibold text-sm border border-white/10 hover:bg-white/[.04] hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#070b14] text-white/60 py-12 border-t border-white/[.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} Syiar Gemilang — Rumah Gemilang Indonesia</p>
            <div className="flex items-center gap-6 text-xs text-white/20">
              <Link href="/" className="hover:text-white/60 transition-colors">Beranda</Link>
              <Link href="/about" className="hover:text-white/60 transition-colors">Tentang</Link>
              <Link href="/ppdb" className="hover:text-white/60 transition-colors">PPDB</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
