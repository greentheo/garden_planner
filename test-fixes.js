// test-fixes.js - Test greenhouse logic and succession planting
import { calculatePlan, shouldUseGreenhouseExtension, calculateSuccessionPlantings, getPlantingSchedule } from './src/engine.js';
import fs from 'fs';

const plants = JSON.parse(fs.readFileSync('./data/plants.json', 'utf8'));
const recipes = JSON.parse(fs.readFileSync('./data/recipes.json', 'utf8'));

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Testing Greenhouse Logic and Succession Planting Fixes');
console.log('═══════════════════════════════════════════════════════════════\n');

// Test 1: Greenhouse Extension Logic
console.log('TEST 1: Smart Greenhouse Extension by Zone');
console.log('─────────────────────────────────────────────────────────────\n');

const zones = [3, 5, 7, 9, 10];
console.log('Greenhouse Extension Decision:');
zones.forEach(zone => {
  const shouldUse = shouldUseGreenhouseExtension(zone);
  console.log(`  Zone ${zone}: ${shouldUse ? '✓ USE greenhouse extension (cool zone)' : '✗ SKIP greenhouse extension (warm zone, outdoor is best)'}`);
});
console.log('');

// Test 2: Verify Plans by Zone
console.log('TEST 2: Tomato Growing Location by Zone');
console.log('─────────────────────────────────────────────────────────────\n');

const tomato = plants.find(p => p.name === 'Tomato');
zones.forEach(zone => {
  const schedule = getPlantingSchedule(tomato, zone, true);
  console.log(`  Zone ${zone}: ${schedule.location.padEnd(25)} (${schedule.is_extended ? 'Extended' : 'Standard'})`);
});
console.log('');

// Test 3: Succession Planting Calculation
console.log('TEST 3: Succession Planting Schedules');
console.log('─────────────────────────────────────────────────────────────\n');

const testPlants = [
  { name: 'Tomato', weeks: 2 },
  { name: 'Lettuce', weeks: 2 },
  { name: 'Carrots', weeks: 3 }
];

testPlants.forEach(tp => {
  const plant = plants.find(p => p.name === tp.name);
  const schedule = getPlantingSchedule(plant, 7, true);
  const successions = calculateSuccessionPlantings(plant, schedule);

  console.log(`${plant.name} (Every ${plant.succession_planting_weeks} weeks):`);
  console.log(`  Total successions: ${successions.length}`);
  successions.slice(0, 5).forEach((s, idx) => {
    console.log(`    #${idx + 1}: Seed W${s.seed_start_week}, Transplant W${s.transplant_week}, Harvest W${s.first_harvest_week}-${s.last_harvest_week}`);
  });
  if (successions.length > 5) {
    console.log(`    ... and ${successions.length - 5} more successions`);
  }
  console.log('');
});

// Test 4: Full Plan Comparison
console.log('TEST 4: Full Plan Comparison (Zone 7 vs Zone 9)');
console.log('─────────────────────────────────────────────────────────────\n');

const plan7 = calculatePlan({
  zone: 7,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  useGreenhouseExtension: true
});

const plan9 = calculatePlan({
  zone: 9,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  useGreenhouseExtension: true
});

console.log('Zone 7 (Should use greenhouse extension):');
plan7.items.forEach(it => {
  console.log(`  ${it.plant.name.padEnd(20)} ${it.location.padEnd(25)} ${it.successionSchedules.length} successions`);
});

console.log('\nZone 9 (Should NOT use greenhouse extension):');
plan9.items.forEach(it => {
  console.log(`  ${it.plant.name.padEnd(20)} ${it.location.padEnd(25)} ${it.successionSchedules.length} successions`);
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  All Tests Complete!');
console.log('═══════════════════════════════════════════════════════════════\n');
