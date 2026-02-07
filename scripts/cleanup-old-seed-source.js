const fs = require('fs');
const path = require('path');

// Remove old seed_source field, keep only seed_sources array
function cleanupPlants() {
  const plantsPath = path.join(__dirname, '..', 'data', 'plants.json');
  const plants = JSON.parse(fs.readFileSync(plantsPath, 'utf8'));

  const cleanedPlants = plants.map(plant => {
    const { seed_source, ...rest } = plant;
    return rest;
  });

  fs.writeFileSync(plantsPath, JSON.stringify(cleanedPlants, null, 2));
  console.log(`Cleaned up ${plants.length} plants - removed old 'seed_source' field`);
}

cleanupPlants();
