import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

// Validation logic for necessary environment variables in production
if (isProduction) {
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredEnvVars.filter(key => !process.env[key]);
  if (missingVars.length > 0) {
    console.warn(`[Email Service] Warning: Missing email environment variables in production: ${missingVars.join(', ')}`);
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const defaultFrom = process.env.EMAIL_FROM || '"NexaSphere Team" <noreply@nexasphere.com>';

/**
 * Compile and render an EJS template from the templates directory.
 */
async function renderTemplate(templateName, data) {
  const templatePath = path.join(__dirname, 'templates', `${templateName}.ejs`);
  const templateStr = await fs.readFile(templatePath, 'utf-8');
  return ejs.render(templateStr, data);
}

/**
 * Send an email with HTML generated from a template.
 */
export async function sendEmail({ to, subject, templateName, data, from = defaultFrom }) {
  try {
    const html = await renderTemplate(templateName, data);

    const mailOptions = {
      from,
      to,
      subject,
      html,
    };

    // If running in development without proper SMTP credentials, simulate email sending.
    if (!isProduction && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
      console.log(`[Email Service - DEV] Would send email to: ${to}`);
      console.log(`[Email Service - DEV] Subject: ${subject}`);
      console.log(`[Email Service - DEV] Template: ${templateName}`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Message sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service] Error sending email:`, error);
    return { success: false, error };
  }
}

/**
 * Send a Welcome & Verification Email
 */
export async function sendWelcomeVerificationEmail(to, name, verifyUrl) {
  return sendEmail({
    to,
    subject: 'Welcome to NexaSphere! Please verify your email',
    templateName: 'welcome',
    data: { name, verifyUrl },
  });
}

/**
 * Send a Password Reset Email
 */
export async function sendPasswordResetEmail(to, name, resetUrl) {
  return sendEmail({
    to,
    subject: 'Reset your NexaSphere Password',
    templateName: 'reset-password',
    data: { name, resetUrl },
  });
}

/**
 * Send an Event RSVP Confirmation Email
 */
export async function sendRSVPConfirmationEmail(to, name, eventDetails) {
  // eventDetails should include: eventName, eventDate, eventLocation, eventTime, eventUrl
  return sendEmail({
    to,
    subject: `RSVP Confirmed: ${eventDetails.eventName}`,
    templateName: 'rsvp-confirmation',
    data: { name, ...eventDetails },
  });
}
