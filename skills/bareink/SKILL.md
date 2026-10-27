---
name: bareink
description: Draw a chart, number cards or a table from numbers with bareink, which picks the form by fixed rules (never a pie, never a dual axis) and explains why. Use when the user asks to chart, plot, graph or visualize numbers, or asks "show me" about data, and the result goes into an HTML page, an artifact, a file or an app.
---

# bareink

bareink takes numbers described by what they mean and decides the form itself: columns, bars, a line, diverging columns, a waterfall, a 0–100% bar, number cards or a table. Never choose the chart type yourself; there is no field for it.

## 1. Describe the numbers

Write a dataset (full contract: https://cdn.jsdelivr.net/npm/bareink/schema.json):

```json
{
  "title": "Revenue grew 26% in the first half",
  "dimension": { "key": "month", "label": "Month", "kind": "time" },
  "measures": [{ "key": "revenue", "label": "Revenue", "unit": "currency", "nature": "flow" }],
  "rows": [{ "month": "Jan", "revenue": 41200 }, { "month": "Feb", "revenue": 39800 }, { "month": "Mar", "revenue": 45100 }]
}
```

- `title` is the takeaway as a sentence, not a label.
- `dimension.kind`: `time` (periods, oldest first), `category` (things to compare), `stage` (a total to a result, deductions negative), `record` (a list of items).
- `unit`: `currency` in whole units (multiply figures given in thousands), `percent` as 0–100, `count`, `number`, `text`.
- `nature`: `flow` (summable over periods: revenue), `level` (a reading: balance, price, headcount), `signed` (the sign is the point: profit or loss).
- Copy the numbers exactly. A missing value is `null`, never 0.
- Optional: `partOfWhole`, `forecastFrom`, `reference`, `highlight`, `keepOrder`. Unknown fields are rejected.

## 2. Validate and render

In a page or artifact, load the browser build from the CDN:

```html
<div id="chart"></div>
<script src="https://cdn.jsdelivr.net/npm/bareink@0/dist/bareink.iife.min.js"></script>
<script>
  const dataset = { /* step 1 */ }
  const errors = bareink.validate(dataset)
  const out = errors.length ? null : bareink.render(dataset, { messages: bareink.en, width: 640 })
  document.querySelector('#chart').innerHTML = out ? out.markup : errors.join('<br>')
</script>
```

Use `bareink.ptBR` for Portuguese words and Brazilian numbers. In Node, `npm install bareink` and import `render` from `bareink`, `validate` from `bareink/validate`, and `en` from `bareink/locale/en`.

If `validate` returns errors, fix the dataset and try again; each error names the field and what it got.

## 3. Explain the choice

`render` returns `form` and `code`. Tell the user in one sentence why that form was used, in their language. When the form is `table`, that is a decision, not a failure: the code says why (for example `mixed-units` or `too-few-periods`). Show `notes` under the chart when there are any.
