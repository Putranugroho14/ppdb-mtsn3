import React, { useState } from 'react';
import {
  X, User, Users, School, FileText, Star,
  ChevronLeft, ChevronRight, Save, Upload, Trash2, FolderOpen, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../../services/api';
import { mapErrorMessage } from '../../../utils/errorMapper';
import { AlertCircle } from 'lucide-react';
import SchoolAutocomplete from '../../../components/SchoolAutocomplete';

const AddApplicantWizard = ({ isOpen, onClose, onRefresh }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    nisn: '',
    birthPlace: '',
    birthDate: '',
    gender: 'L',
    address: '',
    nikAyah: '',
    nikIbu: '',
    hubWali: 'Ayah Kandung',
    namaAyah: '',
    namaIbu: '',
    namaWali: '',
    schoolOrigin: '',
    birthCertificateNumber: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const steps = [
    { id: 1, title: 'Data Calon Siswa', icon: <User className="w-4 h-4" /> },
    { id: 2, title: 'Data Orang Tua/Wali', icon: <Users className="w-4 h-4" /> },
    { id: 3, title: 'Sekolah Asal', icon: <School className="w-4 h-4" /> },
    { id: 4, title: 'Jalur Pendaftaran dan Dokumen', icon: <FileText className="w-4 h-4" /> },
    { id: 5, title: 'Prestasi', icon: <Star className="w-4 h-4" /> },
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const validateStep = (s) => {
    const errors = {};
    if (s === 1) {
      if (!formData.name) errors.name = 'Nama lengkap wajib diisi.';
      if (!formData.nik) errors.nik = 'NIK wajib diisi.';
      else if (formData.nik.length !== 16) errors.nik = 'NIK harus 16 digit.';
      if (!formData.nisn) errors.nisn = 'NISN wajib diisi.';
      else if (formData.nisn.length !== 10) errors.nisn = 'NISN harus 10 digit.';
      if (!formData.birthPlace) errors.birthPlace = 'Tempat lahir wajib diisi.';
      if (!formData.birthDate) errors.birthDate = 'Tanggal lahir wajib diisi.';
    }
    if (s === 2) {
      if (!formData.nikAyah && !formData.nikIbu) errors.nikAyah = 'Minimal salah satu NIK orang tua wajib diisi.';
      if (!formData.namaAyah && !formData.namaIbu) errors.namaAyah = 'Minimal salah satu nama orang tua wajib diisi.';
    }
    if (s === 3) {
      if (!formData.schoolOrigin) errors.schoolOrigin = 'Sekolah asal wajib diisi.';
      if (!formData.graduationYear) errors.graduationYear = 'Tahun lulus wajib diisi.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      setError('Beberapa data wajib belum diisi dengan benar pada langkah ini.');
      setShowErrorModal(true);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setError('Data pendaftaran belum lengkap. Silakan periksa kembali setiap langkah.');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      const detailsObj = {
        prestasiList: []
      };
      

      payload.details = JSON.stringify(detailsObj);
      await API.post('/admin/add-applicant', payload);
      onRefresh();
      onClose();
    } catch (error) {
      setError(mapErrorMessage(error));
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Input Calon Siswa</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-all">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Stepper (Based on Screenshot) */}
        <div className="p-6 border-b bg-white">
          <div className="relative flex justify-between items-center max-w-2xl mx-auto">
            {/* Line connecting circles */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-blue-400 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            ></div>

            {steps.map((s) => (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${step >= s.id ? 'bg-blue-500 border-blue-200 text-white' : 'bg-white border-slate-100 text-slate-300'
                    }`}
                >
                  {s.id}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tight text-center max-w-[80px] ${step === s.id ? 'text-blue-600' : 'text-slate-400'
                  }`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Nama Lengkap" name="name" value={formData.name} onChange={handleInputChange} placeholder="Masukkan nama sesuai ijazah" error={fieldErrors.name} required />
                  <InputGroup label="NIK" name="nik" value={formData.nik} onChange={handleInputChange} placeholder="16 digit NIK" error={fieldErrors.nik} required />
                  <InputGroup label="NISN" name="nisn" value={formData.nisn} onChange={handleInputChange} placeholder="10 digit NISN" error={fieldErrors.nisn} required />
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Tempat Lahir" name="birthPlace" value={formData.birthPlace} onChange={handleInputChange} error={fieldErrors.birthPlace} required />
                    <InputGroup label="Tgl Lahir" name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} error={fieldErrors.birthDate} required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis Kelamin</label>
                    <div className="flex gap-4 p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value="L" checked={formData.gender === 'L'} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Laki-Laki</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value="P" checked={formData.gender === 'P'} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Perempuan</span>
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat Lengkap</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none transition-all h-20"
                      placeholder="Dusun, RT/RW, Desa, Kecamatan"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-4">
                    <InputGroup label="NIK Ayah" name="nikAyah" value={formData.nikAyah} onChange={handleInputChange} error={fieldErrors.nikAyah} />
                    <InputGroup label="NIK Ibu" name="nikIbu" value={formData.nikIbu} onChange={handleInputChange} error={fieldErrors.nikIbu} />
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wali Calon Siswa</label>
                      <select
                        name="hubWali"
                        value={formData.hubWali}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-slate-700"
                      >
                        <option value="Ayah Kandung">Ayah Kandung</option>
                        <option value="Ibu Kandung">Ibu Kandung</option>
                        <option value="Wali">Wali</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <InputGroup label="Nama Ayah" name="namaAyah" value={formData.namaAyah} onChange={handleInputChange} error={fieldErrors.namaAyah} />
                    <InputGroup label="Nama Ibu" name="namaIbu" value={formData.namaIbu} onChange={handleInputChange} error={fieldErrors.namaIbu} />
                    <InputGroup label="Nama Wali" name="namaWali" value={formData.namaWali} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <SchoolAutocomplete
                      value={formData.schoolOrigin}
                      onChange={(val) => setFormData({ ...formData, schoolOrigin: val })}
                      error={fieldErrors.schoolOrigin}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <InputGroup label="Tahun Lulus" name="graduationYear" value={formData.graduationYear} onChange={handleInputChange} placeholder="Contoh: 2024" required error={fieldErrors.graduationYear} />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="max-w-xs">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jalur Pendaftaran</label>
                    <select
                      name="jalurPendaftaran"
                      value={formData.jalurPendaftaran}
                      onChange={handleInputChange}
                      className="w-full mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-slate-700"
                    >
                      <option value="Reguler">Reguler</option>
                      <option value="Prestasi">Prestasi</option>
                      <option value="Afirmasi">Afirmasi</option>
                    </select>
                  </div>

                  <div className="bg-[#007BFF] p-2 rounded-t-lg text-white font-bold text-xs uppercase tracking-widest pl-4">
                    Unggah Dokumen
                  </div>
                  <div className="border border-slate-200 rounded-b-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-slate-100">
                        <UploadRow label="FOTO/SCAN KARTU KELUARGA (KK)" />
                        <UploadRow label="FOTO/SCAN AKTA KELAHIRAN" />
                        <UploadRow label="PAS PHOTO BERPAKAIAN SD/MI" />
                        <UploadRow label="FOTO/SCAN IJAZAH/SURAT KETERANGAN LULUS" />
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="text-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-800">Data Prestasi</h3>
                  <p className="text-slate-500 max-w-md mx-auto mt-2">Silakan isi jika calon siswa memiliki prestasi akademik atau non-akademik di tingkat minimal kecamatan.</p>
                  <button className="mt-6 px-6 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all">
                    + Tambah Prestasi
                  </button>


                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-2 bg-[#337AB7] text-white rounded font-bold text-xs uppercase flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            Prev
          </button>

          <div className="flex gap-2">
            {step < 5 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-[#337AB7] text-white rounded font-bold text-xs uppercase flex items-center gap-2 hover:bg-blue-700 transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-[#5CB85C] text-white rounded font-bold text-xs uppercase flex items-center gap-2 hover:bg-green-700 disabled:opacity-50 transition-all"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan
              </button>
            )}
          </div>
        </div>
      </motion.div>

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

const InputGroup = ({ label, name, value, onChange, type = "text", placeholder = "", error = "", required = false }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full p-3 rounded-xl bg-slate-50 border-2 outline-none transition-all font-medium text-sm ${error ? 'border-red-500 bg-red-50/30' : 'border-slate-100 focus:border-blue-400'}`}
    />
    {error && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{error}</p>}
  </div>
);

const UploadRow = ({ label }) => (
  <tr className="hover:bg-slate-50/50">
    <td className="p-4 font-medium text-slate-600 uppercase tracking-tighter text-[10px]">{label}</td>
    <td className="p-4 flex gap-1 justify-end">
      <button className="px-3 py-1.5 bg-[#5BC0DE] text-white rounded flex items-center gap-1 font-bold text-[10px]">
        <FolderOpen className="w-3 h-3" /> Browse
      </button>
      <button className="px-3 py-1.5 bg-[#5CB85C] text-white rounded flex items-center gap-1 font-bold text-[10px]">
        <Upload className="w-3 h-3" /> Upload
      </button>
      <button className="px-3 py-1.5 bg-[#D9534F] text-white rounded flex items-center gap-1 font-bold text-[10px]">
        <Trash2 className="w-3 h-3" /> Hapus
      </button>
    </td>
  </tr>
);

export default AddApplicantWizard;
