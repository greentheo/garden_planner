# Tests

```bash
node --test
```

No dependencies, no config, no runner — `node --test` finds `test/*.test.mjs`
itself. Needs Node 18 or newer for the built-in test runner.

The engine's own `loadData()` goes through `fetch`, which only exists in the
browser, so [`helpers.mjs`](helpers.mjs) reads the same two JSON files off disk
and hands them to `calculatePlan` as arguments. Nothing here touches the DOM, so
[`src/ui.js`](../src/ui.js) is not covered.

| file | what it holds down |
|---|---|
| [`zones.test.mjs`](zones.test.mjs) | which crops a zone can grow, that the zone ranges and the schedule data agree, that no plan contains a crop the zone cannot grow |
| [`schedule.test.mjs`](schedule.test.mjs) | the zone 3–6 window on season extension, what a greenhouse changes and what it must not, spring/fall windows, week ordering within a year |
| [`succession.test.mjs`](succession.test.mjs) | sowing intervals, that the last sowing can still be harvested, the cap |
| [`spacing.test.mjs`](spacing.test.mjs) | square footage as a division, the density tiers, totals adding up |
| [`calories.test.mjs`](calories.test.mjs) | the target arithmetic, plant counts, the supplementation slider, category shares |
| [`greenhouse.test.mjs`](greenhouse.test.mjs) | allocation conserving plants and space, capacity, the diversity-then-priority order |
| [`data.test.mjs`](data.test.mjs) | the shape of `plants.json` and `recipes.json`, which the engine trusts completely |

The suite was checked by mutation: multiplying by `plants_per_sqft` instead of
dividing, extending the season in every zone, flooring plant counts instead of
rounding up, taking the whole of each crop into the greenhouse rather than a
quarter, ignoring the succession interval or the supplementation percentage, and
letting calorie yield outrank zone viability each make it fail.
