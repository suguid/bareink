import type { Dataset } from '../src/types.ts'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const cashflow: Dataset = {
  title: 'Inflows and outflows move together, near $40k a month',
  dimension: { key: 'month', label: 'Month', kind: 'time' },
  measures: [
    { key: 'in', label: 'Inflows', unit: 'currency', nature: 'flow', openKey: 'inOpen' },
    { key: 'out', label: 'Outflows', unit: 'currency', nature: 'flow', openKey: 'outOpen' },
  ],
  rows: [
    [38900, 39000],
    [40540, 39850],
    [43540, 39790],
    [41390, 39800],
    [38880, 43640],
    [49360, 45340],
    [14690, 35810, 33490, 5550],
    [41950, 40850],
    [41490, 40850],
  ].map(([i, o, io, oo], k) => ({ month: months[k + 3], in: i, out: o, inOpen: io, outOpen: oo })),
  forecastFrom: 7,
}

export const result: Dataset = {
  title: 'March carried the year',
  dimension: { key: 'month', label: 'Month', kind: 'time' },
  measures: [{ key: 'net', label: 'Net result', unit: 'currency', nature: 'signed' }],
  rows: [-3860, -5820, 14130, -90, 690, 3750, 1590, -4760, 4020, 1100, 640].map((net, k) => ({ month: months[k], net })),
  forecastFrom: 9,
  highlight: [1, 2, 7],
}

export const expenses: Dataset = {
  title: 'Three categories take 71% of outflows',
  dimension: { key: 'category', label: 'Category', kind: 'category' },
  measures: [{ key: 'paid', label: 'Paid', unit: 'currency', nature: 'flow' }],
  rows: [
    { category: 'Operations staff', paid: 108420 },
    { category: 'Partners', paid: 89250 },
    { category: 'Software', paid: 64980 },
    { category: 'Loan amortization', paid: 46450 },
    { category: 'Taxes', paid: 35980 },
    { category: '14 other categories', paid: 22080 },
  ],
  muted: [3, 5],
  keepOrder: true,
}

export const ticket: Dataset = {
  title: 'Average ticket rose 16% in six months',
  dimension: { key: 'month', label: 'Month', kind: 'time' },
  measures: [{ key: 'ticket', label: 'Ticket', unit: 'currency', nature: 'level' }],
  rows: [9595, 10310, 10060, 10465, 10503, 11096].map((ticket, k) => ({ month: months[k], ticket })),
}

export const pnl: Dataset = {
  title: 'Of every $100 in, $10 is operating result',
  intent: 'flow',
  dimension: { key: 'stage', label: 'Stage', kind: 'stage' },
  measures: [{ key: 'v', label: 'Value', unit: 'currency', nature: 'flow' }],
  rows: [
    { stage: 'Net revenue', v: 2020720 },
    { stage: 'Costs', v: -499290 },
    { stage: 'Expenses', v: -1316930 },
    { stage: 'Operating result', v: 204500 },
  ],
}

export const people: Dataset = {
  title: 'People take 29% of revenue, 43% with owners',
  partOfWhole: true,
  dimension: { key: 'part', label: 'Part', kind: 'category' },
  measures: [{ key: 'pct', label: '% of revenue', unit: 'percent', nature: 'flow' }],
  rows: [
    { part: 'Staff', pct: 28.9 },
    { part: 'Owners', pct: 14 },
    { part: 'Contractors', pct: 8.1 },
  ],
  uncertain: [2],
  markCumulative: true,
}

export const runway: Dataset = {
  title: 'Cash covers one month',
  dimension: { key: 'date', label: 'Date', kind: 'time' },
  measures: [
    { key: 'cash', label: 'Cash', unit: 'currency', nature: 'level' },
    { key: 'surplus', label: 'Monthly surplus', unit: 'currency', nature: 'flow' },
  ],
  rows: [{ date: 'Oct 22', cash: 41400, surplus: 5600 }],
}
