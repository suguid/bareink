import { build } from 'esbuild'
import { readFileSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const entries = {
  render: 'export { render, renderTable } from "./src/index.ts"',
  route: 'export { route } from "./src/route.ts"',
}
const budget = JSON.parse(readFileSync(new URL('../size-budget.json', import.meta.url), 'utf8'))
const update = process.argv.includes('--update-baseline')
let failed = false

for (const [name, contents] of Object.entries(entries)) {
  const out = await build({ stdin: { contents, resolveDir: '.', loader: 'ts' }, bundle: true, minify: true, format: 'esm', write: false, target: 'es2020' })
  const code = out.outputFiles[0].contents
  const gz = gzipSync(code, { level: 9 }).length
  const { baseline, limit } = budget[name]
  const delta = gz - baseline
  const over = gz > limit
  failed ||= over
  console.log(`${name.padEnd(7)} gzip ${String(gz).padStart(5)} B  baseline ${baseline}  ${delta >= 0 ? '+' : ''}${delta} B  limit ${limit}${over ? '  OVER LIMIT' : ''}`)
  if (update) budget[name].baseline = gz
}
if (update) writeFileSync(new URL('../size-budget.json', import.meta.url), JSON.stringify(budget, null, 2) + '\n')
if (failed && !update) process.exit(1)
