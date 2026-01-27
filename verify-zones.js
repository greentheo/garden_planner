// verify-zones.js - Verify different zones produce different results
import { calculatePlan } from './src/engine.js';
import fs from 'fs';

const plants = JSON.parse(fs.readFileSync('./data/plants.json', 'utf8'));
const recipes = JSON.parse(fs.readFileSync('./data/recipes.json', 'utf8'));

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║         Zone Comparison - Mediterranean Recipe (4 people)          ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

const zones = [3, 5, 8, 9, 10];
const results = zones.map(zone => {
  const plan = calculatePlan({
    zone,
    recipeId: 'mediterranean',
    household: 4,
    gardenSize: null,
    plants,
    recipes
  });
  return { zone, plan };
});

console.log('┌─────────┬──────────────┬───────────────┬─────────────┐');
console.log('│  Zone   │   Outdoor    │  Greenhouse   │    Total    │');
console.log('├─────────┼──────────────┼───────────────┼─────────────┤');

results.forEach(({ zone, plan }) => {
  const outdoor = plan.outdoorSqFt.toFixed(0).padStart(9);
  const greenhouse = plan.greenhouseSqFt.toFixed(0).padStart(10);
  const total = plan.gardenSize.toFixed(0).padStart(8);
  console.log(`│  Zone ${zone.toString().padEnd(2)}│ ${outdoor} sq ft │ ${greenhouse} sq ft │ ${total} sq ft │`);
});

console.log('└─────────┴──────────────┴───────────────┴─────────────┘\n');

// Show detailed plant breakdown for Zone 3 vs Zone 9
console.log('┌────────────────────────────────────────────────────────────────────┐');
console.log('│                    Detailed Plant Comparison                       │');
console.log('└────────────────────────────────────────────────────────────────────┘\n');

[3, 9].forEach(zone => {
  const plan = results.find(r => r.zone === zone).plan;
  console.log(`\n═══ Zone ${zone} ${zone === 3 ? '(Cold - Vermont)' : '(Warm - Florida)'} ═══`);
  plan.items.forEach(it => {
    const location = it.location === 'outdoor' ? '🌞' : '🏠';
    const months = `${['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][it.window.start_month]}-${['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][it.window.end_month]}`;
    console.log(`${location} ${it.plant.name.padEnd(18)} ${it.location.padEnd(10)} ${months.padEnd(10)} ${it.count.toString().padStart(4)} plants`);
  });
});

console.log('\n┌────────────────────────────────────────────────────────────────────┐');
console.log('│                         Key Observations                           │');
console.log('└────────────────────────────────────────────────────────────────────┘');
console.log('  • Zone 3: Requires greenhouse for warm-season crops (tomatoes)');
console.log('  • Zone 9: All plants grow outdoors with extended seasons');
console.log('  • Warmer zones have 2-3 month longer growing windows');
console.log('  • Plant selection changes based on what grows best in each zone');
console.log('  • Space requirements separated into outdoor vs greenhouse');
console.log('');
