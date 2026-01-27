// test-updates.js - Test the three major updates
import { calculatePlan, getPlantingSchedule } from './src/engine.js';
import fs from 'fs';

const plants = JSON.parse(fs.readFileSync('./data/plants.json', 'utf8'));
const recipes = JSON.parse(fs.readFileSync('./data/recipes.json', 'utf8'));

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Testing Garden Planner Updates');
console.log('═══════════════════════════════════════════════════════════════\n');

// Test 1: Summary Row with Totals
console.log('TEST 1: Summary Row Calculations');
console.log('─────────────────────────────────────────────────────────────\n');

const plan = calculatePlan({
  zone: 7,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  useGreenhouseExtension: true
});

console.log('Summary Statistics:');
console.log(`  Total Calories Needed:    ${plan.summary.totalCaloriesNeeded.toFixed(0)}`);
console.log(`  Total Calories Produced:  ${plan.summary.totalCaloriesProduced.toFixed(0)}`);
console.log(`  Percent Filled:           ${plan.summary.percentFilled}%`);
console.log(`  Total Plants:             ${plan.summary.totalPlants}`);
console.log(`  Total Yield (lbs):        ${plan.summary.totalYield.toFixed(1)}`);
console.log(`  Avg Calories per Lb:      ${plan.summary.avgCaloriesPerLb.toFixed(0)}`);
console.log(`  Avg Yield per Plant:      ${(plan.summary.totalYield / plan.summary.totalPlants).toFixed(2)}\n`);

// Test 2: Week-based Schedule
console.log('TEST 2: Week-Based Planting Schedule');
console.log('─────────────────────────────────────────────────────────────\n');

const tomato = plants.find(p => p.name === 'Tomato');
console.log('Tomato Schedule (Zone 7, Greenhouse Extended):');
const tomatoSchedule = getPlantingSchedule(tomato, 7, true);
console.log(`  Seed Starting:     Week ${tomatoSchedule.seed_start_week}`);
console.log(`  Transplanting:     Week ${tomatoSchedule.transplant_week}`);
console.log(`  First Harvest:     Week ${tomatoSchedule.first_harvest_week}`);
console.log(`  Last Harvest:      Week ${tomatoSchedule.last_harvest_week}`);
console.log(`  Location:          ${tomatoSchedule.location}`);
console.log(`  Is Extended:       ${tomatoSchedule.is_extended}`);
console.log(`  Succession:        Every ${tomato.succession_planting_weeks} weeks\n`);

// Test 3: Greenhouse Season Extension
console.log('TEST 3: Greenhouse Season Extension');
console.log('─────────────────────────────────────────────────────────────\n');

const zones = [5, 7, 9];
console.log('Comparing Tomato Growing Seasons Across Zones:\n');

console.log('┌──────┬─────────────┬──────────────────┬────────────────┬──────────────┐');
console.log('│ Zone │   Type      │  Start Week      │  End Week      │ Duration     │');
console.log('├──────┼─────────────┼──────────────────┼────────────────┼──────────────┤');

zones.forEach(zone => {
  const outdoorSched = getPlantingSchedule(tomato, zone, false);
  const extendedSched = getPlantingSchedule(tomato, zone, true);

  const outdoorDuration = outdoorSched.last_harvest_week - outdoorSched.seed_start_week;
  const extendedDuration = extendedSched.last_harvest_week - extendedSched.seed_start_week;
  const extension = extendedDuration - outdoorDuration;

  console.log(`│  ${zone}   │  Outdoor    │  Week ${outdoorSched.seed_start_week.toString().padStart(2)}         │  Week ${outdoorSched.last_harvest_week.toString().padStart(2)}       │  ${outdoorDuration} weeks    │`);
  console.log(`│      │  Extended   │  Week ${extendedSched.seed_start_week.toString().padStart(2)}         │  Week ${extendedSched.last_harvest_week.toString().padStart(2)}       │  ${extendedDuration} weeks    │`);
  console.log(`│      │  Benefit    │  ${Math.abs(outdoorSched.seed_start_week - extendedSched.seed_start_week)} weeks earlier │  ${Math.abs(outdoorSched.last_harvest_week - extendedSched.last_harvest_week)} weeks later  │  +${extension} weeks    │`);
  console.log('├──────┼─────────────┼──────────────────┼────────────────┼──────────────┤');
});

console.log('└──────┴─────────────┴──────────────────┴────────────────┴──────────────┘\n');

// Test 4: Succession Planting
console.log('TEST 4: Succession Planting');
console.log('─────────────────────────────────────────────────────────────\n');

const plantsWithSuccession = plants.filter(p => p.succession_planting_weeks > 0);
console.log('Plants with Succession Planting:\n');
plantsWithSuccession.forEach(p => {
  console.log(`  ${p.name.padEnd(20)} - Plant every ${p.succession_planting_weeks} weeks`);
});

console.log('\n');

// Test 5: Full Plan Comparison
console.log('TEST 5: Full Plan Comparison (Zone 5)');
console.log('─────────────────────────────────────────────────────────────\n');

const planNoExtension = calculatePlan({
  zone: 5,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  useGreenhouseExtension: false
});

const planWithExtension = calculatePlan({
  zone: 5,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  useGreenhouseExtension: true
});

console.log('Without Greenhouse Extension:');
planNoExtension.items.forEach(it => {
  const duration = it.schedule.last_harvest_week - it.schedule.seed_start_week;
  console.log(`  ${it.plant.name.padEnd(20)} ${it.location.padEnd(20)} Weeks ${it.schedule.seed_start_week}-${it.schedule.last_harvest_week} (${duration} weeks)`);
});

console.log('\nWith Greenhouse Extension:');
planWithExtension.items.forEach(it => {
  const duration = it.schedule.last_harvest_week - it.schedule.seed_start_week;
  console.log(`  ${it.plant.name.padEnd(20)} ${it.location.padEnd(20)} Weeks ${it.schedule.seed_start_week}-${it.schedule.last_harvest_week} (${duration} weeks)`);
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  All Tests Complete!');
console.log('═══════════════════════════════════════════════════════════════\n');
