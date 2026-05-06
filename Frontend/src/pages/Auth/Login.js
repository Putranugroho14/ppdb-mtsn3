import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, School } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mapErrorMessage } from '../../utils/errorMapper';
import { X } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = {};
    if (!username) {
      errors.username = 'NIK wajib diisi.';
    } else if (username.length !== 16) {
      errors.username = 'NIK harus 16 digit.';
    }
    if (!password) {
      errors.password = 'Password wajib diisi.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Mohon lengkapi NIK dan Password dengan benar.');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username, password);
      
      // If admin tries to login here, we still let them in, but typically they use admin portal
      if (result.role !== 'user') {
        console.log('Non-student user logged in via student portal');
      }
      
      navigate(from, { replace: true });
    } catch (err) {
      setError(mapErrorMessage(err));
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column: Image/Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-primary-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/FOTO 1.jpeg" 
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
              <span className="font-bold text-xl tracking-wide">MTsN 3 SANGGAU</span>
            </Link>
          </div>
          <div className="max-w-md">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black text-white mb-6 leading-tight"
            >
              Portal Pendaftaran <br/> Peserta Didik Baru
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-primary-100 text-lg leading-relaxed"
            >
              Silakan masuk menggunakan akun yang telah terdaftar untuk melanjutkan proses pendaftaran dan memantau status seleksi Anda.
            </motion.p>
          </div>
          <div className="text-primary-300 text-sm">
            © 2026 PPDB Online MTsN 3 Sanggau.
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-4 sm:p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md py-6 sm:py-8"
        >
            <div className="text-center lg:text-left mb-8 lg:mb-10">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl p-1 shadow-lg border border-slate-100">
                <img src="/images/logo mts.jpg" alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Login Peserta</h2>
            <p className="text-slate-500">Silakan masuk ke akun pendaftaran Anda.</p>
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
                    <h3 className="text-2xl font-black text-slate-900">Login Gagal</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{error}</p>
                  </div>
                  <button onClick={() => setShowErrorModal(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all text-center">Tutup</button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">NIK {fieldErrors.username && <span className="text-red-500">*</span>}</label>
              <div className="relative group">
                <School className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.username ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                <input
                  type="text"
                  maxLength={16}
                  className={`w-full bg-slate-50 border-2 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 transition-all outline-none ${fieldErrors.username ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:bg-white focus:border-primary-500'}`}
                  placeholder="Masukkan 16 digit NIK"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value.replace(/[^0-9]/g, '')); setFieldErrors({...fieldErrors, username: ''}); }}
                />
              </div>
              {fieldErrors.username && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{fieldErrors.username}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Password {fieldErrors.password && <span className="text-red-500">*</span>}</label>
                <Link to="/forgot-password" className="text-sm text-primary-600 font-bold hover:text-primary-700 transition-colors">
                  Lupa Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                <input
                  type="password"
                  className={`w-full bg-slate-50 border-2 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 transition-all outline-none ${fieldErrors.password ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:bg-white focus:border-primary-500'}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors({...fieldErrors, password: ''}); }}
                />
              </div>
              {fieldErrors.password && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl py-4 px-6 flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/40 active:scale-[0.98] mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-sm">
              Belum mendaftar PPDB?{' '}
              <Link to="/register" className="text-primary-600 font-bold hover:underline">
                Buat Akun Baru
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
