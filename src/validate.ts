export const KINDS = ['time', 'category', 'stage', 'record'] as const
export const UNITS = ['currency', 'percent', 'count', 'number', 'text'] as const
export const NATURES = ['flow', 'level', 'signed'] as const

type Obj = Record<string, unknown>

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const show = (v: unknown): string => (v === undefined ? 'nothing' : JSON.stringify(v))

export function validate(ds: unknown): string[] {
  const errors: string[] = []
  const fail = (path: string, rule: string, got: unknown) => errors.push(`${path} ${rule}; got ${show(got)}`)
  const text = (o: Obj, k: string, path: string) => {
    if (typeof o[k] !== 'string' || !o[k]) fail(path + k, 'must be a non-empty string', o[k])
  }
  const oneOf = (o: Obj, k: string, path: string, list: readonly string[], optional?: boolean) => {
    if (optional && o[k] === undefined) return
    if (!list.includes(o[k] as string)) fail(path + k, `must be one of ${list.join(', ')}`, o[k])
  }

  if (!isObj(ds)) return [`dataset must be an object; got ${show(ds)}`]
  text(ds, 'title', '')

  const dim = ds.dimension
  if (!isObj(dim)) fail('dimension', 'must be an object with key, label and kind', dim)
  else {
    text(dim, 'key', 'dimension.')
    text(dim, 'label', 'dimension.')
    oneOf(dim, 'kind', 'dimension.', KINDS)
  }

  const ms = ds.measures
  const keys = new Set<string>()
  if (!Array.isArray(ms) || !ms.length) fail('measures', 'must be a non-empty array', ms)
  else
    ms.forEach((m, i) => {
      const at = `measures[${i}].`
      if (!isObj(m)) return fail(at.slice(0, -1), 'must be an object', m)
      text(m, 'key', at)
      text(m, 'label', at)
      oneOf(m, 'unit', at, UNITS)
      oneOf(m, 'nature', at, NATURES, true)
      if (m.openKey !== undefined && typeof m.openKey !== 'string') fail(at + 'openKey', 'must be a string', m.openKey)
      if (typeof m.key === 'string') {
        if (keys.has(m.key) || (isObj(dim) && m.key === dim.key)) fail(at + 'key', 'must be unique across the dimension and measures', m.key)
        keys.add(m.key)
      }
    })

  const rows = ds.rows
  const n = Array.isArray(rows) ? rows.length : 0
  if (!Array.isArray(rows)) fail('rows', 'must be an array', rows)
  else if (isObj(dim) && Array.isArray(ms))
    rows.forEach((r, i) => {
      const at = `rows[${i}]`
      if (!isObj(r)) return fail(at, 'must be an object', r)
      const d = r[dim.key as string]
      if (typeof d !== 'string' && typeof d !== 'number') fail(`${at}.${String(dim.key)}`, 'must be a string or number label', d)
      for (const m of ms) {
        if (!isObj(m) || typeof m.key !== 'string') continue
        for (const k of [m.key, m.openKey]) {
          if (typeof k !== 'string') continue
          const v = r[k]
          const ok = v == null || (m.unit === 'text' ? typeof v === 'string' : typeof v === 'number' && Number.isFinite(v))
          if (!ok) fail(`${at}.${k}`, m.unit === 'text' ? 'must be a string or null' : 'must be a finite number or null', v)
        }
      }
    })

  const index = (k: string, v: unknown) => {
    if (!(Number.isInteger(v) && (v as number) >= 0 && (v as number) < n)) fail(k, `must be a row index from 0 to ${n - 1}`, v)
  }
  if (ds.forecastFrom !== undefined) index('forecastFrom', ds.forecastFrom)
  for (const k of ['highlight', 'muted', 'uncertain', 'totalRows']) {
    const v = ds[k]
    if (v === undefined) continue
    if (!Array.isArray(v)) fail(k, 'must be an array of row indexes', v)
    else v.forEach((x, i) => index(`${k}[${i}]`, x))
  }
  for (const k of ['partOfWhole', 'keepOrder', 'markCumulative']) {
    if (ds[k] !== undefined && typeof ds[k] !== 'boolean') fail(k, 'must be true or false', ds[k])
  }
  const ref = ds.reference
  if (ref !== undefined) {
    if (!isObj(ref)) fail('reference', 'must be an object with value and label', ref)
    else {
      if (typeof ref.value !== 'number' || !Number.isFinite(ref.value)) fail('reference.value', 'must be a finite number', ref.value)
      text(ref, 'label', 'reference.')
    }
  }
  return errors
}
