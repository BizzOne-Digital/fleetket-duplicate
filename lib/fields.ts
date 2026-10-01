import { z } from 'zod'

/**
 * One field spec drives both the admin form UI and its server-side Zod schema,
 * so the editor and the validator can never drift apart.
 */
export type FieldSpec =
  | { name: string; label: string; type: 'text'; help?: string; required?: boolean; max?: number }
  | { name: string; label: string; type: 'textarea'; help?: string; required?: boolean; rows?: number; max?: number }
  | { name: string; label: string; type: 'number'; help?: string; step?: number; min?: number }
  | { name: string; label: string; type: 'checkbox'; help?: string }
  | { name: string; label: string; type: 'select'; help?: string; options: readonly string[] }
  | { name: string; label: string; type: 'image'; help?: string }
  | { name: string; label: string; type: 'lines'; help?: string }
  | { name: string; label: string; type: 'repeater'; help?: string; itemLabel: string; fields: FieldSpec[] }

const imageUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === '' || v.startsWith('/') || v.startsWith('https://'), 'Use an uploaded image or an https:// URL')

function fieldSchema(f: FieldSpec): z.ZodType {
  switch (f.type) {
    case 'text': {
      const s = z.string().trim().max(f.max ?? 300)
      return f.required ? s.min(1, `${f.label} is required`) : s
    }
    case 'textarea': {
      const s = z.string().trim().max(f.max ?? 20000)
      return f.required ? s.min(1, `${f.label} is required`) : s
    }
    case 'number':
      return z.coerce.number().min(f.min ?? -Infinity)
    case 'checkbox':
      return z.boolean()
    case 'select':
      return z.enum(f.options as [string, ...string[]])
    case 'image':
      return imageUrl
    case 'lines':
      return z.array(z.string().trim().min(1).max(500)).max(100)
    case 'repeater':
      return z.array(schemaFromFields(f.fields)).max(100)
  }
}

export function schemaFromFields(fields: FieldSpec[]) {
  return z.object(Object.fromEntries(fields.map((f) => [f.name, fieldSchema(f)])))
}

export function emptyValueFor(f: FieldSpec): unknown {
  switch (f.type) {
    case 'number':
      return 0
    case 'checkbox':
      return false
    case 'select':
      return f.options[0]
    case 'lines':
    case 'repeater':
      return []
    default:
      return ''
  }
}

/** Fill missing keys so older stored documents still render in a newer form. */
export function withDefaults(fields: FieldSpec[], value: Record<string, unknown> | undefined) {
  return Object.fromEntries(fields.map((f) => [f.name, value?.[f.name] ?? emptyValueFor(f)]))
}

export const seoFields: FieldSpec[] = [
  { name: 'seoTitle', label: 'SEO title', type: 'text', max: 120, help: 'Shown in search results and browser tabs. Aim for under 60 characters.' },
  { name: 'seoDescription', label: 'SEO description', type: 'textarea', rows: 2, max: 320, help: 'Aim for 140–160 characters.' },
]
