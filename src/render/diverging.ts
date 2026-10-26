import { axisRoom, forecastBand, frame, hatch, hatches, hit, labelEvery, text, yAxis, type Ctx } from '../context.ts'
import { num } from '../route.ts'
import { band, linear, nice } from '../scale.ts'
import { bottomRounded, el, topRounded, type Markup } from '../svg.ts'

export function diverging(ctx: Ctx): Markup {
  const { ds, width: W, fmt, msg } = ctx
  const mm = ds.measures[0]!
  const unit = mm.unit
  const rows = ds.rows
  const dk = ds.dimension.key
  const H = 230
  const ext = Math.max(...rows.map((r) => Math.abs(num(r[mm.key]))))
  const tick = (v: number) => (v === 0 ? fmt.tick(unit, 0) : fmt.signed(unit, v))
  const probe = linear(nice(-ext, ext, 4), [0, 1])
  const m = { t: 24, r: 8, b: 28, l: axisRoom(probe, tick) }
  const y = linear(probe.domain, [H - m.b, m.t])
  const x = band(rows.length, [m.l, W - m.r], 0.38, 0.2)
  const gap = (x.step - x.bandwidth) / 2
  const ff = ds.forecastFrom
  const every = labelEvery(rows.map((r) => String(r[dk] ?? '')), x.step)

  return frame(
    ctx,
    H,
    hatches(ctx, ['s1', 's2']),
    ff != null && ff < rows.length && forecastBand(ctx, x(ff) - gap, m.t, W - m.r - x(ff) + gap, H - m.b - m.t),
    yAxis(ctx, y, m.l, W - m.r, tick, 0),
    rows.map((r, i) => {
      const v = num(r[mm.key])
      const neg = v < 0
      const t = neg ? 's2' : 's1'
      const isFc = ff != null && i >= ff
      const bx = x(i)
      const bw = x.bandwidth
      const h = Math.max(Math.abs(y(v) - y(0)), 1)
      const label = String(r[dk] ?? '')
      return el(
        'g',
        {},
        el('path', {
          d: neg ? bottomRounded(bx, y(0), bw, h, 4) : topRounded(bx, y(0) - h, bw, h, 4),
          fill: isFc ? hatch(ctx, t) : ctx.c(t),
          stroke: isFc ? ctx.c(t) : undefined,
        }),
        i % every === 0 && text(ctx, bx + bw / 2, H - 8, label, { 'text-anchor': 'middle', fill: ctx.c('ink2') }),
        ds.highlight?.includes(i) &&
          text(ctx, bx + bw / 2, neg ? y(v) + 15 : y(v) - 7, fmt.signed(unit, v), { 'text-anchor': 'middle', fill: ctx.c('ink'), 'font-size': 11.5, 'font-weight': 600 }),
        hit(bx - gap, m.t, x.step, H - m.b - m.t, i, `${label}${isFc ? ` (${msg.forecast})` : ''}\n${mm.label}: ${fmt.signed(unit, v)}`),
      )
    }),
  )
}
