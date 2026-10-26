import { light, type Ctx, type Palette, type Token } from './context.ts'
import { formatter, type FormatOptions } from './format.ts'
import { en } from './messages.ts'
import { bars } from './render/bars.ts'
import { columns } from './render/columns.ts'
import { diverging } from './render/diverging.ts'
import { line } from './render/line.ts'
import { share } from './render/share.ts'
import { kpi, table } from './render/table.ts'
import { waterfall } from './render/waterfall.ts'
import { route } from './route.ts'
import type { Markup } from './svg.ts'
import type { Dataset, Decision, Form, Messages } from './types.ts'

export interface RenderOptions extends FormatOptions {
  width?: number
  messages?: Messages
  inlineColors?: boolean
  palette?: Partial<Palette>
  id?: string
}

export interface Rendered extends Decision {
  markup: string
  notes: string[]
}

const RENDERERS: Record<Form, (ctx: Ctx) => Markup> = { columns, bars, line, diverging, waterfall, share, kpi, table }

const hash = (s: string): string => {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

function context(ds: Dataset, o: RenderOptions): Ctx {
  const pal = { ...light, ...o.palette }
  return {
    ds,
    width: Math.max(200, o.width ?? 640),
    fmt: formatter(o),
    msg: o.messages ?? en,
    id: o.id ?? 'bi' + hash(ds.title),
    c: (t: Token) => (o.inlineColors ? pal[t] : `var(--bi-${t},${pal[t]})`),
    notes: [],
  }
}

export function render(ds: Dataset, o: RenderOptions = {}): Rendered {
  const ctx = context(ds, o)
  const decision = route(ds, ctx.msg)
  const markup = RENDERERS[decision.form](ctx).h
  return { ...decision, markup, notes: ctx.notes }
}

export function renderTable(ds: Dataset, o: RenderOptions = {}): string {
  return table(context(ds, o)).h
}

export function cssVariables(p: Palette, selector = ':root'): string {
  return selector + '{' + (Object.keys(p) as Token[]).map((t) => `--bi-${t}:${p[t]}`).join(';') + '}'
}

export { route } from './route.ts'
export { en } from './messages.ts'
export { light, dark, type Palette } from './context.ts'
export type * from './types.ts'
