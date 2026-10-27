import { execFileSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import { build } from 'esbuild'

rmSync(new URL('../dist', import.meta.url), { recursive: true, force: true })
execFileSync('tsc', ['-p', 'tsconfig.build.json'], { stdio: 'inherit' })
await build({
  stdin: {
    contents: [
      'export * from "./src/index.ts"',
      'export { validate } from "./src/validate.ts"',
      'export { en } from "./src/locale/en.ts"',
      'export { ptBR } from "./src/locale/pt-BR.ts"',
    ].join('\n'),
    resolveDir: '.',
    loader: 'ts',
  },
  bundle: true,
  legalComments: 'none',
  format: 'iife',
  globalName: 'bareink',
  target: 'es2020',
  outfile: 'dist/bareink.iife.js',
})
