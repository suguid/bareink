import { labels } from '../messages.ts'
import type { Messages } from '../types.ts'

export const en: Messages = {
  ...labels,
  reasons: {
    'record-list': 'A list of items, not a series: table.',
    'single-row': 'One row: numbers read better as cards.',
    'mixed-units': 'Different units would need two axes: table.',
    'too-many-series': 'More than 3 series: table.',
    'flow-stages': 'Steps from a total to a result: waterfall.',
    'share-few': 'Up to 4 parts of a whole: one 0–100% bar, never a pie.',
    'share-many': 'More than 4 parts of a whole: sorted bars.',
    'too-few-periods': 'Under 3 periods show no trend: table.',
    'signed-mixed': 'Values below zero over time: the sign matters as much as the size.',
    'negative-series': 'Several series with values below zero: table.',
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
}
