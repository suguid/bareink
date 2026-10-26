import { render, route } from '../dist/index.js'
import { en } from '../dist/locale/en.js'
import { validate } from '../dist/validate.js'

const ds = {
  title: 'Revenue',
  dimension: { key: 'm', label: 'Month', kind: 'time' },
  measures: [{ key: 'v', label: 'Revenue', unit: 'currency', nature: 'flow' }],
  rows: [{ m: 'Jan', v: 10 }, { m: 'Feb', v: -12 }, { m: 'Mar', v: 9 }],
}
const errors = validate(ds)
const r = render(ds, { messages: en, width: 320 })
if (errors.length || r.form !== 'diverging' || !r.markup.startsWith('<svg') || route(ds).code !== 'signed-mixed') {
  console.error('smoke failed', { errors, form: r.form })
  throw new Error('smoke failed')
}
console.log('smoke ok:', r.form, r.markup.length, 'bytes')
