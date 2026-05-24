'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { 
  Plus, 
  Loader2, 
  AlertCircle, 
  X,
  CheckCircle2,
  Users,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AppraisalsPage() {
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    period: '',
    discipline_score: '',
    pedagogic_score: '',
    professional_score: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [appraisalRes, employeeRes] = await Promise.all([
        apiRequest('/appraisals?limit=50'),
        apiRequest('/employees?limit=100'),
      ]);
      setAppraisals(appraisalRes.data || []);
      setEmployees(employeeRes.data || []);
    } catch (err: any) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!formData.employee_id || !formData.period || !formData.discipline_score || !formData.pedagogic_score || !formData.professional_score) {
      setError('Semua field wajib diisi');
      setIsSubmitting(false);
      return;
    }

    try {
      await apiRequest('/appraisals', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          discipline_score: parseFloat(formData.discipline_score),
          pedagogic_score: parseFloat(formData.pedagogic_score),
          professional_score: parseFloat(formData.professional_score),
        }),
      });
      setSuccess('Penilaian berhasil disimpan');
      setShowForm(false);
      setFormData({ employee_id: '', period: '', discipline_score: '', pedagogic_score: '', professional_score: '', notes: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan penilaian');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreCategory = (score: number) => {
    if (score >= 90) return { label: 'Sangat Baik', color: 'text-success' };
    if (score >= 75) return { label: 'Baik', color: 'text-primary' };
    if (score >= 60) return { label: 'Cukup', color: 'text-warning' };
    return { label: 'Perlu Peningkatan', color: 'text-error' };
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="anim-fade-in-down">
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Evaluasi Kinerja Pegawai</h2>
          <p className="text-on-surface-variant font-medium mt-1">Buat dan kelola penilaian kinerja (PKG).</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Tutup Form' : 'Buat Penilaian'}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-error-container/30 border border-error/20 text-error">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success-container/30 border border-success/20 text-success">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {showForm && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm anim-fade-in-up">
          <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Form Penilaian Kinerja
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pegawai</label>
                <select 
                  className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  value={formData.employee_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                >
                  <option value="">Pilih Pegawai</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.full_name} - {emp.position}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Periode</label>
                <input 
                  type="text"
                  className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.period}
                  onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                  placeholder="Contoh: 2026-Semester 1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Skor Kedisiplinan (0-100)</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.discipline_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, discipline_score: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Skor Pedagogik (0-100)</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.pedagogic_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, pedagogic_score: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Skor Profesionalisme (0-100)</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.professional_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, professional_score: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Catatan</label>
              <textarea 
                className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-y"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan kualitatif..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-lg border border-outline text-on-surface-variant text-sm font-bold hover:bg-surface-container transition-all"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Simpan Penilaian</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden anim-fade-in-up anim-delay-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Pegawai</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Periode</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Kedisiplinan</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Pedagogik</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Profesionalisme</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Rata-rata</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : appraisals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-on-surface-variant font-medium">
                    Belum ada penilaian kinerja.
                  </td>
                </tr>
              ) : (
                appraisals.map((appraisal) => {
                  const avg = ((parseFloat(appraisal.discipline_score) + parseFloat(appraisal.pedagogic_score) + parseFloat(appraisal.professional_score)) / 3).toFixed(1);
                  const category = getScoreCategory(parseFloat(avg));

                  return (
                    <tr key={appraisal.id} className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                            {appraisal.employee?.full_name?.charAt(0)}
                          </div>
                          <span className="font-bold text-on-surface">{appraisal.employee?.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 font-medium text-on-surface">{appraisal.period}</td>
                      <td className="py-3 px-5 font-bold text-primary">{appraisal.discipline_score}</td>
                      <td className="py-3 px-5 font-bold text-secondary">{appraisal.pedagogic_score}</td>
                      <td className="py-3 px-5 font-bold text-tertiary">{appraisal.professional_score}</td>
                      <td className="py-3 px-5">
                        <span className={cn("font-black", category.color)}>{avg}</span>
                        <span className={cn("text-xs ml-2 font-bold", category.color)}>({category.label})</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
