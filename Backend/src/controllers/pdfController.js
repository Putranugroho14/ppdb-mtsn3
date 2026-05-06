const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const { Pendaftar, User, DaftarUlang, HasilSeleksi, SetupPPDB } = require('../models');

/**
 * Helper to draw a checkbox
 */
const drawCheckbox = (doc, x, y, checked = false, label = '', size = 10) => {
  doc.rect(x, y, size, size).stroke();
  if (checked) {
    // Adjusted checkmark position to sit in the center of the box
    doc.font('ZapfDingbats').fontSize(size).text('4', x + 1.5, y + 1.5, { lineBreak: false });
  }
  if (label) {
    doc.font('Times-Roman').fontSize(9).fillColor('#000000').text(label, x + size + 5, y + 1);
  }
};

/**
 * Generate Bukti Pendaftaran PDF - Initial (1 Page)
 */
const generateBuktiPendaftaran = async (req, res) => {
  try {
    const { id } = req.params;
    const pendaftar = await Pendaftar.findByPk(id);

    if (!pendaftar) return res.status(404).json({ message: 'Data tidak ditemukan' });

    const doc = new PDFDocument({
      margin: 30,
      size: 'A4',
      info: {
        Title: `Bukti_Pendaftaran_Awal_${pendaftar.name}`,
        Author: 'MTs Negeri 3 Sanggau'
      }
    });
    res.setHeader('Content-disposition', `inline; filename="Bukti_Pendaftaran_Awal_${pendaftar.name}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    // --- Header ---
    try {
      doc.image(path.join(__dirname, '../assets/logo_kemenag.png'), 40, 35, { width: 55 });
      doc.image(path.join(__dirname, '../assets/logo_mts.jpg'), 485, 35, { width: 55 });
    } catch (e) { }

    doc.font('Times-Bold').fontSize(12).text('KEMENTERIAN AGAMA RI', 0, 35, { align: 'center' });
    doc.fontSize(11).text('KANTOR KEMENTERIAN AGAMA KABUPATEN SANGGAU', { align: 'center' });
    doc.fontSize(13).text('MADRASAH TSANAWIYAH NEGERI 3 SANGGAU', { align: 'center' });
    doc.font('Times-Roman').fontSize(9).text('NPSN : 30112343                  Akreditasi : B                  NSM : 121161030003', { align: 'center' });
    doc.fontSize(9).text('Jl. Kiemas Anang No. 1 Tayan 78654. Website : www.mtsnegeri3sanggau.sch.id', { align: 'center' });

    doc.moveTo(40, 105).lineTo(555, 105).lineWidth(1.5).stroke();
    doc.moveDown(1.5);

    // --- Title ---
    doc.font('Times-Bold').fontSize(11).text('TANDA BUKTI PENDAFTARAN', { align: 'center' });
    doc.text('PENERIMAAN PESERTA DIDIK BARU (PPDB)', { align: 'center' });
    doc.text('TAHUN PELAJARAN 2024/2025', { align: 'center' });
    doc.moveDown(0.5);

    // --- Section 1: Data Calon Peserta Didik (Boxed, No Internal Grid) ---
    const dataBoxTop = doc.y;
    const boxWidth = 515;
    const boxX = 40;
    
    // Header Bar
    doc.rect(boxX, dataBoxTop, boxWidth, 20).fill('#E0E0E0').stroke();
    doc.fillColor('#000000').font('Times-Bold').fontSize(10).text('DATA CALON PESERTA DIDIK', boxX, dataBoxTop + 5, { align: 'center' });
    
    // Line below header text
    doc.moveTo(boxX, dataBoxTop + 20).lineTo(boxX + boxWidth, dataBoxTop + 20).stroke();

    let currentY = dataBoxTop + 25;
    const labelX = boxX + 10;
    const colonX = boxX + 160;
    const valueX = boxX + 175;

    const renderRow = (label, value) => {
      const valStr = (value || '-').toString().toUpperCase();
      const valueHeight = doc.heightOfString(valStr, { width: boxWidth - 180 });
      const rowHeight = Math.max(14, valueHeight);

      doc.font('Times-Roman').fontSize(9).text(label, labelX, currentY);
      doc.text(':', colonX, currentY);
      doc.text(valStr, valueX, currentY, { width: boxWidth - 180, align: 'justify' });
      
      currentY += rowHeight + 2;
    };

    renderRow('Nomor Pendaftaran', pendaftar.registrationNumber);
    renderRow('Tanggal Pendaftaran', new Date(pendaftar.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    renderRow('Nama Lengkap', pendaftar.name);
    renderRow('Nomor Induk Siswa Nasional (NISN)', pendaftar.nisn);
    renderRow('Jenis Kelamin', pendaftar.gender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN');
    renderRow('Tempat Lahir', pendaftar.birthPlace);
    renderRow('Tanggal Lahir', pendaftar.birthDate ? new Date(pendaftar.birthDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-');
    renderRow('Alamat', pendaftar.address);
    doc.moveDown(0.5); currentY = doc.y;
    renderRow('Nama Ayah Kandung', pendaftar.parentName);
    renderRow('Nama Ibu Kandung', pendaftar.ibuNama);
    renderRow('Asal Madrasah/Sekolah', pendaftar.schoolOrigin);
    renderRow('Tahun Lulus', pendaftar.graduationYear);

    // Close Section 1 Box
    const dataBoxHeight = currentY - dataBoxTop;
    doc.rect(boxX, dataBoxTop, boxWidth, dataBoxHeight).stroke();

    // --- Section 2: Informasi Penting (Boxed) ---
    // Start exactly at the bottom of the previous box to JOIN them
    const infoBoxTop = dataBoxTop + dataBoxHeight;
    doc.font('Times-Bold').fontSize(9).fillColor('#000000').text('INFORMASI PENTING', boxX + 5, infoBoxTop + 5);
    currentY = infoBoxTop + 15;

    const linkText = 'www.mtsnegeri3sanggau.sch.id';
    const ppdbLinkText = 'https://ppdb.mtsnegeri3sanggau.sch.id';

    const infoList = [
      'Simpanlah baik-baik Tanda Bukti Pendaftaran ini dan WAJIB dibawa saat mengikuti seleksi tes membaca teks/Al-Qur’an pada tanggal 27 Mei 2024 bertempat di MTs Negeri 3 Sanggau. Informasi dapat dilihat pada website: ',
      'Ikuti selalu perkembangan berita PPDB pada website: ',
      'Pengumuman hasil seleksi akan di informasikan pada tanggal 27 Mei 2024 dengan media sebagai berikut :',
      'Calon Peserta Didik yang dinyatakan telah DITERIMA wajib mengisi data diri dengan lengkap sebelum pendaftaran ulang, dengan cara login kembali ke akun anda di ',
      'Pada saat Registrasi atau Pendaftaran Ulang setelah Calon Peserta Didik dinyatakan DITERIMA, persyaratan administrasi yang wajib dibawa dan dikumpulkan kepada Panitia adalah sebagai berikut :'
    ];

    infoList.forEach((text, i) => {
      doc.font('Times-Roman').fontSize(8).fillColor('#000000');
      doc.text(`${i + 1}.`, boxX + 10, currentY);

      if (i === 0 || i === 1) {
        doc.text(text, boxX + 25, currentY, { continued: true });
        doc.fillColor('#0000FF').text(linkText, { underline: true });
      } else if (i === 3) {
        doc.text(text, boxX + 25, currentY, { continued: true });
        doc.fillColor('#0000FF').text(ppdbLinkText, { underline: true });
      } else {
        doc.text(text, boxX + 25, currentY, { width: boxWidth - 35, align: 'justify' });
      }
      currentY = doc.y + 1;

      if (i === 2) {
        doc.fillColor('#000000').text('a.', boxX + 35, currentY);
        doc.text('website: ', boxX + 50, currentY, { continued: true });
        doc.fillColor('#0000FF').text(linkText, { underline: true, continued: true });
        doc.fillColor('#000000').text(', Whatsapp: ', { underline: false, continued: true });
        doc.font('Times-Bold').text('0895-3710-07103', { continued: true });
        doc.font('Times-Roman').text(', Email: ', { continued: true });
        doc.fillColor('#008000').text('ppdb@mtsnegeri3sanggau.sch.id.', { continued: false });
        currentY = doc.y + 1;

        doc.fillColor('#000000').text('b.', boxX + 35, currentY);
        doc.text('Nomor Whatsapp atau email calon peserta didik yang dicantumkan saat pendaftaran.', boxX + 50, currentY, { width: boxWidth - 65 });
        currentY = doc.y + 1;

        doc.text('c.', boxX + 35, currentY);
        doc.text('Pemberitahuan pada akun Calon Peserta Didik dapat di akses dan di cek secara berkala di ', boxX + 50, currentY, { continued: true });
        doc.fillColor('#0000FF').text(ppdbLinkText, { underline: true });
        currentY = doc.y + 1;
      }

      if (i === 4) {
        [
          ['a.', 'Fotokopi Kartu NISN atau jika tidak memiliki maka diganti dengan Surat Keterangan NISN dari Kepala Sekolah/Madrasah asal.'],
          ['b.', 'Fotokopi Kartu Keluarga 1 lembar.'],
          ['c.', 'Fotokopi Akta Kelahiran 1 lembar.'],
          ['d.', 'Fotokopi Rapor kelas 4 (Ganjil dan Genap), 5 (Ganjil dan Genap), dan 6 (Ganjil).'],
          ['e.', 'Fotokopi Surat Keterangan Lulus (SKL) 1 lembar.'],
          ['f.', 'Jika ada, harap dibawa fotokopi Kartu Indonesia Pintar (KIP) / Kartu Keluarga Sejahtera (KKS) / Program Keluarga Harapan (PKH) 1 lembar.'],
          ['g.', 'Jika ada, harap dibawa asli Surat Keterangan Tidak Mampu (SKTM) dari Kepala Desa/Lurah.'],
          ['h.', 'Materai 10.000 1 lembar.']
        ].forEach(([bullet, sub]) => {
          doc.fillColor('#000000').text(bullet, boxX + 35, currentY);
          doc.text(sub, boxX + 50, currentY, { width: boxWidth - 65 });
          currentY = doc.y + 1;
        });
      }
    });

    doc.font('Times-Bold').fillColor('#000000').text('Berkas persyaratan administrasi dimasukkan ke dalam ', boxX + 10, currentY, { continued: true });
    doc.fillColor('#0000FF').text('map warna Biru untuk Laki-laki ', { continued: true });
    doc.fillColor('#000000').text('dan ', { continued: true });
    doc.fillColor('#FF0000').text('map warna Merah untuk perempuan', { continued: false });
    doc.fillColor('#000000');
    
    currentY = doc.y + 5;
    const infoBoxHeight = currentY - infoBoxTop;
    doc.rect(boxX, infoBoxTop, boxWidth, infoBoxHeight).stroke();

    // --- Section 3: Signature Box ---
    // Start exactly at the bottom of the previous box to JOIN them
    const sigBoxTop = infoBoxTop + infoBoxHeight;
    const sigBoxHeight = 135;
    doc.rect(boxX, sigBoxTop, boxWidth, sigBoxHeight).stroke();

    const sigDate = new Date(pendaftar.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

    doc.font('Times-Roman').fontSize(9).fillColor('#000000');
    // Row 1
    const colW = boxWidth / 3;
    doc.text('Mengetahui,', boxX, sigBoxTop + 8, { width: colW, align: 'center' });
    doc.text(`Tayan, ${sigDate}`, boxX + 2 * colW, sigBoxTop + 8, { width: colW, align: 'center' });

    // Row 2
    let sigY = sigBoxTop + 33;
    doc.text('Orang Tua/Wali Siswa', boxX, sigY, { width: colW, align: 'center' });
    doc.text('Siswa Terdaftar', boxX + colW, sigY, { width: colW, align: 'center' });
    doc.text('Ketua Panitia PPDB', boxX + 2 * colW, sigY, { width: colW, align: 'center' });

    // Row 3 (QR Code)
    const qrData = `PPDB-VERIFIED|${pendaftar.registrationNumber}|${pendaftar.name}`;
    const qrImage = await QRCode.toDataURL(qrData);
    doc.image(qrImage, boxX + 2 * colW + (colW - 60) / 2, sigY + 12, { width: 60 });

    // Row 4 (Names)
    const nameY = sigBoxTop + sigBoxHeight - 15;
    doc.font('Times-Bold').fontSize(10).fillColor('#000000');
    doc.text((pendaftar.parentName || '....................').toUpperCase(), boxX, nameY, { width: colW, align: 'center' });
    doc.text(pendaftar.name?.toUpperCase(), boxX + colW, nameY, { width: colW, align: 'center' });
    doc.text('NANDA LUTHFIA, S.PD', boxX + 2 * colW, nameY, { width: colW, align: 'center' });

    doc.end();
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/**
 * Generate Kartu Peserta Seleksi (1 Page)
 */
const generateKartuPeserta = async (req, res) => {
  try {
    const { id } = req.params;
    const pendaftar = await Pendaftar.findByPk(id);

    if (!pendaftar) return res.status(404).json({ message: 'Data tidak ditemukan' });

    // Get active setup for test date
    const setup = await SetupPPDB.findOne({ where: { isActive: true } });

    const doc = new PDFDocument({ 
      margin: 30, 
      size: 'A4',
      info: {
        Title: `Kartu_Peserta_${pendaftar.name}`,
        Author: 'MTs Negeri 3 Sanggau'
      }
    });

    res.setHeader('Content-disposition', `inline; filename="Kartu_Peserta_${pendaftar.name}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    // --- Header ---
    try {
      doc.image(path.join(__dirname, '../assets/logo_kemenag.png'), 40, 35, { width: 55 });
      doc.image(path.join(__dirname, '../assets/logo_mts.jpg'), 485, 35, { width: 55 });
    } catch (e) { }

    doc.font('Times-Bold').fontSize(12).text('KEMENTERIAN AGAMA RI', 0, 35, { align: 'center' });
    doc.fontSize(11).text('KANTOR KEMENTERIAN AGAMA KABUPATEN SANGGAU', { align: 'center' });
    doc.fontSize(13).text('MADRASAH TSANAWIYAH NEGERI 3 SANGGAU', { align: 'center' });
    doc.font('Times-Roman').fontSize(9).text('NPSN : 30112343                  Akreditasi : B                  NSM : 121161030003', { align: 'center' });
    doc.fontSize(9).text('Jl. Gusti Dja\'far No. 61 Tayan 78654. Website : www.mtsnegeri3sanggau.sch.id', { align: 'center' });

    doc.moveTo(40, 105).lineTo(555, 105).lineWidth(1.5).stroke();
    doc.moveDown(1.5);

    // --- Title ---
    doc.font('Times-Bold').fontSize(12).text('KARTU PESERTA SELEKSI', { align: 'center' });
    doc.text('PENERIMAAN PESERTA DIDIK BARU (PPDB)', { align: 'center' });
    doc.text(`TAHUN PELAJARAN ${setup?.tahun || '2026/2027'}`, { align: 'center' });
    doc.moveDown(1);

    // --- Main Layout ---
    const startY = doc.y;
    const boxX = 40;
    const boxW = 515;
    
    // Photo Placeholder
    const photoW = 90;
    const photoH = 120;
    doc.rect(boxX + 10, startY, photoW, photoH).stroke();
    doc.font('Times-Roman').fontSize(8).text('PAS FOTO\n3 X 4', boxX + 10, startY + 50, { width: photoW, align: 'center' });

    // Data Info
    const infoX = boxX + photoW + 30;
    let currentY = startY;

    const renderInfo = (label, value) => {
      doc.font('Times-Bold').fontSize(10).text(label, infoX, currentY);
      doc.font('Times-Roman').fontSize(11).text(value || '-', infoX + 120, currentY);
      currentY += 20;
    };

    renderInfo('No. Pendaftaran', pendaftar.registrationNumber);
    renderInfo('Nama Lengkap', pendaftar.name?.toUpperCase());
    renderInfo('NISN', pendaftar.nisn);
    renderInfo('Asal Sekolah', pendaftar.schoolOrigin?.toUpperCase());
    currentY += 10;
    
    // Schedule Box
    doc.rect(infoX, currentY, 300, 60).fill('#F8FAFC').stroke('#E2E8F0');
    doc.fillColor('#000000').font('Times-Bold').fontSize(9).text('JADWAL SELEKSI:', infoX + 10, currentY + 10);
    
    const testDate = setup?.tanggalTest || 'Akan Diinformasikan';
    doc.font('Times-Roman').fontSize(10).text(`Hari/Tanggal : ${testDate}`, infoX + 10, currentY + 25);
    doc.text('Waktu            : 08.00 WIB s/d Selesai', infoX + 10, currentY + 40);

    // QR Code & Validation
    const footerY = startY + photoH + 40;
    const qrData = `KARTU-PESERTA|${pendaftar.registrationNumber}|${pendaftar.name}`;
    const qrImage = await QRCode.toDataURL(qrData);
    doc.image(qrImage, boxX + 10, footerY, { width: 70 });
    
    doc.font('Times-Italic').fontSize(8).text('* Kartu ini wajib dibawa saat pelaksanaan tes seleksi.', boxX + 90, footerY + 10);
    doc.text('* Harap hadir 15 menit sebelum tes dimulai.', boxX + 90, footerY + 22);
    doc.text('* Menggunakan seragam sekolah asal yang rapi dan sopan.', boxX + 90, footerY + 34);

    // Signature
    const sigX = 380;
    doc.font('Times-Roman').fontSize(10).text('Tayan, ...........................', sigX, footerY);
    doc.text('Panitia PPDB,', sigX, footerY + 15);
    doc.moveDown(4);
    doc.font('Times-Bold').text('...........................................', sigX, doc.y);

    doc.end();
  } catch (err) { res.status(500).json({ message: err.message }); }
};
;
;

/**
 * NEW: Generate Multi-Page Registration Form (EMIS Standard) - 4 Pages
 */
const generateBuktiDaftarUlang = async (req, res) => {
  try {
    const { id } = req.params;
    const pendaftar = await Pendaftar.findByPk(id, {
      include: [DaftarUlang, HasilSeleksi]
    });

    if (!pendaftar) return res.status(404).json({ message: 'Data tidak ditemukan' });

    const du = pendaftar.DaftarUlang || {};

    const doc = new PDFDocument({
      margin: 30,
      size: 'A4',
      info: {
        Title: `Bukti_Lolos_Daftar_Ulang_${pendaftar.name}`,
        Author: 'MTs Negeri 3 Sanggau'
      }
    });
    res.setHeader('Content-disposition', `inline; filename="Bukti_Lolos_Daftar_Ulang_${pendaftar.name}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    // --- SHARED HEADER FUNCTION ---
    const drawHeader = (pageNum) => {
      if (pageNum !== 1) return; // Hanya halaman 1 yang punya header

      try {
        doc.image(path.join(__dirname, '../assets/logo_kemenag.png'), 40, 35, { width: 50 });
      } catch (e) { }

      // Top Right Header Info
      doc.font('Times-Bold').fontSize(9).fillColor('#000000').text('PPDB ONLINE', 450, 35, { align: 'right' });
      doc.font('Times-Italic').fontSize(8).fillColor('#0000FF').text('www.mtsnegeri3sanggau.sch.id', 450, 46, { align: 'right', underline: true });
      doc.fillColor('#000000'); // Reset color

      doc.font('Times-Bold').fontSize(11).text('KEMENTERIAN AGAMA RI', 0, 35, { align: 'center' });
      doc.fontSize(10).text('KANTOR KEMENTERIAN AGAMA KABUPATEN SANGGAU', { align: 'center' });
      doc.fontSize(12).text('MADRASAH TSANAWIYAH NEGERI 3 SANGGAU', { align: 'center' });
      doc.font('Times-Roman').fontSize(8).text('NPSN : 30112343                  Akreditasi : B                  NSM : 121161030003', { align: 'center' });
      doc.fontSize(8).text('Alamat : Jl. Gusti Dja\'far Nomor 61 Tayan 78654. Website : www.mtsnegeri3sanggau.sch.id', { align: 'center' });

      doc.moveTo(40, 95).lineTo(555, 95).lineWidth(1.5).stroke();
      doc.moveTo(40, 97).lineTo(555, 97).lineWidth(0.5).stroke();
      doc.moveDown(1.5);
    };

    const drawFooter = (pageNum) => {
      doc.moveTo(40, 785).lineTo(555, 785).lineWidth(0.5).stroke();
      doc.font('Times-Roman').fontSize(8).fillColor('#666666').text(`${pageNum} / 4`, 540, 790);
      doc.fillColor('#000000');
    };

    // ==========================================
    // PAGE 1: DATA SISWA & ORANG TUA (PART 1)
    // ==========================================
    drawHeader(1);

    doc.font('Times-Bold').fontSize(12).text('FORMULIR REGISTRASI PPDB TAHUN 2025', { align: 'center', underline: true });
    doc.fontSize(10).text(`Nomor Pendaftaran : ${pendaftar.registrationNumber}`, { align: 'center' });
    doc.moveDown(0.5);

    const leftCol = 40;
    const midCol = 195;
    const valueCol = 210;
    let currentY = doc.y;

    const renderRow = (label, value, isBold = false) => {
      if (currentY > 780) return; 
      doc.font('Times-Roman').fontSize(8.5).text(label, leftCol, currentY);
      doc.text(':', midCol, currentY);
      doc.font(isBold ? 'Times-Bold' : 'Times-Roman').text(value || '', valueCol, currentY, { width: 330, lineBreak: false });
      currentY += 11.5;
    };

    doc.font('Times-Bold').fontSize(10).text('I. DATA SISWA', leftCol, currentY);
    currentY += 14;

    renderRow('1. Nama Lengkap', pendaftar.name?.toUpperCase(), true);
    renderRow('2. Nomor Induk Siswa Nasional (NISN)', pendaftar.nisn);
    renderRow('3. Nomor Induk Kependudukan (NIK)', pendaftar.nik);
    renderRow('4. Kewarganegaraan', 'INDONESIA');
    renderRow('5. Tempat Lahir', pendaftar.birthPlace?.toUpperCase());
    renderRow('6. Tanggal Lahir', pendaftar.birthDate);
    renderRow('7. Jenis Kelamin', pendaftar.gender === 'L' ? 'Laki-laki' : 'Perempuan');
    renderRow('8. Jumlah Saudara', `${du.jumlahSaudara || 0}`);
    renderRow('9. Anak Ke', `${du.anakKe || 1}`);
    renderRow('10. Agama', (pendaftar.agama || 'Islam').replace(/^\d+\s*-\s*/, ''));
    renderRow('11. Cita-cita', (du.citaCita || '-').toUpperCase());
    renderRow('12. Nomor Handphone (HP)', pendaftar.parentPhone);
    renderRow('13. Alamat Email', (pendaftar.email || '-').toLowerCase());
    renderRow('14. Hobi', (du.hobi || '-').toUpperCase());
    renderRow('15. Yang Membiayai Sekolah', (du.yangMembiayai || 'Orang Tua').toUpperCase());
    renderRow('16. Kebutuhan Khusus', (du.kebutuhanKhusus || 'Tidak Ada').toUpperCase());

    // 17. Kebutuhan Disabilitas (GRID)
    doc.font('Times-Roman').fontSize(9).text('17. Kebutuhan Disabilitas', leftCol, currentY);
    doc.text(':', midCol, currentY);
    let checkY = currentY;
    drawCheckbox(doc, valueCol, checkY, false, 'Tidak Ada');
    drawCheckbox(doc, valueCol + 110, checkY, false, 'Tuna Netra');
    drawCheckbox(doc, valueCol + 220, checkY, false, 'Lainnya');
    checkY += 14;
    drawCheckbox(doc, valueCol, checkY, false, 'Tuna Rungu');
    drawCheckbox(doc, valueCol + 110, checkY, false, 'Tuna Laras');
    checkY += 14;
    drawCheckbox(doc, valueCol, checkY, false, 'Tuna Grahita');
    drawCheckbox(doc, valueCol + 110, checkY, false, 'Tuna Daksa');
    currentY = checkY + 18;

    // 18. Pra Sekolah (CHECKBOX)
    doc.font('Times-Roman').fontSize(9).text('18. Pra Sekolah', leftCol, currentY);
    doc.text(':', midCol, currentY);
    drawCheckbox(doc, valueCol, currentY, false, '1. Pernah TK/RA');
    drawCheckbox(doc, valueCol + 120, currentY, false, '2. Pernah PAUD');
    currentY += 18;

    // 19. Imunisasi (GRID)
    doc.font('Times-Roman').fontSize(9).text('19. Imunisasi', leftCol, currentY);
    doc.text(':', midCol, currentY);
    drawCheckbox(doc, valueCol, currentY, false, 'Hepatitis B');
    drawCheckbox(doc, valueCol + 75, currentY, false, 'BCG');
    drawCheckbox(doc, valueCol + 125, currentY, false, 'DPT');
    drawCheckbox(doc, valueCol + 175, currentY, false, 'Polio');
    drawCheckbox(doc, valueCol + 225, currentY, false, 'Campak');
    drawCheckbox(doc, valueCol + 285, currentY, false, 'Covid');
    currentY += 18;

    renderRow('20. Nomor Kartu Indonesia Pintar (KIP)', du.noKIP || '0');

    doc.font('Times-Roman').fontSize(9).text('21. Kartu Keluarga (KK)', leftCol, currentY);
    doc.text(':', midCol, currentY);
    currentY += 12;
    doc.text('- Nomor KK', leftCol + 15, currentY);
    doc.text(':', midCol, currentY);
    doc.text(pendaftar.noKK || '', valueCol, currentY);
    currentY += 12;
    doc.text('- Nama Kepala Keluarga', leftCol + 15, currentY);
    doc.text(':', midCol, currentY);
    doc.text((pendaftar.namaKepalaKeluarga || '').toUpperCase(), valueCol, currentY);
    currentY += 22;

    doc.font('Times-Bold').fontSize(10).text('II. DATA ORANG TUA / WALI', leftCol, currentY);
    currentY += 14;

    doc.font('Times-Bold').fontSize(9).text('A. Ayah Kandung', leftCol + 5, currentY);
    currentY += 12;
    doc.font('Times-Roman').fontSize(9).text('   1. Status', leftCol, currentY);
    doc.text(':', midCol, currentY);
    drawCheckbox(doc, valueCol, currentY, false, 'Masih Ada');
    drawCheckbox(doc, valueCol + 120, currentY, false, 'Sudah Meninggal');
    drawCheckbox(doc, valueCol + 240, currentY, false, 'Tidak Diketahui');
    currentY += 14;
    renderRow('   2. Nama Lengkap', (du.namaAyah || pendaftar.parentName)?.toUpperCase(), true);
    renderRow('   3. Kewarganegaraan', 'INDONESIA');
    renderRow('   4. NIK', du.nikAyah || pendaftar.ayahNik);
    renderRow('   5. Tempat Lahir', (du.tempatLahirAyah || '').toUpperCase());
    renderRow('   6. Tanggal Lahir', du.tglLahirAyah);
    renderRow('   7. Pendidikan Terakhir', (du.pendidikanAyah || '').toUpperCase());
    renderRow('   8. Pekerjaan Utama', (du.pekerjaanAyah || '').toUpperCase());
    renderRow('   9. Penghasilan Rata-rata', du.penghasilanAyah);
    renderRow('   10. Nomor Handphone (HP)', du.hpAyah);

    currentY += 10;

    doc.font('Times-Bold').fontSize(9).text('B. Ibu Kandung', leftCol + 5, currentY);
    currentY += 12;
    doc.font('Times-Roman').fontSize(9).text('   1. Status', leftCol, currentY);
    doc.text(':', midCol, currentY);
    drawCheckbox(doc, valueCol, currentY, false, 'Masih Ada');
    drawCheckbox(doc, valueCol + 120, currentY, false, 'Sudah Meninggal');
    drawCheckbox(doc, valueCol + 240, currentY, false, 'Tidak Diketahui');
    currentY += 14;
    renderRow('   2. Nama Lengkap', (du.namaIbu || pendaftar.ibuNama)?.toUpperCase(), true);
    renderRow('   3. Kewarganegaraan', 'INDONESIA');
    renderRow('   4. NIK', du.nikIbu || pendaftar.ibuNik);
    renderRow('   5. Tempat Lahir', (du.tempatLahirIbu || '').toUpperCase());
    renderRow('   6. Tanggal Lahir', du.tglLahirIbu);
    renderRow('   7. Pendidikan Terakhir', (du.pendidikanIbu || '').toUpperCase());
    renderRow('   8. Pekerjaan Utama', (du.pekerjaanIbu || '').toUpperCase());
    renderRow('   9. Penghasilan Rata-rata', du.penghasilanIbu);
    renderRow('   10. Nomor Handphone (HP)', du.hpIbu);
    currentY += 10;

    drawFooter(1);

    // ==========================================
    // PAGE 2: WALI, ALAMAT & SEKOLAH ASAL
    // ==========================================
    doc.addPage();
    drawHeader(2);
    currentY = 50; // Tanpa header, mulai dari atas

    const renderRowCompact = (label, value, isBold = false) => {
      doc.font('Times-Roman').fontSize(8).text(label, leftCol, currentY);
      doc.text(':', midCol, currentY);
      doc.font(isBold ? 'Times-Bold' : 'Times-Roman').text(value || '', valueCol, currentY, { width: 330, lineBreak: false });
      currentY += 10.5;
    };

    doc.font('Times-Bold').fontSize(8.5).text('C. Wali', leftCol + 5, currentY);
    currentY += 11;
    renderRowCompact('   1. Nama Lengkap', (du.namaWali || pendaftar.waliNama || '')?.toUpperCase(), true);
    renderRowCompact('   2. Kewarganegaraan', du.namaWali ? 'INDONESIA' : '');
    renderRowCompact('   3. NIK', du.nikWali);
    renderRowCompact('   4. Tempat Lahir', (du.tempatLahirWali || '').toUpperCase());
    renderRowCompact('   5. Tanggal Lahir', du.tglLahirWali);
    renderRowCompact('   6. Pendidikan Terakhir', (du.pendidikanWali || '').toUpperCase());
    renderRowCompact('   7. Pekerjaan Utama', (du.pekerjaanWali || '').toUpperCase());
    renderRowCompact('   8. Penghasilan Rata-rata', du.penghasilanWali);
    renderRowCompact('   9. Nomor Handphone (HP)', du.hpWali);
    renderRowCompact('   10. Nomor KKS', du.noKks);
    renderRowCompact('   11. Nomor PKH', du.noPkh);
    currentY += 8;

    doc.font('Times-Bold').fontSize(9).text('III. DATA ALAMAT', leftCol, currentY);
    currentY += 11;

    const renderFullAddress = (title) => {
      doc.font('Times-Bold').fontSize(8.5).text(title, leftCol + 5, currentY);
      currentY += 10;
      doc.font('Times-Roman').fontSize(8).text('   1. Tinggal di Luar Negeri', leftCol, currentY);
      doc.text(':', midCol, currentY);
      drawCheckbox(doc, valueCol, currentY, false, '1. Ya');
      drawCheckbox(doc, valueCol + 100, currentY, false, '2. Tidak');
      currentY += 10.5;
      renderRowCompact('   2. Status Kepemilikan Rumah', '');
      renderRowCompact('   3. Provinsi', (pendaftar.provinsi || 'KALIMANTAN BARAT').toUpperCase());
      renderRowCompact('   4. Kabupaten/Kota', (pendaftar.kabupatenKota || '').toUpperCase());
      renderRowCompact('   5. Kecamatan', (pendaftar.kecamatan || '').toUpperCase());
      renderRowCompact('   6. Kelurahan/Desa', (pendaftar.kelurahanDesa || '').toUpperCase());
      renderRowCompact('   7. RT', pendaftar.rt);
      renderRowCompact('   8. RW', pendaftar.rw);
      renderRowCompact('   9. Alamat', (pendaftar.address || '').toUpperCase());
      renderRowCompact('   10. Kode Pos', pendaftar.kodePos);
      currentY += 3;
    };

    renderFullAddress('A. Ayah Kandung');
    renderFullAddress('B. Ibu Kandung');
    renderFullAddress('C. Wali');

    doc.font('Times-Bold').fontSize(8.5).text('D. Siswa', leftCol + 5, currentY);
    currentY += 10;
    renderRowCompact('   1. Status Tempat Tinggal', '');
    renderRowCompact('   2. Provinsi', (pendaftar.provinsi || 'KALIMANTAN BARAT').toUpperCase());
    renderRowCompact('   3. Kabupaten/Kota', (pendaftar.kabupatenKota || '').toUpperCase());
    renderRowCompact('   4. Kecamatan', (pendaftar.kecamatan || '').toUpperCase());
    renderRowCompact('   5. Kelurahan/Desa', (pendaftar.kelurahanDesa || '').toUpperCase());
    renderRowCompact('   6. RT', pendaftar.rt);
    renderRowCompact('   7. RW', pendaftar.rw);
    renderRowCompact('   8. Alamat', (pendaftar.address || '').toUpperCase());
    renderRowCompact('   9. Kode Pos', pendaftar.kodePos);
    renderRowCompact('   10. Koordinat', `${du.lat || ''} , ${du.lng || ''}`);
    renderRowCompact('   11. Jarak Tempat tinggal - Madrasah', `${du.estimasiJarak || ''} KM`);

    drawFooter(2);

    // ==========================================
    // PAGE 3: LANJUTAN SISWA, SEKOLAH ASAL, PRESTASI & TANDA TANGAN
    // ==========================================
    doc.addPage();
    drawHeader(3);
    currentY = 50; // Tanpa header

    // Lanjutan Siswa (12 & 13)
    doc.font('Times-Roman').fontSize(9);
    doc.text('   12. Waktu Tempuh', leftCol, currentY);
    doc.text(':', midCol, currentY);
    doc.text(`${du.estimasiWaktu || ''} Menit`, valueCol, currentY);
    currentY += 12;
    doc.text('   13. Transportasi ke Sekolah', leftCol, currentY);
    doc.text(':', midCol, currentY);
    doc.text((du.transportasiKeSekolah || '').toUpperCase(), valueCol, currentY);
    currentY += 18;

    // IV. DATA SEKOLAH ASAL
    doc.font('Times-Bold').fontSize(9.5).text('IV. DATA SEKOLAH ASAL', leftCol, currentY);
    currentY += 12;
    renderRow('1. Nama Sekolah Asal', (pendaftar.schoolOrigin || '').toUpperCase());
    renderRow('2. NPSN', pendaftar.npsn);
    renderRow('3. Tahun Lulus', pendaftar.graduationYear);
    renderRow('4. Alamat Sekolah Asal', (du.alamatSekolahAsal || pendaftar.address || '').toUpperCase());
    
    const renderSubRow = (label, value) => {
      doc.font('Times-Roman').fontSize(8.5).text(label, leftCol + 15, currentY);
      doc.text(':', midCol, currentY);
      doc.text((value || '').toUpperCase(), valueCol, currentY, { lineBreak: false });
      currentY += 11;
    };
    renderSubRow('a. Kelurahan/Desa', pendaftar.kelurahanDesa);
    renderSubRow('b. Kecamatan', pendaftar.kecamatan);
    renderSubRow('c. Kabupaten/Kota', pendaftar.kabupatenKota);
    renderSubRow('d. Provinsi', pendaftar.provinsi);
    renderRow('5. Nilai Rata-rata Ujian Sekolah/Madrasah', du.nilaiRataRata || '');
    currentY += 10;

    // V. DATA PRESTASI
    doc.font('Times-Bold').fontSize(9.5).text('V. DATA PRESTASI YANG PERNAH DIRAIH', leftCol, currentY);
    currentY += 12;

    const tableX = [40, 60, 100, 180, 260, 360, 460, 555];
    const tableCols = ['No', 'Tahun', 'Nama Lomba', 'Bidang Lomba', 'Nama Penyelenggara', 'Lomba Tingkat', 'Prestasi yang diraih'];
    doc.font('Times-Bold').fontSize(7);
    const rowH = 18;
    const headerY = currentY;
    tableCols.forEach((col, i) => {
      doc.text(col, tableX[i], headerY, { width: tableX[i + 1] - tableX[i], align: 'center' });
      doc.rect(tableX[i], headerY - 4, tableX[i + 1] - tableX[i], rowH).stroke();
    });
    // 1 empty body row (sesuai referensi)
    const bodyY = headerY + rowH;
    tableCols.forEach((_, i) => {
      doc.rect(tableX[i], bodyY - 4, tableX[i + 1] - tableX[i], rowH).stroke();
    });
    currentY = bodyY + rowH + 20;

    // TANDA TANGAN
    doc.font('Times-Roman').fontSize(9);
    doc.text('Tayan, ............................ 2025', 380, currentY, { width: 175, align: 'center' });
    currentY += 16;

    const colW3 = 515 / 3;
    doc.text('Diterima Petugas Daftar Ulang:', leftCol, currentY, { width: colW3, align: 'center' });
    doc.text('Penanggungjawab Data,\nOrang Tua/Wali Siswa', leftCol + colW3, currentY, { width: colW3, align: 'center' });
    doc.text('Siswa Terdaftar', leftCol + 2 * colW3, currentY, { width: colW3, align: 'center' });
    
    currentY += 14;
    doc.text('Tanggal : ................. 2025', leftCol, currentY, { width: colW3, align: 'center' });

    // Ruang untuk tanda tangan (50-60px)
    currentY += 60;
    doc.font('Times-Bold').fontSize(9);
    doc.text('............................................', leftCol, currentY, { width: colW3, align: 'center' });
    doc.text((du.namaWali || du.namaAyah || pendaftar.parentName || '')?.toUpperCase(), leftCol + colW3, currentY, { width: colW3, align: 'center', underline: true });
    doc.text(pendaftar.name?.toUpperCase(), leftCol + 2 * colW3, currentY, { width: colW3, align: 'center', underline: true });

    currentY += 30;
    doc.font('Times-Roman').fontSize(9);
    const colW2 = 515 / 2;
    doc.text('Mengetahui,', leftCol, currentY, { width: colW2, align: 'center' });
    doc.text('Disetujui Oleh,', leftCol + colW2, currentY, { width: colW2, align: 'center' });
    currentY += 13;
    doc.font('Times-Bold').fontSize(9);
    doc.text('Kepala Madrasah', leftCol, currentY, { width: colW2, align: 'center' });
    doc.text('Ketua Panitia PPDB Tahun 2025', leftCol + colW2, currentY, { width: colW2, align: 'center' });

    // Ruang untuk tanda tangan (50-60px)
    currentY += 60;
    doc.text('BAWANTA ARI SANTOSA, S.Pd.', leftCol, currentY, { width: colW2, align: 'center', underline: true });
    doc.text('GUSTI MOHAMMAD THAUFIQ', leftCol + colW2, currentY, { width: colW2, align: 'center', underline: true });
    
    currentY += 13;
    doc.font('Times-Roman').fontSize(9);
    doc.text('NIP. 197602102005011007', leftCol, currentY, { width: colW2, align: 'center' });
    doc.text('NIP. 197602102005011007', leftCol + colW2, currentY, { width: colW2, align: 'center' });

    drawFooter(3);

    // ==========================================
    // PAGE 4: SURAT PERNYATAAN
    // ==========================================
    doc.addPage();
    drawHeader(4);
    currentY = 40; // Tanpa header

    doc.font('Times-Bold').fontSize(11).text('SURAT PERNYATAAN PESERTA DIDIK BARU', 0, currentY, { align: 'center' });
    doc.text('MTS NEGERI 3 SANGGAU TAHUN PELAJARAN 2025/2026', { align: 'center' });
    currentY += 25;

    doc.font('Times-Roman').fontSize(10).text('Kami yang bertanda tangan di bawah ini :', leftCol, currentY);
    currentY += 15;    const renderPernyataanRow = (label, value) => {
      doc.font('Times-Roman').fontSize(8.5).text(label, leftCol + 10, currentY, { width: 180 });
      doc.text(':', leftCol + 195, currentY);
      doc.font('Times-Roman').text((value || '').toUpperCase(), leftCol + 205, currentY);
      currentY += 11;
    };

    const formatTTL = (tempat, tanggal) => {
      const t = (tempat || '').trim();
      const d = (tanggal || '').trim();
      if (t && d) return `${t}, ${d}`;
      return t || d || '-';
    };

    doc.font('Times-Bold').fontSize(8.5).text('Ayah Kandung/Wali dari Siswa', leftCol, currentY);
    currentY += 11;
    renderPernyataanRow('Nama Lengkap', du.namaAyah || pendaftar.parentName);
    renderPernyataanRow('NIK', du.nikAyah || pendaftar.parentNik);
    renderPernyataanRow('Tempat, Tanggal Lahir', formatTTL(du.tempatLahirAyah, du.tglLahirAyah));
    renderPernyataanRow('Pekerjaan', du.pekerjaanAyah);
    renderPernyataanRow('Alamat', pendaftar.address);
    currentY += 4;

    doc.font('Times-Bold').text('Ibu Kandung/Wali dari Siswa', leftCol, currentY);
    currentY += 11;
    renderPernyataanRow('Nama Lengkap', du.namaIbu || pendaftar.ibuNama);
    renderPernyataanRow('NIK', du.nikIbu || pendaftar.ibuNik);
    renderPernyataanRow('Tempat, Tanggal Lahir', formatTTL(du.tempatLahirIbu, du.tglLahirIbu));
    renderPernyataanRow('Pekerjaan', du.pekerjaanIbu);
    renderPernyataanRow('Alamat', pendaftar.address);
    currentY += 8;

    doc.font('Times-Roman').text('adalah orang tua/wali siswa dari:', leftCol, currentY);
    currentY += 11;
    renderPernyataanRow('Nama Lengkap Siswa', pendaftar.name);
    renderPernyataanRow('NISN', pendaftar.nisn);
    renderPernyataanRow('Tempat, Tanggal Lahir', formatTTL(pendaftar.birthPlace, pendaftar.birthDate));
    renderPernyataanRow('Asal Sekolah jenjang sebelumnya', pendaftar.schoolOrigin);
    renderPernyataanRow('Alamat/Tempat Tinggal', pendaftar.address);
    currentY += 8;

    doc.font('Times-Roman').text('Dengan sungguh-sungguh dan penuh kesadaran, kami yang tertera diatas menyatakan :', leftCol, currentY);
    currentY += 11;

    doc.font('Times-Bold').text('1.  Orang Tua/Wali Siswa:', leftCol, currentY);
    currentY += 11;
    doc.font('Times-Roman').text('a. Sanggup membantu, membina, membimbing, mendidik, dan mengawasi anak kami dalam belajar dan pergaulan selama di rumah atau di luar jam KBM (Kegiatan Belajar Mengajar).', leftCol + 15, currentY, { width: 500, align: 'justify' });
    currentY += 22;
    doc.font('Times-Roman').text('b. Sanggup mendukung sanksi yang diberikan kepada anak kami jika tidak mentaati dan mematuhi tata tertib madrasah.', leftCol + 15, currentY, { width: 500, align: 'justify' });
    currentY += 22;
    doc.font('Times-Roman').text('c. Bersedia konsultasi dengan madrasah tentang kemajuan pendidikan/pengajaran anak kami selama menjadi siswa Madrasah Tsanawiyah Negeri 3 Sanggau.', leftCol + 15, currentY, { width: 500, align: 'justify' });
    currentY += 22;

    doc.font('Times-Bold').text('2.  Siswa:', leftCol, currentY);
    currentY += 11;
    doc.font('Times-Roman').text('a. Akan belajar dengan tekun, sungguh-sungguh dan penuh semangat.', leftCol + 15, currentY, { width: 500, align: 'justify' });
    currentY += 11;
    doc.font('Times-Roman').text('b. Akan menjaga nama baik madrasah, diri sendiri, keluarga, dan masyarakat.', leftCol + 15, currentY, { width: 500, align: 'justify' });
    currentY += 11;
    doc.font('Times-Roman').text('c. Akan mengikuti segala peraturan dan tata tertib yang berlaku di Madrasah Tsanawiyah Negeri 3 Sanggau dan apabila dikemudian hari saya melakukan tindakan yang melanggar peraturan dan tata tertib Madrasah Tsanawiyah Negeri 3 Sanggau, maka saya bersedia menerima segala bentuk sanksi yang diberikan oleh pihak Madrasah sesuai dengan ketentuan yang berlaku.', leftCol + 15, currentY, { width: 500, align: 'justify' });
    currentY += 40;

    doc.font('Times-Roman').text('Demikian pernyatan ini kami buat untuk laksanakan dan dapat dipergunakan sebagaimana mestinya.', leftCol, currentY);
    currentY += 18;

    // Signature Area - EXTREME TIGHT
    const sigDate2 = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.fontSize(8.5).text(`Tayan, ${sigDate2}`, 0, currentY, { align: 'center' });
    currentY += 10;
    doc.text('Kami yang bertanda tangan di bawah ini,', 0, currentY, { align: 'center' });
    currentY += 12;

    const sigW = 515 / 3;
    doc.text('Siswa', leftCol, currentY, { width: sigW, align: 'center' });
    doc.text('Ibu / Wali Siswa', leftCol + sigW, currentY, { width: sigW, align: 'center' });
    doc.text('Ayah / Wali Siswa', leftCol + 2 * sigW, currentY, { width: sigW, align: 'center' });

    currentY += 80;
    doc.font('Times-Bold').fontSize(9);
    doc.text(pendaftar.name?.toUpperCase(), leftCol, currentY, { width: sigW, align: 'center' });
    doc.text((du.namaIbu || pendaftar.ibuNama || '')?.toUpperCase(), leftCol + sigW, currentY, { width: sigW, align: 'center' });
    doc.text((du.namaAyah || pendaftar.parentName || '')?.toUpperCase(), leftCol + 2 * sigW, currentY, { width: sigW, align: 'center' });

    currentY += 22;
    doc.font('Times-Roman').fontSize(9).text('Mengetahui,', 0, currentY, { align: 'center' });
    currentY += 12;
    doc.font('Times-Bold').fontSize(9).text('Kepala Madrasah', 0, currentY, { align: 'center' });
    currentY += 70;
    doc.text('BAWANTA ARI SANTOSA, S.Pd.', 0, currentY, { align: 'center', underline: true });
    currentY += 12;
    doc.font('Times-Roman').fontSize(9).text('NIP. 197602102005011007', 0, currentY, { align: 'center' });

    drawFooter(4);

    doc.end();
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { generateBuktiPendaftaran, generateBuktiDaftarUlang, generateKartuPeserta };
