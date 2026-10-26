// The two data files are hand-maintained and the engine trusts them completely,
// so their shape is checked here rather than defended against at runtime.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plants, recipes, ZONES, everyWindow } from './helpers.mjs';

test('every crop carries the fields the engine reads', () => {
  const required = [
    'id', 'name', 'category', 'yield_per_plant', 'calories_per_lb',
    'days_to_maturity', 'harvest_period_weeks', 'succession_planting_weeks',
    'plants_per_sqft', 'greenhouse_priority', 'growing_conditions',
    'zone_adjusted_schedules'
  ];

  for (const plant of plants) {
    for (const field of required) {
      assert.ok(field in plant, `${plant.name || plant.id} is missing ${field}`);
    }
    assert.equal(typeof plant.name, 'string');
    assert.ok(Array.isArray(plant.category) && plant.category.length > 0, plant.name);
    assert.ok(plant.yield_per_plant > 0, `${plant.name} yields ${plant.yield_per_plant} lb`);
    assert.ok(plant.calories_per_lb > 0, `${plant.name} has ${plant.calories_per_lb} cal/lb`);
    assert.ok(plant.days_to_maturity > 0, plant.name);
    assert.ok(plant.harvest_period_weeks > 0, plant.name);
    assert.ok(plant.succession_planting_weeks >= 0, plant.name);
    assert.ok(plant.plants_per_sqft > 0, `${plant.name} fits ${plant.plants_per_sqft} per sqft`);
    assert.ok(
      plant.greenhouse_priority >= 1 && plant.greenhouse_priority <= 4,
      `${plant.name} has greenhouse priority ${plant.greenhouse_priority}`
    );
  }
});

test('crop ids and names are unique', () => {
  assert.equal(new Set(plants.map(p => p.id)).size, plants.length);
  assert.equal(new Set(plants.map(p => p.name)).size, plants.length);
});

test('growing conditions are coherent ranges', () => {
  for (const plant of plants) {
    const { outdoor_zones, greenhouse_zones, impossible_zones } = plant.growing_conditions;

    for (const [label, range] of [['outdoor', outdoor_zones], ['greenhouse', greenhouse_zones]]) {
      assert.ok(range, `${plant.name} has no ${label} range`);
      assert.ok(range.min <= range.max, `${plant.name} ${label} range ${range.min}-${range.max}`);
      assert.ok(range.min >= 1 && range.max <= 11, `${plant.name} ${label} range out of zones 1-11`);
    }

    // A zone cannot be both impossible and growable.
    for (const zone of impossible_zones || []) {
      const inOutdoor = zone >= outdoor_zones.min && zone <= outdoor_zones.max;
      assert.ok(!inOutdoor, `${plant.name}: zone ${zone} is both impossible and outdoor`);
    }

    // Greenhouse zones are for crops the zone cannot grow unaided, so the two
    // ranges should not overlap.
    const overlap = ZONES.filter(
      z =>
        z >= outdoor_zones.min && z <= outdoor_zones.max &&
        z >= greenhouse_zones.min && z <= greenhouse_zones.max
    );
    assert.deepEqual(overlap, [], `${plant.name} lists zones as both outdoor and greenhouse-only`);
  }
});

test('schedule zone ranges do not overlap each other', () => {
  // getPlantingSchedule takes the first range that matches, so an overlap would
  // make one of the two unreachable.
  for (const plant of plants) {
    const ranges = plant.zone_adjusted_schedules.map(s => s.zone_range);
    for (const [min, max] of ranges) {
      assert.ok(min <= max, `${plant.name} has range ${min}-${max}`);
    }
    for (let zone = 1; zone <= 11; zone++) {
      const matches = ranges.filter(([min, max]) => zone >= min && zone <= max);
      assert.ok(matches.length <= 1, `${plant.name} zone ${zone} matches ${matches.length} ranges`);
    }
  }
});

test('every schedule set offers a variant the engine can use', () => {
  for (const plant of plants) {
    for (const set of plant.zone_adjusted_schedules) {
      const has = ['outdoor', 'greenhouse_only', 'greenhouse_extended'].filter(k => set[k]);
      assert.ok(
        has.length > 0,
        `${plant.name} zones ${set.zone_range.join('-')} has no schedule at all`
      );
      // greenhouse_extended is an upgrade on an outdoor schedule and makes no
      // sense without one.
      if (set.greenhouse_extended) {
        assert.ok(
          set.outdoor,
          `${plant.name} zones ${set.zone_range.join('-')} is extended with nothing to extend`
        );
      }
    }
  }
});

test('every schedule window has all four weeks', () => {
  for (const plant of plants) {
    for (const { window, kind, zone_range } of everyWindow(plant)) {
      for (const field of ['seed_start_week', 'transplant_week', 'first_harvest_week', 'last_harvest_week']) {
        assert.equal(
          typeof window[field],
          'number',
          `${plant.name} zones ${zone_range.join('-')} ${kind} has no ${field}`
        );
      }
      assert.ok(
        window.last_harvest_week > window.first_harvest_week,
        `${plant.name} zones ${zone_range.join('-')} ${kind} has a zero-length harvest`
      );
    }
  }
});

test('multiple_windows and array schedules agree', () => {
  for (const plant of plants) {
    const hasArray = plant.zone_adjusted_schedules.some(set =>
      ['outdoor', 'greenhouse_only', 'greenhouse_extended'].some(k => Array.isArray(set[k]))
    );
    assert.equal(
      Boolean(plant.multiple_windows),
      hasArray,
      `${plant.name}: multiple_windows=${plant.multiple_windows} but array schedules=${hasArray}`
    );
  }
});

test('every recipe splits a whole diet into shares that sum to one', () => {
  for (const recipe of recipes) {
    assert.ok(recipe.id && recipe.name, JSON.stringify(recipe).slice(0, 60));
    assert.ok(
      recipe.recipe_percentage > 0 && recipe.recipe_percentage <= 1,
      `${recipe.id} claims ${recipe.recipe_percentage} of the diet`
    );
    assert.ok(recipe.components.length > 0, recipe.id);

    const total = recipe.components.reduce((s, c) => s + c.calorie_share, 0);
    assert.ok(Math.abs(total - 1) < 0.001, `${recipe.id} shares sum to ${total}`);

    for (const comp of recipe.components) {
      assert.ok(comp.calorie_share > 0, `${recipe.id} ${comp.category} has share ${comp.calorie_share}`);
    }
    const categories = recipe.components.map(c => c.category);
    assert.equal(new Set(categories).size, categories.length, `${recipe.id} repeats a category`);
  }
  assert.equal(new Set(recipes.map(r => r.id)).size, recipes.length);
});

test('every category a recipe asks for exists on some crop', () => {
  const known = new Set(plants.flatMap(p => p.category));
  for (const recipe of recipes) {
    for (const comp of recipe.components) {
      assert.ok(known.has(comp.category), `${recipe.id} wants ${comp.category}, no crop has it`);
    }
  }
});

test('every crop links to at least one seed supplier', () => {
  const suppliers = {};
  for (const plant of plants) {
    assert.ok(
      Array.isArray(plant.seed_sources) && plant.seed_sources.length > 0,
      `${plant.name} has no seed sources`
    );
    for (const source of plant.seed_sources) {
      assert.ok(source.supplier, `${plant.name} has a source with no supplier`);
      assert.match(source.category_url, /^https:\/\//, `${plant.name} ${source.supplier}`);
      suppliers[source.supplier] = (suppliers[source.supplier] || 0) + 1;
    }
  }
  // Documented coverage in docs/seed-suppliers.md.
  assert.equal(suppliers["Johnny's Selected Seeds"], 50);
  assert.equal(suppliers['Hoss Tools'], 49);
  assert.equal(suppliers['Burpee'], 48);
});
