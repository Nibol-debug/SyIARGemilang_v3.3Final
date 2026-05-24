'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  User,
  MapPin,
  School,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { MapPicker } from '@/components/MapPicker';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  full_name: string;
  nik: string;
  email: string;
  phone: string;
  gender: string;
  marital_status: string;
  education_level: string;
  father_name: string;
  mother_name: string;
  birth_place: string;
  birth_date: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  previous_school: string;
  document_url: string;
  ktp_url: string;
  kk_url: string;
  sktm_url: string;
  vaccine_url: string;
  health_cert_url: string;
  major_id: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'Biodata', icon: User },
  { num: 2, label: 'Alamat', icon: MapPin },
  { num: 3, label: 'Berkas', icon: School },
  { num: 4, label: 'Konfirmasi', icon: CheckCircle2 },
];

const CRITERIA = [
  'Usia produktif 17–30 tahun',
  'Dari keluarga tidak mampu (dhuafa)',
  'Pendidikan maksimal SLTA/sederajat',
  'Single / belum menikah',
  'Bersedia tinggal di asrama',
  'Sehat jasmani & rohani',
];

const MANDATORY_DOCS: { field: keyof FormData; label: string }[] = [
  { field: 'document_url', label: 'Ijazah / SKL' },
  { field: 'ktp_url', label: 'KTP' },
  { field: 'kk_url', label: 'Kartu Keluarga' },
  { field: 'sktm_url', label: 'SKTM' },
  { field: 'health_cert_url', label: 'Surat Keterangan Sehat' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PPDBRegistrationPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [majors, setMajors] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [ageError, setAgeError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    nik: '',
    email: '',
    phone: '',
    gender: 'male',
    marital_status: 'single',
    education_level: 'SLTA',
    father_name: '',
    mother_name: '',
    birth_place: '',
    birth_date: '',
    address: '',
    latitude: null,
    longitude: null,
    previous_school: '',
    document_url: '',
    ktp_url: '',
    kk_url: '',
    sktm_url: '',
    vaccine_url: '',
    health_cert_url: '',
    major_id: '',
  });

  const patch = (val: Partial<FormData>) => setFormData(prev => ({ ...prev, ...val }));

  const validateAge = (dateStr: string) => {
    if (!dateStr) { setAgeError(''); return; }
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 17 || age > 30) setAgeError(`Usia kamu ${age} tahun. Kriteria penerima manfaat adalah 17–30 tahun`);
    else setAgeError('');
  };

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const res = await apiRequest('/majors?limit=100');
        setMajors(res.data || []);
      } catch (err) {
        console.error('Failed to fetch majors', err);
      }
    };
    const fetchBranches = async () => {
      try {
        const res = await apiRequest('/branches');
        setBranches(Array.isArray(res) ? res : res.data || []);
      } catch (err) {
        console.error('Failed to fetch branches', err);
      }
    };
    fetchMajors();
    fetchBranches();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FormData) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(fieldName);
    const body = new FormData();
    body.append('file', file);
    try {
      const res = await apiRequest('/applicants/upload-document', { method: 'POST', body });
      patch({ [fieldName]: res.url });
    } catch (err: any) {
      alert('Gagal mengupload file: ' + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const { field, label } of MANDATORY_DOCS) {
      if (!formData[field]) {
        alert(`Harap upload berkas ${label} terlebih dahulu`);
        return;
      }
    }

    if (!formData.major_id) {
      alert('Harap pilih jurusan terlebih dahulu');
      return;
    }

    if (ageError) {
      alert(ageError);
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('/applicants', { method: 'POST', body: JSON.stringify(formData) });
      setIsSuccess(true);
    } catch (err: any) {
      alert('Gagal mengirim pendaftaran: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-outline-variant p-10 text-center space-y-5">
          <div className="w-16 h-16 bg-success-container/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 text-success" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-on-surface">Pendaftaran terkirim!</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Data kamu sedang kami verifikasi. Pantau pengumuman via email atau WhatsApp.
            </p>
          </div>
          <Link href="/" className="block w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity btn-press">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // ── Main Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface-container-low py-10 px-4 anim-fade-in-up">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-on-surface transition-colors link-underline">
            <ArrowLeft className="w-4 h-4" />
            Beranda
          </Link>
          <div className="flex items-center gap-2 text-on-surface">
            <ClipboardList className="w-5 h-5 text-primary" />
            <span className="text-base font-bold tracking-tight">PPDB Online 2026</span>
          </div>
        </div>

        {/* Criteria Banner */}
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-5">
          <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Kriteria penerima manfaat RGI
          </p>
          <ul className="grid grid-cols-2 gap-y-1.5 gap-x-4">
            {CRITERIA.map(c => (
              <li key={c} className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Stepper */}
        <div className="bg-white border border-outline-variant rounded-xl px-6 py-4">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border transition-all',
                      step === s.num
                        ? 'bg-primary text-on-primary border-primary'
                        : step > s.num
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-surface text-on-surface-variant border-outline-variant'
                    )}
                  >
                    {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-wider',
                      step >= s.num ? 'text-primary' : 'text-on-surface-variant/50'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-px mx-3 mb-5 transition-colors',
                      step > s.num ? 'bg-primary/30' : 'bg-outline-variant'
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-outline-variant rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit}>

            {/* ── Step 1: Biodata ── */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                <SectionHeader icon={<User className="w-5 h-5" />} title="Informasi pribadi" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nama lengkap" className="sm:col-span-2">
                    <input required placeholder="Budi Santoso" value={formData.full_name}
                      onChange={e => patch({ full_name: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="NIK">
                    <input required placeholder="3201..." value={formData.nik}
                      onChange={e => patch({ nik: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="No. WhatsApp">
                    <input required placeholder="08123456789" value={formData.phone}
                      onChange={e => patch({ phone: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Email aktif" className="sm:col-span-2">
                    <input required type="email" placeholder="budi@example.com" value={formData.email}
                      onChange={e => patch({ email: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Tempat lahir">
                    <input required placeholder="Jakarta" value={formData.birth_place}
                      onChange={e => patch({ birth_place: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Tanggal lahir">
                    <input required type="date" value={formData.birth_date}
                      onChange={e => { patch({ birth_date: e.target.value }); validateAge(e.target.value); }} className={inputCls} />
                    {ageError && (
                      <p className="flex items-center gap-1 text-xs text-error mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {ageError}
                      </p>
                    )}
                  </Field>
                  <Field label="Nama ayah">
                    <input required placeholder="Nama ayah" value={formData.father_name}
                      onChange={e => patch({ father_name: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Nama ibu">
                    <input required placeholder="Nama ibu" value={formData.mother_name}
                      onChange={e => patch({ mother_name: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Jenis kelamin">
                    <div className="flex gap-6 py-2.5">
                      {[{ val: 'male', label: 'Laki-laki' }, { val: 'female', label: 'Perempuan' }].map(g => (
                        <label key={g.val} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="gender" checked={formData.gender === g.val}
                            onChange={() => patch({ gender: g.val })} className="accent-primary w-4 h-4" />
                          <span className="text-sm font-medium">{g.label}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                  <Field label="Pendidikan terakhir" className="sm:col-span-2">
                    <select value={formData.education_level}
                      onChange={e => patch({ education_level: e.target.value })} className={selectCls}>
                      <option value="SLTA">SLTA / sederajat (SMA/SMK/MA)</option>
                      <option value="SLTP">SLTP / sederajat (SMP/MTs)</option>
                      <option value="SD">SD / Tidak sekolah</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {/* ── Step 2: Alamat ── */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                <SectionHeader icon={<MapPin className="w-5 h-5" />} title="Alamat tempat tinggal" />
                <Field label="Cari lokasi rumah">
                  <MapPicker
                    initialPos={
                      formData.latitude
                        ? { lat: formData.latitude, lng: formData.longitude }
                        : { lat: -6.4025, lng: 106.7942 }
                    }
                    onLocationSelect={(lat: number, lng: number, address: string) => {
                      patch({ latitude: lat, longitude: lng, address: address || formData.address });
                    }}
                  />
                </Field>
                <Field label="Alamat lengkap">
                  <textarea
                    rows={4}
                    value={formData.address}
                    onChange={e => patch({ address: e.target.value })}
                    placeholder="Jl. Raya No. 123, Desa..."
                    className={cn(inputCls, 'resize-none')}
                  />
                </Field>
              </div>
            )}

            {/* ── Step 3: Sekolah & Berkas ── */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                <SectionHeader icon={<School className="w-5 h-5" />} title="Pilihan cabang & jurusan" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Cabang / lokasi">
                    <select
                      required
                      value={selectedBranchId}
                      onChange={e => { setSelectedBranchId(e.target.value); patch({ major_id: '' }); }}
                      className={selectCls}
                    >
                      <option value="">— Pilih cabang —</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Jurusan">
                    <select
                      required
                      disabled={!selectedBranchId}
                      value={formData.major_id}
                      onChange={e => patch({ major_id: e.target.value })}
                      className={cn(selectCls, !selectedBranchId && 'opacity-50 cursor-not-allowed')}
                    >
                      <option value="">— Pilih jurusan —</option>
                      {majors.filter(m => m.branch_id === selectedBranchId).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Nama sekolah asal" className="sm:col-span-2">
                    <input required placeholder="SMP Negeri 1 Jakarta" value={formData.previous_school}
                      onChange={e => patch({ previous_school: e.target.value })} className={inputCls} />
                  </Field>
                </div>

                <div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3">
                    Upload berkas
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { field: 'document_url' as keyof FormData, label: 'Ijazah / SKL', required: true },
                      { field: 'ktp_url' as keyof FormData, label: 'KTP', required: true },
                      { field: 'kk_url' as keyof FormData, label: 'Kartu Keluarga', required: true },
                      { field: 'sktm_url' as keyof FormData, label: 'SKTM', required: true },
                      { field: 'health_cert_url' as keyof FormData, label: 'Ket. Sehat', required: true },
                      { field: 'vaccine_url' as keyof FormData, label: 'Vaksin', required: false },
                    ].map(doc => (
                      <UploadCard
                        key={doc.field}
                        label={doc.label}
                        required={doc.required}
                        uploaded={!!formData[doc.field]}
                        isUploading={uploadingField === doc.field}
                        onUpload={e => handleFileUpload(e, doc.field)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Konfirmasi ── */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                <SectionHeader icon={<CheckCircle2 className="w-5 h-5" />} title="Konfirmasi pendaftaran" />
                <div className="rounded-xl border border-outline-variant overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Nama', formData.full_name],
                        ['NIK', formData.nik],
                        ['Email', formData.email],
                        ['WhatsApp', formData.phone],
                        ['Jenis kelamin', formData.gender === 'male' ? 'Laki-laki' : 'Perempuan'],
                        ['Pendidikan', formData.education_level],
                        ['Nama ayah', formData.father_name],
                        ['Nama ibu', formData.mother_name],
                        ['Tgl. lahir', formData.birth_date],
                        ['Cabang', branches.find(b => b.id === selectedBranchId)?.name || '-'],
                        ['Jurusan', majors.find(m => m.id === formData.major_id)?.name || '-'],
                        ['Asal sekolah', formData.previous_school],
                      ].map(([label, value], i) => (
                        <tr key={label} className={cn('border-b border-outline-variant/40 last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-surface')}>
                          <td className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide w-2/5">{label}</td>
                          <td className="px-4 py-3 font-medium text-on-surface">{value || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Dokumen summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MANDATORY_DOCS.map(doc => (
                    <div key={doc.field} className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border',
                      formData[doc.field]
                        ? 'bg-success-container/10 border-success/20 text-success'
                        : 'bg-error-container/10 border-error/20 text-error'
                    )}>
                      {formData[doc.field]
                        ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                      {doc.label}
                    </div>
                  ))}
                </div>

                <label className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/15 rounded-xl cursor-pointer">
                  <input type="checkbox" required className="mt-0.5 accent-primary flex-shrink-0" />
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Saya menyatakan bahwa data yang saya masukkan adalah benar dan dapat dipertanggungjawabkan, serta setuju dengan syarat dan ketentuan pendaftaran Syiar Gemilang.
                  </p>
                </label>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-outline-variant">
              <div>
                {step > 1 && (
                  <button type="button" onClick={() => setStep(s => s - 1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline text-sm font-semibold text-on-surface hover:bg-surface transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Sebelumnya
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-on-surface-variant">
                  {step} / {STEPS.length}
                </span>
                {step < 4 ? (
                  <button type="button" onClick={() => setStep(s => s + 1)} disabled={!!ageError}
                    className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                      ageError
                        ? "bg-outline-variant text-on-surface-variant/50 cursor-not-allowed"
                        : "bg-primary text-on-primary hover:opacity-90 active:scale-95"
                    )}>
                    Lanjutkan
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-secondary text-on-secondary text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
                    Kirim pendaftaran
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full px-3.5 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all';

const selectCls =
  'w-full px-3.5 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all cursor-pointer';

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-4 border-b border-outline-variant">
      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <h2 className="text-base font-bold text-on-surface">{title}</h2>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-0.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function UploadCard({
  label,
  required,
  uploaded,
  isUploading,
  onUpload,
}: {
  label: string;
  required: boolean;
  uploaded: boolean;
  isUploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center',
        uploaded
          ? 'border-success/40 bg-success-container/10'
          : 'border-outline-variant bg-surface hover:border-primary/40 hover:bg-primary/5'
      )}
    >
      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={onUpload} />

      {isUploading ? (
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      ) : uploaded ? (
        <CheckCircle2 className="w-5 h-5 text-success" />
      ) : (
        <Upload className="w-5 h-5 text-on-surface-variant/40" />
      )}

      <span className="text-[11px] font-semibold text-on-surface-variant leading-tight">
        {label}
        {!required && (
          <span className="block text-[10px] font-normal text-on-surface-variant/50">opsional</span>
        )}
      </span>

      <span
        className={cn(
          'text-[11px] font-semibold px-3 py-1 rounded-lg',
          uploaded
            ? 'bg-success/10 text-success'
            : 'bg-primary/10 text-primary'
        )}
      >
        {isUploading ? 'Mengupload...' : uploaded ? 'Ganti' : 'Pilih file'}
      </span>
    </label>
  );
}