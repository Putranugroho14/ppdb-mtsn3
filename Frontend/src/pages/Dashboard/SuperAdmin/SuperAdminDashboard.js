import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  UserX, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Download,
  AlertTriangle,
  Loader2,
  FileText,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Settings,
  ShieldCheck,
  Activity,
  X,
  CheckCircle2,
  Archive,
  Database,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [reseting, setReseting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const showNotify = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, settingsRes] = await Promise.all([
        API.get('/superadmin/statistics'),
        API.get('/superadmin/settings')
      ]);
      setStats(statsRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
      setError('Gagal memuat data. Pastikan server backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRegistration = async () => {
    if (!settings) return;
    setToggling(true);
    try {
      const updatedSettings = { ...settings, registrationOpen: !settings.registrationOpen };
      await API.post('/superadmin/settings', updatedSettings);
      setSettings(updatedSettings);
      showNotify('success', `Sistem Pendaftaran kini telah diatur menjadi ${updatedSettings.registrationOpen ? 'ONLINE' : 'OFFLINE'}.`);
    } catch (error) {
      showNotify('error', 'Gagal mengubah status pendaftaran. Coba lagi nanti.');
    } finally {
      setToggling(false);
    }
  };

  const handleExport = async () => {
    try {
      showNotify('success', 'Sedang menyiapkan data Excel. Mohon tunggu...');
      const response = await API.get('/superadmin/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data-pendaftar.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showNotify('error', 'Gagal mengekspor data Excel.');
    }
  };

  const handleExportPDF = async () => {
    try {
      showNotify('success', 'Sedang merender dokumen PDF. Mohon tunggu...');
      const response = await API.get('/superadmin/export-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'daftar-pendaftar.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showNotify('error', 'Gagal mengekspor data PDF.');
    }
  };

  const [backuper, setBackuper] = useState(false);

  const handleBackup = async () => {
    setBackuper(true);
    try {
      const response = await API.get('/superadmin/backup', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BACKUP_PPDB_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotify('success', 'Backup sistem berhasil diunduh! Simpan file ini di tempat yang aman.');
    } catch (error) {
      showNotify('error', 'Gagal melakukan backup sistem.');
    } finally {
      setBackuper(false);
    }
  };

  const handleResetSystem = async () => {
    setReseting(true);
    try {
      await API.post('/superadmin/reset');
      showNotify('success', 'Sistem berhasil direset ke pengaturan awal! Semua data pendaftar telah dihapus.');
      fetchData();
      setShowResetModal(false);
    } catch (error) {
      showNotify('error', 'Gagal melakukan reset sistem.');
    } finally {
      setReseting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
      <div className="relative">
        <Loader2 className="w-16 h-16 animate-spin text-primary-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-ping"></div>
        </div>
      </div>
      <p className="text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">Menghubungkan ke Server...</p>
    </div>
  );

  if (error || !stats) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-10 bg-red-50 rounded-[2.5rem] border-2 border-dashed border-red-100">
      <div className="p-5 bg-white text-red-500 rounded-3xl shadow-xl mb-6">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-2">Terjadi Kesalahan</h3>
      <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">{error || 'Data tidak tersedia saat ini'}</p>
      <button onClick={fetchData} className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all">
        Coba Hubungkan Kembali
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 relative">
      
      {/* 🔔 PREMIUM NOTIFICATION TOAST */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -50, scale: 0.9 }} 
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-4 border backdrop-blur-xl ${
              notification.type === 'error' 
                ? 'bg-red-900/90 border-red-500/50 text-white' 
                : 'bg-slate-900/90 border-emerald-500/50 text-white'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                notification.type === 'error' ? 'bg-red-500/20' : 'bg-emerald-500/20'
              }`}>
                {notification.type === 'error' 
                  ? <AlertTriangle className="w-6 h-6 text-red-400" /> 
                  : <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                }
              </div>
              <div className="flex-1">
                <p className="font-black text-xs uppercase tracking-tight">
                  {notification.type === 'error' ? 'Pusat Informasi' : 'Aksi Berhasil'}
                </p>
                <p className="text-[10px] opacity-80 font-medium leading-relaxed">{notification.text}</p>
              </div>
              <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏛️ MODERN MINIMALIST HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-primary-900 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-900/20">
               <ShieldCheck className="w-6 h-6 text-primary-400" />
             </div>
             <div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Super Admin <span className="text-primary-600">Portal</span></h1>
               <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Otoritas Penuh & Manajemen Sistem</p>
             </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-6 lg:pt-0">
          <button onClick={handleExport} className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
            <Download className="w-4 h-4 text-emerald-400" /> Excel
          </button>
          <button onClick={handleExportPDF} className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
            <FileText className="w-4 h-4 text-red-500" /> Cetak PDF
          </button>
        </div>
      </div>

      {/* 📊 GRID STATISTIK UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Pendaftar', value: stats.total, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50', sub: 'Keseluruhan Data' },
          { label: 'Menunggu Verifikasi', value: stats.pending, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Perlu Tindakan' },
          { label: 'Telah Diverifikasi', value: stats.verified, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Data Tervalidasi' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 group hover:border-primary-500/30 transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center border border-transparent group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
            <h4 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{item.value}</h4>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* 📑 SECTION LAPORAN & GENDER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
          <div className="flex items-center gap-3 mb-10 border-b border-slate-50 pb-6">
            <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Status Akhir Seleksi</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-3xl text-center hover:bg-emerald-50 transition-colors">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.accepted}</p>
              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mt-2">Diterima</p>
            </div>
            <div className="bg-red-50/50 border border-red-100 p-8 rounded-3xl text-center hover:bg-red-50 transition-colors">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.rejected}</p>
              <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mt-2">Ditolak</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
          <div className="flex items-center gap-3 mb-10 border-b border-slate-50 pb-6">
            <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Proporsi Gender</h3>
          </div>
          <div className="flex items-center justify-around gap-10">
            <div className="text-center group">
               <div className="relative w-32 h-32 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-50"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent group-hover:rotate-45 transition-transform duration-700"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 leading-none">{Math.round((stats.gender.male / (stats.total || 1)) * 100)}%</span>
                  </div>
               </div>
               <p className="font-black text-slate-800 uppercase tracking-widest text-xs">Laki-laki</p>
               <p className="text-[10px] font-bold text-slate-400 mt-1">{stats.gender.male} Siswa</p>
            </div>
            <div className="text-center group">
               <div className="relative w-32 h-32 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-50"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent group-hover:-rotate-45 transition-transform duration-700"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 leading-none">{Math.round((stats.gender.female / (stats.total || 1)) * 100)}%</span>
                  </div>
               </div>
               <p className="font-black text-slate-800 uppercase tracking-widest text-xs">Perempuan</p>
               <p className="text-[10px] font-bold text-slate-400 mt-1">{stats.gender.female} Siswa</p>
            </div>
          </div>
        </div>
      </div>

      {/* ⚙️ KENDALI OPERASIONAL */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Kendali Operasional</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-10 bg-primary-900 rounded-[3rem] border border-primary-800 shadow-xl shadow-primary-900/20 flex flex-col items-center justify-center text-center gap-6 group hover:scale-[1.02] transition-all">
             <div className="w-16 h-16 bg-primary-800 rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
               <Database className="w-8 h-8 text-primary-400" />
             </div>
             <div className="space-y-2">
               <h3 className="text-2xl font-black text-white tracking-tight">Full Backup</h3>
               <p className="text-primary-300/70 font-medium text-[10px] uppercase tracking-widest leading-relaxed">Arsipkan Seluruh Database & Berkas Upload</p>
             </div>
             <button onClick={handleBackup} disabled={backuper} className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-400 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-3">
                {backuper ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Archive className="w-4 h-4" /> Download ZIP</>}
             </button>
          </div>

          <div className={`p-10 rounded-[3rem] border transition-all duration-500 flex flex-col items-center justify-center text-center gap-6 ${settings?.registrationOpen ? 'bg-emerald-50 border-emerald-100 shadow-xl shadow-emerald-200/20' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg ${settings?.registrationOpen ? 'bg-white text-emerald-500' : 'bg-slate-200 text-slate-400'}`}>
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Pendaftaran</h3>
              <p className="text-slate-500 font-medium text-[10px] uppercase tracking-widest leading-relaxed">
                {settings?.registrationOpen ? 'Sistem Terbuka (Online)' : 'Sistem Terkunci (Offline)'}
              </p>
            </div>
            <button onClick={handleToggleRegistration} disabled={toggling} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${settings?.registrationOpen ? 'bg-white text-emerald-700 hover:bg-emerald-100 shadow-emerald-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
              {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : settings?.registrationOpen ? 'Tutup Pendaftaran' : 'Buka Pendaftaran'}
            </button>
          </div>

          <div className="p-10 bg-red-50 rounded-[3rem] border border-red-100 shadow-xl shadow-red-200/20 flex flex-col items-center justify-center text-center gap-6">
             <div className="w-16 h-16 bg-white text-red-500 rounded-3xl flex items-center justify-center shadow-lg">
               <Trash2 className="w-8 h-8" />
             </div>
             <div className="space-y-2">
               <h3 className="text-2xl font-black text-red-900">Reset Data</h3>
               <p className="text-red-700/70 font-medium text-[10px] uppercase tracking-widest leading-relaxed">Hapus Permanen Data & Berkas Fisik</p>
             </div>
             <button onClick={() => setShowResetModal(true)} className="w-full py-4 bg-white border-2 border-red-500 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 shadow-lg shadow-red-200">
                Reset Sistem
              </button>
          </div>
        </div>
      </div>

      {/* ⚠️ CUSTOM RESET CONFIRMATION MODAL */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowResetModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
               <div className="p-10 text-center space-y-6">
                  <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto animate-bounce">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Konfirmasi Reset</h3>
                    <p className="text-slate-500 font-medium">Seluruh data pendaftar dan berkas unggahan akan <b>dihapus permanen</b> dari server. Aksi ini tidak dapat dibatalkan.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button onClick={handleResetSystem} disabled={reseting} className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-3">
                      {reseting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ya, Hapus Permanen'}
                    </button>
                    <button onClick={() => setShowResetModal(false)} className="w-full py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all">
                      Batalkan
                    </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SuperAdminDashboard;
