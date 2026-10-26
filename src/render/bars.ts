import { frame, hit, text, type Ctx, type Token } from '../context.ts'
import { num } from '../route.ts'
import { linear } from '../scale.ts'
import { box, el, RIGHT, textWidth, type Markup } from '../svg.ts'

interface Item {
  label: string
  value: number
  muted: boolean
}

export function bars(ctx: Ctx): Markup {
  const { ds, width: W, fmt, msg } = ctx
  const mm = ds.measures[0]!
  const unit = mm.unit
  const dk = ds.dimension.key
  const all: Item[] = ds.rows.map((r, i) => ({ label: String(r[dk] ?? ''), value: num(r[mm.key]), muted: !!ds.muted?.includes(i) }))
  const sorted = ds.keepOrder ? all : all.slice().sort((a, b) => b.value - a.value)
  const items =
    sorted.length > 8
      ? sorted.slice(0, 8).concat({ label: msg.others(sorted.length - 8), value: sorted.slice(8).reduce((s, it) => s + it.value, 0), muted: true })
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
  const x = linear([0, xMax], [m.l, W - m.r])
  const color = (it: Item): Token => (it.muted ? 'quiet' : ref?.alertAbove && it.value > ref.value ? 's2' : 's1')

  return frame(
    ctx,
    H,
    el('line', { x1: m.l, x2: m.l, y1: m.t - 4, y2: H - m.b, stroke: ctx.c('base') }),
    items.map((it, i) => {
      const top = m.t + i * rowH
      const by = narrow ? top + 22 : top + (rowH - barH) / 2
      const value = values[i]!
      return [
        el('path', { d: box(m.l, by, x(it.value) - m.l, barH, 4, RIGHT), fill: ctx.c(color(it)) }),
        narrow
          ? el('text', { x: 0, y: top + 15, 'font-size': 12.5, fill: ctx.c('ink') }, it.label, el('tspan', { dx: 8, fill: ctx.c('ink2') }, value))
          : [
              text(ctx, m.l - 10, by + barH / 2 + 4, it.label, { 'text-anchor': 'end', 'font-size': 12.5, fill: ctx.c('ink') }),
              text(ctx, x(it.value) + 8, by + barH / 2 + 4, value, { 'font-size': 12, fill: ctx.c('ink2') }),
            ],
        hit(0, top, W, rowH, i, `${it.label}\n${value}`),
      ]
    }),
    ref &&
      [
        el('line', { x1: x(ref.value), x2: x(ref.value), y1: m.t - 8, y2: H - m.b, stroke: ctx.c('ink2'), 'stroke-width': 1.5 }),
        text(ctx, x(ref.value), m.t - 12, ref.label, { 'text-anchor': x(ref.value) > W - 90 ? 'end' : 'middle', fill: ctx.c('ink2') }),
      ],
  )
}
