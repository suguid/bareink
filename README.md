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

## Why

Most chart libraries will draw whatever you ask for. When the one asking is an LLM, or someone in a hurry, that means pies with slices nobody can compare, dual axes that invent a relationship, and two columns posing as a trend.

`bareink` is the opposite: **a deterministic router decides the form, says why, and is allowed to say no.**

## The rules (not configurable)

- **The intent picks the form.** Columns for volume over time, horizontal bars for categories, a line for levels, diverging columns for signed results, a waterfall for stages, a single 0–100% bar for a part of a whole.
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
| `dimension.kind` | `time` (ordered periods), `category`, `stage` (steps of a flow), `record` (a list of items) |
| `measures[].unit` | `currency`, `percent` (0–100), `count`, `number`, `text` |
| `measures[].nature` | `flow` (a volume in a period), `level` (a stock at a point in time), `signed` (a result whose sign matters) |
| `measures[].openKey` | key of an amount still open, stacked and hatched on top |
| `intent` | `flow` turns stages into a waterfall |
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
| `bareink` (everything) | 15.8 KB | 7.1 KB | 6.3 KB |
| `bareink/route` | 2.7 KB | 1.3 KB | 1.1 KB |
| `bareink/locale/pt-BR` | 1.6 KB | 0.8 KB | 0.8 KB |

Measured with `pnpm size` (esbuild, minified, ES2020). Rendering takes about 40 µs per chart on Node 24 (`node scripts/bench.ts`).

## Compatibility

ESM, ES2020, no DOM, no dependencies. Runs in browsers, Node 20.19+, Deno, Bun and edge workers. Labels are escaped, so user or model text cannot inject markup.

## License

MIT
