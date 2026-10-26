import assert from 'node:assert/strict'
import { test } from 'node:test'
import { route } from '../src/route.ts'
import { ptBR } from '../src/locale/pt-BR.ts'
import type { Dataset, Form, ReasonCode } from '../src/types.ts'
import { cashflow, expenses, people, pnl, result, runway, ticket } from './fixtures.ts'

const time = (values: number[], nature: 'flow' | 'level' | 'signed' = 'flow'): Dataset => ({
  title: 't',
  dimension: { key: 'p', label: 'Period', kind: 'time' },
  measures: [{ key: 'v', label: 'V', unit: 'currency', nature }],
  rows: values.map((v, i) => ({ p: String(i), v })),
})

const cat = (values: number[]): Dataset => ({
  title: 'c',
  dimension: { key: 'k', label: 'Category', kind: 'category' },
  measures: [{ key: 'v', label: 'V', unit: 'currency', nature: 'flow' }],
  rows: values.map((v, i) => ({ k: 'k' + i, v })),
})

const cases: [string, Dataset, Form, ReasonCode][] = [
  ['volume per month', cashflow, 'columns', 'volume-trend'],
  ['signed result with mixed signs', result, 'diverging', 'signed-mixed'],
  ['signed result, all positive', time([1, 2, 3], 'signed'), 'columns', 'volume-trend'],
  ['level over time', ticket, 'line', 'level-trend'],
  ['long flow series becomes a line', time(Array.from({ length: 24 }, (_, i) => i + 1)), 'line', 'level-trend'],
  ['two periods', time([1, 2]), 'table', 'too-few-periods'],
  ['ranked categories', expenses, 'bars', 'category-rank'],
  ['many categories', cat([9, 8, 7, 6, 5, 4, 3, 2, 1, 1]), 'bars', 'category-top'],
  ['nearly equal categories', cat([100, 98, 99]), 'table', 'category-flat'],
  ['negative categories', cat([5, -2, 3]), 'table', 'category-negative'],
  ['waterfall', pnl, 'waterfall', 'flow-stages'],
  ['share of a whole', people, 'share', 'share-few'],
  ['share with many parts', { ...people, rows: [1, 2, 3, 4, 5].map((pct, i) => ({ part: 'p' + i, pct })) }, 'bars', 'share-many'],
  ['single row', runway, 'kpi', 'single-row'],
  ['mixed units', { ...cashflow, measures: [cashflow.measures[0]!, { key: 'n', label: 'N', unit: 'count' }] }, 'table', 'mixed-units'],
  [
    'four series',
    { ...ticket, measures: ['a', 'b', 'c', 'd'].map((key) => ({ key, label: key, unit: 'currency' as const, nature: 'level' as const })) },
    'table',
    'too-many-series',
  ],
  ['records', { ...expenses, dimension: { key: 'category', label: 'Item', kind: 'record' } }, 'table', 'record-list'],
  ['empty', { ...ticket, rows: [] }, 'table', 'empty'],
]

for (const [name, ds, form, code] of cases) {
  test(`route: ${name}`, () => {
    const d = route(ds)
    assert.equal(d.form, form)
    assert.equal(d.code, code)
    assert.ok(d.reason.length > 5)
  })
}

test('route never returns a pie', () => {
  for (const [, ds] of cases) assert.ok(!/pie|donut/.test(route(ds).form))
})

test('route speaks pt-BR when asked', () => {
  assert.match(route(people, ptBR).reason, /nunca pizza/)
})
