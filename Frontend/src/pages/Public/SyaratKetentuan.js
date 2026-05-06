import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

const SyaratKetentuan = () => {
  const syarat = [
    { num: '1', title: 'Batas Usia', text: 'Pendaftar maksimal berusia 15 tahun per 1 Juli 2026 (lahir setelah 1 Juli 2011).' },
    { num: '2', title: 'Formulir Online', text: 'Mengisi Formulir Pendaftaran Online secara lengkap:', sub: ['Data Diri Calon Siswa', 'Data Orang Tua / Wali'] },
    { num: '3', title: 'Upload Berkas', text: 'Mengupload Scan / Foto Berkas yang jelas dan terbaca:', sub: ['Kartu Keluarga (KK)', 'Akta Kelahiran'] },
    { num: '4', title: 'Pas Foto', text: 'Pas Foto berwarna menggunakan seragam SD/MI. Perempuan wajib berkerudung putih.' },
    { num: '5', title: 'Asal Sekolah', text: 'Lulusan SD/MI atau sederajat yang memiliki ijazah/SKL.' },
  ];

  const ketentuan = [
    'Setiap calon siswa hanya diperbolehkan mendaftar satu kali.',
    'Data yang diisi harus sesuai dengan dokumen resmi (KK, Akta, dll).',
    'Berkas yang diunggah harus terbaca jelas dan tidak buram.',
    'Pendaftaran yang tidak lengkap akan otomatis dinyatakan gugur.',
    'Keputusan panitia PPDB bersifat final dan tidak dapat diganggu gugat.',
    'Seluruh proses pendaftaran tidak dipungut biaya (GRATIS).',
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary-900 via-primary-800 to-emerald-900 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-primary-200 text-sm font-bold mb-6">
              <FileText className="w-4 h-4" /> Syarat & Ketentuan
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-6">
              Persyaratan <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-emerald-300">PPDB 2026</span>
            </h1>
            <p className="text-primary-200 text-lg max-w-2xl mx-auto">Baca dan pahami seluruh syarat sebelum mengisi formulir pendaftaran.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Dokumen yang Diperlukan</h2>
          <div className="space-y-5">
            {syarat.map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className="flex gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all group">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-700 text-white rounded-2xl flex items-center justify-center font-black text-lg">{item.num}</div>
                <div className="flex-1">
                  <h4 className="text-lg font-black text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-slate-600 text-sm mb-3">{item.text}</p>
                  {item.sub && (
                    <div className="flex flex-wrap gap-2">
                      {item.sub.map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Ketentuan Pendaftaran</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {ketentuan.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700 text-sm font-medium">{item}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 text-sm leading-relaxed">Pastikan semua berkas terbaca jelas. Pemalsuan dokumen dapat mengakibatkan diskualifikasi dari proses seleksi.</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h3 className="text-3xl font-black mb-4">Siap Mendaftar?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-primary-900 px-8 py-4 rounded-2xl font-black text-lg hover:bg-primary-50 transition-colors">
              Daftar Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/alur-pendaftaran" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-white/10 transition-colors">
              Lihat Alur Pendaftaran
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SyaratKetentuan;
