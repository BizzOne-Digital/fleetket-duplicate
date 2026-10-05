import 'server-only'
import nodemailer, { type Transporter } from 'nodemailer'

/**
 * Transactional email through any SMTP provider (Outlook/Microsoft 365, SendGrid, Postmark, SES SMTP…).
 * Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and EMAIL_FROM. Without them, sending is skipped.
 */
export const isEmailConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

let transporter: Transporter | null = null

function getTransporter() {
  const port = Number(process.env.SMTP_PORT || 587)
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return transporter
}

const escape = (s: string) => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)

export async function sendEmail({ to, subject, text, replyTo }: { to: string; subject: string; text: string; replyTo?: string }) {
  if (!isEmailConfigured) {
    console.warn(`[email] skipped "${subject}" to ${to} — SMTP_HOST, SMTP_USER and SMTP_PASS are not all set`)
    return { sent: false as const, reason: 'not-configured' }
  }
  try {
    const info = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html: `<pre style="font:14px/1.6 -apple-system,Segoe UI,sans-serif;white-space:pre-wrap">${escape(text)}</pre>`,
      replyTo,
    })
    console.log(`[email] sent "${subject}" to ${to} — ${info.response} (id ${info.messageId})`)
    return { sent: true as const }
  } catch (err) {
    console.error(`[email] FAILED "${subject}" to ${to} via ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}`, err)
    return { sent: false as const, reason: 'error' }
  }
}
