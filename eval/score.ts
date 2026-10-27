import { readFileSync } from 'node:fs'
import { route } from '../src/route.ts'
import type { Dataset } from '../src/types.ts'
import { validate } from '../src/validate.ts'
import { cases } from './cases.ts'

const checks: Record<string, (ds: Dataset) => string | undefined> = {
  'sales-forecast': (ds) => (ds.forecastFrom === 9 ? undefined : `forecastFrom ${ds.forecastFrom}`),
  'expenses-vs-budget-line': (ds) => (ds.reference?.value === 40000 ? undefined : `reference ${JSON.stringify(ds.reference)}`),
  'missing-month': (ds) => {
    const key = ds.measures[0]?.key ?? ''
    return ds.rows[2]?.[key] === null ? undefined : `March is ${JSON.stringify(ds.rows[2]?.[key])}`
  },
}
const scale: Record<string, number> = { 'units-in-thousands': 1000 }

const numbers = (ds: Dataset) =>
  ds.rows
    .flatMap((r) => ds.measures.map((m) => r[m.key]))
    .filter((v): v is number => typeof v === 'number')
    .sort((a, b) => a - b)

export function score(file: string) {
  const answers: Record<string, unknown> = JSON.parse(readFileSync(file, 'utf8'))
  const rows = cases.map((c) => {
    const ds = answers[c.id] as Dataset
    const errors = ds === undefined ? ['no answer'] : validate(ds)
    if (errors.length) return { id: c.id, valid: false, fits: false, faithful: false, form: '-', issue: errors.slice(0, 2).join('; ') }
    const { form, code } = route(ds)
    const expected = c.rows
      .flat()
      .filter((v): v is number => typeof v === 'number')
      .map((v) => v * (scale[c.id] ?? 1))
      .sort((a, b) => a - b)
    const got = numbers(ds)
    const faithful = expected.length === got.length && expected.every((v, i) => Math.abs(v - got[i]!) < 1e-6)
    const issue = [checks[c.id]?.(ds), faithful ? undefined : 'numbers differ from the query'].filter(Boolean).join('; ')
    return { id: c.id, valid: true, fits: c.accept.includes(form), faithful, form: `${form} (${code})`, issue }
  })
  const pct = (k: 'valid' | 'fits' | 'faithful') => `${rows.filter((r) => r[k]).length}/${rows.length}`
  return { rows, summary: { valid: pct('valid'), fits: pct('fits'), faithful: pct('faithful') } }
}

for (const file of process.argv.slice(2)) {
  const { rows, summary } = score(file)
  console.log(`\n${file}  valid ${summary.valid}  form fits ${summary.fits}  numbers faithful ${summary.faithful}`)
  for (const r of rows) if (!r.valid || !r.fits || r.issue) console.log(`  ${r.id}: ${r.form} ${r.issue}`)
}
