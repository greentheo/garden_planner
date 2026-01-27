// test.js - Simple test script for zone-aware functionality
import { getGrowingLocation, getPlantingWindow, selectPlantsForZone, calculatePlan } from './src/engine.js';
import fs from 'fs';

// Load data
const plants = JSON.parse(fs.readFileSync('./data/plants.json', 'utf8'));
const recipes = JSON.parse(fs.readFileSync('./data/recipes.json', 'utf8'));

console.log('=== Testing Zone-Aware Garden Planner ===\n');

// Test 1: Growing location determination
console.log('Test 1: Growing Location Determination');
const tomato = plants.find(p => p.name === 'Tomato');
console.log('Tomato in Zone 3:', getGrowingLocation(tomato, 3)); // Should be greenhouse
console.log('Tomato in Zone 7:', getGrowingLocation(tomato, 7)); // Should be outdoor
console.log('Tomato in Zone 1:', getGrowingLocation(tomato, 1)); // Should be impossible
console.log();

// Test 2: Planting window for different zones
console.log('Test 2: Planting Windows');
const zone3Window = getPlantingWindow(tomato, 3);
const zone7Window = getPlantingWindow(tomato, 7);
console.log('Tomato Zone 3:', zone3Window);
console.log('Tomato Zone 7:', zone7Window);
console.log();

// Test 3: Plant selection for category
console.log('Test 3: Plant Selection for Nightshade Category');
const nightshadeZone3 = selectPlantsForZone('nightshade', 3, plants);
const nightshadeZone7 = selectPlantsForZone('nightshade', 7, plants);
console.log('Zone 3 nightshades:', nightshadeZone3.map(p => `${p.plant.name} (${p.location})`));
console.log('Zone 7 nightshades:', nightshadeZone7.map(p => `${p.plant.name} (${p.location})`));
console.log();

// Test 4: Full plan calculation
console.log('Test 4: Full Plan Calculation');
console.log('\n--- Zone 3 (Cold) Mediterranean Recipe ---');
const plan3 = calculatePlan({
  zone: 3,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes
});
console.log(`Outdoor Space: ${plan3.outdoorSqFt.toFixed(1)} sq ft`);
console.log(`Greenhouse Space: ${plan3.greenhouseSqFt.toFixed(1)} sq ft`);
console.log(`Total Space: ${plan3.gardenSize.toFixed(1)} sq ft`);
console.log('Plants:');
plan3.items.forEach(it => {
  console.log(`  - ${it.plant.name} (${it.category}): ${it.location}, ${it.count} plants, ${it.window.start_month}-${it.window.end_month}`);
});

console.log('\n--- Zone 9 (Warm) Mediterranean Recipe ---');
const plan9 = calculatePlan({
  zone: 9,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes
});
console.log(`Outdoor Space: ${plan9.outdoorSqFt.toFixed(1)} sq ft`);
console.log(`Greenhouse Space: ${plan9.greenhouseSqFt.toFixed(1)} sq ft`);
console.log(`Total Space: ${plan9.gardenSize.toFixed(1)} sq ft`);
console.log('Plants:');
plan9.items.forEach(it => {
  console.log(`  - ${it.plant.name} (${it.category}): ${it.location}, ${it.count} plants, ${it.window.start_month}-${it.window.end_month}`);
});

console.log('\n=== All Tests Complete ===');
