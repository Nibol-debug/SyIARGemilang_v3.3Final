'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Loader2,
  Wallet,
  TrendingUp,
  Calendar,
  X,
  Printer,
  ClipboardCheck,
  Bell
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { useUserRole } from '@/lib/useUserRole';

export default function FinancePage() {
  const { canManageFinance } = useUserRole();
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const [formData, setFormData] = useState({
    student_id: '',
    fee_id: '',
    amount: 0,
    method: 'cash',
    status: 'success',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Filters & Search
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    last_page: 1
  });

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
      }).toString();

      const response = await apiRequest(`/finance/payments?${query}`);
      setPayments(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total,
        last_page: response.meta.last_page
      }));
    } catch (err: any) {
      console.error('Gagal mengambil data pembayaran:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const [studentsRes, feesRes] = await Promise.all([
        apiRequest('/students?limit=100'),
        apiRequest('/finance/fees?limit=100')
      ]);
      setStudents(studentsRes.data || []);
      setFees(feesRes.data || []);
    } catch (err) {
      console.error('Gagal mengambil opsi form:', err);
    }
  };

  useEffect(() => {
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    if (token) {
      fetchPayments();
      if (isModalOpen) {
        fetchFormOptions();
      }
    }
  }, [filters, pagination.page, isModalOpen]);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest('/finance/payments', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount)
        })
      });
      setIsModalOpen(false);
      fetchPayments();
      setFormData({
        student_id: '',
        fee_id: '',
        amount: 0,
        method: 'cash',
        status: 'success',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err: any) {
      alert('Gagal menambah pembayaran: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = (payment: any) => {
    const win = window.open('', '_blank');
    if (!win) return;
    
    win.document.write(`
      <html>
        <head>
          <title>Kuitansi - ${payment.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #0b1c30; }
            .receipt { max-width: 600px; margin: 0 auto; border: 2px solid #00288e; padding: 40px; border-radius: 20px; position: relative; }
            .header { text-align: center; border-bottom: 2px solid #e5eeff; margin-bottom: 30px; padding-bottom: 20px; }
            .school-name { font-size: 24px; font-weight: 900; color: #00288e; margin: 0; }
            .receipt-title { font-size: 14px; font-weight: 700; color: #757684; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px dashed #e5eeff; padding-bottom: 5px; }
            .label { font-size: 12px; font-weight: 700; color: #757684; text-transform: uppercase; }
            .value { font-size: 14px; font-weight: 700; }
            .amount-box { background: #f8f9ff; border: 2px solid #00288e; padding: 20px; border-radius: 12px; margin-top: 30px; text-align: center; }
            .amount-label { font-size: 10px; font-weight: 900; color: #00288e; margin-bottom: 5px; }
            .amount-value { font-size: 32px; font-weight: 900; color: #00288e; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .signature { text-align: center; width: 200px; }
            .sig-line { border-top: 1px solid #0b1c30; margin-top: 60px; padding-top: 5px; font-size: 12px; font-weight: 700; }
            .stamp { position: absolute; bottom: 100px; right: 80px; width: 100px; height: 100px; border: 4px double #006c49; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #006c49; font-weight: 900; transform: rotate(-15deg); opacity: 0.1; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1 class="school-name">SYIAR GEMILANG</h1>
              <div class="receipt-title">Kuitansi Pembayaran Resmi</div>
            </div>
            
            <div class="info-row"><span class="label">Nomor Kuitansi</span><span class="value">${payment.id.split('-')[0].toUpperCase()}</span></div>
            <div class="info-row"><span class="label">Tanggal</span><span class="value">${new Date(payment.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span></div>
            <div class="info-row"><span class="label">Diterima Dari</span><span class="value">${payment.student?.full_name} (${payment.student?.nis})</span></div>
            <div class="info-row"><span class="label">Untuk Pembayaran</span><span class="value">${payment.fee?.name}</span></div>
            <div class="info-row"><span class="label">Metode</span><span class="value uppercase">${payment.method}</span></div>
            
            <div class="amount-box">
              <div class="amount-label">TOTAL PEMBAYARAN</div>
              <div class="amount-value">Rp ${Number(payment.amount).toLocaleString('id-ID')}</div>
            </div>

            <div class="stamp">LUNAS</div>

            <div class="footer">
              <div class="signature">
                <div class="sig-line">Bendahara Sekolah</div>
              </div>
              <div style="font-size: 10px; color: #757684; font-weight: 600;">Dicetak otomatis oleh Sistem ERP Syiar Gemilang</div>
            </div>
          </div>
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleSendReminder = async () => {
    if (!confirm('Kirim pengingat pembayaran ke semua siswa dengan status pending?')) return;
    setSendingReminder(true);
    try {
      const res = await apiRequest('/finance/remind', { method: 'POST' });
      alert(`Notifikasi terkirim ke ${res.notified} dari ${res.total_pending} siswa yang tertunggak.`);
    } catch (err: any) {
      alert('Gagal: ' + err.message);
    } finally {
      setSendingReminder(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Manajemen Keuangan</h2>
          <p className="text-on-surface-variant font-medium mt-1">Pencatatan pembayaran SPP dan biaya pendidikan lainnya.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canManageFinance && (
            <>
            <button 
              onClick={handleSendReminder}
              disabled={sendingReminder}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors active:scale-95"
            >
              {sendingReminder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              <span>Reminder</span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pembayaran</span>
            </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Pemasukan" value={formatCurrency(payments.reduce((acc, curr) => acc + Number(curr.amount), 0))} icon={<Wallet className="w-6 h-6" />} color="primary" />
        <StatCard title="Pembayaran Berhasil" value={payments.filter(p => p.status === 'success').length} icon={<TrendingUp className="w-6 h-6" />} color="success" />
        <StatCard title="Pembayaran Pending" value={payments.filter(p => p.status === 'pending').length} icon={<Calendar className="w-6 h-6" />} color="secondary" />
        <StatCard title="Total Tagihan" value={pagination.total} icon={<ClipboardCheck className="w-6 h-6" />} color="tertiary" />
      </div>

      {/* Filter Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2 col-span-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pencarian Siswa</label>
            <div className="flex items-center border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container focus-within:ring-2 focus-within:ring-primary/20 transition-all relative">
              <Search className="w-4 h-4 text-outline mr-3" />
              <input 
                type="text" 
                placeholder="Cari Nama Siswa..." 
                className="bg-transparent outline-none text-sm w-full text-on-surface placeholder:text-outline-variant pr-8"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              {filters.search && (
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="absolute right-3 text-outline hover:text-on-surface transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</label>
            <select 
              className="border border-outline-variant rounded-xl px-4 py-2.5 bg-surface-container text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Semua Status</option>
              <option value="success">Berhasil</option>
              <option value="pending">Pending</option>
              <option value="failed">Gagal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Tanggal</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Siswa</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Jenis Biaya</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Jumlah</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Metode</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Status</th>
                <th className="py-4 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-on-surface-variant font-medium text-sm">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                   <td colSpan={7} className="py-10 text-center text-on-surface-variant font-medium">
                     Tidak ada data pembayaran.
                   </td>
                </tr>
              ) : (
                payments.map((item) => (
                  <tr key={item.id} className="border-b border-surface-container-low hover:bg-surface-container/30 transition-colors even:bg-surface-container/20 group">
                    <td className="py-3 px-5 text-on-surface-variant font-medium">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="py-3 px-5 font-semibold text-on-surface">{item.student?.full_name}</td>
                    <td className="py-3 px-5 text-on-surface font-medium">{item.fee?.name}</td>
                    <td className="py-3 px-5 font-bold text-success">
                        {formatCurrency(Number(item.amount))}
                    </td>
                    <td className="py-3 px-5 text-on-surface-variant font-medium uppercase text-xs tracking-wider">{item.method}</td>
                    <td className="py-3 px-5 text-on-surface">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        item.status === 'success' ? "bg-success-container/30 text-success" :
                        item.status === 'pending' ? "bg-secondary-container/20 text-secondary" :
                        "bg-error-container/20 text-error"
                      )}>
                        {item.status === 'success' ? 'Berhasil' : 
                         item.status === 'pending' ? 'Pending' : 'Gagal'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handlePrintReceipt(item)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="Print Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {canManageFinance && (
                          <>
                            <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                      <button className="p-2 text-on-surface-variant hidden"><MoreHorizontal className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-outline-variant bg-surface-container-lowest">
          <span className="text-xs font-medium text-on-surface-variant">Menampilkan halaman {pagination.page} dari {pagination.last_page}</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg text-outline hover:bg-surface-container disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow-md">{pagination.page}</button>
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.last_page, prev.page + 1) }))}
              disabled={pagination.page === pagination.last_page}
              className="p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tambah Pembayaran */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="text-lg font-bold text-on-surface">Catat Pembayaran Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="paymentForm" onSubmit={handleCreatePayment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">Pilih Siswa</label>
                  <select required value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="" disabled>-- Pilih Siswa --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.nis})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">Jenis Biaya</label>
                  <select required value={formData.fee_id} onChange={e => {
                    const fee = fees.find(f => f.id === e.target.value);
                    setFormData({...formData, fee_id: e.target.value, amount: fee ? Number(fee.amount) : 0});
                  }} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="" disabled>-- Pilih Jenis Biaya --</option>
                    {fees.map(f => <option key={f.id} value={f.id}>{f.name} ({formatCurrency(Number(f.amount))})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Jumlah (IDR)</label>
                    <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Tanggal</label>
                    <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Metode</label>
                    <select required value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="cash">Tunai (Cash)</option>
                      <option value="transfer">Transfer Bank</option>
                      <option value="gateway">Payment Gateway</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Status</label>
                    <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="success">Berhasil</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Gagal</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors">Batal</button>
              <button type="submit" form="paymentForm" disabled={isSubmitting || !formData.student_id || !formData.fee_id} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Simpan Pembayaran</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colorClasses: any = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    tertiary: "bg-tertiary/10 text-tertiary border-tertiary/20",
    success: "bg-success-container/30 text-success border-success/20",
  };

  return (
    <div className={cn("p-6 rounded-2xl border flex items-center gap-4 bg-surface-container-lowest shadow-sm relative overflow-hidden", colorClasses[color])}>
      <div className="p-3 rounded-xl bg-current opacity-10" />
      <div className="absolute p-3">{icon}</div>
      <div className="ml-12">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{title}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}
