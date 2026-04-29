const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Gmail (free) — enable "App Passwords" in your Google account
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
  } else {
    // Ethereal (fake SMTP for testing — no config needed)
    console.warn('⚠️  EMAIL_USER/EMAIL_PASS not set. Using Ethereal test account.');
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: 'ethereal_user', pass: 'ethereal_pass' }
    });
  }
  return transporter;
}

/**
 * Send an email. Falls back silently in dev if not configured.
 */
async function sendMail({ to, subject, html, text }) {
  const TO = to || process.env.ADMIN_EMAIL || 'albahajastudents@gmail.com';
  try {
    const info = await getTransporter().sendMail({
      from: `"AL BAHAJA Website" <${process.env.EMAIL_USER || 'noreply@albahaja.com'}>`,
      to: TO, subject, html: html || text, text
    });
    console.log('📧 Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('📧 Email failed (non-fatal):', err.message);
  }
}

module.exports = { sendMail };
