'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Trash2, Save, Eye, User, Phone, Mail, MapPin, Calendar, BookOpen, Hash, Verified, Edit, Printer, Heart, Map, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { useLockBodyScroll } from '@/lib/useLockBodyScroll';
import { MapPicker } from './MapPicker';

// --- View Detail Modal ---
export const ViewStudentModal = ({ student, isOpen, onClose }: any) => {
  useLockBodyScroll(isOpen);
  if (!isOpen || !student) return null;

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Kartu Pelajar - ${student.full_name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f0f0; }
            .card { width: 350px; height: 220px; background: linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%); border-radius: 15px; padding: 20px; color: white; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; }
            .header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
            .logo { width: 40px; height: 40px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #0052D4; font-weight: 900; font-size: 18px; }
            .school-name { font-size: 14px; font-weight: 900; letter-spacing: 1px; }
            .content { display: flex; gap: 15px; }
            .photo { width: 80px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 40px; border: 2px solid rgba(255,255,255,0.3); overflow: hidden; }
            .photo img { width: 100%; height: 100%; object-fit: cover; }
            .details { flex: 1; }
            .details h2 { margin: 0; font-size: 16px; font-weight: 900; text-transform: uppercase; }
            .details p { margin: 2px 0; font-size: 10px; font-weight: 600; opacity: 0.9; }
            .qr { position: absolute; bottom: 20px; right: 20px; background: white; padding: 5px; border-radius: 8px; width: 50px; height: 50px; }
            .qr img { width: 100%; height: 100%; }
            .footer { position: absolute; bottom: 20px; left: 20px; font-size: 8px; font-weight: 700; opacity: 0.7; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header"><div class="logo">SG</div><div class="school-name">RGI ERP SYSTEM</div></div>
            <div class="content">
              <div class="photo">${student.profile_picture ? `<img src="${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${student.profile_picture}" />` : student.full_name.charAt(0)}</div>
              <div class="details">
                <h2>${student.full_name}</h2>
                <p>NIS: ${student.nis}</p>
                <p>Cabang: ${student.branch?.name || '-'}</p>
                <p>Jurusan: ${student.major?.name || '-'}</p>
                <p>Angkatan: ${student.batch?.name || '-'}</p>
              </div>
            </div>
            <div class="footer">KARTU PELAJAR DIGITAL</div>
            <div class="qr"><img src="${student.qr_code}" /></div>
          </div>
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2"><Eye className="w-5 h-5 text-primary" />Detail Profil Santri</h3>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all"><Printer className="w-4 h-4" />Cetak Kartu</button>
<button autoFocus onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-4 md:p-8 overflow-y-auto flex-1 space-y-8 text-sm">
          <div className="flex items-start gap-6 pb-6 border-b border-outline-variant/50">
            {student.profile_picture ? (
              <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${student.profile_picture}`} alt="" className="w-32 h-32 rounded-2xl object-cover shadow-md border-2 border-primary/20" />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl shadow-inner">{student.full_name?.charAt(0)}</div>
            )}
            <div className="space-y-1">
              <h4 className="text-3xl font-bold text-on-surface tracking-tight">{student.full_name}</h4>
              <p className="text-on-surface-variant font-bold flex items-center gap-2 text-lg"><Hash className="w-5 h-5 text-primary" />{student.nis}</p>
              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">{student.branch?.name}</span>
                <span className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border", student.status === 'active' ? "bg-secondary-container/20 text-secondary border-secondary/20" : "bg-outline-variant/20 text-on-surface-variant")}>{student.status}</span>
              </div>
            </div>
            <div className="ml-auto flex flex-col items-center gap-2">
              {student.qr_code && <div className="bg-white p-2 border border-outline-variant rounded-xl shadow-sm"><img src={student.qr_code} alt="QR Code" className="w-24 h-24" /></div>}
              <span className="text-[10px] font-bold text-outline-variant uppercase">ID QR Scan</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <div className="space-y-4 col-span-1">
              <h5 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><User className="w-4 h-4" /> Data Pribadi</h5>
              <div className="space-y-4">
                <DetailItem icon={<Verified className="w-4 h-4" />} label="NIK" value={student.nik} />
                <DetailItem icon={<User className="w-4 h-4" />} label="Gender" value={student.gender === 'L' ? 'Laki-laki' : 'Perempuan'} />
                <DetailItem icon={<Calendar className="w-4 h-4" />} label="TTL" value={`${student.birth_place}, ${new Date(student.birth_date).toLocaleDateString('id-ID')}`} />
                <DetailItem icon={<Mail className="w-4 h-4" />} label="Email" value={student.email} />
                <DetailItem icon={<Phone className="w-4 h-4" />} label="Telepon" value={student.phone} />
                <DetailItem icon={<MapPin className="w-4 h-4" />} label="Alamat" value={student.address} />
              </div>
            </div>
            <div className="space-y-8 col-span-1">
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Akademik</h5>
                <div className="bg-surface-container rounded-2xl p-5 space-y-4 border border-outline-variant/30 shadow-inner">
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2"><span className="text-outline font-bold text-[10px] uppercase tracking-widest">Jurusan</span><span className="text-on-surface font-bold">{student.major?.name || '-'}</span></div>
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2"><span className="text-outline font-bold text-[10px] uppercase tracking-widest">Angkatan</span><span className="text-on-surface font-bold text-lg">{student.batch?.name || '-'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-outline font-bold text-[10px] uppercase tracking-widest">Kelas</span><span className="text-on-surface font-bold">{student.class?.name || '-'}</span></div>
                </div>
              </div>
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-error uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Heart className="w-4 h-4" /> Kesehatan</h5>
                <div className="bg-error-container/10 rounded-2xl p-5 border border-error/20"><p className="text-on-surface font-medium leading-relaxed italic">{student.health_history || 'Tidak ada riwayat kesehatan yang tercatat.'}</p></div>
              </div>
            </div>
            <div className="space-y-8 col-span-1">
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Map className="w-4 h-4" /> Lokasi (Integrasi Maps)</h5>
                <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
                  {student.latitude && student.longitude ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold"><span className="text-outline">LAT</span><span className="text-on-surface">{student.latitude}</span></div>
                      <div className="flex justify-between text-xs font-bold"><span className="text-outline">LONG</span><span className="text-on-surface">{student.longitude}</span></div>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${student.latitude},${student.longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-secondary text-on-secondary rounded-lg font-bold text-xs hover:opacity-90 transition-all"><MapPin className="w-4 h-4" />Buka di Google Maps</a>
                    </div>
                  ) : <p className="text-xs text-on-surface-variant font-medium text-center py-4 opacity-50">Koordinat tidak tersedia</p>}
                </div>
              </div>
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-tertiary uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><User className="w-4 h-4" /> Orang Tua / Wali</h5>
                {student.parents?.map((parent: any, i: number) => (
                  <div key={i} className="bg-tertiary-container/10 border border-tertiary/20 rounded-xl p-4 space-y-2">
                    <p className="font-bold text-on-surface text-xs uppercase tracking-wider">{parent.father_name} (Ayah)</p>
                    <p className="font-bold text-on-surface text-xs uppercase tracking-wider">{parent.mother_name} (Ibu)</p>
                    <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-on-surface-variant"><Phone className="w-3 h-3 text-tertiary" /> {parent.phone}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end"><button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-surface-container-high text-on-surface-variant font-bold text-sm hover:bg-outline-variant/30 transition-all">Tutup</button></div>
      </div>
    </div>
  );
};

function DetailItem({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-primary/60">{icon}</div>
      <div><p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest leading-none mb-1">{label}</p><p className="text-sm font-semibold text-on-surface leading-snug">{value || '-'}</p></div>
    </div>
  );
}

// --- Edit Student Modal ---
export const EditStudentModal = ({ student, isOpen, onClose, onSuccess, branches, majors, batches, classes }: any) => {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        nis: student.nis, nik: student.nik, full_name: student.full_name, gender: student.gender, birth_place: student.birth_place,
        birth_date: student.birth_date ? new Date(student.birth_date).toISOString().split('T')[0] : '',
        address: student.address, phone: student.phone, email: student.email, branch_id: student.branch_id, major_id: student.major_id,
        batch_id: student.batch_id, class_id: student.class_id, status: student.status, health_history: student.health_history || '',
        profile_picture: student.profile_picture || '', latitude: student.latitude || '', longitude: student.longitude || '',
        parents: student.parents?.[0] ? { father_name: student.parents[0].father_name, mother_name: student.parents[0].mother_name, phone: student.parents[0].phone, address: student.parents[0].address } : { father_name: '', mother_name: '', phone: '', address: '' }
      });
    }
  }, [student]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const form = new FormData();
    form.append('photo', file);
    try {
      const res = await apiRequest('/students/upload-photo', { method: 'POST', body: form });
      setFormData((prev: any) => ({ ...prev, profile_picture: res.url }));
    } catch (err) { alert('Gagal unggah foto'); }
    finally { setIsUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Clean empty strings for UUID fields
      const payload: any = {
        nis: formData.nis, nik: formData.nik, full_name: formData.full_name,
        gender: formData.gender, birth_place: formData.birth_place,
        birth_date: new Date(formData.birth_date).toISOString(),
        address: formData.address, phone: formData.phone, email: formData.email,
        status: formData.status,
      };
      if (formData.branch_id) payload.branch_id = formData.branch_id;
      if (formData.major_id) payload.major_id = formData.major_id;
      if (formData.batch_id) payload.batch_id = formData.batch_id;
      if (formData.class_id) payload.class_id = formData.class_id;
      if (formData.health_history) payload.health_history = formData.health_history;
      if (formData.profile_picture) payload.profile_picture = formData.profile_picture;
      if (formData.latitude) payload.latitude = parseFloat(formData.latitude);
      if (formData.longitude) payload.longitude = parseFloat(formData.longitude);
      if (formData.parents?.father_name || formData.parents?.mother_name) {
        const { address, ...parentData } = formData.parents;
        payload.parents = address ? formData.parents : parentData;
      }
      await apiRequest(`/students/${student.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      onSuccess();
      onClose();
    } catch (err: any) { alert('Gagal mengupdate siswa: ' + err.message); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2"><Edit className="w-5 h-5 text-primary" />Edit Profil Santri RGI</h3>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <form id="editStudentForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6 bg-surface-container p-4 rounded-2xl border border-outline-variant/30">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  {formData.profile_picture ? <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${formData.profile_picture}`} className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-primary" />}
                  {isUploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>}
                </div>
                <label className="absolute -bottom-2 -right-2 p-2 bg-primary text-on-primary rounded-xl cursor-pointer shadow-lg hover:scale-105 transition-all"><Upload className="w-4 h-4" /><input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} /></label>
              </div>
              <div><h4 className="font-bold text-on-surface uppercase tracking-wider">Foto Profil Santri</h4><p className="text-[10px] font-medium text-on-surface-variant">Unggah foto formal santri untuk kartu pelajar digital.</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1"><label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">NIS</label><input type="text" required value={formData.nis || ''} onChange={e => setFormData({...formData, nis: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">NIK</label><input type="text" required value={formData.nik || ''} onChange={e => setFormData({...formData, nik: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Jenis Kelamin</label><select required value={formData.gender || 'L'} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
            </div>
            <div className="space-y-1"><label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nama Lengkap</label><input type="text" required value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" /></div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Lokasi Rumah (Maps)</label>
              <MapPicker 
                initialPos={formData.latitude ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) } : null}
                onLocationSelect={(lat: number, lng: number, addr?: string) => {
                  setFormData((prev: any) => ({ ...prev, latitude: lat.toString(), longitude: lng.toString(), address: addr || prev.address }));
                }} 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cabang</label>
                <select 
                  required 
                  value={formData.branch_id || ''} 
                  onChange={e => {
                    const newBranchId = e.target.value;
                    const firstMajor = majors?.find((m: any) => m.branch_id === newBranchId);
                    setFormData({
                      ...formData, 
                      branch_id: newBranchId, 
                      major_id: firstMajor ? firstMajor.id : '',
                      class_id: ''
                    });
                  }} 
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {branches?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Jurusan</label>
                <select 
                  required 
                  value={formData.major_id || ''} 
                  onChange={e => setFormData({...formData, major_id: e.target.value, class_id: ''})} 
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">Pilih Jurusan</option>
                  {majors?.filter((m: any) => m.branch_id === formData.branch_id).map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Angkatan</label>
                <select 
                  required 
                  value={formData.batch_id || ''} 
                  onChange={e => setFormData({...formData, batch_id: e.target.value, class_id: ''})} 
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {batches?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Kelas</label>
                <select 
                  required 
                  value={formData.class_id || ''} 
                  onChange={e => setFormData({...formData, class_id: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">Pilih Kelas</option>
                  {classes?.filter((c: any) => c.major_id === formData.major_id && c.batch_id === formData.batch_id).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1"><label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</label><select required value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"><option value="active">Aktif</option><option value="alumni">Alumni</option><option value="moved">Pindah</option></select></div>
            </div>
            <div className="space-y-1"><label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Alamat Lengkap (Auto-fill)</label><textarea required value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none h-20 resize-none"></textarea></div>
            <div className="space-y-1"><label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Riwayat Kesehatan</label><textarea value={formData.health_history || ''} onChange={e => setFormData({...formData, health_history: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none h-20 resize-none"></textarea></div>
          </form>
        </div>
        <div className="px-6 py-4 border-t border-outline-variant bg-surface flex flex-col sm:flex-row justify-end gap-3 w-full"><button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all">Batal</button><button type="submit" form="editStudentForm" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Simpan Perubahan</button></div>
      </div>
    </div>
  );
};

// --- Delete Confirm Modal (No changes needed) ---
export const DeleteStudentModal = ({ student, isOpen, onClose, onSuccess }: any) => {
  useLockBodyScroll(isOpen);
  const [isDeleting, setIsDeleting] = useState(false);
  if (!isOpen || !student) return null;
  const handleDelete = async () => {
    setIsDeleting(true);
    try { await apiRequest(`/students/${student.id}`, { method: 'DELETE' }); onSuccess(); onClose(); }
    catch (err: any) { alert('Gagal menghapus siswa: ' + err.message); }
    finally { setIsDeleting(false); }
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-[28rem] rounded-2xl shadow-2xl overflow-hidden p-4 md:p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto text-error"><Trash2 className="w-10 h-10" /></div>
        <div className="space-y-2"><h3 className="text-xl font-bold text-on-surface tracking-tight">Hapus Data Siswa?</h3><p className="text-on-surface-variant font-medium leading-relaxed">Anda akan menghapus data <span className="text-on-surface font-bold">"{student.full_name}"</span>.</p></div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full"><button autoFocus onClick={onClose} className="flex-1 px-6 py-3 rounded-xl border border-outline text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all">Batal</button><button onClick={handleDelete} disabled={isDeleting} className="flex-1 px-6 py-3 rounded-xl bg-error text-on-error font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-error/20">{isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}Hapus</button></div>
      </div>
    </div>
  );
};
