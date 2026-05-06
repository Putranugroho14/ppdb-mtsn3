import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag, Share2, Loader2 } from 'lucide-react';
import API from '../../services/api';

const AnnouncementDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await API.get(`/announcements/${id}`);
        setNews(data);
      } catch (err) {
        console.error('Error fetching announcement detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Memuat Detail Pengumuman...</p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-black text-slate-800 mb-4 uppercase">Pengumuman Tidak Ditemukan</h1>
        <Link to="/announcements" className="text-primary-600 font-bold flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> KEMBALI KE DAFTAR
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      {/* Header with Background */}
      <div className="relative pt-48 pb-24 flex items-center justify-center overflow-hidden bg-primary-900">
        <div className="absolute inset-0 z-0 opacity-10 bg-madrasah"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-block px-4 py-1.5 bg-primary-500/20 text-primary-200 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-primary-500/30">
              {news.category}
            </div>
            <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight mb-8 uppercase">
              {news.title}
            </h1>
            
            <div className="flex flex-wrap justify-center items-center gap-6 text-primary-200 font-bold text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(news.publishedAt || news.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Admin PPDB
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <Link 
          to="/announcements" 
          className="inline-flex items-center gap-2 text-primary-700 font-bold mb-12 hover:gap-3 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> KEMBALI KE DAFTAR
        </Link>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="prose prose-lg prose-slate max-w-none"
        >
          <div 
            className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap" 
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </motion.div>

        {/* Footer of Content */}
        <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">#PPDB{new Date().getFullYear()}</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">#MTsN3Sanggau</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-bold text-xs uppercase">Bagikan:</span>
            <div className="flex gap-4">
              <button className="text-slate-400 hover:text-primary-600 transition-colors"><Share2 className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetail;
