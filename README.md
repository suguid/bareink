# bareink

**Charts that tell the bare truth — in a few kilobytes.**

`bareink` takes data described by what it *means* (a volume per month, a level over time, parts of a whole) and decides how to show it: which chart, or no chart at all. Then it draws that chart as a plain SVG string. It has zero runtime dependencies and does not need a DOM.

```js
import { render } from 'bareink'

const { form, reason, markup } = render({
  title: 'Inflows and outflows move together',
  dimension: { key: 'month', label: 'Month', kind: 'time' },
  measures: [
    { key: 'in', label: 'Inflows', unit: 'currency', nature: 'flow' },
    { key: 'out', label: 'Outflows', unit: 'currency', nature: 'flow' },
  ],
  rows: [
    { month: 'Apr', in: 38900, out: 39000 },
    { month: 'May', in: 40540, out: 39850 },
    { month: 'Jun', in: 43540, out: 39790 },
  ],
}, { width: 640 })

form    // 'columns'
reason  // 'A volume per period (inflows, outflows, revenue): columns from zero.'
markup  // '<svg ...>'
```

## Showcase

Every chart below is a plain SVG string from `render()`, written to a file by [`examples/readme.ts`](examples/readme.ts). No browser was involved.

<!-- showcase:start -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/columns-dark.svg">
  <img alt="Inflows and outflows move together, near $40k a month" src="docs/img/columns-light.svg" width="640">
</picture>

**`columns`**: A volume per period: columns from zero.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/diverging-dark.svg">
  <img alt="March carried the year" src="docs/img/diverging-light.svg" width="640">
</picture>

**`diverging`**: Mixed signs over time: the sign matters more than the size.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/bars-dark.svg">
  <img alt="Three categories take 71% of outflows" src="docs/img/bars-light.svg" width="640">
</picture>

**`bars`**: Categories: bars, largest first.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/line-dark.svg">
  <img alt="Average ticket rose 16% in six months" src="docs/img/line-light.svg" width="640">
</picture>

**`line`**: A level over time: line.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/waterfall-dark.svg">
  <img alt="Of every $100 in, $10 is operating result" src="docs/img/waterfall-light.svg" width="640">
</picture>

**`waterfall`**: Steps from a total to a result: waterfall.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/share-dark.svg">
  <img alt="People take 29% of revenue, 43% with owners" src="docs/img/share-light.svg" width="640">
</picture>

**`share`**: Up to 4 parts of a whole: one 0–100% bar, never a pie.

### When the router says no

| Asked for | Router says |
|---|---|
| September vs October | **table**: Under 3 periods show no trend: table. |
| Revenue and customers | **table**: Different units would need two axes: table. |
| Three offices cost the same | **table**: Nearly equal values would draw equal bars: table. |
| Yearly site renewals | **table**: A list of items, not a series: table. |
| Cash today | **kpi**: One row: numbers read better as cards. |
<!-- showcase:end -->

## Why

Most chart libraries will draw whatever you ask for. When the one asking is an LLM, or someone in a hurry, that means pies with slices nobody can compare, dual axes that invent a relationship, and two columns posing as a trend.

`bareink` is the opposite: **a deterministic router decides the form, says why, and is allowed to say no.**

## The rules (not configurable)

- **The meaning picks the form.** Columns for volume over time, horizontal bars for categories, a line for levels, diverging columns for signed results, a waterfall for stages, a single 0–100% bar for a part of a whole.
- **Never a pie. Never a dual axis.**
- **Honest scales.** Columns and bars start at zero. A line leaves zero only when the variation exceeds 10% of the value, and the chart says so in a note.
- **Forecast looks different.** Actuals are solid; forecast and open amounts are hatched in columns and dashed in lines.
- **Few series.** Up to 3 per chart; more becomes a table.
- **When in doubt, a table.** A single row becomes number cards. Two periods, mixed units, near-equal categories and lists of records become a table.
- **Accessible by default.** `role="img"`, the title as the accessible name, a native `<title>` tooltip on every mark, and a table for every chart through `renderTable`.

## API

```ts
route(dataset, messages?)          // { form, code, reason }: decision only, ~1 KB
render(dataset, options?)          // { form, code, reason, markup, notes }
renderTable(dataset, options?)     // HTML table, the fallback for any chart
cssVariables(palette, selector?)   // CSS custom properties for a theme
```

Options: `width` (default 640), `locale` and `currency` (passed to `Intl.NumberFormat`), `messages` (e.g. `ptBR` from `bareink/locale/pt-BR`), `palette`, `inlineColors`, `id`.

### The dataset

| Field | Meaning |
|---|---|
| `dimension.kind` | `time` (ordered periods), `category`, `stage` (steps from a total to a result, drawn as a waterfall), `record` (a list of items) |
| `measures[].unit` | `currency`, `percent` (0–100), `count`, `number`, `text` |
| `measures[].nature` | `flow` (a volume in a period), `level` (a stock at a point in time), `signed` (a result whose sign matters) |
| `measures[].openKey` | key of an amount still open, stacked and hatched on top |
| `partOfWhole` | parts of 100% |
| `forecastFrom` | index of the first forecast row |
| `reference` | a reference line; `alertAbove` colors bars that cross it |
| `highlight`, `muted`, `uncertain`, `totalRows` | row indices for direct labels, grey bars, hatched parts, waterfall totals |

Dates are never parsed: the dimension values are the labels you pass.

## Theming

Colors are CSS custom properties with fallbacks (`var(--bi-s1,#2a78d6)`), so a page sets its theme in CSS and dark mode comes for free:

```js
import { cssVariables, dark } from 'bareink'
const css = `@media (prefers-color-scheme: dark) { ${cssVariables(dark)} }`
```

Where CSS variables are not available (PDF, rasterizers, design tools), pass `inlineColors: true`.

## Size

| Entry | min | gzip | brotli |
|---|---|---|---|
| `bareink` (everything) | 15.1 KB | 6.8 KB | 6.1 KB |
| `bareink/route` | 2.4 KB | 1.1 KB | 0.9 KB |
| `bareink/locale/pt-BR` | 1.3 KB | 0.7 KB | 0.6 KB |

Measured with `pnpm size` (esbuild, minified, ES2020). Rendering takes about 40 µs per chart on Node 24 (`node scripts/bench.ts`).

## Compatibility

ESM, ES2020, no DOM, no dependencies. Runs in browsers, Node 20.19+, Deno, Bun and edge workers. Labels are escaped, so user or model text cannot inject markup.

## License

MIT
