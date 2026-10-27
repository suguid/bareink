import { execFileSync } from 'node:child_process'

const ds = {
  title: 'Revenue',
  dimension: { key: 'm', label: 'Month', kind: 'time' },
  measures: [{ key: 'v', label: 'Revenue', unit: 'currency', nature: 'flow' }],
  rows: [{ m: 'Jan', v: 10 }, { m: 'Feb', v: -12 }, { m: 'Mar', v: 9 }],
}
const call = (id, method, params) => JSON.stringify({ jsonrpc: '2.0', id, method, params })
const out = execFileSync(process.execPath, [new URL('../bin/bareink-mcp.js', import.meta.url).pathname], {
  input: [call(1, 'initialize', {}), call(2, 'tools/list'), call(3, 'tools/call', { name: 'chart', arguments: ds })].join('\n') + '\n',
})
const replies = out.toString().trim().split('\n').map((l) => JSON.parse(l))
if (replies[1]?.result.tools[0].name !== 'chart' || !replies[2]?.result.content[0].text.includes('code: signed-mixed')) {
  console.error('mcp smoke failed', replies)
  throw new Error('mcp smoke failed')
}
console.log('mcp smoke ok')
