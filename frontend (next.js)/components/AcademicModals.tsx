'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Book, Calendar, Clock, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { useLockBodyScroll } from '@/lib/useLockBodyScroll';

// --- CREATE SCHEDULE MODAL ---
export const CreateScheduleModal = ({ isOpen, onClose, onUpdate }: any) => {
  useLockBodyScroll(isOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    teacher_id: '',
    day: 'Monday',
    start_time: '08:00',
    end_time: '10:00'
  });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [sRes, eRes, cRes] = await Promise.all([
            apiRequest('/subjects'),
            apiRequest('/employees'),
            apiRequest('/classes')
          ]);
          setSubjects(sRes.data || sRes);
          setEmployees(Array.isArray(eRes) ? eRes : (eRes.data || []));
          setClasses(Array.isArray(cRes) ? cRes : (cRes.data || []));
        } catch (err) {
          console.error('Failed to fetch modal data', err);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const selectedClass = classes.find(c => c.id === formData.class_id);
      if (!selectedClass) throw new Error('Pilih Kelas terlebih dahulu');

      const payload = {
        ...formData,
        major_id: selectedClass.major_id,
        batch_id: selectedClass.batch_id
      };

      await apiRequest('/schedules', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      onUpdate();
      onClose();
      setFormData({
        class_id: '',
        subject_id: '',
        teacher_id: '',
        day: 'Monday',
        start_time: '08:00',
        end_time: '10:00'
      });
    } catch (err: any) {
      alert('Gagal membuat jadwal: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-outline-variant flex justify-between items-center bg-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-on-surface tracking-tight">Tambah Jadwal Baru</h3>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SelectGroup 
              label="Hari" 
              icon={<Calendar size={16} />}
              value={formData.day} 
              onChange={(v: string) => setFormData({...formData, day: v})}
              options={[
                { value: 'Monday', label: 'Senin' },
                { value: 'Tuesday', label: 'Selasa' },
                { value: 'Wednesday', label: 'Rabu' },
                { value: 'Thursday', label: 'Kamis' },
                { value: 'Friday', label: 'Jumat' },
                { value: 'Saturday', label: 'Sabtu' },
                { value: 'Sunday', label: 'Minggu' }
              ]}
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <InputGroup label="Mulai" type="time" value={formData.start_time} onChange={(v: string) => setFormData({...formData, start_time: v})} />
              <InputGroup label="Selesai" type="time" value={formData.end_time} onChange={(v: string) => setFormData({...formData, end_time: v})} />
            </div>
          </div>

          <SelectGroup 
            label="Kelas" 
            icon={<Users size={16} />}
            value={formData.class_id} 
            onChange={(v: string) => setFormData({...formData, class_id: v})}
            options={classes.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Pilih Kelas"
          />

          <SelectGroup 
            label="Mata Pelajaran" 
            icon={<Book size={16} />}
            value={formData.subject_id} 
            onChange={(v: string) => setFormData({...formData, subject_id: v})}
            options={subjects.map(s => ({ value: s.id, label: s.name }))}
            placeholder="Pilih Mata Pelajaran"
          />

          <SelectGroup 
            label="Guru Pengajar" 
            icon={<User size={16} />}
            value={formData.teacher_id} 
            onChange={(v: string) => setFormData({...formData, teacher_id: v})}
            options={employees.map(e => ({ value: e.id, label: e.full_name }))}
            placeholder="Pilih Guru"
          />

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
             <button 
               type="button"
               onClick={onClose}
               className="flex-1 px-6 py-3 rounded-xl border border-outline text-on-surface font-bold hover:bg-surface-container transition-all"
             >
               Batal
             </button>
             <button 
               type="submit"
               disabled={isLoading}
               className="flex-3 flex items-center justify-center gap-2 px-10 py-3 rounded-xl bg-primary text-on-primary font-black shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
             >
               {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
               Simpan Jadwal
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- CREATE SUBJECT MODAL ---
export const CreateSubjectModal = ({ isOpen, onClose, onUpdate }: any) => {
  useLockBodyScroll(isOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiRequest('/subjects', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      onUpdate();
      onClose();
      setFormData({ name: '' });
    } catch (err: any) {
      alert('Gagal menambah mata pelajaran: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
       <div className="bg-surface-container-lowest w-full max-w-[28rem] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-outline-variant flex justify-between items-center bg-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 text-secondary rounded-xl">
              <Book className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-on-surface tracking-tight">Mata Pelajaran Baru</h3>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6">
           <InputGroup 
             label="Nama Mata Pelajaran" 
             value={formData.name} 
             onChange={(v: string) => setFormData({ name: v })} 
             placeholder="Contoh: Pemrograman Web"
           />
           <button 
             type="submit"
             disabled={isLoading || !formData.name}
             className="w-full flex items-center justify-center gap-2 px-10 py-3 rounded-xl bg-secondary text-on-secondary font-black shadow-lg shadow-secondary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
           >
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
             Simpan
           </button>
        </form>
       </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---
function InputGroup({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">{label}</label>
      <input 
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
    </div>
  );
}

function SelectGroup({ label, value, onChange, options, placeholder, icon }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <select 
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
