import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, MapPin, Info, Users, ShieldCheck,
  ChevronRight, ChevronLeft, Save, CheckCircle,
  AlertCircle, ClipboardCheck, Loader2
} from 'lucide-react';
import API from '../services/api';
import { mapErrorMessage } from '../utils/errorMapper';

const Input = ({ label, name, value, onChange, type = "text", placeholder, disabled, error }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-slate-700">{label}</label>
    <input type={type} name={name} value={value || ''} onChange={onChange}
      placeholder={placeholder} disabled={disabled}
      className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 placeholder:text-slate-400 disabled:bg-slate-50 ${error ? 'border-red-400' : 'border-slate-300'}`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const Select = ({ label, name, value, onChange, options, disabled }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-slate-700">{label}</label>
    <select name={name} value={value || ''} onChange={onChange} disabled={disabled}
      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 disabled:bg-slate-50"
    >
      {options.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const STEPS = [
  { id: 'siswa', label: 'Data Siswa', icon: User },
  { id: 'alamat', label: 'Alamat', icon: MapPin },
  { id: 'info', label: 'Info e-MIS', icon: Info },
  { id: 'orangtua', label: 'Orang Tua', icon: Users },
  { id: 'konfirmasi', label: 'Konfirmasi', icon: ShieldCheck },
];

const EMPTY_FORM = {
  jumlahSaudara: 0, anakKe: 1, noKIP: '', noKKS: '', noPKH: '',
  hobi: '', citaCita: '',
  statusTempatTinggal: 'TINGGAL DENGAN ORANG TUA',
  estimasiJarak: '', estimasiWaktu: '', lat: '', lng: '',
  kebutuhanKhusus: 'TIDAK ADA', praSekolah: 'TIDAK PERNAH',
  disabilitas: 'TIDAK ADA', imunisasi: 'LENGKAP',
  yangMembiayai: 'ORANG TUA', transportasiKeSekolah: 'JALAN KAKI',
  alamatSekolahAsal: '',
  keberadaanAyah: 'MASIH ADA', nikAyah: '', namaAyah: '',
  tempatLahirAyah: '', tglLahirAyah: '',
  pendidikanAyah: 'SMA/SEDERAJAT', pekerjaanAyah: 'WIRASWASTA',
  penghasilanAyah: '1.000.000 - 2.000.000', hpAyah: '',
  keberadaanIbu: 'MASIH ADA', nikIbu: '', namaIbu: '',
  tempatLahirIbu: '', tglLahirIbu: '',
  pendidikanIbu: 'SMA/SEDERAJAT', pekerjaanIbu: 'URUSAN RUMAH TANGGA',
  penghasilanIbu: 'TIDAK ADA', hpIbu: '',
  nikWali: '', namaWali: '', pendidikanWali: '',
  pekerjaanWali: '', penghasilanWali: '', hpWali: ''
};

const AdminEmisModal = ({ isOpen, onClose, applicant, onRefresh }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    if (isOpen && applicant?.id) {
      setStep(0);
      setError('');
      setSuccess('');
      fetchData();
    }
  }, [isOpen, applicant]);

  const fetchData = async () => {
    setFetching(true);
    try {
      const { data } = await API.get(`/admin/emis-data/${applicant.id}`);
      const base = { ...EMPTY_FORM };
      // Pre-fill from pendaftar profile
      if (data.ayahNik) base.nikAyah = data.ayahNik;
      if (data.parentName) base.namaAyah = data.parentName;
      if (data.parentPhone) base.hpAyah = data.parentPhone;
      if (data.ibuNik) base.nikIbu = data.ibuNik;
      if (data.ibuNama) base.namaIbu = data.ibuNama;
      // Override with saved e-MIS data if exists
      if (data.DaftarUlang) {
        setFormData({ ...base, ...data.DaftarUlang });
      } else {
        setFormData(base);
      }
    } catch (err) {
      setFormData({ ...EMPTY_FORM });
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData };
      if (!payload.tglLahirAyah) payload.tglLahirAyah = null;
      if (!payload.tglLahirIbu) payload.tglLahirIbu = null;
      payload.jumlahSaudara = parseInt(payload.jumlahSaudara, 10) || 0;
      payload.anakKe = parseInt(payload.anakKe, 10) || 1;

      await API.post(`/admin/emis-data/${applicant.id}`, payload);
      setSuccess('Data e-MIS berhasil disimpan!');
      if (onRefresh) onRefresh();
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(mapErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl"><ClipboardCheck className="w-6 h-6" /></div>
            <div>
              <h2 className="text-base font-black">Input e-MIS: {applicant?.name}</h2>
              <p className="text-blue-200 text-xs">No. {applicant?.registrationNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex gap-2 overflow-x-auto shrink-0">
          {STEPS.map((s, idx) => (
            <button key={s.id} onClick={() => setStep(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${idx === step ? 'bg-blue-600 text-white shadow-sm' : idx < step ? 'bg-blue-100 text-blue-700' : 'text-slate-400'}`}
            >
              {idx < step ? <CheckCircle className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {fetching ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-slate-500 font-medium">Memuat data...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* STEP 0 - Data Siswa */}
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Anak Ke-" name="anakKe" type="number" value={formData.anakKe} onChange={handleChange} />
                  <Input label="Jumlah Saudara Kandung" name="jumlahSaudara" type="number" value={formData.jumlahSaudara} onChange={handleChange} />
                  <Input label="Nomor KIP" name="noKIP" value={formData.noKIP} onChange={handleChange} placeholder="Jika ada" />
                  <Input label="Nomor KKS" name="noKKS" value={formData.noKKS} onChange={handleChange} placeholder="Jika ada" />
                  <Input label="Nomor PKH" name="noPKH" value={formData.noPKH} onChange={handleChange} placeholder="Jika ada" />
                  <Input label="Hobi" name="hobi" value={formData.hobi} onChange={handleChange} placeholder="Membaca, Olahraga..." />
                  <Input label="Cita-cita" name="citaCita" value={formData.citaCita} onChange={handleChange} placeholder="Dokter, Guru..." />
                </motion.div>
              )}

              {/* STEP 1 - Alamat */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Select label="Status Tempat Tinggal" name="statusTempatTinggal" value={formData.statusTempatTinggal} onChange={handleChange} options={[
                    { value: 'TINGGAL DENGAN ORANG TUA', label: 'Tinggal Dengan Orang Tua' },
                    { value: 'TINGGAL DENGAN WALI', label: 'Tinggal Dengan Wali' },
                    { value: 'MENGONTRAK / KOS', label: 'Mengontrak / Kos' },
                    { value: 'PANTI ASUHAN', label: 'Panti Asuhan' },
                    { value: 'LAINNYA', label: 'Lainnya' }
                  ]} />
                  <Select label="Transportasi ke Sekolah" name="transportasiKeSekolah" value={formData.transportasiKeSekolah} onChange={handleChange} options={[
                    { value: 'JALAN KAKI', label: 'Jalan Kaki' },
                    { value: 'SEPEDA MOTOR', label: 'Sepeda Motor' },
                    { value: 'ANTAR JEMPUT', label: 'Antar Jemput Sekolah' },
                    { value: 'ANGKUTAN UMUM', label: 'Angkutan Umum' }
                  ]} />
                  <Input label="Estimasi Jarak (KM)" name="estimasiJarak" value={formData.estimasiJarak} onChange={handleChange} placeholder="1.5" />
                  <Input label="Estimasi Waktu (Menit)" name="estimasiWaktu" value={formData.estimasiWaktu} onChange={handleChange} placeholder="15" />
                  <Input label="Latitude" name="lat" value={formData.lat} onChange={handleChange} placeholder="-0.12345" />
                  <Input label="Longitude" name="lng" value={formData.lng} onChange={handleChange} placeholder="109.12345" />
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 block mb-1.5">Alamat Sekolah Asal</label>
                    <textarea name="alamatSekolahAsal" value={formData.alamatSekolahAsal} onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-700 min-h-[80px]"
                      placeholder="Alamat lengkap sekolah asal..." />
                  </div>
                </motion.div>
              )}

              {/* STEP 2 - Info e-MIS */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Select label="Pra Sekolah" name="praSekolah" value={formData.praSekolah} onChange={handleChange} options={[
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
                  <Select label="Yang Membiayai" name="yangMembiayai" value={formData.yangMembiayai} onChange={handleChange} options={[
                    { value: 'ORANG TUA', label: 'Orang Tua' },
                    { value: 'WALI', label: 'Wali' },
                    { value: 'BEASISWA', label: 'Beasiswa' },
                    { value: 'PEMERINTAH', label: 'Pemerintah' }
                  ]} />
                </motion.div>
              )}

              {/* STEP 3 - Orang Tua */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-4 text-sm uppercase tracking-wider">Data Ayah Kandung</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select label="Keberadaan Ayah" name="keberadaanAyah" value={formData.keberadaanAyah} onChange={handleChange} options={[
                        { value: 'MASIH ADA', label: 'Masih Ada' },
                        { value: 'MENINGGAL DUNIA', label: 'Meninggal Dunia' },
                        { value: 'TIDAK DIKETAHUI', label: 'Tidak Diketahui' }
                      ]} />
                      <Input label="NIK Ayah" name="nikAyah" value={formData.nikAyah} onChange={handleChange} maxLength={16} />
                      <Input label="Nama Ayah" name="namaAyah" value={formData.namaAyah} onChange={handleChange} />
                      <Input label="Tempat Lahir Ayah" name="tempatLahirAyah" value={formData.tempatLahirAyah} onChange={handleChange} />
                      <Input label="Tgl Lahir Ayah" name="tglLahirAyah" type="date" value={formData.tglLahirAyah} onChange={handleChange} />
                      <Select label="Pendidikan Ayah" name="pendidikanAyah" value={formData.pendidikanAyah} onChange={handleChange} options={[
                        { value: 'TIDAK SEKOLAH', label: 'Tidak Sekolah' }, { value: 'SD/SEDERAJAT', label: 'SD/Sederajat' },
                        { value: 'SMP/SEDERAJAT', label: 'SMP/Sederajat' }, { value: 'SMA/SEDERAJAT', label: 'SMA/Sederajat' },
                        { value: 'D1/D2/D3', label: 'D1/D2/D3' }, { value: 'S1', label: 'S1' }, { value: 'S2', label: 'S2' }
                      ]} />
                      <Select label="Pekerjaan Ayah" name="pekerjaanAyah" value={formData.pekerjaanAyah} onChange={handleChange} options={[
                        { value: 'WIRASWASTA', label: 'Wiraswasta' }, { value: 'KARYAWAN SWASTA', label: 'Karyawan Swasta' },
                        { value: 'PNS/TNI/POLRI', label: 'PNS/TNI/POLRI' }, { value: 'PETANI', label: 'Petani' },
                        { value: 'PEDAGANG', label: 'Pedagang' }, { value: 'BURUH', label: 'Buruh' },
                        { value: 'TIDAK BEKERJA', label: 'Tidak Bekerja' }, { value: 'LAINNYA', label: 'Lainnya' }
                      ]} />
                      <Select label="Penghasilan Ayah" name="penghasilanAyah" value={formData.penghasilanAyah} onChange={handleChange} options={[
                        { value: 'TIDAK ADA', label: 'Tidak Ada' }, { value: 'KURA DARI 500.000', label: '< 500.000' },
                        { value: '500.000 - 1.000.000', label: '500K - 1Jt' }, { value: '1.000.000 - 2.000.000', label: '1Jt - 2Jt' },
                        { value: 'DI ATAS 2.000.000', label: '> 2.000.000' }
                      ]} />
                      <Input label="HP/WA Ayah" name="hpAyah" value={formData.hpAyah} onChange={handleChange} placeholder="08..." />
                    </div>
                  </div>

                  <div className="bg-pink-50 p-5 rounded-2xl border border-pink-100">
                    <h4 className="font-bold text-pink-900 mb-4 text-sm uppercase tracking-wider">Data Ibu Kandung</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select label="Keberadaan Ibu" name="keberadaanIbu" value={formData.keberadaanIbu} onChange={handleChange} options={[
                        { value: 'MASIH ADA', label: 'Masih Ada' }, { value: 'MENINGGAL DUNIA', label: 'Meninggal Dunia' }
                      ]} />
                      <Input label="NIK Ibu" name="nikIbu" value={formData.nikIbu} onChange={handleChange} maxLength={16} />
                      <Input label="Nama Ibu" name="namaIbu" value={formData.namaIbu} onChange={handleChange} />
                      <Input label="Tempat Lahir Ibu" name="tempatLahirIbu" value={formData.tempatLahirIbu} onChange={handleChange} />
                      <Input label="Tgl Lahir Ibu" name="tglLahirIbu" type="date" value={formData.tglLahirIbu} onChange={handleChange} />
                      <Select label="Pekerjaan Ibu" name="pekerjaanIbu" value={formData.pekerjaanIbu} onChange={handleChange} options={[
                        { value: 'URUSAN RUMAH TANGGA', label: 'Ibu Rumah Tangga' }, { value: 'WIRASWASTA', label: 'Wiraswasta' },
                        { value: 'KARYAWAN SWASTA', label: 'Karyawan Swasta' }, { value: 'PNS/TNI/POLRI', label: 'PNS/TNI/POLRI' },
                        { value: 'PETANI', label: 'Petani' }, { value: 'LAINNYA', label: 'Lainnya' }
                      ]} />
                      <Input label="HP/WA Ibu" name="hpIbu" value={formData.hpIbu} onChange={handleChange} placeholder="08..." />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 - Konfirmasi */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center py-10 space-y-6">
                  {success ? (
                    <>
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-black text-green-700">{success}</h3>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50">
                        <ShieldCheck className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Siap Disimpan</h3>
                      <p className="text-slate-500 max-w-sm mx-auto text-sm">Pastikan data e-MIS untuk <strong>{applicant?.name}</strong> sudah benar sebelum menyimpan.</p>
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {error}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-between items-center shrink-0">
          <button onClick={() => setStep(p => Math.max(p - 1, 0))} disabled={step === 0 || loading}
            className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl transition-all text-sm ${step === 0 ? 'opacity-0 pointer-events-none' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
          >
            <ChevronLeft className="w-4 h-4" /> Sebelumnya
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(p => Math.min(p + 1, STEPS.length - 1))}
              className="flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition-all text-sm"
            >
              Selanjutnya <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading || !!success}
              className="flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-lg transition-all text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Data e-MIS
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminEmisModal;
