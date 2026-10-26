export type DimensionKind = 'time' | 'category' | 'stage' | 'record'

export type Unit = 'currency' | 'percent' | 'count' | 'number' | 'text'

export type Nature = 'flow' | 'level' | 'signed'


export type Form = 'columns' | 'bars' | 'line' | 'diverging' | 'waterfall' | 'share' | 'kpi' | 'table'

export type Value = string | number | null | undefined

export type Row = Record<string, Value>

export interface Dimension {
  key: string
  label: string
  kind: DimensionKind
}

export interface Measure {
  key: string
  label: string
  unit: Unit
  nature?: Nature
  openKey?: string
}

export interface Reference {
  value: number
  label: string
  alertAbove?: boolean
}

export interface Dataset {
  schemaVersion?: 1
  title: string
  dimension: Dimension
  measures: Measure[]
  rows: Row[]
  partOfWhole?: boolean
  forecastFrom?: number
  reference?: Reference
  highlight?: number[]
  muted?: number[]
  uncertain?: number[]
  totalRows?: number[]
  keepOrder?: boolean
  markCumulative?: boolean
}

export type ReasonCode =
  | 'record-list'
  | 'single-row'
  | 'mixed-units'
  | 'too-many-series'
  | 'flow-stages'
  | 'share-few'
  | 'share-many'
  | 'not-a-whole'
  | 'too-few-periods'
  | 'signed-mixed'
  | 'negative-series'
  | 'level-trend'
  | 'volume-trend'
  | 'category-multi'
  | 'category-negative'
  | 'category-flat'
  | 'category-rank'
  | 'category-top'
  | 'empty'
  | 'fallback'

export interface Decision {
  form: Form
  code: ReasonCode
  reason: string
}

export type Reasons = Record<ReasonCode, string>

export interface Labels {
  others: (n: number) => string
  rest: string
  forecast: string
  open: string
  axisOffset: (start: string) => string
}

export interface Messages extends Labels {
  reasons?: Reasons
}
