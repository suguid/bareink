import type { Labels } from './types.ts'

export const labels: Labels = {
  others: (n) => `Other ${n}`,
  rest: 'Rest',
  forecast: 'forecast',
  open: 'open',
  axisOffset: (start) => `Axis starts at ${start}: the range exceeds 10% of the value.`,
}
