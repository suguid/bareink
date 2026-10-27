# Roadmap

bareink stays small on purpose. Every release passes the essence check below before it ships; a feature that cannot pass it goes to a separate package, a recipe in the README, or nowhere.

## Essence check

1. **Bytes.** The core stays under its gzip limit in `size-budget.json`. A feature that only some users need lives in a subpath they import, not in `render`.
2. **Zero dependencies.** No runtime dependency, ever. `test/essence.test.ts` enforces it.
3. **One decision, made for you.** No option picks a chart type. A new dataset field describes what the numbers mean, never how to draw them.
4. **No pie, no dual axis.** A new form arrives with a router rule, a reason code, a test and a line in the README table.
5. **Small surface.** New exports and subpaths are deliberate; the surface test lists them.
6. **Stable contract.** Reason codes and `schema.json` v1 never change meaning; they only grow.
7. **Readable.** What ships is what you read: no minified files in the package, no build step for users.

## 0.2: reach people where they ask for charts

- [x] Evaluate with real models: questions run through several models with `schema.json`; measure how often `validate` passes on the first try and whether the form fits. Tune the schema descriptions from the failures.
- [x] A Claude skill, so "use bareink" works without integration code.
- [x] An MCP server with one `chart` tool, shipped in this package with no dependencies.
- [x] A public playground: edit the dataset, see the chart and the reason live.
- [x] Compatibility notes for Deno, Bun, Workers and browsers.

## 0.3: gaps that show up in real use

- [ ] Phones: labels checked at 320 px.
- [ ] Accessibility: screen reader pass; the table behind every chart one click away, without JavaScript.
- [ ] More locales (`es`, `fr`, `de`), each checked for every reason code.
- [ ] PNG output as a recipe, not a dependency.
- [ ] Annotations: mark an event on a period ("launch", "price change"), if it fits the budget.

## 1.0: stability as a promise

- [ ] Reason codes and schema v1 frozen, with a written versioning and deprecation policy.
- [ ] Three projects outside this one using it in production.
- [ ] A short documentation site: the reason table with live examples, and the framework recipes.

## Not on the roadmap, on purpose

Pie, donut, dual axis, 3D, zoomable interactive charts. Maps, scatter and heatmaps until a real case shows a rule the router can decide clearly. Choosing the chart type by hand: d3 and Chart.js already do that well.
