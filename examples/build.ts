import { mkdirSync, writeFileSync } from 'node:fs'
import { cssVariables, dark, render } from '../src/index.ts'
import { en } from '../src/locale/en.ts'
import { cashflow, expenses, people, pnl, result, runway, ticket } from '../test/fixtures.ts'

const sets = [cashflow, result, expenses, ticket, pnl, people, runway]
const width = Number(process.argv[2] ?? 640)

const cards = sets
  .map((ds) => {
    const r = render(ds, { width, messages: en })
    return `<section><h2>${r.form}</h2><p class="reason">${r.reason}</p>${r.markup}${r.notes.map((n) => `<p class="note">${n}</p>`).join('')}</section>`
  })
  .join('\n')

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>bareink examples</title>
<style>
body{margin:0;padding:24px 16px;background:#f6f6f3;color:#0b0b0b;font:15px system-ui,sans-serif}
main{max-width:${width + 40}px;margin:0 auto;display:grid;gap:20px}
section{background:#fcfcfb;border:1px solid rgba(11,11,11,.1);border-radius:10px;padding:16px 18px}
h2{margin:0;font:600 13px ui-monospace,monospace;color:#1c5cab}.reason,.note{margin:4px 0 12px;color:#52514e;font-size:13px}
@media (prefers-color-scheme:dark){${cssVariables(dark)}body{background:#0f0f0e;color:#f0efec}section{background:#1a1a19;border-color:rgba(255,255,255,.1)}h2{color:#9ec5f4}.reason,.note{color:#c3c2b7}}
</style></head><body><main>${cards}</main></body></html>`

mkdirSync(new URL('./out/', import.meta.url), { recursive: true })
writeFileSync(new URL('./out/index.html', import.meta.url), page)
console.log('examples/out/index.html')
