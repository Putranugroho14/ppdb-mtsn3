import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, MapPin, Info, Users, ShieldCheck, 
  ChevronRight, ChevronLeft, Save, CheckCircle, 
  AlertCircle, ClipboardCheck, Home, Truck, 
  Activity, BookOpen, Heart, Loader2
} from 'lucide-react';
import API from '../services/api';
import { mapErrorMessage } from '../utils/errorMapper';
import { X } from 'lucide-react';

const Input = ({ label, name, value, onChange, type = "text", placeholder, required, disabled, error }) => (
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
      disabled={disabled}
      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-700 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
    />
  </div>
);

const Select = ({ label, name, value, onChange, options, required, disabled, error }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
      {label} {error && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-700 disabled:bg-slate-50"
    >
      {options.map((opt, i) => (
        <option key={i} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const DaftarUlangWizard = ({ pendaftarId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [formData, setFormData] = useState({
    pendaftarId: pendaftarId,
    jumlahSaudara: 0,
    anakKe: 1,
    noKIP: '',
    noKKS: '',
    noPKH: '',
    hobi: '',
    citaCita: '',
    statusTempatTinggal: 'TINGGAL DENGAN ORANG TUA',
    estimasiJarak: '',
    estimasiWaktu: '',
    lat: '',
    lng: '',
    kebutuhanKhusus: 'TIDAK ADA',
    praSekolah: 'TIDAK PERNAH',
    disabilitas: 'TIDAK ADA',
    imunisasi: 'LENGKAP',
    yangMembiayai: 'ORANG TUA',
    transportasiKeSekolah: 'JALAN KAKI',
    alamatSekolahAsal: '',
    keberadaanAyah: 'MASIH ADA',
    nikAyah: '',
    namaAyah: '',
    tempatLahirAyah: '',
    tglLahirAyah: '',
    pendidikanAyah: 'SMA/SEDERAJAT',
    pekerjaanAyah: 'WIRASWASTA',
    penghasilanAyah: '1.000.000 - 2.000.000',
    hpAyah: '',
    keberadaanIbu: 'MASIH ADA',
    nikIbu: '',
    namaIbu: '',
    tempatLahirIbu: '',
    tglLahirIbu: '',
    pendidikanIbu: 'SMA/SEDERAJAT',
    pekerjaanIbu: 'URUSAN RUMAH TANGGA',
    penghasilanIbu: 'TIDAK ADA',
    hpIbu: '',
    waliType: '',
    nikWali: '',
    namaWali: '',
    pendidikanWali: '',
    pekerjaanWali: '',
    penghasilanWali: '',
    hpWali: ''
  });

  useEffect(() => {
    fetchExistingData();
  }, [pendaftarId]);

  const fetchExistingData = async () => {
    try {
      const { data } = await API.get(`/user/profile`);
      setFormData(prev => {
        const newData = { ...prev };
        // Pre-populate parent data from primary profile if available
        if (data.ayahNik) newData.nikAyah = data.ayahNik;
        if (data.parentName) newData.namaAyah = data.parentName;
        if (data.parentPhone) newData.hpAyah = data.parentPhone;
        if (data.ibuNik) newData.nikIbu = data.ibuNik;
        if (data.ibuNama) newData.namaIbu = data.ibuNama;

        // If e-MIS data already exists, merge it (overrides pre-populated data with explicitly saved e-MIS data)
        if (data.DaftarUlang) {
          return { ...newData, ...data.DaftarUlang };
        }
        return newData;
      });
    } catch (err) {
      console.error('Error fetching existing re-registration data', err);
    }
  };

  const steps = [
    { id: 'siswa', label: 'Data Siswa', icon: User },
    { id: 'alamat', label: 'Alamat & Koordinat', icon: MapPin },
    { id: 'info', label: 'Informasi e-MIS', icon: Info },
    { id: 'orangtua', label: 'Orang Tua', icon: Users },
    { id: 'konfirmasi', label: 'Konfirmasi', icon: ShieldCheck },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Ketika pilih Wali = Ayah/Ibu Kandung → salin data ke field wali
  const handleWaliTypeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => {
      const updates = { waliType: value };
      if (value === 'Ayah Kandung') {
        updates.nikWali        = prev.nikAyah;
        updates.namaWali       = prev.namaAyah;
        updates.pendidikanWali = prev.pendidikanAyah;
        updates.pekerjaanWali  = prev.pekerjaanAyah;
        updates.penghasilanWali= prev.penghasilanAyah;
        updates.hpWali         = prev.hpAyah;
      } else if (value === 'Ibu Kandung') {
        updates.nikWali        = prev.nikIbu;
        updates.namaWali       = prev.namaIbu;
        updates.pendidikanWali = prev.pendidikanIbu;
        updates.pekerjaanWali  = prev.pekerjaanIbu;
        updates.penghasilanWali= prev.penghasilanIbu;
        updates.hpWali         = prev.hpIbu;
      } else if (value === '') {
        // Reset wali fields when 'Orang Lain / Kosong' dipilih
        updates.nikWali = ''; updates.namaWali = '';
        updates.pendidikanWali = ''; updates.pekerjaanWali = '';
        updates.penghasilanWali = ''; updates.hpWali = '';
      }
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const payload = { ...formData };
      
      // Sanitize dates (Backend expects DATEONLY)
      if (!payload.tglLahirAyah) {
        payload.tglLahirAyah = null;
      }

      if (!payload.tglLahirIbu) {
        payload.tglLahirIbu = null;
      }

      // Sanitize integers
      payload.jumlahSaudara = payload.jumlahSaudara === '' ? 0 : parseInt(payload.jumlahSaudara, 10);
      payload.anakKe = payload.anakKe === '' ? 1 : parseInt(payload.anakKe, 10);

      await API.post('/user/daftar-ulang', payload);
      setSuccess('Data Daftar Ulang e-MIS berhasil disimpan!');
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);
    } catch (err) {
      setError(mapErrorMessage(err));
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 text-white flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
          <ClipboardCheck className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black">Formulir e-MIS Daftar Ulang</h2>
          <p className="text-green-100 text-sm">Lengkapi data lanjutan untuk pendataan nasional.</p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Progress Tracker */}
        <div className="flex justify-between mb-10 overflow-x-auto pb-4 hide-scrollbar">
          {steps.map((step, idx) => (
            <div key={step.id} className={`flex flex-col items-center gap-2 min-w-[80px] ${idx <= currentStep ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border-2 transition-all duration-300 ${idx === currentStep ? 'bg-green-600 border-green-200 text-white shadow-lg' : idx < currentStep ? 'bg-green-100 border-green-200 text-green-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                {idx < currentStep ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className="text-[10px] font-bold text-center uppercase tracking-wider">{step.label}</span>
            </div>
          ))}
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
                <button onClick={() => setShowErrorModal(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all text-center">Tutup</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100 animate-shake">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-2xl flex items-center gap-3 border border-green-100">
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm font-bold">{success}</p>
          </div>
        )}

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Anak Ke-" name="anakKe" type="number" value={formData.anakKe} onChange={handleChange} required />
                  <Input label="Jumlah Saudara Kandung" name="jumlahSaudara" type="number" value={formData.jumlahSaudara} onChange={handleChange} required />
                  <Input label="Nomor KIP (Kartu Indonesia Pintar)" name="noKIP" value={formData.noKIP} onChange={handleChange} placeholder="--- (Jika Ada)" />
                  <Input label="Nomor KKS (Kartu Keluarga Sejahtera)" name="noKKS" value={formData.noKKS} onChange={handleChange} placeholder="--- (Jika Ada)" />
                  <Input label="Nomor PKH" name="noPKH" value={formData.noPKH} onChange={handleChange} placeholder="--- (Jika Ada)" />
                  <Input label="Hobi" name="hobi" value={formData.hobi} onChange={handleChange} placeholder="Contoh: Membaca, Olahraga" required />
                  <Input label="Cita-cita" name="citaCita" value={formData.citaCita} onChange={handleChange} placeholder="Contoh: Dokter, Guru" required />
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select label="Status Tempat Tinggal" name="statusTempatTinggal" value={formData.statusTempatTinggal} onChange={handleChange} options={[
                    { value: 'TINGGAL DENGAN ORANG TUA', label: 'Tinggal Dengan Orang Tua' },
                    { value: 'TINGGAL DENGAN WALI', label: 'Tinggal Dengan Wali' },
                    { value: 'MENGONTRAK / KOS', label: 'Mengontrak / Kos' },
                    { value: 'PANTI ASUHAN', label: 'Panti Asuhan' },
                    { value: 'LAINNYA', label: 'Lainnya' }
                  ]} />
                  <Input label="Estimasi Jarak ke Sekolah (KM)" name="estimasiJarak" value={formData.estimasiJarak} onChange={handleChange} placeholder="Contoh: 1.5 KM" />
                  <Input label="Estimasi Waktu Tempuh (Menit)" name="estimasiWaktu" value={formData.estimasiWaktu} onChange={handleChange} placeholder="Contoh: 15 Menit" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Latitude (Letak Rumah)" name="lat" value={formData.lat} onChange={handleChange} placeholder="-0.12345" />
                    <Input label="Longitude (Letak Rumah)" name="lng" value={formData.lng} onChange={handleChange} placeholder="109.12345" />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <Select label="Pernah Sekolah Pra-Sekolah?" name="praSekolah" value={formData.praSekolah} onChange={handleChange} options={[
                    { value: 'TIDAK PERNAH', label: 'Tidak Pernah' },
                    { value: 'TK / RA', label: 'TK / RA' },
                    { value: 'PAUD', label: 'PAUD' },
                    { value: 'KEDUANYA', label: 'TK & PAUD' }
                  ]} />
                  <Select label="Status Disabilitas" name="disabilitas" value={formData.disabilitas} onChange={handleChange} options={[
                    { value: 'TIDAK ADA', label: 'Tidak Ada' },
                    { value: 'TUNA RUNGU', label: 'Tuna Rungu' },
                    { value: 'TUNA NETRA', label: 'Tuna Netra' },
                    { value: 'TUNA DAKSA', label: 'Tuna Daksa' },
                    { value: 'LAINNYA', label: 'Lainnya' }
                  ]} />
                  <Select label="Status Imunisasi" name="imunisasi" value={formData.imunisasi} onChange={handleChange} options={[
                    { value: 'LENGKAP', label: 'Lengkap' },
                    { value: 'BELUM LENGKAP', label: 'Belum Lengkap' },
                    { value: 'TIDAK PERNAH', label: 'Tidak Pernah' }
                  ]} />
                  <Select label="Moda Transportasi" name="transportasiKeSekolah" value={formData.transportasiKeSekolah} onChange={handleChange} options={[
                    { value: 'JALAN KAKI', label: 'Jalan Kaki' },
                    { value: 'SEPEDA MOTOR', label: 'Sepeda Motor' },
                    { value: 'ANTAR JEMPUT', label: 'Antar Jemput Sekolah' },
                    { value: 'ANGKUTAN UMUM', label: 'Angkutan Umum' }
                  ]} />
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 block mb-2">Alamat Lengkap Sekolah Asal</label>
                    <textarea name="alamatSekolahAsal" value={formData.alamatSekolahAsal} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-700 min-h-[100px]" placeholder="Masukkan alamat lengkap sekolah sebelumnya..."></textarea>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">Data Ayah Kandung</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select label="Keberadaan Ayah" name="keberadaanAyah" value={formData.keberadaanAyah} onChange={handleChange} options={[
                      { value: 'MASIH ADA', label: 'Masih Ada' },
                      { value: 'MENINGGAL DUNIA', label: 'Meninggal Dunia' },
                      { value: 'TIDAK DIKETAHUI', label: 'Tidak Diketahui' }
                    ]} />
                    <Input label="NIK Ayah" name="nikAyah" value={formData.nikAyah} onChange={handleChange} maxLength={16} />
                    <Input label="Nama Lengkap Ayah" name="namaAyah" value={formData.namaAyah} onChange={handleChange} />
                    <Input label="Tempat Lahir Ayah" name="tempatLahirAyah" value={formData.tempatLahirAyah} onChange={handleChange} placeholder="Contoh: Sanggau" />
                    <Input label="Tanggal Lahir Ayah" name="tglLahirAyah" type="date" value={formData.tglLahirAyah} onChange={handleChange} />
                    <Select label="Pendidikan Terakhir Ayah" name="pendidikanAyah" value={formData.pendidikanAyah} onChange={handleChange} options={[
                      { value: 'TIDAK SEKOLAH', label: 'Tidak Sekolah' },
                      { value: 'SD/SEDERAJAT', label: 'SD / Sederajat' },
                      { value: 'SMP/SEDERAJAT', label: 'SMP / Sederajat' },
                      { value: 'SMA/SEDERAJAT', label: 'SMA / Sederajat' },
                      { value: 'D1/D2/D3', label: 'D1 / D2 / D3' },
                      { value: 'S1', label: 'S1 / Sarjana' },
                      { value: 'S2', label: 'S2 / Magister' },
                      { value: 'S3', label: 'S3 / Doktoral' }
                    ]} />
                    <Select label="Pekerjaan Utama" name="pekerjaanAyah" value={formData.pekerjaanAyah} onChange={handleChange} options={[
                      { value: 'WIRASWASTA', label: 'Wiraswasta' },
                      { value: 'KARYAWAN SWASTA', label: 'Karyawan Swasta' },
                      { value: 'PNS/TNI/POLRI', label: 'PNS / TNI / POLRI' },
                      { value: 'PETANI', label: 'Petani' },
                      { value: 'PEDAGANG', label: 'Pedagang' },
                      { value: 'BURUH', label: 'Buruh' },
                      { value: 'PENSIUNAN', label: 'Pensiunan' },
                      { value: 'TIDAK BEKERJA', label: 'Tidak Bekerja' },
                      { value: 'LAINNYA', label: 'Lainnya' }
                    ]} />
                    <Select label="Penghasilan Rata-rata" name="penghasilanAyah" value={formData.penghasilanAyah} onChange={handleChange} options={[
                      { value: 'TIDAK ADA', label: 'Tidak Ada Penghasilan' },
                      { value: 'KURA DARI 500.000', label: 'Kurang dari 500.000' },
                      { value: '500.000 - 1.000.000', label: '500.000 - 1.000.000' },
                      { value: '1.000.000 - 2.000.000', label: '1.000.000 - 2.000.000' },
                      { value: 'DI ATAS 2.000.000', label: 'Di Atas 2.000.000' }
                    ]} />
                    <Input label="Nomor HP/WA Ayah" name="hpAyah" value={formData.hpAyah} onChange={handleChange} maxLength={14} minLength={10} pattern="^(08|628)\d{8,12}$" title="Nomor HP harus diawali 08 atau 628 dan berjumlah 10-14 digit" placeholder="08..." error={fieldErrors.hpAyah} />
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">Data Ibu Kandung</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select label="Keberadaan Ibu" name="keberadaanIbu" value={formData.keberadaanIbu} onChange={handleChange} options={[
                      { value: 'MASIH ADA', label: 'Masih Ada' },
                      { value: 'MENINGGAL DUNIA', label: 'Meninggal Dunia' }
                    ]} />
                    <Input label="NIK Ibu" name="nikIbu" value={formData.nikIbu} onChange={handleChange} maxLength={16} />
                    <Input label="Nama Lengkap Ibu" name="namaIbu" value={formData.namaIbu} onChange={handleChange} />
                    <Input label="Tempat Lahir Ibu" name="tempatLahirIbu" value={formData.tempatLahirIbu} onChange={handleChange} placeholder="Contoh: Sanggau" />
                    <Input label="Tanggal Lahir Ibu" name="tglLahirIbu" type="date" value={formData.tglLahirIbu} onChange={handleChange} />
                    <Select label="Pendidikan Terakhir Ibu" name="pendidikanIbu" value={formData.pendidikanIbu} onChange={handleChange} options={[
                      { value: 'TIDAK SEKOLAH', label: 'Tidak Sekolah' },
                      { value: 'SD/SEDERAJAT', label: 'SD / Sederajat' },
                      { value: 'SMP/SEDERAJAT', label: 'SMP / Sederajat' },
                      { value: 'SMA/SEDERAJAT', label: 'SMA / Sederajat' },
                      { value: 'D1/D2/D3', label: 'D1 / D2 / D3' },
                      { value: 'S1', label: 'S1 / Sarjana' },
                      { value: 'S2', label: 'S2 / Magister' },
                      { value: 'S3', label: 'S3 / Doktoral' }
                    ]} />
                    <Select label="Pekerjaan Ibu" name="pekerjaanIbu" value={formData.pekerjaanIbu} onChange={handleChange} options={[
                      { value: 'URUSAN RUMAH TANGGA', label: 'Ibu Rumah Tangga' },
                      { value: 'WIRASWASTA', label: 'Wiraswasta' },
                      { value: 'KARYAWAN SWASTA', label: 'Karyawan Swasta' },
                      { value: 'PNS/TNI/POLRI', label: 'PNS / TNI / POLRI' },
                      { value: 'PETANI', label: 'Petani' },
                      { value: 'PEDAGANG', label: 'Pedagang' },
                      { value: 'BURUH', label: 'Buruh' },
                      { value: 'PENSIUNAN', label: 'Pensiunan' },
                      { value: 'LAINNYA', label: 'Lainnya' }
                    ]} />
                    <Input label="Nomor HP/WA Ibu" name="hpIbu" value={formData.hpIbu} onChange={handleChange} maxLength={14} minLength={10} pattern="^(08|628)\d{8,12}$" title="Nomor HP harus diawali 08 atau 628 dan berjumlah 10-14 digit" placeholder="08..." error={fieldErrors.hpIbu} />
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">Data Wali (Kosongkan jika tidak ada)</h4>

                  {/* Auto-fill selector */}
                  <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <label className="text-sm font-bold text-amber-800 block mb-2">⚡ Wali Calon Siswa Adalah:</label>
                    <select
                      value={formData.waliType || ''}
                      onChange={handleWaliTypeChange}
                      className="w-full px-4 py-2.5 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 outline-none transition-all text-slate-700 font-semibold"
                    >
                      <option value="">-- Wali Lain (Isi manual) --</option>
                      <option value="Ayah Kandung">Ayah Kandung (salin data ayah)</option>
                      <option value="Ibu Kandung">Ibu Kandung (salin data ibu)</option>
                    </select>
                    {formData.waliType && (
                      <p className="text-xs text-amber-700 mt-2 font-medium">✓ Data {formData.waliType} telah disalin. Anda tetap bisa mengubah field di bawah.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="NIK Wali" name="nikWali" value={formData.nikWali} onChange={handleChange} maxLength={16} placeholder="Opsional" />
                    <Input label="Nama Lengkap Wali" name="namaWali" value={formData.namaWali} onChange={handleChange} placeholder="Opsional" />
                    <Select label="Pendidikan Terakhir Wali" name="pendidikanWali" value={formData.pendidikanWali} onChange={handleChange} options={[
                      { value: '', label: '-- Pilih --' },
                      { value: 'TIDAK SEKOLAH', label: 'Tidak Sekolah' },
                      { value: 'SD/SEDERAJAT', label: 'SD / Sederajat' },
                      { value: 'SMP/SEDERAJAT', label: 'SMP / Sederajat' },
                      { value: 'SMA/SEDERAJAT', label: 'SMA / Sederajat' },
                      { value: 'D1/D2/D3', label: 'D1 / D2 / D3' },
                      { value: 'S1', label: 'S1 / Sarjana' },
                      { value: 'S2', label: 'S2 / Magister' },
                      { value: 'S3', label: 'S3 / Doktoral' }
                    ]} />
                    <Select label="Pekerjaan Wali" name="pekerjaanWali" value={formData.pekerjaanWali} onChange={handleChange} options={[
                      { value: '', label: '-- Pilih --' },
                      { value: 'WIRASWASTA', label: 'Wiraswasta' },
                      { value: 'KARYAWAN SWASTA', label: 'Karyawan Swasta' },
                      { value: 'PNS/TNI/POLRI', label: 'PNS / TNI / POLRI' },
                      { value: 'PETANI', label: 'Petani' },
                      { value: 'PEDAGANG', label: 'Pedagang' },
                      { value: 'BURUH', label: 'Buruh' },
                      { value: 'PENSIUNAN', label: 'Pensiunan' },
                      { value: 'LAINNYA', label: 'Lainnya' }
                    ]} />
                    <Select label="Penghasilan Rata-rata Wali" name="penghasilanWali" value={formData.penghasilanWali} onChange={handleChange} options={[
                      { value: '', label: '-- Pilih --' },
                      { value: 'TIDAK ADA', label: 'Tidak Ada Penghasilan' },
                      { value: 'KURA DARI 500.000', label: 'Kurang dari 500.000' },
                      { value: '500.000 - 1.000.000', label: '500.000 - 1.000.000' },
                      { value: '1.000.000 - 2.000.000', label: '1.000.000 - 2.000.000' },
                      { value: 'DI ATAS 2.000.000', label: 'Di Atas 2.000.000' }
                    ]} />
                    <Input label="Nomor HP/WA Wali" name="hpWali" value={formData.hpWali} onChange={handleChange} maxLength={14} minLength={10} pattern="^(08|628)\d{8,12}$" title="Nomor HP harus diawali 08 atau 628 dan berjumlah 10-14 digit" placeholder="08..." error={fieldErrors.hpWali} />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center py-10 space-y-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Semua Data Sudah Terisi</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">Pastikan kembali data e-MIS yang Anda masukkan sudah benar sesuai dengan dokumen asli (KK/Akta).</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-700 text-xs font-medium border border-blue-100 max-w-sm mx-auto">
                  Data ini akan dikirimkan ke Panitia PPDB untuk proses sinkronisasi database sekolah.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Buttons */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between gap-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 0 || isLoading}
            className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <ChevronLeft className="w-5 h-5" /> Sebelumnya
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-3 font-bold rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
            >
              Selanjutnya <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-3 font-bold rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Simpan Data e-MIS
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DaftarUlangWizard;
