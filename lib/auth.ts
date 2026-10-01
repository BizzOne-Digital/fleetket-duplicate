import 'server-only'
import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SignJWT, jwtVerify } from 'jose'
import { connectDb, isDbConfigured } from './db'
import { User } from './models'
import { isAdminRole, type Role } from './constants'

/* ---------- Passwords: scrypt (memory-hard, built into Node) ---------- */

const SCRYPT = { N: 32768, r: 8, p: 1, keylen: 64 }

function scrypt(password: string, salt: Buffer, keylen: number, opts: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) =>
    scryptCb(password, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key))),
  )
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const { N, r, p, keylen } = SCRYPT
  const key = await scrypt(password, salt, keylen, { N, r, p, maxmem: 64 * 1024 * 1024 })
  return ['scrypt', N, r, p, salt.toString('base64'), key.toString('base64')].join('$')
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, N, r, p, saltB64, keyB64] = stored.split('$')
  if (alg !== 'scrypt' || !saltB64 || !keyB64) return false
  const expected = Buffer.from(keyB64, 'base64')
  const key = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024,
  })
  return key.length === expected.length && timingSafeEqual(key, expected)
}

/* ---------- Sessions: signed, httpOnly JWT cookie ---------- */

export const SESSION_COOKIE = 'fk_session'
const SESSION_DAYS = 7

function secretKey() {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be set to at least 32 characters')
  return new TextEncoder().encode(secret)
}

/** `remember: false` → a browser-session cookie (cleared when the browser closes); the token still expires after 7 days. */
export async function createSession(userId: string, role: Role, remember = true) {
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey())
  ;(await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(remember ? { maxAge: SESSION_DAYS * 24 * 60 * 60 } : {}),
  })
}

export async function destroySession() {
  ;(await cookies()).delete(SESSION_COOKIE)
}

async function readSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] })
    return payload.sub ? { userId: payload.sub } : null
  } catch {
    return null
  }
}

export type SessionUser = { id: string; name: string; email: string; role: Role }

/** Always re-reads the user from the database — the role in the token is never trusted on its own. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!isDbConfigured) return null
  const session = await readSession()
  if (!session) return null
  await connectDb()
  const user = await User.findById(session.userId).lean()
  if (!user || !user.active) return null
  return { id: String(user._id), name: user.name, email: user.email, role: user.role as Role }
}

export async function requireUser(next = '/account') {
  const user = await getCurrentUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`)
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/admin')
  if (!isAdminRole(user.role)) redirect('/account?denied=1')
  return user
}
