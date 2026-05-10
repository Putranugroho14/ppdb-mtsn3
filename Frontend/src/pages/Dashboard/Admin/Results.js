import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import {
  Users, Check, X, RefreshCw, Search,
  MoreVertical, FileText, Download, Printer,
  ClipboardCheck, User, Key, MapPin, Calendar, School,
  ArrowRight, Clock, Trophy, Edit3, Filter, UserCircle,
  ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ApplicantDetailModal from '../../../components/ApplicantDetailModal';
import AdminEmisModal from '../../../components/AdminEmisModal';

const Results = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [scoreModal, setScoreModal] = useState({ open: false, id: null, name: '', score: '' });
  const [savingScore, setSavingScore] = useState(false);
  const [notAcceptedModal, setNotAcceptedModal] = useState({ open: false, id: null, name: '', message: '' });
  const [savingNotAccepted, setSavingNotAccepted] = useState(false);

  // Detail Modal State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailApp, setDetailApp] = useState(null);
  // e-MIS Modal State
  const [isEmisOpen, setIsEmisOpen] = useState(false);
  const [emisApp, setEmisApp] = useState(null);

  // Filtering State
  const [filterJalur, setFilterJalur] = useState('all');
  const [filterGender, setFilterGender] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Tab State: 'accepted' or 'pending'
  const [activeTab, setActiveTab] = useState('accepted');

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/applicants?t=' + Date.now());
      setApplicants(data);
    } catch (error) {
      console.error('Error fetching applicants', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, message = null) => {
    try {
      await API.post('/admin/update-status', { 
        id, 
        registrationStatus: status,
        ...(message !== null && { verificationMessage: message })
      });
      fetchApplicants();
    } catch (error) {
      alert('Gagal update status');
    }
  };

  const handleConfirmNotAccepted = async () => {
    setSavingNotAccepted(true);
    try {
      await API.post('/admin/update-status', {
        id: notAcceptedModal.id,
        registrationStatus: 'not_accepted',
        verificationMessage: notAcceptedModal.message
      });
      setNotAcceptedModal({ open: false, id: null, name: '', message: '' });
      fetchApplicants();
    } catch (err) {
      alert('Gagal simpan keputusan');
    } finally {
      setSavingNotAccepted(false);
    }
  };

  const handleResetPassword = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin mereset password pendaftar ini ke default (Tgl Lahir DDMMYYYY)?')) {
      try {
        await API.post('/admin/reset-password-pendaftar', { id });
        alert('Password berhasil direset ke format Tgl Lahir (DDMMYYYY).');
      } catch (err) {
        alert('Gagal reset password');
      }
    }
  };

  const handleVerifyEmis = async (pendaftarId) => {
    try {
      await API.post('/admin/verify-emis', { pendaftarId });
      alert('Data e-MIS berhasil diverifikasi!');
      fetchApplicants();
    } catch (err) {
      alert('Gagal verifikasi e-MIS');
    }
  };

  const handlePrintIndividual = async (app) => {
    try {
      const response = await API.get(`/admin/print-bukti-v3/${app.id}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal mencetak bukti. Pastikan data sudah benar.');
    }
  };

  const handleSaveScore = async () => {
    setSavingScore(true);
    try {
      await API.post('/admin/input-score', {
        id: scoreModal.id,
        selectionScore: scoreModal.score
      });
      alert('Nilai berhasil disimpan!');
      setScoreModal({ open: false, id: null, name: '', score: '' });
      fetchApplicants();
    } catch (err) {
      alert('Gagal simpan nilai');
    } finally {
      setSavingScore(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await API.get('/superadmin/export', {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Data_Lolos_Seleksi_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal export excel');
    }
  };

  const handlePrintMassal = async () => {
    try {
      const response = await API.get('/superadmin/export-pdf', {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal cetak massal');
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch =
      app.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
      app.nisn?.toLowerCase().includes(search.toLowerCase());

    const matchesJalur = filterJalur === 'all' || app.jalurPendaftaran === filterJalur;
    const matchesGender = filterGender === 'all' || app.gender === filterGender;

    // Filter by the active tab status
    const targetStatus = activeTab === 'accepted' ? 'accepted' : 'verified';
    
    return matchesSearch && matchesJalur && matchesGender && app.registrationStatus === targetStatus;
  });

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredApplicants.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredApplicants.length / rowsPerPage);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section Clean */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            Lolos <span className="text-primary-600">Seleksi</span>
          </h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Kelola keputusan akhir dan data pendaftaran ulang siswa.</p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => { setActiveTab('accepted'); setCurrentPage(1); }}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'accepted' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
        >
          <CheckCircle2 className={`w-4 h-4 ${activeTab === 'accepted' ? 'text-blue-500' : 'text-slate-400'}`} />
          Sudah Lolos ({applicants.filter(a => a.registrationStatus === 'accepted').length})
        </button>
        <button
          onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
        >
          <Clock className={`w-4 h-4 ${activeTab === 'pending' ? 'text-amber-500' : 'text-slate-400'}`} />
          Menunggu Keputusan ({applicants.filter(a => a.registrationStatus === 'verified').length})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400 mr-2">
          <Filter className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Filter Data:</span>
        </div>

        <div className="flex gap-3 flex-wrap">
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

          {(filterJalur !== 'all' || filterGender !== 'all') && (
            <button
              onClick={() => { setFilterJalur('all'); setFilterGender('all'); }}
              className="px-3 py-1.5 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              RESET FILTER
            </button>
          )}
        </div>
      </div>

      <ApplicantDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        applicant={detailApp}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-xl border border-slate-200"
      >
        {/* Blue Header Section */}
        <div className={`p-4 flex flex-col sm:flex-row justify-between items-center text-white gap-3 transition-colors ${activeTab === 'accepted' ? 'bg-[#007BFF]' : 'bg-amber-500'}`}>
          <h2 className="font-black text-sm uppercase tracking-wider">
            {activeTab === 'accepted' ? 'PPDB Lolos Seleksi' : 'Pendaftar Menunggu Keputusan'}
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Nama, NISN, atau No Reg..."
                className="w-full pl-10 pr-4 py-2 text-sm text-slate-900 rounded-lg bg-white border-none focus:ring-4 focus:ring-blue-300 transition-all shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button onClick={fetchApplicants} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all active:scale-95" title="Refresh">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
            <thead>
              <tr className={`${activeTab === 'accepted' ? 'bg-[#5BC0DE]' : 'bg-amber-400'} text-white transition-colors`}>
                <th className="p-2 border border-slate-200 font-bold text-center w-8">NO</th>
                <th className="p-2 border border-slate-200 font-bold">NOMOR</th>
                <th className="p-2 border border-slate-200 font-bold">NISN</th>
                <th className="p-2 border border-slate-200 font-bold">NAMA LENGKAP</th>
                <th className="p-2 border border-slate-200 font-bold text-center w-8">L/P</th>
                <th className="p-2 border border-slate-200 font-bold">TEMPAT, TGL LAHIR</th>
                {activeTab === 'accepted' ? (
                  <>
                    <th className="p-2 border border-slate-200 font-bold">ASAL SEKOLAH</th>
                    <th className="p-2 border border-slate-200 font-bold text-center">E-MIS</th>
                    <th className="p-2 border border-slate-200 font-bold text-center">REGR.</th>
                  </>
                ) : (
                  <>
                    <th className="p-2 border border-slate-200 font-bold text-center">NILAI TES</th>
                    <th className="p-2 border border-slate-200 font-bold text-center">KEPUTUSAN AKHIR</th>
                  </>
                )}
                <th className="p-2 border border-slate-200 font-bold text-center">MENU</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="p-10 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary-600 mb-2" />
                    <p className="text-slate-400 font-medium">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-10 text-center text-slate-400 italic">
                    {activeTab === 'accepted' ? 'Tidak ada pendaftar yang lolos seleksi.' : 'Tidak ada pendaftar yang menunggu keputusan.'}
                  </td>
                </tr>
              ) : (
                currentRows.map((app, index) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-2 border border-slate-200 text-center text-slate-500 font-medium">{indexOfFirstRow + index + 1}</td>
                    <td className="p-2 border border-slate-200 font-bold text-slate-700">{app.registrationNumber}</td>
                    <td className="p-2 border border-slate-200 text-slate-600">{app.nisn || '-'}</td>
                    <td className="p-2 border border-slate-200 font-black text-slate-900 uppercase">{app.name}</td>
                    <td className="p-2 border border-slate-200 text-center font-bold">{app.gender || 'L'}</td>
                    <td className="p-2 border border-slate-200 text-slate-600 uppercase">
                      {app.birthPlace}, {app.birthDate}
                    </td>
                    
                    {activeTab === 'accepted' ? (
                      <>
                        <td className="p-2 border border-slate-200 text-slate-600 uppercase">
                          {app.schoolOrigin || app.sekolahAsalLainnya || '-'}
                        </td>
                        <td className="p-2 border border-slate-200 text-center">
                          {app.DaftarUlang?.id ? (
                            <span className="text-green-600 bg-green-100 p-1 rounded-full inline-block" title="Sudah isi e-MIS">
                              <Check className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="p-2 border border-slate-200 text-center">
                          {(app.DaftarUlang?.statusDaftarUlang === 'completed' || app.DaftarUlang?.statusDaftarUlang === 'verified') ? (
                            <span className="text-green-600 bg-green-100 p-1 rounded-full inline-block" title="Selesai Daftar Ulang">
                              <Check className="w-3 h-3" />
                            </span>
                          ) : app.DaftarUlang?.id ? (
                            <span className="text-amber-500 bg-amber-50 p-1 rounded-full inline-block" title="Sedang Mengisi (Pending)">
                              <Clock className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2 border border-slate-200 text-center">
                          <button
                            onClick={() => setScoreModal({ open: true, id: app.id, name: app.name, score: app.HasilSeleksi?.averageScore || '' })}
                            className="px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-200 font-bold hover:bg-amber-500 hover:text-white transition-all"
                          >
                            {app.HasilSeleksi?.averageScore || 'Input Nilai'}
                          </button>
                        </td>
                        <td className="p-2 border border-slate-200 text-center">
                          <div className="flex justify-center gap-1">
                             <button 
                                onClick={() => updateStatus(app.id, 'accepted')} 
                                className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 shadow-sm"
                                title="Loloskan"
                             >
                               <Check className="w-3.5 h-3.5" />
                             </button>
                             <button 
                                onClick={() => setNotAcceptedModal({ open: true, id: app.id, name: app.name, message: '' })} 
                                className="p-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 shadow-sm"
                                title="Tidak Lolos"
                             >
                               <X className="w-3.5 h-3.5" />
                             </button>
                          </div>
                        </td>
                      </>
                    )}
                    <td className="p-2 border border-slate-200 text-center relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === app.id ? null : app.id)}
                        className="bg-[#007BFF] text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-blue-600 transition-all flex items-center gap-1 mx-auto"
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
                                onClick={() => handlePrintIndividual(app)}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                              >
                                <Printer className="w-3.5 h-3.5" /> Cetak Bukti
                              </button>
                              <button
                                onClick={() => {
                                  setScoreModal({
                                    open: true,
                                    id: app.id,
                                    name: app.name,
                                    score: app.HasilSeleksi?.averageScore || ''
                                  });
                                  setOpenMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                              >
                                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Input Nilai
                              </button>
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
                                  setEmisApp(app);
                                  setIsEmisOpen(true);
                                  setOpenMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center gap-2 text-green-700 font-semibold"
                              >
                                <ClipboardCheck className="w-3.5 h-3.5 text-green-600" />
                                {app.DaftarUlang?.id ? 'Edit e-MIS' : 'Input e-MIS'}
                              </button>
                              <button
                                onClick={() => handleResetPassword(app.id)}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                              >
                                <Key className="w-3.5 h-3.5" /> Reset Pass
                              </button>
                              {app.DaftarUlang?.id && app.DaftarUlang?.statusDaftarUlang !== 'verified' && (
                                <button
                                  onClick={() => handleVerifyEmis(app.id)}
                                  className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center gap-2 text-green-700 font-bold"
                                >
                                  <Check className="w-3.5 h-3.5" /> Verif e-MIS
                                </button>
                              )}
                              <button
                                onClick={() => updateStatus(app.id, app.registrationStatus === 'accepted' ? 'verified' : 'accepted')}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-bold border-t border-slate-100"
                              >
                                <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
                                {app.registrationStatus === 'accepted' ? 'Batal Lolos' : 'Set Lolos'}
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

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 font-bold text-[10px]">
            MENAMPILKAN {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, filteredApplicants.length)} DARI {filteredApplicants.length} DATA
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-100 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg font-bold text-[10px] transition-all shadow-sm ${currentPage === i + 1
                    ? (activeTab === 'accepted' ? 'bg-[#007BFF] text-white shadow-blue-200' : 'bg-amber-500 text-white shadow-amber-200')
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-100 transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Decision Section Removed - Integrated into Tabs Above */}

      {/* Score Modal */}
      <AnimatePresence>
        {scoreModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-amber-500 p-4 text-white flex justify-between items-center">
                <h3 className="font-bold uppercase flex items-center gap-2 text-sm">
                  <Trophy className="w-5 h-5" /> Input Nilai Seleksi
                </h3>
                <button onClick={() => setScoreModal({ ...scoreModal, open: false })}><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Pendaftar:</p>
                  <p className="text-sm font-black text-slate-900">{scoreModal.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">NILAI TES / SELEKSI:</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-slate-100 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none transition-all font-black text-lg text-center"
                    placeholder="0.00"
                    value={scoreModal.score}
                    onChange={(e) => setScoreModal({ ...scoreModal, score: e.target.value })}
                  />
                </div>
                <button
                  onClick={handleSaveScore}
                  disabled={savingScore}
                  className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-200"
                >
                  {savingScore ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  SIMPAN NILAI
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Not Accepted Modal */}
      <AnimatePresence>
        {notAcceptedModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-orange-500 p-4 text-white flex justify-between items-center">
                <h3 className="font-bold uppercase flex items-center gap-2 text-sm">
                  <X className="w-5 h-5" /> Konfirmasi: Tidak Lolos Seleksi
                </h3>
                <button onClick={() => setNotAcceptedModal({ open: false, id: null, name: '', message: '' })}><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <p className="text-[10px] text-orange-600 font-bold uppercase">Menyatakan TIDAK LOLOS:</p>
                  <p className="text-sm font-black text-orange-900 uppercase">{notAcceptedModal.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Keterangan / Alasan (opsional):
                  </label>
                  <textarea
                    className="w-full h-28 p-4 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-0 transition-all outline-none resize-none"
                    placeholder="Contoh: Nilai seleksi tidak mencapai batas minimum yang ditetapkan."
                    value={notAcceptedModal.message}
                    onChange={(e) => setNotAcceptedModal({ ...notAcceptedModal, message: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setNotAcceptedModal({ open: false, id: null, name: '', message: '' })}
                    className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    BATAL
                  </button>
                  <button
                    onClick={handleConfirmNotAccepted}
                    disabled={savingNotAccepted}
                    className="flex-1 px-6 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-black hover:bg-orange-600 disabled:opacity-50 shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                  >
                    {savingNotAccepted ? <RefreshCw className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    KONFIRMASI TIDAK LOLOS
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AdminEmisModal
        isOpen={isEmisOpen}
        onClose={() => { setIsEmisOpen(false); setEmisApp(null); }}
        applicant={emisApp}
        onRefresh={fetchApplicants}
      />
    </div>
  );
};

export default Results;
