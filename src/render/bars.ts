import { frame, hit, text, lab, type Ctx, type Token } from '../context.ts'
import { num } from '../route.ts'
import { linear } from '../scale.ts'
import { box, el, RIGHT, fit, textWidth, type Markup } from '../svg.ts'

interface Item {
  label: string
  value: number
  muted: boolean
  i: number
}

export function bars(ctx: Ctx): Markup {
  const { ds, width: W, fmt, msg } = ctx
  const mm = ds.measures[0]!
  const unit = mm.unit
  const all: Item[] = ds.rows.map((r, i) => ({ label: lab(ctx, r), value: num(r[mm.key]), muted: !!ds.muted?.includes(i), i }))
  const sorted = ds.keepOrder ? all : all.slice().sort((a, b) => b.value - a.value)
  const items =
    sorted.length > 8
      ? sorted.slice(0, 8).concat({ label: msg.others(sorted.length - 8), value: sorted.slice(8).reduce((s, it) => s + it.value, 0), muted: true, i: -1 })
      : sorted
  const ref = ds.reference
  const narrow = W < 520
  const rowH = narrow ? 46 : 36
  const barH = narrow ? 12 : 16
  const values = items.map((it) => fmt.value(unit, it.value))
  const m = {
    t: ref ? 26 : 6,
    r: narrow ? 8 : Math.max(...values.map((v) => textWidth(v, 12))) + 14,
    b: 6,
    l: narrow ? 0 : Math.min(W * 0.36, Math.max(...items.map((it) => textWidth(it.label, 12.5))) + 14),
  }
  const H = m.t + m.b + rowH * items.length
  const xMax = Math.max(0, ...items.map((it) => it.value), ref?.value ?? 0) || 1
  const x = linear([Math.min(0, ref?.value ?? 0), xMax], [m.l, W - m.r])
  const x0 = x(0)
  const color = (it: Item): Token => (it.muted ? 'quiet' : ref?.alertAbove && it.value > ref.value ? 's2' : 's1')

  return frame(
    ctx,
    H,
    el('line', { x1: x0, x2: x0, y1: m.t - 4, y2: H - m.b, stroke: ctx.c('base') }),
    items.map((it, i) => {
      const top = m.t + i * rowH
      const by = narrow ? top + 22 : top + (rowH - barH) / 2
      const value = values[i]!
      return [
        el('path', { d: box(x0, by, x(it.value) - x0, barH, 4, RIGHT), fill: ctx.c(color(it)) }),
        narrow
          ? el('text', { x: 0, y: top + 15, 'font-size': 12.5, fill: ctx.c('ink') }, fit(it.label, W - textWidth(value, 12.5) - 10, 12.5), el('tspan', { dx: 8, fill: ctx.c('ink2') }, value))
          : [
              text(m.l - 10, by + barH / 2 + 4, fit(it.label, m.l - 12, 12.5), { 'text-anchor': 'end', 'font-size': 12.5, fill: ctx.c('ink') }),
              text(x(it.value) + 8, by + barH / 2 + 4, value, { 'font-size': 12, fill: ctx.c('ink2') }),
            ],
        hit(0, top, W, rowH, it.i, `${it.label}\n${value}`),
      ]
    }),
    ref && [
      el('line', { x1: x(ref.value), x2: x(ref.value), y1: m.t - 8, y2: H - m.b, stroke: ctx.c('ink2'), 'stroke-width': 1.5 }),
      text(x(ref.value), m.t - 12, ref.label, { 'text-anchor': x(ref.value) > W - 90 ? 'end' : 'middle', fill: ctx.c('ink2') }),
    ],
  )
}
