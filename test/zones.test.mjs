// Zone gating: which crops a zone can grow, and the agreement between a crop's
// declared zone ranges and the schedules it actually carries.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getGrowingLocation,
  getPlantingSchedule,
  selectPlantsForZone,
  calculatePlan
} from '../src/engine.js';
import { plants, recipes, ZONES, crop, quietly } from './helpers.mjs';

test('a crop grows outdoors, under glass or not at all, by zone', () => {
  const tomato = crop('Tomato');
  assert.equal(getGrowingLocation(tomato, 7), 'outdoor');
  assert.equal(getGrowingLocation(tomato, 5), 'outdoor');
  assert.equal(getGrowingLocation(tomato, 3), 'greenhouse');
  assert.equal(getGrowingLocation(tomato, 2), 'impossible');
  assert.equal(getGrowingLocation(tomato, 1), 'impossible');

  // Kale is cold-hardy all the way down; no greenhouse needed in zone 3.
  assert.equal(getGrowingLocation(crop('Kale'), 3), 'outdoor');
});

test('impossible_zones wins over an overlapping outdoor range', () => {
  // The check order matters: a zone listed as impossible must not be rescued by
  // falling inside outdoor_zones or greenhouse_zones.
  const fake = {
    growing_conditions: {
      outdoor_zones: { min: 1, max: 11 },
      greenhouse_zones: { min: 1, max: 11 },
      impossible_zones: [4]
    }
  };
  assert.equal(getGrowingLocation(fake, 4), 'impossible');
  assert.equal(getGrowingLocation(fake, 5), 'outdoor');
});

test('every crop viable in a zone has a schedule for it, and vice versa', () => {
  // The two halves of the crop data are maintained by hand and can drift apart.
  // A crop that getGrowingLocation says is viable but getPlantingSchedule has
  // no window for gets silently dropped from the plan.
  const drift = [];
  for (const plant of plants) {
    for (const zone of ZONES) {
      const viable = getGrowingLocation(plant, zone) !== 'impossible';
      const scheduled = getPlantingSchedule(plant, zone, true) !== null;
      if (viable !== scheduled) {
        drift.push(`${plant.name} zone ${zone}: viable=${viable} scheduled=${scheduled}`);
      }
    }
  }
  assert.deepEqual(drift, []);
});

test('selectPlantsForZone drops what the zone cannot grow and ranks outdoor first', () => {
  const zone3 = selectPlantsForZone('nightshade', 3, plants);
  const zone7 = selectPlantsForZone('nightshade', 7, plants);

  // All five nightshades need a greenhouse in zone 3 and none does in zone 7.
  assert.ok(zone3.length > 0);
  assert.ok(zone3.every(p => p.location === 'greenhouse'));
  assert.ok(zone7.every(p => p.location === 'outdoor'));
  assert.ok(zone7.length >= zone3.length);

  // Scoring puts location ahead of calories, always.
  const mixed = selectPlantsForZone('cucurbit', 4, plants);
  const firstGreenhouse = mixed.findIndex(p => p.location === 'greenhouse');
  const lastOutdoor = mixed.map(p => p.location).lastIndexOf('outdoor');
  if (firstGreenhouse !== -1 && lastOutdoor !== -1) {
    assert.ok(lastOutdoor < firstGreenhouse, 'a greenhouse crop outranked an outdoor one');
  }

  // Within one location band, higher calorie yield ranks higher.
  const band = zone7.filter(p => p.location === 'outdoor');
  for (let i = 1; i < band.length; i++) {
    assert.ok(band[i - 1].calorieYield >= band[i].calorieYield);
  }

  assert.deepEqual(selectPlantsForZone('nightshade', 1, plants), []);
});

test('no plan ever includes a crop the zone cannot grow', () => {
  for (const zone of ZONES) {
    for (const recipe of recipes) {
      const plan = quietly(() =>
        calculatePlan({ zone, recipeId: recipe.id, household: 4, plants, recipes, greenhouseSqft: 300 })
      );
      for (const item of plan.items) {
        assert.notEqual(
          getGrowingLocation(item.plant, zone),
          'impossible',
          `${item.plant.name} is impossible in zone ${zone} but appears in the ${recipe.id} plan`
        );
      }
    }
  }
});

test('an unknown recipe id is an error, not an empty plan', () => {
  assert.throws(
    () => calculatePlan({ zone: 5, recipeId: 'no-such-recipe', household: 4, plants, recipes }),
    /Recipe not found/
  );
});

test('zone 5 Diverse Garden Mix fills every category in the recipe', () => {
  // The combination the README tells people to try. If a category drops out of
  // this one, the data has regressed.
  const recipe = recipes.find(r => r.id === 'diverse-garden');
  const plan = quietly(() =>
    calculatePlan({ zone: 5, recipeId: 'diverse-garden', household: 4, plants, recipes })
  );
  const filled = new Set(plan.items.map(i => i.category));
  for (const comp of recipe.components) {
    assert.ok(filled.has(comp.category), `category ${comp.category} dropped out of the zone 5 plan`);
  }
});
