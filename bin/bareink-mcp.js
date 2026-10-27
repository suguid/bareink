#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { render } from '../dist/index.js'
import { de } from '../dist/locale/de.js'
import { en } from '../dist/locale/en.js'
import { es } from '../dist/locale/es.js'
import { fr } from '../dist/locale/fr.js'
import { ptBR } from '../dist/locale/pt-BR.js'
import { validate } from '../dist/validate.js'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const schema = JSON.parse(readFileSync(new URL('../schema.json', import.meta.url), 'utf8'))
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 ? process.argv[i + 1] : undefined
}
const messages = { de, en, es, fr, 'pt-BR': ptBR }[arg('locale') ?? process.env.BAREINK_LOCALE ?? 'en'] ?? en
const width = Number(arg('width')) || 640

const tool = {
  name: 'chart',
  description:
    'Draws a chart, number cards or a table from numbers described by what they mean. You never pick the chart type: bareink picks it and returns a stable reason code. ' +
    'Returns the decision, then the markup: SVG for charts, HTML for tables and number cards. Show the markup to the user as it is, and explain the choice from the code in your own words.',
  inputSchema: { ...schema, $schema: undefined },
}

function chart(ds) {
  const errors = validate(ds)
  if (errors.length) return { isError: true, content: [{ type: 'text', text: `Fix these and call chart again:\n${errors.join('\n')}` }] }
  const r = render(ds, { messages, width })
  const decision = [`form: ${r.form}`, `code: ${r.code}`, `reason: ${r.reason}`, ...r.notes.map((n) => `note: ${n}`)].join('\n')
  return { content: [{ type: 'text', text: decision }, { type: 'text', text: r.markup }] }
}

const handlers = {
  initialize: (p) => ({
    protocolVersion: p?.protocolVersion ?? '2025-06-18',
    capabilities: { tools: {} },
    serverInfo: { name: 'bareink', version: pkg.version },
  }),
  ping: () => ({}),
  'tools/list': () => ({ tools: [tool] }),
  'tools/call': (p) => {
    if (p?.name !== 'chart') throw Object.assign(new Error(`Unknown tool: ${p?.name}`), { code: -32602 })
    return chart(p.arguments ?? {})
  },
}

const send = (msg) => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', ...msg }) + '\n')

createInterface({ input: process.stdin }).on('line', (line) => {
  if (!line.trim()) return
  let msg
  try {
    msg = JSON.parse(line)
  } catch {
    return send({ id: null, error: { code: -32700, message: 'Parse error' } })
  }
  if (msg.id === undefined) return
  const handler = handlers[msg.method]
  if (!handler) return send({ id: msg.id, error: { code: -32601, message: `Method not found: ${msg.method}` } })
  try {
    send({ id: msg.id, result: handler(msg.params) })
  } catch (e) {
    send({ id: msg.id, error: { code: e.code ?? -32603, message: String(e.message ?? e) } })
  }
})
