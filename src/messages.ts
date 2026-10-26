import type { Messages } from './types.ts'

export const en: Messages = {
  reasons: {
    'record-list': 'A list of records is not a series: each row is an item, not a point on a trend.',
    'single-row': 'A single row: loose numbers read better as cards than as bars.',
    'mixed-units': 'Measures in different units: a chart would need two axes.',
    'too-many-series': 'More than 3 series: use small multiples, or a table.',
    'flow-stages': 'Stages that add up from a total to a result: waterfall.',
    'share-few': 'Part of a whole with up to 4 parts: one 0–100% bar. Never a pie.',
    'share-many': 'Part of a whole with more than 4 parts: sorted horizontal bars.',
    'too-few-periods': 'Fewer than 3 periods: two columns do not show a trend.',
    'signed-mixed': 'A result with mixed signs over time: the sign matters more than the size.',
    'level-trend': 'A level over time (balance, price, occupancy): line.',
    'volume-trend': 'A volume per period (inflows, outflows, revenue): columns from zero.',
    'category-multi': 'Categories with more than one measure: table.',
    'category-negative': 'Negative values across categories with no deviation meaning: table.',
    'category-flat': 'Nearly equal values: the chart would only show bars of the same length.',
    'category-rank': 'Categories: horizontal bars in descending order.',
    'category-top': 'Categories: horizontal bars, the top 8 and the rest grouped.',
    empty: 'No rows to show.',
    fallback: 'No rule applied: when in doubt, a table.',
  },
  others: (n) => `Other ${n}`,
  rest: 'Rest',
  forecast: 'forecast',
  open: 'open',
  axisOffset: (start) => `The axis starts at ${start}: the variation exceeds 10% of the value.`,
}
