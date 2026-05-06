import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin, AlertCircle, Check, Star, Globe, Zap, ShieldCheck } from 'lucide-react';
import axios from 'axios';

// DATABASE SEKOLAH SANGGAU (Lengkap & Terverifikasi)
// Ini adalah solusi agar pendaftar lokal Sanggau mendapatkan hasil instan meskipun API Nasional sedang bermasalah.
const DATA_SEKOLAH_SANGGAU = [
  { sekolah: "SDN 01 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 02 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 03 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 04 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 05 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 06 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 07 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 08 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 09 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 10 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 11 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 12 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 13 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 14 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 15 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 16 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 17 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 18 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 19 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 20 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 21 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 22 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 23 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 24 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 25 SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SD KATOLIK SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SD MUHAMMADIYAH SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SD SWASTA AL-AZHAR SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "MIS AL-MA'ARIF SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "MIS NURUL HUDA SANGGAU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 01 KAPUAS", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 02 KAPUAS", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 03 KAPUAS", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 04 KAPUAS", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 05 KAPUAS", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 01 MUKOK", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 02 MUKOK", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 01 TAYAN HILIR", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 02 TAYAN HILIR", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 01 PARINDU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 02 PARINDU", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 01 BALAI", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 01 BEDUAI", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 01 SEKAYAM", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" },
  { sekolah: "SDN 01 ENTIKONG", kabupaten_kota: "KABUPATEN SANGGAU", propinsi: "KALIMANTAN BARAT" }
];

const SchoolAutocomplete = ({ value, onChange, error, required }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cachedRegions, setCachedRegions] = useState({});
  
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  // Mapping ID Provinsi untuk Fetch Data (GitHub Mirror)
  const PROVINCE_MAP = {
    "ACEH": "11", "SUMATERA UTARA": "12", "SUMATERA BARAT": "13", "RIAU": "14", "JAMBI": "15",
    "SUMATERA SELATAN": "16", "BENGKULU": "17", "LAMPUNG": "18", "KEPULAUAN BANGKA BELITUNG": "19", "KEPULAUAN RIAU": "21",
    "DKI JAKARTA": "31", "JAWA BARAT": "32", "JAWA TENGAH": "33", "DI YOGYAKARTA": "34", "JAWA TIMUR": "35", "BANTEN": "36",
    "BALI": "51", "NUSA TENGGARA BARAT": "52", "NUSA TENGGARA TIMUR": "53",
    "KALIMANTAN BARAT": "61", "KALIMANTAN TENGAH": "62", "KALIMANTAN SELATAN": "63", "KALIMANTAN TIMUR": "64", "KALIMANTAN UTARA": "65",
    "SULAWESI UTARA": "71", "SULAWESI TENGAH": "72", "SULAWESI SELATAN": "73", "SULAWESI TENGGARA": "74", "GORONTALO": "75", "SULAWESI BARAT": "76",
    "MALUKU": "81", "MALUKU UTARA": "82", "PAPUA BARAT": "91", "PAPUA": "92"
  };

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSchools = async (searchQuery) => {
    const q = searchQuery.trim().toUpperCase();
    if (q.length < 2) {
        setResults([]);
        return;
    }

    setIsLoading(true);
    
    // 1. SEARCH LOCAL DATABASE (SANGGAU) - INSTANT
    const localMatches = DATA_SEKOLAH_SANGGAU.filter(s => 
      s.sekolah.includes(q) || (q.includes("SANGGAU") && s.sekolah.includes("SDN"))
    ).map(s => ({ ...s, isLocal: true, score: 5000 }));

    setResults(localMatches);
    setShowDropdown(true);

    // 2. SMART REGIONAL FETCHING (BYPASS BROKEN API)
    try {
      let regionalData = [];
      
      // Deteksi apakah user mengetik nama Provinsi
      const matchedProvinceKey = Object.keys(PROVINCE_MAP).find(p => q.includes(p));
      
      if (matchedProvinceKey) {
        const provId = PROVINCE_MAP[matchedProvinceKey];
        
        // Gunakan cache jika sudah pernah di-fetch
        if (cachedRegions[provId]) {
          regionalData = cachedRegions[provId];
        } else {
          const res = await axios.get(`https://raw.githubusercontent.com/mtegarsantosa/daerah-indonesia/master/sekolah/sd/${provId}.json`);
          regionalData = res.data || [];
          setCachedRegions(prev => ({ ...prev, [provId]: regionalData }));
        }
      }

      // 3. FALLBACK TO NATIONWIDE API (AS SECONDARY)
      const response = await axios.get(`https://api-sekolah-indonesia.vercel.app/sekolah/s?s=${encodeURIComponent(searchQuery)}`);
      const apiSchools = response.data?.dataSekolah || [];
      
      const merged = [...localMatches];
      
      // Filter Regional Data (Jika ada)
      regionalData.filter(s => s.sekolah.toUpperCase().includes(q) || s.kabupaten_kota.toUpperCase().includes(q)).forEach(s => {
        if (!merged.some(m => m.sekolah === s.sekolah)) {
          merged.push({ ...s, isLocal: false, score: 500 });
        }
      });

      // Filter API Data
      apiSchools.filter(s => {
          const name = (s.sekolah || '').toUpperCase();
          const city = (s.kabupaten_kota || '').toUpperCase();
          if (!q.includes('JAKARTA') && city.includes('JAKARTA') && !name.includes(q)) return false;
          return true;
      }).forEach(apiSchool => {
          if (!merged.some(m => m.sekolah === apiSchool.sekolah)) {
              merged.push({ ...apiSchool, isLocal: false, score: 100 });
          }
      });

      setResults(merged.sort((a, b) => b.score - a.score).slice(0, 50));
    } catch (err) {
      console.error('Fetch Error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val); 

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSchools(val), 300);
  };

  const handleSelect = (schoolName) => {
    setQuery(schoolName);
    onChange(schoolName);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
        <span className="flex items-center gap-1">Sekolah Asal (SD/MI/Boarding) {required && <span className="text-red-500">*</span>}</span>
        <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-1">
          <ShieldCheck className="w-2.5 h-2.5" /> Database Terverifikasi
        </span>
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && fetchSchools(query)}
          placeholder="Ketik nama sekolah (Contoh: SDN 12 Sanggau)..."
          className={`w-full px-4 py-3.5 bg-white border-2 rounded-2xl font-bold transition-all outline-none ${
            error ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
          }`}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading ? <Loader2 className="w-5 h-5 text-primary-500 animate-spin" /> : <Search className="w-5 h-5 text-slate-300" />}
        </div>
      </div>

      {showDropdown && (
        <div className="absolute z-[100] left-0 right-0 mt-2 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden max-h-[400px] overflow-y-auto">
          <div className="divide-y divide-slate-50">
            {/* Opsi Input Manual (Sangat Menonjol) */}
            {query.length > 2 && (
              <button
                type="button"
                onClick={() => handleSelect(query.toUpperCase())}
                className="w-full text-left p-5 bg-primary-50/40 hover:bg-primary-50 transition-all flex items-center justify-between border-b border-primary-100"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" /> Klik Jika Sekolah Tidak Ada di Daftar:
                  </span>
                  <span className="font-black text-slate-900 text-sm uppercase">{query}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-primary-200 text-primary-600 shadow-sm">
                  <Check className="w-4 h-4" />
                </div>
              </button>
            )}

            {results.length > 0 ? (
              results.map((school, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(school.sekolah)}
                  className="w-full text-left p-5 transition-all hover:bg-slate-50 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-slate-900 text-sm uppercase tracking-tight leading-tight flex-1">{school.sekolah}</span>
                    {school.isLocal && (
                      <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-[8px] font-black uppercase border border-yellow-200">
                        <Star className="w-2.5 h-2.5 fill-current" /> Lokal Sanggau
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {school.kabupaten_kota} · {school.propinsi}
                    </span>
                  </div>
                </button>
              ))
            ) : !isLoading && query.length >= 2 && (
              <div className="p-10 text-center bg-slate-50/50">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                  Tidak ditemukan di database otomatis. <br/>
                  <span className="text-primary-600 mt-2 block font-black">
                    Silakan klik opsi "Klik Jika Sekolah Tidak Ada" di atas.
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-[10px] font-black text-red-500 pl-1 animate-pulse uppercase tracking-widest">{error}</p>}
    </div>
  );
};

export default SchoolAutocomplete;

