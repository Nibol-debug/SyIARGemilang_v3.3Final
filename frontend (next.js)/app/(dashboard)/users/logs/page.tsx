'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  History, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  ArrowLeft,
  Calendar,
  User,
  Activity,
  Box
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';

export default function AuditLogsPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [filters, setFilters] = useState({
    module: '',
    action: ''
  });

  const fetchData = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: meta.limit.toString(),
        ...(filters.module && { module: filters.module }),
        ...(filters.action && { action: filters.action })
      });
      const response = await apiRequest(`/audit-logs?${query}`);
      setData(response.items);
      setMeta(response.meta);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, meta.limit]);

  useEffect(() => {
    fetchData(1);
  }, [filters, fetchData]);

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <Link href="/users" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline mb-2">
            <ArrowLeft className="w-3 h-3" />
            Kembali ke Pengguna
          </Link>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Audit Log Aktivitas
          </h2>
          <p className="text-on-surface-variant font-medium">Rekaman setiap perubahan data dalam sistem untuk audit keamanan.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Modul</label>
          <select 
            value={filters.module} 
            onChange={e => setFilters({...filters, module: e.target.value})}
            className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Semua Modul</option>
            <option value="users">Users</option>
            <option value="students">Students</option>
            <option value="employees">Employees</option>
            <option value="roles">Roles</option>
            <option value="exams">Exams</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Aksi</label>
          <select 
            value={filters.action} 
            onChange={e => setFilters({...filters, action: e.target.value})}
            className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Semua Aksi</option>
            <option value="POST">POST (Create)</option>
            <option value="PATCH">PATCH (Update)</option>
            <option value="DELETE">DELETE (Delete)</option>
          </select>
        </div>
      </div>

      {/* Log List */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-4 px-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Waktu</th>
                <th className="py-4 px-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">User</th>
                <th className="py-4 px-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Modul</th>
                <th className="py-4 px-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Aksi</th>
                <th className="py-4 px-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Detail Data</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                    <p className="mt-4 text-on-surface-variant font-bold">Mengambil log...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-on-surface-variant font-bold">Belum ada log aktivitas terdeteksi.</td>
                </tr>
              ) : (
                data.map((log) => (
                  <tr key={log.id} className="border-b border-surface-container-low hover:bg-surface-container/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-on-surface font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-outline" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-primary">@{log.user?.username}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-lg bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        log.action === 'POST' ? "bg-success-container/30 text-success" :
                        log.action === 'PATCH' ? "bg-primary/10 text-primary" : "bg-error/10 text-error"
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                       <pre className="text-[10px] bg-surface-container p-3 rounded-xl max-h-24 overflow-y-auto border border-outline-variant/30 text-on-surface-variant font-mono">
                         {JSON.stringify(log.data, null, 2)}
                       </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-outline-variant bg-surface-container-low">
          <span className="text-xs font-medium text-on-surface-variant">Halaman {meta.page} dari {meta.totalPages} ({meta.total} logs)</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page === 1}
              className="p-2 rounded-lg text-outline hover:bg-surface-container disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 font-bold text-sm text-primary">{meta.page}</div>
            <button 
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page === meta.totalPages}
              className="p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
