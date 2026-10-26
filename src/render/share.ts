import { frame, hatch, hatches, hit, legend, SERIES, text, lab, type Ctx, type Token } from '../context.ts'
import { num } from '../route.ts'
import { linear } from '../scale.ts'
import { el, textWidth, type Markup } from '../svg.ts'

export function share(ctx: Ctx): Markup {
  const { ds, width: W, fmt, msg } = ctx
  const mm = ds.measures[0]!
  const bh = 22
  const x = linear([0, 100], [0, W])
  const parts = ds.rows.map((r, i) => ({
    label: lab(ctx, r),
    v: Math.max(0, num(r[mm.key])),
    t: SERIES[i] ?? 's3',
    hatched: !!ds.uncertain?.includes(i),
  }))
  const rest = 100 - parts.reduce((s, p) => s + p.v, 0)
  if (rest > 0.05) parts.push({ label: msg.rest, v: rest, t: 'quiet', hatched: false })
  let sum = 0
  let lastRight = -Infinity
  let lastRow = 0
  const marks = parts.map((p) => {
    sum += p.v
    const label = fmt.value('percent', sum)
    const w = textWidth(label, 12)
    const cx = x(sum)
    const left = cx > W - 40 ? cx - w : cx - w / 2
    const row = ds.markCumulative && p.t !== 'quiet' ? (left < lastRight + 6 && lastRow === 0 ? 1 : 0) : -1
    if (row >= 0) {
      lastRight = left + w
      lastRow = row
    }
    return { label, row }
  })
  const [key, kh] = legend(
    ctx,
    parts.map((p) => ({ label: `${p.label} ${fmt.value('percent', p.v)}`, t: p.t, hatched: p.hatched })),
  )
  const by = kh + (marks.some((mk) => mk.row === 1) ? 44 : 28)
  const H = by + 48
  let acc = 0

  return frame(
    ctx,
    H,
    hatches(ctx, SERIES),
    key,
    parts.map((p, i) => {
      const x0 = x(acc) + (i ? 1 : 0)
      const w = x(p.v) - x(0) - (i ? 2 : 0) - (i < parts.length - 1 ? 1 : 0)
      acc += p.v
      const cum = x(acc)
      const t: Token = p.t
      return [
        el('rect', {
          x: x0,
          y: by,
          width: Math.max(w, 1),
          height: bh,
          rx: 3,
          fill: p.hatched ? hatch(ctx, t) : ctx.c(t),
          stroke: p.hatched ? ctx.c(t) : undefined,
        }),
        marks[i]!.row >= 0 && [
          el('line', { x1: cum, x2: cum, y1: by - 6 - marks[i]!.row * 16, y2: by + bh + 6, stroke: ctx.c('ink2'), 'stroke-width': 1.5 }),
          text(cum, by - 10 - marks[i]!.row * 16, marks[i]!.label, {
            'text-anchor': cum > W - 40 ? 'end' : 'middle',
            fill: ctx.c('ink'),
            'font-size': 12,
            'font-weight': 600,
          }),
        ],
        hit(x0, by - 4, Math.max(w, 8), bh + 8, i, `${p.label}\n${fmt.value('percent', p.v)}`),
      ]
    }),
    text(0, by + bh + 22, fmt.value('percent', 0)),
    text(W, by + bh + 22, fmt.value('percent', 100), { 'text-anchor': 'end' }),
  )
}
