import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { render, renderTable } from '../src/index.ts'
import { en } from '../src/locale/en.ts'
import type { ReasonCode } from '../src/types.ts'
import { cashflow, expenses, people, pnl, result, ticket } from '../test/fixtures.ts'
import { examples as byCode } from './reasons.ts'

const here = (p: string) => new URL(p, import.meta.url)
const examples = [
  { group: 'chart', name: 'Cash flow', ds: cashflow },
  { group: 'chart', name: 'Net result', ds: result },
  { group: 'chart', name: 'Expenses', ds: expenses },
  { group: 'chart', name: 'Average ticket', ds: ticket },
  { group: 'chart', name: 'P&L', ds: pnl },
  { group: 'chart', name: 'Share of revenue', ds: people },
  {
    group: 'no',
    name: 'Two months',
    ds: {
      title: 'September vs October',
      dimension: { key: 'm', label: 'Month', kind: 'time' },
      measures: [{ key: 'v', label: 'Inflows', unit: 'currency', nature: 'flow' }],
      rows: [{ m: 'Sep', v: 49360 }, { m: 'Oct', v: 14690 }],
    },
  },
  {
    group: 'no',
    name: 'Mixed units',
    ds: {
      title: 'Revenue and customers',
      dimension: { key: 'm', label: 'Month', kind: 'time' },
      measures: [
        { key: 'r', label: 'Revenue', unit: 'currency', nature: 'flow' },
        { key: 'c', label: 'Customers', unit: 'count', nature: 'level' },
      ],
      rows: [{ m: 'Apr', r: 326220, c: 36 }, { m: 'May', r: 371140, c: 39 }, { m: 'Jun', r: 342030, c: 35 }],
    },
  },
  {
    group: 'no',
    name: 'Equal bars',
    ds: {
      title: 'Three offices cost the same',
      dimension: { key: 'o', label: 'Office', kind: 'category' },
      measures: [{ key: 'v', label: 'Rent', unit: 'currency', nature: 'flow' }],
      rows: [{ o: 'North', v: 10200 }, { o: 'South', v: 10050 }, { o: 'East', v: 10120 }],
    },
  },
  {
    group: 'no',
    name: 'One row',
    ds: {
      title: 'Cash today',
      dimension: { key: 'd', label: 'Date', kind: 'time' },
      measures: [
        { key: 'c', label: 'Cash', unit: 'currency', nature: 'level' },
        { key: 's', label: 'Monthly surplus', unit: 'currency', nature: 'flow' },
      ],
      rows: [{ d: 'Oct 22', c: 41400, s: 5600 }],
    },
  },
]

const bundle = readFileSync(here('../dist/bareink.iife.js'), 'utf8')
const tokens = readFileSync(here('tokens.css'), 'utf8')
const page = readFileSync(here('template.html'), 'utf8')
  .replace('/*TOKENS*/', () => tokens)
  .replace('/*BUNDLE*/', () => bundle.replace(/<\/script/gi, '<\\/script'))
  .replace('/*EXAMPLES*/', () => JSON.stringify(examples).replace(/</g, '\\u003c'))
mkdirSync(here('out/'), { recursive: true })
writeFileSync(here('out/index.html'), page)

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const order: ReasonCode[] = ['volume-trend', 'level-trend', 'signed-mixed', 'category-rank', 'category-top', 'flow-stages', 'share-few', 'share-many', 'single-row', 'record-list', 'mixed-units', 'too-many-series', 'too-few-periods', 'negative-series', 'category-multi', 'category-negative', 'category-flat', 'not-a-whole', 'missing-values', 'empty']
const sections = order.map((code) => {
  const ds = byCode[code as keyof typeof byCode]
  const r = render(ds, { width: 560, messages: en, id: 'w' })
  const small = render(ds, { width: 340, messages: en, id: 'n' }).markup
  const chart = r.markup === small ? r.markup : `<div class="wide">${r.markup}</div><div class="narrow">${small}</div>`
  const data = r.form === 'table' || r.form === 'kpi' ? '' : `<details><summary>Show the data</summary>${renderTable(ds, { messages: en })}</details>`
  return `<section id="${code}">
  <h2><a href="#${code}"><code>${code}</code></a> <span class="form">${r.form}</span></h2>
  <p class="reason">${esc(r.reason)}</p>
  <figure><figcaption>${esc(ds.title)}</figcaption>${chart}${r.notes.map((n) => `<p class="note">${esc(n)}</p>`).join('')}${data}</figure>
  <details class="json"><summary>Dataset</summary><pre>${esc(JSON.stringify(ds, null, 2))}</pre></details>
</section>`
})
const reasons = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>bareink reason codes</title>
<meta name="description" content="Every decision bareink can make, with a live example of each.">
<style>
${tokens}
* { box-sizing: border-box; }
body { margin: 0; background: var(--paper); color: var(--ink); font: 15px/1.55 system-ui, sans-serif; padding: 32px 16px 64px; }
main { max-width: 720px; margin: 0 auto; display: grid; gap: 20px; }
h1 { font: 700 32px/1.1 system-ui, sans-serif; letter-spacing: -0.02em; margin: 0; }
h1 span { color: var(--accent); }
.lede { margin: 0; color: var(--ink-2); }
a { color: inherit; }
section { background: var(--surface); border: 1px solid var(--rule); border-radius: 12px; padding: 18px 18px 14px; display: grid; gap: 8px; scroll-margin-top: 16px; }
h2 { margin: 0; font-size: 15px; display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; }
h2 a { text-decoration: none; }
code, pre { font-family: ui-monospace, Menlo, Consolas, monospace; }
h2 code { font-size: 14px; }
.form { font: 600 12px ui-monospace, monospace; color: var(--accent); background: var(--accent-soft); border-radius: 999px; padding: 1px 9px; }
.reason { margin: 0; color: var(--ink-2); }
.note { margin: 0; font-size: 13px; color: var(--ink-2); }
figure { margin: 6px 0 0; display: grid; gap: 8px; }
.narrow { display: none; }
@media (max-width: 600px) { .wide { display: none; } .narrow { display: block; } }
figcaption { font-weight: 600; }
details summary { cursor: pointer; color: var(--ink-2); font-size: 13px; }
pre { margin: 8px 0 0; font-size: 12px; background: var(--paper); padding: 10px; border-radius: 8px; overflow-x: auto; }
nav { font-size: 13px; color: var(--ink-2); }
</style>
<main>
<header>
  <h1>bare<span>ink</span> reason codes</h1>
  <p class="lede">Every decision the router can make, drawn live by bareink at build time. Codes are stable across versions; build on them. The one code not shown, <code>fallback</code>, only answers a dimension kind that <code>validate</code> already rejects.</p>
  <nav><a href="./">Playground</a> · <a href="https://github.com/suguid/bareink">GitHub</a> · <a href="https://www.npmjs.com/package/bareink">npm</a></nav>
</header>
${sections.join('\n')}
</main>
`
writeFileSync(here('out/reasons.html'), reasons)
console.log(`site/out/index.html ${(page.length / 1024).toFixed(1)} KB, reasons.html ${(reasons.length / 1024).toFixed(1)} KB`)
