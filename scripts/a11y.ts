import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { examples } from '../site/reasons.ts'
import { render, renderTable } from '../src/index.ts'
import { en } from '../src/locale/en.ts'

type AXNode = { nodeId: string; ignored: boolean; role?: { value: string }; name?: { value: string }; childIds?: string[]; properties?: { name: string; value: { value: unknown } }[] }

const cases = Object.values(examples).map((ds) => ({ ds, r: render(ds, { width: 560, messages: en }) }))
const body = cases
  .map(({ ds, r }) => `<section>${r.markup}${r.form === 'table' || r.form === 'kpi' ? '' : `<details><summary>Show the data</summary>${renderTable(ds, { messages: en })}</details>`}</section>`)
  .join('')
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>bareink screen reader check</title><main>${body}</main>`

const pageOnly = process.argv.indexOf('--page')
if (pageOnly > 0) {
  writeFileSync(process.argv[pageOnly + 1]!, html)
  process.exit(0)
}

const chrome = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  join(homedir(), '.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell'),
].find((p) => p && existsSync(p))
if (!chrome) throw new Error('No Chrome found; set CHROME_PATH')

const dir = mkdtempSync(join(tmpdir(), 'bareink-a11y-'))
const file = join(dir, 'index.html')
writeFileSync(file, html)

const proc = spawn(chrome, ['--headless', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${dir}/profile`, 'about:blank'])
const port = await new Promise<string>((resolve, reject) => {
  let err = ''
  proc.stderr.on('data', (d) => {
    err += d
    const m = /DevTools listening on ws:\/\/[^:]+:(\d+)\//.exec(err)
    if (m) resolve(m[1]!)
  })
  proc.on('exit', () => reject(new Error(`Chrome exited: ${err}`)))
})

try {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(pathToFileURL(file).href)}`, { method: 'PUT' })).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r) => (ws.onopen = r))
  let seq = 0
  const waiting = new Map<number, (v: any) => void>()
  ws.onmessage = (e) => {
    const m = JSON.parse(String(e.data))
    waiting.get(m.id)?.(m.result)
  }
  const send = (method: string, params = {}) => new Promise<any>((r) => (waiting.set(++seq, r), ws.send(JSON.stringify({ id: seq, method, params }))))
  await new Promise((r) => setTimeout(r, 1000))
  await send('Accessibility.enable')
  const nodes: AXNode[] = (await send('Accessibility.getFullAXTree')).nodes
  ws.close()

  const byId = new Map(nodes.map((n) => [n.nodeId, n]))
  const live = nodes.filter((n) => !n.ignored)
  const role = (n: AXNode) => n.role?.value ?? ''
  const name = (n: AXNode) => n.name?.value ?? ''
  const below = (n: AXNode): AXNode[] => (n.childIds ?? []).flatMap((id) => (byId.get(id) ? [byId.get(id)!, ...below(byId.get(id)!)] : []))
  const errors: string[] = []

  for (const { ds, r } of cases) {
    const want = r.form === 'table' ? 'table' : r.form === 'kpi' ? 'group' : 'image'
    const node = live.find((n) => role(n) === want && name(n) === ds.title)
    if (!node) {
      errors.push(`${r.code}: no ${want} named "${ds.title}"`)
      continue
    }
    if (r.form === 'table') {
      const headers = below(node).filter((n) => role(n) === 'columnheader').length
      if (headers !== ds.measures.length + 1) errors.push(`${r.code}: ${headers} column headers, expected ${ds.measures.length + 1}`)
      const rowHeaders = below(node).filter((n) => role(n) === 'rowheader').length
      if (rowHeaders !== ds.rows.length) errors.push(`${r.code}: ${rowHeaders} row headers, expected ${ds.rows.length}`)
    }
  }
  const focusable = live.filter((n) => n.properties?.some((p) => p.name === 'focusable' && p.value.value))
  for (const n of focusable) if (role(n) !== 'RootWebArea' && !name(n).trim()) errors.push(`a focusable ${role(n)} has no name`)
  for (const img of live.filter((n) => role(n) === 'image'))
    if (below(img).some((n) => focusable.includes(n))) errors.push(`image "${name(img)}" holds focusable parts, which NVDA reads as silent Tab stops`)
  const tables = live.filter((n) => role(n) === 'table')
  for (const t of tables) if (!below(t).some((n) => role(n) === 'columnheader')) errors.push(`table "${name(t)}" has no column headers`)

  if (errors.length) {
    console.error(errors.join('\n'))
    process.exitCode = 1
  } else console.log(`a11y ok: ${cases.length} forms named by their title, ${focusable.length} focusable nodes named, ${tables.length} tables with headers`)
} finally {
  proc.kill()
}
