import React, { useState } from 'react';
import { Printer, Loader2 } from 'lucide-react';
import API from '../services/api';

const PrintProof = ({ data }) => {
  const [loading, setLoading] = useState(false);

  if (!data) return null;

  const handlePrint = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/user/print-bukti-v3/${data.id}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Cleanup
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('Gagal mencetak bukti:', err);
      alert('Gagal mengambil dokumen. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePrint}
      disabled={loading}
      className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 group disabled:opacity-70"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Printer className="w-4 h-4 group-hover:rotate-12 transition-transform" />
      )}
      {loading ? 'Menyiapkan...' : 'Cetak Bukti Pendaftaran'}
    </button>
  );
};

export default PrintProof;
