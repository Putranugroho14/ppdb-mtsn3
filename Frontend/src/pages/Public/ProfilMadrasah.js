import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import { motion } from 'framer-motion';
import { School, MapPin, Award, Users, BookOpen, Target, Heart } from 'lucide-react';

const ProfilMadrasah = () => {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary-900 via-primary-800 to-emerald-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-primary-200 text-sm font-bold mb-6">
              <School className="w-4 h-4" /> Profil Madrasah
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Madrasah Tsanawiyah<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-emerald-300">Negeri 3 Sanggau</span>
            </h1>
            <p className="text-primary-200 text-lg max-w-2xl mx-auto leading-relaxed">
              Lembaga pendidikan Islam unggulan di bawah naungan Kementerian Agama Republik Indonesia, berkomitmen mencetak generasi rabbani yang cerdas dan berakhlakul karimah.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Galeri */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">Galeri Madrasah</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {["/images/FOTO 1.jpeg", "/images/FOTO 2.jpeg", "/images/FOTO 3.jpeg", "/images/FOTO 4.jpeg"].map((src, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="overflow-hidden rounded-3xl shadow-lg group aspect-square"
              >
                <img src={src} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Identitas */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-primary-600 font-bold uppercase tracking-wider text-sm mb-2">Identitas Sekolah</h2>
            <h3 className="text-3xl lg:text-4xl font-black text-slate-900">Data & Informasi Madrasah</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: School, label: 'NPSN', value: '30112343', color: 'bg-primary-50 text-primary-700' },
              { icon: Award, label: 'Akreditasi', value: 'B (2018)', color: 'bg-emerald-50 text-emerald-700' },
              { icon: Users, label: 'Total Siswa', value: '318 Siswa', color: 'bg-blue-50 text-blue-700' },
              { icon: MapPin, label: 'Kecamatan', value: 'Tayan Hilir', color: 'bg-orange-50 text-orange-700' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow text-center"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-2xl font-black text-slate-900">{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Detail Info */}
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h4 className="font-black text-xl text-slate-900 mb-4 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary-600" /> Lokasi & Alamat
              </h4>
              <div className="space-y-2 text-slate-600 text-sm leading-relaxed">
                <p><span className="font-bold">Jl. Gusti Dja'far No. 61</span></p>
                <p>Desa Pedalaman, Kec. Tayan Hilir</p>
                <p>Kab. Sanggau, Kalimantan Barat 78654</p>
                <p className="pt-2">🌐 <a href="http://www.mtsnegeri3sanggau.sch.id" className="text-primary-600 hover:underline font-medium">www.mtsnegeri3sanggau.sch.id</a></p>
              </div>
            </div>
            <div className="bg-primary-900 p-8 rounded-3xl text-white">
              <h4 className="font-black text-xl mb-4 flex items-center gap-3">
                <Target className="w-5 h-5 text-primary-400" /> Visi Madrasah
              </h4>
              <p className="text-primary-200 text-sm leading-relaxed italic">
                "Terwujudnya peserta didik yang berimtaq, berprestasi, berkarakter, dan berwawasan lingkungan berdasarkan nilai-nilai Islam."
              </p>
            </div>
          </div>

          {/* Misi */}
          <div className="mt-6 bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h4 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-3">
              <Heart className="w-5 h-5 text-primary-600" /> Misi Madrasah
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Menyelenggarakan pendidikan islami yang berkualitas dan berkarakter',
                'Meningkatkan prestasi akademik dan non-akademik siswa',
                'Membina akhlakul karimah dalam kehidupan sehari-hari',
                'Menciptakan lingkungan belajar yang kondusif dan berwawasan lingkungan',
              ].map((misi, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-slate-600 text-sm leading-relaxed">{misi}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <BookOpen className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h3 className="text-3xl font-black mb-4">Bergabunglah Bersama Kami</h3>
          <p className="text-primary-200 mb-8">Daftarkan diri Anda sekarang dan jadilah bagian dari keluarga besar MTsN 3 Sanggau.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-900 px-8 py-4 rounded-2xl font-black text-lg hover:bg-primary-50 transition-colors">
            Daftar Sekarang
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ProfilMadrasah;
