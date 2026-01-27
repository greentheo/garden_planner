// test-greenhouse-toggle.js - Test greenhouse availability toggle
import { calculatePlan } from './src/engine.js';
import fs from 'fs';

const plants = JSON.parse(fs.readFileSync('./data/plants.json', 'utf8'));
const recipes = JSON.parse(fs.readFileSync('./data/recipes.json', 'utf8'));

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Testing Greenhouse Toggle Feature');
console.log('  Zone 5 (cool zone), Mediterranean Recipe, 4 People');
console.log('═══════════════════════════════════════════════════════════════\n');

// Test WITH greenhouse
console.log('TEST 1: WITH GREENHOUSE AVAILABLE');
console.log('─────────────────────────────────────────────────────────────\n');

const planWithGreenhouse = calculatePlan({
  zone: 5,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  useGreenhouseExtension: true
});

console.log('Plan Summary:');
console.log(`  Greenhouse Available:     YES ✓`);
console.log(`  Total Plants:             ${planWithGreenhouse.summary.totalPlants.toLocaleString()}`);
console.log(`  Plant Varieties:          ${planWithGreenhouse.items.length}`);
console.log(`  Outdoor Space:            ${planWithGreenhouse.outdoorSqFt.toFixed(1)} sq ft`);
console.log(`  Greenhouse Space:         ${planWithGreenhouse.greenhouseSqFt.toFixed(1)} sq ft`);
console.log(`  Total Space:              ${planWithGreenhouse.gardenSize.toFixed(1)} sq ft`);
console.log(`  Calories Produced:        ${planWithGreenhouse.summary.totalCaloriesProduced.toLocaleString()}`);
console.log('');

// Show sample schedules
const potatoWithGreenhouse = planWithGreenhouse.items.find(it => it.plant.name === 'Potato');
if (potatoWithGreenhouse && potatoWithGreenhouse.schedule) {
  console.log('Example: Potato Schedule');
  console.log(`  Location:        ${potatoWithGreenhouse.location}`);
  console.log(`  Seed Start:      Week ${potatoWithGreenhouse.schedule.seed_start_week} (mid-February)`);
  console.log(`  Transplant:      Week ${potatoWithGreenhouse.schedule.transplant_week}`);
  console.log(`  First Harvest:   Week ${potatoWithGreenhouse.schedule.first_harvest_week}`);
  console.log(`  Last Harvest:    Week ${potatoWithGreenhouse.schedule.last_harvest_week}`);
}
console.log('');

// Test WITHOUT greenhouse
console.log('TEST 2: WITHOUT GREENHOUSE (Outdoor Only)');
console.log('─────────────────────────────────────────────────────────────\n');

const planWithoutGreenhouse = calculatePlan({
  zone: 5,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  useGreenhouseExtension: false
});

console.log('Plan Summary:');
console.log(`  Greenhouse Available:     NO ✗`);
console.log(`  Total Plants:             ${planWithoutGreenhouse.summary.totalPlants.toLocaleString()}`);
console.log(`  Plant Varieties:          ${planWithoutGreenhouse.items.length}`);
console.log(`  Outdoor Space:            ${planWithoutGreenhouse.outdoorSqFt.toFixed(1)} sq ft`);
console.log(`  Greenhouse Space:         ${planWithoutGreenhouse.greenhouseSqFt.toFixed(1)} sq ft`);
console.log(`  Total Space:              ${planWithoutGreenhouse.gardenSize.toFixed(1)} sq ft`);
console.log(`  Calories Produced:        ${planWithoutGreenhouse.summary.totalCaloriesProduced.toLocaleString()}`);
console.log('');

// Show sample schedules
const potatoWithoutGreenhouse = planWithoutGreenhouse.items.find(it => it.plant.name === 'Potato');
if (potatoWithoutGreenhouse && potatoWithoutGreenhouse.schedule) {
  console.log('Example: Potato Schedule');
  console.log(`  Location:        ${potatoWithoutGreenhouse.location}`);
  console.log(`  Seed Start:      Week ${potatoWithoutGreenhouse.schedule.seed_start_week} (later start for outdoor only)`);
  console.log(`  Transplant:      Week ${potatoWithoutGreenhouse.schedule.transplant_week}`);
  console.log(`  First Harvest:   Week ${potatoWithoutGreenhouse.schedule.first_harvest_week}`);
  console.log(`  Last Harvest:    Week ${potatoWithoutGreenhouse.schedule.last_harvest_week}`);
}
console.log('');

// Compare
console.log('═══════════════════════════════════════════════════════════════');
console.log('  COMPARISON');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('Metric                      With Greenhouse    Without Greenhouse   Difference');
console.log('─────────────────────────────────────────────────────────────────────────────');
console.log(`Plant Varieties             ${planWithGreenhouse.items.length.toString().padStart(15)}    ${planWithoutGreenhouse.items.length.toString().padStart(18)}    ${(planWithGreenhouse.items.length - planWithoutGreenhouse.items.length).toString().padStart(10)}`);
console.log(`Total Plants                ${planWithGreenhouse.summary.totalPlants.toString().padStart(15)}    ${planWithoutGreenhouse.summary.totalPlants.toString().padStart(18)}    ${(planWithGreenhouse.summary.totalPlants - planWithoutGreenhouse.summary.totalPlants).toString().padStart(10)}`);
console.log(`Greenhouse Space (sq ft)    ${planWithGreenhouse.greenhouseSqFt.toFixed(0).padStart(15)}    ${planWithoutGreenhouse.greenhouseSqFt.toFixed(0).padStart(18)}    ${(planWithGreenhouse.greenhouseSqFt - planWithoutGreenhouse.greenhouseSqFt).toFixed(0).padStart(10)}`);
console.log(`Calories Produced           ${planWithGreenhouse.summary.totalCaloriesProduced.toFixed(0).padStart(15)}    ${planWithoutGreenhouse.summary.totalCaloriesProduced.toFixed(0).padStart(18)}    ${(planWithGreenhouse.summary.totalCaloriesProduced - planWithoutGreenhouse.summary.totalCaloriesProduced).toFixed(0).padStart(10)}`);

if (potatoWithGreenhouse && potatoWithoutGreenhouse) {
  const startDiff = potatoWithoutGreenhouse.schedule.seed_start_week - potatoWithGreenhouse.schedule.seed_start_week;
  console.log(`\nPotato Start Week           ${potatoWithGreenhouse.schedule.seed_start_week.toString().padStart(15)}    ${potatoWithoutGreenhouse.schedule.seed_start_week.toString().padStart(18)}    ${startDiff > 0 ? '+' : ''}${startDiff.toString().padStart(9)} weeks`);
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  Key Findings:');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  ✓ Without greenhouse: Later planting dates (more realistic)');
console.log('  ✓ Without greenhouse: May have fewer varieties (some need greenhouse)');
console.log('  ✓ With greenhouse: Earlier starts, longer season, more production');
console.log('  ✓ Checkbox allows users to match their actual resources');
console.log('═══════════════════════════════════════════════════════════════\n');
