'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, BASE_URL } from '@/lib/api';
import { School, User, Lock, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi');
      return;
    }

    setIsLoading(true);
    setError('');

    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (data.access_token) {
        if (rememberMe) {
          localStorage.setItem('token', data.access_token);
        } else {
          sessionStorage.setItem('token', data.access_token);
        }
        router.push('/dashboard');
      } else {
        setError('Terjadi kesalahan saat login');
      }
    } catch (err: any) {
      setError(`${err.message || 'Terjadi kesalahan koneksi'} (API: ${BASE_URL}/auth/login)`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl anim-scale-in" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-3xl anim-scale-in anim-delay-200" />
      </div>

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors anim-fade-in-up"
      >
        <ArrowLeft className="w-4 h-4" />
        Beranda
      </Link>

      <div className="w-full max-w-[420px] anim-fade-in-up anim-delay-100">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-10 shadow-2xl shadow-primary/5">
          <div className="text-center mb-10 anim-fade-in-up anim-delay-200">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary/20 anim-scale-in anim-delay-300">
              <School className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight anim-fade-in-up anim-delay-350">Syiar Gemilang</h1>
            <p className="text-sm font-medium text-on-surface-variant mt-2 uppercase tracking-widest anim-fade-in-up anim-delay-400">Educational ERP</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            {/* Username */}
            <div className="space-y-2 anim-fade-in-up anim-delay-250">
              <label
                htmlFor="username"
                className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1"
              >
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container border border-outline-variant rounded-xl text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-outline-variant placeholder:font-medium"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 anim-fade-in-up anim-delay-300">
              <label
                htmlFor="password"
                className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-3.5 bg-surface-container border border-outline-variant rounded-xl text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-outline-variant placeholder:font-medium"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3 px-1 anim-fade-in-up anim-delay-350">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="text-sm font-medium text-on-surface-variant cursor-pointer select-none"
              >
                Ingat saya di perangkat ini
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="bg-error-container/30 border border-error/20 text-on-error-container text-sm font-semibold p-4 rounded-xl flex items-center gap-3 anim-fade-in-up"
              >
                <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-on-primary rounded-xl py-3.5 font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed anim-fade-in-up anim-delay-400"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                'Masuk ke Sistem'
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-outline-variant/50 pt-8 anim-fade-in-up anim-delay-450">
            <p className="text-xs font-medium text-on-surface-variant">
              Lupa kredensial akses? Hubungi{' '}
              <Link href="/support" className="text-primary font-bold hover:underline transition-all">
                Administrator IT
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
