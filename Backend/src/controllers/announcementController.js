const { Pengumuman } = require('../models');

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Pengumuman.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicAnnouncements = async (req, res) => {
  try {
    const announcements = await Pengumuman.findAll({
      where: { isPublished: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Pengumuman.findByPk(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Pengumuman tidak ditemukan' });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, isPublished, publishedAt } = req.body;
    const announcement = await Pengumuman.create({
      title,
      content,
      category,
      isPublished,
      publishedAt: isPublished ? (publishedAt || new Date()) : null
    });
    res.status(201).json({ message: 'Pengumuman berhasil dibuat', announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, isPublished, publishedAt } = req.body;
    const announcement = await Pengumuman.findByPk(id);
    if (!announcement) return res.status(404).json({ message: 'Pengumuman tidak ditemukan' });

    const updates = { title, content, category, isPublished };
    
    if (isPublished) {
      updates.publishedAt = publishedAt || announcement.publishedAt || new Date();
    } else {
      updates.publishedAt = null;
    }

    await announcement.update(updates);
    res.json({ message: 'Pengumuman berhasil diperbarui', announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Pengumuman.findByPk(id);
    if (!announcement) return res.status(404).json({ message: 'Pengumuman tidak ditemukan' });
    await announcement.destroy();
    res.json({ message: 'Pengumuman berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnnouncements,
  getPublicAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};
