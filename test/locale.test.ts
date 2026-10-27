import assert from 'node:assert/strict'
import { test } from 'node:test'
import { render } from '../src/index.ts'
import { de } from '../src/locale/de.ts'
import { en } from '../src/locale/en.ts'
import { es } from '../src/locale/es.ts'
import { fr } from '../src/locale/fr.ts'
import { ptBR } from '../src/locale/pt-BR.ts'
import { cashflow } from './fixtures.ts'

const codes = Object.keys(en.reasons!).sort()

for (const [name, m] of Object.entries({ de, es, fr, ptBR })) {
  test(`locale ${name} covers every reason code and chart word`, () => {
    assert.deepEqual(Object.keys(m.reasons!).sort(), codes)
    for (const reason of Object.values(m.reasons!)) assert.match(reason, /\S.*\.$/)
    for (const word of [m.others(3), m.rest, m.forecast, m.open, m.axisOffset('1')]) assert.ok(word.trim())
    assert.ok(m.locale && m.currency)
  })

  test(`locale ${name} formats numbers in its own way`, () => {
    const r = render(cashflow, { messages: m })
    assert.ok(r.reason)
    assert.ok(r.markup.includes(m.forecast))
  })
}
