import type { Messages } from './types.ts'

export const en: Messages = {
  reasons: {
    'record-list': 'A list of items, not a series: table.',
    'single-row': 'One row: numbers read better as cards.',
    'mixed-units': 'Different units would need two axes: table.',
    'too-many-series': 'More than 3 series: table.',
    'flow-stages': 'Steps from a total to a result: waterfall.',
    'share-few': 'Up to 4 parts of a whole: one 0–100% bar, never a pie.',
    'share-many': 'More than 4 parts of a whole: sorted bars.',
    'too-few-periods': 'Under 3 periods show no trend: table.',
    'signed-mixed': 'Mixed signs over time: the sign matters more than the size.',
    'level-trend': 'A level over time: line.',
    'volume-trend': 'A volume per period: columns from zero.',
    'category-multi': 'Categories with several measures: table.',
    'category-negative': 'Negative values across categories: table.',
    'category-flat': 'Nearly equal values would draw equal bars: table.',
    'category-rank': 'Categories: bars, largest first.',
    'category-top': 'Categories: the top 8 bars, the rest grouped.',
    empty: 'No rows.',
    fallback: 'No rule applied: table.',
  },
  others: (n) => `Other ${n}`,
  rest: 'Rest',
  forecast: 'forecast',
  open: 'open',
  axisOffset: (start) => `Axis starts at ${start}: the range exceeds 10% of the value.`,
}
