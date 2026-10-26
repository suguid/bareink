import type { Formatter } from './format.ts'
import { el, p, textWidth, type Child, type Markup } from './svg.ts'
import type { Linear } from './scale.ts'
import type { Dataset, Messages, Row } from './types.ts'

export const light = {
  s1: '#2a78d6',
  s2: '#eb6834',
  s3: '#52514e',
  ink: '#0b0b0b',
  ink2: '#52514e',
  muted: '#898781',
  grid: '#e7e6e0',
  base: '#c3c2b7',
  band: '#efeee9',
  quiet: '#bdbcb4',
  surface: '#fcfcfb',
}

export const dark: Palette = {
  s1: '#3987e5',
  s2: '#d95926',
  s3: '#c3c2b7',
  ink: '#f0efec',
  ink2: '#c3c2b7',
  muted: '#8f8d86',
  grid: '#2c2c2a',
  base: '#44443f',
  band: '#232321',
  quiet: '#5a5954',
  surface: '#1a1a19',
}

export type Palette = typeof light
export type Token = keyof Palette

export const SERIES: Token[] = ['s1', 's2', 's3']

export interface Ctx {
  ds: Dataset
  width: number
  fmt: Formatter
  msg: Messages
  id: string
  c: (t: Token) => string
  notes: string[]
}

export const FONT = 'system-ui,sans-serif'

export function frame(ctx: Ctx, height: number, ...kids: Child[]): Markup {
  return el(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      class: 'bareink',
      viewBox: `0 0 ${p(ctx.width)} ${p(height)}`,
      width: ctx.width,
      height,
      role: 'img',
      'aria-label': ctx.ds.title,
      'font-family': FONT,
      'font-size': 11,
      fill: ctx.c('muted'),
      style: 'overflow:visible;max-width:100%;height:auto',
    },
    kids,
  )
}

export function hatches(ctx: Ctx, tokens: Token[]): Markup {
  return el(
    'defs',
    {},
    tokens.map((t) =>
      el(
        'pattern',
        { id: ctx.id + t, patternUnits: 'userSpaceOnUse', width: 6, height: 6, patternTransform: 'rotate(45)' },
        el('rect', { width: 6, height: 6, fill: ctx.c(t), 'fill-opacity': 0.12 }),
        el('rect', { width: 2.4, height: 6, fill: ctx.c(t) }),
      ),
    ),
  )
}

export const lab = (ctx: Ctx, r: Row): string => String(r[ctx.ds.dimension.key] ?? '')

export const hatch = (ctx: Ctx, t: Token): string => `url(#${ctx.id}${t})`

export function text(x: number, y: number, s: string, a: Record<string, string | number | undefined> = {}): Markup {
  return el('text', { x, y, ...a }, s)
}

export const mark = (ctx: Ctx, x: number, y: number, s: string): Markup =>
  text(x, y, s, { 'text-anchor': 'middle', fill: ctx.c('ink'), 'font-size': 11.5, 'font-weight': 600 })

export const xLabel = (ctx: Ctx, x: number, y: number, s: string): Markup => text(x, y, s, { 'text-anchor': 'middle', fill: ctx.c('ink2') })

export function hit(x: number, y: number, w: number, h: number, i: number, tip: string): Markup {
  return el('rect', { x, y, width: Math.max(w, 1), height: Math.max(h, 1), fill: 'transparent', tabindex: 0, 'data-i': i }, el('title', {}, tip))
}

export function yAxis(ctx: Ctx, y: Linear, x0: number, x1: number, fmt: (v: number) => string, baseAt: number): Child {
  return y
    .ticks(4)
    .map((t) => [
      el('line', { x1: x0, x2: x1, y1: y(t), y2: y(t), stroke: ctx.c(t === baseAt ? 'base' : 'grid') }),
      text(x0 - 8, y(t) + 4, fmt(t), { 'text-anchor': 'end' }),
    ])
}

export const axisRoom = (y: Linear, fmt: (v: number) => string): number => Math.max(28, ...y.ticks(4).map((t) => textWidth(fmt(t), 11) + 12))

export function labelEvery(labels: string[], step: number): number {
  const widest = Math.max(...labels.map((l) => textWidth(l, 11)))
  return Math.max(1, Math.ceil((widest + 8) / Math.max(step, 1)))
}

export function forecastBand(ctx: Ctx, x: number, y: number, w: number, h: number): Child {
  return [el('rect', { x, y: y - 16, width: w, height: h + 16, fill: ctx.c('band') }), text(x + 6, y - 4, ctx.msg.forecast)]
}

export interface Key {
  label: string
  t: Token
  hatched?: boolean
}

export function legend(ctx: Ctx, keys: Key[]): [Child, number] {
  let x = 0
  let y = 0
  const out = keys.map((k) => {
    const w = 15 + textWidth(k.label, 12)
    if (x && x + w > ctx.width) {
      x = 0
      y += 18
    }
    const at = x
    x += w + 16
    return [
      el('rect', { x: at, y: y + 2, width: 10, height: 10, rx: 2, fill: k.hatched ? hatch(ctx, k.t) : ctx.c(k.t), stroke: k.hatched ? ctx.c(k.t) : undefined }),
      text(at + 15, y + 11, k.label, { 'font-size': 12, fill: ctx.c('ink2') }),
    ]
  })
  return [keys.length ? out : null, keys.length ? y + 26 : 0]
}
