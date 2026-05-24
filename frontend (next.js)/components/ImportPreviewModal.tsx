'use client';

import React, { useState } from 'react';
import { X, Loader2, Upload, AlertCircle, CheckCircle, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { useLockBodyScroll } from '@/lib/useLockBodyScroll';

interface PreviewRow {
  rowNumber: number;
  nis: string;
  full_name: string;
  major_name: string;
  branch_name: string;
  class_name: string;
  status: 'baru' | 'update' | 'error';
  errors: string[];
}

interface PreviewData {
  rows: PreviewRow[];
  total: number;
  new_count: number;
  update_count: number;
  error_count: number;
  batch_id: string | null;
  batch_name: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  file: File | null;
  batches: any[];
}

export default function ImportPreviewModal({ isOpen, onClose, onSuccess, file, batches }: Props) {
  useLockBodyScroll(isOpen);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  const activeBatch = batches.find(b => b.is_active);

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      if (selectedBatchId) form.append('batchId', selectedBatchId);
      const data = await apiRequest('/students/import-preview', { method: 'POST', body: form });
      setPreview(data);
      if (!selectedBatchId && data.batch_id) setSelectedBatchId(data.batch_id);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses file');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !selectedBatchId) return;
    setImporting(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('batchId', selectedBatchId);
      const data = await apiRequest('/students/import', { method: 'POST', body: form });
      setResult(data);
      setTimeout(() => { onSuccess(); onClose(); }, 2000);
    } catch (err: any) {
      setError(err.message || 'Gagal mengimpor data');
    } finally {
      setImporting(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && file) {
      if (activeBatch) setSelectedBatchId(activeBatch.id);
      handlePreview();
    }
    return () => { setPreview(null); setResult(null); setError(''); };
  }, [isOpen]);

  if (!isOpen) return null;

  const statusIcon = (status: string) => {
    switch (status) {
      case 'baru': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'update': return <RefreshCw className="w-4 h-4 text-primary" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-error" />;
      default: return null;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'baru': return <span className="px-2 py-0.5 rounded-lg bg-success/10 text-success text-[10px] font-bold">Baru</span>;
      case 'update': return <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">Update</span>;
      case 'error': return <span className="px-2 py-0.5 rounded-lg bg-error/10 text-error text-[10px] font-bold">Error</span>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Preview Impor Siswa
          </h3>
          <button autoFocus onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-on-surface-variant font-semibold">Memproses file...</span>
            </div>
          )}

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-error text-sm">Error</p>
                <p className="text-error/80 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {preview && !result && (
            <>
              <div className="flex flex-wrap items-center gap-4 bg-surface-container rounded-xl p-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-black text-on-surface">{preview.total}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Baris</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-success">{preview.new_count}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Baru</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-primary">{preview.update_count}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Update</p>
                  </div>
                  {preview.error_count > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-black text-error">{preview.error_count}</p>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Error</p>
                    </div>
                  )}
                </div>

                <div className="ml-auto flex items-center gap-3">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Batch</label>
                  <select
                    value={selectedBatchId}
                    onChange={e => setSelectedBatchId(e.target.value)}
                    className="border border-outline-variant rounded-xl px-4 py-2 bg-surface-container text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="">Pilih Batch</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} {b.is_active ? '(Aktif)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border border-outline-variant rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">#</th>
                        <th className="text-left px-4 py-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">NIS</th>
                        <th className="text-left px-4 py-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Nama</th>
                        <th className="text-left px-4 py-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Jurusan</th>
                        <th className="text-left px-4 py-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Cabang</th>
                        <th className="text-left px-4 py-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Kelas</th>
                        <th className="text-center px-4 py-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((row, i) => (
                        <tr key={i} className={cn(
                          'border-b border-outline-variant/30 hover:bg-surface-container/30 transition-colors',
                          row.status === 'error' && 'bg-error/5',
                        )}>
                          <td className="px-4 py-2.5 text-on-surface-variant font-mono text-xs">{row.rowNumber}</td>
                          <td className="px-4 py-2.5 font-mono text-xs font-semibold text-on-surface">{row.nis}</td>
                          <td className="px-4 py-2.5 font-medium text-on-surface">
                            <div className="flex items-center gap-2">
                              {row.full_name}
                              {row.status === 'error' && (
                                <span title={row.errors.join(', ')}><AlertCircle className="w-3.5 h-3.5 text-error flex-shrink-0" /></span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-on-surface-variant">{row.major_name}</td>
                          <td className="px-4 py-2.5 text-on-surface-variant">{row.branch_name}</td>
                          <td className="px-4 py-2.5 text-on-surface-variant">{row.class_name}</td>
                          <td className="px-4 py-2.5 text-center">{statusLabel(row.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {preview.error_count > 0 && (
                <div className="bg-error/5 border border-error/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-error mb-2">Baris yang bermasalah:</p>
                  <ul className="space-y-1">
                    {preview.rows.filter(r => r.status === 'error').map((r, i) => (
                      <li key={i} className="text-xs text-error/80">
                        Baris {r.rowNumber}: {r.full_name || '(tanpa nama)'} — {r.errors.join(', ')}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-error/60 mt-2">Baris yang error akan dilewati saat impor.</p>
                </div>
              )}
            </>
          )}

          {result && (
            <div className="bg-success/5 border border-success/20 rounded-xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-lg font-black text-on-surface">Impor Selesai!</p>
              <p className="text-on-surface-variant font-medium mt-1">
                {result.imported} siswa berhasil diimpor
                {result.skipped > 0 && `, ${result.skipped} dilewati`}
              </p>
              {result.errors?.length > 0 && (
                <div className="mt-3 text-left">
                  <p className="text-xs font-bold text-error mb-1">Error:</p>
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-xs text-error/70">{e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {preview && !result && (
          <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3 bg-surface">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-outline text-on-surface font-bold text-sm hover:bg-surface-container transition-all">
              Batal
            </button>
            <button
              onClick={handleImport}
              disabled={importing || !selectedBatchId || preview.error_count === preview.total}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {importing ? 'Mengimpor...' : `Impor ${preview.new_count + preview.update_count} Siswa`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
