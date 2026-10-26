import { axisRoom, frame, hit, mark, yAxis, lab, type Ctx, type Token } from '../context.ts'
import { num } from '../route.ts'
import { band, linear, nice } from '../scale.ts'
import { box, el, TOP, type Markup } from '../svg.ts'

export function waterfall(ctx: Ctx): Markup {
  const { ds, width: W, fmt } = ctx
  const mm = ds.measures[0]!
  const unit = mm.unit
  const rows = ds.rows
  const totals = ds.totalRows ?? [0, rows.length - 1]
  const narrow = W < 520
  const H = 260

  let level = 0
  const steps = rows.map((r, i) => {
    const v = num(r[mm.key])
    const isTotal = totals.includes(i)
    const from = isTotal ? 0 : level
    level = isTotal ? v : level + v
    const color: Token = isTotal ? 's1' : v < 0 ? 's2' : 's3'
    return { label: lab(ctx, r), v, isTotal, lo: Math.min(from, level), hi: Math.max(from, level), level, color }
  })
  const tick = (v: number) => fmt.tick(unit, v)
  const probe = linear(nice(Math.min(0, ...steps.map((s) => s.lo)), Math.max(0, ...steps.map((s) => s.hi)), 4), [0, 1])
  const m = { t: 24, r: 8, b: narrow ? 40 : 30, l: axisRoom(probe, tick) }
  const y = linear(probe.domain, [H - m.b, m.t])
  const x = band(rows.length, [m.l, W - m.r], 0.42, 0.2)
  const words = (s: string): string[] => {
    const parts = s.split(' ')
    if (!narrow || parts.length < 2) return [s]
    const half = Math.ceil(parts.length / 2)
    return [parts.slice(0, half).join(' '), parts.slice(half).join(' ')]
  }

  return frame(
    ctx,
    H,
    yAxis(ctx, y, m.l, W - m.r, tick, 0),
    steps.map((s, i) => {
      const bx = x(i)
      const bw = x.bandwidth
      const top = y(s.hi)
      const h = y(s.lo) - top
      const value = s.isTotal ? fmt.value(unit, s.v) : fmt.signed(unit, s.v)
      const next = steps[i + 1]
      return [
        el('path', { d: s.isTotal ? box(bx, top, bw, h, 4, TOP) : box(bx, top, bw, Math.max(h, 1)), fill: ctx.c(s.color) }),
        next && el('line', { x1: bx + bw, x2: x(i + 1), y1: y(s.level), y2: y(s.level), stroke: ctx.c('base') }),
        mark(ctx, bx + bw / 2, top - 7, value),
        el(
          'text',
          { x: bx + bw / 2, y: H - m.b + 16, 'font-size': 11.5, fill: ctx.c('ink2'), 'text-anchor': 'middle' },
          words(s.label).map((w, k) => el('tspan', { x: bx + bw / 2, dy: k ? 13 : 0 }, w)),
        ),
        hit(bx - (x.step - bw) / 2, m.t, x.step, H - m.b - m.t, i, `${s.label}\n${value}`),
      ]
    }),
  )
}
