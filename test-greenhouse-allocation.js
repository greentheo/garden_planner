// test-greenhouse-allocation.js - Test greenhouse allocation algorithm
import { calculatePlan } from './src/engine.js';
import fs from 'fs';

const plants = JSON.parse(fs.readFileSync('./data/plants.json', 'utf8'));
const recipes = JSON.parse(fs.readFileSync('./data/recipes.json', 'utf8'));

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Testing Greenhouse Allocation Algorithm');
console.log('  Zone 7, Mediterranean Recipe, 4 People, 100%');
console.log('═══════════════════════════════════════════════════════════════\n');

// Test 1: No greenhouse (0 sqft)
console.log('TEST 1: No Greenhouse (0 sqft)');
console.log('─────────────────────────────────────────────────────────────\n');

const plan1 = calculatePlan({
  zone: 7,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  greenhouseSqft: 0,
  foodSupplementationPercent: 100
});

console.log(`Total Plants: ${plan1.summary.totalPlants}`);
console.log(`Outdoor Space: ${plan1.outdoorSqFt.toFixed(1)} sqft`);
console.log(`Greenhouse Space: ${plan1.greenhouseSqftUsed.toFixed(1)} sqft`);
console.log(`Total Space: ${plan1.gardenSize.toFixed(1)} sqft\n`);

// Test 2: Small greenhouse (200 sqft)
console.log('TEST 2: Small Greenhouse (200 sqft)');
console.log('─────────────────────────────────────────────────────────────\n');

const plan2 = calculatePlan({
  zone: 7,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  greenhouseSqft: 200,
  foodSupplementationPercent: 100
});

console.log(`Total Plants: ${plan2.summary.totalPlants}`);
console.log(`Outdoor Space: ${plan2.outdoorSqFt.toFixed(1)} sqft`);
console.log(`Greenhouse Space: ${plan2.greenhouseSqftUsed.toFixed(1)} sqft / ${plan2.greenhouseSqftAvailable.toFixed(1)} sqft`);
console.log(`Greenhouse Utilization: ${plan2.greenhouseAllocation.utilization.toFixed(1)}%`);
console.log(`Total Space: ${plan2.gardenSize.toFixed(1)} sqft\n`);

// Show greenhouse allocation details
console.log('Greenhouse Allocation (200 sqft):');
console.log('─────────────────────────────────────────────────────────────');
console.log('Plant                 Priority  GH Plants  GH Space  Outdoor Plants  Outdoor Space');
console.log('─────────────────────────────────────────────────────────────');

plan2.items
  .filter(it => (it.greenhousePlants || 0) > 0)
  .sort((a, b) => (b.plant.greenhouse_priority || 1) - (a.plant.greenhouse_priority || 1))
  .forEach(it => {
    const name = it.plant.name.padEnd(20);
    const priority = (it.plant.greenhouse_priority || 1).toString().padStart(8);
    const ghPlants = (it.greenhousePlants || 0).toString().padStart(10);
    const ghSpace = (it.greenhouseSqft || 0).toFixed(1).padStart(9);
    const outPlants = (it.outdoorPlants || 0).toString().padStart(15);
    const outSpace = (it.outdoorSqft || 0).toFixed(1).padStart(14);
    console.log(`${name} ${priority} ${ghPlants} ${ghSpace} ${outPlants} ${outSpace}`);
  });

console.log('─────────────────────────────────────────────────────────────\n');

// Test 3: Large greenhouse (500 sqft)
console.log('TEST 3: Large Greenhouse (500 sqft)');
console.log('─────────────────────────────────────────────────────────────\n');

const plan3 = calculatePlan({
  zone: 7,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  greenhouseSqft: 500,
  foodSupplementationPercent: 100
});

console.log(`Total Plants: ${plan3.summary.totalPlants}`);
console.log(`Outdoor Space: ${plan3.outdoorSqFt.toFixed(1)} sqft`);
console.log(`Greenhouse Space: ${plan3.greenhouseSqftUsed.toFixed(1)} sqft / ${plan3.greenhouseSqftAvailable.toFixed(1)} sqft`);
console.log(`Greenhouse Utilization: ${plan3.greenhouseAllocation.utilization.toFixed(1)}%`);
console.log(`Total Space: ${plan3.gardenSize.toFixed(1)} sqft\n`);

// Test 4: Diversity verification (check that many varieties get some greenhouse space)
console.log('TEST 4: Diversity Verification (200 sqft)');
console.log('─────────────────────────────────────────────────────────────\n');

const plantsInGreenhouse = plan2.items.filter(it => (it.greenhousePlants || 0) > 0).length;
console.log(`Plant varieties with greenhouse allocation: ${plantsInGreenhouse} / ${plan2.items.length}`);
console.log(`Diversity achieved: ${(plantsInGreenhouse / plan2.items.length * 100).toFixed(1)}%\n`);

// Show priority distribution in greenhouse
const priorityCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
plan2.items.forEach(it => {
  if ((it.greenhousePlants || 0) > 0) {
    const priority = it.plant.greenhouse_priority || 1;
    priorityCounts[priority]++;
  }
});

console.log('Priority distribution in greenhouse:');
console.log(`  Priority 4 (Very High): ${priorityCounts[4]} varieties`);
console.log(`  Priority 3 (High):      ${priorityCounts[3]} varieties`);
console.log(`  Priority 2 (Medium):    ${priorityCounts[2]} varieties`);
console.log(`  Priority 1 (Low):       ${priorityCounts[1]} varieties\n`);

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Algorithm Test Complete!');
console.log('═══════════════════════════════════════════════════════════════');
