import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Phone, MapPin, Calendar, Hash,
  School, GraduationCap, CheckCircle2, AlertCircle,
  FileText, Clock, ShieldCheck
} from 'lucide-react';

const ApplicantDetailModal = ({ isOpen, onClose, applicant }) => {
  if (!applicant) return null;

  const DetailItem = ({ icon: Icon, label, value, color = "text-slate-500" }) => (
    <div className="flex items-start gap-3 py-2">
      <div className={`mt-1 p-1.5 rounded-lg bg-slate-50 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 leading-none mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value || '-'}</p>
      </div>
    </div>
  );

  const getStatusConfig = (status) => {
    switch (status) {
      case 'accepted': return { label: 'LOLOS / DITERIMA', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'rejected': return { label: 'DITOLAK / PERBAIKAN', color: 'bg-red-100 text-red-700 border-red-200' };
      case 'verified': return { label: 'TERVERIFIKASI', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'pending': return { label: 'MENUNGGU VERIFIKASI', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      default: return { label: (status || 'BELUM LENGKAP').toUpperCase(), color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const status = getStatusConfig(applicant.registrationStatus);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-primary-900 p-6 text-white flex justify-between items-start">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center backdrop-blur-md">
                  <User className="w-10 h-10 text-primary-200" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black uppercase tracking-tight">{applicant.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-primary-200 font-mono text-sm tracking-widest">{applicant.registrationNumber}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Section 1: Basic Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-4 border-b pb-2">Informasi Dasar</h3>
                    <div className="space-y-1">
                      <DetailItem icon={Hash} label="NISN" value={applicant.nisn} color="text-blue-500" />
                      <DetailItem icon={ShieldCheck} label="NIK" value={applicant.nik} color="text-indigo-500" />
                      <DetailItem icon={Calendar} label="Tempat, Tgl Lahir" value={`${applicant.birthPlace}, ${applicant.birthDate}`} color="text-emerald-500" />
                      <DetailItem icon={User} label="Jenis Kelamin" value={applicant.gender === 'L' ? 'Laki-laki' : 'Perempuan'} color="text-pink-500" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-4 border-b pb-2">Kontak Orang Tua</h3>
                    <div className="space-y-1">
                      <DetailItem icon={User} label="Nama Orang Tua" value={applicant.parentName} color="text-slate-600" />
                      <DetailItem icon={Phone} label="No. HP / WA" value={applicant.parentPhone} color="text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Section 2: School & Address */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-4 border-b pb-2">Asal Sekolah & Jalur</h3>
                    <div className="space-y-1">
                      <DetailItem icon={School} label="Sekolah Asal" value={applicant.schoolOrigin || applicant.sekolahAsalLainnya} color="text-amber-500" />
                      <DetailItem icon={GraduationCap} label="Jalur Pendaftaran" value={applicant.jalurPendaftaran || 'Reguler'} color="text-purple-500" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-4 border-b pb-2">Alamat Lengkap</h3>
                    <div className="flex gap-3 py-2">
                      <div className="mt-1 p-1.5 rounded-lg bg-slate-50 text-red-500">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 leading-relaxed italic">{applicant.address || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Status & Documents */}
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Hasil Seleksi</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-slate-600">Skor Seleksi:</span>
                      <span className="text-xl font-black text-primary-600">{applicant.HasilSeleksi?.averageScore || '0.00'}</span>
                    </div>
                    {applicant.registrationStatus === 'rejected' && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-[10px] font-black text-red-500 uppercase mb-1">Pesan Penolakan:</p>
                        <p className="text-xs text-red-800 italic">{applicant.verificationMessage}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-4 border-b pb-2">Kelengkapan Berkas</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['kk', 'akta', 'foto', 'ijazah'].map(type => {
                        const isUploaded = applicant.Berkas?.find(b => b.type === type);
                        return (
                          <div key={type} className={`p-3 rounded-xl border flex items-center gap-3 ${isUploaded ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
                            {isUploaded ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-slate-300" />}
                            <span className={`text-[10px] font-black uppercase ${isUploaded ? 'text-emerald-700' : 'text-slate-400'}`}>{type}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${applicant.DaftarUlang ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${applicant.DaftarUlang ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Status Daftar Ulang</p>
                        <p className={`text-xs font-black ${applicant.DaftarUlang ? 'text-indigo-700' : 'text-slate-400'}`}>
                          {applicant.DaftarUlang?.statusDaftarUlang === 'verified' ? 'TERVERIFIKASI' :
                            applicant.DaftarUlang?.statusDaftarUlang === 'completed' ? 'SELESAI' : 'BELUM'}
                        </p>
                      </div>
                    </div>
                    {applicant.DaftarUlang && <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-100 transition-all"
              >
                TUTUP DETAIL
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplicantDetailModal;
