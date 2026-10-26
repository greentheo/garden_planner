// Which of a crop's schedule variants a zone gets, and whether a greenhouse
// changes it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getPlantingSchedule,
  shouldUseGreenhouseExtension,
  calculatePlan
} from '../src/engine.js';
import { plants, recipes, ZONES, crop, quietly, everyWindow } from './helpers.mjs';

test('season extension applies in zones 3-6 and nowhere else', () => {
  // Warmer than 6 and the outdoor season is already long enough that a
  // greenhouse mostly makes things too hot.
  for (const zone of [3, 4, 5, 6]) {
    assert.equal(shouldUseGreenhouseExtension(zone), true, `zone ${zone}`);
  }
  for (const zone of [1, 2, 7, 8, 9, 10, 11]) {
    assert.equal(shouldUseGreenhouseExtension(zone), false, `zone ${zone}`);
  }
});

test('a greenhouse moves a cool-zone schedule earlier and holds it later', () => {
  const tomato = crop('Tomato');

  const outdoor = getPlantingSchedule(tomato, 5, false);
  const extended = getPlantingSchedule(tomato, 5, true);

  assert.equal(outdoor.location, 'outdoor');
  assert.equal(outdoor.is_extended, false);
  assert.equal(extended.location, 'greenhouse-extended');
  assert.equal(extended.is_extended, true);

  assert.ok(extended.seed_start_week < outdoor.seed_start_week);
  assert.ok(extended.transplant_week < outdoor.transplant_week);
  assert.ok(extended.first_harvest_week < outdoor.first_harvest_week);
  assert.ok(extended.last_harvest_week > outdoor.last_harvest_week);

  const outdoorSeason = outdoor.last_harvest_week - outdoor.first_harvest_week;
  const extendedSeason = extended.last_harvest_week - extended.first_harvest_week;
  assert.ok(extendedSeason > outdoorSeason, 'extension did not lengthen the harvest');
});

test('a greenhouse changes nothing in zone 7 and warmer', () => {
  const tomato = crop('Tomato');
  for (const zone of [7, 8, 9]) {
    const without = getPlantingSchedule(tomato, zone, false);
    const to = getPlantingSchedule(tomato, zone, true);
    assert.equal(to.location, 'outdoor');
    assert.deepEqual(to, without, `zone ${zone} schedule shifted for no reason`);
  }
});

test('a crop that needs glass is dropped when there is no greenhouse', () => {
  const tomato = crop('Tomato');

  // Zone 3 is inside tomato's greenhouse_zones, so there is no outdoor variant
  // to fall back to.
  const underGlass = getPlantingSchedule(tomato, 3, true);
  assert.equal(underGlass.location, 'greenhouse');
  assert.equal(getPlantingSchedule(tomato, 3, false), null);
});

test('the greenhouse toggle changes which crops reach the plan', () => {
  const args = { zone: 3, recipeId: 'diverse-garden', household: 4, plants, recipes };

  const outdoorOnly = quietly(() => calculatePlan({ ...args, greenhouseSqft: 0 }));
  const withGlass = quietly(() => calculatePlan({ ...args, greenhouseSqft: 400 }));

  const names = plan => new Set(plan.items.map(i => i.plant.name));
  const gained = [...names(withGlass)].filter(n => !names(outdoorOnly).has(n));

  assert.ok(withGlass.items.length > outdoorOnly.items.length);
  assert.ok(gained.includes('Tomato'), `greenhouse did not unlock tomatoes, gained: ${gained}`);

  // Nothing the outdoor-only plan could grow should vanish once glass exists.
  for (const name of names(outdoorOnly)) {
    assert.ok(names(withGlass).has(name), `${name} disappeared when a greenhouse was added`);
  }

  // And in zone 3 the greenhouse should also shift the outdoor crops earlier.
  const kaleOutdoor = outdoorOnly.items.find(i => i.plant.name === 'Kale');
  const kaleGlass = withGlass.items.find(i => i.plant.name === 'Kale');
  if (kaleOutdoor && kaleGlass) {
    assert.ok(kaleGlass.schedule.seed_start_week <= kaleOutdoor.schedule.seed_start_week);
  }
});

test('peas and fava beans carry a spring and a fall window', () => {
  for (const name of ['Peas', 'Fava Beans']) {
    const windows = getPlantingSchedule(crop(name), 7, false);
    assert.ok(Array.isArray(windows), `${name} should return an array of windows`);
    assert.equal(windows.length, 2);
    const [spring, fall] = windows;
    assert.ok(spring.seed_start_week < fall.seed_start_week);
    assert.ok(spring.last_harvest_week < fall.seed_start_week, `${name} windows overlap`);
  }

  const plan = quietly(() =>
    calculatePlan({ zone: 7, recipeId: 'spring-fresh', household: 4, plants, recipes })
  );
  const peas = plan.items.find(i => i.plant.name === 'Peas');
  assert.ok(peas, 'peas missing from a spring greens plan in zone 7');
  assert.equal(peas.hasMultipleWindows, true);
  // Both windows have to contribute sowings, not just the first.
  const sowings = peas.successionSchedules.map(s => s.seed_start_week);
  assert.ok(Math.max(...sowings) - Math.min(...sowings) > 20, 'only one window produced sowings');
});

test('every schedule window runs sow -> transplant -> harvest inside one year', () => {
  // Garlic is the one documented exception: it is sown in autumn and harvested
  // the following summer, which a 52-week calendar cannot express, so its
  // harvest weeks sit before its planting weeks.
  const overwintering = new Set(['Garlic']);
  const problems = [];

  for (const plant of plants) {
    for (const { window: w, kind, zone_range } of everyWindow(plant)) {
      const where = `${plant.name} zones ${zone_range.join('-')} ${kind}`;
      for (const [field, value] of Object.entries(w)) {
        if (field.endsWith('_week') && (value < 1 || value > 52)) {
          problems.push(`${where}: ${field}=${value} outside weeks 1-52`);
        }
      }
      if (w.seed_start_week > w.transplant_week) {
        problems.push(`${where}: sown week ${w.seed_start_week} after transplant week ${w.transplant_week}`);
      }
      if (w.first_harvest_week > w.last_harvest_week) {
        problems.push(`${where}: first harvest ${w.first_harvest_week} after last harvest ${w.last_harvest_week}`);
      }
      if (!overwintering.has(plant.name) && w.transplant_week > w.first_harvest_week) {
        problems.push(`${where}: transplanted week ${w.transplant_week}, harvested week ${w.first_harvest_week}`);
      }
    }
  }

  assert.deepEqual(problems, []);
});

test('garlic is still the only crop whose harvest wraps the year', () => {
  // Guards the exemption above: if another crop starts wrapping, the exemption
  // list needs to say so rather than the test quietly covering for it.
  const wrapping = plants
    .filter(p => everyWindow(p).some(({ window: w }) => w.transplant_week > w.first_harvest_week))
    .map(p => p.name);
  assert.deepEqual(wrapping, ['Garlic']);
});

test('every crop in every plan carries a resolved schedule', () => {
  for (const zone of ZONES) {
    const plan = quietly(() =>
      calculatePlan({ zone, recipeId: 'all', household: 4, plants, recipes, greenhouseSqft: 200 })
    );
    for (const item of plan.items) {
      assert.ok(item.schedule, `${item.plant.name} in zone ${zone} has no schedule`);
      assert.ok(item.successionSchedules.length > 0, `${item.plant.name} in zone ${zone} has no sowings`);
      assert.match(item.location, /^(outdoor|greenhouse|greenhouse-extended)$/);
    }
  }
});
