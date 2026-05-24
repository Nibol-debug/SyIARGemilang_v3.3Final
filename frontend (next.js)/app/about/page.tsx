'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronRight, ExternalLink, MapPin, BookOpen, Award, Users, Target, Eye, Heart, Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Beranda', href: '/' },
  { label: 'Profile', href: '/about' },
  { label: 'Program', href: '/#programs' },
  { label: 'Mitra', href: '/#partners' },
  { label: 'Kontak', href: '/#footer' },
];

function useScrollOpacity() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
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
      { threshold: 0.1 }
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

export default function AboutPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useScrollOpacity();
  useRevealAnimation();
  useHashScroll();

  return (
    <div className="min-h-screen bg-surface text-on-surface overflow-x-hidden">
      {/* Navbar */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-surface-container-lowest/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/A.webp" alt="Syiar Gemilang" className="w-9 h-9 object-cover rounded-xl shadow-md" />
              <span className="font-black text-sm md:text-base tracking-tight leading-none">
                <span className="text-on-surface">SYIAR</span><br /><span className="text-secondary">GEMILANG</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold rounded-xl transition-all link-underline",
                    item.href === '/about'
                      ? "text-primary bg-primary/10"
                      : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/ppdb"
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all btn-press"
              >
                Daftar PPDB
              </Link>
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-surface-container-lowest shadow-2xl notification-enter flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant">
              <span className="font-black text-sm tracking-tight">
                <span className="text-on-surface">SYIAR</span> <span className="text-secondary">GEMILANG</span>
              </span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-surface-container transition-colors icon-bounce">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 space-y-1">
              {NAV_ITEMS.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all anim-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 space-y-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all"
                >
                  Masuk
                </Link>
                <Link
                  href="/ppdb"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20 transition-all"
                >
                  Daftar PPDB
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://rumahgemilang.com/wp-content/uploads/2025/02/begron-biru.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1c30]/90 via-[#0b1c30]/80 to-[#0b1c30]/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight anim-bounce-in">
            TENTANG KAMI
          </h1>
          <p className="mt-4 text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto anim-fade-in-up anim-delay-200">
            Mengenal lebih dekat Rumah Gemilang Indonesia
          </p>
        </div>
      </section>

      {/* Sejarah */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="reveal opacity-0">
              <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">
                SEJARAH<br />
                <span className="text-primary">RUMAH GEMILANG INDONESIA</span>
              </h2>
              <div className="w-16 h-1 bg-primary rounded-full mt-4 mb-6" />
              <p className="text-on-surface-variant leading-relaxed text-base md:text-lg mb-4">
                Rumah Gemilang Indonesia (RGI), berdiri di lahan wakaf seluas 2.300 meter persegi yang bertempat di Kampung Kebon Kopi, Kelurahan Pengasinan, Kecamatan Sawangan, Kota Depok Jawa Barat.
              </p>
              <p className="text-on-surface-variant leading-relaxed text-base md:text-lg mb-4">
                Rumah Gemilang Indonesia merupakan sebuah unit program pemberdayaan dan pusat pelatihan (empowering and training center) di bawah direktorat Program Lembaga Amil Zakat Nasional Al-Azhar. Secara resmi, RGI mulai beroperasi sejak 1 Juni 2009 dengan melakukan sosialisasi kepada masyarakat di wilayah Kec. Sawangan Kota Depok dan sekitarnya.
              </p>
              <p className="text-on-surface-variant leading-relaxed text-base md:text-lg">
                Sebagai bagian dari program pemberdayaan Lembaga Amil Zakat Nasional Al-Azhar, RGI mengadopsi model pesantren yang fokus pada penyelenggaraan pendidikan non formal dalam kemasan short course (kursus singkat). Perpaduan ini bertujuan agar para peserta pelatihan RGI tidak hanya menyerap pengetahuan dan keterampilan unggul yang menjadi pondasi masa depan mereka, tapi juga memiliki pengetahuan akidah islam yang baik.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4 reveal opacity-0">
              <div className="space-y-3 md:space-y-4">
                <div className="overflow-hidden rounded-2xl shadow-lg card-hover">
                  <img
                    src="https://rumahgemilang.com/wp-content/uploads/2026/05/IMG_9180-scaled.jpg"
                    alt="Rumah Gemilang Indonesia"
                    className="w-full h-48 md:h-56 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-lg card-hover">
                  <img
                    src="https://rumahgemilang.com/wp-content/uploads/2026/05/photo_6082591599117843794_w-3.jpg"
                    alt="Kegiatan RGI"
                    className="w-full h-32 md:h-40 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="pt-8 md:pt-12 space-y-3 md:space-y-4">
                <div className="overflow-hidden rounded-2xl shadow-lg card-hover">
                  <img
                    src="https://rumahgemilang.com/wp-content/uploads/2025/02/cropped-cropped-Untitled-3-compressed-scaled-1.jpg"
                    alt="Suasana RGI"
                    className="w-full h-40 md:h-52 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-20 md:py-28 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal opacity-0">
            <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">VISI & MISI</h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto mt-4 mb-4" />
            <p className="text-on-surface-variant text-base md:text-lg">Semangat dan arah perjuangan Rumah Gemilang Indonesia</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="reveal opacity-0 bg-surface-container-lowest rounded-2xl p-8 md:p-10 border border-outline-variant shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-black text-on-surface mb-4">Visi</h3>
              <p className="text-on-surface-variant leading-relaxed text-base md:text-lg">
                Menjadi pusat pemberdayaan pemuda usia produktif yang unggul dalam keterampilan, berakidah islam yang baik, dan mampu menanggulangi pengangguran di Indonesia.
              </p>
            </div>
            <div className="reveal opacity-0 bg-surface-container-lowest rounded-2xl p-8 md:p-10 border border-outline-variant shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-2xl font-black text-on-surface mb-4">Misi</h3>
              <ul className="space-y-3 text-on-surface-variant leading-relaxed">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2.5 shrink-0" />
                  Menyelenggarakan pendidikan non-formal berbasis keterampilan (short course) yang relevan dengan kebutuhan industri
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2.5 shrink-0" />
                  Membekali peserta didik dengan pengetahuan akidah islam yang baik sebagai pondasi karakter
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2.5 shrink-0" />
                  Menjalin kemitraan strategis dengan berbagai pihak untuk memperluas kesempatan kerja bagi lulusan
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2.5 shrink-0" />
                  Memberikan akses pendidikan dan pelatihan bagi pemuda dari seluruh wilayah Indonesia
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2.5 shrink-0" />
                  Mengentaskan pengangguran melalui program pemberdayaan pemuda usia produktif
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Program */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal opacity-0">
            <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">PROGRAM KEAHLIAN</h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto mt-4 mb-4" />
            <p className="text-on-surface-variant text-base md:text-lg">8 jurusan yang siap membekali kamu dengan keterampilan masa depan</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 stagger-parent">
            {[
              { name: 'Tata Busana', desc: 'Belajar keterampilan mengenai dunia fashion, merancang pola, dan mengoperasikan mesin jahit.', loc: 'Depok, Surabaya' },
              { name: 'Fotografi & Videografi', desc: 'Belajar keterampilan editing foto dan video, pengambilan gambar secara benar dan profesional.', loc: 'Depok' },
              { name: 'Desain Grafis', desc: 'Belajar keterampilan menjadi seorang desainer handal.', loc: 'Depok, Magelang' },
              { name: 'Teknik Komputer & Jaringan', desc: 'Belajar keterampilan dunia IT seperti jaringan, web, mikrotik, hardware, dan software.', loc: 'Depok' },
              { name: 'Aplikasi Perkantoran', desc: 'Belajar keterampilan aplikasi perkantoran, akun sosial media, dan Microsoft Office.', loc: 'Depok, Jakarta Timur' },
              { name: 'Otomotif (Teknik Sepeda Motor)', desc: 'Belajar keterampilan mekanik dan perbengkelan, kerja mesin, kelistrikan, service, dan manajemen bengkel.', loc: 'Depok' },
              { name: 'Rekayasa Perangkat Lunak', desc: 'Belajar keterampilan membuat web, game, dan bahasa pemrograman HTML, JavaScript, CSS.', loc: 'Surabaya' },
              { name: 'Kuliner Halal', desc: 'Belajar keterampilan memasak dan mengelola usaha kuliner halal.', loc: 'Yogyakarta' },
            ].map((prog, i) => (
              <div key={i} className="stagger-child group">
                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm card-hover">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface text-base">{prog.name}</h3>
                      <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">{prog.desc}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-primary">
                        <MapPin className="w-3 h-3" />
                        {prog.loc}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 reveal opacity-0">
            <Link
              href="/#programs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 transition-all btn-press"
            >
              Lihat Selengkapnya
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quotes */}
      <section className="py-20 md:py-28 bg-primary overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal opacity-0">
          <Quote className="w-12 h-12 text-white/30 mx-auto mb-6" />
          <blockquote className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
            &ldquo;Pusat Pemberdayaan Pemuda Usia Produktif sebagai upaya menanggulangi pengangguran di Indonesia yang telah berhasil mengentaskan ribuan pemuda dari hampir seluruh wilayah Indonesia&rdquo;
          </blockquote>
          <p className="mt-6 text-blue-200 font-semibold">— Rumah Gemilang Indonesia</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center reveal opacity-0">
          <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">
            Bergabunglah Bersama Kami
          </h2>
          <p className="mt-4 text-on-surface-variant text-lg max-w-xl mx-auto">
            Daftarkan segera diri anda, kerabat dan teman kalian untuk bergabung dengan Rumah Gemilang Indonesia. Kuota terbatas!
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ppdb"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-on-primary font-bold text-base shadow-xl hover:brightness-110 transition-all btn-press"
            >
              Daftar Sekarang
              <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=6282123630394&text=Assalammualaikum"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-outline text-on-surface-variant font-bold text-base hover:bg-surface-container transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-inverse-surface text-inverse-on-surface py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/A.webp" alt="Syiar Gemilang" className="w-9 h-9 object-cover rounded-xl shadow-md" />
                <span className="font-black text-sm tracking-tight leading-none">
                  <span className="text-inverse-on-surface">SYIAR</span><br /><span className="text-secondary">GEMILANG</span>
                </span>
              </div>
              <p className="text-sm text-inverse-on-surface/60 leading-relaxed max-w-xs">
                Sistem Informasi Manajemen Pendidikan dan Pemberdayaan untuk Rumah Gemilang Indonesia.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-inverse-on-surface uppercase tracking-wider mb-4">Tautan</h4>
              <ul className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-inverse-on-surface/60 hover:text-inverse-on-surface transition-colors link-underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/ppdb" className="text-sm text-inverse-on-surface/60 hover:text-inverse-on-surface transition-colors link-underline">
                    Pendaftaran PPDB
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-inverse-on-surface uppercase tracking-wider mb-4">Kontak</h4>
              <ul className="space-y-3 text-sm text-inverse-on-surface/60">
                <li>Kampung Kebon Kopi, Kel. Pengasinan, Kec. Sawangan, Kota Depok</li>
                <li>
                  <a href="https://api.whatsapp.com/send?phone=6282123630394" target="_blank" rel="noopener noreferrer" className="hover:text-inverse-on-surface transition-colors inline-flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    0821-2363-0394
                  </a>
                </li>
                <li>
                  <a href="https://rumahgemilang.com" target="_blank" rel="noopener noreferrer" className="hover:text-inverse-on-surface transition-colors inline-flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    rumahgemilang.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-inverse-on-surface/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-inverse-on-surface/40">&copy; {new Date().getFullYear()} Syiar Gemilang — Rumah Gemilang Indonesia</p>
            <div className="flex items-center gap-4 text-xs text-inverse-on-surface/40">
              <Link href="/login" className="hover:text-inverse-on-surface transition-colors">Masuk</Link>
              <Link href="/ppdb" className="hover:text-inverse-on-surface transition-colors">PPDB</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
