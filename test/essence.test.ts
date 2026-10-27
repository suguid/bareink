import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import * as core from '../src/index.ts'
import * as validation from '../src/validate.ts'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

test('no runtime dependencies', () => {
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies', 'bundleDependencies'])
    assert.equal(pkg[field], undefined, field)
})

test('the public surface only grows on purpose', () => {
  assert.deepEqual(Object.keys(core).sort(), ['cssVariables', 'dark', 'light', 'render', 'renderTable', 'route'])
  assert.deepEqual(Object.keys(validation).sort(), ['KINDS', 'NATURES', 'UNITS', 'validate'])
  assert.deepEqual(Object.keys(pkg.exports).sort(), [
    '.',
    './iife',
    './locale/en',
    './locale/pt-BR',
    './package.json',
    './route',
    './schema.json',
    './validate',
  ])
  assert.deepEqual(pkg.bin, { 'bareink-mcp': './bin/bareink-mcp.js' })
})

test('never a pie, never a dual axis', () => {
  const forms = readFileSync(new URL('../src/types.ts', import.meta.url), 'utf8').match(/export type Form = (.*)/)?.[1]
  assert.ok(forms)
  assert.doesNotMatch(forms, /pie|donut|doughnut|dual/i)
})
