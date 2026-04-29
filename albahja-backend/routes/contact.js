const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { sendMail } = require('../middleware/mailer');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ success:false, message:'Name, email and message are required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success:false, message:'Invalid email address.' });

    const entry = {
      id: uuidv4(),
      name:    name.trim().slice(0,100),
      email:   email.trim().toLowerCase(),
      subject: (subject||'No Subject').trim().slice(0,200),
      message: message.trim().slice(0,5000),
      status:  'unread',
      createdAt: new Date().toISOString()
    };

    db.read(); db.data.contacts.push(entry); db.write();

    await sendMail({
      subject: `New Contact: ${entry.subject}`,
      html: `<h2 style="color:#C9A84C">New Contact — AL BAHAJA</h2>
        <p><b>Name:</b> ${entry.name}<br><b>Email:</b> ${entry.email}<br>
        <b>Subject:</b> ${entry.subject}</p>
        <p style="white-space:pre-wrap">${entry.message}</p>`
    });
    await sendMail({
      to: entry.email,
      subject: 'We received your message — AL BAHAJA',
      html: `<h2 style="color:#C9A84C">Thank you, ${entry.name}!</h2>
        <p>We received your message and will reply soon.</p>
        <blockquote style="border-left:3px solid #C9A84C;padding:8px 12px;color:#555">${entry.message}</blockquote>
        <p style="color:#888;font-size:0.85em">— AL BAHAJA Students Association</p>`
    });

    res.json({ success:true, message:"Message sent! We'll get back to you soon." });
  } catch(err) {
    console.error('/contact:', err);
    res.status(500).json({ success:false, message:'Server error.' });
  }
});

module.exports = router;
