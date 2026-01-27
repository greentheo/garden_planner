// test-gantt-display.js - Test Gantt chart greenhouse/outdoor display
import { calculatePlan } from './src/engine.js';
import fs from 'fs';

const plants = JSON.parse(fs.readFileSync('./data/plants.json', 'utf8'));
const recipes = JSON.parse(fs.readFileSync('./data/recipes.json', 'utf8'));

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Testing Gantt Chart and Garden Plot Display');
console.log('═══════════════════════════════════════════════════════════════\n');

// Test with 200 sqft greenhouse to get split plants
const plan = calculatePlan({
  zone: 7,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  greenhouseSqft: 200,
  foodSupplementationPercent: 100
});

console.log('Test Plan Summary:');
console.log(`  Total Plants: ${plan.summary.totalPlants}`);
console.log(`  Greenhouse Space: ${plan.greenhouseSqftUsed.toFixed(1)} sqft`);
console.log(`  Outdoor Space: ${plan.outdoorSqFt.toFixed(1)} sqft\n`);

console.log('Plants Split Between Greenhouse and Outdoor:');
console.log('─────────────────────────────────────────────────────────────');
console.log('Plant                 GH Plants  OUT Plants  Has Schedule?');
console.log('─────────────────────────────────────────────────────────────');

plan.items.forEach(it => {
  const ghPlants = it.greenhousePlants || 0;
  const outPlants = it.outdoorPlants || it.count;
  const hasSchedule = it.successionSchedules && it.successionSchedules.length > 0;

  // Show plants that are split between locations
  if (ghPlants > 0 && outPlants > 0) {
    const name = it.plant.name.padEnd(20);
    const gh = ghPlants.toString().padStart(10);
    const out = outPlants.toString().padStart(11);
    const schedule = hasSchedule ? 'YES' : 'NO';
    console.log(`${name} ${gh} ${out}        ${schedule}`);
  }
});

console.log('─────────────────────────────────────────────────────────────\n');

console.log('Sample Planting Schedule Details (Tomato):');
console.log('─────────────────────────────────────────────────────────────');

const tomato = plan.items.find(it => it.plant.name === 'Tomato');
if (tomato && tomato.successionSchedules) {
  console.log(`Plant: ${tomato.plant.name}`);
  console.log(`Total Plants: ${tomato.count}`);
  console.log(`Greenhouse Plants: ${tomato.greenhousePlants || 0}`);
  console.log(`Outdoor Plants: ${tomato.outdoorPlants || tomato.count}`);
  console.log(`Successions: ${tomato.successionSchedules.length}\n`);

  tomato.successionSchedules.slice(0, 3).forEach((schedule, idx) => {
    console.log(`Succession ${idx + 1}:`);
    console.log(`  Seed Start Week: ${schedule.seed_start_week}`);
    console.log(`  Transplant Week: ${schedule.transplant_week}`);
    console.log(`  First Harvest Week: ${schedule.first_harvest_week}`);
    console.log(`  Last Harvest Week: ${schedule.last_harvest_week}`);
    console.log(`  Indoor Seeding: ${schedule.transplant_week > schedule.seed_start_week ? 'YES' : 'NO'}`);
    console.log('');
  });
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Gantt Chart Display Test Complete!');
console.log('═══════════════════════════════════════════════════════════════');
console.log('\nIn the UI, you should see:');
console.log('  ✓ Garden Plot split into Outdoor and Greenhouse sections');
console.log('  ✓ Each section showing correct plant counts and space');
console.log('  ✓ Gantt chart showing Location column (Greenhouse/Outdoor)');
console.log('  ✓ Different colors for indoor vs outdoor seeding');
console.log('  ✓ Different colors for greenhouse vs outdoor growing');
console.log('  ✓ Different colors for greenhouse vs outdoor harvesting');
console.log('  ✓ Plants split between locations show separate rows\n');
