import type { Dataset, ReasonCode } from '../src/types.ts'

const month = { key: 'month', label: 'Month', kind: 'time' } as const
const team = { key: 'team', label: 'Team', kind: 'category' } as const
const money = (key: string, label: string, nature: 'flow' | 'level' | 'signed' = 'flow') => ({ key, label, unit: 'currency', nature }) as const
const months = (values: (number | null)[], key = 'v') => values.map((v, i) => ({ month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i]!, [key]: v }))
const teams = (values: number[]) => values.map((v, i) => ({ team: ['Engineering', 'Sales', 'Marketing', 'Support', 'Finance', 'People', 'Legal', 'Design', 'Data', 'Security'][i]!, v }))

export const examples: Record<Exclude<ReasonCode, 'fallback'>, Dataset> = {
  'volume-trend': { title: 'Revenue grew 26% in the first half', dimension: month, measures: [money('v', 'Revenue')], rows: months([41200, 39800, 45100, 47300, 46900, 51800]) },
  'level-trend': { title: 'Cash fell for five months, then recovered', dimension: month, measures: [money('v', 'Balance', 'level')], rows: months([182000, 168500, 151200, 142800, 139300, 151900, 166200]) },
  'signed-mixed': { title: 'Two months closed at a loss', dimension: month, measures: [money('v', 'Net result', 'signed')], rows: months([8200, -3100, 12400, -1800, 4500, 6900]) },
  'category-rank': { title: 'Engineering spends the most', dimension: team, measures: [money('v', 'Spent')], rows: teams([92000, 61000, 38000, 24000, 12000, 9000]) },
  'category-top': { title: 'Three teams take most of the budget', dimension: team, measures: [money('v', 'Spent')], rows: teams([92000, 61000, 38000, 24000, 12000, 9000, 7000, 5000, 4000, 2500]) },
  'flow-stages': {
    title: 'Of every $100 in, $15 is profit',
    dimension: { key: 'line', label: 'Line', kind: 'stage' },
    measures: [money('v', 'Amount')],
    rows: [{ line: 'Revenue', v: 1200000 }, { line: 'Taxes', v: -144000 }, { line: 'Costs', v: -480000 }, { line: 'Expenses', v: -390000 }, { line: 'Profit', v: 186000 }],
  },
  'share-few': {
    title: 'Subscriptions bring most of the revenue',
    dimension: { key: 'line', label: 'Product line', kind: 'category' },
    measures: [{ key: 'v', label: 'Share of revenue', unit: 'percent' }],
    rows: [{ line: 'Subscriptions', v: 58 }, { line: 'Services', v: 31 }, { line: 'Hardware', v: 11 }],
    partOfWhole: true,
  },
  'share-many': {
    title: 'Direct sales lead, partners follow',
    dimension: { key: 'channel', label: 'Channel', kind: 'category' },
    measures: [{ key: 'v', label: 'Share of revenue', unit: 'percent' }],
    rows: [{ channel: 'Direct', v: 34 }, { channel: 'Partners', v: 21 }, { channel: 'Marketplace', v: 16 }, { channel: 'Inside sales', v: 12 }, { channel: 'Referral', v: 17 }],
    partOfWhole: true,
  },
  'single-row': { title: 'Cash today', dimension: month, measures: [money('cash', 'Cash', 'level'), money('burn', 'Monthly burn')], rows: [{ month: 'Oct', cash: 52340, burn: 18200 }] },
  'record-list': {
    title: 'Five invoices are overdue',
    dimension: { key: 'invoice', label: 'Invoice', kind: 'record' },
    measures: [{ key: 'client', label: 'Client', unit: 'text' }, money('v', 'Amount')],
    rows: [{ invoice: 'INV-1042', client: 'Acme', v: 4200 }, { invoice: 'INV-1057', client: 'Globex', v: 1850 }, { invoice: 'INV-1063', client: 'Initech', v: 9600 }],
  },
  'mixed-units': {
    title: 'Revenue and headcount grew together',
    dimension: month,
    measures: [money('r', 'Revenue'), { key: 'h', label: 'Headcount', unit: 'count', nature: 'level' }],
    rows: [{ month: 'Jan', r: 41200, h: 18 }, { month: 'Feb', r: 39800, h: 18 }, { month: 'Mar', r: 45100, h: 19 }],
  },
  'too-many-series': {
    title: 'Every region grew',
    dimension: month,
    measures: ['North', 'South', 'East', 'West'].map((r) => money(r, r)),
    rows: [{ month: 'Jan', North: 10, South: 12, East: 9, West: 11 }, { month: 'Feb', North: 11, South: 13, East: 10, West: 12 }, { month: 'Mar', North: 12, South: 13, East: 11, West: 14 }],
  },
  'too-few-periods': { title: 'October sold more than September', dimension: month, measures: [money('v', 'Sales')], rows: months([84200, 91700]) },
  'negative-series': {
    title: 'Both units lost money in February',
    dimension: month,
    measures: [money('a', 'Unit A', 'signed'), money('b', 'Unit B', 'signed')],
    rows: [{ month: 'Jan', a: 1200, b: 800 }, { month: 'Feb', a: -400, b: -900 }, { month: 'Mar', a: 1500, b: 300 }],
  },
  'category-multi': {
    title: 'Budget and actual by team',
    dimension: team,
    measures: [money('b', 'Budget'), money('a', 'Actual')],
    rows: [{ team: 'Engineering', b: 90000, a: 92000 }, { team: 'Sales', b: 65000, a: 61000 }, { team: 'Marketing', b: 35000, a: 38000 }],
  },
  'category-negative': { title: 'Sales and Support came in under budget', dimension: team, measures: [money('v', 'Variance', 'signed')], rows: teams([12000, -8000, 4500, -2100, 900]) },
  'category-flat': { title: 'Three offices cost the same', dimension: { key: 'team', label: 'Office', kind: 'category' }, measures: [money('v', 'Rent')], rows: [{ team: 'North', v: 10200 }, { team: 'South', v: 10050 }, { team: 'East', v: 10120 }] },
  'not-a-whole': {
    title: 'Customers use several channels',
    dimension: { key: 'channel', label: 'Channel', kind: 'category' },
    measures: [{ key: 'v', label: 'Customers using it', unit: 'percent' }],
    rows: [{ channel: 'Email', v: 72 }, { channel: 'Chat', v: 54 }, { channel: 'Phone', v: 31 }],
    partOfWhole: true,
  },
  'missing-values': { title: 'Spending by team, Marketing not reported', dimension: team, measures: [money('v', 'Spent')], rows: [{ team: 'Engineering', v: 92000 }, { team: 'Sales', v: 61000 }, { team: 'Marketing', v: null }] },
  empty: { title: 'No sales yet', dimension: month, measures: [money('v', 'Sales')], rows: months([null, null, null]) },
}
