// test-all-recipe.js - Test the "All - Maximum Variety" recipe
import { calculatePlan } from './src/engine.js';
import fs from 'fs';

const plants = JSON.parse(fs.readFileSync('./data/plants.json', 'utf8'));
const recipes = JSON.parse(fs.readFileSync('./data/recipes.json', 'utf8'));

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Testing "All - Maximum Variety" Recipe');
console.log('═══════════════════════════════════════════════════════════════\n');

// Test Zone 7 with "All" recipe
const plan = calculatePlan({
  zone: 7,
  recipeId: 'all',
  household: 4,
  gardenSize: null,
  plants,
  recipes
});

console.log('Plan Summary:');
console.log(`  Total Calories Needed:    ${plan.summary.totalCaloriesNeeded.toLocaleString()}`);
console.log(`  Total Calories Produced:  ${plan.summary.totalCaloriesProduced.toLocaleString()}`);
console.log(`  Percent Filled:           ${plan.summary.percentFilled}%`);
console.log(`  Total Plants:             ${plan.summary.totalPlants.toLocaleString()}`);
console.log(`  Total Yield (lbs):        ${plan.summary.totalYield.toFixed(1)}`);
console.log(`  Avg Calories per Lb:      ${plan.summary.avgCaloriesPerLb.toFixed(0)}`);
console.log('');

console.log('Space Requirements:');
console.log(`  Outdoor:                  ${plan.outdoorSqFt.toFixed(1)} sq ft`);
console.log(`  Greenhouse:               ${plan.greenhouseSqFt.toFixed(1)} sq ft`);
console.log(`  Total:                    ${plan.gardenSize.toFixed(1)} sq ft`);
console.log('');

console.log(`Selected Plants (${plan.items.length} total):`);
console.log('─────────────────────────────────────────────────────────────\n');

// Group by category
const byCategory = {};
plan.items.forEach(item => {
  const cat = item.category;
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(item);
});

Object.keys(byCategory).sort().forEach(category => {
  console.log(`${category.toUpperCase()}:`);
  byCategory[category].forEach(item => {
    const windows = item.hasMultipleWindows ? ' (spring & fall)' : '';
    console.log(`  ${item.plant.name.padEnd(20)} ${item.location.padEnd(22)} ${item.count.toString().padStart(5)} plants, ${item.successionSchedules.length.toString().padStart(2)} successions${windows}`);
  });
  console.log('');
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Test Complete! ✓');
console.log('═══════════════════════════════════════════════════════════════\n');
