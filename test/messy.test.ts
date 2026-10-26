import assert from 'node:assert/strict'
import { test } from 'node:test'
import { render } from '../src/index.ts'
import { textWidth } from '../src/svg.ts'
import type { Dataset, Row } from '../src/types.ts'
import { cashflow, expenses, people, pnl, result, ticket } from './fixtures.ts'

const LONG = 'Professional services and outsourced specialists, recurring monthly contract'

function wellFormed(markup: string): void {
  const stack: string[] = []
  for (const m of markup.matchAll(/<(\/?)([a-z]+)[^>]*?(\/?)>/g)) {
    const [, close, tag, self] = m
    if (self) continue
    if (close) assert.equal(stack.pop(), tag, `unbalanced </${tag}>`)
    else stack.push(tag!)
  }
  assert.equal(stack.length, 0, `unclosed ${stack.join(',')}`)
}

function textInside(markup: string, width: number): void {
  for (const m of markup.matchAll(/<text x="(-?[\d.]+)"[^>]*?>([^<]*)</g)) {
    const x = Number(m[1])
    const attrs = m[0]
    const label = m[2]!.replace(/&#\d+;/g, '_')
    const size = Number(/font-size="([\d.]+)"/.exec(attrs)?.[1] ?? 11)
    const w = textWidth(label, size)
    const anchor = /text-anchor="(\w+)"/.exec(attrs)?.[1] ?? 'start'
    const left = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x
    assert.ok(left >= -2 && left + w <= width + 2, `text "${label}" spans ${left.toFixed(0)}..${(left + w).toFixed(0)} outside 0..${width}`)
  }
}

function check(name: string, ds: Dataset, widths = [200, 360, 640, 2000]): void {
  test(`messy: ${name}`, () => {
    for (const width of widths) {
      const r = render(ds, { width })
      assert.doesNotMatch(r.markup, /NaN|Infinity|undefined|null/, `${r.form} at ${width}px`)
      wellFormed(r.markup)
      if (r.markup.startsWith('<svg')) textInside(r.markup, Math.max(200, width))
    }
  })
}

const months = (n: number) => Array.from({ length: n }, (_, i) => `M${i + 1}`)
const series = (ds: Dataset, f: (r: Row, i: number) => Row): Dataset => ({ ...ds, rows: ds.rows.map(f) })

check('holes in the data', series(cashflow, (r, i) => (i % 3 === 0 ? { ...r, in: null, out: Number.NaN } : i % 3 === 1 ? { ...r, in: 'n/a' } : r)))
check('billions', series(ticket, (r) => ({ ...r, ticket: Number(r.ticket) * 1e8 })))
check('fractions', series(ticket, (r) => ({ ...r, ticket: Number(r.ticket) / 1e5 })))
check('all zeros', series(cashflow, (r) => ({ ...r, in: 0, out: 0, inOpen: 0, outOpen: 0 })))
check('all zeros, signed', series(result, (r) => ({ ...r, net: 0 })))
check('long category labels', series(expenses, (r, i) => ({ ...r, category: LONG + ' ' + i })))
check('long stage labels', series(pnl, (r, i) => ({ ...r, stage: LONG.slice(0, 20 + i * 12) })))
check('long period labels', series(cashflow, (r, i) => ({ ...r, month: 'Week of ' + LONG.slice(0, 10) + i })))
check('long series names', { ...cashflow, measures: cashflow.measures.map((m) => ({ ...m, label: LONG })) })
check('long part names', series(people, (r, i) => ({ ...r, part: LONG + ' ' + i })))
check('long line end label', { ...ticket, measures: [{ ...ticket.measures[0]!, label: LONG }] })
check('120 months of columns', { ...cashflow, forecastFrom: 100, rows: months(120).map((month, i) => ({ month, in: 1000 + (i % 7) * 100, out: 900 + (i % 5) * 120 })) })
check('120 months of a level', { ...ticket, rows: months(120).map((month, i) => ({ month, ticket: 10000 + Math.sin(i / 6) * 800 })) })
check('120 months diverging', { ...result, forecastFrom: 115, highlight: [3, 60, 200], rows: months(120).map((month, i) => ({ month, net: Math.round(Math.sin(i / 4) * 5000) })) })
check('forecast index out of range', { ...cashflow, forecastFrom: 99 })
check('negative forecast index', { ...result, forecastFrom: -3 })
check('reference far above the data', { ...expenses, reference: { value: 1e6, label: 'a target far above every bar', alertAbove: true } })
check('share over 100%', series(people, (r) => ({ ...r, pct: 60 })))
check('waterfall with no totals', { ...pnl, totalRows: [] })
check('unicode labels', series(expenses, (r, i) => ({ ...r, category: ['Café & Ação', '日本語のラベル', 'עברית', 'Zoë "quoted"', '<b>', 'emoji 📈'][i] })))
check('duplicate labels', series(expenses, (r) => ({ ...r, category: 'Same' })))
