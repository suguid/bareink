import type { Ctx } from '../context.ts'
import { num } from '../route.ts'
import { el, type Markup } from '../svg.ts'
import type { Measure, Row } from '../types.ts'

const cell = (ctx: Ctx, r: Row, m: Measure): string => {
  const v = r[m.key]
  if (m.unit === 'text' || typeof v === 'string') return String(v ?? '')
  const total = num(v) + (m.openKey ? num(r[m.openKey]) : 0)
  return m.nature === 'signed' ? ctx.fmt.signed(m.unit, total) : ctx.fmt.value(m.unit, total)
}

export function table(ctx: Ctx): Markup {
  const { ds, msg } = ctx
  const dk = ds.dimension.key
  const pad = 'padding:5px 8px;border-bottom:1px solid ' + ctx.c('grid') + ';white-space:nowrap;'
  const th = (s: string, left: boolean) => el('th', { scope: 'col', style: pad + 'text-align:' + (left ? 'left' : 'right') + ';color:' + ctx.c('muted') }, s)
  return el(
    'div',
    { class: 'bareink-table', style: 'overflow-x:auto' },
    el(
      'table',
      { style: 'border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums;color:' + ctx.c('ink') },
      el('caption', { style: 'text-align:left;font-weight:600;padding-bottom:6px' }, ds.title),
      el('thead', {}, el('tr', {}, th(ds.dimension.label, true), ds.measures.map((m) => th(m.label, false)))),
      el(
        'tbody',
        {},
        ds.rows.map((r, i) =>
          el(
            'tr',
            {},
            el('th', { scope: 'row', style: pad + 'text-align:left;font-weight:400' }, String(r[dk] ?? '') + (ds.forecastFrom != null && i >= ds.forecastFrom ? ` (${msg.forecast})` : '')),
            ds.measures.map((m) => el('td', { style: pad + 'text-align:right' }, cell(ctx, r, m))),
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
    { class: 'bareink-kpis', role: 'group', 'aria-label': ds.title, style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px' },
    ds.measures.map((m) =>
      el(
        'div',
        { style: 'border:1px solid ' + ctx.c('grid') + ';border-radius:8px;padding:12px;display:grid;gap:2px' },
        el('span', { style: 'font-size:12px;color:' + ctx.c('muted') }, m.label),
        el('span', { style: 'font-size:26px;font-weight:650;line-height:1.2;color:' + ctx.c('ink') }, cell(ctx, r, m)),
      ),
    ),
  )
}
