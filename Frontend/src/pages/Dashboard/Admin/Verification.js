import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import { 
  FileText, Loader2, Check, X, RefreshCw, Search,
  Eye, ChevronLeft, ChevronRight, Download, Printer,
  ClipboardCheck, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ApplicantDetailModal from '../../../components/ApplicantDetailModal';
import { Filter, UserCircle } from 'lucide-react';

const Verification = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);
  
  // Rejection Modal State
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, name: '' });
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Detail Modal State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailApp, setDetailApp] = useState(null);

  // Filtering State
  const [filterJalur, setFilterJalur] = useState('all');
  const [filterGender, setFilterGender] = useState('all');

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/applicants');
      setApplicants(data);
    } catch (error) {
      console.error('Error', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, message = null) => {
    setProcessingId(id);
    try {
      await API.post('/admin/update-status', { 
        id, 
        registrationStatus: status,
        verificationMessage: message 
      });
      await fetchApplicants();
      setRejectModal({ open: false, id: null, name: '' });
      setRejectionReason('');
    } catch (error) {
      alert('Gagal update status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await API.get('/superadmin/export', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Data_Verifikasi_${new Date().getTime()}.xlsx`);
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
      alert('Gagal cetak massal');
    }
  };

  const handleViewDocument = (app, type) => {
    const berkas = app.Berkas?.find(b => b.type === type);
    if (berkas && berkas.filePath) {
      const fileName = berkas.filePath.split(/[\\/]/).pop();
      window.open(`http://localhost:5000/uploads/${fileName}`, '_blank');
    } else {
      alert(`Dokumen ${type.toUpperCase()} belum diunggah.`);
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = 
      app.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
      app.nisn?.toLowerCase().includes(search.toLowerCase());
    
    const matchesJalur = filterJalur === 'all' || app.jalurPendaftaran === filterJalur;
    const matchesGender = filterGender === 'all' || app.gender === filterGender;

    return matchesSearch && matchesJalur && matchesGender;
  });

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredApplicants.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredApplicants.length / rowsPerPage);

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
          <ClipboardCheck className="w-8 h-8 text-primary-600" />
          Verifikasi <span className="text-primary-600">Berkas</span>
        </h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Validasi dokumen persyaratan calon peserta didik secara teliti.</p>
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
        {/* Table Header Controls */}
        <div className="bg-[#007BFF] p-4 flex flex-col md:flex-row justify-between items-center text-white gap-4">
          <h2 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4" /> Data Verifikasi Berkas
          </h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari Nama, NISN, atau No Reg..." 
                className="w-full pl-10 pr-4 py-2 text-sm text-slate-900 rounded-lg bg-white border-none focus:ring-4 focus:ring-blue-300 transition-all"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button onClick={fetchApplicants} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all" title="Refresh">
              <RefreshCw className={`w-5 h-5 ${loading && !processingId ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
            <thead>
              <tr className="bg-[#5BC0DE] text-white">
                <th className="p-2 border border-slate-200 font-bold text-center w-8">NO</th>
                <th className="p-2 border border-slate-200 font-bold text-center">NO PENDAFTARAN</th>
                <th className="p-2 border border-slate-200 font-bold">NAMA LENGKAP</th>
                <th className="p-2 border border-slate-200 font-bold text-center">STATUS</th>
                <th className="p-2 border border-slate-200 font-bold text-center">LIHAT BERKAS</th>
                <th className="p-2 border border-slate-200 font-bold text-center">AKSI VERIFIKASI</th>
              </tr>
            </thead>
            <tbody>
              {loading && applicants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center border border-slate-200">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#007BFF]" />
                    <p className="mt-2 text-slate-400 font-medium">Memuat data verifikasi...</p>
                  </td>
                </tr>
              ) : currentRows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500 italic border border-slate-200">
                    Tidak ada data pendaftar untuk diverifikasi.
                  </td>
                </tr>
              ) : (
                currentRows.map((app, index) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-2 border border-slate-200 text-center text-slate-500">{indexOfFirstRow + index + 1}</td>
                    <td className="p-2 border border-slate-200 text-center font-bold text-slate-700">{app.registrationNumber}</td>
                    <td className="p-2 border border-slate-200 font-black text-slate-900 uppercase">
                      <button 
                        onClick={() => { setDetailApp(app); setIsDetailOpen(true); }}
                        className="hover:text-primary-600 transition-colors flex items-center gap-2 text-left"
                      >
                        <UserCircle className="w-3.5 h-3.5 text-slate-300" />
                        {app.name}
                      </button>
                    </td>
                    <td className="p-2 border border-slate-200 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                          app.registrationStatus === 'verified' ? 'bg-green-50 text-green-700 border-green-200' :
                          app.registrationStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {app.registrationStatus === 'pending' ? 'MENUNGGU' : 
                           app.registrationStatus === 'verified' ? 'TERVERIFIKASI' : 
                           app.registrationStatus === 'rejected' ? 'DITOLAK' : (app.registrationStatus || 'PENDING').toUpperCase()}
                        </span>
                        {app.registrationStatus === 'rejected' && app.verificationMessage && (
                          <span className="text-[8px] text-red-500 italic max-w-[120px] truncate" title={app.verificationMessage}>
                            {app.verificationMessage}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 border border-slate-200 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button 
                          onClick={() => handleViewDocument(app, 'kk')}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-bold"
                        >
                          <Eye className="w-3 h-3" /> KK
                        </button>
                        <button 
                          onClick={() => handleViewDocument(app, 'akta')}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-bold"
                        >
                          <Eye className="w-3 h-3" /> AKTA
                        </button>
                        <button 
                          onClick={() => handleViewDocument(app, 'ijazah')}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-bold"
                        >
                          <Eye className="w-3 h-3" /> IJAZAH
                        </button>
                      </div>
                    </td>
                    <td className="p-2 border border-slate-200 text-center">
                      <div className="flex justify-center gap-2">
                        {app.registrationStatus === 'verified' || app.registrationStatus === 'accepted' || app.registrationStatus === 'rejected' ? (
                           <div className="flex flex-col items-center gap-1">
                             <span className={`text-[10px] font-bold px-3 py-1 rounded-lg border ${
                               app.registrationStatus === 'accepted' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                               app.registrationStatus === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                               'bg-green-50 text-green-600 border-green-200'
                             }`}>
                               {app.registrationStatus === 'accepted' ? 'SUDAH LOLOS' : 
                                app.registrationStatus === 'rejected' ? 'DITOLAK' : 'TERVERIFIKASI'}
                             </span>
                             <button 
                               onClick={() => updateStatus(app.id, 'pending')}
                               className="text-[9px] text-slate-400 hover:text-red-500 transition-colors underline"
                             >
                               {app.registrationStatus === 'rejected' ? 'Batalkan Penolakan' : 'Batalkan Verifikasi'}
                             </button>
                           </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => updateStatus(app.id, 'verified')}
                              disabled={processingId === app.id}
                              className="flex items-center gap-1 px-3 py-1 bg-[#28A745] text-white rounded text-[10px] font-bold hover:bg-green-600 disabled:opacity-50 transition-colors"
                            >
                              {processingId === app.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3"/>}
                              VALIDASI
                            </button>
                            <button 
                              onClick={() => setRejectModal({ open: true, id: app.id, name: app.name })}
                              disabled={processingId === app.id}
                              className="flex items-center gap-1 px-3 py-1 bg-[#DC3545] text-white rounded text-[10px] font-bold hover:bg-red-600 disabled:opacity-50 transition-colors"
                            >
                              {processingId === app.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <X className="w-3 h-3"/>}
                              TOLAK
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="text-slate-900 font-bold">{indexOfFirstRow + 1}</span> sampai <span className="text-slate-900 font-bold">{Math.min(indexOfLastRow, filteredApplicants.length)}</span> dari <span className="text-slate-900 font-bold">{filteredApplicants.length}</span> pendaftar
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-black">
              {currentPage} / {totalPages || 1}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {rejectModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-red-600 p-4 text-white flex justify-between items-center">
                <h3 className="font-black uppercase tracking-tight flex items-center gap-2">
                  <X className="w-5 h-5" /> Alasan Penolakan
                </h3>
                <button onClick={() => setRejectModal({ open: false, id: null, name: '' })} className="hover:rotate-90 transition-transform">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                  <p className="text-[11px] text-red-800 font-medium">
                    Anda akan menolak berkas pendaftaran milik:
                  </p>
                  <p className="text-sm font-black text-red-900 uppercase">{rejectModal.name}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Pesan Kekurangan / Alasan:
                  </label>
                  <textarea 
                    className="w-full h-32 p-4 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-0 transition-all outline-none resize-none"
                    placeholder="Contoh: Foto Akta Kelahiran tidak terbaca, mohon unggah ulang yang lebih jelas."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setRejectModal({ open: false, id: null, name: '' })}
                    className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    BATAL
                  </button>
                  <button 
                    onClick={() => updateStatus(rejectModal.id, 'rejected', rejectionReason)}
                    disabled={!rejectionReason.trim() || processingId}
                    className="flex-2 px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
                  >
                    {processingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    KONFIRMASI TOLAK
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

export default Verification;
