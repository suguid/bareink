import { en } from './messages.ts'
import type { Dataset, Decision, Form, Messages, ReasonCode } from './types.ts'

export const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)

export function route(ds: Dataset, messages: Messages = en): Decision {
  const decide = (form: Form, code: ReasonCode): Decision => ({ form, code, reason: messages.reasons[code] })
  const { dimension: dim, measures: ms, rows } = ds

  if (!rows.length || !ms.length) return decide('table', 'empty')
  if (dim.kind === 'record' || ms.some((m) => m.unit === 'text')) return decide('table', 'record-list')
  if (rows.length === 1) return decide('kpi', 'single-row')
  if (new Set(ms.map((m) => m.unit)).size > 1) return decide('table', 'mixed-units')
  if (ms.length > 3) return decide('table', 'too-many-series')
  if (dim.kind === 'stage' && ds.intent === 'flow') return decide('waterfall', 'flow-stages')
  if (ds.partOfWhole) return rows.length <= 4 ? decide('share', 'share-few') : decide('bars', 'share-many')

  if (dim.kind === 'time') {
    if (rows.length < 3) return decide('table', 'too-few-periods')
    const m0 = ms[0]!
    if (ms.length === 1 && m0.nature === 'signed') {
      const vals = rows.map((r) => num(r[m0.key]))
      if (vals.some((v) => v < 0) && vals.some((v) => v > 0)) return decide('diverging', 'signed-mixed')
    }
    if (ms.every((m) => m.nature === 'level') || rows.length > 18) return decide('line', 'level-trend')
    return decide('columns', 'volume-trend')
  }

  if (dim.kind === 'category') {
    if (ms.length !== 1) return decide('table', 'category-multi')
    const vals = rows.map((r) => num(r[ms[0]!.key]))
    if (vals.some((v) => v < 0)) return decide('table', 'category-negative')
    const max = Math.max(...vals)
    const min = Math.min(...vals)
    if (max > 0 && (max - min) / max < 0.05) return decide('table', 'category-flat')
    return decide('bars', rows.length > 8 ? 'category-top' : 'category-rank')
  }

  return decide('table', 'fallback')
}
