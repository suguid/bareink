import assert from 'node:assert/strict'
import { test } from 'node:test'
import { render } from '../src/index.ts'
import { validate } from '../src/validate.ts'
import type { Dataset } from '../src/types.ts'

const time = (values: (number | null)[], nature: 'flow' | 'level' | 'signed' = 'level', extra: Partial<Dataset> = {}): Dataset => ({
  title: 't',
  dimension: { key: 'p', label: 'Period', kind: 'time' },
  measures: [{ key: 'v', label: 'Price', unit: 'currency', nature }],
  rows: values.map((v, i) => ({ p: 'p' + i, v })),
  ...extra,
})

const nums = (svg: string, attr: string) => [...svg.matchAll(new RegExp(` ${attr}="(-?[\\d.]+)"`, 'g'))].map((m) => Number(m[1]))

test('a missing value is a gap, never a zero', () => {
  const line = render(time([100, null, 104, 106])).markup
  assert.doesNotMatch(line, /Price: \$0/)
  assert.match(line, /Price: —/)
  assert.match(line, /<path d="M[^"]*M[^"]*"/, 'the line breaks around the gap')
  const cols = render(time([5, null, 7, 8], 'flow')).markup
  assert.match(cols, /Price: —/)
  assert.match(render({ ...time([null]), measures: [{ key: 'v', label: 'Cash', unit: 'currency' }] }).markup, />—</)
})

test('categories, stages and shares with a missing value become a table', () => {
  const ds: Dataset = {
    title: 't',
    dimension: { key: 'k', label: 'K', kind: 'category' },
    measures: [{ key: 'v', label: 'V', unit: 'currency' }],
    rows: [{ k: 'a', v: 5 }, { k: 'b', v: null }, { k: 'c', v: 2 }],
  }
  assert.equal(render(ds).form, 'table')
  assert.equal(render({ ...ds, dimension: { ...ds.dimension, kind: 'stage' } }).form, 'table')
})

test('an all-negative line includes zero or notes the offset', () => {
  const near = render(time([-100, -95, -90]))
  assert.ok(near.notes.length || /> ?0</.test(near.markup) || near.markup.includes('>0<'), 'zero on the axis or a note')
  const far = render(time([-100, -60, -20]))
  assert.ok(far.markup.includes('>0<') || far.notes.length)
})

test('stages and shares with several measures become a table', () => {
  const stage: Dataset = {
    title: 't',
    dimension: { key: 's', label: 'S', kind: 'stage' },
    measures: [{ key: 'a', label: 'A', unit: 'currency' }, { key: 'b', label: 'B', unit: 'currency' }],
    rows: [{ s: 'Rev', a: 100, b: 200 }, { s: 'Cost', a: -40, b: -50 }, { s: 'Res', a: 60, b: 150 }],
  }
  assert.equal(render(stage).form, 'table')
  assert.equal(render({ ...stage, dimension: { key: 's', label: 'S', kind: 'category' }, partOfWhole: true, measures: stage.measures.map((m) => ({ ...m, unit: 'percent' as const })) }).form, 'table')
})

test('every part of a share has its own color', () => {
  const ds: Dataset = {
    title: 't',
    partOfWhole: true,
    dimension: { key: 'k', label: 'K', kind: 'category' },
    measures: [{ key: 'v', label: 'V', unit: 'percent' }],
    rows: [{ k: 'a', v: 20 }, { k: 'b', v: 30 }, { k: 'c', v: 40 }],
  }
  const fills = [...render(ds).markup.matchAll(/<rect x="[\d.]+" y="[\d.]+" width="[\d.]+" height="22" rx="3" fill="([^"]+)"/g)].map((m) => m[1])
  assert.equal(new Set(fills).size, fills.length, fills.join(' '))
})

test('a part of a whole that is not a percent is not drawn as one', () => {
  const r = render({
    title: 't',
    partOfWhole: true,
    dimension: { key: 'k', label: 'K', kind: 'category' },
    measures: [{ key: 'v', label: 'V', unit: 'currency' }],
    rows: [{ k: 'Rent', v: 30 }, { k: 'Staff', v: 40 }],
  })
  assert.notEqual(r.form, 'share')
  assert.doesNotMatch(r.markup, /Rest/)
})

test('a negative reference stays inside the chart', () => {
  const ref = { value: -50, label: 'floor' }
  for (const ds of [time([10, 20, 30], 'flow', { reference: ref }), time([10, -20, 30], 'signed', { reference: ref })]) {
    const svg = render(ds).markup
    const h = Number(/height="([\d.]+)"/.exec(svg)![1])
    for (const y of nums(svg, 'y1')) assert.ok(y >= 0 && y <= h, `y=${y} outside 0..${h}`)
  }
  const bars = render({
    title: 't',
    dimension: { key: 'k', label: 'K', kind: 'category' },
    measures: [{ key: 'v', label: 'V', unit: 'count' }],
    rows: [{ k: 'a', v: 5 }, { k: 'b', v: 9 }],
    reference: ref,
  }).markup
  for (const x of nums(bars, 'x1')) assert.ok(x >= 0 && x <= 640, `x=${x}`)
})

test('a line draws its reference', () => {
  assert.match(render(time([100, 104, 106], 'level', { reference: { value: 103, label: 'Target' } })).markup, />Target</)
})

test('open amounts are never negative and never double the value', () => {
  const ds = time([10, 10, 10], 'flow')
  assert.ok(validate({ ...ds, measures: [{ ...ds.measures[0]!, openKey: 'v' }] }).length > 0)
  assert.ok(validate({ ...ds, measures: [{ ...ds.measures[0]!, openKey: 'o' }], rows: ds.rows.map((r) => ({ ...r, o: -30 })) }).length > 0)
  const svg = render({ ...ds, measures: [{ ...ds.measures[0]!, openKey: 'o' }], rows: ds.rows.map((r) => ({ ...r, o: -30 })) }).markup
  assert.doesNotMatch(svg, /-\$/)
})

test('bars keep the original row index', () => {
  const svg = render({
    title: 't',
    dimension: { key: 'k', label: 'K', kind: 'category' },
    measures: [{ key: 'v', label: 'V', unit: 'count' }],
    rows: [{ k: 'small', v: 1 }, { k: 'big', v: 9 }],
  }).markup
  assert.match(svg, /data-i="1"><title>big/)
})

test('an id with spaces still links the hatch pattern', () => {
  const svg = render(time([5, 6, 7], 'flow', { forecastFrom: 2 }), { id: 'chart 1' }).markup
  const id = /<pattern id="([^"]+)"/.exec(svg)![1]!
  assert.doesNotMatch(id, /\s/)
  assert.ok(svg.includes(`url(#${id})`))
})

test('a NaN width falls back to the default', () => {
  assert.doesNotMatch(render(time([5, 6, 7], 'flow'), { width: Number.NaN }).markup, /NaN/)
})

test('validate agrees with the schema on the edges', () => {
  const ok = time([1, 2, 3])
  for (const bad of [
    { ...ok, schemaVersion: 7 },
    { ...ok, chart: 'pie' },
    { ...ok, dimension: { ...ok.dimension, extra: 1 } },
    { ...ok, reference: { value: 1, label: 'x', alertAbove: 'yes' } },
    { ...ok, title: '   ' },
    { ...ok, rows: [{ p: 'a', v: 1e300 }, { p: 'b', v: 1 }, { p: 'c', v: 2 }] },
    { ...ok, partOfWhole: true },
  ])
    assert.ok(validate(bad).length > 0, JSON.stringify(bad).slice(0, 120))
})
