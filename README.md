# Garden Planner

Pick a USDA zone, a diet, and how many people you are feeding. Get a crop list
with plant counts, the square footage it needs, and a 52-week sowing and harvest
schedule you can print.

**[greentheo.github.io/garden_planner](https://greentheo.github.io/garden_planner/)**

No build step, no dependencies, no server. Three ES modules, two JSON files and
a stylesheet, served as-is.

## The model

Calories drive everything. There is no optimizer and no search — it is one pass
of arithmetic, which is the honest shape of the problem once you accept the
input data as given.

1. **A target.** 2,000 calories per person per day for a year, times the
   recipe's `recipe_percentage` (how much of the diet it claims to cover — 0.25
   for Salad & Greens Focus, 1.0 for All — Maximum Variety), times the
   supplementation slider.
2. **Split between categories.** Recipes name *categories*, not crops:
   `starchy-root` 25%, `legume` 20%, and so on, summing to 1.0. Alliums are
   capped at 3% and herbs at 1%, because a recipe that gave garlic a fifth of the
   calories produced plans with over a thousand garlic plants.
3. **Crops chosen per category, by zone.** Each crop declares the zones it grows
   in outdoors, the zones where it needs a greenhouse, and the zones where it
   will not grow at all. Viable crops are ranked with location as a hard
   tiebreak over calorie yield, and the top three split the category's share in
   proportion to what they yield.
4. **Counts and space.** `count = ceil(calories needed / (yield_per_plant ×
   calories_per_lb))`, and `sqft = count / plants_per_sqft` — square-foot
   gardening densities, so sixteen carrots to the square foot and two square
   feet per melon.
5. **A schedule.** Weeks 1–52, read out of the crop's data for that zone, with
   repeat sowings stepped forward by the crop's succession interval until one
   would no longer have time to mature.
6. **Greenhouse space, if any.** Entered as square footage, filled in two
   passes: 25% of every crop first so a small greenhouse holds a little of many
   things, then the remainder by priority, tenderest first.

[`docs/model.md`](docs/model.md) is the same thing in full, with the decision
table for which schedule variant a zone gets.
[`docs/data-model.md`](docs/data-model.md) documents the crop and recipe files.

50 crops, 11 recipes, 15 categories, zones 1–11.

## Run it

```bash
git clone https://github.com/greentheo/garden_planner && cd garden_planner
python3 -m http.server 8000     # any static server; ES modules need http, not file://
```

Then open <http://localhost:8000>, pick Zone 5 / Diverse Garden Mix / household
4, and generate.

```bash
node --test                     # 59 tests, needs Node 18+
```

## What it does not know

The arithmetic is exact. Most of the inputs it multiplies are not, and several
of the model's simplifications will bite a real garden.

**Weeks, not frost dates.** The entire schedule is a week number from 1 to 52,
hand-authored per crop per zone band, with no frost date anywhere in the data. A
hardiness zone is a winter-minimum-temperature band, which is not the same thing
as a planting calendar: zone 7 runs from coastal Virginia to inland Oregon, and
the last-frost date between them differs by weeks. The UI even converts weeks to
month names at 4.33 weeks per month, which is a label, not a date. Treat every
week number as "about here in the season", and check it against a local frost
calendar before ordering seed.

**Yield is a single number per crop.** `yield_per_plant` is one figure for the
whole species — 15 lb for a tomato. Variety, soil, water, fertility, pruning and
weather move that by a factor of two or three in either direction, and the plan
has no way to express the spread. It will not tell you a plan is optimistic,
because it has no model of the thing that would make it optimistic.

**Nothing about soil, water, pests or disease.** No fertility, no pH, no
irrigation, no rotation, no companion planting, no blight, no squash vine borer,
no deer. A plan that says 83 tomatoes says nothing about what late blight will
do to them in August.

**Calories are not nutrition.** The target is calories, so the plan is balanced
for energy and nothing else. Protein, fat, vitamins and minerals are not
modelled. Nobody should eat a year from one of these plans.

**100% self-sufficiency is arithmetic, not advice.** The slider will happily
compute a plan that supplies a household's entire annual calorie intake from
vegetables. That is not how anyone eats, the storage and processing problem it
implies is not addressed, and the garden it describes is a job.

**The fill percentage always reads about 100%.** Counts are rounded up per crop,
so produced always exceeds needed. It is an accounting identity, not a check
that the plan works — and it is computed over the crops that survived zone
filtering, so a plan that silently dropped a whole category still reports
100.3%.

**Categories are lopsided, and dropped silently.** `starchy-root` is two crops,
potato and sweet potato, and recipes hand it 22–50% of the target; in a cold zone
without a greenhouse the sweet potato drops out and the potato carries that
share alone. When a zone can fill no crop in a category at all, the category
just vanishes from the plan with a console warning.

**Zone 11 is barely populated, and zones 1–2 are nearly empty.** The crop data
thins out at both ends. Zone 11 resolves schedules for only a handful of crops,
so most categories drop and a zone 11 plan is far smaller than it should be.
Zone 1 with no greenhouse produces an empty plan. The dropdown offers all eleven
zones anyway.

**A crop in two categories is counted twice.** Kale is both `cruciferous` and
`leafy-greens`, so a recipe asking for both lists it twice, with separate counts
and separate space.

**Garlic's schedule wraps and the calendar cannot say so.** It is planted in
autumn and harvested the following summer, so its data has a harvest week
earlier than its planting week. The Gantt chart draws it as though both happen
in one year. It is the only crop that does this, and
[a test holds that line](test/schedule.test.mjs).

**Seed links rot.** They point at category pages on three suppliers' sites and
were scraped, not negotiated. No affiliate relationship, no price or stock
information. See [`docs/seed-suppliers.md`](docs/seed-suppliers.md).

## Layout

```
index.html            the form and the results container
style.css
src/engine.js         the model — zone gating, counts, schedules, allocation
src/ui.js             tables, the calorie chart, the plot layout, the Gantt chart
src/app.js            form wiring
data/plants.json      50 crops: yields, densities, zone ranges, 52-week schedules
data/recipes.json     11 recipes: category calorie shares
test/                 node --test, no dependencies
scripts/              seed-supplier scrapers that regenerate seed_sources
docs/                 the model, the data files, the original spec
```

The page sends a Google Analytics event on each plan generated. Nothing else
leaves the browser; there is no account, no storage and no server to hold
anything.

## License

MIT — see [LICENSE](LICENSE).
