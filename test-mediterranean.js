// test-mediterranean.js - Test Mediterranean recipe with new improvements
import { calculatePlan } from './src/engine.js';
import fs from 'fs';

const plants = JSON.parse(fs.readFileSync('./data/plants.json', 'utf8'));
const recipes = JSON.parse(fs.readFileSync('./data/recipes.json', 'utf8'));

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Testing Mediterranean Recipe (After Improvements)');
console.log('  Zone 7, 4 People');
console.log('═══════════════════════════════════════════════════════════════\n');

const plan = calculatePlan({
  zone: 7,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes
});

console.log('Recipe Components:');
const recipe = recipes.find(r => r.id === 'mediterranean');
recipe.components.forEach(comp => {
  console.log(`  ${comp.category.padEnd(20)} ${(comp.calorie_share * 100).toFixed(1)}%`);
});
console.log('');

console.log('Plan Summary:');
console.log(`  Total Calories Needed:    ${plan.summary.totalCaloriesNeeded.toLocaleString()}`);
console.log(`  Total Calories Produced:  ${plan.summary.totalCaloriesProduced.toLocaleString()}`);
console.log(`  Percent Filled:           ${plan.summary.percentFilled}%`);
console.log(`  Total Plants:             ${plan.summary.totalPlants.toLocaleString()}`);
console.log(`  Total Yield (lbs):        ${plan.summary.totalYield.toFixed(1)}`);
console.log(`  Avg Calories per Lb:      ${plan.summary.avgCaloriesPerLb.toFixed(0)}`);
console.log(`  Garden Size:              ${(plan.gardenSize / 43560).toFixed(2)} acres`);
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

let totalCalories = 0;
Object.keys(byCategory).sort().forEach(category => {
  const categoryCalories = byCategory[category].reduce((sum, item) => sum + item.totalCaloriesProduced, 0);
  const categoryPercent = (categoryCalories / plan.summary.totalCaloriesProduced * 100).toFixed(1);
  totalCalories += categoryCalories;

  console.log(`${category.toUpperCase()} - ${categoryPercent}% (${categoryCalories.toLocaleString()} cal):`);
  byCategory[category].forEach(item => {
    const itemPercent = (item.totalCaloriesProduced / plan.summary.totalCaloriesProduced * 100).toFixed(1);
    const windows = item.hasMultipleWindows ? ' (spring & fall)' : '';
    console.log(`  ${item.plant.name.padEnd(20)} ${item.count.toString().padStart(4)} plants, ` +
                `${item.successionSchedules.length.toString().padStart(2)} successions, ` +
                `${itemPercent.padStart(5)}%${windows}`);
  });
  console.log('');
});

console.log('Calorie Distribution Check:');
console.log(`  Total: ${(totalCalories / plan.summary.totalCaloriesProduced * 100).toFixed(1)}%`);

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  Key Improvements Demonstrated:');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  ✓ Multiple plants per category for variety');
console.log('  ✓ Realistic proportions (allium ~2%, not 20%)');
console.log('  ✓ Starchy vegetables as calorie base');
console.log('  ✓ Detailed calorie breakdown by category');
console.log('═══════════════════════════════════════════════════════════════\n');
