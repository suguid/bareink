import type { Form } from '../src/types.ts'

export interface Case {
  id: string
  question: string
  columns: string[]
  rows: (string | number | null)[][]
  accept: Form[]
  note?: string
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const series = (from: number, values: (number | null)[]) => values.map((v, i) => [months[(from + i) % 12]!, v])

export const cases: Case[] = [
  {
    id: 'revenue-monthly',
    question: 'How did our revenue do in the first half of the year?',
    columns: ['month', 'revenue (USD)'],
    rows: series(0, [41200, 39800, 45100, 47300, 46900, 51800]),
    accept: ['columns'],
  },
  {
    id: 'balance-year',
    question: 'Show me how our bank balance moved over the last 12 months (end-of-month balance).',
    columns: ['month', 'balance (USD)'],
    rows: series(0, [182000, 176500, 171200, 169800, 174300, 168900, 160200, 158700, 151300, 149900, 156200, 161800]),
    accept: ['line'],
  },
  {
    id: 'net-result',
    question: 'Did we make or lose money each month this semester?',
    columns: ['month', 'net result (USD)'],
    rows: series(0, [8200, -3100, 12400, -1800, 4500, 6900]),
    accept: ['diverging'],
  },
  {
    id: 'expenses-category',
    question: 'Where did our money go last quarter?',
    columns: ['category', 'spent (USD)'],
    rows: [
      ['Payroll', 96000],
      ['Rent', 18000],
      ['Software', 12400],
      ['Marketing', 22800],
      ['Travel', 5300],
      ['Taxes', 31200],
      ['Utilities', 3900],
      ['Legal', 7600],
    ],
    accept: ['bars'],
  },
  {
    id: 'share-three',
    question: 'What share of revenue comes from each product line?',
    columns: ['product line', 'share of revenue (%)'],
    rows: [
      ['Subscriptions', 58],
      ['Services', 31],
      ['Hardware', 11],
    ],
    accept: ['share'],
  },
  {
    id: 'share-channels',
    question: 'How is revenue split across sales channels?',
    columns: ['channel', 'share of revenue (%)'],
    rows: [
      ['Direct', 34],
      ['Partners', 21],
      ['Marketplace', 16],
      ['Inside sales', 12],
      ['Referral', 9],
      ['Events', 5],
      ['Other', 3],
    ],
    accept: ['bars'],
  },
  {
    id: 'income-statement',
    question: 'Walk me from revenue to profit for last year.',
    columns: ['line', 'amount (USD)'],
    rows: [
      ['Revenue', 1200000],
      ['Taxes on sales', -144000],
      ['Cost of services', -480000],
      ['Operating expenses', -390000],
      ['Profit', 186000],
    ],
    accept: ['waterfall'],
  },
  {
    id: 'cash-now',
    question: 'How much cash do we have right now?',
    columns: ['account', 'cash (USD)'],
    rows: [['All accounts', 52340]],
    accept: ['kpi'],
  },
  {
    id: 'overdue-invoices',
    question: 'Which invoices are overdue?',
    columns: ['invoice', 'client', 'due date', 'amount (USD)'],
    rows: [
      ['INV-1042', 'Acme Corp', '2026-08-12', 4200],
      ['INV-1057', 'Globex', '2026-08-30', 1850],
      ['INV-1063', 'Initech', '2026-09-04', 9600],
      ['INV-1071', 'Umbrella', '2026-09-15', 760],
      ['INV-1088', 'Hooli', '2026-09-28', 3100],
    ],
    accept: ['table'],
  },
  {
    id: 'revenue-and-headcount',
    question: 'Show revenue and headcount by month.',
    columns: ['month', 'revenue (USD)', 'headcount'],
    rows: [
      ['Jan', 41200, 18],
      ['Feb', 39800, 18],
      ['Mar', 45100, 19],
      ['Apr', 47300, 21],
      ['May', 46900, 21],
      ['Jun', 51800, 22],
    ],
    accept: ['table'],
  },
  {
    id: 'in-out',
    question: 'Compare money in and money out over the last six months.',
    columns: ['month', 'inflows (USD)', 'outflows (USD)'],
    rows: [
      ['Apr', 38900, 39000],
      ['May', 40540, 39850],
      ['Jun', 43540, 39790],
      ['Jul', 41200, 42100],
      ['Aug', 44800, 40300],
      ['Sep', 46100, 41700],
    ],
    accept: ['columns'],
  },
  {
    id: 'two-months',
    question: 'How did sales compare between last month and this month?',
    columns: ['month', 'sales (USD)'],
    rows: series(8, [84200, 91700]),
    accept: ['table'],
  },
  {
    id: 'average-ticket',
    question: 'Is our average ticket going up?',
    columns: ['month', 'average ticket (USD)'],
    rows: series(2, [212, 218, 221, 230, 236, 241, 238, 246]),
    accept: ['line'],
  },
  {
    id: 'sales-forecast',
    question: 'Show sales this year, including the forecast for the last three months.',
    columns: ['month', 'sales (USD)', 'type'],
    rows: series(0, [62, 58, 71, 69, 74, 77, 73, 80, 83, 85, 88, 94]).map(([m, v], i) => [m!, (v as number) * 1000, i >= 9 ? 'forecast' : 'actual']),
    accept: ['columns'],
    note: 'forecastFrom should be 9',
  },
  {
    id: 'expenses-vs-budget-line',
    question: 'Which teams spent the most this month? Our average per team is 40k.',
    columns: ['team', 'spent (USD)'],
    rows: [
      ['Engineering', 92000],
      ['Sales', 61000],
      ['Marketing', 38000],
      ['Support', 24000],
      ['Finance', 12000],
      ['People', 9000],
    ],
    accept: ['bars'],
    note: 'reference at 40000',
  },
  {
    id: 'daily-active',
    question: 'How have daily active users trended over the last 30 days?',
    columns: ['day', 'active users'],
    rows: Array.from({ length: 30 }, (_, i) => [`Oct ${i + 1}`, 1200 + Math.round(40 * Math.sin(i / 2)) + i * 9]),
    accept: ['line'],
  },
  {
    id: 'nps-region',
    question: 'What is our NPS in each region?',
    columns: ['region', 'NPS'],
    rows: [
      ['North America', 46],
      ['Europe', 39],
      ['Latin America', 52],
      ['Asia Pacific', 31],
      ['Africa', 28],
    ],
    accept: ['bars'],
  },
  {
    id: 'missing-month',
    question: 'Show monthly revenue. March data is not available yet because the bank feed was down.',
    columns: ['month', 'revenue (USD)'],
    rows: series(0, [41200, 39800, null, 47300, 46900, 51800]),
    accept: ['columns'],
    note: 'March should be null, not 0',
  },
  {
    id: 'funnel',
    question: 'How does our signup funnel look this month?',
    columns: ['step', 'people'],
    rows: [
      ['Visited', 10000],
      ['Signed up', 1200],
      ['Activated', 640],
      ['Paid', 300],
    ],
    accept: ['bars', 'table'],
    note: 'a funnel is not a waterfall of deductions',
  },
  {
    id: 'margin',
    question: 'How has our gross margin moved this year?',
    columns: ['month', 'gross margin (%)'],
    rows: series(0, [41.2, 40.8, 42.5, 43.1, 42.9, 44.0, 44.6, 43.8, 45.2]),
    accept: ['line'],
  },
  {
    id: 'budget-variance',
    question: 'Which departments are over or under budget this quarter?',
    columns: ['department', 'variance vs budget (USD)'],
    rows: [
      ['Engineering', 12000],
      ['Sales', -8000],
      ['Marketing', 4500],
      ['Support', -2100],
      ['Finance', 900],
    ],
    accept: ['table'],
  },
  {
    id: 'top-clients',
    question: 'How concentrated is our revenue in our biggest clients?',
    columns: ['client', 'share of revenue (%)'],
    rows: [
      ['Acme Corp', 22],
      ['Globex', 14],
      ['Initech', 9],
      ['Umbrella', 7],
      ['Hooli', 5],
      ['All others', 43],
    ],
    accept: ['bars'],
  },
  {
    id: 'year-over-year',
    question: 'Compare revenue this year with last year, month by month.',
    columns: ['month', 'last year (USD)', 'this year (USD)'],
    rows: [
      ['Jan', 36100, 41200],
      ['Feb', 35400, 39800],
      ['Mar', 39900, 45100],
      ['Apr', 41800, 47300],
      ['May', 40200, 46900],
      ['Jun', 44100, 51800],
    ],
    accept: ['columns'],
  },
  {
    id: 'units-in-thousands',
    question: 'Show quarterly revenue. Figures are in thousands of dollars.',
    columns: ['quarter', 'revenue (USD thousands)'],
    rows: [
      ['Q1 2025', 412],
      ['Q2 2025', 448],
      ['Q3 2025', 471],
      ['Q4 2025', 509],
      ['Q1 2026', 532],
    ],
    accept: ['columns'],
    note: 'currency in whole units: 412000, not 412',
  },
]

export function prompt(c: Case): string {
  const table = [c.columns.join(' | '), ...c.rows.map((r) => r.map((v) => (v === null ? '(not available)' : v)).join(' | '))].join('\n')
  return `${c.question}\n\nQuery result:\n${table}`
}
