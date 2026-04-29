// ============================================================
//  mailer.js  — Shared Nodemailer transporter (Gmail SMTP)
//  Free: Gmail allows 500 emails/day via SMTP app passwords.
// ============================================================

const nodemailer = require('nodemailer');

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host   : process.env.SMTP_HOST || 'smtp.gmail.com',
    port   : parseInt(process.env.SMTP_PORT || '587'),
    secure : false,         // true for port 465, false for 587 (STARTTLS)
    auth   : {
      user : process.env.SMTP_USER,
      pass : process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  return _transporter;
}

/**
 * Send an email.
 * @param {object} opts  - { to, subject, html, text, attachments? }
 * @returns {Promise<object>} nodemailer info object
 */
async function sendMail({ to, subject, html, text, attachments = [] }) {
  const transporter = getTransporter();
  return transporter.sendMail({
    from        : `"AL BAHAJA Association" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
    attachments,
  });
}

module.exports = { sendMail };
