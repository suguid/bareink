import { build } from 'esbuild'
import { brotliCompressSync, gzipSync } from 'node:zlib'

const entries = {
  'bareink (everything)': 'export { render, renderTable } from "./src/index.ts"',
  'bareink/route only': 'export { route } from "./src/route.ts"',
  'pt-BR messages': 'export { ptBR } from "./src/locale/pt-BR.ts"',
}

const kb = (n) => (n / 1024).toFixed(2) + ' KB'
for (const [name, contents] of Object.entries(entries)) {
  const out = await build({ stdin: { contents, resolveDir: '.', loader: 'ts' }, bundle: true, minify: true, format: 'esm', write: false, target: 'es2020' })
  const code = out.outputFiles[0].contents
  console.log(`${name.padEnd(22)} min ${kb(code.length).padStart(9)}  gzip ${kb(gzipSync(code, { level: 9 }).length).padStart(8)}  brotli ${kb(brotliCompressSync(code).length).padStart(8)}`)
}
