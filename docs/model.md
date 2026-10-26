# How a plan is computed

Everything here lives in [`src/engine.js`](../src/engine.js). It is one pass, no
iteration and no optimization: a calorie target is divided into shares, each
share is divided by what one plant yields, and the result is rounded up. The
schedule is then read out of the crop data for the chosen zone.

## 1. The calorie target

```
annual calories = calories_per_person (2000) x household x 365
target          = annual calories x recipe_percentage x (supplementation% / 100)
```

`recipe_percentage` is the fraction of the household's diet the recipe claims to
cover — 0.25 for Salad & Greens Focus, 1.0 for All — Maximum Variety. It is a
property of the recipe, not something the user sets. The supplementation slider
is a second, independent multiplier the user does set.

So "household 4, Diverse Garden Mix, 100%" is `2000 x 4 x 365 x 0.45 x 1.0`, or
about 1.3M calories for the year.

## 2. Dividing the target between categories

Recipes do not name crops. They name categories with a `calorie_share`:

```json
{ "category": "starchy-root", "calorie_share": 0.25 }
```

The shares sum to 1.0 within a recipe. Alliums get 0.5–3% and herbs 0.1–1%
deliberately — garlic is a flavouring, and a recipe that gave it 20% of the
calories produced plans with well over a thousand garlic plants.

## 3. Choosing crops for a category

`selectPlantsForZone(category, zone, plants)` filters the 50 crops to those
carrying that category, scores each one, and drops anything the zone cannot
grow:

```
locationScore = outdoor 3 | greenhouse 2 | impossible 0
calorieYield  = calories_per_lb x yield_per_plant
totalScore    = locationScore x 10000 + calorieYield
```

The 10000 multiplier makes location a hard tiebreak: an outdoor-viable crop
always outranks one that needs a greenhouse, however many calories the
greenhouse crop would carry.

`calculatePlan` then takes the **top 3** and splits the category's share between
them in proportion to their calorie yield. Three, not one, so a plan has some
variety; proportional, not even, so the split does not hand a large share to a
crop that cannot carry it.

## 4. Plant counts and space

```
plant's share    = its calorie yield / sum of the 3 crops' calorie yields
calories needed  = target x calorie_share x plant's share
count            = ceil(calories needed / (yield_per_plant x calories_per_lb))
sqft             = count / plants_per_sqft
```

Space is square-foot gardening arithmetic — divide by the number of plants that
fit in a square foot, do not multiply by a spacing distance. See
[`data-model.md`](data-model.md) for the spacing tiers.

Because `count` is rounded up per crop, the summary's "percent filled" is always
slightly over 100%. It is an accounting identity, not a check that the plan
works.

## 5. Zone gating

Each crop declares three zone ranges in `growing_conditions`:

| | meaning |
|---|---|
| `outdoor_zones` | grows outdoors, unaided |
| `greenhouse_zones` | needs a greenhouse to grow at all |
| `impossible_zones` | will not grow, greenhouse or not |

`getGrowingLocation` checks them in that order — impossible first, then
outdoor, then greenhouse — and a zone matching nothing is impossible. Zone 1
and 2 are impossible for nearly everything in the database.

## 6. Schedules and the greenhouse

Schedules are weeks 1–52, not dates. Each crop carries a
`zone_adjusted_schedules` array keyed by zone range, with up to three variants
per range:

- `outdoor` — unaided
- `greenhouse_extended` — same crop, started earlier and harvested later
- `greenhouse_only` — the only schedule where the crop needs a greenhouse to
  exist at all

Which one `getPlantingSchedule` returns depends on the zone and whether a
greenhouse was entered:

| crop's location in this zone | greenhouse entered | schedule returned |
|---|---|---|
| outdoor, zone 3–6 | yes | `greenhouse_extended` |
| outdoor, zone 3–6 | no | `outdoor` |
| outdoor, zone 7+ | either | `outdoor` |
| greenhouse | yes | `greenhouse_only` |
| greenhouse | no | `null` — crop is dropped from the plan |

The zone 3–6 window on season extension (`shouldUseGreenhouseExtension`) is
deliberate. In zone 7 and warmer the outdoor season is already long enough that
a greenhouse mostly makes things too hot, so extension there would move planting
dates for no gain.

A crop can also carry **several windows** in one year — peas and fava beans have
a spring and a fall sowing. Those come back as an array and each window gets its
own successions.

## 7. Succession planting

`calculateSuccessionPlantings` walks forward from the first sowing in steps of
`succession_planting_weeks` (0 for 26 crops, 2 for 17, 3 for 7), stopping when a
new sowing could no longer mature and be harvested inside the window:

```
while seedWeek <= firstSeedWeek + window - ceil(days_to_maturity/7) - harvest_period_weeks
```

Each succession carries the same offsets as the first — the gap from sowing to
transplant, and from transplant to first harvest, are held constant and shifted.
Capped at 15 successions.

## 8. Greenhouse allocation

Season extension (above) is about *timing*. Allocation is about *space*, and
runs after every crop's count is known. `allocateGreenhouseSpace` is a two-phase
greedy fill of the square footage entered:

1. **Diversity.** Walk the crops in plan order and put 25% of each crop's count
   into the greenhouse while space lasts. A small greenhouse therefore holds a
   little of many crops rather than all of one.
2. **Priority.** Sort by `greenhouse_priority` (4 = tomatoes, peppers, cucumbers,
   basil; 1 = potatoes, onions, asparagus) and fill what remains, highest first.
3. **Remainder.** Everything not placed goes outdoors.

Invariant: for every crop, `greenhousePlants + outdoorPlants === count`, and
greenhouse square footage used never exceeds what was entered. Both are
asserted in [`test/greenhouse.test.mjs`](../test/greenhouse.test.mjs).
