# Changelog

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
