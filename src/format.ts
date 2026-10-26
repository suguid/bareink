import type { Unit } from './types.ts'

export interface FormatOptions {
  locale?: string
  currency?: string
}

export interface Formatter {
  value: (unit: Unit, v: number) => string
  tick: (unit: Unit, v: number) => string
  signed: (unit: Unit, v: number) => string
}

export function formatter({ locale = 'en-US', currency = 'USD' }: FormatOptions = {}): Formatter {
  const cache = new Map<string, Intl.NumberFormat>()
  const nf = (id: string, o: Intl.NumberFormatOptions): Intl.NumberFormat => {
    let f = cache.get(id)
    if (!f) cache.set(id, (f = new Intl.NumberFormat(locale, o)))
    return f
  }
  const compact = (style: 'currency' | 'decimal', sign: 'auto' | 'exceptZero', digits: number) =>
    nf(style + sign + digits, {
      style,
      currency,
      notation: 'compact',
      maximumFractionDigits: digits,
      signDisplay: sign,
    } as Intl.NumberFormatOptions)

  const make =
    (sign: 'auto' | 'exceptZero', digits: number) =>
    (unit: Unit, v: number): string => {
      if (unit === 'currency') return compact('currency', sign, Math.abs(v) >= 1000 ? digits : 2).format(v)
      if (unit === 'percent')
        return nf('p' + sign + digits, { style: 'percent', maximumFractionDigits: digits, signDisplay: sign } as Intl.NumberFormatOptions).format(v / 100)
      if (unit === 'count') return nf('c' + sign, { maximumFractionDigits: 0, signDisplay: sign } as Intl.NumberFormatOptions).format(v)
      return compact('decimal', sign, digits).format(v)
    }

  const value = make('auto', 1)
  const signed = make('exceptZero', 1)
  const tick = (unit: Unit, v: number): string =>
    unit === 'currency' ? compact('decimal', 'auto', 1).format(v) : unit === 'percent' ? value(unit, v) : compact('decimal', 'auto', 1).format(v)

  return { value, tick, signed }
}
