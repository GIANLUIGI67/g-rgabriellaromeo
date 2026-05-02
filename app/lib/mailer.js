import nodemailer from 'nodemailer';

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtps.aruba.it',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * @param {{ to: string|string[], subject: string, html: string, attachments?: object[] }} opts
 */
export async function sendEmail({ to, subject, html, attachments }) {
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"G-R Gabriella Romeo" <${process.env.SMTP_USER || 'info@g-rgabriellaromeo.it'}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
    attachments,
  });
}
