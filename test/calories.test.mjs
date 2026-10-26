// The calorie target and the plant counts it produces.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePlan } from '../src/engine.js';
import { plants, recipes, ZONES, quietly } from './helpers.mjs';

const plan = (over = {}) =>
  quietly(() =>
    calculatePlan({ zone: 7, recipeId: 'diverse-garden', household: 4, plants, recipes, ...over })
  );

test('the target is 2000 calories a person a day, times the recipe\'s reach', () => {
  const recipe = recipes.find(r => r.id === 'diverse-garden');
  const p = plan();

  const expected = 2000 * 4 * 365 * recipe.recipe_percentage;
  // Shares sum to 1 across the recipe, so the per-crop needs add back up to the
  // target — less whatever a category the zone could not fill took with it.
  assert.ok(p.summary.totalCaloriesNeeded <= expected + 1);
  assert.ok(p.summary.totalCaloriesNeeded > expected * 0.9, 'a category dropped out of a zone 7 plan');
});

test('calories per person is a parameter, not a constant', () => {
  const normal = plan().summary.totalCaloriesNeeded;
  const hungry = plan({ caloriesPerPerson: 4000 }).summary.totalCaloriesNeeded;
  assert.ok(Math.abs(hungry / normal - 2) < 0.01, `ratio was ${hungry / normal}`);
});

test('a plant count is its calorie share divided by what one plant yields', () => {
  for (const item of plan().items) {
    const perPlant = item.plant.yield_per_plant * item.plant.calories_per_lb;
    assert.equal(item.plantCaloriesPerPlant, perPlant);
    assert.equal(item.count, Math.ceil(item.plantCaloriesNeeded / perPlant));
    assert.equal(item.totalCaloriesProduced, item.count * perPlant);
    assert.equal(item.totalPounds, item.count * item.plant.yield_per_plant);
    assert.ok(item.count >= 1);
  }
});

test('rounding up means a plan always covers its target, never undershoots it', () => {
  for (const zone of ZONES) {
    for (const recipe of recipes) {
      const p = plan({ zone, recipeId: recipe.id });
      if (p.items.length === 0) continue;
      assert.ok(
        p.summary.totalCaloriesProduced >= p.summary.totalCaloriesNeeded,
        `zone ${zone} ${recipe.id} undershoots its own target`
      );
      const filled = Number(p.summary.percentFilled);
      assert.ok(filled >= 100 && filled < 110, `zone ${zone} ${recipe.id} filled ${filled}%`);
    }
  }
});

test('the supplementation slider scales the whole plan', () => {
  const full = plan({ foodSupplementationPercent: 100 });
  const half = plan({ foodSupplementationPercent: 50 });
  const tenth = plan({ foodSupplementationPercent: 10 });

  assert.ok(Math.abs(half.summary.totalCaloriesNeeded / full.summary.totalCaloriesNeeded - 0.5) < 0.01);
  assert.ok(Math.abs(tenth.summary.totalCaloriesNeeded / full.summary.totalCaloriesNeeded - 0.1) < 0.01);

  // Counts follow, within the per-crop rounding.
  assert.ok(half.summary.totalPlants < full.summary.totalPlants);
  assert.ok(tenth.summary.totalPlants < half.summary.totalPlants);
  assert.ok(half.summary.totalPlants / full.summary.totalPlants < 0.6);

  // Scaling down must not cost variety — the same crops, fewer of each.
  assert.equal(half.items.length, full.items.length);
  assert.equal(tenth.items.length, full.items.length);
  assert.equal(full.foodSupplementationPercent, 100);
});

test('each category gets the share of calories its recipe asked for', () => {
  const recipe = recipes.find(r => r.id === 'diverse-garden');
  const p = plan();

  for (const comp of recipe.components) {
    const items = p.items.filter(i => i.category === comp.category);
    if (items.length === 0) continue;

    const needed = items.reduce((sum, i) => sum + i.plantCaloriesNeeded, 0);
    const expected = 2000 * 4 * 365 * recipe.recipe_percentage * comp.calorie_share;
    assert.ok(
      Math.abs(needed / expected - 1) < 0.01,
      `${comp.category}: wanted ${expected}, divided up ${needed}`
    );

    // At most three crops per category, split by calorie density.
    assert.ok(items.length <= 3, `${comp.category} drew ${items.length} crops`);
  }
});

test('alliums and herbs stay flavourings', () => {
  // A recipe that gave garlic a fifth of the calories produced plans with over
  // a thousand garlic plants. Shares are capped in the data; this holds them.
  for (const recipe of recipes) {
    for (const comp of recipe.components) {
      if (comp.category === 'allium') {
        assert.ok(comp.calorie_share <= 0.03, `${recipe.id} gives alliums ${comp.calorie_share}`);
      }
      if (comp.category === 'herb') {
        assert.ok(comp.calorie_share <= 0.01, `${recipe.id} gives herbs ${comp.calorie_share}`);
      }
    }
  }

  const garlic = plan({ recipeId: 'mediterranean' }).items.find(i => i.plant.name === 'Garlic');
  if (garlic) assert.ok(garlic.count < 300, `${garlic.count} garlic plants for a household of four`);
});

test('summary totals agree with the items they came from', () => {
  const p = plan({ zone: 5, recipeId: 'all' });
  const sum = f => p.items.reduce((acc, i) => acc + f(i), 0);

  assert.equal(p.summary.totalPlants, sum(i => i.count));
  assert.ok(Math.abs(p.summary.totalYield - sum(i => i.totalPounds)) < 1e-6);
  assert.ok(Math.abs(p.summary.totalCaloriesProduced - sum(i => i.totalCaloriesProduced)) < 1e-6);
  assert.ok(
    Math.abs(p.summary.avgCaloriesPerLb - p.summary.totalCaloriesProduced / p.summary.totalYield) < 1e-6
  );
});

test('an empty plan reports zeroes rather than NaN', () => {
  // Zone 1 can grow nothing without a greenhouse, and the summary still has to
  // be renderable.
  const p = quietly(() =>
    calculatePlan({ zone: 1, recipeId: 'diverse-garden', household: 4, plants, recipes })
  );
  assert.equal(p.items.length, 0);
  assert.equal(p.summary.totalPlants, 0);
  assert.equal(p.gardenSize, 0);
  assert.ok(Number.isFinite(Number(p.summary.percentFilled)), `percentFilled was ${p.summary.percentFilled}`);
  assert.ok(Number.isFinite(p.summary.avgCaloriesPerLb));
});
