/**
 * Map technical error messages to user-friendly Indonesian messages.
 */
export const mapErrorMessage = (error) => {
  if (!error) return 'Terjadi kesalahan yang tidak diketahui.';

  let message = '';
  const technicalMessage = typeof error === 'string' ? error : (error.response?.data?.message || error.message || '');

  // Common technical patterns
  if (technicalMessage.includes('500') || technicalMessage.includes('Internal Server Error')) {
    message = 'Terjadi kesalahan pada sistem. Silakan coba lagi beberapa saat.';
  } else if (technicalMessage.includes('Network Error') || technicalMessage.includes('Failed to fetch')) {
    message = 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
  } else if (technicalMessage.includes('401') || technicalMessage.includes('Unauthorized')) {
    message = 'Sesi Anda telah berakhir atau Anda tidak memiliki akses. Silakan masuk kembali.';
  } else if (technicalMessage.includes('403') || technicalMessage.includes('Forbidden')) {
    message = 'Akses ditolak. Anda tidak memiliki izin untuk melakukan aksi ini.';
  } else if (technicalMessage.includes('404') || technicalMessage.includes('not found')) {
    message = 'Data tidak ditemukan. Mungkin data sudah dihapus atau dipindahkan.';
  } else if (technicalMessage.includes('null value') || technicalMessage.includes('cannot be null')) {
    message = 'Data tidak lengkap. Pastikan semua kolom wajib sudah diisi dengan benar.';
  } else if (technicalMessage.includes('Validation error') || technicalMessage.includes('invalid')) {
    message = 'Data yang Anda masukkan tidak valid. Silakan periksa kembali.';
  } else if (technicalMessage.includes('ECONNREFUSED')) {
    message = 'Server sedang tidak dapat dijangkau. Silakan hubungi administrator.';
    // If we have a specific message from backend, use it directly so the user knows what to fix.
    // E.g., "Mohon lengkapi data wajib (NIK, Nama, Gender...)" or "NIK harus 16 digit angka"
    message = technicalMessage || 'Maaf, terjadi kendala saat memproses permintaan Anda. Silakan coba lagi.';
  }

  return message;
};

export const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const validatePhone = (phone) => {
  return /^[0-9]+$/.test(phone) && phone.length >= 9;
};
