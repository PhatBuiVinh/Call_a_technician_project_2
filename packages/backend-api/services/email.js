/**
 * Email Notification Service
 * 
 * Feature flag: EMAIL_NOTIFICATIONS_ENABLED=true to enable
 * Best-effort only - failures are logged but never block workflow
 */

const nodemailer = require('nodemailer');

// Feature flag - disabled by default
const ENABLED = process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true';

// SMTP configuration from environment
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Call-a-Technician <noreply@callatech.com>';

// Create transporter only if enabled and configured
let transporter = null;

if (ENABLED) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[EMAIL] EMAIL_NOTIFICATIONS_ENABLED=true but SMTP config incomplete. Emails will fail.');
  } else {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log('[EMAIL] Email notifications enabled via', SMTP_HOST);
  }
} else {
  console.log('[EMAIL] Email notifications disabled (set EMAIL_NOTIFICATIONS_ENABLED=true to enable)');
}

/**
 * Send email - best effort only, never throws
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body (optional)
 * @returns {Promise<{sent: boolean, reason?: string, error?: string}>}
 */
async function sendEmail(to, subject, text, html = null) {
  try {
    if (!ENABLED) {
      return { sent: false, reason: 'disabled' };
    }

    if (!transporter) {
      console.error('[EMAIL FAILED] Transporter not configured');
      return { sent: false, error: 'Transporter not configured' };
    }

    if (!to || !to.includes('@')) {
      console.error('[EMAIL FAILED] Invalid recipient:', to);
      return { sent: false, error: 'Invalid recipient email' };
    }

    const mailOptions = {
      from: EMAIL_FROM,
      to: to.trim(),
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>'),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('[EMAIL SENT]', to, subject, result.messageId);
    return { sent: true, messageId: result.messageId };
  } catch (err) {
    console.error('[EMAIL FAILED]', to, subject, err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = {
  sendEmail,
  ENABLED,
};
