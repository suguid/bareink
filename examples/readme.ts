import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dark, light, render, route } from '../src/index.ts'
import { en } from '../src/locale/en.ts'
import type { Dataset } from '../src/types.ts'
import { cashflow, expenses, people, pnl, result, ticket } from '../test/fixtures.ts'

const root = new URL('../', import.meta.url)
const img = new URL('docs/img/', root)
const IMG = 'https://raw.githubusercontent.com/suguid/bareink/main/docs/img/'
mkdirSync(img, { recursive: true })

const charts: [string, Dataset][] = [
  ['columns', cashflow],
  ['diverging', result],
  ['bars', expenses],
  ['line', ticket],
  ['waterfall', pnl],
  ['share', people],
]

const refusals: Dataset[] = [
  {
    title: 'September vs October',
    dimension: { key: 'm', label: 'Month', kind: 'time' },
    measures: [{ key: 'v', label: 'Inflows', unit: 'currency', nature: 'flow' }],
    rows: [
      { m: 'Sep', v: 49360 },
      { m: 'Oct', v: 14690 },
    ],
  },
  {
    title: 'Revenue and customers',
    dimension: { key: 'm', label: 'Month', kind: 'time' },
    measures: [
      { key: 'r', label: 'Revenue', unit: 'currency', nature: 'flow' },
      { key: 'c', label: 'Customers', unit: 'count', nature: 'level' },
    ],
    rows: [
      { m: 'Apr', r: 326220, c: 36 },
      { m: 'May', r: 371140, c: 39 },
      { m: 'Jun', r: 342030, c: 35 },
    ],
  },
  {
    title: 'Three offices cost the same',
    dimension: { key: 'o', label: 'Office', kind: 'category' },
    measures: [{ key: 'v', label: 'Rent', unit: 'currency', nature: 'flow' }],
    rows: [
      { o: 'North', v: 10200 },
      { o: 'South', v: 10050 },
      { o: 'East', v: 10120 },
    ],
  },
  {
    title: 'Yearly site renewals',
    dimension: { key: 't', label: 'Invoice', kind: 'record' },
    measures: [{ key: 'd', label: 'Paid on', unit: 'text' }],
    rows: [
      { t: 'Site 2023', d: '2023-10-02' },
      { t: 'Site 2024', d: '2024-10-01' },
    ],
  },
  {
    title: 'Cash today',
    dimension: { key: 'd', label: 'Date', kind: 'time' },
    measures: [{ key: 'c', label: 'Cash', unit: 'currency', nature: 'level' }],
    rows: [{ d: 'Oct 22', c: 41400 }],
  },
]

const gallery = charts.map(([name, ds]) => {
  for (const [theme, palette] of [
    ['light', light],
    ['dark', dark],
  ] as const) {
    writeFileSync(new URL(`${name}-${theme}.svg`, img), render(ds, { width: 640, inlineColors: true, palette }).markup)
  }
  const { reason } = route(ds, en)
  return [
    `<picture>`,
    `  <source media="(prefers-color-scheme: dark)" srcset="${IMG}${name}-dark.svg">`,
    `  <img alt="${ds.title}" src="${IMG}${name}-light.svg" width="640">`,
    `</picture>`,
    ``,
    `**\`${name}\`**: ${reason}`,
  ].join('\n')
})

const table = ['| Asked for | Router says |', '|---|---|', ...refusals.map((ds) => `| ${ds.title} | **${route(ds).form}**: ${route(ds, en).reason} |`)].join('\n')

const block = `<!-- showcase:start -->\n${gallery.join('\n\n')}\n\n### When the router says no\n\n${table}\n<!-- showcase:end -->`

const readme = new URL('README.md', root)
const text = readFileSync(readme, 'utf8')
writeFileSync(readme, text.replace(/<!-- showcase:start -->[\s\S]*<!-- showcase:end -->/, block))
console.log('README.md and docs/img updated')
