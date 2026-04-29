const express = require('express');
const multer  = require('multer');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/gallery')),
  filename:    (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g,'_');
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },   // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg','.jpeg','.png','.gif','.webp','.mp4','.mov','.webm'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('File type not allowed.'));
  }
});

// POST /api/gallery  — upload one or more files
router.post('/upload', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success:false, message:'No files provided.' });

    db.read();
    const saved = req.files.map(file => {
      const entry = {
        id:         uuidv4(),
        url:        `/uploads/gallery/${file.filename}`,
        name:       file.originalname,
        type:       file.mimetype,
        size:       file.size,
        uploadedAt: new Date().toISOString()
      };
      db.data.gallery.push(entry);
      return entry;
    });
    db.write();

    res.json({ success:true, message:`${saved.length} file(s) uploaded.`, files: saved });
  } catch(err) {
    console.error('/gallery/upload:', err);
    res.status(500).json({ success:false, message: err.message || 'Upload error.' });
  }
});

// GET /api/gallery  — list all gallery items
router.get('/', (req, res) => {
  db.read();
  const items = [...db.data.gallery].sort((a,b) => new Date(b.uploadedAt)-new Date(a.uploadedAt));
  res.json({ success:true, items });
});

// DELETE /api/gallery/:id
router.delete('/:id', (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY)
    return res.status(401).json({ success:false, message:'Unauthorized.' });

  db.read();
  const before = db.data.gallery.length;
  db.data.gallery = db.data.gallery.filter(i => i.id !== req.params.id);
  db.write();

  if (db.data.gallery.length < before)
    res.json({ success:true, message:'Deleted.' });
  else
    res.status(404).json({ success:false, message:'Not found.' });
});

module.exports = router;
