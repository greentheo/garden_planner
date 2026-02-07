const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URLS = {
  johnnys: 'https://www.johnnyseeds.com',
  burpee: 'https://www.burpee.com',
  growhoss: 'https://growhoss.com'
};

// Category mappings for each supplier
const SUPPLIER_CATEGORIES = {
  growhoss: {
    vegetables: {
      'tomatoes': '/collections/tomatoes',
      'peppers': '/collections/peppers',
      'cucumbers': '/collections/cucumbers',
      'carrots': '/collections/carrots',
      'lettuce': '/collections/lettuce',
      'spinach': '/collections/spinach',
      'beans': '/collections/beans',
      'broccoli': '/collections/broccoli',
      'kale': '/collections/kale',
      'squash': '/collections/summer-squash',
      'winter-squash': '/collections/winter-squash',
      'potatoes': '/collections/potatoes',
      'onions': '/collections/onions',
      'garlic': '/collections/garlic',
      'cabbage': '/collections/cabbage',
      'peas': '/collections/peas',
      'eggplant': '/collections/eggplant',
      'radishes': '/collections/radishes',
      'beets': '/collections/beets',
      'melons': '/collections/melons',
      'watermelon': '/collections/watermelon',
      'swiss-chard': '/collections/swiss-chard',
      'collards': '/collections/collards',
      'turnips': '/collections/turnips',
      'parsnips': '/collections/parsnips',
      'brussels-sprouts': '/collections/brussels-sprouts',
      'cauliflower': '/collections/cauliflower',
      'leeks': '/collections/leeks',
      'corn': '/collections/corn',
      'pumpkins': '/collections/pumpkins',
      'asparagus': '/collections/asparagus',
      'kohlrabi': '/collections/kohlrabi',
      'rutabaga': '/collections/rutabaga',
      'tomatillos': '/collections/tomatillos',
      'okra': '/collections/okra',
      'celery': '/collections/celery-1',
      'greens': '/collections/greens'
    },
    herbs: {
      'basil': '/collections/basil',
      'cilantro': '/collections/cilantro',
      'parsley': '/collections/parsley'
    }
  },
  burpee: {
    vegetables: {
      'tomatoes': '/vegetables/tomatoes/',
      'peppers': '/vegetables/peppers/',
      'cucumbers': '/vegetables/cucumbers/',
      'carrots': '/vegetables/carrots/',
      'lettuce': '/vegetables/lettuce/',
      'spinach': '/vegetables/spinach/',
      'beans': '/vegetables/beans/',
      'broccoli': '/vegetables/broccoli/',
      'kale': '/vegetables/kale/',
      'squash': '/vegetables/squash/',
      'potatoes': '/vegetables/potatoes/',
      'onions': '/vegetables/onions/',
      'garlic': '/vegetables/garlic/',
      'cabbage': '/vegetables/cabbage/',
      'peas': '/vegetables/peas/',
      'eggplant': '/vegetables/eggplant/',
      'radishes': '/vegetables/radishes/',
      'beets': '/vegetables/beets/',
      'melons': '/vegetables/melons/',
      'watermelon': '/vegetables/watermelon/',
      'swiss-chard': '/vegetables/swiss-chard/',
      'collards': '/vegetables/collards/',
      'turnips': '/vegetables/turnips/',
      'parsnips': '/vegetables/parsnips/',
      'brussels-sprouts': '/vegetables/brussels-sprouts/',
      'cauliflower': '/vegetables/cauliflower/',
      'leeks': '/vegetables/leeks/',
      'corn': '/vegetables/corn/',
      'pumpkins': '/vegetables/pumpkins/',
      'asparagus': '/vegetables/asparagus/',
      'kohlrabi': '/vegetables/kohlrabi/',
      'rutabaga': '/vegetables/rutabaga/',
      'tomatillos': '/vegetables/tomatillos/',
      'okra': '/vegetables/okra/',
      'celery': '/vegetables/celery/',
      'greens': '/vegetables/greens/',
      'zucchini': '/vegetables/zucchini/'
    },
    herbs: {
      'basil': '/herbs/basil/',
      'cilantro': '/herbs/cilantro/',
      'parsley': '/herbs/parsley/'
    },
    fruit: {
      'strawberries': '/fruit/strawberries/'
    }
  }
};

// Match plant names to categories (reuse from previous script)
function matchPlantToCategory(plantName) {
  const name = plantName.toLowerCase();

  const categoryMap = {
    'tomato': 'tomatoes',
    'bell pepper': 'peppers',
    'pepper': 'peppers',
    'hot pepper': 'peppers',
    'cucumber': 'cucumbers',
    'carrot': 'carrots',
    'lettuce': 'lettuce',
    'spinach': 'spinach',
    'green bean': 'beans',
    'bean': 'beans',
    'broccoli': 'broccoli',
    'kale': 'kale',
    'butternut squash': 'winter-squash',
    'winter squash': 'winter-squash',
    'acorn squash': 'squash',
    'squash': 'squash',
    'zucchini': 'squash',
    'potato': 'potatoes',
    'sweet potato': 'potatoes',
    'onion': 'onions',
    'green onion': 'onions',
    'scallion': 'onions',
    'garlic': 'garlic',
    'cabbage': 'cabbage',
    'bok choy': 'greens',
    'pea': 'peas',
    'eggplant': 'eggplant',
    'radish': 'radishes',
    'beet': 'beets',
    'cantaloupe': 'melons',
    'melon': 'melons',
    'watermelon': 'watermelon',
    'arugula': 'greens',
    'swiss chard': 'swiss-chard',
    'chard': 'swiss-chard',
    'collard': 'collards',
    'turnip': 'turnips',
    'parsnip': 'parsnips',
    'brussels sprout': 'brussels-sprouts',
    'cauliflower': 'cauliflower',
    'edamame': 'beans',
    'lima bean': 'beans',
    'fava bean': 'beans',
    'leek': 'leeks',
    'shallot': 'onions',
    'basil': 'basil',
    'cilantro': 'cilantro',
    'parsley': 'parsley',
    'corn': 'corn',
    'pumpkin': 'pumpkins',
    'asparagus': 'asparagus',
    'strawberr': 'strawberries',
    'mustard': 'greens',
    'kohlrabi': 'kohlrabi',
    'rutabaga': 'rutabaga',
    'tomatillo': 'tomatillos',
    'okra': 'okra',
    'celery': 'celery'
  };

  for (const [key, category] of Object.entries(categoryMap)) {
    if (name.includes(key)) {
      return category;
    }
  }

  return null;
}

function getCategoryUrl(supplier, category) {
  const supplierData = SUPPLIER_CATEGORIES[supplier];
  if (!supplierData) return null;

  // Check in all sections (vegetables, herbs, fruit)
  for (const section of Object.values(supplierData)) {
    if (section[category]) {
      return BASE_URLS[supplier] + section[category];
    }
  }

  return null;
}

function loadPlants() {
  const plantsPath = path.join(__dirname, '..', 'data', 'plants.json');
  const data = fs.readFileSync(plantsPath, 'utf8');
  return JSON.parse(data);
}

async function main() {
  console.log('Adding multiple seed suppliers to plants database...\n');

  const plants = loadPlants();
  console.log(`Loaded ${plants.length} plants from database\n`);

  // Update each plant with multiple seed sources
  const updatedPlants = plants.map(plant => {
    const category = matchPlantToCategory(plant.name);

    // Keep existing seed_source if present
    const seedSources = [];

    if (plant.seed_source) {
      seedSources.push(plant.seed_source);
    }

    // Add Burpee
    if (category) {
      const burpeeUrl = getCategoryUrl('burpee', category);
      if (burpeeUrl) {
        seedSources.push({
          supplier: 'Burpee',
          category_url: burpeeUrl,
          category: category
        });
      }

      // Add GrowHoss
      const growhossUrl = getCategoryUrl('growhoss', category);
      if (growhossUrl) {
        seedSources.push({
          supplier: 'Hoss Tools',
          category_url: growhossUrl,
          category: category
        });
      }
    }

    // Update plant with seed_sources array
    return {
      ...plant,
      seed_sources: seedSources
    };
  });

  // Show summary
  console.log('Summary by supplier:');
  const supplierCounts = {
    'Johnny\'s Selected Seeds': 0,
    'Burpee': 0,
    'Hoss Tools': 0
  };

  updatedPlants.forEach(plant => {
    plant.seed_sources.forEach(source => {
      supplierCounts[source.supplier] = (supplierCounts[source.supplier] || 0) + 1;
    });
  });

  Object.entries(supplierCounts).forEach(([supplier, count]) => {
    console.log(`  ${supplier}: ${count} plants`);
  });

  // Show plants with all three suppliers
  const plantsWithAll = updatedPlants.filter(p => p.seed_sources.length === 3);
  console.log(`\nPlants available from all 3 suppliers: ${plantsWithAll.length}`);

  // Show plants missing suppliers
  const plantsMissing = updatedPlants.filter(p => p.seed_sources.length < 3);
  console.log(`\nPlants with missing suppliers (${plantsMissing.length}):`);
  plantsMissing.forEach(plant => {
    const suppliers = plant.seed_sources.map(s => s.supplier).join(', ');
    console.log(`  ${plant.name}: ${suppliers || 'none'}`);
  });

  // Save updated plants
  const outputPath = path.join(__dirname, 'plants-multi-supplier.json');
  fs.writeFileSync(outputPath, JSON.stringify(updatedPlants, null, 2));
  console.log(`\nUpdated plants data saved to ${outputPath}`);
  console.log('Review the file, then copy it to data/plants.json to apply changes.');
}

main().catch(console.error);
