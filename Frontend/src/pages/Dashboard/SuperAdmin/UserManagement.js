import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import { mapErrorMessage, validateEmail, validatePhone } from '../../../utils/errorMapper';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Check,
  Shield,
  User as UserIcon,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Key,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pendaftars, setPendaftars] = useState([]);
  const [activeTab, setActiveTab] = useState('superadmin');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(true);
  const [notification, setNotification] = useState(null);
  const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, type: null, name: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    nik: '',
    password: '',
    role: 'admin'
  });
  
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const showNotify = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, pendaftarRes] = await Promise.all([
        API.get('/superadmin/users'),
        API.get('/admin/applicants')
      ]);
      setUsers(usersRes.data);
      setPendaftars(pendaftarRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
      showNotify('error', 'Gagal menyinkronkan data pengguna dari server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    setShowPassword(true);
    if (user) {
      setEditingUser(user);
      if (activeTab === 'admin') {
        setFormData({
          name: user.name,
          username: user.username,
          password: user.password_plain || '',
          role: user.role
        });
      } else {
        setFormData({
          name: user.name,
          nik: user.nik,
          password: user.password_plain || '',
          role: 'user'
        });
      }
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        username: '',
        nik: '',
        password: '',
        role: activeTab === 'pendaftar' ? 'user' : activeTab
      });
    }
    setError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Nama lengkap wajib diisi.';
    
    if (activeTab === 'pendaftar') {
      if (!formData.nik) {
        errors.nik = 'NIK wajib diisi.';
      } else if (formData.nik.length !== 16) {
        errors.nik = 'NIK harus berjumlah tepat 16 digit.';
      } else if (!/^[0-9]+$/.test(formData.nik)) {
        errors.nik = 'NIK hanya boleh berisi angka.';
      }
    } else {
      if (!formData.username) errors.username = `Username ${activeTab} wajib diisi.`;
    }

    if (!editingUser || formData.password) {
      if (!formData.password) {
        errors.password = 'Password wajib diisi.';
      } else if (formData.password.length < 8) {
        errors.password = 'Password minimal harus 8 karakter.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      setError('Beberapa kolom masih belum diisi dengan benar. Silakan periksa kembali pesan error di bawah kolom.');
      setShowErrorModal(true);
      return;
    }

    setSubmitting(true);
    try {
      if (activeTab !== 'pendaftar') {
        if (editingUser) {
          await API.put(`/superadmin/users/${editingUser.id}`, formData);
          showNotify('success', `Akun ${formData.role} "${formData.name}" berhasil diperbarui.`);
        } else {
          await API.post('/superadmin/users', formData);
          showNotify('success', `Akun ${formData.role} baru "${formData.name}" berhasil dibuat.`);
        }
      } else {
        if (editingUser) {
          await API.put(`/superadmin/pendaftar/${editingUser.id}`, {
            name: formData.name,
            nik: formData.nik,
            password: formData.password
          });
          showNotify('success', `Data Pendaftar "${formData.name}" berhasil diperbarui.`);
        } else {
          await API.post('/admin/add-applicant', {
            name: formData.name,
            nik: formData.nik,
            password: formData.password,
            gender: 'L',
            birthPlace: '-',
            birthDate: '2010-01-01',
          });
          showNotify('success', `Akun Pendaftar "${formData.name}" berhasil dibuat manual.`);
        }
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      const friendlyMessage = mapErrorMessage(err);
      setError(friendlyMessage);
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id, type, name) => {
    setDeleteConfig({ show: true, id, type, name });
  };

  const executeDelete = async () => {
    const { id, type, name } = deleteConfig;
    try {
      if (type !== 'pendaftar') {
        await API.delete(`/superadmin/users/${id}`);
      } else {
        await API.delete(`/admin/applicant/${id}`);
      }
      showNotify('success', `Akun "${name}" telah dihapus secara permanen.`);
      fetchData();
    } catch (error) {
      showNotify('error', 'Gagal menghapus akun tersebut.');
    } finally {
      setDeleteConfig({ show: false, id: null, type: null, name: '' });
    }
  };

  const handleResetPasswordPendaftar = async (id, name) => {
    if (window.confirm(`Reset password ${name} ke format DDMMYYYY?`)) {
      try {
        await API.post('/admin/reset-password-pendaftar', { id });
        showNotify('success', `Password ${name} berhasil direset.`);
        fetchData();
      } catch (error) {
        showNotify('error', 'Gagal mereset password.');
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                         (u.username && u.username.toLowerCase().includes(search.toLowerCase()));
    
    if (activeTab === 'superadmin') return u.role === 'superadmin' && matchesSearch;
    if (activeTab === 'admin') return u.role === 'admin' && matchesSearch;
    return false;
  });

  const filteredPendaftars = pendaftars.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.nik && p.nik.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 relative">
      
      {/* 🔔 PREMIUM TOAST */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-10 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-4">
            <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-4 border backdrop-blur-xl ${notification.type === 'error' ? 'bg-red-900/90 border-red-500/50' : 'bg-slate-900/90 border-emerald-500/50'} text-white`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notification.type === 'error' ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                {notification.type === 'error' ? <AlertCircle className="w-6 h-6 text-red-400" /> : <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
              </div>
              <div className="flex-1">
                <p className="font-black text-xs uppercase tracking-tight">{notification.type === 'error' ? 'Kesalahan' : 'Berhasil'}</p>
                <p className="text-[10px] opacity-80 font-medium leading-relaxed">{notification.text}</p>
              </div>
              <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-4 h-4 opacity-50" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏛️ CLEAN HEADER */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20">
               <ShieldCheck className="w-7 h-7 text-primary-400" />
             </div>
             <div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Manajemen <span className="text-primary-600">Akses</span></h1>
               <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Otoritas & Keamanan Pengguna</p>
             </div>
          </div>
          <button onClick={() => handleOpenModal()} className={`px-8 py-5 rounded-3xl text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95 ${activeTab === 'pendaftar' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-slate-900 shadow-slate-900/20'}`}>
            <UserPlus className="w-5 h-5" />
            Tambah {activeTab === 'pendaftar' ? 'Pendaftar' : activeTab === 'superadmin' ? 'Super Admin' : 'Panitia'} Baru
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="flex p-2 bg-slate-100/50 border-b border-slate-100 gap-2">
          <button onClick={() => setActiveTab('superadmin')} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'superadmin' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Super Admin</button>
          <button onClick={() => setActiveTab('admin')} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'admin' ? 'bg-white shadow-md text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}>Panitia / Staff</button>
          <button onClick={() => setActiveTab('pendaftar')} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'pendaftar' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>Database Peserta</button>
        </div>

        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder={`Cari nama, NIK, atau username...`} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary-500 transition-all shadow-inner" />
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
             <div className="flex items-center gap-2"><div className="w-2 h-2 bg-slate-900 rounded-full"></div> Super Admin</div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 bg-primary-500 rounded-full"></div> Panitia</div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Peserta</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Details</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role / Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600 bg-white">
              {loading ? (
                <tr><td colSpan="3" className="px-6 py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary-500" /></td></tr>
              ) : activeTab === 'superadmin' || activeTab === 'admin' ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ${user.role === 'superadmin' ? 'bg-slate-900' : 'bg-primary-500'}`}>{user.name.charAt(0)}</div>
                        <div><p className="font-black text-slate-900 text-base">{user.name}</p><p className="text-xs font-bold text-slate-400 mt-0.5">@{user.username}</p></div>
                      </div>
                    </td>
                    <td className="px-10 py-6"><span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${user.role === 'superadmin' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-primary-50 text-primary-600 border-primary-100'}`}>{user.role}</span></td>
                    <td className="px-10 py-6 text-right space-x-2">
                      <button onClick={() => handleOpenModal(user)} className="p-3 hover:bg-white hover:shadow-lg rounded-2xl text-slate-400 hover:text-blue-600 border border-transparent transition-all"><Edit className="w-5 h-5" /></button>
                      {user.role !== 'superadmin' && <button onClick={() => confirmDelete(user.id, user.role, user.name)} className="p-3 hover:bg-white hover:shadow-lg rounded-2xl text-slate-400 hover:text-red-600 border border-transparent transition-all"><Trash2 className="w-5 h-5" /></button>}
                    </td>
                  </tr>
                ))
              ) : (
                filteredPendaftars.map((pendaftar) => (
                  <tr key={pendaftar.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-lg">{pendaftar.name.charAt(0)}</div>
                        <div><p className="font-black text-slate-900 text-base">{pendaftar.name}</p><p className="text-xs font-bold text-slate-400 mt-0.5">NIK: {pendaftar.nik}</p></div>
                      </div>
                    </td>
                    <td className="px-10 py-6"><span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100">Pendaftar</span></td>
                    <td className="px-10 py-6 text-right space-x-2">
                      <button onClick={() => handleOpenModal(pendaftar)} className="p-3 hover:bg-white hover:shadow-lg rounded-2xl text-slate-400 hover:text-blue-600 border border-transparent transition-all"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => handleResetPasswordPendaftar(pendaftar.id, pendaftar.name)} className="p-3 hover:bg-white hover:shadow-lg rounded-2xl text-slate-400 hover:text-amber-600 border border-transparent transition-all"><Lock className="w-5 h-5" /></button>
                      <button onClick={() => confirmDelete(pendaftar.id, 'pendaftar', pendaftar.name)} className="p-3 hover:bg-white hover:shadow-lg rounded-2xl text-slate-400 hover:text-red-600 border border-transparent transition-all"><Trash2 className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 MODAL CRUD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden">
              <div className={`p-8 ${activeTab === 'superadmin' ? 'bg-slate-900' : activeTab === 'admin' ? 'bg-primary-600' : 'bg-emerald-600'} text-white`}>
                <h3 className="font-black text-2xl tracking-tight">{editingUser ? 'Perbarui Data' : 'Tambah Akun'}</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Lengkapi data autentikasi pengguna</p>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input type="text" className={`w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none border-2 transition-all ${fieldErrors.name ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-primary-500'}`} value={formData.name} onChange={(e) => { setFormData({...formData, name: e.target.value}); setFieldErrors({...fieldErrors, name: ''}); }} />
                    {fieldErrors.name && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{fieldErrors.name}</p>}
                  </div>
                  {activeTab !== 'pendaftar' ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Username {activeTab} <span className="text-red-500">*</span></label>
                      <input type="text" className={`w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none border-2 transition-all ${fieldErrors.username ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-primary-500'}`} placeholder="username" value={formData.username} onChange={(e) => { setFormData({...formData, username: e.target.value}); setFieldErrors({...fieldErrors, username: ''}); }} />
                      {fieldErrors.username && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{fieldErrors.username}</p>}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">NIK (16 Digit) <span className="text-red-500">*</span></label>
                      <input type="text" maxLength="16" className={`w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none border-2 transition-all ${fieldErrors.nik ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-emerald-500'}`} value={formData.nik} onChange={(e) => { setFormData({...formData, nik: e.target.value}); setFieldErrors({...fieldErrors, nik: ''}); }} />
                      {fieldErrors.nik && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{fieldErrors.nik}</p>}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Akses Password {!editingUser && <span className="text-red-500">*</span>}</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} className={`w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none border-2 transition-all ${fieldErrors.password ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-primary-500'}`} value={formData.password} onChange={(e) => { setFormData({...formData, password: e.target.value}); setFieldErrors({...fieldErrors, password: ''}); }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                    </div>
                    {fieldErrors.password && <p className="text-[10px] font-bold text-red-500 pl-1 animate-pulse">{fieldErrors.password}</p>}
                    {editingUser && <p className="text-[10px] font-bold text-slate-400 pl-1">Kosongkan jika tidak ingin mengubah password.</p>}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest">Batal</button>
                  <button type="submit" disabled={submitting} className={`flex-1 py-5 ${activeTab === 'superadmin' ? 'bg-slate-900' : activeTab === 'admin' ? 'bg-primary-600' : 'bg-emerald-600'} text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2`}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {editingUser ? 'Update' : 'Buat Akun'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚠️ DELETE MODAL */}
      <AnimatePresence>
        {deleteConfig.show && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[3rem] p-10 text-center space-y-6 shadow-2xl overflow-hidden border-t-8 border-red-500">
              <button onClick={() => setDeleteConfig({ ...deleteConfig, show: false })} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><AlertCircle className="w-10 h-10" /></div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Hapus Data?</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Apakah Anda yakin ingin menghapus <b>{deleteConfig.name}</b>? Tindakan ini tidak dapat dibatalkan dan data akan hilang secara permanen.</p>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
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

export default UserManagement;
