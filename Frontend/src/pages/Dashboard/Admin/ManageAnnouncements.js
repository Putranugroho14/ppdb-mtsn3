import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import { mapErrorMessage } from '../../../utils/errorMapper';
import { 
  Bell, Plus, Search, Edit3, Trash2, 
  CheckCircle2, XCircle, Clock, Filter,
  MoreVertical, X, Save, AlertCircle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Berita Utama',
    isPublished: true,
    publishedAt: new Date().toISOString().split('T')[0]
  });

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, title: '' });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/announcements');
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        content: item.content,
        category: item.category,
        isPublished: item.isPublished,
        publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        content: '',
        category: 'Berita Utama',
        isPublished: true,
        publishedAt: new Date().toISOString().split('T')[0]
      });
    }
    setError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Judul pengumuman wajib diisi.';
    if (!formData.content.trim()) errors.content = 'Isi pengumuman wajib diisi.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      setError('Harap lengkapi judul dan isi pengumuman.');
      setShowErrorModal(true);
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await API.put(`/announcements/${editingItem.id}`, formData);
      } else {
        await API.post('/announcements', formData);
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      setError(mapErrorMessage(err));
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, title) => {
    setDeleteConfig({ show: true, id, title });
  };

  const executeDelete = async () => {
    try {
      await API.delete(`/announcements/${deleteConfig.id}`);
      fetchAnnouncements();
      setDeleteConfig({ show: false, id: null, title: '' });
    } catch (err) {
      setError(mapErrorMessage(err));
      setShowErrorModal(true);
    }
  };

  const filteredData = announcements.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8">
      {/* 🚀 SUPER PREMIUM HERO HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-10 lg:p-12 border border-slate-700 shadow-2xl mb-10"
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 w-fit text-primary-400 text-xs font-bold uppercase tracking-widest mb-2 shadow-inner">
              Pusat Informasi
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
              Manajemen <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">Pengumuman</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-xl">
              Buat, edit, dan kelola berita atau pengumuman penting yang akan ditampilkan di halaman depan portal siswa.
            </p>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="px-6 py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-black text-sm flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-xl shadow-primary-500/30"
          >
            <Plus className="w-5 h-5" />
            Tambah Pengumuman
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari judul pengumuman..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 font-bold text-slate-700 transition-all placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul & Kategori</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Publish</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto" />
                    <p className="text-slate-400 font-bold mt-4">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center text-slate-400 italic">
                    Belum ada pengumuman.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-4">
                      {item.isPublished ? (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase">Published</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full w-fit">
                          <Clock className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase">Draft</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <h4 className="font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                        <span className="text-[10px] font-black text-primary-500 bg-primary-50 px-2 py-0.5 rounded uppercase">{item.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-500">
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                      </p>
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">Dibuat: {new Date(item.createdAt).toLocaleDateString('id-ID')}</p>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-primary-900 p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Bell className="w-6 h-6 text-primary-400" />
                  {editingItem ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Judul Pengumuman <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-slate-800 ${fieldErrors.title ? 'border-red-500 bg-red-50/30' : 'border-slate-100 focus:border-primary-500 focus:bg-white'}`}
                    placeholder="Contoh: Hasil Seleksi Berkas Tahap 1"
                    value={formData.title}
                    onChange={(e) => { setFormData({...formData, title: e.target.value}); setFieldErrors({...fieldErrors, title: ''}); }}
                  />
                  {fieldErrors.title && <p className="text-[10px] font-bold text-red-500 animate-pulse">{fieldErrors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Kategori</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary-500 focus:bg-white transition-all font-bold text-slate-800"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Berita Utama">Berita Utama</option>
                      <option value="Jadwal & Agenda">Jadwal & Agenda</option>
                      <option value="Pengumuman Seleksi">Pengumuman Seleksi</option>
                      <option value="Panduan Pendaftaran">Panduan Pendaftaran</option>
                      <option value="Informasi Alur">Informasi Alur</option>
                      <option value="Kegiatan Madrasah">Kegiatan Madrasah</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tanggal Publish</label>
                    <input 
                      type="date" 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary-500 focus:bg-white transition-all font-bold text-slate-800"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData({...formData, publishedAt: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Status</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, isPublished: true})}
                      className={`flex-1 p-4 rounded-2xl font-black text-[10px] uppercase border-2 transition-all ${formData.isPublished ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                    >
                      Publish
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, isPublished: false})}
                      className={`flex-1 p-4 rounded-2xl font-black text-[10px] uppercase border-2 transition-all ${!formData.isPublished ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                    >
                      Draft
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Isi Pengumuman <span className="text-red-500">*</span></label>
                  <textarea 
                    rows="8"
                    className={`w-full p-6 bg-slate-50 border-2 rounded-[2rem] outline-none transition-all font-medium text-slate-700 leading-relaxed ${fieldErrors.content ? 'border-red-500 bg-red-50/30' : 'border-slate-100 focus:border-primary-500 focus:bg-white'}`}
                    placeholder="Ketik isi pengumuman di sini..."
                    value={formData.content}
                    onChange={(e) => { setFormData({...formData, content: e.target.value}); setFieldErrors({...fieldErrors, content: ''}); }}
                  />
                  {fieldErrors.content && <p className="text-[10px] font-bold text-red-500 animate-pulse">{fieldErrors.content}</p>}
                </div>
              </form>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-500 rounded-2xl text-xs font-black hover:bg-slate-100 transition-all"
                >
                  BATAL
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-8 py-4 bg-primary-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingItem ? 'SIMPAN PERUBAHAN' : 'TAMBAH PENGUMUMAN'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚠️ DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfig.show && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[3rem] p-10 text-center space-y-6 shadow-2xl overflow-hidden border-t-8 border-red-500">
              <button onClick={() => setDeleteConfig({ ...deleteConfig, show: false })} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><AlertCircle className="w-10 h-10" /></div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Hapus Data?</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Apakah Anda yakin ingin menghapus pengumuman <b>{deleteConfig.title}</b>? Tindakan ini tidak dapat dibatalkan dan data akan hilang secara permanen.</p>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button onClick={executeDelete} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-200 active:scale-95 transition-all">Ya, Hapus</button>
                <button onClick={() => setDeleteConfig({ ...deleteConfig, show: false })} className="w-full py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Batal</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚠️ SUMMARY ERROR MODAL */}
      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl border-t-8 border-red-500 overflow-hidden">
              <button onClick={() => setShowErrorModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><AlertCircle className="w-10 h-10" /></div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Terjadi Kesalahan</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{error}</p>
              </div>
              <button onClick={() => setShowErrorModal(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Tutup</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageAnnouncements;
