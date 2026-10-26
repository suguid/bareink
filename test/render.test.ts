import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cssVariables, dark, render, renderTable } from '../src/index.ts'
import { ptBR } from '../src/locale/pt-BR.ts'
import { cashflow, expenses, people, pnl, result, runway, ticket } from './fixtures.ts'

const all = { cashflow, result, expenses, ticket, pnl, people, runway }

for (const [name, ds] of Object.entries(all)) {
  test(`render: ${name} is well-formed and finite`, () => {
    for (const width of [320, 640, 960]) {
      const r = render(ds, { width })
      assert.ok(r.markup.startsWith(r.form === 'kpi' || r.form === 'table' ? '<div' : '<svg'))
      assert.doesNotMatch(r.markup, /NaN|Infinity|undefined/)
    }
  })
}

test('render is deterministic', () => {
  assert.equal(render(cashflow).markup, render(cashflow).markup)
})

test('charts carry an accessible name and native tooltips', () => {
  const { markup } = render(expenses)
  assert.match(markup, /role="img"/)
  assert.match(markup, /aria-label="Three categories take 71% of outflows"/)
  assert.match(markup, /<title>Operations staff\n/)
})

test('labels are escaped', () => {
  const evil = {
    ...expenses,
    title: '<script>alert(1)</script>',
    rows: [
      { category: '"><img src=x onerror=alert(1)>', paid: 10 },
      { category: 'b', paid: 5 },
    ],
  }
  const { markup } = render(evil)
  assert.doesNotMatch(markup, /<script|<img/)
  assert.match(markup, /&#60;script&#62;/)
  assert.doesNotMatch(renderTable(evil), /<script|<img/)
})

test('colors use CSS variables with fallbacks, or inline values', () => {
  assert.match(render(ticket).markup, /var\(--bi-s1,#2a78d6\)/)
  const inline = render(ticket, { inlineColors: true, palette: dark }).markup
  assert.doesNotMatch(inline, /var\(/)
  assert.match(inline, /#3987e5/)
  assert.match(cssVariables(dark), /--bi-s1:#3987e5/)
})

test('forecast is hatched and labelled', () => {
  const { markup } = render(cashflow)
  assert.match(markup, /<pattern/)
  assert.match(markup, />forecast</)
})

test('line off zero adds a note', () => {
  assert.equal(render(ticket).notes.length, 1)
})

test('locale changes numbers and words', () => {
  const r = render(cashflow, { locale: 'pt-BR', currency: 'BRL', messages: ptBR })
  assert.match(r.markup, /R\$/)
  assert.match(r.markup, />previsto</)
  assert.match(r.reason, /colunas/)
})

test('kpi renders values as cards', () => {
  const { markup } = render(runway)
  assert.match(markup, /\$41\.4K/)
})

test('cumulative share labels do not overlap on narrow widths', () => {
  const { markup } = render(people, { width: 320 })
  const labels = [...markup.matchAll(/<text x="([\d.]+)" y="([\d.]+)"[^>]*font-weight="600">([^<]+)</g)].map((m) => ({
    x: +m[1]!,
    y: +m[2]!,
    w: m[3]!.length * 6.7,
  }))
  for (let i = 1; i < labels.length; i++) {
    const a = labels[i - 1]!
    const b = labels[i]!
    assert.ok(a.y !== b.y || b.x - b.w / 2 >= a.x + a.w / 2, `labels ${i - 1} and ${i} overlap`)
  }
})

test('negative columns grow down from zero', () => {
  const { markup } = render(result)
  assert.match(markup, /fill="var\(--bi-s2,#eb6834\)"/)
})

const visible = (svg: string) => svg.replace(/<title>[\s\S]*?<\/title>/g, '')

test('multi-series columns name each series in a legend', () => {
  const m = visible(render(cashflow).markup)
  assert.match(m, />Inflows</)
  assert.match(m, />Outflows</)
  assert.match(m, />open</)
})

test('share names every part, not only the cumulative marks', () => {
  const m = visible(render(people).markup)
  for (const part of ['Staff', 'Owners', 'Contractors', 'Rest']) assert.match(m, new RegExp('>' + part + ' '))
})

test('a single-series chart has no legend', () => {
  assert.doesNotMatch(visible(render(ticket).markup), /<rect[^>]*width="10" height="10"/)
})
