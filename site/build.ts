import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { cashflow, expenses, people, pnl, result, ticket } from '../test/fixtures.ts'

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
const page = readFileSync(here('template.html'), 'utf8')
  .replace('/*BUNDLE*/', () => bundle.replace(/<\/script/gi, '<\\/script'))
  .replace('/*EXAMPLES*/', () => JSON.stringify(examples).replace(/</g, '\\u003c'))
mkdirSync(here('out/'), { recursive: true })
writeFileSync(here('out/index.html'), page)
console.log(`site/out/index.html ${(page.length / 1024).toFixed(1)} KB`)
