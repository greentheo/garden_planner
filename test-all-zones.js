// test-all-zones.js - Test "All" recipe across different zones
import { calculatePlan } from './src/engine.js';
import fs from 'fs';

const plants = JSON.parse(fs.readFileSync('./data/plants.json', 'utf8'));
const recipes = JSON.parse(fs.readFileSync('./data/recipes.json', 'utf8'));

console.log('═══════════════════════════════════════════════════════════════');
console.log('  "All - Maximum Variety" Recipe Across Climate Zones');
console.log('═══════════════════════════════════════════════════════════════\n');

const testZones = [3, 5, 7, 9];
const results = [];

testZones.forEach(zone => {
  const plan = calculatePlan({
    zone,
    recipeId: 'all',
    household: 4,
    gardenSize: null,
    plants,
    recipes
  });

  const outdoorAcres = (plan.outdoorSqFt / 43560).toFixed(2);
  const greenhouseAcres = (plan.greenhouseSqFt / 43560).toFixed(2);
  const totalAcres = (plan.gardenSize / 43560).toFixed(2);

  results.push({
    zone,
    plan,
    outdoorAcres,
    greenhouseAcres,
    totalAcres
  });

  console.log(`ZONE ${zone}`);
  console.log('─────────────────────────────────────────────────────────────');
  console.log(`  Total Plants:     ${plan.summary.totalPlants.toLocaleString()}`);
  console.log(`  Total Yield:      ${plan.summary.totalYield.toFixed(0)} lbs`);
  console.log(`  Calories/lb:      ${plan.summary.avgCaloriesPerLb.toFixed(0)}`);
  console.log(`  Percent Filled:   ${plan.summary.percentFilled}%`);
  console.log(`  Garden Size:      ${totalAcres} acres`);
  console.log(`    - Outdoor:      ${outdoorAcres} acres`);
  console.log(`    - Greenhouse:   ${greenhouseAcres} acres`);
  console.log('');

  // Count succession plantings
  let totalSuccessions = 0;
  let multiWindowCrops = 0;
  plan.items.forEach(item => {
    totalSuccessions += item.successionSchedules.length;
    if (item.hasMultipleWindows) multiWindowCrops++;
  });

  console.log(`  Plant Varieties:  ${plan.items.length}`);
  console.log(`  Successions:      ${totalSuccessions}`);
  console.log(`  Multiple Windows: ${multiWindowCrops} crops`);
  console.log('');

  // Show which crops are outdoor vs greenhouse
  const outdoorCrops = plan.items.filter(it => it.location === 'outdoor' || it.location === 'greenhouse-extended').length;
  const greenhouseCrops = plan.items.filter(it => it.location === 'greenhouse' || it.location === 'greenhouse-only').length;

  console.log(`  Growing Locations:`);
  console.log(`    - Outdoor:      ${outdoorCrops} crops`);
  console.log(`    - Greenhouse:   ${greenhouseCrops} crops`);
  console.log('');
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Zone Comparison Summary');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('Zone    Plants   Yield(lbs)  Acres    Outdoor   Greenhouse  %Filled');
console.log('─────────────────────────────────────────────────────────────────');
results.forEach(r => {
  console.log(
    `${r.zone.toString().padStart(4)}    ` +
    `${r.plan.summary.totalPlants.toString().padStart(6)}   ` +
    `${r.plan.summary.totalYield.toFixed(0).padStart(9)}  ` +
    `${r.totalAcres.padStart(6)}   ` +
    `${r.outdoorAcres.padStart(7)}   ` +
    `${r.greenhouseAcres.padStart(10)}  ` +
    `${r.plan.summary.percentFilled.padStart(6)}%`
  );
});

console.log('');
console.log('Key Insights:');
console.log('- Zone 3 (coldest): May require more greenhouse space');
console.log('- Zone 5 (cool): Benefits from greenhouse season extension');
console.log('- Zone 7 (moderate): Long outdoor season, minimal greenhouse');
console.log('- Zone 9 (warm): Extended growing season, outdoor preferred');
console.log('');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Test Complete! ✓');
console.log('═══════════════════════════════════════════════════════════════\n');
