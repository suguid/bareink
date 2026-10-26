# Changelog

## 0.1.0

First release.

- `route()`: a deterministic router that picks columns, bars, a line, diverging columns, a waterfall, a 0–100% share bar, number cards or a table, and returns a stable reason code.
- `render()` and `renderTable()`: SVG and HTML strings, no DOM, under 0.1 ms per chart. Missing values are gaps, never zeros.
- Legends where color carries meaning, hatched forecast and open amounts, direct labels, native tooltips, CSS-variable theming with a dark palette.
- `bareink/validate` and `schema.json` for tool use by language models.
- `bareink/locale/en` and `bareink/locale/pt-BR`: one import sets chart words, reason sentences, number locale and currency; numbers through `Intl.NumberFormat`.
- Every public type is documented for editors; README recipes for React, Vue, Svelte and servers, checked by rendering them.
- ESM with types, plus an IIFE build for CDNs.
