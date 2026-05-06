import React, { useState, useEffect } from 'react';
import PublicNavbar from '../../components/PublicNavbar';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, Mail, MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react';
import API from '../../services/api';

const InstagramIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const FacebookIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const YoutubeIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2 60.05 60.05 0 0 1 15 0 2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2 60.05 60.05 0 0 1-15 0 2 2 0 0 1-2-2Z"/><path d="m10 15 5-3-5-3z"/></svg>
);

const Contact = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/public/settings');
        setSettings(res.data);
      } catch (error) {
        console.error("Error fetching settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Memuat Halaman...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary-900 via-primary-800 to-emerald-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-primary-200 text-sm font-bold mb-6">
              <MessageSquare className="w-4 h-4" /> Kontak Kami
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-6">
              Hubungi <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-emerald-300">Panitia PPDB</span>
            </h1>
            <p className="text-primary-200 text-lg max-w-2xl mx-auto leading-relaxed">
              Punya pertanyaan atau kendala seputar pendaftaran? Tim panitia kami siap membantu Anda.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Phone, 
                title: 'Telepon / WA', 
                value: settings?.whatsappNumber || '0898-1335-197', 
                desc: 'Hubungi kami via WhatsApp untuk respon cepat.',
                link: `https://wa.me/${settings?.whatsappNumber?.replace(/[^0-9]/g, '') || '08981335197'}`,
                color: 'bg-green-50 text-green-700'
              },
              { 
                icon: Mail, 
                title: 'Email Resmi', 
                value: 'mtsn3sanggau@gmail.com', 
                desc: 'Kirimkan pertanyaan formal melalui email kami.',
                link: 'mailto:mtsn3sanggau@gmail.com',
                color: 'bg-blue-50 text-blue-700'
              },
              { 
                icon: Clock, 
                title: 'Jam Layanan', 
                value: '08.00 - 15.00 WIB', 
                desc: 'Senin s/d Jumat (Kecuali hari libur nasional).',
                link: '#',
                color: 'bg-purple-50 text-purple-700'
              },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all text-center group"
              >
                <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{item.title}</h3>
                <p className="text-primary-600 font-bold mb-4">{item.value}</p>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{item.desc}</p>
                {item.link !== '#' && (
                  <a href={item.link} className="inline-flex items-center gap-2 text-primary-700 font-bold text-sm hover:underline">
                    Hubungi Sekarang <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map & Address */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6">Lokasi Kampus</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Alamat Lengkap</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {settings?.alamatSekolah || "Jl. Gusti Dja'far No. 61, Desa Pedalaman, Kec. Tayan Hilir, Kab. Sanggau, Kalimantan Barat 78654."}
                    </p>
                  </div>
                </div>
                
                <div className="pt-6">
                  <h4 className="font-bold text-slate-900 mb-4">Media Sosial Resmi</h4>
                  <div className="flex gap-4">
                    {[
                      { icon: InstagramIcon, link: '#', color: 'bg-pink-100 text-pink-600' },
                      { icon: FacebookIcon, link: '#', color: 'bg-blue-100 text-blue-600' },
                      { icon: YoutubeIcon, link: '#', color: 'bg-red-100 text-red-600' },
                    ].map((social, idx) => (
                      <a key={idx} href={social.link} className={`w-12 h-12 ${social.color} rounded-xl flex items-center justify-center hover:scale-110 transition-transform`}>
                        <social.icon className="w-6 h-6" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-[400px] bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl p-4"
            >
              {/* Placeholder for Map */}
              <div className="w-full h-full bg-slate-100 rounded-[1.8rem] flex flex-col items-center justify-center text-slate-400">
                <MapPin className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold">Google Maps MTsN 3 Sanggau</p>
                <p className="text-xs">Peta Interaktif akan muncul di sini</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
