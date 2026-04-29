// ── Admin API (protected by ADMIN_KEY header) ─────────────
const express = require('express');
const db = require('../db/database');
const router = express.Router();

function auth(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key;
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY)
    return res.status(401).json({ success:false, message:'Unauthorized. Set X-Admin-Key header.' });
  next();
}

// GET /api/admin/stats
router.get('/stats', auth, (req, res) => {
  db.read();
  res.json({
    success: true,
    stats: {
      contacts:    db.data.contacts.length,
      unread:      db.data.contacts.filter(c=>c.status==='unread').length,
      articles:    db.data.articles.length,
      pending:     db.data.articles.filter(a=>a.status==='pending').length,
      gallery:     db.data.gallery.length,
      subscribers: db.data.subscribers.length,
    }
  });
});

// GET /api/admin/contacts
router.get('/contacts', auth, (req, res) => {
  db.read();
  const list = [...db.data.contacts].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  res.json({ success:true, data: list });
});

// PATCH /api/admin/contacts/:id/read
router.post('/contacts/:id/read', auth, (req, res) => {
  db.read();
  const c = db.data.contacts.find(x=>x.id===req.params.id);
  if (!c) return res.status(404).json({ success:false, message:'Not found.' });
  c.status = 'read';
  db.write();
  res.json({ success:true });
});

// DELETE /api/admin/contacts/:id
router.delete('/contacts/:id', auth, (req, res) => {
  db.read();
  const before = db.data.contacts.length;
  db.data.contacts = db.data.contacts.filter(x=>x.id!==req.params.id);
  db.write();
  res.json({ success: db.data.contacts.length < before });
});

// GET /api/admin/articles
router.get('/articles', auth, (req, res) => {
  db.read();
  const list = [...db.data.articles].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  res.json({ success:true, data: list });
});

// POST /api/admin/articles/:id/status  { status: 'approved'|'rejected' }
router.post('/articles/:id/status', auth, (req, res) => {
  const { status } = req.body;
  if (!['approved','rejected','pending'].includes(status))
    return res.status(400).json({ success:false, message:'Invalid status.' });
  db.read();
  const a = db.data.articles.find(x=>x.id===req.params.id);
  if (!a) return res.status(404).json({ success:false, message:'Not found.' });
  a.status = status;
  db.write();
  res.json({ success:true });
});

// DELETE /api/admin/articles/:id
router.delete('/articles/:id', auth, (req, res) => {
  db.read();
  const before = db.data.articles.length;
  db.data.articles = db.data.articles.filter(x=>x.id!==req.params.id);
  db.write();
  res.json({ success: db.data.articles.length < before });
});

module.exports = router;
