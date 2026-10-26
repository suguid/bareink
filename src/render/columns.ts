import { axisRoom, forecastBand, frame, hatch, hatches, hit, labelEvery, legend, mark, SERIES, text, xLabel, yAxis, lab, type Ctx, type Key, type Token } from '../context.ts'
import { num } from '../route.ts'
import { band, linear, nice } from '../scale.ts'
import { BOTTOM, box, el, TOP, type Markup } from '../svg.ts'
import type { Measure, Row } from '../types.ts'

export function columns(ctx: Ctx, signed = false): Markup {
  const { ds, width: W, fmt, msg } = ctx
  const ms = ds.measures
  const rows = ds.rows
  const unit = ms[0]!.unit
  const keys: Key[] = signed || ms.length < 2 ? [] : ms.map((mm, j) => ({ label: mm.label, t: SERIES[j]! }))
  if (ms.some((mm) => mm.openKey && rows.some((r) => num(r[mm.openKey!]) > 0))) keys.push({ label: msg.open, t: 's1', hatched: true })
  const [key, kh] = legend(ctx, keys)
  const H = (signed ? 230 : 250) + kh
  const show = signed ? fmt.signed : fmt.value
  const total = (r: Row, m: Measure) => num(r[m.key]) + (m.openKey ? num(r[m.openKey]) : 0)
  const ext = Math.max(0, ...rows.flatMap((r) => ms.map((m) => Math.abs(total(r, m)))), ds.reference?.value ?? 0)
  const tick = (v: number) => (signed && v ? fmt.signed(unit, v) : fmt.tick(unit, v))
  const probe = linear(nice(signed ? -ext : 0, ext, 4), [0, 1])
  const m = { t: (signed ? 24 : 22) + kh, r: 8, b: 28, l: axisRoom(probe, tick) }
  const y = linear(probe.domain, [H - m.b, m.t])
  const x = band(rows.length, [m.l, W - m.r], signed ? 0.38 : 0.28, signed ? 0.2 : 0.14)
  const inner = band(ms.length, [0, x.bandwidth], ms.length > 1 ? 0.08 : 0, 0)
  const gap = (x.step - x.bandwidth) / 2
  const ff = ctx.ff
  const every = labelEvery(
    rows.map((r) => lab(ctx, r)),
    x.step,
  )
  const y0 = y(0)

  return frame(
    ctx,
    H,
    hatches(ctx, signed ? ['s1', 's2'] : SERIES.slice(0, ms.length)),
    key,
    ff != null && forecastBand(ctx, x(ff) - gap, m.t, W - m.r - x(ff) + gap, H - m.b - m.t),
    yAxis(ctx, y, m.l, W - m.r, tick, 0),
    rows.map((r, i) => {
      const isFc = ff != null && i >= ff
      const cx = x(i) + x.bandwidth / 2
      const label = lab(ctx, r)
      const tip = [label + (isFc ? ` (${msg.forecast})` : '')]
        .concat(
          ms.map(
            (mm) =>
              `${mm.label}: ${show(unit, total(r, mm))}` + (mm.openKey && num(r[mm.openKey]) ? ` (${fmt.value(unit, num(r[mm.openKey]))} ${msg.open})` : ''),
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
          const open = mm.openKey ? Math.max(0, num(r[mm.openKey])) : 0
          const yBase = y(base)
          const yTop = y(base + open)
          const h = Math.max(Math.abs(yBase - y0), signed ? 1 : 0)
          return [
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
        ds.highlight?.includes(i) && ms.length === 1 && mark(ctx, cx, top < 0 ? y(top) + 15 : y(top) - 7, show(unit, top)),
        hit(x(i) - gap, m.t, x.step, H - m.b - m.t, i, tip),
      ]
    }),
    ds.reference && [
      el('line', { x1: m.l, x2: W - m.r, y1: y(ds.reference.value), y2: y(ds.reference.value), stroke: ctx.c('ink2'), 'stroke-width': 1.5 }),
      text(W - m.r, y(ds.reference.value) - 6, ds.reference.label, {
        'text-anchor': 'end',
        fill: ctx.c('ink2'),
        stroke: ctx.c('surface'),
        'stroke-width': 4,
        'paint-order': 'stroke',
        'stroke-linejoin': 'round',
      }),
    ],
  )
}
