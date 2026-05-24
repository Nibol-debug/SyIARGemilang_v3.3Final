'use client';

import React, { useState, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { BASE_URL } from '@/lib/api';

const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-surface-container flex items-center justify-center rounded-xl font-bold text-outline text-sm">Memuat Peta...</div>
});

export const MapPicker = ({ onLocationSelect, initialPos }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentPos, setCurrentPos] = useState(initialPos);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(`${BASE_URL}/locationiq/reverse?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    } catch (err) {
      console.error("Reverse geocoding error", err);
    }
    return undefined;
  }, []);

  const handleLocationSelect = useCallback(async (lat: number, lng: number, address?: string) => {
    setCurrentPos({ lat, lng });
    
    if (address) {
      onLocationSelect(lat, lng, address);
      return;
    }

    const addr = await reverseGeocode(lat, lng);
    onLocationSelect(lat, lng, addr);
  }, [onLocationSelect, reverseGeocode]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`${BASE_URL}/locationiq/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const newPos = { lat, lng };
        setCurrentPos(newPos);
        handleLocationSelect(lat, lng, data[0].display_name);
      } else {
        alert("Lokasi tidak ditemukan.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat mencari lokasi.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder="Cari desa, kecamatan, atau kota..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e as any);
              }
            }}
          />
        </div>
        <button 
          type="button"
          onClick={(e) => handleSearch(e as any)}
          disabled={isSearching}
          className="px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-md hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[80px]"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cari'}
        </button>
      </div>
      
      <div className="relative border border-outline-variant rounded-2xl overflow-hidden">
        <MapComponent key={currentPos?.lat || 'default'} initialPos={currentPos} onLocationSelect={handleLocationSelect} />
      </div>
      
      <p className="text-[10px] font-bold text-outline-variant uppercase text-center italic">*Klik pada peta atau gunakan pencarian untuk menentukan lokasi akurat rumah Anda</p>
    </div>
  );
};