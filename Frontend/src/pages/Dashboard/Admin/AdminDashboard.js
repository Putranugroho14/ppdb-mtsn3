import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import { 
  Users, 
  ClipboardCheck, 
  FileSearch, 
  Award,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/superadmin/statistics'); // Reusing stats for now
      setStats(data);
    } catch (err) {
      setError('Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <p className="text-slate-600 font-medium">{error}</p>
      <button onClick={fetchStats} className="btn btn-primary">Coba Lagi</button>
    </div>
  );

  const adminStats = [
    { label: 'Total Pendaftar', value: stats?.total || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/dashboard/applicants' },
    { label: 'Menunggu Verifikasi', value: stats?.pending || 0, icon: FileSearch, color: 'text-amber-600', bg: 'bg-amber-50', link: '/dashboard/verification' },
    { label: 'Terverifikasi', value: stats?.verified || 0, icon: ClipboardCheck, color: 'text-green-600', bg: 'bg-green-50', link: '/dashboard/verification' },
    { label: 'Hasil Seleksi', value: (stats?.accepted || 0) + (stats?.rejected || 0), icon: Award, color: 'text-purple-600', bg: 'bg-purple-50', link: '/dashboard/results' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Panitia PPDB</h1>
        <p className="text-slate-500">Kelola dan verifikasi data calon pendaftar di sini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <Link to={stat.link} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary-600" />
            Tugas Verifikasi Anda
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Cek Berkas Pendaftar</p>
                <p className="text-xs text-slate-500">Ada {stats?.pending || 0} pendaftar yang belum diperiksa berkasnya.</p>
              </div>
              <Link to="/dashboard/verification" className="btn btn-primary px-4 py-2 text-xs">
                Mulai Verifikasi
              </Link>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Input Nilai Seleksi</p>
                <p className="text-xs text-slate-500">Update nilai tes atau raport untuk penentuan kelulusan.</p>
              </div>
              <Link to="/dashboard/results" className="btn btn-secondary px-4 py-2 text-xs">
                Input Nilai
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-primary-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-primary-600/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Butuh Panduan?</h3>
              <p className="text-primary-100 text-sm leading-relaxed mb-6">
                Pelajari cara verifikasi berkas dan penentuan kelulusan melalui buku panduan panitia.
              </p>
            </div>
            <button className="w-full py-3 bg-white text-primary-600 rounded-xl font-bold text-sm hover:bg-primary-50 transition-colors shadow-lg">
              Download Panduan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
