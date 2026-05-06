import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import { motion } from 'framer-motion';
import { School, ShieldCheck, FileText, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

const AlurPendaftaran = () => {
  const steps = [
    { num: 1, title: 'Akses Website PMB', desc: 'Buka portal PPDB Online MTsN 3 Sanggau di browser Anda.', icon: School, color: 'bg-blue-100 text-blue-700' },
    { num: 2, title: 'Registrasi Akun', desc: 'Buat akun baru menggunakan email aktif yang dapat dihubungi.', icon: ShieldCheck, color: 'bg-purple-100 text-purple-700' },
    { num: 3, title: 'Login & Isi Formulir', desc: 'Masuk ke dashboard dan lengkapi Data Diri, Orang Tua, serta Upload Berkas.', icon: FileText, color: 'bg-emerald-100 text-emerald-700' },
    { num: 4, title: 'Cetak Bukti Pendaftaran', desc: 'Simpan dan cetak kartu tanda bukti pendaftaran sebagai arsip.', icon: ArrowRight, color: 'bg-orange-100 text-orange-700' },
    { num: 5, title: 'Cek Status Verifikasi', desc: 'Pantau hasil verifikasi berkas secara berkala melalui dashboard.', icon: Clock, color: 'bg-red-100 text-red-700' },
    { num: 6, title: 'Pengumuman Kelulusan', desc: 'Lihat hasil seleksi pada tanggal yang telah ditentukan panitia.', icon: CheckCircle2, color: 'bg-primary-100 text-primary-700' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary-900 via-primary-800 to-emerald-900 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-primary-200 text-sm font-bold mb-6">
              <ArrowRight className="w-4 h-4" /> Alur Pendaftaran
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-6">
              Alur & Prosedur <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-emerald-300">Pendaftaran</span>
            </h1>
            <p className="text-primary-200 text-lg max-w-2xl mx-auto">Ikuti langkah-langkah berikut untuk menyelesaikan proses pendaftaran PPDB dengan mudah.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-100 hidden md:block"></div>
            <div className="space-y-8">
              {steps.map((step, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                  className="relative flex gap-6 md:gap-10 items-start">
                  <div className={`flex-shrink-0 w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center shadow-sm relative z-10`}>
                    <step.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 pt-2 pb-6 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Langkah {step.num}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">{step.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-slate-900">Status Verifikasi</h2>
            <p className="text-slate-500 mt-2">Setelah mendaftar, pantau status verifikasi berkas Anda</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { status: 'Menunggu', color: 'bg-yellow-50 border-yellow-200 text-yellow-700', desc: 'Berkas sedang dalam antrian verifikasi panitia.' },
              { status: 'Diterima', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', desc: 'Berkas telah diverifikasi dan dinyatakan lolos seleksi administrasi.' },
              { status: 'Ditolak', color: 'bg-red-50 border-red-200 text-red-700', desc: 'Berkas tidak memenuhi syarat. Silakan hubungi panitia.' },
            ].map((item, i) => (
              <div key={i} className={`p-6 rounded-3xl border-2 ${item.color} text-center`}>
                <p className="font-black text-xl mb-2">{item.status}</p>
                <p className="text-sm leading-relaxed opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h3 className="text-3xl font-black mb-4">Mulai Pendaftaran Sekarang</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-primary-900 px-8 py-4 rounded-2xl font-black text-lg hover:bg-primary-50 transition-colors">
              Daftar Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/syarat-ketentuan" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-white/10 transition-colors">
              Lihat Syarat
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AlurPendaftaran;
