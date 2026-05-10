import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { CheckCircle, ChevronRight, ChevronLeft, Save, AlertCircle, User, Users, BookOpen, FileText, Trophy, Upload, Plus, Trash2, FileCheck, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mapErrorMessage, validatePhone } from '../utils/errorMapper';
import { X } from 'lucide-react';

const steps = [
  { id: 'siswa', label: 'Data Calon Siswa', icon: User },
  { id: 'ortu', label: 'Data Orang Tua/Wali', icon: Users },
  { id: 'sekolah', label: 'Sekolah Asal', icon: BookOpen },
  { id: 'dokumen', label: 'Jalur & Dokumen', icon: FileText },
  { id: 'prestasi', label: 'Prestasi', icon: Trophy }
];

const Input = ({ label, name, type = 'text', value, onChange, placeholder, required = false, maxLength, minLength, pattern, title, min, max, step, error }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
      {label} {error && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      minLength={minLength}
      pattern={pattern}
      title={title}
      min={min}
      max={max}
      step={step}
      autoComplete="off"
      className={`input w-full bg-white border-slate-300 shadow-sm ${error ? 'border-red-500' : ''}`}
    />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

const Select = ({ label, name, options, required, value, onChange, error }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
      {label} {error && <span className="text-red-500">*</span>}
    </label>
    <select name={name} value={value || ''} onChange={onChange} className="input w-full bg-white border-slate-300 shadow-sm" required={required}>
      {options.map((opt, i) => <option key={`${opt.value}-${i}`} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const DocumentUpload = ({ label, name, file, onChange, onRemove, isLocked }) => (
  <div className="flex flex-col p-5 bg-white rounded-2xl border-2 border-slate-100 gap-4 transition-all hover:border-primary-200 hover:shadow-xl group">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-tight">{label}</h4>
        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Format: JPG, PNG, PDF (Maks 2MB)</p>
      </div>
      {file && !isLocked && (
        <button type="button" onClick={() => onRemove(name)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
          <X className="w-4 h-4" />
        </button>
      )}
      {isLocked && (
        <div className="p-2 bg-slate-100 text-slate-400 rounded-xl flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase">Terkunci</span>
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 gap-3">
      {file ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-green-800 truncate">{file.name || 'Dokumen Terunggah'}</p>
            <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest">
              {isLocked ? 'Sudah Terverifikasi / Tersimpan' : 'Dokumen Terpilih'}
            </p>
          </div>
        </div>
      ) : (
        <label className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 group ${isLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white cursor-pointer hover:bg-slate-800'}`}>
          <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-1" />
          Pilih File / Foto Dokumen
          {!isLocked && <input type="file" name={name} className="hidden" onChange={(e) => onChange(e, name)} accept=".jpg,.jpeg,.png,.pdf" />}
        </label>
      )}
    </div>
  </div>
);

const RegistrationWizard = ({ initialData, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Identifikasi dokumen yang sudah ada di database untuk fitur "Lock"
  const initialDocuments = initialData?.Berkas?.reduce((acc, b) => {
    acc[b.type] = b;
    return acc;
  }, {}) || {};
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  // Documents state - Initialize with existing files from database
  const [documents, setDocuments] = useState({
    kk: initialDocuments.kk || null,
    akta: initialDocuments.akta || null,
    foto: initialDocuments.foto || null,
    ijazah: initialDocuments.ijazah || null
  });

  const [prestasiList, setPrestasiList] = useState([]);

  const [formData, setFormData] = useState({
    nik: '', nisn: '', name: '', gender: 'L', birthPlace: '', birthDate: '', address: '',
    schoolOrigin: '', graduationYear: '', parentName: '', parentPhone: '',
    agama: 'ISLAM', noKK: '', namaKepalaKeluarga: '',
    provinsi: '', kecamatan: '', kodePos: '', kabupatenKota: '', kelurahanDesa: '', rt: '', rw: '', npsn: '',
    ayahNik: '', ibuNik: '', ibuNama: '', ibuPhone: '',
    waliCalonSiswa: 'Ayah Kandung', waliNama: '',
    sekolahAsalLainnya: '',
    nilaiRaportIVGanjil: '0', nilaiRaportIVGenap: '0',
    nilaiRaportVGanjil: '0', nilaiRaportVGenap: '0',
    nilaiRaportVIGanjil: '0',
    jalurPendaftaran: 'Reguler',
    birthCertificateNumber: ''
  });

  useEffect(() => {
    const loadLocationTree = async (provName, kabName, kecName) => {
      try {
        const provRes = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
        const provData = await provRes.json();
        setProvinces(provData);

        if (provName) {
          const prov = provData.find(p => p.name === provName.toUpperCase() || p.name === provName);
          if (prov) {
            const regRes = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${prov.id}.json`);
            const regData = await regRes.json();
            setRegencies(regData);

            if (kabName) {
              const reg = regData.find(r => r.name === kabName.toUpperCase() || r.name === kabName);
              if (reg) {
                const distRes = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${reg.id}.json`);
                const distData = await distRes.json();
                setDistricts(distData);

                if (kecName) {
                  const dist = distData.find(d => d.name === kecName.toUpperCase() || d.name === kecName);
                  if (dist) {
                    const vilRes = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${dist.id}.json`);
                    const vilData = await vilRes.json();
                    setVillages(vilData);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load location data", err);
      }
    };

    if (initialData) {
      let parsedDetails = {};
      try {
        if (initialData.details) parsedDetails = JSON.parse(initialData.details);
      } catch (e) { }

      setFormData(prev => {
        let rt = '';
        let rw = '';
        if (parsedDetails.rtRw) {
          const parts = parsedDetails.rtRw.split('/');
          if (parts.length >= 2) {
            // Unused rt/rw variables removed
          }
        }

        return {
          ...prev,
          ...parsedDetails,
          nik: initialData.nik || parsedDetails.nik || '',
          nisn: initialData.nisn || parsedDetails.nisn || '',
          name: initialData.name || parsedDetails.name || initialData.User?.name || '',
          gender: initialData.gender || parsedDetails.gender || 'L',
          birthPlace: initialData.birthPlace || parsedDetails.birthPlace || '',
          birthDate: initialData.birthDate || parsedDetails.birthDate || '',
          address: initialData.address || parsedDetails.address || '',
          schoolOrigin: initialData.schoolOrigin || parsedDetails.schoolOrigin || '',
          graduationYear: initialData.graduationYear || parsedDetails.graduationYear || '',
          parentName: initialData.parentName || parsedDetails.parentName || '',
          parentPhone: initialData.parentPhone || parsedDetails.parentPhone || '',
          ibuNama: initialData.ibuNama || parsedDetails.ibuNama || '',
          ibuNik: initialData.ibuNik || parsedDetails.ibuNik || '',
          ayahNik: initialData.ayahNik || parsedDetails.ayahNik || '',
          noKK: initialData.noKK || parsedDetails.noKK || '',
          namaKepalaKeluarga: initialData.namaKepalaKeluarga || parsedDetails.namaKepalaKeluarga || '',
          provinsi: initialData.provinsi || parsedDetails.provinsi || '',
          kabupatenKota: initialData.kabupatenKota || parsedDetails.kabupatenKota || '',
          kecamatan: initialData.kecamatan || parsedDetails.kecamatan || '',
          kelurahanDesa: initialData.kelurahanDesa || parsedDetails.kelurahanDesa || '',
          kodePos: initialData.kodePos || parsedDetails.kodePos || '',
          rt: initialData.rt || parsedDetails.rt || '',
          rw: initialData.rw || parsedDetails.rw || '',
          agama: initialData.agama || parsedDetails.agama || '1 - ISLAM',
          npsn: initialData.npsn || parsedDetails.npsn || '',
          jalurPendaftaran: initialData.jalurPendaftaran || parsedDetails.jalurPendaftaran || 'Reguler',
          sekolahAsalLainnya: initialData.sekolahAsalLainnya || parsedDetails.sekolahAsalLainnya || '',
          waliCalonSiswa: initialData.waliCalonSiswa || parsedDetails.waliCalonSiswa || 'Ayah Kandung',
          waliNama: initialData.waliNama || parsedDetails.waliNama || '',
          nilaiRaportIVGanjil: initialData.nilaiRaportIVGanjil || parsedDetails.nilaiRaportIVGanjil || '0',
          nilaiRaportIVGenap: initialData.nilaiRaportIVGenap || parsedDetails.nilaiRaportIVGenap || '0',
          nilaiRaportVGanjil: initialData.nilaiRaportVGanjil || parsedDetails.nilaiRaportVGanjil || '0',
          nilaiRaportVGenap: initialData.nilaiRaportVGenap || parsedDetails.nilaiRaportVGenap || '0',
          nilaiRaportVIGanjil: initialData.nilaiRaportVIGanjil || parsedDetails.nilaiRaportVIGanjil || '0',
          birthCertificateNumber: initialData.birthCertificateNumber || parsedDetails.birthCertificateNumber || '',
        };
      });

      if (parsedDetails.prestasiList) {
        setPrestasiList(parsedDetails.prestasiList);
      }

      loadLocationTree(
        initialData.provinsi || parsedDetails.provinsi,
        initialData.kabupatenKota || parsedDetails.kabupatenKota,
        initialData.kecamatan || parsedDetails.kecamatan
      );
    } else {
      loadLocationTree(null, null, null);
    }
  }, [initialData]);

  const handleLocationChange = async (e, level) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    try {
      if (level === 'provinsi') {
        const prov = provinces.find(p => p.name === value);
        setRegencies([]); setDistricts([]); setVillages([]);
        setFormData(prev => ({ ...prev, kabupatenKota: '', kecamatan: '', kelurahanDesa: '' }));
        if (prov) {
          const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${prov.id}.json`);
          setRegencies(await res.json());
        }
      } else if (level === 'kabupaten') {
        const reg = regencies.find(r => r.name === value);
        setDistricts([]); setVillages([]);
        setFormData(prev => ({ ...prev, kecamatan: '', kelurahanDesa: '' }));
        if (reg) {
          const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${reg.id}.json`);
          setDistricts(await res.json());
        }
      } else if (level === 'kecamatan') {
        const dist = districts.find(d => d.name === value);
        setVillages([]);
        setFormData(prev => ({ ...prev, kelurahanDesa: '' }));
        if (dist) {
          const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${dist.id}.json`);
          setVillages(await res.json());
        }
      }
    } catch (err) {
      console.error("Error fetching location data", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Hanya izinkan angka untuk RT, RW, dan Kode Pos
    if (['rt', 'rw', 'kodePos'].includes(name)) {
      if (value !== '' && !/^\d+$/.test(value)) return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (e, docName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError(`Ukuran file untuk ${docName} terlalu besar! Maksimal ukuran file adalah 2MB.`);
        setShowErrorModal(true);
        e.target.value = ''; // Reset input
        return;
      }
      setDocuments(prev => ({ ...prev, [docName]: file }));
    }
  };

  const removeFile = (docName) => {
    setDocuments(prev => ({ ...prev, [docName]: null }));
  };

  const addPrestasi = () => {
    setPrestasiList([...prestasiList, { lomba: '', bidang: '', penyelenggara: '', tingkat: '', prestasi: '' }]);
  };

  const updatePrestasi = (index, field, value) => {
    const newList = [...prestasiList];
    newList[index][field] = value;
    setPrestasiList(newList);
  };

  const removePrestasi = (index) => {
    setPrestasiList(prestasiList.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Simpan Data Profil Terlebih Dahulu
      const payload = { ...formData };
      const detailsObj = {
        prestasiList: prestasiList
      };
      payload.details = JSON.stringify(detailsObj);

      await API.post('/user/profile', payload);

      // 2. Proses Unggah Dokumen (Jika ada)
      const docTypes = Object.keys(documents);
      for (const type of docTypes) {
        const fileData = documents[type];
        // Hanya unggah jika fileData adalah File baru (bukan objek dari database)
        if (fileData && fileData instanceof File) {
          const uploadFormData = new FormData();
          uploadFormData.append('document', fileData);
          uploadFormData.append('type', type);
          await API.post('/user/upload', uploadFormData);
        }
      }

      setSuccess('Pendaftaran berhasil! Seluruh data dan dokumen Anda telah tersimpan.');
      setTimeout(() => {
        if (onComplete) onComplete();
        window.location.href = '#/dashboard/status'; // Arahkan langsung ke halaman status
      }, 2000);
    } catch (err) {
      setError(mapErrorMessage(err));
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateStep = () => {
    setError('');
    const {
      nik, name, birthDate, address, rt, rw, kodePos,
      parentName, ibuNama, parentPhone,
      schoolOrigin, graduationYear
    } = formData;

    if (currentStep === 0) { // Data Calon Siswa
      if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
        setFieldErrors({ nik: 'NIK harus 16 digit angka' });
        setError('NIK harus 16 digit angka');
        setShowErrorModal(true);
        return false;
      }
      if (!name || name.trim().length < 3) {
        setFieldErrors({ name: 'Nama lengkap minimal 3 karakter' });
        setError('Nama lengkap minimal 3 karakter');
        setShowErrorModal(true);
        return false;
      }
      if (!birthDate) {
        setFieldErrors({ birthDate: 'Tanggal lahir wajib diisi' });
        setError('Tanggal lahir wajib diisi');
        setShowErrorModal(true);
        return false;
      }
      if (!address || address.trim().length < 10) {
        setFieldErrors({ address: 'Alamat lengkap minimal 10 karakter' });
        setError('Alamat lengkap minimal 10 karakter');
        setShowErrorModal(true);
        return false;
      }
      if (!rt || !rw || !kodePos) {
        setFieldErrors({ rt: 'RT/RW/Kode Pos wajib diisi' });
        setError('Mohon lengkapi RT, RW, dan Kode Pos.');
        setShowErrorModal(true);
        return false;
      }
      if (!parentPhone || !validatePhone(parentPhone)) {
        setFieldErrors({ parentPhone: 'Nomor HP tidak valid (Contoh: 08123456789)' });
        setError('Nomor HP tidak valid (Contoh: 08123456789)');
        setShowErrorModal(true);
        return false;
      }
    }

    if (currentStep === 1) { // Data Orang Tua
      if (!parentName || parentName.trim().length < 3) {
        setFieldErrors({ parentName: 'Nama Ayah minimal 3 karakter' });
        setError('Nama Ayah minimal 3 karakter');
        setShowErrorModal(true);
        return false;
      }
      if (!ibuNama || ibuNama.trim().length < 3) {
        setFieldErrors({ ibuNama: 'Nama Ibu minimal 3 karakter' });
        setError('Nama Ibu minimal 3 karakter');
        setShowErrorModal(true);
        return false;
      }
    }

    if (currentStep === 2) { // Sekolah Asal
      if (!schoolOrigin) {
        setFieldErrors({ schoolOrigin: 'Sekolah asal wajib dipilih' });
        setError('Sekolah asal wajib dipilih');
        setShowErrorModal(true);
        return false;
      }
      if (!graduationYear || !/^20\d{2}$/.test(graduationYear)) {
        setFieldErrors({ graduationYear: 'Tahun lulus harus format YYYY (Contoh: 2024)' });
        setError('Tahun lulus harus format YYYY (Contoh: 2024)');
        setShowErrorModal(true);
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      scrollToTop();
    } else {
      scrollToTop();
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    scrollToTop();
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden mt-6 lg:mt-0">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mt-20 -mr-20"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black tracking-wide">Pendaftaran Siswa Baru</h2>
        </div>
      </div>

      <div className="p-6 md:p-10">
        {/* Progress Tracker */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-4 hide-scrollbar">
          <div className="flex items-center min-w-max md:w-full md:max-w-4xl px-4">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className={`flex flex-col items-center gap-3 relative z-10 w-24 md:w-32 ${idx <= currentStep ? 'text-primary-600' : 'text-slate-400'}`}>
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-bold border-2 transition-all duration-300 ${idx === currentStep ? 'bg-primary-600 border-primary-200 text-white shadow-lg shadow-primary-500/30 scale-110' : idx < currentStep ? 'bg-green-500 border-green-400 text-white shadow-md' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                    {idx < currentStep ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-center leading-tight">{step.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-1.5 bg-slate-100 relative rounded-full overflow-hidden mb-8 min-w-[30px] md:min-w-0">
                    <div className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500" style={{ width: currentStep > idx ? '100%' : '0%' }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
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
                  <h3 className="text-2xl font-black text-slate-900">Terjadi Kesalahan</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{error}</p>
                </div>
                <button onClick={() => setShowErrorModal(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Tutup</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl flex items-center gap-3 border border-green-100">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </motion.div>
        )}

        <div className="min-h-[450px]">
          {/* STEP 1: DATA CALON SISWA */}
          {currentStep === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                <User className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-slate-800">Identitas Diri</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                <Input label="NIK (Nomor Induk Kependudukan)" name="nik" value={formData.nik} onChange={handleChange} maxLength={16} minLength={16} pattern="\d{16}" title="NIK harus tepat 16 digit angka" required error={fieldErrors.nik} />
                <Input label="Nama Lengkap Sesuai KK" name="name" value={formData.name} onChange={handleChange} pattern="^[a-zA-Z\s\.,']+$" title="Nama hanya boleh berisi huruf dan spasi" required error={fieldErrors.name} />

                <Input label="Nomor Kartu Keluarga (No KK)" name="noKK" value={formData.noKK} onChange={handleChange} maxLength={16} minLength={16} pattern="\d{16}" title="No KK harus tepat 16 digit angka" error={fieldErrors.noKK} />
                <Input label="Nama Kepala Keluarga" name="namaKepalaKeluarga" value={formData.namaKepalaKeluarga} onChange={handleChange} pattern="^[a-zA-Z\s\.,']+$" title="Nama hanya boleh berisi huruf dan spasi" error={fieldErrors.namaKepalaKeluarga} />

                <Input label="Tempat Lahir" name="birthPlace" value={formData.birthPlace} onChange={handleChange} pattern="^[a-zA-Z\s\-]+$" title="Tempat lahir hanya boleh berisi huruf" error={fieldErrors.birthPlace} />
                <Input label="Tanggal Lahir" name="birthDate" value={formData.birthDate} onChange={handleChange} type="date" min="2005-01-01" max="2016-12-31" title="Tahun lahir pendaftar MTs biasanya antara 2005 - 2016" error={fieldErrors.birthDate} />

                <Select label="Jenis Kelamin" name="gender" value={formData.gender} onChange={handleChange} options={[
                  { value: 'L', label: '1 - LAKI-LAKI' },
                  { value: 'P', label: '2 - PEREMPUAN' }
                ]} />
                <Select label="Agama" name="agama" value={formData.agama} onChange={handleChange} options={[
                  { value: 'ISLAM', label: 'Islam' },
                  { value: 'KRISTEN', label: 'Kristen' },
                  { value: 'KATHOLIK', label: 'Katholik' },
                  { value: 'HINDU', label: 'Hindu' },
                  { value: 'BUDHA', label: 'Budha' },
                  { value: 'KONGHUCU', label: 'Konghucu' }
                ]} />

                <Select label="Provinsi" name="provinsi" value={formData.provinsi} onChange={(e) => handleLocationChange(e, 'provinsi')} options={[
                  { value: '', label: '--- PILIH PROVINSI ---' },
                  ...provinces.map(p => ({ value: p.name, label: p.name }))
                ]} />
                <Select label="Kabupaten/Kota" name="kabupatenKota" value={formData.kabupatenKota} onChange={(e) => handleLocationChange(e, 'kabupaten')} options={[
                  { value: '', label: '--- PILIH KABUPATEN ---' },
                  ...regencies.map(r => ({ value: r.name, label: r.name }))
                ]} />

                <Select label="Kecamatan" name="kecamatan" value={formData.kecamatan} onChange={(e) => handleLocationChange(e, 'kecamatan')} options={[
                  { value: '', label: '--- PILIH KECAMATAN ---' },
                  ...districts.map(d => ({ value: d.name, label: d.name }))
                ]} />
                <Select label="Kelurahan/Desa" name="kelurahanDesa" value={formData.kelurahanDesa} onChange={(e) => handleLocationChange(e, 'kelurahan')} options={[
                  { value: '', label: '--- PILIH DESA/KELURAHAN ---' },
                  ...villages.map(v => ({ value: v.name, label: v.name }))
                ]} />

                <Input label="Alamat Tempat Tinggal" name="address" value={formData.address} onChange={handleChange} error={fieldErrors.address} />
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1">RT / RW / Kode Pos</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" name="rt" value={formData.rt} onChange={handleChange} className="input w-full bg-white border-slate-300 shadow-sm text-center" placeholder="RT" />
                    <input type="text" name="rw" value={formData.rw} onChange={handleChange} className="input w-full bg-white border-slate-300 shadow-sm text-center" placeholder="RW" />
                    <input type="text" name="kodePos" value={formData.kodePos} onChange={handleChange} className="input w-full bg-white border-slate-300 shadow-sm text-center" placeholder="Kode Pos" />
                  </div>
                </div>

                <Input label="NISN (Nomor Induk Siswa Nasional)" name="nisn" value={formData.nisn} onChange={handleChange} maxLength={10} minLength={10} pattern="\d{10}" title="NISN harus tepat 10 digit angka" error={fieldErrors.nisn} />

                <Input label="Nomor HP/WA Aktif" name="parentPhone" value={formData.parentPhone} onChange={handleChange} maxLength={14} minLength={10} pattern="^(08|628)\d{8,12}$" title="Nomor HP harus diawali 08 atau 628 dan berjumlah 10-14 digit" error={fieldErrors.parentPhone} />
              </div>
            </motion.div>
          )}

          {/* STEP 2: DATA ORANG TUA/WALI */}
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                <Users className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-slate-800">Informasi Orang Tua</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                <Input label="NIK Ayah" name="ayahNik" value={formData.ayahNik} onChange={handleChange} maxLength={16} minLength={16} pattern="\d{16}" title="NIK harus tepat 16 digit angka" error={fieldErrors.ayahNik} />
                <Input label="Nama Ayah" name="parentName" value={formData.parentName} onChange={handleChange} pattern="^[a-zA-Z\s\.,']+$" title="Nama hanya boleh berisi huruf dan spasi" error={fieldErrors.parentName} />

                <Input label="NIK Ibu" name="ibuNik" value={formData.ibuNik} onChange={handleChange} maxLength={16} minLength={16} pattern="\d{16}" title="NIK harus tepat 16 digit angka" error={fieldErrors.ibuNik} />
                <Input label="Nama Ibu" name="ibuNama" value={formData.ibuNama} onChange={handleChange} pattern="^[a-zA-Z\s\.,']+$" title="Nama hanya boleh berisi huruf dan spasi" error={fieldErrors.ibuNama} />
                <Input label="Nomor HP/WA Ibu" name="ibuPhone" value={formData.ibuPhone} onChange={handleChange} maxLength={14} minLength={10} pattern="^(08|628)\d{8,12}$" title="Nomor HP harus diawali 08 atau 628" placeholder="08..." />

                <Select label="Wali Calon Siswa" name="waliCalonSiswa" value={formData.waliCalonSiswa} onChange={handleChange} options={[
                  { value: 'Ayah Kandung', label: 'Ayah Kandung' },
                  { value: 'Ibu Kandung', label: 'Ibu Kandung' },
                  { value: 'Paman/Bibi', label: 'Paman/Bibi' },
                  { value: 'Kakek/Nenek', label: 'Kakek/Nenek' },
                  { value: 'Lainnya', label: 'Lainnya' }
                ]} />
                <Input label="Nama Wali (Jika Ada)" name="waliNama" value={formData.waliNama} onChange={handleChange} pattern="^[a-zA-Z\s\.,']+$" title="Nama hanya boleh berisi huruf dan spasi" />
              </div>
            </motion.div>
          )}

          {/* STEP 3: SEKOLAH ASAL */}
          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-slate-800">Riwayat Pendidikan Terakhir</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                <div className="md:col-span-2">
                  <Input
                    label="Nama Sekolah Asal (SD/MI/Boarding)"
                    name="schoolOrigin"
                    value={formData.schoolOrigin}
                    onChange={handleChange}
                    placeholder="Contoh: SDN 2 SANGGAU atau MIS AL-MA'ARIF"
                    required
                    error={fieldErrors.schoolOrigin}
                  />
                </div>

                <Input label="NPSN Sekolah Asal" name="npsn" value={formData.npsn} onChange={handleChange} maxLength={8} minLength={8} pattern="\d{8}" title="NPSN harus tepat 8 digit angka" />
                <Input label="Tahun Lulus" name="graduationYear" value={formData.graduationYear} onChange={handleChange} maxLength={4} minLength={4} pattern="^20\d{2}$" title="Tahun lulus harus valid (misal: 2024)" />

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-700 mb-2 border-b border-slate-200 pb-2">Nilai Raport Kelas IV</h4>
                  <Input label="Semester Ganjil" name="nilaiRaportIVGanjil" value={formData.nilaiRaportIVGanjil} onChange={handleChange} type="number" min="0" max="100" step="0.01" />
                  <Input label="Semester Genap" name="nilaiRaportIVGenap" value={formData.nilaiRaportIVGenap} onChange={handleChange} type="number" min="0" max="100" step="0.01" />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-700 mb-2 border-b border-slate-200 pb-2">Nilai Raport Kelas V</h4>
                  <Input label="Semester Ganjil" name="nilaiRaportVGanjil" value={formData.nilaiRaportVGanjil} onChange={handleChange} type="number" min="0" max="100" step="0.01" />
                  <Input label="Semester Genap" name="nilaiRaportVGenap" value={formData.nilaiRaportVGenap} onChange={handleChange} type="number" min="0" max="100" step="0.01" />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-700 mb-2 border-b border-slate-200 pb-2">Nilai Raport Kelas VI</h4>
                  <Input label="Semester Ganjil" name="nilaiRaportVIGanjil" value={formData.nilaiRaportVIGanjil} onChange={handleChange} type="number" min="0" max="100" step="0.01" />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: DOKUMEN & JALUR PENDAFTARAN */}
          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                <FileText className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-slate-800">Jalur Pendaftaran & Unggah Dokumen</h3>
              </div>

              <div className="max-w-md mb-8">
                <Select label="Jalur Pendaftaran" name="jalurPendaftaran" value={formData.jalurPendaftaran} onChange={handleChange} options={[
                  { value: 'Reguler', label: 'Jalur Reguler' },
                  { value: 'Prestasi', label: 'Jalur Prestasi' },
                  { value: 'Afirmasi', label: 'Jalur Afirmasi (KIP/PKH)' },
                  { value: 'Mutasi', label: 'Jalur Pindah Tugas Orang Tua' }
                ]} />
              </div>

              <div className="bg-white border-2 border-primary-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-primary-50 px-6 py-4 border-b border-primary-100">
                  <h4 className="font-black text-primary-800">Persyaratan Dokumen</h4>
                  <p className="text-xs text-primary-600 mt-1">Unggah hasil scan/foto dokumen asli dengan jelas agar mempermudah proses verifikasi panitia.</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100 mb-6">
                    <p className="text-[11px] font-bold text-green-800 uppercase tracking-wide flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Perhatian: Dokumen yang sudah diunggah akan terkunci dan tidak dapat diubah tanpa persetujuan Admin.
                    </p>
                  </div>
                  <DocumentUpload
                    label="FOTO / SCAN KARTU KELUARGA (KK)"
                    name="kk"
                    file={documents.kk}
                    onChange={handleFileUpload}
                    onRemove={removeFile}
                    isLocked={initialDocuments?.kk}
                  />
                  <DocumentUpload
                    label="FOTO / SCAN AKTA KELAHIRAN"
                    name="akta"
                    file={documents.akta}
                    onChange={handleFileUpload}
                    onRemove={removeFile}
                    isLocked={initialDocuments?.akta}
                  />
                  <DocumentUpload
                    label="PAS PHOTO BERPAKAIAN SD/MI"
                    name="foto"
                    file={documents.foto}
                    onChange={handleFileUpload}
                    onRemove={removeFile}
                    isLocked={initialDocuments?.foto}
                  />
                  <DocumentUpload
                    label="FOTO / SCAN IJAZAH / SURAT KETERANGAN LULUS"
                    name="ijazah"
                    file={documents.ijazah}
                    onChange={handleFileUpload}
                    onRemove={removeFile}
                    isLocked={initialDocuments?.ijazah}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: PRESTASI */}
          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                <Trophy className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-slate-800">Prestasi Calon Peserta Didik</h3>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">Daftar Prestasi (Opsional)</h4>
                    <p className="text-xs text-slate-500 mt-1">Masukkan data prestasi akademik/non-akademik minimal tingkat kabupaten/kota.</p>
                  </div>
                  <button onClick={addPrestasi} className="btn btn-primary bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md">
                    <Plus className="w-4 h-4" /> Tambah Prestasi
                  </button>
                </div>

                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">Nama Lomba</th>
                        <th className="px-4 py-3">Bidang</th>
                        <th className="px-4 py-3">Penyelenggara</th>
                        <th className="px-4 py-3">Tingkat</th>
                        <th className="px-4 py-3">Prestasi</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prestasiList.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-10 text-center text-slate-500 bg-slate-50/50">
                            <Trophy className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                            Belum ada data prestasi. Klik tombol "Tambah Prestasi" jika memiliki.
                          </td>
                        </tr>
                      ) : (
                        prestasiList.map((prestasi, index) => (
                          <tr key={index} className="border-b border-slate-100 bg-white hover:bg-slate-50">
                            <td className="px-4 py-2">
                              <input type="text" value={prestasi.lomba} onChange={(e) => updatePrestasi(index, 'lomba', e.target.value)} className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1" placeholder="Cth: OSN Matematika" />
                            </td>
                            <td className="px-4 py-2">
                              <input type="text" value={prestasi.bidang} onChange={(e) => updatePrestasi(index, 'bidang', e.target.value)} className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1" placeholder="Akademik" />
                            </td>
                            <td className="px-4 py-2">
                              <input type="text" value={prestasi.penyelenggara} onChange={(e) => updatePrestasi(index, 'penyelenggara', e.target.value)} className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1" placeholder="Kemdikbud" />
                            </td>
                            <td className="px-4 py-2">
                              <select value={prestasi.tingkat} onChange={(e) => updatePrestasi(index, 'tingkat', e.target.value)} className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1 text-slate-700">
                                <option value="">Pilih Tingkat</option>
                                <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                                <option value="Provinsi">Provinsi</option>
                                <option value="Nasional">Nasional</option>
                                <option value="Internasional">Internasional</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <input type="text" value={prestasi.prestasi} onChange={(e) => updatePrestasi(index, 'prestasi', e.target.value)} className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1" placeholder="Juara 1" />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button onClick={() => removePrestasi(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                <Trash2 className="w-5 h-5 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>


            </motion.div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-between items-center rounded-b-3xl">
        <button
          onClick={prevStep}
          disabled={currentStep === 0 || isLoading}
          className={`btn flex items-center gap-2 font-bold px-6 py-2.5 rounded-xl transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        >
          <ChevronLeft className="w-5 h-5" />
          Sebelumnya
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={nextStep}
            disabled={currentStep === 3 && (!documents.kk || !documents.akta || !documents.foto || !documents.ijazah)}
            className={`btn flex items-center gap-2 font-bold px-8 py-2.5 rounded-xl shadow-lg transition-all ${currentStep === 3 && (!documents.kk || !documents.akta || !documents.foto || !documents.ijazah)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-primary-600 text-white hover:shadow-xl hover:bg-primary-700 hover:-translate-y-0.5'
              }`}
          >
            Selanjutnya
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn flex items-center gap-2 font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-green-500/30 bg-green-500 hover:bg-green-600 text-white transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait"
          >
            {isLoading ? <AlertCircle className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Simpan Formulir
          </button>
        )}
      </div>
    </div>
  );
};

export default RegistrationWizard;
