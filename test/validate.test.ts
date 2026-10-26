import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import type { Dataset } from '../src/types.ts'
import { KINDS, NATURES, UNITS, validate } from '../src/validate.ts'
import * as fixtures from './fixtures.ts'

const schema = JSON.parse(readFileSync(new URL('../schema.json', import.meta.url), 'utf8'))

test('every fixture is valid', () => {
  for (const [name, ds] of Object.entries(fixtures)) assert.deepEqual(validate(ds), [], name)
})

test('schema enums match the validator', () => {
  assert.deepEqual(schema.properties.dimension.properties.kind.enum, [...KINDS])
  assert.deepEqual(schema.properties.measures.items.properties.unit.enum, [...UNITS])
  assert.deepEqual(schema.properties.measures.items.properties.nature.enum, [...NATURES])
})

test('schema covers every dataset field', () => {
  const fields = {
    schemaVersion: true,
    title: true,
    dimension: true,
    measures: true,
    rows: true,
    partOfWhole: true,
    forecastFrom: true,
    reference: true,
    highlight: true,
    muted: true,
    uncertain: true,
    totalRows: true,
    keepOrder: true,
    markCumulative: true,
  } satisfies Record<keyof Dataset, true>
  assert.deepEqual(Object.keys(schema.properties).sort(), Object.keys(fields).sort())
})

test('errors name the path, the rule and what was received', () => {
  const bad = {
    title: '',
    dimension: { key: 'm', label: 'Month', kind: 'month' },
    measures: [
      { key: 'v', label: 'Sales', unit: 'money', nature: 'flow' },
      { key: 'v', label: 'Again', unit: 'currency' },
    ],
    rows: [{ m: 'Jan', v: '12' }, { v: 3 }],
    forecastFrom: 5,
    highlight: [1, -1],
    reference: { value: 'high' },
  }
  const errors = validate(bad)
  for (const expected of [
    'title must be a non-empty string; got ""',
    'dimension.kind must be one of time, category, stage, record; got "month"',
    'measures[0].unit must be one of currency, percent, count, number, text; got "money"',
    'measures[1].key must be unique across the dimension, measures and open amounts; got "v"',
    'rows[0].v must be a number between -1e15 and 1e15, or null; got "12"',
    'rows[1].m must be a string or number label; got nothing',
    'forecastFrom must be a row index from 0 to 1; got 5',
    'highlight[1] must be a row index from 0 to 1; got -1',
    'reference.value must be a finite number; got "high"',
    'reference.label must be a non-empty string; got nothing',
  ])
    assert.ok(errors.includes(expected), `missing: ${expected}\n${errors.join('\n')}`)
})

test('garbage in gives one clear error, not a crash', () => {
  assert.deepEqual(validate(null), ['dataset must be an object; got null'])
  assert.ok(validate({}).length >= 4)
  assert.ok(validate({ title: 't', dimension: 'x', measures: 'y', rows: 3 }).length >= 3)
})
