export interface Markup {
  readonly h: string
}

export type Child = Markup | string | number | false | null | undefined | Child[]

type Attr = string | number | boolean | null | undefined

const UNSAFE = /[&<>"']/

export const esc = (v: string | number): string => {
  const s = String(v)
  return UNSAFE.test(s) ? s.replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';') : s
}

export const p = (v: number): string => String(Math.round(v * 10) / 10)

const flat = (kids: Child[]): string => {
  let s = ''
  for (const k of kids) {
    if (k == null || k === false) continue
    s += Array.isArray(k) ? flat(k) : typeof k === 'object' ? k.h : esc(k)
  }
  return s
}

export function el(tag: string, attrs: Record<string, Attr>, ...kids: Child[]): Markup {
  let s = '<' + tag
  for (const k in attrs) {
    const v = attrs[k]
    if (v == null || v === false) continue
    s += ' ' + k + '="' + (typeof v === 'number' ? p(v) : v === true ? '' : esc(v)) + '"'
  }
  const inner = flat(kids)
  return { h: s + (inner ? '>' + inner + '</' + tag + '>' : '/>') }
}

export const TOP = 3
export const RIGHT = 6
export const BOTTOM = 12

export function box(x: number, y: number, w: number, h: number, r = 0, corners = 0): string {
  if (w <= 0 || h <= 0) return ''
  r = Math.min(r, w / 2, h / 2)
  const [a, b, c, d] = [1, 2, 4, 8].map((bit) => (corners & bit ? r : 0)) as [number, number, number, number]
  const q = (cx: number, cy: number, ex: number, ey: number, k: number) => (k ? `Q${p(cx)},${p(cy)} ${p(ex)},${p(ey)}` : '')
  return (
    `M${p(x + a)},${p(y)}H${p(x + w - b)}${q(x + w, y, x + w, y + b, b)}V${p(y + h - c)}${q(x + w, y + h, x + w - c, y + h, c)}` +
    `H${p(x + d)}${q(x, y + h, x, y + h - d, d)}V${p(y + a)}${q(x, y, x + a, y, a)}Z`
  )
}

export const polyline = (pts: [number, number][]): string =>
  pts.map(([x, y], i) => (i ? 'L' : 'M') + p(x) + ',' + p(y)).join('')

export const textWidth = (s: string, size: number): number => s.length * size * 0.56
