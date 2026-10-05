// Checks the SMTP settings in .env.local: logs in, then sends one test email.
// Usage: npm run test:smtp -- you@example.com   (recipient defaults to SMTP_USER)
import nextEnv from '@next/env'
import nodemailer from 'nodemailer'

nextEnv.loadEnvConfig(process.cwd())
const { SMTP_HOST, SMTP_PORT = '587', SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env
const to = process.argv[2] || SMTP_USER

console.log(`[smtp] host ${SMTP_HOST || '(missing)'}:${SMTP_PORT} · user ${SMTP_USER || '(missing)'} · password ${SMTP_PASS ? 'set' : '(missing)'} · from ${EMAIL_FROM || SMTP_USER}`)
if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error('[smtp] FAILED — set SMTP_HOST, SMTP_USER and SMTP_PASS in .env.local')
  process.exit(1)
}

const port = Number(SMTP_PORT)
const transport = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } })
try {
  await transport.verify()
  console.log('[smtp] connected and logged in ✓')
  const info = await transport.sendMail({ from: EMAIL_FROM || SMTP_USER, to, subject: 'Fleeket SMTP test', text: `SMTP is working. Sent ${new Date().toISOString()}.` })
  console.log(`[smtp] test email sent to ${to} ✓ — ${info.response}`)
} catch (err) {
  console.error(`[smtp] FAILED — ${err.code || ''} ${err.response || err.message}`)
  process.exit(1)
}
