/**
 * What each row is.
 * - `time`: ordered periods (months, weeks, years), oldest first.
 * - `category`: things to compare (expense categories, products, regions).
 * - `stage`: steps from a total to a result, such as revenue minus costs to profit. Always drawn as a waterfall.
 * - `record`: a list of individual items such as invoices. Always a table.
 */
export type DimensionKind = 'time' | 'category' | 'stage' | 'record'

/**
 * - `currency`: money in whole units; multiply figures given in thousands or millions. Formatted with the locale's currency.
 * - `percent`: 0 to 100, not 0 to 1.
 * - `count`: people, items, orders.
 * - `number`: anything else.
 * - `text`: a non-numeric column. Any text measure makes a table.
 */
export type Unit = 'currency' | 'percent' | 'count' | 'number' | 'text'

/**
 * - `flow`: happens during each period and could be summed (revenue, inflows, sales). Drawn as columns from zero.
 * - `level`: read at a point in time, never summed (balance, price, headcount, average ticket). Drawn as a line.
 * - `signed`: the sign is the point (net result, profit or loss, variance).
 */
export type Nature = 'flow' | 'level' | 'signed'

/** The shape the router picked. There is no pie and no dual axis. */
export type Form = 'columns' | 'bars' | 'line' | 'diverging' | 'waterfall' | 'share' | 'kpi' | 'table'

/** A cell. Use `null` for a missing value, never 0: it becomes a gap, not a zero. */
export type Value = string | number | null | undefined

/** One period, category, stage or item: the dimension label plus one value per measure. */
export type Row = Record<string, Value>

export interface Dimension {
  /** Field in each row that holds the row's label, e.g. `'month'`. Labels are shown as given; dates are never parsed. */
  key: string
  /** Human name of the dimension, e.g. `'Month'`. */
  label: string
  kind: DimensionKind
}

export interface Measure {
  /** Field in each row that holds this number. Unique, and different from `dimension.key`. */
  key: string
  /** Human name, shown in legends, tooltips and tables, e.g. `'Inflows'`. */
  label: string
  unit: Unit
  /** How the number behaves over time. Decides between columns, a line and diverging columns. */
  nature?: Nature
  /** Field with an amount still open or expected in the same period (unpaid invoices), hatched on top of the column. Zero or more. */
  openKey?: string
}

export interface Reference {
  /** Where the line goes, in the measure's unit. */
  value: number
  /** Shown next to the line, e.g. `'average 40k'` or `'target'`. */
  label: string
  /** Color bars above the reference as an alert. */
  alertAbove?: boolean
}

/**
 * Numbers described by what they mean. bareink picks the chart, or a table, or number cards.
 * Call `validate` from `bareink/validate` first when the dataset comes from a user or a model.
 */
export interface Dataset {
  schemaVersion?: 1
  /** The takeaway as a sentence, e.g. `'Three categories take 71% of outflows'`. The chart's accessible name. */
  title: string
  dimension: Dimension
  /** Up to 3 in the same unit for a chart; more, or mixed units, make a table. */
  measures: Measure[]
  /** In display order; for `time`, oldest first. */
  rows: Row[]
  /** The rows are parts of one whole, with a single `percent` measure adding up to 100 or less. Up to 3 parts make one 0–100% bar. */
  partOfWhole?: boolean
  /** Index of the first forecast row. Forecast rows are hatched in columns and dashed in lines. */
  forecastFrom?: number
  /** A reference line such as an average, a target or capacity. */
  reference?: Reference
  /** Row indexes whose value gets a direct label, usually the ones the text around the chart mentions. */
  highlight?: number[]
  /** Row indexes drawn in grey, for rows that are not really part of the comparison. */
  muted?: number[]
  /** Row indexes of parts of a whole whose classification is uncertain, drawn hatched. */
  uncertain?: number[]
  /** Stage rows that are totals rather than steps. Defaults to the first and the last row. */
  totalRows?: number[]
  /** Keep categories in the given order instead of sorting by size. */
  keepOrder?: boolean
  /** Mark running totals on a part-of-a-whole bar. */
  markCumulative?: boolean
}

/** Stable across versions: build on it. See the table in the README for what each code means. */
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
  | 'missing-values'
  | 'fallback'

export interface Decision {
  form: Form
  /** Why this form. Stable; prefer it over `reason` in code and when talking to a model. */
  code: ReasonCode
  /** The sentence for `code` in the chosen locale, or `''` when no locale with reasons was passed. */
  reason: string
}

export type Reasons = Record<ReasonCode, string>

/** Words drawn inside charts. English ones are built in. */
export interface Labels {
  others: (n: number) => string
  rest: string
  forecast: string
  open: string
  axisOffset: (start: string) => string
}

/** A locale: chart words, reason sentences and number formatting defaults. Import `en` or `ptBR`, or write your own. */
export interface Messages extends Labels {
  reasons?: Reasons
  /** BCP 47 tag used for numbers when the `locale` option is not set, e.g. `'pt-BR'`. */
  locale?: string
  /** ISO 4217 code used when the `currency` option is not set, e.g. `'BRL'`. */
  currency?: string
}
