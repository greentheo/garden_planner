// Shared fixtures. The engine's own loadData() goes through fetch, which only
// exists in the browser, so the tests read the same two files off disk.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export const plants = JSON.parse(fs.readFileSync(path.join(root, 'data/plants.json'), 'utf8'));
export const recipes = JSON.parse(fs.readFileSync(path.join(root, 'data/recipes.json'), 'utf8'));

export const ZONES = [3, 4, 5, 6, 7, 8, 9, 10, 11];

export function crop(name) {
  const found = plants.find(p => p.name === name);
  if (!found) throw new Error(`no crop named ${name} in data/plants.json`);
  return found;
}

/**
 * calculatePlan logs a line per crop it drops and warns per category it cannot
 * fill. That is useful in a browser console and noise in a test run, so plans
 * are built with both muted.
 */
export function quietly(fn) {
  const { log, warn } = console;
  console.log = () => {};
  console.warn = () => {};
  try {
    return fn();
  } finally {
    console.log = log;
    console.warn = warn;
  }
}

/** Every schedule window in a crop's data, flattened, tagged with where it came from. */
export function everyWindow(plant) {
  const out = [];
  for (const set of plant.zone_adjusted_schedules) {
    for (const kind of ['outdoor', 'greenhouse_only', 'greenhouse_extended']) {
      const windows = set[kind];
      if (!windows) continue;
      for (const w of Array.isArray(windows) ? windows : [windows]) {
        out.push({ window: w, kind, zone_range: set.zone_range, plant });
      }
    }
  }
  return out;
}
