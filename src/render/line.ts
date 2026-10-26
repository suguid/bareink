import { axisRoom, frame, hit, labelEvery, SERIES, text, yAxis, xLabel, type Ctx } from '../context.ts'
import { num } from '../route.ts'
import { linear, nice, point } from '../scale.ts'
import { el, polyline, textWidth, type Markup } from '../svg.ts'

export function lineDomain(values: number[]): { domain: [number, number]; fromZero: boolean } {
  const max = Math.max(...values)
  const min = Math.min(...values)
  if (min <= 0 || (max - min) / max <= 0.1) return { domain: nice(Math.min(0, min), max, 4), fromZero: true }
  const pad = (max - min) * 0.25
  return { domain: nice(min - pad, max + pad, 4), fromZero: false }
}

export function line(ctx: Ctx): Markup {
  const { ds, width: W, fmt } = ctx
  const ms = ds.measures
  const rows = ds.rows
  const dk = ds.dimension.key
  const unit = ms[0]!.unit
  const H = 230
  const last = rows[rows.length - 1]!
  const narrow = W < 520
  const endText = (k: number) => (narrow && ms.length === 1 ? '' : ms[k]!.label + ' ') + fmt.value(unit, num(last[ms[k]!.key]))
  const { domain, fromZero } = lineDomain(rows.flatMap((r) => ms.map((mm) => num(r[mm.key]))))
  const tick = (v: number) => fmt.tick(unit, v)
  const probe = linear(domain, [0, 1])
  const m = { t: 16, r: Math.min(W * 0.3, 16 + Math.max(...ms.map((_, k) => textWidth(endText(k), 12)))), b: 28, l: axisRoom(probe, tick) }
  const y = linear(domain, [H - m.b, m.t])
  const x = point(rows.length, [m.l, W - m.r])
  const ff = ds.forecastFrom
  const every = labelEvery(rows.map((r) => String(r[dk] ?? '')), x.step)
  const path = (key: string, from: number, to: number) =>
    polyline(rows.slice(from, to).map((r, i) => [x(from + i), y(num(r[key]))]))

  const ends = ms.map((mm) => y(num(last[mm.key])))
  for (let a = 0; a < ends.length; a++)
    for (let b = a + 1; b < ends.length; b++)
      if (Math.abs(ends[a]! - ends[b]!) < 16) {
        const mid = (ends[a]! + ends[b]!) / 2
        const up = ends[a]! <= ends[b]!
        ends[a] = mid + (up ? -8 : 8)
        ends[b] = mid + (up ? 8 : -8)
      }

  if (!fromZero) ctx.notes.push(ctx.msg.axisOffset(tick(domain[0])))

  return frame(
    ctx,
    H,
    yAxis(ctx, y, m.l, W - m.r, tick, domain[0]),
    rows.map((r, i) => i % every === 0 && xLabel(ctx, x(i), H - 8, String(r[dk] ?? ''))),
    ms.map((mm, j) => {
      const t = SERIES[j]!
      const lx = x(rows.length - 1)
      return [
        el('path', {
          d: path(mm.key, 0, ff != null ? ff + 1 : rows.length),
          fill: 'none',
          stroke: ctx.c(t),
          'stroke-width': 2,
          'stroke-linejoin': 'round',
          'stroke-linecap': 'round',
        }),
        ff != null && el('path', { d: path(mm.key, ff, rows.length), fill: 'none', stroke: ctx.c(t), 'stroke-width': 2, 'stroke-dasharray': '4 4' }),
        el('circle', { cx: lx, cy: y(num(last[mm.key])), r: 4, fill: ctx.c(t), stroke: ctx.c('surface'), 'stroke-width': 2 }),
        text(ctx, lx + 9, ends[j]! + 4, endText(j), { fill: ctx.c('ink'), 'font-size': 12, 'font-weight': 600 }),
      ]
    }),
    rows.map((r, i) =>
      hit(
        x(i) - (x.step || 40) / 2,
        m.t,
        x.step || 40,
        H - m.b - m.t,
        i,
        [String(r[dk] ?? '')].concat(ms.map((mm) => `${mm.label}: ${fmt.value(unit, num(r[mm.key]))}`)).join('\n'),
      ),
    ),
  )
}
