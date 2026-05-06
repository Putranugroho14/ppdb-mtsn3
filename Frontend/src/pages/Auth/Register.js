import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, Calendar, MapPin, CreditCard, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { mapErrorMessage } from '../../utils/errorMapper';
import { X } from 'lucide-react';

const Register = () => {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [formData, setFormData] = useState({
    username: '', // NIK
    name: '',
    birthPlace: '',
    birthDate: '',
    gender: 'L', // Laki-laki default
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/public/settings');
        setSettings(res.data);
      } catch (err) {
        console.error('Error fetching settings', err);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.username || formData.username.length !== 16) {
      errors.username = 'NIK harus terdiri dari 16 digit angka.';
    }
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.name = 'Nama Lengkap minimal 3 karakter.';
    }
    if (!formData.birthPlace.trim()) {
      errors.birthPlace = 'Tempat lahir wajib diisi.';
    }
    if (!formData.birthDate) {
      errors.birthDate = 'Tanggal lahir wajib diisi.';
    }
    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Kata Sandi minimal harus 8 karakter.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    if (!validateForm()) {
      setError('Mohon lengkapi seluruh data pendaftaran dengan benar.');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        name: formData.name,
        birthPlace: formData.birthPlace,
        birthDate: formData.birthDate,
        gender: formData.gender,
        password: formData.password
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(mapErrorMessage(err));
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Handle closed registration
  if (settings && !settings.registrationOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-lg text-center"
        >
          <div className="w-24 h-24 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-200/50 rotate-3">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Pendaftaran Ditutup</h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">
            Mohon maaf, saat ini sistem pendaftaran PPDB MTsN 3 Sanggau sedang ditutup atau belum dibuka kembali. 
            Silakan pantau pengumuman resmi untuk informasi jadwal pendaftaran.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
          >
            Kembali ke Beranda
          </Link>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-md text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Registrasi Berhasil!</h2>
          <p className="text-slate-500 mt-3 font-medium">Akun Anda telah berhasil dibuat. Silakan login.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column: Image/Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-primary-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/FOTO 3.jpeg" 
            alt="School Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/80 to-transparent"></div>
        </div>
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white rounded-lg p-1">
                 <img src="/images/logo mts.jpg" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl tracking-wide uppercase">MTsN 3 SANGGAU</span>
            </Link>
          </div>
          <div className="max-w-md">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black text-white mb-6 leading-tight tracking-tight"
            >
              Mulai Pendaftaran <br/> PPDB Anda
            </motion.h1>
            <p className="text-primary-100 text-lg leading-relaxed font-medium">
              Buat akun baru untuk melengkapi formulir pendaftaran dan mengunggah berkas persyaratan secara digital.
            </p>
          </div>
          <div className="text-primary-300 text-sm font-bold uppercase tracking-widest">
            © 2026 PPDB Online MTsN 3 Sanggau.
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 lg:p-12 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md py-8"
        >
          <div className="text-center lg:text-left mb-10">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl p-1 shadow-xl border border-slate-100">
                <img src="/images/logo mts.jpg" alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Daftar Akun</h2>
            <p className="text-slate-500 font-medium text-lg">Lengkapi data diri calon pendaftar.</p>
          </div>

          {/* ERROR SUMMARY MODAL */}
          <AnimatePresence>
            {showErrorModal && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl border-t-8 border-red-500 overflow-hidden">
                  <button onClick={() => setShowErrorModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
                  <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><AlertCircle className="w-10 h-10" /></div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">Terjadi Kesalahan</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{error}</p>
                  </div>
                  <button onClick={() => setShowErrorModal(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all text-center">Tutup</button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">NIK Siswa <span className="text-red-500">*</span></label>
              <div className="relative group">
                <CreditCard className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.username ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                <input
                  type="text"
                  maxLength={16}
                  className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold transition-all outline-none ${fieldErrors.username ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:bg-white focus:border-primary-500'}`}
                  placeholder="16 Digit Nomor Induk Kependudukan"
                  value={formData.username}
                  onChange={(e) => { setFormData({...formData, username: e.target.value.replace(/[^0-9]/g, '')}); setFieldErrors({...fieldErrors, username: ''}); }}
                />
              </div>
              {fieldErrors.username && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{fieldErrors.username}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap <span className="text-red-500">*</span></label>
              <div className="relative group">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.name ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                <input
                  type="text"
                  className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold transition-all outline-none ${fieldErrors.name ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:bg-white focus:border-primary-500'}`}
                  placeholder="Nama Lengkap Sesuai Ijazah"
                  value={formData.name}
                  onChange={(e) => { setFormData({...formData, name: e.target.value}); setFieldErrors({...fieldErrors, name: ''}); }}
                />
              </div>
              {fieldErrors.name && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{fieldErrors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Tempat Lahir <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.birthPlace ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                  <input
                    type="text"
                    className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold transition-all outline-none ${fieldErrors.birthPlace ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:bg-white focus:border-primary-500'}`}
                    placeholder="Kota Lahir"
                    value={formData.birthPlace}
                    onChange={(e) => { setFormData({...formData, birthPlace: e.target.value}); setFieldErrors({...fieldErrors, birthPlace: ''}); }}
                  />
                </div>
                {fieldErrors.birthPlace && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{fieldErrors.birthPlace}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Tanggal Lahir <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.birthDate ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                  <input
                    type="date"
                    className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold transition-all outline-none ${fieldErrors.birthDate ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:bg-white focus:border-primary-500'}`}
                    value={formData.birthDate}
                    onChange={(e) => { setFormData({...formData, birthDate: e.target.value}); setFieldErrors({...fieldErrors, birthDate: ''}); }}
                  />
                </div>
                {fieldErrors.birthDate && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{fieldErrors.birthDate}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Jenis Kelamin</label>
              <div className="flex gap-4">
                {['L', 'P'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({...formData, gender: g})}
                    className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all ${
                      formData.gender === g 
                        ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-lg shadow-primary-500/10' 
                        : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {g === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Buat Kata Sandi <span className="text-red-500">*</span></label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                <input
                  type="password"
                  className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold transition-all outline-none ${fieldErrors.password ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:bg-white focus:border-primary-500'}`}
                  placeholder="Min. 8 Karakter"
                  value={formData.password}
                  onChange={(e) => { setFormData({...formData, password: e.target.value}); setFieldErrors({...fieldErrors, password: ''}); }}
                />
              </div>
              {fieldErrors.password && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl py-5 px-6 flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary-600/30 active:scale-[0.98] mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Daftar Sekarang <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-medium">
              Sudah memiliki akun?{' '}
              <Link to="/login" className="text-primary-600 font-bold hover:underline ml-1">
                Login Masuk
              </Link>
            </p>
          </div>
        </motion.div>
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
                <h3 className="text-2xl font-black text-slate-900">Registrasi Gagal</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{error}</p>
              </div>
              <button onClick={() => setShowErrorModal(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all text-center">Tutup</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
