import nodemailer from 'nodemailer';

function normalizeRecipientList(value) {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value])
    .map((entry) => String(entry || '').trim())
    .filter(Boolean);
}

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
 * @param {{ to: string|string[], cc?: string|string[], subject: string, html: string, attachments?: object[] }} opts
 */
export async function sendEmail({ to, cc, subject, html, attachments }) {
  const toList = normalizeRecipientList(to);
  const toSet = new Set(toList.map((entry) => entry.toLowerCase()));
  const ccList = normalizeRecipientList(cc).filter((entry) => !toSet.has(entry.toLowerCase()));

  const transporter = createTransport();
  await transporter.sendMail({
    from: `"G-R Gabriella Romeo" <${process.env.SMTP_USER || 'info@gabriellaromeo.it'}>`,
    to: toList.join(', '),
    cc: ccList.length ? ccList.join(', ') : undefined,
    subject,
    html,
    attachments,
  });
}
