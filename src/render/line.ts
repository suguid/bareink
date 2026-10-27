import { axisRoom, frame, hit, labelEvery, lab, refLine, SERIES, show, text, xLabel, yAxis, type Ctx } from '../context.ts'
import { isNum } from '../route.ts'
import { linear, nice, point } from '../scale.ts'
import { el, fit, p, textWidth, type Markup } from '../svg.ts'

export function lineDomain(values: number[]): { domain: [number, number]; fromZero: boolean } {
  const max = Math.max(...values)
  const min = Math.min(...values)
  if ((min <= 0 && max >= 0) || (max - min) / Math.max(Math.abs(min), Math.abs(max)) <= 0.1)
    return { domain: nice(Math.min(0, min), Math.max(0, max), 4), fromZero: true }
  const pad = (max - min) * 0.25
  return { domain: nice(min - pad, max + pad, 4), fromZero: false }
}

export function line(ctx: Ctx): Markup {
  const { ds, width: W, fmt } = ctx
  const ms = ds.measures
  const rows = ds.rows
  const unit = ms[0]!.unit
  const ref = ds.reference
  const H = 230
  const narrow = W < 520
  const lastAt = ms.map((mm) => {
    let i = rows.length - 1
    while (i >= 0 && !isNum(rows[i]![mm.key])) i--
    return i
  })
  const endText = (k: number) => (narrow && ms.length === 1 ? '' : ms[k]!.label + ' ') + show(ctx, unit, rows[lastAt[k]!]?.[ms[k]!.key])
  const { domain, fromZero } = lineDomain(rows.flatMap((r) => ms.map((mm) => r[mm.key]).filter(isNum)).concat(ref ? [ref.value] : []))
  const tick = (v: number) => fmt.tick(unit, v)
  const probe = linear(domain, [0, 1])
  const m = { t: 16, r: Math.min(W * 0.3, 16 + Math.max(...ms.map((_, k) => textWidth(endText(k), 13)))), b: 28, l: axisRoom(probe, tick) }
  const y = linear(domain, [H - m.b, m.t])
  const x = point(rows.length, [m.l, W - m.r])
  const ff = ctx.ff
  const every = labelEvery(
    rows.map((r) => lab(ctx, r)),
    x.step,
  )
  const path = (key: string, from: number, to: number) => {
    let d = ''
    let pen = 'M'
    for (let i = from; i < to; i++) {
      const v = rows[i]![key]
      if (!isNum(v)) pen = 'M'
      else {
        d += pen + p(x(i)) + ',' + p(y(v))
        pen = 'L'
      }
    }
    return d
  }

  const ends = ms.map((mm, k) => y(Number(rows[lastAt[k]!]?.[mm.key])))
  const order = ends.map((_, k) => k).sort((a, b) => ends[a]! - ends[b]!)
  for (let k = 1; k < order.length; k++) ends[order[k]!] = Math.max(ends[order[k]!]!, ends[order[k - 1]!]! + 16)

  if (!fromZero) ctx.notes.push(ctx.msg.axisOffset(tick(domain[0])))

  return frame(
    ctx,
    H,
    yAxis(ctx, y, m.l, W - m.r, tick, domain[0]),
    rows.map((r, i) => i % every === 0 && xLabel(ctx, x(i), H - 8, lab(ctx, r), (x.step || W) * every - 4)),
    ref && refLine(ctx, m.l, W - m.r, y(ref.value), ref.label),
    ms.map((mm, j) => {
      const t = SERIES[j]!
      const at = lastAt[j]!
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
        at >= 0 && [
          el('circle', { cx: x(at), cy: y(Number(rows[at]![mm.key])), r: 4, fill: ctx.c(t), stroke: ctx.c('surface'), 'stroke-width': 2 }),
          text(x(at) + 9, ends[j]! + 4, fit(endText(j), W - x(at) - 9, 13), { fill: ctx.c('ink'), 'font-size': 12, 'font-weight': 600 }),
        ],
      ]
    }),
    rows.map((r, i) =>
      hit(
        x(i) - (x.step || 40) / 2,
        m.t,
        x.step || 40,
        H - m.b - m.t,
        i,
        [lab(ctx, r)].concat(ms.map((mm) => `${mm.label}: ${show(ctx, unit, r[mm.key])}`)).join('\n'),
      ),
    ),
  )
}
