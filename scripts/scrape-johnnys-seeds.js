const https = require('https');
const fs = require('fs');
const path = require('path');

// Categories from Johnny's Seeds - vegetables and herbs
const VEGETABLE_CATEGORIES = [
  'artichokes', 'asparagus', 'beans', 'beets', 'broccoli', 'brussels-sprouts',
  'cabbage', 'carrots', 'cauliflower', 'celery', 'collards', 'corn', 'cucumbers',
  'eggplant', 'garlic', 'greens', 'kale', 'kohlrabi', 'leeks', 'lettuce',
  'melons', 'mustard', 'okra', 'onions', 'parsnips', 'peas', 'peppers',
  'potatoes', 'pumpkins', 'radicchio', 'radishes', 'rutabaga', 'scallions',
  'shallots', 'spinach', 'squash', 'sweet-potatoes', 'swiss-chard', 'tomatillos',
  'tomatoes', 'turnips', 'watermelons', 'zucchini'
];

const HERB_CATEGORIES = [
  'basil', 'cilantro', 'parsley', 'dill', 'oregano', 'thyme', 'sage', 'chives'
];

const FRUIT_CATEGORIES = [
  'strawberries'
];

const CATEGORIES = [...VEGETABLE_CATEGORIES, ...HERB_CATEGORIES, ...FRUIT_CATEGORIES];

const BASE_URL = 'https://www.johnnyseeds.com';

// Simple fetch function using https
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Extract product links from HTML (very basic scraping)
function extractProductLinks(html, categoryName) {
  const products = [];

  // Look for product links - Johnny's uses patterns like /product-name-123.html
  const productLinkRegex = /href="([^"]*\/[a-z0-9-]+-\d+\.html)"/gi;
  const matches = html.matchAll(productLinkRegex);

  for (const match of matches) {
    const href = match[1];
    if (!href.startsWith('http')) {
      products.push({
        url: BASE_URL + href,
        category: categoryName
      });
    } else {
      products.push({
        url: href,
        category: categoryName
      });
    }
  }

  // Also look for product titles to help with matching
  const titleRegex = /<h[2-4][^>]*class="[^"]*product[^"]*"[^>]*>([^<]+)<\/h[2-4]>/gi;
  const titleMatches = html.matchAll(titleRegex);
  const titles = [...titleMatches].map(m => m[1].trim());

  return { products: [...new Set(products.map(p => p.url))].map(url => ({ url, category: categoryName })), titles };
}

async function scrapeCategory(category, section = 'vegetables') {
  const url = `${BASE_URL}/${section}/${category}/`;
  console.log(`Scraping ${category}...`);

  try {
    const html = await fetchPage(url);
    const { products, titles } = extractProductLinks(html, category);
    console.log(`  Found ${products.length} products, ${titles.length} titles`);
    return { category, url, products, titles, section };
  } catch (error) {
    console.error(`  Error scraping ${category}:`, error.message);
    return { category, url, products: [], titles: [], error: error.message, section };
  }
}

// Load existing plants data
function loadPlants() {
  const plantsPath = path.join(__dirname, '..', 'data', 'plants.json');
  const data = fs.readFileSync(plantsPath, 'utf8');
  return JSON.parse(data);
}

// Match plant names to categories
function matchPlantToCategory(plantName) {
  const name = plantName.toLowerCase();

  // Direct matches or common variations
  const categoryMap = {
    'tomato': 'tomatoes',
    'tomatoes': 'tomatoes',
    'lettuce': 'lettuce',
    'carrot': 'carrots',
    'carrots': 'carrots',
    'cucumber': 'cucumbers',
    'cucumbers': 'cucumbers',
    'pepper': 'peppers',
    'peppers': 'peppers',
    'bell pepper': 'peppers',
    'bean': 'beans',
    'beans': 'beans',
    'pea': 'peas',
    'peas': 'peas',
    'corn': 'corn',
    'squash': 'squash',
    'zucchini': 'squash',
    'pumpkin': 'pumpkins',
    'pumpkins': 'pumpkins',
    'melon': 'melons',
    'melons': 'melons',
    'cantaloupe': 'melons',
    'watermelon': 'watermelons',
    'watermelons': 'watermelons',
    'onion': 'onions',
    'onions': 'onions',
    'garlic': 'garlic',
    'potato': 'potatoes',
    'potatoes': 'potatoes',
    'sweet potato': 'sweet-potatoes',
    'kale': 'kale',
    'spinach': 'spinach',
    'chard': 'swiss-chard',
    'swiss chard': 'swiss-chard',
    'broccoli': 'broccoli',
    'cauliflower': 'cauliflower',
    'cabbage': 'cabbage',
    'bok choy': 'greens',
    'brussels sprout': 'brussels-sprouts',
    'brussels sprouts': 'brussels-sprouts',
    'eggplant': 'eggplant',
    'radish': 'radishes',
    'radishes': 'radishes',
    'beet': 'beets',
    'beets': 'beets',
    'turnip': 'turnips',
    'turnips': 'turnips',
    'parsnip': 'parsnips',
    'parsnips': 'parsnips',
    'celery': 'celery',
    'leek': 'leeks',
    'leeks': 'leeks',
    'asparagus': 'asparagus',
    'artichoke': 'artichokes',
    'artichokes': 'artichokes',
    'okra': 'okra',
    'collard': 'collards',
    'collards': 'collards',
    'mustard': 'mustard',
    'kohlrabi': 'kohlrabi',
    'rutabaga': 'rutabaga',
    'scallion': 'scallions',
    'scallions': 'scallions',
    'shallot': 'shallots',
    'shallots': 'shallots',
    'tomatillo': 'tomatillos',
    'tomatillos': 'tomatillos',
    'radicchio': 'radicchio',
    'greens': 'greens',
    'arugula': 'greens',
    'edamame': 'beans',
    'soybean': 'beans',
    // Herbs
    'basil': 'basil',
    'cilantro': 'cilantro',
    'coriander': 'cilantro',
    'parsley': 'parsley',
    'dill': 'dill',
    'oregano': 'oregano',
    'thyme': 'thyme',
    'sage': 'sage',
    'chives': 'chives',
    'strawberry': 'strawberries',
    'strawberries': 'strawberries'
  };

  // Check for direct matches
  for (const [key, category] of Object.entries(categoryMap)) {
    if (name.includes(key)) {
      return category;
    }
  }

  return null;
}

async function main() {
  console.log('Starting Johnny\'s Seeds scraper...\n');

  // Scrape all categories
  const results = [];
  for (const category of VEGETABLE_CATEGORIES) {
    const result = await scrapeCategory(category, 'vegetables');
    results.push(result);
    // Be polite - wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  for (const category of HERB_CATEGORIES) {
    const result = await scrapeCategory(category, 'herbs');
    results.push(result);
    // Be polite - wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  for (const category of FRUIT_CATEGORIES) {
    const result = await scrapeCategory(category, 'fruit');
    results.push(result);
    // Be polite - wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save raw results
  const rawDataPath = path.join(__dirname, 'johnnys-seeds-raw.json');
  fs.writeFileSync(rawDataPath, JSON.stringify(results, null, 2));
  console.log(`\nRaw data saved to ${rawDataPath}`);

  // Load plants and try to match
  const plants = loadPlants();
  console.log(`\nLoaded ${plants.length} plants from database`);

  // Create a mapping of category to URLs
  const categoryUrls = {};
  results.forEach(r => {
    if (r.products.length > 0) {
      categoryUrls[r.category] = {
        categoryUrl: r.url,
        productCount: r.products.length,
        sampleProducts: r.products.slice(0, 5) // Keep first 5 as examples
      };
    }
  });

  // Match plants to categories and add URLs
  const updatedPlants = plants.map(plant => {
    const category = matchPlantToCategory(plant.name);

    if (category && categoryUrls[category]) {
      return {
        ...plant,
        seed_source: {
          supplier: 'Johnny\'s Selected Seeds',
          category_url: categoryUrls[category].categoryUrl,
          category: category,
          notes: `${categoryUrls[category].productCount} products available in this category`
        }
      };
    }

    return plant;
  });

  // Show summary
  const matchedCount = updatedPlants.filter(p => p.seed_source).length;
  console.log(`\nMatched ${matchedCount} out of ${plants.length} plants to Johnny's Seeds categories`);
  console.log('\nMatched plants:');
  updatedPlants.filter(p => p.seed_source).forEach(p => {
    console.log(`  - ${p.name} -> ${p.seed_source.category_url}`);
  });

  console.log('\nUnmatched plants:');
  updatedPlants.filter(p => !p.seed_source).forEach(p => {
    console.log(`  - ${p.name}`);
  });

  // Save updated plants
  const updatedPlantsPath = path.join(__dirname, 'plants-with-urls.json');
  fs.writeFileSync(updatedPlantsPath, JSON.stringify(updatedPlants, null, 2));
  console.log(`\nUpdated plants data saved to ${updatedPlantsPath}`);
  console.log('Review the file, then copy it to data/plants.json to apply changes.');
}

main().catch(console.error);
