// Greenhouse space allocation: diversity pass, then priority fill, then
// everything left over goes outdoors.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePlan } from '../src/engine.js';
import { plants, recipes, quietly } from './helpers.mjs';

const plan = (greenhouseSqft, over = {}) =>
  quietly(() =>
    calculatePlan({
      zone: 5,
      recipeId: 'diverse-garden',
      household: 4,
      plants,
      recipes,
      greenhouseSqft,
      ...over
    })
  );

test('with no greenhouse, every plant is outdoors', () => {
  const p = plan(0);
  assert.equal(p.greenhouseSqftUsed, 0);
  assert.equal(p.greenhouseAllocation.used, 0);
  assert.equal(p.greenhouseAllocation.utilization, 0);

  for (const item of p.items) {
    assert.equal(item.greenhousePlants, 0);
    assert.equal(item.greenhouseSqft, 0);
    assert.equal(item.outdoorPlants, item.count);
    assert.equal(item.outdoorSqft, item.sqft);
  }
  assert.equal(p.outdoorSqFt, p.gardenSize);
});

test('allocation conserves plants and space', () => {
  // The invariant that matters: a plant is in one place or the other, never
  // both, never neither.
  for (const sqft of [10, 50, 200, 500, 2000, 10000]) {
    const p = plan(sqft);

    for (const item of p.items) {
      assert.equal(
        item.greenhousePlants + item.outdoorPlants,
        item.count,
        `${item.plant.name} at ${sqft} sqft: ${item.greenhousePlants} + ${item.outdoorPlants} != ${item.count}`
      );
      assert.ok(item.greenhousePlants >= 0 && item.outdoorPlants >= 0);
      assert.ok(Math.abs(item.greenhouseSqft - item.greenhousePlants / item.plant.plants_per_sqft) < 1e-9);
      assert.ok(Math.abs(item.outdoorSqft - item.outdoorPlants / item.plant.plants_per_sqft) < 1e-9);
    }

    const ghPlants = p.items.reduce((s, i) => s + i.greenhousePlants, 0);
    const outPlants = p.items.reduce((s, i) => s + i.outdoorPlants, 0);
    assert.equal(ghPlants + outPlants, p.summary.totalPlants, `at ${sqft} sqft`);
  }
});

test('allocation never overfills the greenhouse', () => {
  for (const sqft of [10, 50, 200, 500, 2000]) {
    const p = plan(sqft);
    assert.ok(
      p.greenhouseSqftUsed <= sqft + 1e-9,
      `used ${p.greenhouseSqftUsed} of ${sqft} available`
    );
    assert.equal(p.greenhouseSqftAvailable, sqft);
    assert.ok(p.greenhouseAllocation.utilization <= 100 + 1e-9);
    assert.ok(Math.abs(p.greenhouseAllocation.used - p.greenhouseSqftUsed) < 1e-6);
  }
});

test('a small greenhouse holds a little of many crops, not all of one', () => {
  // The diversity pass exists for this. 25% of each crop goes in first, so a
  // 200 sqft greenhouse should be spread over several crops.
  const p = plan(200);
  const occupants = p.items.filter(i => i.greenhousePlants > 0);
  assert.ok(occupants.length >= 5, `only ${occupants.length} crops made it into 200 sqft`);

  const fullyInside = p.items.filter(i => i.greenhousePlants === i.count && i.count > 1);
  assert.ok(
    fullyInside.length < occupants.length,
    'a small greenhouse was filled entirely by whole crops'
  );

  // 200 sqft against a garden several times that size: the diversity pass runs
  // out of room before the priority pass gets a turn, so each crop that made it
  // in should hold roughly its quarter and no more.
  assert.ok(p.gardenSize > 3 * 200, 'test assumes the garden dwarfs the greenhouse');
  for (const item of occupants) {
    const inside = item.greenhousePlants / item.count;
    assert.ok(
      inside <= 0.3,
      `${item.plant.name} took ${(inside * 100).toFixed(0)}% of its count into a greenhouse ` +
        'that cannot hold a quarter of the garden'
    );
  }
});

test('a greenhouse large enough takes the whole garden', () => {
  const p = plan(100000);
  for (const item of p.items) {
    assert.equal(item.outdoorPlants, 0, `${item.plant.name} left outdoors`);
  }
  assert.equal(p.outdoorSqFt, 0);
  assert.ok(Math.abs(p.greenhouseSqftUsed - p.gardenSize) < 1e-6);
});

test('the priority fill favours tender crops once diversity is served', () => {
  // Priority 4 is tomatoes, peppers, cucumbers, basil. Priority 1 is potatoes,
  // onions, asparagus. With space to spare beyond the diversity pass, the
  // high-priority crops should be further inside than the low-priority ones.
  const p = plan(600);

  const share = item => item.greenhousePlants / item.count;
  const high = p.items.filter(i => (i.plant.greenhouse_priority || 1) === 4);
  const low = p.items.filter(i => (i.plant.greenhouse_priority || 1) === 1);

  assert.ok(high.length > 0 && low.length > 0, 'test needs both priority bands present');
  const avg = items => items.reduce((s, i) => s + share(i), 0) / items.length;
  assert.ok(
    avg(high) > avg(low),
    `priority 4 crops averaged ${avg(high)} inside, priority 1 averaged ${avg(low)}`
  );
});

test('more greenhouse space is never less greenhouse space', () => {
  let previous = -1;
  for (const sqft of [0, 10, 50, 100, 200, 500, 1000]) {
    const used = plan(sqft).greenhouseSqftUsed;
    assert.ok(used >= previous - 1e-9, `${sqft} sqft used ${used}, less than the step before`);
    previous = used;
  }
});

test('a greenhouse too small for one plant of anything stays empty', () => {
  // A tenth of a square foot cannot hold a whole plant of any crop; the floor
  // in the allocator has to round to nobody rather than a fraction of a plant.
  const p = plan(0.01);
  const placed = p.items.reduce((s, i) => s + i.greenhousePlants, 0);
  assert.equal(placed, 0, `${placed} plants squeezed into a hundredth of a square foot`);
  for (const item of p.items) {
    assert.ok(Number.isInteger(item.greenhousePlants));
  }
});

test('greenhouse plant counts are whole plants', () => {
  for (const sqft of [37, 123, 456]) {
    for (const item of plan(sqft).items) {
      assert.ok(Number.isInteger(item.greenhousePlants), `${item.plant.name}: ${item.greenhousePlants}`);
      assert.ok(Number.isInteger(item.outdoorPlants), `${item.plant.name}: ${item.outdoorPlants}`);
    }
  }
});
