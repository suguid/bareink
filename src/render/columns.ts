import { axisRoom, forecastBand, frame, hatch, hatches, hit, labelEvery, legend, mark, refLine, SERIES, show, xLabel, yAxis, lab, type Ctx, type Key, type Token } from '../context.ts'
import { isNum, num } from '../route.ts'
import { band, linear, nice } from '../scale.ts'
import { BOTTOM, box, el, TOP, textWidth, type Markup } from '../svg.ts'
import type { Measure, Row } from '../types.ts'

export function columns(ctx: Ctx, signed = false): Markup {
  const { ds, width: W, fmt, msg } = ctx
  const ms = ds.measures
  const rows = ds.rows
  const unit = ms[0]!.unit
  const keys: Key[] = signed || ms.length < 2 ? [] : ms.map((mm, j) => ({ label: mm.label, t: SERIES[j]! }))
  const opened = (r: Row, m: Measure) => (m.openKey && !signed ? Math.max(0, num(r[m.openKey])) : 0)
  if (rows.some((r) => ms.some((mm) => opened(r, mm)))) keys.push({ label: msg.open, t: 's1', hatched: true })
  const [key, kh] = legend(ctx, keys)
  const H = (signed ? 230 : 250) + kh
  const total = (r: Row, m: Measure) => num(r[m.key]) + opened(r, m)
  const rv = ds.reference?.value ?? 0
  const tops = rows.flatMap((r) => ms.map((m) => total(r, m)))
  const ext = Math.max(0, ...tops.map(Math.abs), Math.abs(rv))
  const tick = (v: number) => (signed && v ? fmt.signed(unit, v) : fmt.tick(unit, v))
  const probe = linear(signed ? nice(-ext, ext, 4) : nice(Math.min(0, rv), Math.max(0, rv, ...tops), 4), [0, 1])
  const ff = ctx.ff
  const lift = ff != null ? 14 : 0
  const m = { t: (signed ? 24 : 22) + kh + lift, r: 8, b: 28, l: axisRoom(probe, tick) }
  const y = linear(probe.domain, [H - m.b, m.t])
  const x = band(rows.length, [m.l, W - m.r], signed ? 0.38 : 0.28, signed ? 0.2 : 0.14)
  const inner = band(ms.length, [0, x.bandwidth], ms.length > 1 ? 0.08 : 0, 0)
  const gap = (x.step - x.bandwidth) / 2
  const every = labelEvery(
    rows.map((r) => lab(ctx, r)),
    x.step,
  )
  const y0 = y(0)
  let edge = 0
  const spot = (cx: number, cy: number, s: string) => {
    const half = textWidth(s, 12) / 2
    if (cx - half < edge) return
    edge = cx + half + 4
    return mark(ctx, cx, cy, s, m.l)
  }

  return frame(
    ctx,
    H,
    hatches(ctx, signed ? ['s1', 's2'] : SERIES.slice(0, ms.length)),
    key,
    ff != null && forecastBand(ctx, x(ff) - gap, m.t - lift, W - m.r - x(ff) + gap, H - m.b - m.t + lift),
    yAxis(ctx, y, m.l, W - m.r, tick, 0),
    rows.map((r, i) => {
      const isFc = ff != null && i >= ff
      const cx = x(i) + x.bandwidth / 2
      const label = lab(ctx, r)
      const tip = [label + (isFc ? ` (${msg.forecast})` : '')]
        .concat(
          ms.map(
            (mm) =>
              `${mm.label}: ${show(ctx, unit, isNum(r[mm.key]) ? total(r, mm) : null, signed)}` + (opened(r, mm) ? ` (${fmt.value(unit, opened(r, mm))} ${msg.open})` : ''),
          ),
        )
        .join('\n')
      const top = total(r, ms[0]!)
      return [
        ms.map((mm, j) => {
          const v = num(r[mm.key])
          const t: Token = signed ? (v < 0 ? 's2' : 's1') : SERIES[j]!
          const bx = x(i) + inner(j)
          const bw = inner.bandwidth
          const base = signed ? v : Math.max(0, v)
          const open = opened(r, mm)
          const yBase = y(base)
          const yTop = y(base + open)
          const h = Math.max(Math.abs(yBase - y0), signed ? 1 : 0)
          return [
            isNum(r[mm.key]) &&
              (signed || base > 0) &&
              el('path', {
                d: v < 0 ? box(bx, y0, bw, h, 4, BOTTOM) : box(bx, y0 - h, bw, h, 4, open ? 0 : TOP),
                fill: isFc ? hatch(ctx, t) : ctx.c(t),
                stroke: isFc ? ctx.c(t) : undefined,
              }),
            open > 0 && el('path', { d: box(bx, yTop, bw, yBase - yTop - (base > 0 ? 2 : 0), 4, TOP), fill: hatch(ctx, t), stroke: ctx.c(t) }),
          ]
        }),
        i % every === 0 && xLabel(ctx, cx, H - 8, label, x.step * every - 4),
        ds.highlight?.includes(i) && ms.length === 1 && isNum(r[ms[0]!.key]) && spot(cx, top < 0 ? y(top) + 15 : y(top) - 7, show(ctx, unit, top, signed)),
        hit(x(i) - gap, m.t, x.step, H - m.b - m.t, i, tip),
      ]
    }),
    ds.reference && refLine(ctx, m.l, W - m.r, y(rv), ds.reference.label),
  )
}
