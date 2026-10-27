# Model evaluation

Does `schema.json` alone lead a model to a valid dataset, the expected form and the query's exact numbers?

`cases.ts` holds 24 questions an app might get, each with the query result it fetched and the forms that would be right. A model sees only `schema.json` and the question with its query result, and answers with the tool input it would send. `score.ts` checks each answer:

- **valid**: `validate` returns no errors on the first try;
- **form fits**: the router's form is one of the expected ones;
- **numbers faithful**: the dataset holds exactly the query's numbers, scaled to whole units where the query was in thousands, with gaps kept as `null`.

```sh
node eval/score.ts eval/results/<model>.json
```

## Results

| Model | valid | form fits | numbers faithful |
|---|---|---|---|
| Claude Haiku | 24/24 | 24/24 | 23/24 → 24/24 after the fix below |
| Claude Sonnet | 24/24 | 24/24 | 24/24 |
| Claude Opus | 24/24 | 24/24 | 24/24 |

The one miss: Haiku kept revenue "in thousands" as a plain number instead of currency in whole units. The `currency` description now says to multiply figures given in thousands or millions.
