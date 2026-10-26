// Square footage. The field is plants PER square foot, so space is a division;
// multiplying instead once produced plans of roughly three quarters of an acre
// for a household of four.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePlan } from '../src/engine.js';
import { plants, recipes, ZONES, crop, quietly } from './helpers.mjs';

const CLOSE = 1e-9;

test('a crop\'s space is its count divided by its density', () => {
  const plan = quietly(() =>
    calculatePlan({ zone: 5, recipeId: 'diverse-garden', household: 4, plants, recipes })
  );
  assert.ok(plan.items.length > 0);

  for (const item of plan.items) {
    assert.equal(item.sqft, item.count / item.plant.plants_per_sqft);
    assert.ok(item.sqft > 0);
    // Footprint per plant is the reciprocal of the density, so the vining crops
    // at 0.5/sqft take two square feet each and the root crops at 16 take a
    // sixteenth.
    assert.ok(
      Math.abs(item.sqft / item.count - 1 / item.plant.plants_per_sqft) < CLOSE,
      `${item.plant.name}: ${item.count} plants in ${item.sqft} sqft at ${item.plant.plants_per_sqft}/sqft`
    );
  }

  // And a denser crop really does use less room per plant.
  const footprint = name => {
    const it = plan.items.find(i => i.plant.name === name);
    return it ? it.sqft / it.count : null;
  };
  const carrots = footprint('Carrots');
  const tomato = footprint('Tomato');
  if (carrots !== null && tomato !== null) assert.ok(carrots < tomato);
});

test('the density tiers hold against the square-foot gardening guide', () => {
  // https://squarefootgardening.org/2024/02/square-foot-spacing/
  const expected = {
    Tomato: 1, 'Bell Pepper': 1, Broccoli: 1, Cabbage: 1,
    Lettuce: 4, Potato: 4, Corn: 4,
    Peas: 8,
    Spinach: 9, 'Green Beans': 9, Beets: 9,
    Carrots: 16, Onions: 16, Garlic: 16, Radish: 16,
    Cucumbers: 0.5, Watermelon: 0.5, Pumpkin: 0.5
  };
  for (const [name, density] of Object.entries(expected)) {
    assert.equal(crop(name).plants_per_sqft, density, `${name} density changed`);
  }
});

test('one plant per square foot means one square foot per plant', () => {
  const plan = quietly(() =>
    calculatePlan({ zone: 7, recipeId: 'mediterranean', household: 4, plants, recipes })
  );
  const tomato = plan.items.find(i => i.plant.name === 'Tomato');
  assert.ok(tomato, 'no tomatoes in a zone 7 mediterranean plan');
  assert.equal(tomato.plant.plants_per_sqft, 1);
  assert.equal(tomato.sqft, tomato.count);

  // Sixteen carrots to the square foot.
  const carrots = plan.items.find(i => i.plant.name === 'Carrots');
  if (carrots) assert.ok(Math.abs(carrots.sqft * 16 - carrots.count) < CLOSE);
});

test('the plan total is the sum of its parts, indoors plus out', () => {
  for (const greenhouseSqft of [0, 200, 2000]) {
    const plan = quietly(() =>
      calculatePlan({ zone: 5, recipeId: 'all', household: 4, plants, recipes, greenhouseSqft })
    );

    const perItem = plan.items.reduce((sum, i) => sum + i.outdoorSqft + i.greenhouseSqft, 0);
    assert.ok(Math.abs(plan.gardenSize - perItem) < 1e-6, `greenhouse ${greenhouseSqft}`);
    assert.ok(Math.abs(plan.gardenSize - (plan.outdoorSqFt + plan.greenhouseSqftUsed)) < 1e-6);

    // Allocation moves plants between the two, it does not create or lose space.
    const nominal = plan.items.reduce((sum, i) => sum + i.sqft, 0);
    assert.ok(Math.abs(plan.gardenSize - nominal) < 1e-6, 'space appeared or vanished in allocation');
  }
});

test('a plan for four people is a plausible size, not a quarter section', () => {
  // The guard on the bug this arithmetic replaced. Household of four on the
  // default recipe should land in hundreds or low thousands of square feet,
  // nowhere near the ~32,000 the multiplying version produced.
  const plan = quietly(() =>
    calculatePlan({ zone: 5, recipeId: 'diverse-garden', household: 4, plants, recipes })
  );
  assert.ok(plan.gardenSize > 100, `implausibly small: ${plan.gardenSize} sqft`);
  assert.ok(plan.gardenSize < 5000, `implausibly large: ${plan.gardenSize} sqft`);
});

test('space scales with the household', () => {
  const size = household =>
    quietly(() => calculatePlan({ zone: 5, recipeId: 'diverse-garden', household, plants, recipes }))
      .gardenSize;

  const one = size(1);
  const four = size(4);
  const eight = size(8);

  assert.ok(four > one);
  assert.ok(eight > four);
  // Rounding each crop's count up means the ratio is near but not exactly 2.
  assert.ok(eight / four > 1.9 && eight / four < 2.1, `8/4 ratio was ${eight / four}`);
});

test('every zone and recipe yields finite, positive space', () => {
  for (const zone of ZONES) {
    for (const recipe of recipes) {
      const plan = quietly(() =>
        calculatePlan({ zone, recipeId: recipe.id, household: 4, plants, recipes })
      );
      assert.ok(Number.isFinite(plan.gardenSize), `zone ${zone} ${recipe.id}: ${plan.gardenSize}`);
      assert.ok(plan.gardenSize > 0, `zone ${zone} ${recipe.id} needs no space at all`);
    }
  }
});
