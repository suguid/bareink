import { render } from '../src/index.ts'
import { cashflow, expenses, people, pnl, result, runway, ticket } from '../test/fixtures.ts'

const sets = [cashflow, result, expenses, ticket, pnl, people, runway]
const run = (n: number, opts = {}) => {
  const t = performance.now()
  for (let i = 0; i < n; i++) for (const ds of sets) render(ds, opts)
  return ((performance.now() - t) * 1000) / (n * sets.length)
}
run(300)
console.log(`render: ${run(3000).toFixed(1)} µs/chart (en-US)`)
console.log(`render: ${run(3000, { locale: 'pt-BR', currency: 'BRL' }).toFixed(1)} µs/chart (pt-BR)`)
