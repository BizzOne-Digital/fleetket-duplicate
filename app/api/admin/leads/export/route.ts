import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/content'
import { Lead } from '@/lib/models'
import { isAdminRole, LEAD_STATUSES, LEAD_TYPES } from '@/lib/constants'

export const runtime = 'nodejs'

// Leading =,+,-,@ are neutralised so spreadsheet apps never evaluate a cell as a formula.
const cell = (v: unknown) => {
  let s = v instanceof Date ? v.toISOString() : String(v ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user || !isAdminRole(user.role)) return new Response('Not authorised', { status: 401 })

  const url = new URL(req.url)
  const filter: Record<string, string> = {}
  const status = url.searchParams.get('status')
  const type = url.searchParams.get('type')
  if (status && (LEAD_STATUSES as readonly string[]).includes(status)) filter.status = status
  if (type && (LEAD_TYPES as readonly string[]).includes(type)) filter.type = type

  await db()
  const leads = await Lead.find(filter).sort({ createdAt: -1 }).limit(10000).lean()
  const cols = ['createdAt', 'type', 'status', 'name', 'email', 'phone', 'business', 'reason', 'category', 'area', 'subject', 'message', 'sourcePage', 'notes'] as const
  const csv = [cols.join(','), ...leads.map((l) => cols.map((c) => cell(l[c])).join(','))].join('\r\n')

  return new Response(`﻿${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="fleeket-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
