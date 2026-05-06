const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendStatusUpdateEmail = async (studentEmail, studentName, status, reason = '') => {
  if (!process.env.EMAIL_USER) return; // Skip if email not configured

  let statusText = '';
  let color = '#000000';
  
  switch(status) {
    case 'accepted': 
      statusText = 'DITERIMA'; 
      color = '#10B981';
      break;
    case 'rejected': 
      statusText = 'DITOLAK'; 
      color = '#EF4444';
      break;
    case 'verified': 
      statusText = 'TERVERIFIKASI'; 
      color = '#3B82F6';
      break;
    default: 
      statusText = 'PENDING';
  }

  const mailOptions = {
    from: `"Panitia PPDB MTsN 3 Sanggau" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: `Update Status Pendaftaran PPDB - ${studentName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #1e293b; text-align: center;">Update Status Pendaftaran</h2>
        <p>Halo <strong>${studentName}</strong>,</p>
        <p>Kami ingin menginformasikan bahwa status pendaftaran Anda di PPDB MTsN 3 Sanggau telah diperbarui menjadi:</p>
        
        <div style="background-color: ${color}; color: white; padding: 15px; text-align: center; font-size: 20px; font-weight: bold; border-radius: 8px; margin: 20px 0;">
          ${statusText}
        </div>

        ${reason ? `<p style="background-color: #f8fafc; padding: 10px; border-left: 4px solid #cbd5e1;">Catatan: ${reason}</p>` : ''}

        <p>Silakan login ke portal pendaftaran untuk informasi lebih lanjut atau mengunduh dokumen yang diperlukan.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login ke Portal</a>
        </div>
        
        <hr style="margin-top: 40px; border: 0; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #64748b; text-align: center;">
          Ini adalah email otomatis, mohon tidak membalas email ini.<br>
          © 2026 Panitia PPDB MTsN 3 Sanggau
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${studentEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendStatusUpdateEmail };
