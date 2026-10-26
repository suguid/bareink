const E10 = Math.sqrt(50)
const E5 = Math.sqrt(10)
const E2 = Math.sqrt(2)

function increment(start: number, stop: number, count: number): number {
  const step = (stop - start) / Math.max(1, count)
  const power = Math.floor(Math.log10(step))
  const error = step / 10 ** power
  const f = error >= E10 ? 10 : error >= E5 ? 5 : error >= E2 ? 2 : 1
  return power >= 0 ? f * 10 ** power : -(10 ** -power) / f
}

export function ticks(start: number, stop: number, count: number): number[] {
  if (!(stop > start)) return [start]
  const inc = increment(start, stop, count)
  const out: number[] = []
  if (inc > 0) {
    for (let i = Math.ceil(start / inc); i <= Math.floor(stop / inc); i++) out.push(i * inc)
  } else {
    const k = -inc
    for (let i = Math.ceil(start * k); i <= Math.floor(stop * k); i++) out.push(i / k)
  }
  return out
}

export function nice(start: number, stop: number, count: number): [number, number] {
  if (stop === start) return start === 0 ? [0, 1] : start > 0 ? [0, start] : [start, 0]
  let prev = 0
  for (let n = 0; n < 10; n++) {
    const step = increment(start, stop, count)
    if (step === prev) break
    if (step > 0) {
      start = Math.floor(start / step) * step
      stop = Math.ceil(stop / step) * step
    } else {
      start = Math.ceil(start * step) / step
      stop = Math.floor(stop * step) / step
    }
    prev = step
  }
  return [start, stop]
}

export interface Linear {
  (v: number): number
  domain: [number, number]
  ticks: (count: number) => number[]
}

export function linear(domain: [number, number], range: [number, number]): Linear {
  const [d0, d1] = domain
  const [r0, r1] = range
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0)
  const f = ((v: number) => r0 + (v - d0) * k) as Linear
  f.domain = domain
  f.ticks = (count) => ticks(d0, d1, count)
  return f
}

export interface Band {
  (i: number): number
  bandwidth: number
  step: number
}

export function band(n: number, range: [number, number], inner: number, outer: number): Band {
  const [r0, r1] = range
  const step = (r1 - r0) / Math.max(1, n - inner + outer * 2)
  const start = r0 + (r1 - r0 - step * (n - inner)) / 2
  const f = ((i: number) => start + step * i) as Band
  f.bandwidth = step * (1 - inner)
  f.step = step
  return f
}

export const point = (n: number, range: [number, number], padding = 0): Band => band(n, range, 1, padding)
