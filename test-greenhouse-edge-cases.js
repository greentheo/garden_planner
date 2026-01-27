// test-greenhouse-edge-cases.js - Test edge cases for greenhouse allocation
import { calculatePlan } from './src/engine.js';
import fs from 'fs';

const plants = JSON.parse(fs.readFileSync('./data/plants.json', 'utf8'));
const recipes = JSON.parse(fs.readFileSync('./data/recipes.json', 'utf8'));

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Testing Greenhouse Allocation Edge Cases');
console.log('═══════════════════════════════════════════════════════════════\n');

// Edge Case 1: Tiny greenhouse (10 sqft) - should allocate to highest priority only
console.log('EDGE CASE 1: Tiny Greenhouse (10 sqft)');
console.log('─────────────────────────────────────────────────────────────\n');

const plan1 = calculatePlan({
  zone: 7,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  greenhouseSqft: 10,
  foodSupplementationPercent: 100
});

console.log(`Greenhouse Used: ${plan1.greenhouseSqftUsed.toFixed(1)} sqft / ${plan1.greenhouseSqftAvailable} sqft`);
console.log(`Utilization: ${plan1.greenhouseAllocation.utilization.toFixed(1)}%`);

const ghItems1 = plan1.items.filter(it => (it.greenhousePlants || 0) > 0);
console.log(`Plant varieties in greenhouse: ${ghItems1.length}`);
ghItems1.forEach(it => {
  console.log(`  - ${it.plant.name} (Priority ${it.plant.greenhouse_priority}): ${it.greenhousePlants} plants, ${it.greenhouseSqft.toFixed(1)} sqft`);
});
console.log('');

// Edge Case 2: Huge greenhouse (2000 sqft) - should fit everything
console.log('EDGE CASE 2: Huge Greenhouse (2000 sqft - larger than total needed)');
console.log('─────────────────────────────────────────────────────────────\n');

const plan2 = calculatePlan({
  zone: 7,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  greenhouseSqft: 2000,
  foodSupplementationPercent: 100
});

console.log(`Greenhouse Used: ${plan2.greenhouseSqftUsed.toFixed(1)} sqft / ${plan2.greenhouseSqftAvailable} sqft`);
console.log(`Utilization: ${plan2.greenhouseAllocation.utilization.toFixed(1)}%`);
console.log(`Outdoor Space: ${plan2.outdoorSqFt.toFixed(1)} sqft`);

const allInGreenhouse = plan2.items.every(it => it.outdoorPlants === 0);
console.log(`All plants in greenhouse: ${allInGreenhouse ? 'YES ✓' : 'NO ✗'}\n`);

// Edge Case 3: Small supplementation (10%) with greenhouse
console.log('EDGE CASE 3: Small Garden (10% supplementation) with 50 sqft Greenhouse');
console.log('─────────────────────────────────────────────────────────────\n');

const plan3 = calculatePlan({
  zone: 7,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  greenhouseSqft: 50,
  foodSupplementationPercent: 10
});

console.log(`Total Plants: ${plan3.summary.totalPlants}`);
console.log(`Total Space Needed: ${plan3.gardenSize.toFixed(1)} sqft`);
console.log(`Greenhouse Used: ${plan3.greenhouseSqftUsed.toFixed(1)} sqft / ${plan3.greenhouseSqftAvailable} sqft`);
console.log(`Utilization: ${plan3.greenhouseAllocation.utilization.toFixed(1)}%`);
console.log(`Outdoor Space: ${plan3.outdoorSqFt.toFixed(1)} sqft\n`);

// Edge Case 4: Verify totals add up correctly
console.log('EDGE CASE 4: Verify Total Integrity (200 sqft greenhouse)');
console.log('─────────────────────────────────────────────────────────────\n');

const plan4 = calculatePlan({
  zone: 7,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  greenhouseSqft: 200,
  foodSupplementationPercent: 100
});

// Verify plant counts add up
let totalGhPlants = 0;
let totalOutPlants = 0;
let totalGhSqft = 0;
let totalOutSqft = 0;

plan4.items.forEach(it => {
  totalGhPlants += (it.greenhousePlants || 0);
  totalOutPlants += (it.outdoorPlants || 0);
  totalGhSqft += (it.greenhouseSqft || 0);
  totalOutSqft += (it.outdoorSqft || 0);

  // Verify individual item totals match
  const itemTotal = (it.greenhousePlants || 0) + (it.outdoorPlants || 0);
  if (itemTotal !== it.count) {
    console.log(`  ✗ ERROR: ${it.plant.name} totals don't match! ${itemTotal} !== ${it.count}`);
  }
});

console.log('Plant Count Verification:');
console.log(`  Greenhouse plants: ${totalGhPlants}`);
console.log(`  Outdoor plants: ${totalOutPlants}`);
console.log(`  Sum: ${totalGhPlants + totalOutPlants}`);
console.log(`  Expected: ${plan4.summary.totalPlants}`);
console.log(`  Match: ${(totalGhPlants + totalOutPlants === plan4.summary.totalPlants) ? '✓ PASS' : '✗ FAIL'}\n`);

console.log('Space Verification:');
console.log(`  Greenhouse space: ${totalGhSqft.toFixed(1)} sqft`);
console.log(`  Outdoor space: ${totalOutSqft.toFixed(1)} sqft`);
console.log(`  Sum: ${(totalGhSqft + totalOutSqft).toFixed(1)} sqft`);
console.log(`  Expected: ${plan4.gardenSize.toFixed(1)} sqft`);
console.log(`  Match: ${Math.abs((totalGhSqft + totalOutSqft) - plan4.gardenSize) < 0.1 ? '✓ PASS' : '✗ FAIL'}\n`);

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Edge Case Testing Complete!');
console.log('═══════════════════════════════════════════════════════════════');
