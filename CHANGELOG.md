# Changelog

## 0.3.1

- The label at the end of a line reserves room for its bold text, so it is no longer clipped at the right edge.
- README: a versioning policy (what is a contract and what is not) and a link to the reason codes page, where every code is drawn live.

## 0.3.0

Gaps that show up in real use. The core grew 95 bytes, all of them layout fixes.

- Labels never overlap at phone widths: the forecast label sits above highlighted values, highlighted values stay inside the chart and clear of the axis, edge labels shrink to the room they have, and highlights that would collide are skipped. The tests now check every chart for overlapping text at 320 and 375 px.
- Text meets WCAG AA contrast in both palettes. axe-core found the light muted gray at 3.6:1; it is now 5.4:1, and a test checks every text color.
- `bareink/locale/es`, `bareink/locale/fr` and `bareink/locale/de`, each checked for every reason code. The MCP server takes any of them with `--locale`.
- README recipes for an accessible chart (the table one click away, no JavaScript) and for PNG output with resvg.
- Annotations were considered and deferred: they would sit in `render` for every user while few need them.

## 0.2.0

Reach people where they ask for charts. The core did not grow a byte.

- `bareink-mcp`: an MCP server with one `chart` tool, shipped in the package with no dependencies. It validates each call, sends errors back to the model, and returns the decision with the SVG or HTML.
- A Claude skill in `skills/bareink`.
- A model evaluation in `eval/`: 24 questions, scored for a valid dataset, the expected form and the query's exact numbers. Claude Haiku, Sonnet and Opus pass all 24.
- `schema.json`: `currency` now tells models to multiply figures given in thousands or millions, the one miss the evaluation found.
- A public playground at https://suguid.github.io/bareink/.

## 0.1.1

- Published from GitHub Actions with npm trusted publishing, so every release carries a signed provenance statement linking it to its commit.
- The IIFE build ships readable instead of minified. jsDelivr serves a minified copy at `dist/bareink.iife.min.js`.

## 0.1.0

First release.

- `route()`: a deterministic router that picks columns, bars, a line, diverging columns, a waterfall, a 0–100% share bar, number cards or a table, and returns a stable reason code.
- `render()` and `renderTable()`: SVG and HTML strings, no DOM, under 0.1 ms per chart. Missing values are gaps, never zeros.
- Legends where color carries meaning, hatched forecast and open amounts, direct labels, native tooltips, CSS-variable theming with a dark palette.
- `bareink/validate` and `schema.json` for tool use by language models.
- `bareink/locale/en` and `bareink/locale/pt-BR`: one import sets chart words, reason sentences, number locale and currency; numbers through `Intl.NumberFormat`.
- Every public type is documented for editors; README recipes for React, Vue, Svelte and servers, checked by rendering them.
- ESM with types, plus an IIFE build for CDNs.
