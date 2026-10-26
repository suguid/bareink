import { light, type Ctx, type Palette, type Token } from './context.ts'
import { formatter, type FormatOptions } from './format.ts'
import { labels } from './messages.ts'
import { bars } from './render/bars.ts'
import { columns } from './render/columns.ts'
import { line } from './render/line.ts'
import { share } from './render/share.ts'
import { kpi, table } from './render/table.ts'
import { waterfall } from './render/waterfall.ts'
import { route } from './route.ts'
import type { Markup } from './svg.ts'
import type { Dataset, Decision, Form, Messages } from './types.ts'

export interface RenderOptions extends FormatOptions {
  /** Width in pixels the chart is laid out for, at least 200. Defaults to 640. The SVG still scales down with its container. */
  width?: number
  /** A locale such as `en` from `bareink/locale/en` or `ptBR` from `bareink/locale/pt-BR`. Sets words, reasons and, unless overridden, `locale` and `currency`. */
  messages?: Messages
  /** Write colors as plain hex instead of CSS variables, for PDF, rasterizers and images in a README. */
  inlineColors?: boolean
  /** Override some or all colors; see `light` and `dark`. */
  palette?: Partial<Palette>
  /** Prefix for hatch pattern ids. Set it when one page shows charts with different inline palettes. */
  id?: string
}

export interface Rendered extends Decision {
  /** An SVG string for charts, an HTML string for tables and number cards. All text is escaped. */
  markup: string
  /** Sentences to show under the chart, such as why an axis does not start at zero. */
  notes: string[]
}

const RENDERERS: Record<Form, (ctx: Ctx) => Markup> = {
  columns: (c) => columns(c),
  diverging: (c) => columns(c, true),
  bars,
  line,
  waterfall,
  share,
  kpi,
  table,
}

function context(ds: Dataset, o: RenderOptions): Ctx {
  const ff = ds.forecastFrom
  const pal = { ...light, ...o.palette }
  return {
    ds,
    width: Math.max(200, Number(o.width) || 640),
    fmt: formatter({ ...o.messages, ...o }),
    msg: o.messages ?? labels,
    id: (o.id ?? 'bi').replace(/[^\w-]/g, '_'),
    ff: ff != null && ff >= 0 && ff < ds.rows.length ? ff : undefined,
    c: (t: Token) => (o.inlineColors ? pal[t] : `var(--bi-${t},${pal[t]})`),
    notes: [],
  }
}

/** Picks the form for a dataset and draws it. Trusts its input: run `validate` first on data from users or models. */
export function render(ds: Dataset, o: RenderOptions = {}): Rendered {
  const ctx = context(ds, o)
  const decision = route(ds, ctx.msg)
  const markup = RENDERERS[decision.form](ctx).h
  return { ...decision, markup, notes: ctx.notes }
}

/** The dataset as an HTML table: the accessible fallback for any chart. */
export function renderTable(ds: Dataset, o: RenderOptions = {}): string {
  return table(context(ds, o)).h
}

/** CSS custom properties for a palette, e.g. `cssVariables(dark)` inside a dark-mode media query. */
export function cssVariables(p: Palette, selector = ':root'): string {
  return selector + '{' + (Object.keys(p) as Token[]).map((t) => `--bi-${t}:${p[t]}`).join(';') + '}'
}

export { route } from './route.ts'
export { light, dark, type Palette } from './context.ts'
export type * from './types.ts'
