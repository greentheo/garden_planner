# The crop and recipe data

Two files, loaded over `fetch` at page load and never written back:
[`data/plants.json`](../data/plants.json) (50 crops) and
[`data/recipes.json`](../data/recipes.json) (11 recipes).
[`test/data.test.mjs`](../test/data.test.mjs) checks the shape of both.

## plants.json

```json
{
  "id": 1,
  "name": "Tomato",
  "category": ["nightshade", "fruit-vegetable"],
  "yield_per_plant": 15,
  "calories_per_lb": 82,
  "days_to_maturity": 75,
  "harvest_period_weeks": 10,
  "succession_planting_weeks": 2,
  "plants_per_sqft": 1,
  "greenhouse_priority": 4,
  "growing_conditions": {
    "outdoor_zones": { "min": 5, "max": 11 },
    "greenhouse_zones": { "min": 3, "max": 4 },
    "impossible_zones": [1, 2]
  },
  "zone_adjusted_schedules": [
    {
      "zone_range": [5, 5],
      "outdoor":             { "seed_start_week": 12, "transplant_week": 18, "first_harvest_week": 28, "last_harvest_week": 40 },
      "greenhouse_extended": { "seed_start_week":  8, "transplant_week": 14, "first_harvest_week": 24, "last_harvest_week": 44 }
    }
  ],
  "seed_sources": [ { "supplier": "...", "category_url": "..." } ]
}
```

| field | notes |
|---|---|
| `category` | one or more; recipes address crops only through these |
| `yield_per_plant` | pounds, over the whole harvest period |
| `calories_per_lb` | raw, edible portion |
| `succession_planting_weeks` | 0 means a single sowing |
| `plants_per_sqft` | square-foot gardening density, see below |
| `greenhouse_priority` | 1–4, drives the greenhouse space fill |
| `zone_adjusted_schedules` | zone ranges must tile every zone the crop is viable in |
| `multiple_windows` | present on peas and fava beans; their schedules are arrays |

### Spacing tiers

From the [square foot gardening spacing
guide](https://squarefootgardening.org/2024/02/square-foot-spacing/). The field
is plants **per** square foot, so square footage is `count / plants_per_sqft` —
getting this backwards is what once produced a 32,000 sq ft plan for a household
of four.

| plants/sqft | spacing | crops |
|---|---|---|
| 0.5 | 2 sq ft each | vining squash, melons, cucumbers (8) |
| 1 | 12" | tomatoes, peppers, brassicas, asparagus (13) |
| 4 | 6" | lettuce, potatoes, herbs, corn, strawberries (13) |
| 8 | ~4", double-sown | peas (1) |
| 9 | 4" | beans, beets, spinach, turnips, leeks (8) |
| 16 | 3" | carrots, onions, garlic, radish, rutabaga (7) |

### Germination and emergence

`seed_start_week` is when a seed, tuber, clove or crown goes in; `transplant_week`
is when the plant is up and growing. The gap between them is the germination or
establishment period, and it is in the data rather than computed:

| gap | crops |
|---|---|
| 1 week | peas, radish, turnips, lettuce, arugula, spinach, green beans, edamame, kale, collards |
| 2 weeks | beets, fava beans, lima beans, swiss chard, rutabaga, onions, shallots, sweet potato (slips), strawberries (crowns) |
| 3 weeks | carrots, potato (chitting plus emergence), garlic (root establishment), asparagus (crowns) |
| 4 weeks | parsnips |

Transplanted crops carry a longer gap still — six weeks for tomatoes, which is
indoor seedling time, not germination.

### Categories

15 categories exist in the crop data; recipes use 13 of them. `spicy` and
`fruit-vegetable` are carried on crops but no recipe asks for them.

| category | crops |
|---|---|
| cruciferous | 11 |
| cucurbit | 8 |
| leafy-greens | 8 |
| root-vegetable | 6 |
| nightshade, legume, starchy, allium | 5 each |
| fruit, herb | 3 each |
| starchy-root, perennial | 2 each |
| grain, fruit-vegetable, spicy | 1 each |

`starchy-root` is worth noticing: it is potato and sweet potato, and recipes hand
it 22–50% of the calorie target. In cold zones without a greenhouse, sweet
potato drops out and potato carries that share alone.

## recipes.json

```json
{
  "id": "diverse-garden",
  "name": "Diverse Garden Mix",
  "recipe_percentage": 0.45,
  "components": [
    { "category": "starchy-root", "calorie_share": 0.25 },
    { "category": "legume",       "calorie_share": 0.20 }
  ]
}
```

`recipe_percentage` is how much of the household's annual diet the recipe is
meant to cover; `calorie_share` splits that between categories and sums to 1.0.
Both are asserted in the data tests.
