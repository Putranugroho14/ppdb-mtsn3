import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import {
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Calendar,
  GraduationCap,
  FileText,
  ShieldCheck,
  MapPin,
  Clock,
  Info,
  ChevronRight,
  School,
  Award,
  Users,
  Bell,
  Loader2
} from 'lucide-react';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    "https://i.pinimg.com/736x/f6/c0/e8/f6c0e8c3801fcd8e05686ca3913d931f.jpg",
    "https://i.pinimg.com/1200x/27/93/00/279300f43d369492298f71877d225c1f.jpg",
    "https://i.pinimg.com/1200x/30/31/bc/3031bcdd881c35b1e5ad74f433e69dc3.jpg"
  ];

  const galleryImages = [
    "/images/FOTO 1.jpeg",
    "/images/FOTO 2.jpeg",
    "/images/FOTO 3.jpeg",
    "/images/FOTO 4.jpeg"
  ];

  const [settings, setSettings] = useState(null);
  const [activeSetup, setActiveSetup] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const fetchData = async () => {
    try {
      // Menambahkan timestamp untuk menghindari cache browser saat fetching data terbaru
      const ts = new Date().getTime();
      const [settingsRes, setupRes, newsRes] = await Promise.all([
        API.get(`/public/settings?t=${ts}`),
        API.get(`/public/setup?t=${ts}`),
        API.get(`/public/announcements?limit=4&t=${ts}`)
      ]);
      setSettings(settingsRes.data);
      // getPublicSetup di backend sekarang mengembalikan objek tunggal (tahun terbaru)
      setActiveSetup(setupRes.data);
      setAnnouncements(newsRes.data || []);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const listPersyaratan = settings?.persyaratan ? JSON.parse(settings.persyaratan) : [];
  const listAlur = settings?.alurPendaftaran ? JSON.parse(settings.alurPendaftaran) : [];

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Memuat Halaman...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-madrasah">
      <PublicNavbar />

      {/* Hero Section with Carousel */}
      <section id="home" className="relative h-[75vh] lg:h-[85vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Carousel Background */}
        <div className="absolute inset-0 z-0">
          {slides.map((slide, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: currentSlide === index ? 1 : 0 }}
              transition={{ duration: 1.0 }}
              className="absolute inset-0"
            >
              <img
                src={slide}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
            </motion.div>
          ))}
        </div>

        {/* Floating Dots Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-primary-500 w-10' : 'bg-white/40 hover:bg-white/60'
                }`}
            />
          ))}
        </div>

        {/* Slider controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 transition-all group hidden lg:block"
        >
          <ChevronRight className="w-8 h-8 rotate-180 group-hover:-translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 transition-all group hidden lg:block"
        >
          <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Hero Content - Centered */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-500/20 text-primary-300 text-sm font-bold mb-8 border border-primary-500/30 backdrop-blur-md">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
              </span>
              PMB Tahun Pelajaran {activeSetup?.tahun || '2026'}/{parseInt(activeSetup?.tahun || '2026') + 1} Telah Dibuka
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-7xl font-black text-white leading-[1.1] mb-6 lg:mb-8 drop-shadow-2xl px-2">
              Penerimaan Murid Baru <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-300 uppercase">
                MTsN 3 Sanggau
              </span>
            </h1>

            <p className="text-lg lg:text-2xl text-slate-200 mb-12 leading-relaxed max-w-3xl mx-auto drop-shadow-lg px-4">
              {settings?.welcomeSubtitle || 'Portal pendaftaran resmi Penerimaan Murid Baru MTSN 3 Sanggau Tahun Ajaran 2026/2027.'}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-6">
              {settings?.registrationOpen ? (
                <Link to="/register" className="btn btn-primary px-8 lg:px-10 py-4 lg:py-5 text-lg lg:text-xl flex items-center justify-center gap-3 rounded-2xl group shadow-2xl shadow-primary-900/40">
                  Daftar Sekarang
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              ) : (
                <div className="px-8 lg:px-10 py-4 lg:py-5 text-lg lg:text-xl flex items-center justify-center gap-3 rounded-2xl bg-slate-800/50 text-slate-400 border border-slate-700 backdrop-blur-md cursor-not-allowed">
                  <Clock className="w-6 h-6" />
                  Pendaftaran Ditutup
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>


      {/* Profil Madrasah */}
      <section id="profile" className="pt-12 lg:pt-24 pb-0 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* Centered Header */}
          <div className="text-center mb-12 lg:mb-20">
            <h2 className="text-primary-600 font-bold tracking-[0.3em] uppercase mb-4 text-[10px] sm:text-xs">Profil Madrasah</h2>
            <h3 className="text-2xl sm:text-3xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tighter">
              MTSN 03 Sanggau<br className="hidden lg:block" />
            </h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left: Image Grid */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {galleryImages.map((src, idx) => (
                <div key={idx} className="overflow-hidden rounded-[2rem] shadow-lg border border-slate-100 group">
                  <img
                    src={src}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover aspect-square transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ))}
            </motion.div>

            {/* Right: School Data Sections (Matching Admin Setup) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full"
            >
              {/* 1. Identitas Madrasah Section - Full Width */}
              <div className="md:col-span-2 bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-2xl shadow-primary-900/20 group hover:border-primary-500/50 transition-all duration-500 relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-[80px] -mr-24 -mt-24 transition-opacity group-hover:bg-primary-500/20"></div>
                
                <div className="flex items-center gap-5 mb-8 relative z-10">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 text-primary-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    <School className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em] mb-1">Identitas Madrasah</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Informasi Utama Lembaga</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                  {[
                    { label: 'Nama Madrasah', value: settings?.schoolName || 'MTSN 03 Sanggau', color: 'text-white' },
                    { label: 'NPSN', value: settings?.npsn || '30112343', color: 'text-white' },
                    { label: 'Status', value: settings?.statusSekolah || 'Negeri', color: 'text-emerald-400', badge: true },
                    { label: 'Pendidikan', value: settings?.bentukPendidikan || 'MTS', color: 'text-primary-400', badge: true }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{item.label}</span>
                      {item.badge ? (
                        <div className={`inline-flex items-center px-3 py-1 rounded-lg bg-white/5 border border-white/10 ${item.color}`}>
                          <span className="text-[10px] font-black uppercase">{item.value}</span>
                        </div>
                      ) : (
                        <span className={`text-sm font-black uppercase leading-tight block ${item.color}`}>{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Lokasi Section */}
              <div className="bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-2xl shadow-primary-900/20 group hover:border-emerald-500/50 transition-all duration-500 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] -mr-16 -mb-16"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 text-emerald-400 rounded-2xl flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Lokasi Kami</h4>
                  </div>
                  <p className="text-xs text-slate-300 font-medium uppercase tracking-wide leading-relaxed mb-4 opacity-80">
                    {settings?.alamatSekolah || 'Desa Pedalaman, Kec. Tayan Hilir, Kab. Sanggau, Kalimantan Barat.'}
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-5 mt-6 pt-6 border-t border-white/5">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:-rotate-6 transition-transform">
                    <div className="text-center">
                      <span className="block text-[8px] font-black text-emerald-100 leading-none mb-1">GRADE</span>
                      <span className="text-2xl font-black leading-none">{settings?.akreditasi || 'B'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Akreditasi</span>
                    <span className="text-xs font-black text-white uppercase tracking-wider">Tahun {settings?.tahunAkreditasi || '2018'}</span>
                  </div>
                </div>
              </div>

              {/* 3. Statistik Section */}
              <div className="bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-2xl shadow-primary-900/20 group hover:border-blue-500/50 transition-all duration-500 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] -mr-16 -mt-16"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 text-blue-400 rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Statistik</h4>
                  </div>
                  
                  <div className="flex items-end gap-4">
                    <span className="text-6xl font-black text-white tracking-tighter leading-none">{settings?.totalSiswa || '318'}</span>
                    <div className="pb-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Total</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Siswa</p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
                  <div className="p-4 bg-white/5 rounded-2xl hover:bg-primary-500/10 transition-all border border-white/5">
                    <p className="text-[9px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">Putra</p>
                    <p className="text-xl font-black text-white leading-none">{settings?.siswaL || '185'}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl hover:bg-emerald-500/10 transition-all border border-white/5">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Putri</p>
                    <p className="text-xl font-black text-white leading-none">{settings?.siswaP || '133'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Simplified Centered Gambaran Umum Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mb-8 border border-slate-100">
              <School className="w-6 h-6" />
            </div>
            
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Gambaran Umum</h4>
            
            <p className="text-base sm:text-lg lg:text-2xl text-slate-600 leading-relaxed italic font-medium max-w-3xl mx-auto px-4">
              "{settings?.gambaranUmum || settings?.welcomeAboutText || 'MTsN 3 Sanggau berkomitmen untuk menyelenggarakan pendidikan yang mengintegrasikan ilmu pengetahuan umum dengan nilai-nilai keislaman.'}"
            </p>
            
            <div className="mt-8 w-16 h-1 bg-slate-100 mx-auto rounded-full"></div>
          </motion.div>
        </div>
      </section>

      {/* Alur & Persyaratan Side-by-Side */}
      <section id="info" className="pt-8 pb-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-primary-600 font-bold tracking-wider uppercase mb-3 text-xs md:text-sm">Informasi Pendaftaran</h2>
            <h3 className="text-3xl lg:text-5xl font-black text-slate-900 leading-tight">Syarat & Alur PPDB</h3>
          </div>
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left Column: Syarat & Ketentuan */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50"
            >
              <div className="pt-8 lg:pt-10 px-0 pb-10">
                <div className="inline-block bg-primary-700 text-white px-6 lg:px-10 py-2.5 lg:py-3 rounded-r-full text-xl lg:text-2xl font-bold mb-8 lg:mb-10 shadow-lg">
                  Persyaratan :
                </div>

                <div className="px-10 space-y-8">
                  {listPersyaratan.length > 0 ? listPersyaratan.map((item, idx) => (
                    <div key={idx} className="flex gap-5 group">
                      <div className="flex-shrink-0 w-8 h-8 bg-white text-primary-700 rounded-full flex items-center justify-center font-black text-sm border border-primary-100 shadow-sm group-hover:bg-primary-700 group-hover:text-white transition-all">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg text-slate-700 font-black leading-tight mb-2 uppercase tracking-tight">
                          {item.text || item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-70">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="py-10 text-center">
                      <p className="text-slate-400 italic">Persyaratan belum diatur.</p>
                    </div>
                  )}
                </div>

                <div className="mt-12 mx-10 p-5 bg-white/60 rounded-2xl border border-white flex items-start gap-4">
                  <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed italic font-bold uppercase tracking-wider">
                    "Pastikan semua berkas yang diunggah terbaca jelas untuk mempermudah proses verifikasi panitia."
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Alur Pendaftaran */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-primary-600 font-bold tracking-wider uppercase mb-4 text-sm">Langkah Pendaftaran</h2>
              <h3 className="text-4xl font-black text-slate-900 mb-10 tracking-tighter">Alur & Prosedur</h3>

              <div className="space-y-6 relative">
                {/* Connecting Line */}
                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>

                {listAlur.length > 0 ? listAlur.map((step, idx) => {
                  const icons = [School, ShieldCheck, FileText, ArrowRight, Clock, MapPin, Award];
                  const Icon = icons[idx % icons.length];
                  return (
                    <div key={idx} className="relative z-10 flex items-start gap-6 group">
                      <div className="flex-shrink-0 w-14 h-14 bg-white border-2 border-slate-50 rounded-2xl flex items-center justify-center shadow-lg group-hover:border-primary-500 group-hover:text-primary-600 transition-all duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="pt-2">
                        <h4 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary-700 transition-colors uppercase tracking-tight">
                          {step.title}
                        </h4>
                        <p className="text-slate-500 font-medium uppercase tracking-wide text-xs">
                          {step.desc || step.description}
                        </p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-10 text-center">
                    <p className="text-slate-400 italic">Alur belum diatur.</p>
                  </div>
                )}
              </div>

              <div className="mt-12 p-8 bg-primary-900 rounded-[2.5rem] text-white shadow-2xl shadow-primary-900/30">
                <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-primary-400" />
                  Status Verifikasi
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <p className="text-xs opacity-60 mb-1">Tahap 1</p>
                    <p className="font-bold uppercase tracking-tight">Menunggu Verifikasi</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <p className="text-xs opacity-60 mb-1">Tahap 2</p>
                    <p className="font-bold uppercase tracking-tight">Diterima / Ditolak</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Jadwal PPDB with Precision Waves */}
      <section id="schedule" className="relative bg-primary-900 py-0 overflow-hidden">
        {/* Top Wave */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-10">
          <svg className="relative block w-full h-[80px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-white"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-32 lg:pt-48 pb-24 lg:pb-32 relative z-20">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-primary-400 font-bold tracking-[0.4em] uppercase mb-4 text-[10px] md:text-xs">Timeline Pendaftaran</h2>
            <h3 className="text-3xl lg:text-5xl font-black text-white mb-6 uppercase tracking-tighter">Jadwal Pelaksanaan</h3>
            <div className="w-16 lg:w-20 h-1 bg-primary-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left: Infographic */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-emerald-500/20 rounded-[2.5rem] blur-2xl"></div>
              <div className="relative bg-white/5 backdrop-blur-sm p-4 rounded-[2.5rem] border border-white/10">
                <img
                  src="/images/ALUR PENDAFTARAAN.jpeg"
                  alt="Alur Pendaftaran"
                  className="w-full h-auto rounded-[1.8rem] shadow-2xl"
                />
              </div>
            </motion.div>

            {/* Right: Schedule Cards */}
            <div className="space-y-4">
              {[
                { date: activeSetup?.tanggalPendaftaran || 'Segera', event: 'Pendaftaran Online', icon: FileText },
                { date: activeSetup?.tanggalVerifikasi || 'Segera', event: 'Verifikasi Berkas', icon: CheckCircle2 },
                { date: activeSetup?.tanggalTest || 'Segera', event: 'Tes Seleksi Mandiri', icon: Award },
                { date: activeSetup?.tanggalPengumuman || 'Segera', event: 'Pengumuman Kelulusan', icon: GraduationCap },
                { date: activeSetup?.tanggalDaftarUlang || 'Segera', event: 'Daftar Ulang Siswa', icon: School }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-6 p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all group"
                >
                  <div className="flex-shrink-0 w-24 h-24 bg-primary-800 rounded-2xl flex flex-col items-center justify-center border border-white/5 shadow-inner">
                    <span className={`font-bold text-primary-400 uppercase tracking-tighter mb-1 text-center px-2 leading-tight ${item.date.length > 8 ? 'text-[8px]' : 'text-[10px]'}`}>
                      {item.date}
                    </span>
                    <span className="text-xl font-black text-white leading-none mt-1">{activeSetup?.tahun || '2026'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 text-white">
                      <item.icon className="w-4 h-4 text-primary-400" />
                      <h4 className="text-xl font-black leading-tight uppercase tracking-tight">{item.event}</h4>
                    </div>
                    <div className="w-12 h-0.5 bg-primary-600 rounded-full group-hover:w-full transition-all duration-500"></div>
                  </div>
                </motion.div>
              ))}

              <div className="pt-10">
                <Link to="/login" className="flex items-center justify-center gap-4 bg-white text-primary-900 px-10 py-5 rounded-2xl font-black text-xl shadow-2xl hover:shadow-primary-500/20 transition-all active:scale-95">
                  DAFTAR SEKARANG
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10">
          <svg className="relative block w-full h-[80px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      {/* Pengumuman & Bantuan Side-by-Side */}
      <section id="announcement" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tighter">Pengumuman</h3>
                <Link to="/announcements" className="text-primary-700 font-bold text-xs lg:text-sm hover:underline uppercase tracking-widest">
                  LIHAT SEMUA
                </Link>
              </div>

              <div className="space-y-3">
                {announcements.length > 0 ? announcements.map((news, i) => (
                  <Link
                    key={news.id}
                    to={`/announcement/${news.id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all group"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-primary-600 transition-colors">
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary-200 uppercase leading-none mb-1">{new Date(news.publishedAt || news.createdAt).getFullYear()}</span>
                      <span className="text-xs font-black text-slate-900 group-hover:text-white uppercase leading-none">{new Date(news.publishedAt || news.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                    </div>
                    <h4 className="flex-1 text-sm font-bold text-slate-700 group-hover:text-primary-800 transition-colors line-clamp-2 uppercase tracking-tight">
                      {news.title}
                    </h4>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 transition-colors" />
                  </Link>
                )) : (
                  <div className="py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Bell className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest italic">Belum ada pengumuman.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right: Pusat Bantuan / WA */}
            <motion.div
              id="contact"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-primary-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-primary-900/40 h-full flex flex-col justify-center min-h-[450px]"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>

              <div className="relative z-10 text-center lg:text-left">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-green-500/20 mx-auto lg:mx-0">
                  <MessageSquare className="w-8 h-8" />
                </div>

                <h3 className="text-3xl font-black mb-6 leading-tight uppercase tracking-tighter">
                  Butuh Bantuan? <br />
                  Hubungi Panitia.
                </h3>

                <p className="text-primary-200 mb-10 text-lg leading-relaxed font-medium opacity-80">
                  Punya kendala saat mendaftar? Jangan ragu untuk bertanya langsung kepada kami.
                </p>

                <a
                  href={`https://wa.me/${settings?.whatsappNumber || '628981335197'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all hover:-translate-y-1 active:scale-95 shadow-xl shadow-green-500/30 uppercase tracking-widest"
                >
                  CHAT VIA WHATSAPP
                  <ArrowRight className="w-5 h-5" />
                </a>

                <div className="mt-10 pt-8 border-t border-white/10 flex items-center gap-4 justify-center lg:justify-start">
                  <Clock className="w-5 h-5 text-primary-400" />
                  <span className="text-[10px] font-black text-primary-300 uppercase tracking-[0.2em]">Senin - Jumat: 08.00 - 15.00 WIB</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Refactored Footer with Midnight Theme (Matching Cards) */}
      <footer className="bg-slate-900 pt-24 pb-12 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 lg:gap-16 mb-20">
            {/* Column 1: Brand & Desc */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center p-1.5 shadow-inner">
                  <img src="/images/logo mts.jpg" alt="Logo" className="w-full h-full object-contain brightness-110" />
                </div>
                <span className="text-xl font-black text-white tracking-tighter">MTsN 3 Sanggau</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
                Lembaga pendidikan tingkat menengah pertama yang berkomitmen mencetak generasi unggul, berakhlak mulia, dan berwawasan luas melalui integrasi nilai keislaman dan ilmu pengetahuan.
              </p>
              <div className="flex gap-5 text-slate-500">
                <a href="#" className="hover:text-primary-400 transition-colors"><MessageSquare className="w-5 h-5" /></a>
                <a href="#" className="hover:text-primary-400 transition-colors"><Users className="w-5 h-5" /></a>
                <a href="#" className="hover:text-primary-400 transition-colors"><Award className="w-5 h-5" /></a>
                <a href="#" className="hover:text-primary-400 transition-colors"><School className="w-5 h-5" /></a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-8 tracking-wide">Navigasi Cepat</h4>
              <ul className="space-y-4 text-slate-400 text-sm font-medium">
                <li><a href="#home" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-primary-400 transition-colors"></div>Beranda</a></li>
                <li><a href="#profile" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-primary-400 transition-colors"></div>Profil Madrasah</a></li>
                <li><a href="#info" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-primary-400 transition-colors"></div>Syarat & Alur</a></li>
                <li><a href="#schedule" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-primary-400 transition-colors"></div>Jadwal PPDB</a></li>
                <li><a href="#announcement" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-primary-400 transition-colors"></div>Pengumuman</a></li>
              </ul>
            </div>

            {/* Column 3: Pendaftaran */}
            <div>
              <h4 className="font-bold text-white mb-8 tracking-wide">Pendaftaran</h4>
              <ul className="space-y-4 text-slate-400 text-sm font-medium">
                <li><Link to="/register" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-primary-400 transition-colors"></div>Daftar Akun Baru</Link></li>
                <li><Link to="/login" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-primary-400 transition-colors"></div>Login Siswa</Link></li>
                <li><Link to="/announcements" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-primary-400 transition-colors"></div>Hasil Seleksi</Link></li>
                <li><Link to="/help" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-primary-400 transition-colors"></div>Pusat Bantuan</Link></li>
              </ul>
            </div>

            {/* Column 4: Contact Us */}
            <div>
              <h4 className="font-bold text-white mb-8 tracking-wide">Hubungi Kami</h4>
              <ul className="space-y-6 text-slate-400 text-sm font-medium">
                <li className="flex items-start gap-4 group">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-primary-400 group-hover:bg-primary-500/10 transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="flex-1 group-hover:text-slate-300 transition-colors">
                    {settings?.alamatSekolah || 'Desa Pedalaman, Kec. Tayan Hilir, Kab. Sanggau, Kalimantan Barat.'}
                  </span>
                </li>
                <li className="flex items-center gap-4 group">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-primary-400 group-hover:bg-primary-500/10 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="group-hover:text-slate-300 transition-colors">mtsn3sanggau@kemenag.go.id</span>
                </li>
                <li className="flex items-center gap-4 group">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-primary-400 group-hover:bg-primary-500/10 transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="group-hover:text-slate-300 transition-colors">
                    {settings?.whatsappNumber ? `+62 ${settings.whatsappNumber.replace(/^0/, '')}` : '+62 898-1335-197'}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:row justify-between items-center gap-6">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} {settings?.schoolName || 'MTsN 3 Sanggau'}. All rights reserved.
            </p>
            <div className="flex gap-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
