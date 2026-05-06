import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import { motion } from 'framer-motion';
import { Calendar, FileText, CheckCircle2, GraduationCap, School, Award, ArrowRight } from 'lucide-react';

import API from '../../services/api';

const JadwalPPDB = () => {
  const [setup, setSetup] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSetup = async () => {
      try {
        const { data } = await API.get('/public/setup');
        console.log('Jadwal Setup:', data);
        setSetup(data);
      } catch (err) {
        console.error('Error fetching setup', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSetup();
  }, []);

  const jadwal = setup ? [
    { date: setup.tanggalPendaftaran || 'TBA', year: setup.tahun, event: 'Pendaftaran Online', desc: 'Pendaftaran dibuka secara online melalui portal PPDB.', icon: FileText, status: 'aktif' },
    { date: setup.tanggalVerifikasi || 'TBA', year: setup.tahun, event: 'Verifikasi Berkas', desc: 'Panitia melakukan verifikasi berkas yang telah diunggah.', icon: CheckCircle2, status: 'akan-datang' },
    { date: setup.tanggalTest || 'TBA', year: setup.tahun, event: 'Tes Seleksi Mandiri', desc: 'Pelaksanaan tes seleksi akademik bagi calon siswa.', icon: Award, status: 'akan-datang' },
    { date: setup.tanggalPengumuman || 'TBA', year: setup.tahun, event: 'Pengumuman Kelulusan', desc: 'Hasil seleksi diumumkan melalui portal dan papan pengumuman.', icon: GraduationCap, status: 'akan-datang' },
    { date: setup.tanggalDaftarUlang || 'TBA', year: setup.tahun, event: 'Daftar Ulang Siswa', desc: 'Siswa yang lulus melakukan daftar ulang dan melengkapi data EMIS.', icon: School, status: 'akan-datang' },
  ] : [
    { date: '15 Feb - 30 Mar', year: '2026', event: 'Pendaftaran Online', desc: 'Pendaftaran dibuka secara online melalui portal PPDB.', icon: FileText, status: 'selesai' },
    { date: '01 - 05 April', year: '2026', event: 'Verifikasi Berkas', desc: 'Panitia melakukan verifikasi berkas yang telah diunggah.', icon: CheckCircle2, status: 'aktif' },
    { date: '10 April', year: '2026', event: 'Tes Seleksi Mandiri', desc: 'Pelaksanaan tes seleksi akademik bagi calon siswa.', icon: Award, status: 'akan-datang' },
    { date: '15 April', year: '2026', event: 'Pengumuman Kelulusan', desc: 'Hasil seleksi diumumkan melalui portal dan papan pengumuman.', icon: GraduationCap, status: 'akan-datang' },
    { date: '20 - 25 April', year: '2026', event: 'Daftar Ulang Siswa', desc: 'Siswa yang lulus melakukan daftar ulang dan melengkapi data EMIS.', icon: School, status: 'akan-datang' },
  ];

  const statusStyle = {
    selesai: 'bg-slate-100 text-slate-400',
    aktif: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
    'akan-datang': 'bg-primary-800 text-white',
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary-900 via-primary-800 to-emerald-900 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-primary-200 text-sm font-bold mb-6">
              <Calendar className="w-4 h-4" /> Jadwal PPDB
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-6">
              Jadwal <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-emerald-300">Pelaksanaan PPDB</span>
            </h1>
            <p className="text-primary-200 text-lg max-w-2xl mx-auto">Timeline lengkap proses penerimaan peserta didik baru MTsN 3 Sanggau Tahun Pelajaran 2026/2027.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-4">
            {jadwal.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-6 p-6 rounded-3xl border transition-all ${item.status === 'aktif' ? 'border-emerald-200 bg-emerald-50' : item.status === 'selesai' ? 'border-slate-100 bg-slate-50 opacity-60' : 'border-slate-100 bg-white shadow-sm hover:shadow-md'}`}>
                <div className={`flex-shrink-0 w-20 h-20 ${statusStyle[item.status]} rounded-2xl flex flex-col items-center justify-center`}>
                  <span className="text-[10px] font-black uppercase tracking-tighter leading-tight">{item.date}</span>
                  <span className="text-lg font-black">{item.year}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon className={`w-4 h-4 ${item.status === 'aktif' ? 'text-emerald-600' : 'text-primary-500'}`} />
                    <h3 className="text-lg font-black text-slate-900">{item.event}</h3>
                    {item.status === 'aktif' && (
                      <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">SEDANG BERLANGSUNG</span>
                    )}
                    {item.status === 'selesai' && (
                      <span className="ml-2 text-xs bg-slate-300 text-slate-600 px-2 py-0.5 rounded-full font-bold">SELESAI</span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-3xl overflow-hidden shadow-lg">
            <img src="/images/ALUR PENDAFTARAAN.jpeg" alt="Infografis Alur Pendaftaran" className="w-full h-auto" />
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h3 className="text-3xl font-black mb-4">Jangan Sampai Terlewat!</h3>
          <p className="text-primary-200 mb-8">Segera daftarkan diri Anda sebelum batas waktu pendaftaran berakhir.</p>
          <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-primary-900 px-8 py-4 rounded-2xl font-black text-lg hover:bg-primary-50 transition-colors">
            Daftar Sekarang <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default JadwalPPDB;
