'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Trash2, Save, Eye, Package, MapPin, Tag, ShieldCheck, Hash, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { useLockBodyScroll } from '@/lib/useLockBodyScroll';

// --- View Asset Modal ---
export const ViewAssetModal = ({ asset, isOpen, onClose }: any) => {
  useLockBodyScroll(isOpen);
  if (!isOpen || !asset) return null;

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    
    win.document.write(`
      <html>
        <head>
          <title>Label Aset - ${asset.code}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f0f0; }
            .label { width: 250px; background: white; border-radius: 12px; padding: 15px; color: #0b1c30; position: relative; border: 2px solid #00288e; text-align: center; }
            .header { font-size: 10px; font-weight: 900; color: #00288e; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
            .qr { background: white; padding: 5px; border-radius: 8px; width: 120px; height: 120px; margin: 0 auto 10px; }
            .qr img { width: 100%; height: 100%; }
            .code { font-size: 16px; font-weight: 900; color: #00288e; margin-bottom: 5px; }
            .name { font-size: 12px; font-weight: 700; opacity: 0.8; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">PROPERTI SYIAR GEMILANG</div>
            <div class="qr"><img src="${asset.qr_code}" /></div>
            <div class="code">${asset.code}</div>
            <div class="name">${asset.name}</div>
          </div>
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Detail Aset
          </h3>
          <div className="flex items-center gap-2">
             <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all">
              <Printer className="w-4 h-4" />
              Cetak Label
            </button>
            <button autoFocus onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 md:p-8 space-y-8">
          <div className="flex justify-center">
            {asset.qr_code ? (
              <div className="bg-white p-4 border-2 border-primary/20 rounded-2xl shadow-sm">
                <img src={asset.qr_code} alt="QR Code" className="w-40 h-40" />
              </div>
            ) : (
              <div className="w-40 h-40 bg-surface-container rounded-2xl flex items-center justify-center text-outline">
                QR Code tidak tersedia
              </div>
            )}
          </div>

          <div className="text-center space-y-1">
            <h4 className="text-2xl font-black text-on-surface tracking-tight uppercase">{asset.code}</h4>
            <p className="text-lg font-bold text-primary">{asset.name}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-container p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Kategori</span>
              <p className="font-bold text-on-surface flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                {asset.category}
              </p>
            </div>
            <div className="bg-surface-container p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Lokasi</span>
              <p className="font-bold text-on-surface flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {asset.location}
              </p>
            </div>
            <div className="bg-surface-container p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Kondisi</span>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  asset.condition === 'good' ? "bg-success" : asset.condition === 'fair' ? "bg-secondary" : "bg-error"
                )} />
                <p className="font-bold text-on-surface capitalize">{asset.condition === 'good' ? 'Baik' : asset.condition === 'fair' ? 'Cukup' : 'Rusak'}</p>
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Status</span>
              <p className="font-bold text-on-surface flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {asset.status === 'available' ? 'Tersedia' : asset.status === 'loaned' ? 'Dipinjam' : 'Perbaikan'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-surface-container-high text-on-surface-variant font-bold text-sm hover:bg-outline-variant/30 transition-all">Tutup</button>
        </div>
      </div>
    </div>
  );
};

// --- Edit Asset Modal ---
export const EditAssetModal = ({ asset, isOpen, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (asset) {
      setFormData({
        code: asset.code,
        name: asset.name,
        category: asset.category,
        location: asset.location,
        condition: asset.condition,
        status: asset.status
      });
    }
  }, [asset]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest(`/assets/${asset.id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('Gagal mengupdate aset: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
          <h3 className="text-lg font-bold text-on-surface">Edit Data Aset</h3>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <form id="editAssetForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">Kode Aset</label>
                <input type="text" required value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">Nama Aset</label>
                <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">Kategori</label>
                <input type="text" required value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">Lokasi</label>
                <input type="text" required value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">Kondisi</label>
                <select required value={formData.condition || ''} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="good">Baik</option>
                  <option value="fair">Cukup</option>
                  <option value="broken">Rusak</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">Status</label>
                <select required value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="available">Tersedia</option>
                  <option value="loaned">Dipinjam</option>
                  <option value="maintenance">Perbaikan</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant bg-surface flex flex-col sm:flex-row justify-end gap-3 w-full">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors">Batal</button>
          <button type="submit" form="editAssetForm" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Delete Confirm Modal ---
export const DeleteAssetModal = ({ asset, isOpen, onClose, onSuccess }: any) => {
  useLockBodyScroll(isOpen);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !asset) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiRequest(`/assets/${asset.id}`, { method: 'DELETE' });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('Gagal menghapus aset: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-[28rem] rounded-2xl shadow-2xl overflow-hidden p-4 md:p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto text-error shadow-inner">
          <Trash2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-on-surface tracking-tight">Hapus Data Aset?</h3>
          <p className="text-on-surface-variant font-medium leading-relaxed">
            Anda akan menghapus data <span className="text-on-surface font-bold">"{asset.name}"</span>. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
          <button autoFocus onClick={onClose} className="flex-1 px-6 py-3 rounded-xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all active:scale-95">Batal</button>
          <button 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="flex-1 px-6 py-3 rounded-xl bg-error text-on-error font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-error/20"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Hapus Aset
          </button>
        </div>
      </div>
    </div>
  );
};
