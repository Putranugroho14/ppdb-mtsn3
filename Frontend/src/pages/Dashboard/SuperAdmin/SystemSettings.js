import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import { mapErrorMessage, validatePhone } from '../../../utils/errorMapper';
import { 
  Settings, 
  Save, 
  School, 
  Hash, 
  ToggleLeft, 
  ToggleRight,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  Check,
  X,
  Phone,
  ListChecks,
  GitMerge,
  Info,
  MapPin,
  Award,
  Users,
  Calendar,
  AlertCircle,
  ArrowRight,
  Clock,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('profil');
  const [settings, setSettings] = useState(null);
  const [listPersyaratan, setListPersyaratan] = useState([]);
  const [listAlur, setListAlur] = useState([]);
  const [activeSetup, setActiveSetup] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);

  const premiumInput = "w-full px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none shadow-sm";

  // Setup Form State
  const [setupForm, setSetupForm] = useState({
    tahun: '',
    tanggalPendaftaranMulai: '',
    tanggalPendaftaranSelesai: '',
    tanggalVerifikasiRaw: '',
    tanggalTestRaw: '',
    tanggalPengumumanRaw: '',
    tanggalDaftarUlangMulai: '',
    tanggalDaftarUlangSelesai: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, setupsRes] = await Promise.all([
        API.get('/superadmin/settings'),
        API.get('/superadmin/setups')
      ]);
      
      const data = settingsRes.data;
      setSettings(data);

      // Load active setup
      const active = setupsRes.data.find(s => s.isActive);
      if (active) {
        setActiveSetup(active);
        setSetupForm({
          tahun: active.tahun || '',
          tanggalPendaftaranMulai: active.tanggalPendaftaranMulai || '',
          tanggalPendaftaranSelesai: active.tanggalPendaftaranSelesai || '',
          tanggalVerifikasiRaw: active.tanggalVerifikasiRaw || '',
          tanggalTestRaw: active.tanggalTestRaw || '',
          tanggalPengumumanRaw: active.tanggalPengumumanRaw || '',
          tanggalDaftarUlangMulai: active.tanggalDaftarUlangMulai || '',
          tanggalDaftarUlangSelesai: active.tanggalDaftarUlangSelesai || ''
        });
      }

      // Parse JSON lists
      try {
        setListPersyaratan(JSON.parse(data.persyaratan || '[]'));
      } catch (e) { setListPersyaratan([]); }

      try {
        setListAlur(JSON.parse(data.alurPendaftaran || '[]'));
      } catch (e) { setListAlur([]); }

    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const validateProfil = () => {
    const errors = {};
    if (!settings.schoolName) errors.schoolName = 'Nama Madrasah wajib diisi.';
    if (!settings.npsn) errors.npsn = 'NPSN wajib diisi.';
    if (!settings.alamatSekolah) errors.alamatSekolah = 'Alamat institusi wajib diisi.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (activeTab === 'profil' && !validateProfil()) {
      setError('Beberapa data profil masih kosong atau tidak valid.');
      setShowErrorModal(true);
      return;
    }

    setSavingSettings(true);
    setMessage(null);

    const finalSettings = {
      ...settings,
      persyaratan: JSON.stringify(listPersyaratan),
      alurPendaftaran: JSON.stringify(listAlur)
    };

    try {
      const validatedSettings = {
        ...finalSettings,
        totalSiswa: parseInt(finalSettings.totalSiswa) || 0,
        siswaL: parseInt(finalSettings.siswaL) || 0,
        siswaP: parseInt(finalSettings.siswaP) || 0
      };

      await API.post('/superadmin/settings', validatedSettings);
      setMessage({ type: 'success', text: 'Seluruh perubahan berhasil disimpan secara permanen!' });
      setTimeout(() => setMessage(null), 4000);
      fetchData();
    } catch (error) {
      setError(mapErrorMessage(error));
      setShowErrorModal(true);
    } finally {
      setSavingSettings(false);
    }
  };

  const addItem = (type) => {
    const newItem = { title: '', description: '' };
    if (type === 'persyaratan') setListPersyaratan([...listPersyaratan, newItem]);
    else setListAlur([...listAlur, newItem]);
  };

  const removeItem = (type, index) => {
    if (type === 'persyaratan') {
      const newList = [...listPersyaratan];
      newList.splice(index, 1);
      setListPersyaratan(newList);
    } else {
      const newList = [...listAlur];
      newList.splice(index, 1);
      setListAlur(newList);
    }
  };

  const updateItem = (type, index, field, value) => {
    if (type === 'persyaratan') {
      const newList = [...listPersyaratan];
      newList[index][field] = value;
      setListPersyaratan(newList);
    } else {
      const newList = [...listAlur];
      newList[index][field] = value;
      setListAlur(newList);
    }
  };

  const handleSaveSetup = async (e) => {
    e.preventDefault();

    // VALIDASI JADWAL PINTAR
    if (!setupForm.tahun) {
      setFieldErrors({ tahun: 'Tahun ajaran wajib diisi.' });
      setError('Harap isi tahun ajaran.');
      setShowErrorModal(true);
      return;
    }

    if (setupForm.tanggalPendaftaranMulai && setupForm.tanggalPendaftaranSelesai) {
      if (new Date(setupForm.tanggalPendaftaranMulai) > new Date(setupForm.tanggalPendaftaranSelesai)) {
        setFieldErrors({ tanggalPendaftaranMulai: 'Tanggal mulai tidak boleh melebihi tanggal selesai.' });
        setError('Urutan tanggal pendaftaran tidak valid.');
        setShowErrorModal(true);
        return;
      }
    }

    setSavingSettings(true);
    
    const payload = {
      tahun: setupForm.tahun || activeSetup?.tahun || new Date().getFullYear().toString(),
      tanggalPendaftaranMulai: setupForm.tanggalPendaftaranMulai,
      tanggalPendaftaranSelesai: setupForm.tanggalPendaftaranSelesai,
      tanggalVerifikasiRaw: setupForm.tanggalVerifikasiRaw,
      tanggalTestRaw: setupForm.tanggalTestRaw,
      tanggalPengumumanRaw: setupForm.tanggalPengumumanRaw,
      tanggalDaftarUlangMulai: setupForm.tanggalDaftarUlangMulai,
      tanggalDaftarUlangSelesai: setupForm.tanggalDaftarUlangSelesai
    };

    try {
      const response = await API.post('/superadmin/setups', payload);
      const savedSetup = response.data.setup;
      
      if (savedSetup && savedSetup.id) {
        await API.put(`/superadmin/setups/${savedSetup.id}/activate`);
      }
      
      await fetchData();
      setMessage({ type: 'success', text: 'Jadwal PPDB Berhasil diperbarui dan telah dipublikasikan!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      setError(mapErrorMessage(error));
      setShowErrorModal(true);
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading || !settings) return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
      <div className="relative">
        <Loader2 className="w-16 h-16 animate-spin text-primary-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-ping"></div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-slate-900 font-black text-lg tracking-tight uppercase">Mengamankan Sesi...</p>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Mengunduh konfigurasi terbaru dari server</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* 🏛️ CLEAN INSTITUTIONAL HEADER */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20">
              <Settings className="w-7 h-7 text-primary-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Konfigurasi <span className="text-primary-600">Sistem</span></h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Pusat Kendali Operasional PPDB</p>
            </div>
          </div>
          
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
            {[
              { id: 'profil', icon: School, label: 'Profil' },
              { id: 'info', icon: ListChecks, label: 'Syarat & Alur' },
              { id: 'timeline', icon: Calendar, label: 'Jadwal' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-primary-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -50, scale: 0.9 }} 
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-4 border backdrop-blur-xl ${
              message.type === 'error' 
                ? 'bg-red-900/90 border-red-500/50 text-white' 
                : 'bg-slate-900/90 border-emerald-500/50 text-white'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                message.type === 'error' ? 'bg-red-500/20' : 'bg-emerald-500/20'
              }`}>
                {message.type === 'error' 
                  ? <AlertTriangle className="w-6 h-6 text-red-400" /> 
                  : <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                }
              </div>
              <div className="flex-1">
                <p className="font-black text-xs uppercase tracking-tight">
                  {message.type === 'error' ? 'Perhatian / Gagal' : 'Berhasil Disimpan'}
                </p>
                <p className="text-[10px] opacity-80 font-medium leading-relaxed">{message.text}</p>
              </div>
              <button onClick={() => setMessage(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚠️ SUMMARY ERROR MODAL */}
      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl border-t-8 border-red-500 overflow-hidden">
              <button onClick={() => setShowErrorModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><AlertCircle className="w-10 h-10" /></div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Terjadi Kesalahan</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{error}</p>
              </div>
              <button onClick={() => setShowErrorModal(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Tutup</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        
        {/* PROFIL TAB */}
        {activeTab === 'profil' && (
          <form onSubmit={handleSaveSettings} className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Identitas Dasar</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Madrasah / Sekolah <span className="text-red-500">*</span></label>
                    <input type="text" className={`${premiumInput} ${fieldErrors.schoolName ? 'border-red-500 bg-red-50/30' : ''}`} value={settings.schoolName} onChange={e => { setSettings({...settings, schoolName: e.target.value}); setFieldErrors({...fieldErrors, schoolName: ''}); }} />
                    {fieldErrors.schoolName && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{fieldErrors.schoolName}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nomor NPSN <span className="text-red-500">*</span></label>
                      <input type="text" className={`${premiumInput} ${fieldErrors.npsn ? 'border-red-500 bg-red-50/30' : ''}`} value={settings.npsn} onChange={e => { setSettings({...settings, npsn: e.target.value}); setFieldErrors({...fieldErrors, npsn: ''}); }} />
                      {fieldErrors.npsn && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{fieldErrors.npsn}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Status</label>
                      <input type="text" className={premiumInput} value={settings.statusSekolah} onChange={e => setSettings({...settings, statusSekolah: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Lokasi & Akreditasi</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Alamat Institusi <span className="text-red-500">*</span></label>
                    <textarea className={`${premiumInput} min-h-[80px] ${fieldErrors.alamatSekolah ? 'border-red-500 bg-red-50/30' : ''}`} value={settings.alamatSekolah} onChange={e => { setSettings({...settings, alamatSekolah: e.target.value}); setFieldErrors({...fieldErrors, alamatSekolah: ''}); }} />
                    {fieldErrors.alamatSekolah && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{fieldErrors.alamatSekolah}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nilai Akreditasi</label>
                      <input type="text" className={premiumInput} value={settings.akreditasi} onChange={e => setSettings({...settings, akreditasi: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tahun Terbit</label>
                      <input type="text" className={premiumInput} value={settings.tahunAkreditasi} onChange={e => setSettings({...settings, tahunAkreditasi: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 pt-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                    <FileText className="w-3 h-3 text-primary-500" /> Gambaran Umum Madrasah (Visi & Deskripsi)
                  </label>
                  <textarea 
                    className={`${premiumInput} min-h-[120px] text-sm leading-relaxed font-medium italic text-slate-600`} 
                    placeholder="Tuliskan deskripsi singkat atau gambaran umum madrasah di sini..."
                    value={settings.gambaranUmum} 
                    onChange={e => setSettings({...settings, gambaranUmum: e.target.value})} 
                  />
                  <p className="text-[9px] text-slate-400 font-medium pl-1 italic">*Teks ini akan muncul di halaman utama profil publik sekolah.</p>
                </div>
              </div>

              <div className="md:col-span-2 pt-10 border-t border-slate-50">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Statistik Profil Publik</h3>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Total Siswa</label>
                    <input type="number" className="w-full bg-transparent text-center text-3xl font-black text-slate-900 outline-none" value={settings.totalSiswa} onChange={e => setSettings({...settings, totalSiswa: parseInt(e.target.value)})} />
                  </div>
                  <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2 text-center">Laki-laki</label>
                    <input type="number" className="w-full bg-transparent text-center text-3xl font-black text-blue-600 outline-none" value={settings.siswaL} onChange={e => setSettings({...settings, siswaL: parseInt(e.target.value)})} />
                  </div>
                  <div className="p-6 bg-pink-50/50 rounded-3xl border border-pink-100">
                    <label className="text-[10px] font-black text-pink-400 uppercase tracking-widest block mb-2 text-center">Perempuan</label>
                    <input type="number" className="w-full bg-transparent text-center text-3xl font-black text-pink-600 outline-none" value={settings.siswaP} onChange={e => setSettings({...settings, siswaP: parseInt(e.target.value)})} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-10">
              <button type="submit" disabled={savingSettings} className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
                {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Update Profil Madrasah
              </button>
            </div>
          </form>
        )}

        {/* INFO PENDAFTARAN TAB */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveSettings} className="p-10 space-y-12">
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Persyaratan Pendaftaran</h3>
                </div>
                <button type="button" onClick={() => addItem('persyaratan')} className="flex items-center gap-2 px-5 py-3 bg-primary-50 text-primary-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-100 transition-all">
                  <Plus className="w-4 h-4" /> Tambah Berkas
                </button>
              </div>
              <div className="grid gap-4">
                {listPersyaratan.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-xs text-slate-400 group-hover:text-primary-600 transition-colors shadow-sm">{idx + 1}</div>
                    <input type="text" className={`${premiumInput} text-xs flex-1`} placeholder="Contoh: Ijazah / SKHU" value={item.title} onChange={e => updateItem('persyaratan', idx, 'title', e.target.value)} />
                    <input type="text" className={`${premiumInput} text-xs flex-[2] font-normal`} placeholder="Penjelasan berkas..." value={item.description} onChange={e => updateItem('persyaratan', idx, 'description', e.target.value)} />
                    <button type="button" onClick={() => removeItem('persyaratan', idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8 pt-10 border-t border-slate-50">
              <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight">Tahapan / Alur</h3>
                </div>
                <button type="button" onClick={() => addItem('alur')} className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all">
                  <Plus className="w-4 h-4" /> Tambah Alur
                </button>
              </div>
              <div className="grid gap-4">
                {listAlur.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-emerald-50/20 rounded-2xl border border-emerald-100 hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-xs text-emerald-300 group-hover:text-emerald-600 transition-colors shadow-sm">{idx + 1}</div>
                    <input type="text" className={`${premiumInput} text-xs flex-1`} placeholder="Nama Langkah" value={item.title} onChange={e => updateItem('alur', idx, 'title', e.target.value)} />
                    <input type="text" className={`${premiumInput} text-xs flex-[2] font-normal`} placeholder="Detail prosedur pendaftaran..." value={item.description} onChange={e => updateItem('alur', idx, 'description', e.target.value)} />
                    <button type="button" onClick={() => removeItem('alur', idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-10 border-t border-slate-50">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">WhatsApp Center Panitia</label>
                 <div className="relative w-64">
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input type="text" className={`${premiumInput} pl-10`} value={settings.whatsappNumber} onChange={e => setSettings({...settings, whatsappNumber: e.target.value})} />
                 </div>
               </div>
               <button type="submit" disabled={savingSettings} className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
                {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Simpan Konfigurasi Konten
              </button>
            </div>
          </form>
        )}

        {/* TIMELINE TAB (CHRONOLOGICAL REDESIGN) */}
        {activeTab === 'timeline' && (
          <form onSubmit={handleSaveSetup} className="p-10 space-y-10">
            <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
               <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                        <Calendar className="w-6 h-6 text-primary-600" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Pengaturan Jadwal PPDB</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tahun Ajaran Aktif: <span className="text-primary-600">{activeSetup?.tahun || '-'}</span></p>
                     </div>
                  </div>
                  <div className="w-full md:w-48 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center block">Ubah Tahun Ajaran <span className="text-red-500">*</span></label>
                    <input type="text" className={`${premiumInput} text-center text-lg font-black bg-white shadow-inner ${fieldErrors.tahun ? 'border-red-500' : ''}`} placeholder="2026" value={setupForm.tahun} onChange={e => { setSetupForm({...setupForm, tahun: e.target.value}); setFieldErrors({...fieldErrors, tahun: ''}); }} />
                    {fieldErrors.tahun && <p className="text-[10px] font-bold text-red-500 text-center animate-pulse">{fieldErrors.tahun}</p>}
                  </div>
               </div>

               <div className="space-y-10 relative">
                  {/* Vertical Line Connector */}
                  <div className="absolute left-6 top-10 bottom-10 w-1 bg-slate-200 rounded-full hidden md:block"></div>

                  {[
                    { title: 'Periode Pendaftaran', icon: Users, fields: ['tanggalPendaftaranMulai', 'tanggalPendaftaranSelesai'], color: 'bg-primary-500', current: activeSetup?.tanggalPendaftaran },
                    { title: 'Proses Seleksi', icon: ListChecks, fields: ['tanggalVerifikasiRaw', 'tanggalTestRaw'], color: 'bg-amber-500', labels: ['Verifikasi Berkas', 'Tes Seleksi Mandiri'] },
                    { title: 'Hasil & Penutup', icon: Award, fields: ['tanggalPengumumanRaw'], color: 'bg-emerald-500', labels: ['Pengumuman Kelulusan'] },
                    { title: 'Daftar Ulang', icon: CheckCircle2, fields: ['tanggalDaftarUlangMulai', 'tanggalDaftarUlangSelesai'], color: 'bg-blue-500' }
                  ].map((group, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                       <div className={`w-12 h-12 rounded-2xl ${group.color} text-white flex items-center justify-center shadow-lg shadow-current/20 shrink-0`}>
                          <group.icon className="w-6 h-6" />
                       </div>
                       
                       <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                             <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">{group.title}</h4>
                             {group.current && <span className="text-[10px] font-bold text-primary-500 italic">Aktif: {group.current}</span>}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {group.fields.map((field, fIdx) => (
                               <div key={field} className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                    {group.labels ? group.labels[fIdx] : (field.includes('Mulai') ? 'Tanggal Mulai' : 'Tanggal Berakhir')}
                                  </label>
                                  <input 
                                    type="date" 
                                    className={`${premiumInput} bg-slate-50/50`} 
                                    value={setupForm[field]} 
                                    onChange={e => setSetupForm({...setupForm, [field]: e.target.value})} 
                                  />
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex justify-end pt-6">
              <button type="submit" disabled={savingSettings} className="px-16 py-6 bg-emerald-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-3">
                {savingSettings ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                Update & Publikasi Jadwal
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ⚠️ SUMMARY ERROR MODAL */}
      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl border-t-8 border-red-500 overflow-hidden">
              <button onClick={() => setShowErrorModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><AlertCircle className="w-10 h-10" /></div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Terjadi Kesalahan</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{error}</p>
              </div>
              <button onClick={() => setShowErrorModal(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Tutup</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemSettings;
