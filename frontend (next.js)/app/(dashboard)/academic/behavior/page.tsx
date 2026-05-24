'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useUserRole } from '@/lib/useUserRole';
import {
  HeartHandshake,
  Search,
  Plus,
  Loader2,
  X,
  Save,
  Star,
  FileText,
  User,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { cn, getUserFromToken } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils';

export default function BehaviorAssessmentPage() {
  const { isTeacher, isAdmin, isStaff, isStudent, user } = useUserRole();
  const canAssess = isTeacher || isAdmin || isStaff;
  const [mounted, setMounted] = useState(false);

  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'summary'>('list');
  
  const [filterClassId, setFilterClassId] = useState('');
  const [filterMajorId, setFilterMajorId] = useState('');
  const [filterBatchId, setFilterBatchId] = useState('');
  
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  const [studentSummary, setStudentSummary] = useState<any>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAssessment, setDeletingAssessment] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    student_id: '',
    attitude: 85,
    ethics: 85,
    manners: 85,
    notes: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchData();
    if (canAssess) {
      loadDropdowns();
    }
  }, [canAssess, user]);

  useEffect(() => {
    if (!mounted) return;
    fetchData();
  }, [filterClassId, filterMajorId, filterBatchId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (canAssess) {
        const params = new URLSearchParams();
        params.set('limit', '1000');
        if (filterClassId) params.set('classId', filterClassId);
        if (filterMajorId) params.set('majorId', filterMajorId);
        if (filterBatchId) params.set('batchId', filterBatchId);

        try {
          const assessRes = await apiRequest(`/student-behavior?${params.toString()}`);
          setAssessments(assessRes.data || []);
        } catch (err) {
          console.error('Gagal memuat data penilaian:', err);
        }
      } else if (user?.studentId) {
        const assessRes = await apiRequest(`/student-behavior?studentId=${user.studentId}`);
        setAssessments(assessRes.data || []);
        
        // Fetch student's own summary
        try {
          const summaryRes = await apiRequest(`/student-behavior/student/${user.studentId}`);
          const assessments = summaryRes || [];
          if (assessments.length > 0) {
            const avgAttitude = assessments.reduce((sum: number, a: any) => sum + Number(a.attitude), 0) / assessments.length;
            const avgEthics = assessments.reduce((sum: number, a: any) => sum + Number(a.ethics), 0) / assessments.length;
            const avgManners = assessments.reduce((sum: number, a: any) => sum + Number(a.manners), 0) / assessments.length;
            const avgOverall = assessments.reduce((sum: number, a: any) => sum + Number(a.overallScore), 0) / assessments.length;
            setStudentSummary({
              totalAssessments: assessments.length,
              averageAttitude: avgAttitude,
              averageEthics: avgEthics,
              averageManners: avgManners,
              averageOverall: avgOverall,
              latestAssessment: assessments[0]
            });
          }
        } catch (err) {
          console.error('Gagal memuat ringkasan perilaku:', err);
        }
      }
    } catch (err) {
      console.error('Terjadi kesalahan saat memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    if (!canAssess) return;
    try {
      const [classesRes, majorsRes, batchesRes] = await Promise.all([
        apiRequest('/classes?limit=1000').catch(() => ({ data: [] })),
        apiRequest('/majors?limit=1000').catch(() => ({ data: [] })),
        apiRequest('/batches?limit=1000').catch(() => ({ data: [] })),
      ]);
      setClasses(classesRes.data || []);
      setMajors(majorsRes.data || []);
      setBatches(batchesRes.data || []);
    } catch (err) {
      // Silently fail - dropdowns are optional
    }
  };

  const loadStudentsForDropdown = async () => {
    try {
      const params = new URLSearchParams();
      params.set('limit', '1000');
      if (filterClassId) params.set('class_id', filterClassId);
      if (filterMajorId) params.set('major_id', filterMajorId);
      if (filterBatchId) params.set('batch_id', filterBatchId);

      const studentsRes = await apiRequest(`/students?${params.toString()}`);
      setStudents(studentsRes.data || []);
    } catch (err) {
      console.error('Gagal memuat data siswa:', err);
    }
  };

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterClassId) params.set('classId', filterClassId);
      if (filterMajorId) params.set('majorId', filterMajorId);
      if (filterBatchId) params.set('batchId', filterBatchId);

      const res = await apiRequest(`/student-behavior/summary?${params.toString()}`);
      setSummary(res);
    } catch (err) {
      console.error('Gagal memuat summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleTabChange = (tab: 'list' | 'summary') => {
    setActiveTab(tab);
    if (tab === 'summary' && !summary) {
      fetchSummary();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest('/student-behavior', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('Penilaian perilaku berhasil disimpan!');
      setIsModalOpen(false);
      setFormData({ student_id: '', attitude: 85, ethics: 85, manners: 85, notes: '' });
      fetchData();
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success bg-success/10 border-success/20';
    if (score >= 80) return 'text-primary bg-primary/10 border-primary/20';
    if (score >= 70) return 'text-secondary bg-secondary/10 border-secondary/20';
    return 'text-error bg-error/10 border-error/20';
  };

  const getPredicate = (score: number) => {
    if (score >= 90) return 'Sangat Baik (A)';
    if (score >= 80) return 'Baik (B)';
    if (score >= 70) return 'Cukup (C)';
    return 'Kurang (D)';
  };

  const getPredicateLabel = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    return 'D';
  };

  const openModal = async () => {
    setEditingAssessment(null);
    setFormData({ student_id: '', attitude: 85, ethics: 85, manners: 85, notes: '' });
    await loadStudentsForDropdown();
    setIsModalOpen(true);
  };

  const openEditModal = async (assessment: any) => {
    setEditingAssessment(assessment);
    setFormData({
      student_id: assessment.student?.id || '',
      attitude: Number(assessment.attitude),
      ethics: Number(assessment.ethics),
      manners: Number(assessment.manners),
      notes: assessment.notes || ''
    });
    setStudents([assessment.student]);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (assessment: any) => {
    setDeletingAssessment(assessment);
    setIsDeleteModalOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssessment) return;
    setIsSubmitting(true);
    try {
      await apiRequest(`/student-behavior/${editingAssessment.id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      setIsEditModalOpen(false);
      setEditingAssessment(null);
      setFormData({ student_id: '', attitude: 85, ethics: 85, manners: 85, notes: '' });
      fetchData();
    } catch (err: any) {
      alert('Gagal mengupdate: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAssessment) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/student-behavior/${deletingAssessment.id}`, {
        method: 'DELETE'
      });
      setIsDeleteModalOpen(false);
      setDeletingAssessment(null);
      fetchData();
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!mounted) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
            <HeartHandshake className="w-8 h-8 text-primary" />
            {isStudent ? 'Riwayat Perilaku Saya' : 'Penilaian Perilaku Siswa'}
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-2xl">
            {isStudent 
              ? 'Lihat catatan penilaian perilaku dan karakter Anda selama bersekolah di sini.'
              : 'Sistem penilaian afektif mencakup Sikap (Attitude), Etika (Ethics), dan Adab (Manners) sebagai bagian dari pembentukan karakter.'}
          </p>
        </div>
        
        {canAssess && (
          <button 
            onClick={openModal}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Input Penilaian
          </button>
        )}
      </div>

      {canAssess && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Kelas</label>
              <select
                value={filterClassId}
                onChange={e => { setFilterClassId(e.target.value); setSummary(null); }}
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Semua Kelas</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Jurusan</label>
              <select
                value={filterMajorId}
                onChange={e => { setFilterMajorId(e.target.value); setSummary(null); }}
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Semua Jurusan</option>
                {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Angkatan</label>
              <select
                value={filterBatchId}
                onChange={e => { setFilterBatchId(e.target.value); setSummary(null); }}
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Semua Angkatan</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl w-fit">
        <button
          onClick={() => handleTabChange('list')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all rounded-lg",
            activeTab === 'list'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
          )}
        >
          <FileText className="w-4 h-4" />
          Data Penilaian
        </button>
        {canAssess && (
          <button
            onClick={() => handleTabChange('summary')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all rounded-lg",
              activeTab === 'summary'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
            )}
          >
            <BarChart3 className="w-4 h-4" />
            Ringkasan
          </button>
        )}
      </div>

      {isStudent && studentSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-black text-on-surface">{studentSummary.totalAssessments}</p>
            <p className="text-xs text-on-surface-variant mt-1">Total Penilaian</p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
            <p className="text-2xl font-black text-on-surface">{studentSummary.averageOverall.toFixed(1)}</p>
            <p className="text-xs text-on-surface-variant mt-1">Rata-rata Keseluruhan</p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <p className="text-2xl font-black text-on-surface">{studentSummary.averageAttitude.toFixed(1)}</p>
            <p className="text-xs text-on-surface-variant mt-1">Rata-rata Sikap</p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-warning" />
              </div>
            </div>
            <p className="text-2xl font-black text-on-surface">{getPredicateLabel(studentSummary.averageOverall)}</p>
            <p className="text-xs text-on-surface-variant mt-1">Predikat Anda</p>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container/30 flex justify-between items-center">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input 
                type="text" 
                placeholder={isStudent ? "Cari catatan..." : "Cari siswa atau catatan..."} 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-outline-variant/50 rounded-lg bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Tanggal</th>
                  {!isStudent && (
                    <>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Siswa</th>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Kelas</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider text-center">Sikap</th>
                  <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider text-center">Etika</th>
                  <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider text-center">Adab</th>
                  <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider text-center">Rata-rata</th>
                  <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Penilai</th>
                  {canAssess && <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {loading ? (
                  <tr><td colSpan={isStudent ? 6 : canAssess ? 9 : 8} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : assessments.length === 0 ? (
                  <tr><td colSpan={isStudent ? 6 : canAssess ? 9 : 8} className="text-center py-8 text-on-surface-variant">{isStudent ? "Belum ada penilaian perilaku untuk Anda." : "Belum ada data penilaian perilaku."}</td></tr>
                ) : (
                  assessments.filter(a => 
                    a.student?.full_name.toLowerCase().includes(search.toLowerCase()) || 
                    a.notes?.toLowerCase().includes(search.toLowerCase())
                  ).map((a) => (
                    <tr key={a.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-on-surface-variant">{formatDateTime(a.date)}</span>
                      </td>
                      {!isStudent && (
                        <>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-on-surface">{a.student?.full_name}</p>
                            <p className="text-[10px] text-outline uppercase mt-0.5 tracking-wider">{a.student?.nis}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-on-surface-variant">{a.student?.class?.name || '-'}</span>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-center">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getScoreColor(a.attitude))}>{a.attitude}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getScoreColor(a.ethics))}>{a.ethics}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getScoreColor(a.manners))}>{a.manners}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-black text-on-surface">{Number(a.overallScore).toFixed(1)}</span>
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", getScoreColor(Number(a.overallScore)))}>{getPredicateLabel(Number(a.overallScore))}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-on-surface-variant">{a.assessor?.full_name}</span>
                        </div>
                      </td>
                      {canAssess && (
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(a)}
                              className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(a)}
                              className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/5 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'summary' && canAssess && (
        <div className="space-y-6">
          {summaryLoading ? (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-on-surface-variant">Memuat ringkasan...</p>
            </div>
          ) : summary && summary.totalAssessments > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-on-surface">{summary.totalAssessments}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Total Penilaian</p>
                </div>
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-success" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-on-surface">{summary.averageOverall.toFixed(1)}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Rata-rata Keseluruhan</p>
                </div>
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-on-surface">{summary.byStudent.length}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Siswa Dinilai</p>
                </div>
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-warning" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-on-surface">{summary.predicateDistribution.A}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Predikat A</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
                  <h3 className="text-lg font-bold text-on-surface mb-4">Distribusi Predikat</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'A (Sangat Baik)', count: summary.predicateDistribution.A, color: 'bg-success' },
                      { label: 'B (Baik)', count: summary.predicateDistribution.B, color: 'bg-primary' },
                      { label: 'C (Cukup)', count: summary.predicateDistribution.C, color: 'bg-secondary' },
                      { label: 'D (Kurang)', count: summary.predicateDistribution.D, color: 'bg-error' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-on-surface-variant w-28">{item.label}</span>
                        <div className="flex-1 bg-surface-container rounded-full h-6 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", item.color)}
                            style={{ width: `${summary.totalAssessments > 0 ? (item.count / summary.totalAssessments) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-on-surface w-8 text-right">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
                  <h3 className="text-lg font-bold text-on-surface mb-4">Rata-rata per Kelas</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {summary.byClass
                      .sort((a: any, b: any) => b.average_score - a.average_score)
                      .map((c: any) => (
                        <div key={c.class_id} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                          <span className="text-sm font-bold text-on-surface">{c.class_name}</span>
                          <div className="flex items-center gap-2">
                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", getScoreColor(c.average_score))}>
                              {c.average_score.toFixed(1)}
                            </span>
                            <span className="text-xs text-on-surface-variant">({c.assessment_count} penilaian)</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
                <h3 className="text-lg font-bold text-on-surface mb-4">Rata-rata per Siswa</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low/50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold text-outline uppercase tracking-wider">Siswa</th>
                        <th className="px-4 py-3 text-xs font-bold text-outline uppercase tracking-wider text-center">Rata-rata</th>
                        <th className="px-4 py-3 text-xs font-bold text-outline uppercase tracking-wider text-center">Predikat</th>
                        <th className="px-4 py-3 text-xs font-bold text-outline uppercase tracking-wider text-center">Jumlah Penilaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low">
                      {summary.byStudent
                        .sort((a: any, b: any) => b.average_score - a.average_score)
                        .map((s: any) => (
                          <tr key={s.student_id} className="hover:bg-surface-container-lowest">
                            <td className="px-4 py-3">
                              <p className="text-sm font-bold text-on-surface">{s.full_name}</p>
                              <p className="text-[10px] text-outline uppercase">{s.nis}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-lg font-black text-on-surface">{s.average_score.toFixed(1)}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getScoreColor(s.average_score))}>
                                {getPredicateLabel(s.average_score)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm text-on-surface-variant">{s.assessment_count}</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-12 flex flex-col items-center justify-center">
              <BarChart3 className="w-12 h-12 text-outline mb-4" />
              <p className="text-sm text-on-surface-variant">Belum ada data penilaian untuk ditampilkan.</p>
            </div>
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && canAssess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Input Penilaian Perilaku</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1">Siswa</label>
                <select 
                  required 
                  value={formData.student_id}
                  onChange={e => setFormData({...formData, student_id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                >
                  <option value="" disabled>-- Pilih Siswa --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.nis})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Sikap (1-100)</label>
                  <input 
                    type="number" min="0" max="100" required
                    value={formData.attitude}
                    onChange={e => setFormData({...formData, attitude: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-xl text-center font-bold text-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Etika (1-100)</label>
                  <input 
                    type="number" min="0" max="100" required
                    value={formData.ethics}
                    onChange={e => setFormData({...formData, ethics: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-xl text-center font-bold text-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Adab (1-100)</label>
                  <input 
                    type="number" min="0" max="100" required
                    value={formData.manners}
                    onChange={e => setFormData({...formData, manners: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-xl text-center font-bold text-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1">Catatan Khusus (Opsional)</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  placeholder="Misal: Sangat aktif membantu teman yang kesulitan..."
                />
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                <p className="text-[11px] font-medium text-primary">
                  Nilai ini akan terekapitulasi di laporan Sertifikat Hasil Belajar (SHB) pada bagian aspek kepribadian dan sosial.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Simpan Penilaian</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && canAssess && editingAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2"><Pencil className="w-5 h-5 text-primary" /> Edit Penilaian Perilaku</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-5">
              <div className="p-3 bg-surface rounded-xl border border-outline-variant flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-on-surface text-sm">{editingAssessment.student?.full_name}</p>
                  <p className="text-[10px] text-outline uppercase tracking-wider">{editingAssessment.student?.nis} — {editingAssessment.student?.class?.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Sikap (1-100)</label>
                  <input 
                    type="number" min="0" max="100" required
                    value={formData.attitude}
                    onChange={e => setFormData({...formData, attitude: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-xl text-center font-bold text-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Etika (1-100)</label>
                  <input 
                    type="number" min="0" max="100" required
                    value={formData.ethics}
                    onChange={e => setFormData({...formData, ethics: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-xl text-center font-bold text-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Adab (1-100)</label>
                  <input 
                    type="number" min="0" max="100" required
                    value={formData.manners}
                    onChange={e => setFormData({...formData, manners: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-xl text-center font-bold text-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1">Catatan Khusus (Opsional)</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  placeholder="Misal: Sangat aktif membantu teman yang kesulitan..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {isDeleteModalOpen && deletingAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-xl font-black text-on-surface mb-2">Hapus Penilaian</h3>
              <p className="text-sm text-on-surface-variant mb-6">
                Yakin ingin menghapus penilaian perilaku untuk <strong>{deletingAssessment.student?.full_name}</strong>?<br />
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-error text-on-error font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Ya, Hapus</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
