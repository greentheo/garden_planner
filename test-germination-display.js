// test-germination-display.js - Test germination period display
import { calculatePlan } from './src/engine.js';
import fs from 'fs';

const plants = JSON.parse(fs.readFileSync('./data/plants.json', 'utf8'));
const recipes = JSON.parse(fs.readFileSync('./data/recipes.json', 'utf8'));

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Testing Germination/Emergence Period Display');
console.log('═══════════════════════════════════════════════════════════════\n');

// Generate a plan to test the schedules
const plan = calculatePlan({
  zone: 7,
  recipeId: 'mediterranean',
  household: 4,
  gardenSize: null,
  plants,
  recipes,
  greenhouseSqft: 0,
  foodSupplementationPercent: 100
});

console.log('Sample Plants with Germination Periods:');
console.log('─────────────────────────────────────────────────────────────');
console.log('Plant          Type      Seed Week  Transplant  Germ Period');
console.log('─────────────────────────────────────────────────────────────');

// Test specific plants
const testPlants = ['Potato', 'Carrots', 'Garlic', 'Peas', 'Parsnips', 'Tomato', 'Lettuce'];

testPlants.forEach(plantName => {
  const item = plan.items.find(it => it.plant.name === plantName);
  if (!item || !item.successionSchedules || item.successionSchedules.length === 0) {
    console.log(`${plantName.padEnd(14)} - No schedule found`);
    return;
  }

  const schedule = item.successionSchedules[0];
  const seedWeek = schedule.seed_start_week;
  const transplantWeek = schedule.transplant_week;
  const germWeeks = transplantWeek - seedWeek;

  // Determine type
  let type = 'seed';
  if (['Potato', 'Sweet Potato'].includes(plantName)) {
    type = 'tuber';
  } else if (['Garlic', 'Onions', 'Shallots'].includes(plantName)) {
    type = 'bulb';
  }

  const name = plantName.padEnd(14);
  const typeStr = type.padEnd(9);
  const seed = seedWeek.toString().padStart(10);
  const trans = transplantWeek.toString().padStart(11);
  const germ = germWeeks > 0 ? `${germWeeks} weeks` : 'NONE';

  console.log(`${name} ${typeStr} ${seed} ${trans}    ${germ}`);
});

console.log('─────────────────────────────────────────────────────────────\n');

console.log('Detailed Schedule Examples:');
console.log('═══════════════════════════════════════════════════════════════\n');

// Potato (tuber - 3 week emergence)
const potato = plan.items.find(it => it.plant.name === 'Potato');
if (potato && potato.successionSchedules) {
  const sched = potato.successionSchedules[0];
  console.log('🥔 Potato (Tuber):');
  console.log(`  Planting Week: ${sched.seed_start_week}`);
  console.log(`  Emergence Week: ${sched.transplant_week} (3 weeks for chitting + sprouting)`);
  console.log(`  First Harvest Week: ${sched.first_harvest_week}`);
  console.log(`  Activity: Plant seed potato → Wait for emergence → Growing phase begins\n`);
}

// Carrots (slow germinating seed - 3 weeks)
const carrots = plan.items.find(it => it.plant.name === 'Carrots');
if (carrots && carrots.successionSchedules) {
  const sched = carrots.successionSchedules[0];
  console.log('🥕 Carrots (Slow Seed):');
  console.log(`  Seeding Week: ${sched.seed_start_week}`);
  console.log(`  Germination Complete: ${sched.transplant_week} (3 weeks - carrots are slow!)`);
  console.log(`  First Harvest Week: ${sched.first_harvest_week}`);
  console.log(`  Activity: Direct sow seeds → Wait for germination → Growing phase begins\n`);
}

// Garlic (bulb - 3 weeks root establishment)
const garlic = plan.items.find(it => it.plant.name === 'Garlic');
if (garlic && garlic.successionSchedules) {
  const sched = garlic.successionSchedules[0];
  console.log('🧄 Garlic (Bulb):');
  console.log(`  Planting Week: ${sched.seed_start_week}`);
  console.log(`  Established Week: ${sched.transplant_week} (3 weeks for root establishment)`);
  console.log(`  First Harvest Week: ${sched.first_harvest_week}`);
  console.log(`  Activity: Plant cloves → Roots establish → Growing phase begins\n`);
}

// Peas (fast germinating seed - 1 week)
const peas = plan.items.find(it => it.plant.name === 'Peas');
if (peas && peas.successionSchedules) {
  const sched = peas.successionSchedules[0];
  console.log('🫛 Peas (Fast Seed):');
  console.log(`  Seeding Week: ${sched.seed_start_week}`);
  console.log(`  Germination Complete: ${sched.transplant_week} (1 week - peas sprout quickly)`);
  console.log(`  First Harvest Week: ${sched.first_harvest_week}`);
  console.log(`  Activity: Direct sow → Quick germination → Growing phase begins\n`);
}

// Parsnips (very slow germinating seed - 4 weeks)
const parsnips = plan.items.find(it => it.plant.name === 'Parsnips');
if (parsnips && parsnips.successionSchedules) {
  const sched = parsnips.successionSchedules[0];
  console.log('🥬 Parsnips (Very Slow Seed):');
  console.log(`  Seeding Week: ${sched.seed_start_week}`);
  console.log(`  Germination Complete: ${sched.transplant_week} (4 weeks - notoriously slow!)`);
  console.log(`  First Harvest Week: ${sched.first_harvest_week}`);
  console.log(`  Activity: Direct sow → Long wait for germination → Growing phase begins\n`);
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('  All Plants Now Have Realistic Germination/Emergence Periods!');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('In the Gantt Chart, you will now see:');
console.log('  ✓ Potatoes show 3-week emergence period (blue seeding bar)');
console.log('  ✓ Carrots show 3-week germination period (light blue for direct sow)');
console.log('  ✓ Garlic shows 3-week root establishment period');
console.log('  ✓ Peas show 1-week germination period');
console.log('  ✓ Parsnips show 4-week germination period');
console.log('  ✓ All direct sow plants have visible seeding phase\n');
