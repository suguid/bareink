import assert from 'node:assert/strict'
import { test } from 'node:test'
import { band, linear, nice, point, ticks } from '../src/scale.ts'

test('ticks match d3', () => {
  assert.deepEqual(ticks(0, 1, 10), [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1])
  assert.deepEqual(ticks(0, 100, 4), [0, 20, 40, 60, 80, 100])
  assert.deepEqual(ticks(-14130, 14130, 4), [-10000, -5000, 0, 5000, 10000])
  assert.deepEqual(ticks(0, 49360, 4), [0, 10000, 20000, 30000, 40000])
})

test('nice matches d3', () => {
  assert.deepEqual(nice(0, 49360, 4), [0, 50000])
  assert.deepEqual(nice(0.13, 0.97, 10), [0.1, 1])
  assert.deepEqual(nice(-14130, 14130, 4), [-20000, 20000])
  assert.deepEqual(nice(0, 0, 4), [0, 1])
})

test('linear maps and inverts the range', () => {
  const y = linear([0, 100], [200, 0])
  assert.equal(y(0), 200)
  assert.equal(y(50), 100)
  assert.equal(y(100), 0)
})

test('band matches d3 scaleBand', () => {
  const x = band(4, [0, 100], 0.2, 0.1)
  assert.ok(Math.abs(x.step - 100 / 4) < 1e-9)
  assert.ok(Math.abs(x.bandwidth - 20) < 1e-9)
  assert.ok(Math.abs(x(0) - 2.5) < 1e-9)
})

test('point spreads evenly and centres a single point', () => {
  const x = point(3, [0, 100])
  assert.deepEqual([x(0), x(1), x(2)], [0, 50, 100])
  assert.equal(point(1, [0, 100])(0), 50)
})
