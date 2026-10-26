import type { Unit } from './types.ts'

export interface FormatOptions {
  /** BCP 47 tag for numbers, e.g. `'pt-BR'`. Defaults to the locale's own, then `'en-US'`. */
  locale?: string
  /** ISO 4217 code, e.g. `'BRL'`. Defaults to the locale's own, then `'USD'`. */
  currency?: string
}

export interface Formatter {
  value: (unit: Unit, v: number) => string
  tick: (unit: Unit, v: number) => string
  signed: (unit: Unit, v: number) => string
}

const FORMATTERS = new Map<string, Formatter>()

export function formatter({ locale = 'en-US', currency = 'USD' }: FormatOptions = {}): Formatter {
  const key = locale + ' ' + currency
  const hit = FORMATTERS.get(key)
  if (hit) return hit
  const cache = new Map<string, Intl.NumberFormat>()
  const nf = (style: string, sign: string, digits: number, compact?: 1): Intl.NumberFormat => {
    const id = style + sign + digits + compact
    let f = cache.get(id)
    if (!f)
      cache.set(
        id,
        (f = new Intl.NumberFormat(locale, {
          style,
          currency,
          signDisplay: sign,
          maximumFractionDigits: digits,
          notation: compact ? 'compact' : 'standard',
        } as Intl.NumberFormatOptions)),
      )
    return f
  }
  const make =
    (sign: string) =>
    (unit: Unit, v: number): string =>
      unit === 'currency'
        ? nf(unit, sign, Math.abs(v) >= 1000 ? 1 : 2, 1).format(v)
        : unit === 'percent'
          ? nf(unit, sign, 1).format(v / 100)
          : unit === 'count'
            ? nf('decimal', sign, 0).format(v)
            : nf('decimal', sign, 1, 1).format(v)
  const value = make('auto')
  const f: Formatter = {
    value,
    signed: make('exceptZero'),
    tick: (unit, v) => (unit === 'percent' ? value(unit, v) : value('number', v)),
  }
  FORMATTERS.set(key, f)
  return f
}
