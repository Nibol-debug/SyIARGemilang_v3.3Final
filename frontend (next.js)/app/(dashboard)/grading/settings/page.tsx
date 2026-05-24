'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import {
  Settings,
  Save,
  RefreshCcw,
  BookOpen,
  Scale,
  Percent,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/lib/useUserRole';

interface GradeComponent {
  id: string;
  name: string;
  weight_percentage: string;
}

interface Subject {
  id: string;
  name: string;
  passing_grade: number;
  major?: { name: string };
}

export default function GradingSettingsPage() {
  const router = useRouter();
  const [components, setComponents] = useState<GradeComponent[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { canManageGrades, canManageAcademic } = useUserRole();

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const [compRes, subRes] = await Promise.all([
        apiRequest('/grades/components'),
        apiRequest('/subjects?limit=100')
      ]);
      setComponents(compRes || []);
      setSubjects(subRes.data || []);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Gagal memuat pengaturan: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateWeight = async (id: string, weight: number) => {
    try {
      await apiRequest('/grades/components', {
        method: 'PUT',
        body: JSON.stringify({ id, weight_percentage: weight })
      });
      setMessage({ type: 'success', text: 'Bobot nilai diperbarui' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleUpdateKKM = async (id: string, kkm: number) => {
    try {
      await apiRequest(`/subjects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ passing_grade: kkm })
      });
      setMessage({ type: 'success', text: 'KKM diperbarui' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const totalWeight = components.reduce((acc, curr) => acc + Number(curr.weight_percentage), 0);

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.major?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!canManageGrades && !isLoading) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Akses Ditolak</h2>
        <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              Pengaturan Penilaian
            </h1>
            <p className="text-gray-500">Kelola bobot komponen nilai dan KKM mata pelajaran</p>
          </div>
        </div>
        <button 
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {message && (
        <div className={cn(
          "mb-6 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
          message.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bobot Komponen Nilai */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-secondary" />
              Bobot Komponen
            </h2>
            <div className="space-y-4">
              {components.map((comp) => (
                <div key={comp.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {comp.name} (%)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={comp.weight_percentage}
                      onChange={(e) => {
                        const val = e.target.value;
                        setComponents(components.map(c => c.id === comp.id ? { ...c, weight_percentage: val } : c));
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <button 
                      onClick={() => handleUpdateWeight(comp.id, Number(comp.weight_percentage))}
                      className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      title="Simpan"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className={cn(
                "mt-6 p-4 rounded-lg flex justify-between items-center",
                totalWeight === 100 ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
              )}>
                <span className="font-medium">Total Bobot:</span>
                <span className="text-xl font-bold">{totalWeight}%</span>
              </div>
              {totalWeight !== 100 && (
                <p className="text-xs text-orange-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Total bobot harus tepat 100%
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Info Penting
            </h3>
            <ul className="text-sm text-blue-800 space-y-2 list-disc ml-4">
              <li>Perubahan bobot akan mempengaruhi perhitungan nilai akhir (Finalize) di masa mendatang.</li>
              <li>Pastikan total persentase adalah 100%.</li>
              <li>KKM per mata pelajaran digunakan untuk menentukan status kelulusan dan deskripsi di Rapor.</li>
            </ul>
          </div>
        </div>

        {/* KKM Mata Pelajaran */}
        <div className="lg:col-span-2">
          {!canManageAcademic && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
              <p className="text-sm text-orange-800">
                Anda tidak memiliki izin <strong>manage_academic</strong> untuk mengubah KKM mata pelajaran. 
                Hubungi administrator untuk perubahan KKM.
              </p>
            </div>
          )}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-success" />
                KKM Mata Pelajaran
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Cari mata pelajaran..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Mata Pelajaran</th>
                    <th className="px-6 py-4">Jurusan</th>
                    <th className="px-6 py-4 w-32">KKM</th>
                    <th className="px-6 py-4 w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-gray-500">Memuat data...</p>
                      </td>
                    </tr>
                  ) : filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => (
                      <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{subject.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full uppercase">
                            {subject.major?.name || 'Umum'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="number"
                            value={subject.passing_grade}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setSubjects(subjects.map(s => s.id === subject.id ? { ...s, passing_grade: val } : s));
                            }}
                            className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-primary/20 outline-none"
                            min="0"
                            max="100"
                            disabled={!canManageAcademic}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleUpdateKKM(subject.id, subject.passing_grade)}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors disabled:text-gray-300 disabled:hover:bg-transparent"
                            title="Simpan"
                            disabled={!canManageAcademic}
                          >
                            <Save className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Tidak ada mata pelajaran ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
