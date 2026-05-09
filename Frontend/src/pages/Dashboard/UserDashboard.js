import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  FileText, Upload, CheckCircle, Clock, Printer, LayoutDashboard, 
  UserCircle, CheckCircle2, AlertCircle, Loader2, ClipboardCheck, 
  ChevronLeft, ChevronRight, X, AlertTriangle, Trophy, ShieldCheck, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mapErrorMessage } from '../../utils/errorMapper';
import PrintProof from '../../components/PrintProof';
import RegistrationWizard from '../../components/RegistrationWizard';
import DaftarUlangWizard from '../../components/DaftarUlangWizard';
import { Link } from 'react-router-dom';

const UserDashboard = ({ tab }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDaftarUlang, setShowDaftarUlang] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/user/profile');
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Maksimal 2MB.');
      setShowErrorModal(true);
      e.target.value = '';
      return;
    }

    setConfirmAction({
      title: 'Unggah Berkas',
      message: `Apakah Anda yakin ingin mengunggah berkas ${type.toUpperCase()}? Pastikan dokumen sudah benar dan jelas.`,
      onConfirm: () => proceedUpload(file, type)
    });
    setShowConfirmModal(true);
    e.target.value = '';
  };

  const proceedUpload = async (file, type) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);

    setUploadingDoc(type);
    try {
      await API.post('/user/upload', formData);
      await fetchProfile();
      setSuccessMessage('Berkas Anda telah berhasil diunggah dan disimpan!');
      setShowSuccessModal(true);
    } catch (err) {
      setError(mapErrorMessage(err));
      setShowErrorModal(true);
    } finally {
      setUploadingDoc('');
      setShowConfirmModal(false);
    }
  };

  const handlePrintKartu = async () => {
    if (!profile?.id) return;
    try {
      const response = await API.get(`/user/print-kartu-peserta/${profile.id}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      setError('Gagal membuka Kartu Peserta. Silakan coba beberapa saat lagi.');
      setShowErrorModal(true);
    }
  };

  const handlePrintEMIS = async () => {
    if (!profile?.id) return;
    try {
      const response = await API.get(`/user/print-form-emis/${profile.id}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      setError('Gagal membuka form e-MIS. Silakan coba beberapa saat lagi.');
      setShowErrorModal(true);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const renderDashboard = () => (
    <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <LayoutDashboard className="w-7 h-7 text-primary-600" />
          Selamat Datang, {user.name}!
        </h2>
        <p className="text-slate-600 mb-8 text-base">Ikuti petunjuk pendaftaran di bawah ini untuk menyelesaikan proses pendaftaran PPDB Anda.</p>

        <div className="space-y-4">
          {[
            { title: '1. Lengkapi Biodata Diri', desc: 'Isi form pendaftaran yang berisi data diri, orang tua, dan sekolah asal secara lengkap.', done: !!profile?.address, link: '/dashboard/profile' },
            { title: '2. Upload Berkas Persyaratan', desc: 'Unggah dokumen wajib seperti KK, Akta Kelahiran, Pas Foto, dan Ijazah/SKL.', done: profile?.Berkas?.length >= 4, link: '/dashboard/profile' },
            { title: '3. Menunggu Verifikasi Panitia', desc: 'Admin akan memeriksa kelengkapan data dan dokumen Anda.', done: profile?.registrationStatus === 'verified' || profile?.registrationStatus === 'accepted', link: '/dashboard/status' },
            { title: '4. Cek Pengumuman Hasil Seleksi', desc: 'Pantau status kelulusan Anda di halaman status pendaftaran.', done: profile?.registrationStatus === 'accepted' || profile?.registrationStatus === 'rejected', link: '/dashboard/status' },
          ].map((step, i) => (
            <Link to={step.link} key={step.title} className={`block p-5 rounded-2xl border transition-all duration-300 ${step.done ? 'bg-green-50/50 border-green-200 hover:bg-green-100' : 'bg-white border-slate-200 hover:border-primary-300 hover:shadow-md'}`}>
              <div className="flex gap-5 items-center">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${step.done ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {step.done ? <CheckCircle className="w-7 h-7" /> : i + 1}
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${step.done ? 'text-green-800' : 'text-slate-900'}`}>{step.title}</h3>
                  <p className={`text-sm mt-1 ${step.done ? 'text-green-700' : 'text-slate-500'}`}>{step.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderProfile = () => {
    const isComplete = !!profile?.address;

    if (!isComplete || isEditing) {
      return <RegistrationWizard initialData={profile} onComplete={() => { setIsEditing(false); fetchProfile(); }} />;
    }

    let details = {};
    try { if (profile.details) details = JSON.parse(profile.details); } catch (e) {}

    return (
      <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* HEADER PROFILE PREMIUM */}
        <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-white/10 overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-primary-500/20"></div>
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-inner">
                  <UserCircle className="w-12 h-12 text-white" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-tight">{profile.name}</h3>
                   <div className="flex items-center gap-3 mt-2">
                      <span className="px-4 py-1.5 bg-primary-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-primary-500/30">Pendaftar</span>
                      <span className="text-slate-400 text-xs font-bold font-mono tracking-tighter">{profile.registrationNumber}</span>
                   </div>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                 <button onClick={() => setShowDetailModal(true)} className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 backdrop-blur-md flex items-center gap-2 group">
                    <FileText className="w-4 h-4 text-primary-400 group-hover:scale-110 transition-transform" />
                    Lihat Detail
                 </button>
                 {!['verified', 'accepted'].includes(profile.registrationStatus) && (
                   <button onClick={() => setIsEditing(true)} className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Edit Data
                   </button>
                 )}
              </div>
           </div>
        </div>

        {/* QUICK INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* RINGKASAN VERIFIKASI */}
           <div className={`p-6 rounded-[32px] border flex items-center gap-5 shadow-sm ${
             profile.registrationStatus === 'rejected' ? 'bg-red-50 border-red-100' :
             ['verified', 'accepted'].includes(profile.registrationStatus) ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
           }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                profile.registrationStatus === 'rejected' ? 'bg-red-500 text-white' :
                ['verified', 'accepted'].includes(profile.registrationStatus) ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                 {profile.registrationStatus === 'rejected' ? <AlertCircle className="w-6 h-6" /> :
                  ['verified', 'accepted'].includes(profile.registrationStatus) ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Data</p>
                 <p className={`font-black text-xs uppercase mt-1 ${
                   profile.registrationStatus === 'rejected' ? 'text-red-700' :
                   ['verified', 'accepted'].includes(profile.registrationStatus) ? 'text-emerald-700' : 'text-amber-700'
                 }`}>
                    {profile.registrationStatus === 'accepted' ? 'Diterima' :
                     profile.registrationStatus === 'verified' ? 'Sudah Diverifikasi' :
                     profile.registrationStatus === 'rejected' ? 'Ditolak / Perbaikan' : 'Menunggu Antrian'}
                 </p>
              </div>
           </div>

           {/* RINGKASAN BERKAS */}
           <div className="p-6 rounded-[32px] border border-slate-100 bg-white flex items-center gap-5 shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                 <Upload className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Berkas Wajib</p>
                 <p className="font-black text-xs text-indigo-900 uppercase mt-1">
                    {profile.Berkas?.length || 0} / 4 Terunggah
                 </p>
              </div>
           </div>

           {/* CETAK BUKTI PEMBAYARAN / PENDAFTARAN */}
           <div className="flex flex-col gap-3">
              <PrintProof data={profile} />
              <button onClick={handlePrintKartu} className="w-full p-4 rounded-[28px] bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-4 shadow-xl transition-all hover:-translate-y-1 active:scale-95 group">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Printer className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <p className="text-[8px] font-black text-white/50 uppercase tracking-widest leading-none">Aksi Cepat</p>
                    <p className="font-black text-[10px] uppercase mt-1 leading-none">Cetak Kartu Ujian</p>
                </div>
              </button>
           </div>
        </div>

        {/* MODAL DETAIL LENGKAP PREMIUM */}
        <AnimatePresence>
            {showDetailModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetailModal(false)} className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" />
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
                        {/* HEADER MODAL */}
                        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                 <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                 <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Detail Lengkap Biodata</h2>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi Pendaftaran PPDB MTSN 3 Sanggau</p>
                              </div>
                           </div>
                           <button onClick={() => setShowDetailModal(false)} className="w-12 h-12 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-slate-100 flex items-center justify-center shadow-sm">
                              <X className="w-6 h-6" />
                           </button>
                        </div>

                        {/* CONTENT MODAL */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
                              {/* SEKSI 1: DATA IDENTITAS */}
                              <div className="space-y-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center"><UserCircle className="w-5 h-5" /></div>
                                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Data Identitas</h4>
                                 </div>
                                 <div className="grid grid-cols-1 gap-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                    {[
                                      { label: 'Nama Lengkap', value: profile.name },
                                      { label: 'NIK / NISN', value: `${profile.nik} / ${profile.nisn}` },
                                      { label: 'Tempat, Tgl Lahir', value: `${profile.birthPlace}, ${profile.birthDate}` },
                                      { label: 'Agama', value: profile.agama?.replace(/^\d+\s*-\s*/, '') },
                                    ].map(item => (
                                      <div key={item.label} className="flex flex-col">
                                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                         <span className="font-bold text-slate-800 text-xs mt-0.5">{item.value || '-'}</span>
                                      </div>
                                    ))}
                                 </div>
                              </div>

                              {/* SEKSI 2: KELUARGA & ALAMAT */}
                              <div className="space-y-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Users className="w-5 h-5" /></div>
                                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Keluarga & Alamat</h4>
                                 </div>
                                 <div className="grid grid-cols-1 gap-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                    {[
                                      { label: 'No. Kartu Keluarga', value: profile.noKK },
                                      { label: 'Data Ayah (Nama / NIK / No. HP)', value: `${profile.parentName || '-'} / ${profile.ayahNik || '-'} / ${profile.parentPhone || '-'}` },
                                      { label: 'Data Ibu (Nama / NIK / No. HP)', value: `${profile.ibuNama || '-'} / ${profile.ibuNik || '-'} / ${profile.parentPhone || '-'}` },
                                      { label: 'Alamat Lengkap', value: profile.address },
                                      { label: 'RT / RW / Kode Pos', value: `${profile.rt} / ${profile.rw} / ${profile.kodePos}` },
                                      { label: 'Desa / Kec / Kab', value: `${profile.kelurahanDesa}, ${profile.kecamatan}, ${profile.kabupatenKota}` },
                                    ].map(item => (
                                      <div key={item.label} className="flex flex-col">
                                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                         <span className="font-bold text-slate-800 text-xs mt-0.5">{item.value || '-'}</span>
                                      </div>
                                    ))}
                                 </div>
                              </div>

                              {/* SEKSI 3: AKADEMIK & NILAI */}
                              <div className="space-y-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><ClipboardCheck className="w-5 h-5" /></div>
                                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Akademik & Nilai</h4>
                                 </div>
                                 <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                       {[
                                         { label: 'Kelas 4 Ganjil', val: profile.nilaiRaportIVGanjil },
                                         { label: 'Kelas 4 Genap', val: profile.nilaiRaportIVGenap },
                                         { label: 'Kelas 5 Ganjil', val: profile.nilaiRaportVGanjil },
                                         { label: 'Kelas 5 Genap', val: profile.nilaiRaportVGenap },
                                         { label: 'Kelas 6 Ganjil', val: profile.nilaiRaportVIGanjil },
                                       ].map(g => (
                                          <div key={g.label} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                                             <span className="text-[9px] font-bold text-slate-500 uppercase">{g.label}</span>
                                             <span className="font-black text-indigo-600">{parseFloat(g.val || 0).toFixed(1)}</span>
                                          </div>
                                       ))}
                                    </div>
                                    <div className="space-y-4">
                                       {[
                                         { label: 'Asal Sekolah / NPSN', value: `${profile.schoolOrigin} / ${profile.npsn || '-'}` },
                                         { label: 'Tahun Lulus', value: profile.graduationYear },
                                         { label: 'Jalur Pendaftaran', value: profile.jalurPendaftaran },
                                       ].map(item => (
                                          <div key={item.label} className="flex flex-col">
                                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                             <span className="font-bold text-slate-800 text-xs mt-0.5">{item.value || '-'}</span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>

                              {/* SEKSI 4: PRESTASI */}
                              <div className="space-y-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Trophy className="w-5 h-5" /></div>
                                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Prestasi</h4>
                                 </div>
                                 <div className="bg-amber-50/20 p-6 rounded-3xl border border-amber-100 min-h-[200px]">
                                    {details.prestasiList && details.prestasiList.length > 0 ? (
                                       <div className="space-y-3">
                                          {details.prestasiList.map((p, pIdx) => (
                                             <div key={pIdx} className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-4">
                                                <div className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center font-black text-xs">{pIdx + 1}</div>
                                                <div>
                                                   <p className="text-xs font-black text-slate-900">{p.lomba}</p>
                                                   <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">{p.tingkat} - {p.prestasi}</p>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    ) : (
                                       <div className="flex flex-col items-center justify-center h-48 text-slate-300">
                                          <Trophy className="w-12 h-12 mb-2 opacity-20" />
                                          <p className="text-[10px] font-black uppercase tracking-widest">Belum ada prestasi</p>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* MODAL FOOTER */}
                        <div className="p-8 bg-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
                           <div className="text-center md:text-left">
                              <h4 className="text-white font-black text-sm uppercase tracking-tight">Informasi Dokumen</h4>
                              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Cetak bukti untuk keperluan verifikasi berkas fisik dari halaman utama profil</p>
                           </div>
                           <div className="flex gap-3">
                              <button onClick={() => setShowDetailModal(false)} className="px-6 py-3.5 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10">Tutup Detail</button>
                           </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* STATUS BAR (Linear View) */}
        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
           <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                 <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary-500 rounded-full"></div> Informasi Pribadi
                 </h4>
                 <div className="space-y-3">
                    {[
                      { label: 'NIK / Nama', v: `${profile.nik} / ${profile.name}` },
                      { label: 'NISN', v: profile.nisn },
                      { label: 'Sekolah Asal', v: profile.schoolOrigin },
                    ].map(item => (
                       <div key={item.label}>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{item.label}</p>
                          <p className="font-bold text-slate-800 text-xs truncate">{item.v}</p>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="space-y-4">
                 <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-4 bg-amber-500 rounded-full"></div> Data Keluarga
                 </h4>
                 <div className="space-y-3">
                    {[
                      { label: 'Nama Orang Tua', v: `${profile.parentName} & ${profile.ibuNama}` },
                      { label: 'No. WhatsApp', v: profile.parentPhone },
                      { label: 'Alamat', v: profile.address },
                    ].map(item => (
                       <div key={item.label}>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{item.label}</p>
                          <p className="font-bold text-slate-800 text-xs truncate">{item.v}</p>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
                 <div className={`w-12 h-12 mb-4 rounded-2xl flex items-center justify-center shadow-lg ${['verified', 'accepted'].includes(profile.registrationStatus) ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {['verified', 'accepted'].includes(profile.registrationStatus) ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                 </div>
                 <h5 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Status Verifikasi</h5>
                 <p className="font-bold text-slate-500 text-[9px] mt-1 uppercase italic">
                    {profile.registrationStatus === 'accepted' ? 'Diterima' : profile.registrationStatus === 'verified' ? 'Sudah Diverifikasi Panitia' : 'Sedang Diproses Oleh Panitia'}
                 </p>
              </div>
           </div>
        </div>
      </motion.div>
    );
  };

  const renderDocuments = () => {
    const isLockedByStatus = profile.isLocked || profile.registrationStatus === 'verified' || profile.registrationStatus === 'accepted';
    
    return (
      <motion.div key="documents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
             <div>
               <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-4">
                 <Upload className="w-8 h-8 text-primary-600" />
                 Upload Dokumen Wajib
               </h2>
               <p className="text-slate-500 text-base">Pastikan file terlihat jelas dan berformat JPG, PNG, atau PDF (Maks. 2MB).</p>
             </div>
             <div className="px-5 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                <div className="text-left">
                   <p className="text-[10px] font-black text-indigo-900 uppercase">Sistem Keamanan</p>
                   <p className="text-[9px] font-bold text-indigo-600 uppercase">Dokumen yang sudah diverifikasi akan terkunci otomatis.</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: 'kk', label: 'Kartu Keluarga' },
              { id: 'akta', label: 'Akta Kelahiran' },
              { id: 'foto', label: 'Pas Foto 3x4' },
              { id: 'ijazah', label: 'Ijazah / SKL' }
            ].map((doc) => {
              const uploaded = profile?.Berkas?.find(b => b.type === doc.id);
              const isActuallyLocked = isLockedByStatus || (uploaded && profile.registrationStatus !== 'rejected');

              return (
                <div key={doc.id} className="relative group">
                   <div className={`p-8 rounded-[32px] border-2 transition-all duration-300 flex flex-col items-center text-center ${uploaded ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-slate-100 hover:border-primary-200 hover:shadow-xl'}`}>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${uploaded ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {uploaded ? <CheckCircle className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                      </div>
                      <h3 className="font-black text-slate-900 mb-2 text-sm uppercase tracking-tight">{doc.label}</h3>
                      <div className="mb-8">
                         {uploaded ? (
                           <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">Berhasil Terunggah</span>
                         ) : (
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Belum Ada File</span>
                         )}
                      </div>

                      <div className="w-full">
                        <input type="file" id={`up-${doc.id}`} className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => !isActuallyLocked && handleFileUpload(e, doc.id)} disabled={isActuallyLocked} />
                        <label htmlFor={`up-${doc.id}`} className={`block w-full py-3.5 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            isActuallyLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                            uploadingDoc === doc.id ? 'bg-slate-200 text-slate-500 animate-pulse' : 'bg-slate-900 text-white hover:bg-primary-600 cursor-pointer shadow-lg active:scale-95'
                          }`}>
                          {isActuallyLocked ? 'Berkas Terkunci' : uploadingDoc === doc.id ? 'Loading...' : 'Pilih Berkas'}
                        </label>
                      </div>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderStatus = () => (
    <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner"><Clock className="w-8 h-8" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verifikasi Berkas</p>
            <p className="text-sm font-black text-slate-900 uppercase mt-1">
              {profile?.registrationStatus === 'pending' ? 'Menunggu' : 'Telah Diperiksa'}
            </p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner"><Upload className="w-8 h-8" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kelengkapan</p>
            <p className="text-sm font-black text-slate-900 uppercase mt-1">{profile?.Berkas?.length || 0} dari 4 Berkas</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-6">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner ${profile?.registrationStatus === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
             <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hasil Seleksi</p>
            <p className={`text-sm font-black mt-1 uppercase ${profile?.registrationStatus === 'accepted' ? 'text-emerald-600' : 'text-slate-900'}`}>
              {profile?.registrationStatus === 'accepted' ? 'DITERIMA' : 'Belum Diumumkan'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[50px] shadow-sm border border-slate-100 text-center relative overflow-hidden">
        {profile?.registrationStatus === 'accepted' ? (
          profile?.DaftarUlang?.statusDaftarUlang === 'completed' ? (
            <div className="max-w-md mx-auto">
               <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-blue-50">
                 <CheckCircle className="w-12 h-12" />
               </div>
               <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Daftar Ulang Selesai!</h2>
               <p className="text-slate-500 mb-8 leading-relaxed font-bold">Terima kasih telah melengkapi formulir e-MIS. Silakan cetak bukti daftar ulang Anda atau perbarui data jika ada yang kurang.</p>
               <div className="flex flex-col gap-3">
                 <button onClick={handlePrintEMIS} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-3">
                   <ClipboardCheck className="w-6 h-6" /> Cetak Bukti Daftar Ulang
                 </button>
                 <button onClick={() => setShowDaftarUlang(true)} className="w-full py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95">
                   Perbarui Data e-MIS
                 </button>
               </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
               <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-emerald-50">
                 <CheckCircle className="w-12 h-12" />
               </div>
               <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Selamat, Anda Diterima!</h2>
               <p className="text-slate-500 mb-10 leading-relaxed font-bold">Silakan lakukan proses daftar ulang dengan melengkapi formulir e-MIS melalui tombol di bawah ini.</p>
               <button onClick={() => setShowDaftarUlang(true)} className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/30 hover:bg-emerald-700 transition-all hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-3">
                 <ClipboardCheck className="w-6 h-6" /> Mulai Daftar Ulang (e-MIS)
               </button>
            </div>
          )
        ) : profile?.registrationStatus === 'rejected' ? (
          <div className="max-w-lg mx-auto py-8">
             <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50">
               <AlertCircle className="w-12 h-12" />
             </div>
             <h2 className="text-2xl font-black text-red-600 uppercase tracking-widest mb-3">Berkas Ditolak / Perlu Perbaikan</h2>
             <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">Panitia telah memeriksa berkas Anda dan menemukan kekurangan. Silakan perbaiki sesuai catatan berikut dan unggah ulang berkas yang diperlukan.</p>
             {profile?.verificationMessage && (
               <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 text-left mb-6">
                 <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">📋 Catatan dari Panitia:</p>
                 <p className="text-red-800 font-bold text-sm leading-relaxed">{profile.verificationMessage}</p>
               </div>
             )}
             <div className="flex flex-col gap-3">
               <button onClick={() => setIsEditing(true)} className="w-full py-4 bg-red-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all active:scale-95 flex justify-center items-center gap-3">
                 <LayoutDashboard className="w-5 h-5" /> Perbaiki Data Pendaftaran
               </button>
               <a href="#/dashboard/documents" className="block w-full py-4 bg-white border-2 border-red-200 text-red-600 rounded-3xl font-black text-xs uppercase tracking-widest text-center hover:bg-red-50 transition-all active:scale-95">
                 Upload Ulang Berkas
               </a>
             </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto py-12">
             <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
               <Clock className="w-12 h-12" />
             </div>
             <h2 className="text-2xl font-black text-slate-400 uppercase tracking-widest">Hasil Belum Keluar</h2>
             <p className="text-slate-400 text-sm mt-4 font-bold uppercase italic">Mohon pantau terus halaman ini secara berkala.</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="pb-10 min-h-screen font-sans selection:bg-primary-100">
      {/* ⚠️ ERROR MODAL */}
      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[40px] p-10 text-center shadow-2xl">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><AlertCircle className="w-10 h-10" /></div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Terjadi Kesalahan</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">{error}</p>
              <button onClick={() => setShowErrorModal(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Tutup</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {tab === 'dashboard' && renderDashboard()}
        {tab === 'profile' && renderProfile()}
        {tab === 'documents' && renderDocuments()}
        {tab === 'status' && renderStatus()}
      </AnimatePresence>

      <AnimatePresence>
        {showDaftarUlang && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDaftarUlang(false)} className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="relative w-full max-w-6xl max-h-[90vh] bg-transparent rounded-[40px] flex flex-col overflow-hidden">
               <div className="flex justify-end p-4">
                  <button onClick={() => setShowDaftarUlang(false)} className="w-12 h-12 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-slate-100 flex items-center justify-center shadow-sm">
                     <X className="w-6 h-6" />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar bg-white rounded-3xl">
                  <DaftarUlangWizard pendaftarId={profile.id} onComplete={() => { setShowDaftarUlang(false); fetchProfile(); }} />
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDashboard;
