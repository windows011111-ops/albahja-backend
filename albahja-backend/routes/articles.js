const express = require('express');
const multer  = require('multer');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { sendMail } = require('../middleware/mailer');
const router = express.Router();

// Multer: store file on disk under uploads/submissions/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/submissions')),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g,'_');
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },   // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf','.doc','.docx','.jpg','.jpeg','.png'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('File type not allowed.'));
  }
});

// POST /api/articles   (multipart/form-data  OR  JSON with driveLink)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { name, email, title, type, driveLink, message } = req.body;
    if (!name || !email || !title || !message)
      return res.status(400).json({ success:false, message:'Name, email, title and message are required.' });

    const fileUrl  = req.file ? `/uploads/submissions/${req.file.filename}` : null;
    const fileInfo = req.file
      ? `File: ${req.file.originalname} (${(req.file.size/1024).toFixed(1)} KB)`
      : driveLink ? `Drive Link: ${driveLink}` : 'No file attached.';

    const entry = {
      id: uuidv4(),
      name:      name.trim().slice(0,100),
      email:     email.trim().toLowerCase(),
      title:     title.trim().slice(0,200),
      type:      (type||'Other').trim(),
      driveLink: driveLink||null,
      message:   message.trim().slice(0,5000),
      fileUrl,
      fileName:  req.file ? req.file.originalname : null,
      status:    'pending',
      createdAt: new Date().toISOString()
    };

    db.read(); db.data.articles.push(entry); db.write();

    await sendMail({
      subject: `Article Submission: ${entry.title}`,
      html: `<h2 style="color:#C9A84C">New Article Submission</h2>
        <p><b>Name:</b> ${entry.name}<br><b>Email:</b> ${entry.email}<br>
        <b>Title:</b> ${entry.title}<br><b>Type:</b> ${entry.type}</p>
        <p>${fileInfo}</p>
        <p style="white-space:pre-wrap"><b>Description:</b><br>${entry.message}</p>`
    });
    await sendMail({
      to: entry.email,
      subject: 'Article Submission Received — AL BAHAJA',
      html: `<h2 style="color:#C9A84C">Thank you, ${entry.name}!</h2>
        <p>Your article <b>"${entry.title}"</b> has been received.</p>
        <p>We will review it and contact you soon.</p>
        <p style="color:#888;font-size:0.85em">— AL BAHAJA Students Association</p>`
    });

    res.json({ success:true, message:'Article submitted successfully! We will review and contact you soon.' });
  } catch(err) {
    console.error('/articles:', err);
    if (err.message === 'File type not allowed.')
      return res.status(400).json({ success:false, message: err.message });
    res.status(500).json({ success:false, message:'Server error.' });
  }
});

module.exports = router;
