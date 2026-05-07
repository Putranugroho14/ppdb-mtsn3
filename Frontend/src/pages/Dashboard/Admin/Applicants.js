import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import { mapErrorMessage } from '../../../utils/errorMapper';
import { AlertCircle } from 'lucide-react';
import { 
  Users, Loader2, RefreshCw, Search, 
  MoreVertical, FileText, Star, Heart, 
  Trash2, Edit, MessageCircle, Lock, 
  Printer, UserCircle, ChevronLeft, ChevronRight, X, CreditCard,
  Download, Clock, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import AddApplicantWizard from './AddApplicantWizard';
import ApplicantDetailModal from '../../../components/ApplicantDetailModal';
import { Filter, ChevronDown } from 'lucide-react';

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailApp, setDetailApp] = useState(null);
  
  // Filtering State
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterJalur, setFilterJalur] = useState('all');
  const [filterGender, setFilterGender] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, name: '' });

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/applicants');
      setApplicants(data);
    } catch (error) {
      console.error('Error fetching applicants', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, name) => {
    setDeleteConfig({ show: true, id, name });
  };

  const executeDelete = async () => {
    try {
      await API.delete(`/admin/applicant/${deleteConfig.id}`);
      fetchApplicants();
      setDeleteConfig({ show: false, id: null, name: '' });
    } catch (error) {
      setError(mapErrorMessage(error));
      setShowErrorModal(true);
    }
  };

  const handlePrint = async (id) => {
    try {
      const response = await API.get(`/admin/print-bukti-v3/${id}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(mapErrorMessage(err));
      setShowErrorModal(true);
    }
  };

  const handlePrintEMIS = async (id) => {
    try {
      const response = await API.get(`/admin/print-form-emis/${id}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(mapErrorMessage(err));
      setShowErrorModal(true);
    }
  };

  const handlePrintKartu = async (id) => {
    try {
      const response = await API.get(`/admin/print-kartu-peserta/${id}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(mapErrorMessage(err));
      setShowErrorModal(true);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await API.get('/superadmin/export', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Data_Pendaftar_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(mapErrorMessage(err));
      setShowErrorModal(true);
    }
  };

  const handlePrintMassal = async () => {
    try {
      const response = await API.get('/superadmin/export-pdf', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(mapErrorMessage(err));
      setShowErrorModal(true);
    }
  };

  const handleWhatsApp = (phone, name) => {
    if (!phone) {
      setError('Nomor HP tidak tersedia untuk pendaftar ini.');
      setShowErrorModal(true);
      return;
    }
    const formattedPhone = phone.startsWith('0') ? '62' + phone.substring(1) : phone;
    const message = `Halo Bapak/Ibu, kami dari Panitia PPDB MTs. Ingin menginformasikan mengenai pendaftaran atas nama ${name}...`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleToggleLock = async (id) => {
    try {
      await API.post('/admin/toggle-lock', { id });
      fetchApplicants();
    } catch (error) {
      setError(mapErrorMessage(error));
      setShowErrorModal(true);
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = 
      app.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
      app.nisn?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || app.registrationStatus === filterStatus;
    const matchesJalur = filterJalur === 'all' || app.jalurPendaftaran === filterJalur;
    const matchesGender = filterGender === 'all' || app.gender === filterGender;

    return matchesSearch && matchesStatus && matchesJalur && matchesGender;
  });

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredApplicants.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredApplicants.length / rowsPerPage);

  const stats = {
    reguler: applicants.filter(a => (a.jalurPendaftaran || '').toUpperCase() === 'REGULER').length,
    prestasi: applicants.filter(a => (a.jalurPendaftaran || '').toUpperCase() === 'PRESTASI').length,
    afirmasi: applicants.filter(a => (a.jalurPendaftaran || '').toUpperCase() === 'AFIRMASI').length,
    total: applicants.length
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 🚀 SUPER PREMIUM HERO HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-10 lg:p-12 border border-slate-700 shadow-2xl"
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 w-fit text-primary-400 text-xs font-bold uppercase tracking-widest mb-2 shadow-inner">
              Direktori Pendaftar
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
              Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">Peserta Didik</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-xl">
              Pusat pengelolaan seluruh calon peserta didik baru, manajemen berkas, hingga cetak laporan operasional.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
              onClick={handleExportExcel}
              className="px-8 py-5 rounded-[2rem] bg-white text-slate-800 border-2 border-slate-200 font-black text-sm flex items-center justify-center gap-3 transition-all hover:bg-slate-50 hover:border-slate-300 shadow-xl active:scale-95"
            >
              <Download className="w-5 h-5" /> Export Excel
            </button>
          </div>
        </div>
      </motion.div>

      <AddApplicantWizard 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSuccess={fetchApplicants}
      />

      <ApplicantDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        applicant={detailApp}
      />

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400 mr-2">
          <Filter className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Filter Data:</span>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <select 
            value={filterStatus} 
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 outline-none focus:border-primary-500 transition-all cursor-pointer"
          >
            <option value="all">SEMUA STATUS</option>
            <option value="pending">PENDING</option>
            <option value="verified">TERVERIFIKASI</option>
            <option value="accepted">LOLOS</option>
            <option value="rejected">DITOLAK</option>
          </select>

          <select 
            value={filterJalur} 
            onChange={(e) => { setFilterJalur(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 outline-none focus:border-primary-500 transition-all cursor-pointer"
          >
            <option value="all">SEMUA JALUR</option>
            <option value="Reguler">REGULER</option>
            <option value="Prestasi">PRESTASI</option>
            <option value="Afirmasi">AFIRMASI</option>
            <option value="Mutasi">MUTASI</option>
          </select>

          <select 
            value={filterGender} 
            onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 outline-none focus:border-primary-500 transition-all cursor-pointer"
          >
            <option value="all">SEMUA GENDER</option>
            <option value="L">LAKI-LAKI</option>
            <option value="P">PEREMPUAN</option>
          </select>

          {(filterStatus !== 'all' || filterJalur !== 'all' || filterGender !== 'all') && (
            <button 
              onClick={() => { setFilterStatus('all'); setFilterJalur('all'); setFilterGender('all'); }}
              className="px-3 py-1.5 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              RESET FILTER
            </button>
          )}
        </div>
      </div>

      {/* 🌟 STATISTIK JALUR (GLASSMORPHISM DARK) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Jalur Reguler', value: stats.reguler, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Jalur Prestasi', value: stats.prestasi, icon: Star, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'Jalur Afirmasi', value: stats.afirmasi, icon: Heart, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 + 0.2 }}
            whileHover={{ y: -5 }}
            className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 border border-slate-700 shadow-xl group cursor-default"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-500"></div>
            
            <div className="relative z-10 flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl ${stat.bg} border border-white/10 flex items-center justify-center shadow-inner backdrop-blur-md`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-4xl font-black text-white tracking-tighter">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Table Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white shadow-xl rounded-[2.5rem] border border-slate-100 overflow-hidden"
      >
        {/* Table Header Controls */}
        <div className="bg-slate-50 p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-100">
          <h2 className="font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" /> Daftar Calon Peserta Didik
          </h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari Nama, NISN, atau No Reg..." 
                className="w-full pl-12 pr-4 py-3 text-sm font-bold text-slate-700 rounded-2xl bg-white border border-slate-200 outline-none focus:border-primary-500 transition-all placeholder:font-medium placeholder:text-slate-400"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button onClick={fetchApplicants} className="p-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all shadow-sm" title="Refresh">
              <RefreshCw className={`w-5 h-5 text-primary-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-8">NO</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">JALUR</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">NOMOR</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">NISN</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">NAMA</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-8">L/P</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ASAL SEKOLAH</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">DOKUMEN</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">MENU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && applicants.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary-500" />
                    <p className="mt-2 text-slate-400 font-medium">Mengambil data pendaftar...</p>
                  </td>
                </tr>
              ) : currentRows.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-slate-500 italic">
                    Tidak ada pendaftar ditemukan.
                  </td>
                </tr>
              ) : (
                currentRows.map((app, index) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-center text-slate-500 font-bold">{indexOfFirstRow + index + 1}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-tight border ${
                        app.jalurPendaftaran === 'PRESTASI' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        app.jalurPendaftaran === 'AFIRMASI' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {app.jalurPendaftaran || 'REGULER'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">{app.registrationNumber}</td>
                    <td className="px-6 py-4 text-center text-slate-600 font-medium">{app.nisn || '-'}</td>
                    <td className="px-6 py-4 font-black text-slate-900 uppercase">{app.name}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-500">{app.gender || 'L'}</td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[150px] uppercase font-medium" title={app.schoolOrigin}>
                      {app.schoolOrigin || app.sekolahAsalLainnya || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase border ${
                        (app.Berkas?.length || 0) >= 4 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {(app.Berkas?.length || 0) >= 4 ? 'LENGKAP' : `${app.Berkas?.length || 0}/4 BERKAS`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      <button 
                        onClick={() => setOpenMenu(openMenu === app.id ? null : app.id)}
                        className="bg-[#007BFF] text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-blue-600 transition-colors flex items-center gap-1 mx-auto"
                      >
                        Menu
                      </button>

                      <AnimatePresence>
                        {openMenu === app.id && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setOpenMenu(null)}></div>
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-2xl border border-slate-200 z-30 overflow-hidden py-1 text-left"
                            >
                              <button 
                                onClick={() => {
                                  setDetailApp(app);
                                  setIsDetailOpen(true);
                                  setOpenMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                              >
                                <UserCircle className="w-3.5 h-3.5" /> Lihat Data
                              </button>
                              <button 
                                onClick={() => { 
                                  setSelectedApp(app);
                                  setIsAddOpen(true); 
                                  setOpenMenu(null);
                                }} 
                                className="w-full px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                              >
                                <Edit className="w-3.5 h-3.5 text-amber-500" /> Edit Data
                              </button>
                              <button onClick={() => handlePrint(app.id)} className="w-full px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                <Printer className="w-3.5 h-3.5 text-slate-500" /> Cetak Bukti
                               </button>
                              <button onClick={() => handlePrintKartu(app.id)} className="w-full px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> Cetak Kartu Peserta
                               </button>
                              {app.registrationStatus === 'accepted' && (
                                <button onClick={() => handlePrintEMIS(app.id)} className="w-full px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-bold">
                                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Cetak Formulir EMIS
                                </button>
                              )}
                              <button onClick={() => handleWhatsApp(app.parentPhone || app.phone, app.name)} className="w-full px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                <MessageCircle className="w-3.5 h-3.5 text-green-500" /> Kirim Pesan
                              </button>
                              <button onClick={() => handleToggleLock(app.id)} className="w-full px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 border-t border-slate-100">
                                <Lock className={`w-3.5 h-3.5 ${app.isLocked ? 'text-blue-500' : 'text-slate-400'}`} /> 
                                {app.isLocked ? 'Buka Kunci' : 'Kunci Data'}
                              </button>
                              <button onClick={() => handleDelete(app.id, app.name)} className="w-full px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 font-bold">
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Professional Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="text-slate-900 font-bold">{indexOfFirstRow + 1}</span> sampai <span className="text-slate-900 font-bold">{Math.min(indexOfLastRow, filteredApplicants.length)}</span> dari <span className="text-slate-900 font-bold">{filteredApplicants.length}</span> pendaftar
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              Baris per halaman:
              <select 
                value={rowsPerPage} 
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-black shadow-sm">
                {currentPage} / {totalPages || 1}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detail Modal Integration */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                    <UserCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">{selectedApp.name}</h3>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">{selectedApp.registrationNumber}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50">
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Identitas Dasar</h4>
                    <div className="space-y-4">
                      <DetailRow label="NIK" value={selectedApp.nik} />
                      <DetailRow label="NISN" value={selectedApp.nisn} />
                      <DetailRow label="Tempat, Tgl Lahir" value={`${selectedApp.birthPlace}, ${selectedApp.birthDate}`} />
                      <DetailRow label="Jenis Kelamin" value={selectedApp.gender === 'L' ? 'Laki-Laki' : 'Perempuan'} />
                      <DetailRow label="Agama" value={selectedApp.agama || 'Islam'} />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Kontak & Pendidikan</h4>
                    <div className="space-y-4">
                      <DetailRow label="Sekolah Asal" value={
                        selectedApp.schoolOrigin || selectedApp.sekolahAsalLainnya ||
                        (() => { try { return JSON.parse(selectedApp.details || '{}').schoolOrigin; } catch(e) { return null; } })() || '-'
                      } />
                      <DetailRow label="Tahun Lulus" value={selectedApp.graduationYear} />
                      <DetailRow label="No HP Orang Tua" value={selectedApp.parentPhone} />
                      <DetailRow label="Jalur Pendaftaran" value={selectedApp.jalurPendaftaran} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white border-t flex justify-end gap-3">
                <button onClick={() => setSelectedApp(null)} className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Tutup</button>
                <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
                  <Edit className="w-4 h-4" /> Edit Profil
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚠️ DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfig.show && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[3rem] p-10 text-center space-y-6 shadow-2xl overflow-hidden border-t-8 border-red-500">
              <button onClick={() => setDeleteConfig({ ...deleteConfig, show: false })} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><AlertCircle className="w-10 h-10" /></div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Hapus Data?</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Apakah Anda yakin ingin menghapus <b>{deleteConfig.name}</b>? Tindakan ini tidak dapat dibatalkan dan data akan hilang secara permanen.</p>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button onClick={executeDelete} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-200 active:scale-95 transition-all">Ya, Hapus</button>
                <button onClick={() => setDeleteConfig({ ...deleteConfig, show: false })} className="w-full py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Batal</button>
              </div>
            </motion.div>
          </div>
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

    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <span className="text-sm font-bold text-slate-800">{value || '-'}</span>
  </div>
);

export default Applicants;
