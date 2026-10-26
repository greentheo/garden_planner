// Repeat sowings: how many fit in a window, how far apart they sit, and that
// the last one still has time to mature and be picked.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSuccessionPlantings, getPlantingSchedule, calculatePlan } from '../src/engine.js';
import { plants, recipes, crop, quietly } from './helpers.mjs';

test('a crop with no succession interval is sown once', () => {
  const garlic = crop('Garlic');
  assert.equal(garlic.succession_planting_weeks, 0);

  const sowings = calculateSuccessionPlantings(garlic, getPlantingSchedule(garlic, 7, false));
  assert.equal(sowings.length, 1);
  assert.equal(sowings[0].succession_number, 1);
  assert.equal(sowings[0].is_succession, false);
});

test('repeat sowings sit exactly one interval apart', () => {
  const tomato = crop('Tomato');
  assert.equal(tomato.succession_planting_weeks, 2);

  const base = getPlantingSchedule(tomato, 7, false);
  const sowings = calculateSuccessionPlantings(tomato, base);

  assert.ok(sowings.length > 1, 'a 2-week succession crop produced a single sowing');
  assert.equal(sowings[0].seed_start_week, base.seed_start_week);
  assert.equal(sowings[0].is_succession, false);

  for (let i = 1; i < sowings.length; i++) {
    assert.equal(
      sowings[i].seed_start_week - sowings[i - 1].seed_start_week,
      tomato.succession_planting_weeks
    );
    assert.equal(sowings[i].succession_number, i + 1);
    assert.equal(sowings[i].is_succession, true);
  }
});

test('each sowing keeps the first one\'s offsets and stays inside the window', () => {
  const lettuce = crop('Lettuce');
  const base = getPlantingSchedule(lettuce, 7, false);
  const sowings = calculateSuccessionPlantings(lettuce, base);

  const toTransplant = base.transplant_week - base.seed_start_week;

  for (const s of sowings) {
    assert.equal(s.transplant_week - s.seed_start_week, toTransplant);
    assert.ok(s.first_harvest_week > s.transplant_week);
    assert.ok(s.last_harvest_week >= s.first_harvest_week);
    assert.ok(
      s.last_harvest_week <= base.last_harvest_week,
      `sowing ${s.succession_number} harvests past week ${base.last_harvest_week}`
    );
  }
});

test('the last sowing has time to mature before the window shuts', () => {
  // This is the whole point of the loop bound: a sowing too late to be picked
  // is worse than no sowing.
  for (const name of ['Tomato', 'Lettuce', 'Radish', 'Carrots', 'Spinach']) {
    const plant = crop(name);
    const base = getPlantingSchedule(plant, 7, false);
    const windows = Array.isArray(base) ? base : [base];

    for (const window of windows) {
      const sowings = calculateSuccessionPlantings(plant, window);
      const maturityWeeks = Math.ceil(plant.days_to_maturity / 7);
      const last = sowings[sowings.length - 1];
      assert.ok(
        last.seed_start_week + maturityWeeks <= window.last_harvest_week,
        `${name}: last sowing in week ${last.seed_start_week} cannot mature by week ${window.last_harvest_week}`
      );
    }
  }
});

test('a longer season fits more sowings than a short one', () => {
  const lettuce = crop('Lettuce');
  const short = getPlantingSchedule(lettuce, 4, false);
  const long = getPlantingSchedule(lettuce, 9, false);

  const shortSeason = short.last_harvest_week - short.seed_start_week;
  const longSeason = long.last_harvest_week - long.seed_start_week;
  assert.ok(longSeason > shortSeason, 'zone 9 does not have a longer lettuce season than zone 4');

  assert.ok(
    calculateSuccessionPlantings(lettuce, long).length >=
      calculateSuccessionPlantings(lettuce, short).length
  );
});

test('sowings are capped, whatever the window', () => {
  const absurd = {
    succession_planting_weeks: 1,
    harvest_period_weeks: 1,
    days_to_maturity: 7
  };
  const sowings = calculateSuccessionPlantings(absurd, {
    seed_start_week: 1,
    transplant_week: 1,
    first_harvest_week: 2,
    last_harvest_week: 52
  });
  assert.ok(sowings.length <= 15, `cap exceeded: ${sowings.length} sowings`);
});

test('a plan splits its plant count across the sowings it schedules', () => {
  const plan = quietly(() =>
    calculatePlan({ zone: 7, recipeId: 'diverse-garden', household: 4, plants, recipes })
  );

  for (const item of plan.items) {
    const sowings = item.successionSchedules.length;
    assert.ok(sowings > 0);
    assert.equal(item.plantsPerSuccession, Math.ceil(item.count / sowings));
    // Enough per sowing to cover the count once rounding is taken into account.
    assert.ok(item.plantsPerSuccession * sowings >= item.count);
  }
});
