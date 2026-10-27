import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { en } from '../src/locale/en.ts'
import { route } from '../src/route.ts'
import { validate } from '../src/validate.ts'
import { examples } from '../site/reasons.ts'

const CODES = [
  'category-flat',
  'category-multi',
  'category-negative',
  'category-rank',
  'category-top',
  'empty',
  'fallback',
  'flow-stages',
  'level-trend',
  'missing-values',
  'mixed-units',
  'negative-series',
  'not-a-whole',
  'record-list',
  'share-few',
  'share-many',
  'signed-mixed',
  'single-row',
  'too-few-periods',
  'too-many-series',
  'volume-trend',
]

test('reason codes are a contract: never renamed or removed', () => {
  assert.deepEqual(Object.keys(en.reasons!).sort(), CODES)
})

test('every reason code has a valid example that routes to it', () => {
  for (const code of CODES.filter((c) => c !== 'fallback')) {
    const ds = examples[code as keyof typeof examples]
    assert.ok(ds, code)
    assert.deepEqual(validate(ds), [], code)
    assert.equal(route(ds).code, code)
  }
})

test('schema v1 only grows: required fields and enums stay', () => {
  const schema = JSON.parse(readFileSync(new URL('../schema.json', import.meta.url), 'utf8'))
  assert.deepEqual(schema.required, ['title', 'dimension', 'measures', 'rows'])
  assert.deepEqual(schema.properties.schemaVersion, { const: 1 })
  assert.deepEqual(schema.properties.dimension.properties.kind.enum, ['time', 'category', 'stage', 'record'])
  assert.deepEqual(schema.properties.measures.items.properties.unit.enum, ['currency', 'percent', 'count', 'number', 'text'])
  assert.deepEqual(schema.properties.measures.items.properties.nature.enum, ['flow', 'level', 'signed'])
})
