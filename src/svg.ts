export interface Markup {
  readonly h: string
}

export type Child = Markup | string | number | false | null | undefined | Child[]

type Attr = string | number | boolean | null | undefined

export const esc = (s: string | number): string =>
  String(s).replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';')

const r2 = (v: number): string => String(Math.round(v * 100) / 100)

const flat = (kids: Child[]): string => {
  let s = ''
  for (const k of kids) {
    if (k == null || k === false) continue
    if (Array.isArray(k)) s += flat(k)
    else if (typeof k === 'object') s += k.h
    else s += esc(k)
  }
  return s
}

export function el(tag: string, attrs: Record<string, Attr>, ...kids: Child[]): Markup {
  let s = '<' + tag
  for (const k in attrs) {
    const v = attrs[k]
    if (v == null || v === false) continue
    s += ' ' + k + '="' + (typeof v === 'number' ? r2(v) : esc(v === true ? '' : v)) + '"'
  }
  const inner = flat(kids)
  return { h: s + (inner ? '>' + inner + '</' + tag + '>' : '/>') }
}

export const p = (n: number): string => r2(n)

export function topRounded(x: number, y: number, w: number, h: number, r: number): string {
  if (h <= 0 || w <= 0) return ''
  r = Math.min(r, w / 2, h)
  return `M${p(x)},${p(y + h)}V${p(y + r)}Q${p(x)},${p(y)} ${p(x + r)},${p(y)}H${p(x + w - r)}Q${p(x + w)},${p(y)} ${p(x + w)},${p(y + r)}V${p(y + h)}Z`
}

export function bottomRounded(x: number, y: number, w: number, h: number, r: number): string {
  if (h <= 0 || w <= 0) return ''
  r = Math.min(r, w / 2, h)
  return `M${p(x)},${p(y)}H${p(x + w)}V${p(y + h - r)}Q${p(x + w)},${p(y + h)} ${p(x + w - r)},${p(y + h)}H${p(x + r)}Q${p(x)},${p(y + h)} ${p(x)},${p(y + h - r)}Z`
}

export function rightRounded(x: number, y: number, w: number, h: number, r: number): string {
  if (w <= 0 || h <= 0) return ''
  r = Math.min(r, h / 2, w)
  return `M${p(x)},${p(y)}H${p(x + w - r)}Q${p(x + w)},${p(y)} ${p(x + w)},${p(y + r)}V${p(y + h - r)}Q${p(x + w)},${p(y + h)} ${p(x + w - r)},${p(y + h)}H${p(x)}Z`
}

export const rect = (x: number, y: number, w: number, h: number): string =>
  w > 0 && h > 0 ? `M${p(x)},${p(y)}h${p(w)}v${p(h)}h${p(-w)}Z` : ''

export const polyline = (pts: [number, number][]): string =>
  pts.map(([x, y], i) => (i ? 'L' : 'M') + p(x) + ',' + p(y)).join('')

export const textWidth = (s: string, size: number): number => s.length * size * 0.56
