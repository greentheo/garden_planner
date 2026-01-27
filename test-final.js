// test-final.js - Final comprehensive test
import { calculatePlan, getPlantingSchedule } from './src/engine.js';
import fs from 'fs';

const plants = JSON.parse(fs.readFileSync('./data/plants.json', 'utf8'));
const recipes = JSON.parse(fs.readFileSync('./data/recipes.json', 'utf8'));

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Final Comprehensive Test');
console.log('═══════════════════════════════════════════════════════════════\n');

// Test 1: Greenhouse Logic in Different Zones
console.log('TEST 1: Greenhouse Logic Verification');
console.log('─────────────────────────────────────────────────────────────\n');

const testZones = [5, 7, 9];
console.log('Tomato Growing Location by Zone:\n');

testZones.forEach(zone => {
  const plan = calculatePlan({
    zone,
    recipeId: 'mediterranean',
    household: 4,
    gardenSize: null,
    plants,
    recipes
  });

  const tomato = plan.items.find(it => it.plant.name === 'Tomato');
  if (tomato) {
    console.log(`Zone ${zone}:`);
    console.log(`  Location: ${tomato.location}`);
    console.log(`  Successions: ${tomato.successionSchedules.length}`);
    console.log(`  Plants per succession: ${tomato.plantsPerSuccession}`);
  }
  console.log('');
});

// Test 2: Multiple Planting Windows
console.log('TEST 2: Multiple Planting Windows (Peas)');
console.log('─────────────────────────────────────────────────────────────\n');

const peas = plants.find(p => p.name === 'Peas');
console.log(`Peas - Multiple Windows: ${peas.multiple_windows ? 'YES' : 'NO'}\n`);

testZones.forEach(zone => {
  const schedule = getPlantingSchedule(peas, zone, true);
  console.log(`Zone ${zone}:`);

  if (Array.isArray(schedule)) {
    console.log(`  ${schedule.length} planting windows:`);
    schedule.forEach(window => {
      console.log(`    ${window.name}: Weeks ${window.seed_start_week}-${window.last_harvest_week}`);
    });
  } else {
    console.log(`  Single window: Weeks ${schedule.seed_start_week}-${schedule.last_harvest_week}`);
  }
  console.log('');
});

// Test 3: Plan with Peas
console.log('TEST 3: Protein-Rich Plan with Peas (Zone 7)');
console.log('─────────────────────────────────────────────────────────────\n');

const proteinPlan = calculatePlan({
  zone: 7,
  recipeId: 'protein-rich',
  household: 4,
  gardenSize: null,
  plants,
  recipes
});

const planPeas = proteinPlan.items.find(it => it.plant.name === 'Peas');
if (planPeas) {
  console.log('Peas in Plan:');
  console.log(`  Total plants: ${planPeas.count}`);
  console.log(`  Multiple windows: ${planPeas.hasMultipleWindows ? 'YES' : 'NO'}`);
  console.log(`  Total successions: ${planPeas.successionSchedules.length}`);
  console.log(`  Plants per succession: ${planPeas.plantsPerSuccession}\n`);

  console.log('  Succession Details:');
  planPeas.successionSchedules.forEach((s, idx) => {
    const label = s.name || `#${idx + 1}`;
    console.log(`    ${label.padEnd(8)} W${s.seed_start_week.toString().padStart(2)}-${s.last_harvest_week.toString().padStart(2)} (${s.last_harvest_week - s.seed_start_week} weeks)`);
  });
}

console.log('\n');

// Test 4: Summary Statistics
console.log('TEST 4: Summary Statistics (Zone 7, Mediterranean)');
console.log('─────────────────────────────────────────────────────────────\n');

const medPlan = calculatePlan({
  zone: 7,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes
});

console.log('Plan Summary:');
console.log(`  Total Calories Needed:    ${medPlan.summary.totalCaloriesNeeded.toLocaleString()}`);
console.log(`  Total Calories Produced:  ${medPlan.summary.totalCaloriesProduced.toLocaleString()}`);
console.log(`  Percent Filled:           ${medPlan.summary.percentFilled}%`);
console.log(`  Total Plants:             ${medPlan.summary.totalPlants.toLocaleString()}`);
console.log(`  Total Yield (lbs):        ${medPlan.summary.totalYield.toFixed(1)}`);
console.log(`  Avg Calories per Lb:      ${medPlan.summary.avgCaloriesPerLb.toFixed(0)}`);
console.log('');

console.log('Space Requirements:');
console.log(`  Outdoor:                  ${medPlan.outdoorSqFt.toFixed(1)} sq ft`);
console.log(`  Greenhouse:               ${medPlan.greenhouseSqFt.toFixed(1)} sq ft`);
console.log(`  Total:                    ${medPlan.gardenSize.toFixed(1)} sq ft`);
console.log('');

console.log('Crops and Successions:');
medPlan.items.forEach(it => {
  const windows = it.hasMultipleWindows ? ' (multiple windows)' : '';
  console.log(`  ${it.plant.name.padEnd(20)} ${it.location.padEnd(22)} ${it.successionSchedules.length.toString().padStart(2)} successions${windows}`);
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  All Tests Complete! ✓');
console.log('═══════════════════════════════════════════════════════════════\n');
