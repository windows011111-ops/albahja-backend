// ============================================================
//  AL BAHAJA Students Association — Backend Server
//  Free Stack: Node.js + Express + LowDB (JSON) + Nodemailer
// ============================================================
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const path       = require('path');
const rateLimit  = require('express-rate-limit');

const contactRoutes  = require('./routes/contact');
const articleRoutes  = require('./routes/articles');
const galleryRoutes  = require('./routes/gallery');
const adminRoutes    = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*', methods: ['GET','POST','DELETE'] }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 30,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/', apiLimiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin',   express.static(path.join(__dirname, 'public/admin')));

app.use('/api/contact',  contactRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/gallery',  galleryRoutes);
app.use('/api/admin',    adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AL BAHAJA backend running', time: new Date() });
});

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n✅  AL BAHAJA Backend → http://localhost:${PORT}`);
  console.log(`   Admin panel     → http://localhost:${PORT}/admin`);
  console.log(`   API health      → http://localhost:${PORT}/api/health\n`);
});
