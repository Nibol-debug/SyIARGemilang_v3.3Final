'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';

function getMonthName(m: number) {
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return months[m - 1] || '';
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

export default function MyPayrollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest(`/payrolls/${id}`);
        setPayroll(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-on-surface-variant font-medium">Data gaji tidak ditemukan</p>
        <button onClick={() => router.back()} className="text-primary text-sm font-bold hover:underline">Kembali</button>
      </div>
    );
  }

  const emp = payroll.employee;
  const sc = emp?.salary_config;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 no-print">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary/90 transition-colors">
          <Printer className="w-4 h-4" />
          Cetak / PDF
        </button>
      </div>

      <style>{`
        @media print {
          @page { margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        @media screen {
          .payslip-card {
            box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
          }
        }
      `}</style>

      <div className="max-w-[210mm] mx-auto bg-white text-gray-900 payslip-card rounded-2xl p-8 md:p-12 print:p-8 print:rounded-none print:shadow-none">
        <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
          <h1 className="text-2xl font-black tracking-tight">SLIP GAJI</h1>
          <p className="text-sm text-gray-500 mt-1">Yayasan Syiar Gemilang</p>
          <p className="text-xs text-gray-400">Periode {getMonthName(payroll.month)} {payroll.year}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm mb-6">
          <InfoItem label="Nama" value={emp?.full_name || '-'} />
          <InfoItem label="Status" value={<span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${payroll.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{payroll.status === 'paid' ? 'Dibayar' : 'Pending'}</span>} />
          <InfoItem label="Jabatan" value={emp?.position || '-'} />
          <InfoItem label="Tgl Masuk" value={emp?.join_date ? new Date(emp.join_date).toLocaleDateString('id-ID') : '-'} />
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="bg-gray-50 px-5 py-2.5 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-700">Penghasilan</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <Row label="Gaji Pokok" value={sc?.basic_salary} />
              <Row label="Tunjangan Masa Kerja" value={sc?.tunj_masakerja} />
              <Row label="Tunjangan Jabatan" value={sc?.tunj_jabatan} />
              <Row label="Tunjangan Fungsional" value={sc?.tunj_fungsional} />
              <Row label="Tunjangan Keluarga" value={sc?.tunj_keluarga} />
              <Row label="Tunjangan Beras" value={sc?.tunj_beras} />
              <Row label="Tunjangan Transport" value={sc?.tunj_transport} />
              <Row label="Tunjangan Lainnya" value={sc?.tunj_lainnya} />
              <RowTotal label="Total Penghasilan" value={(sc?.basic_salary || 0) + (sc?.tunj_masakerja || 0) + (sc?.tunj_jabatan || 0) + (sc?.tunj_fungsional || 0) + (sc?.tunj_keluarga || 0) + (sc?.tunj_beras || 0) + (sc?.tunj_transport || 0) + (sc?.tunj_lainnya || 0)} />
            </tbody>
          </table>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="bg-red-50 px-5 py-2.5 border-b border-gray-200">
            <h2 className="text-sm font-bold text-red-700">Potongan</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <Row label="Potongan Alpha" value={sc?.pot_alpha} />
              <Row label="Potongan Lain" value={payroll.deductions - (sc?.pot_alpha || 0)} />
              <RowTotal label="Total Potongan" value={payroll.deductions} />
            </tbody>
          </table>
        </div>

        <div className="border-2 border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 flex justify-between items-center">
            <span className="text-sm font-black text-gray-800 uppercase tracking-wider">Gaji Bersih</span>
            <span className="text-xl font-black text-gray-900">{fmt(payroll.net_salary)}</span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 text-center text-xs text-gray-500">
          <div>
            <p>Diterima Oleh,</p>
            <div className="h-16" />
            <p className="font-bold text-gray-700 mt-2">{emp?.full_name || '-'}</p>
          </div>
          <div>
            <p>Mengetahui,</p>
            <div className="h-16" />
            <p className="font-bold text-gray-700 mt-2">Kepala Sekolah</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </>
  );
}

function Row({ label, value }: { label: string; value?: number | null }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-5 py-2.5 text-gray-600">{label}</td>
      <td className="px-5 py-2.5 text-right font-medium text-gray-800">{fmt(value || 0)}</td>
    </tr>
  );
}

function RowTotal({ label, value }: { label: string; value: number }) {
  return (
    <tr className="bg-gray-50 font-bold">
      <td className="px-5 py-2.5 text-gray-700">{label}</td>
      <td className="px-5 py-2.5 text-right font-black text-gray-900">{fmt(value)}</td>
    </tr>
  );
}
