const { sendStatusUpdateEmail } = require('../services/mailService');
const { User } = require('../models');

/**
 * Notification Helper for PMB MTs
 * This utility handles automated messaging to students/parents.
 * Currently mocked - can be connected to Fonnte, Twilio, or other WA Gateways.
 */

const sendWhatsApp = async (to, message) => {
  try {
    // Mocking WA API Call
    console.log(`[WA NOTIFICATION] To: ${to} | Message: ${message}`);
    
    // Example for Fonnte integration:
    /*
    const response = await axios.post('https://api.fonnte.com/send', {
      target: to,
      message: message,
    }, {
      headers: { 'Authorization': process.env.FONNTE_TOKEN }
    });
    return response.data;
    */

    return { success: true, message: 'Mock sent' };
  } catch (error) {
    console.error('WhatsApp Notification Error:', error);
    return { success: false, error: error.message };
  }
};

const notifyStatusChange = async (pendaftar, newStatus) => {
  const phone = pendaftar.parentPhone;
  if (!phone) return;

  let message = '';
  const schoolName = 'MTs Negeri 3 Sanggau'; 

  switch (newStatus) {
    case 'verified':
      message = `Halo ${pendaftar.name},\n\nBerkas pendaftaran Anda di ${schoolName} telah diverifikasi oleh panitia. Silakan pantau terus akun Anda untuk informasi jadwal seleksi/tes.\n\nTerima kasih.`;
      break;
    case 'accepted':
      message = `Selamat ${pendaftar.name}!\n\nAnda dinyatakan LULUS/DITERIMA di ${schoolName}. Silakan lakukan daftar ulang sesuai jadwal yang ditentukan.\n\nInfo lebih lanjut: [Link Web]`;
      break;
    case 'rejected':
      message = `Halo ${pendaftar.name},\n\nBerkas pendaftaran Anda belum dapat diverifikasi / ditolak.\nAlasan: ${pendaftar.verificationMessage || 'Berkas tidak sesuai ketentuan'}\n\nSilakan login ke akun Anda untuk memperbaiki data.\n\nTerima kasih.`;
      break;
    default:
      return;
  }

  // Send WA
  const waPromise = sendWhatsApp(phone, message);
  
  // Send Email if possible
  const emailPromise = (async () => {
    try {
      const student = await pendaftar.getUser();
      if (student && student.username && student.username.includes('@')) {
        await sendStatusUpdateEmail(student.username, pendaftar.name, newStatus, pendaftar.verificationMessage);
      }
    } catch (e) {
      console.error('Email notify error:', e);
    }
  })();

  return await Promise.all([waPromise, emailPromise]);
};

module.exports = { sendWhatsApp, notifyStatusChange };
