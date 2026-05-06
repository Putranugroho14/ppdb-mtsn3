import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Search,
  Loader2,
  Bell,
  ChevronRight,
  Inbox
} from 'lucide-react';
import API from '../../services/api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/public/announcements');
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = announcements.filter(item => {
    return item.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Simple Header */}
      <div className="bg-primary-900 pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase">
              Pengumuman
            </h1>
            <div className="flex items-center justify-center gap-2 text-primary-300 font-bold uppercase tracking-widest text-[10px]">
              <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">Daftar Pengumuman</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Search Bar - Center Integrated */}
        <div className="mb-12">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengumuman..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 focus:ring-4 focus:ring-primary-100 focus:bg-white focus:outline-none transition-all font-bold text-slate-700 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Memuat data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Inbox className="w-10 h-10 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">Tidak ada pengumuman yang ditemukan.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredData.map((news, i) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white p-6 rounded-2xl flex flex-col md:flex-row md:items-center gap-6 border border-slate-100 hover:border-primary-500 hover:shadow-xl transition-all"
                >
                  {/* Date Badge - Simple */}
                  <div className="flex-shrink-0 w-16 h-16 bg-slate-900 rounded-xl flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                    <span className="text-[9px] font-black text-primary-400 uppercase leading-none mb-1">
                      {new Date(news.publishedAt || news.createdAt).toLocaleDateString('id-ID', { month: 'short' })}
                    </span>
                    <span className="text-xl font-black text-white leading-none">
                      {new Date(news.publishedAt || news.createdAt).getDate()}
                    </span>
                  </div>

                  {/* Title & Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase tracking-widest">
                        {news.category}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight group-hover:text-primary-700 transition-colors">
                      {news.title}
                    </h4>
                  </div>

                  {/* Link */}
                  <Link
                    to={`/announcement/${news.id}`}
                    className="flex items-center gap-2 text-primary-700 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-all md:ml-auto"
                  >
                    Detail <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
