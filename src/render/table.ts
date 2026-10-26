import { lab, show, type Ctx } from '../context.ts'
import { isNum, num } from '../route.ts'
import { el, type Markup } from '../svg.ts'
import type { Measure, Row } from '../types.ts'

const cell = (ctx: Ctx, r: Row, m: Measure): string => {
  const v = r[m.key]
  if (m.unit === 'text' || typeof v === 'string') return String(v ?? '')
  return show(ctx, m.unit, isNum(v) ? v + (m.openKey ? Math.max(0, num(r[m.openKey])) : 0) : null, m.nature === 'signed')
}

export function table(ctx: Ctx): Markup {
  const { ds, msg } = ctx
  const pad = 'padding:5px 8px;border-bottom:1px solid ' + ctx.c('grid') + ';text-align:'
  const th = (s: string, left?: 1) => el('th', { scope: 'col', style: pad + (left ? 'left' : 'right') + ';color:' + ctx.c('muted') }, s)
  return el(
    'div',
    { class: 'bareink-table', style: 'overflow-x:auto' },
    el(
      'table',
      { style: 'border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums;color:' + ctx.c('ink') },
      el('caption', { style: 'text-align:left;font-weight:600' }, ds.title),
      el(
        'thead',
        {},
        el(
          'tr',
          {},
          th(ds.dimension.label, 1),
          ds.measures.map((m) => th(m.label)),
        ),
      ),
      el(
        'tbody',
        {},
        ds.rows.map((r, i) =>
          el(
            'tr',
            {},
            el(
              'th',
              { scope: 'row', style: pad + 'left;font-weight:400' },
              lab(ctx, r) + (ctx.ff != null && i >= ctx.ff ? ` (${msg.forecast})` : ''),
            ),
            ds.measures.map((m) => el('td', { style: pad + 'right' }, cell(ctx, r, m))),
          ),
        ),
      ),
    ),
  )
}

export function kpi(ctx: Ctx): Markup {
  const { ds } = ctx
  const r = ds.rows[0] ?? {}
  return el(
    'div',
    { class: 'bareink-kpis', role: 'group', 'aria-label': ds.title, style: 'display:flex;flex-wrap:wrap;gap:10px' },
    ds.measures.map((m) =>
      el(
        'div',
        { style: 'flex:1 1 150px;border:1px solid ' + ctx.c('grid') + ';border-radius:8px;padding:12px' },
        el('div', { style: 'font-size:12px;color:' + ctx.c('muted') }, m.label),
        el('div', { style: 'font-size:26px;font-weight:650;color:' + ctx.c('ink') }, cell(ctx, r, m)),
      ),
    ),
  )
}
