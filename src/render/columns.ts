import { axisRoom, forecastBand, frame, hatch, hatches, hit, labelEvery, SERIES, text, yAxis, type Ctx } from '../context.ts'
import { num } from '../route.ts'
import { band, linear, nice } from '../scale.ts'
import { el, rect, topRounded, type Markup } from '../svg.ts'
import type { Measure, Row } from '../types.ts'

export function columns(ctx: Ctx): Markup {
  const { ds, width: W, fmt, msg } = ctx
  const ms = ds.measures
  const rows = ds.rows
  const dk = ds.dimension.key
  const unit = ms[0]!.unit
  const H = 250
  const total = (r: Row, m: Measure) => num(r[m.key]) + (m.openKey ? num(r[m.openKey]) : 0)
  const yMax = Math.max(0, ...rows.flatMap((r) => ms.map((m) => total(r, m))), ds.reference?.value ?? 0)
  const tick = (v: number) => fmt.tick(unit, v)
  const probe = linear(nice(0, yMax, 4), [0, 1])
  const m = { t: 22, r: 8, b: 28, l: axisRoom(probe, tick) }
  const y = linear(probe.domain, [H - m.b, m.t])
  const x = band(rows.length, [m.l, W - m.r], 0.28, 0.14)
  const inner = band(ms.length, [0, x.bandwidth], ms.length > 1 ? 0.08 : 0, 0)
  const gap = (x.step - x.bandwidth) / 2
  const ff = ds.forecastFrom
  const every = labelEvery(rows.map((r) => String(r[dk] ?? '')), x.step)

  return frame(
    ctx,
    H,
    hatches(ctx, SERIES.slice(0, ms.length)),
    ff != null && ff < rows.length && forecastBand(ctx, x(ff) - gap, m.t, W - m.r - x(ff) + gap, H - m.b - m.t),
    yAxis(ctx, y, m.l, W - m.r, tick, 0),
    rows.map((r, i) => {
      const isFc = ff != null && i >= ff
      const cx = x(i) + x.bandwidth / 2
      const tip = [String(r[dk] ?? '') + (isFc ? ` (${msg.forecast})` : '')]
        .concat(ms.map((mm) => `${mm.label}: ${fmt.value(unit, total(r, mm))}` + (mm.openKey && num(r[mm.openKey]) ? ` (${fmt.value(unit, num(r[mm.openKey]))} ${msg.open})` : '')))
        .join('\n')
      return el(
        'g',
        {},
        ms.map((mm, j) => {
          const t = SERIES[j]!
          const bx = x(i) + inner(j)
          const bw = inner.bandwidth
          const base = Math.max(0, num(r[mm.key]))
          const open = mm.openKey ? Math.max(0, num(r[mm.openKey])) : 0
          const yBase = y(base)
          const yTop = y(base + open)
          return [
            base > 0 &&
              el('path', {
                d: open ? rect(bx, yBase, bw, y(0) - yBase) : topRounded(bx, yBase, bw, y(0) - yBase, 4),
                fill: isFc ? hatch(ctx, t) : ctx.c(t),
                stroke: isFc ? ctx.c(t) : undefined,
              }),
            open > 0 && el('path', { d: topRounded(bx, yTop, bw, yBase - yTop - (base > 0 ? 2 : 0), 4), fill: hatch(ctx, t), stroke: ctx.c(t) }),
          ]
        }),
        i % every === 0 && text(ctx, cx, H - 8, String(r[dk] ?? ''), { 'text-anchor': 'middle', fill: ctx.c('ink2') }),
        ds.highlight?.includes(i) &&
          ms.length === 1 &&
          text(ctx, cx, y(total(r, ms[0]!)) - 7, fmt.value(unit, total(r, ms[0]!)), { 'text-anchor': 'middle', fill: ctx.c('ink'), 'font-size': 11.5, 'font-weight': 600 }),
        hit(x(i) - gap, m.t, x.step, H - m.b - m.t, i, tip),
      )
    }),
    ds.reference &&
      el(
        'g',
        {},
        el('line', { x1: m.l, x2: W - m.r, y1: y(ds.reference.value), y2: y(ds.reference.value), stroke: ctx.c('ink2'), 'stroke-width': 1.5 }),
        text(ctx, W - m.r, y(ds.reference.value) - 6, ds.reference.label, {
          'text-anchor': 'end',
          fill: ctx.c('ink2'),
          stroke: ctx.c('surface'),
          'stroke-width': 4,
          'paint-order': 'stroke',
          'stroke-linejoin': 'round',
        }),
      ),
  )
}
