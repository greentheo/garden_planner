# Garden Planner

A zone-aware vegetable garden planning tool that calculates optimal plant quantities, timing, and space requirements based on USDA hardiness zones, household size, and recipe preferences.

## Features

### 🌡️ Zone-Aware Planning
- Supports USDA hardiness zones 3-11
- Automatic plant selection based on zone compatibility
- **Greenhouse toggle** - Choose outdoor-only or greenhouse-extended schedules:
  - **Default: Outdoor-only** (unchecked) - Realistic for most home gardeners
  - **With greenhouse** (checked) - Season extension in zones 3-6
  - Zones 7+: Outdoor growing preferred (greenhouse too hot)
  - Prevents impossible planting dates (e.g., potatoes in February without greenhouse)

### 📅 Week-Level Scheduling
- Precise 52-week calendar (not monthly)
- Three-phase schedules: Seed → Grow → Harvest
- Automatic succession planting calculations
- Multiple planting windows for cool-season crops (spring/fall)

### 🌱 Comprehensive Plant Database
- **50 diverse plants** across 13 categories:
  - Nightshade (tomatoes, peppers, eggplant, tomatillos)
  - Leafy Greens (lettuce, kale, spinach, arugula, chard, collards, mustard greens, bok choy)
  - Cruciferous (broccoli, cabbage, brussels sprouts, cauliflower, kohlrabi)
  - Legumes (peas, beans, edamame, lima beans, fava beans)
  - Cucurbits (zucchini, cucumbers, squash, melons, pumpkins)
  - Root Vegetables (carrots, beets, radishes, turnips, parsnips, rutabaga)
  - Starchy Roots (potatoes, sweet potatoes)
  - Alliums (onions, garlic, leeks, shallots, green onions)
  - Herbs (basil, cilantro, parsley)
  - Fruits (strawberries, cantaloupe, watermelon)
  - Grains (corn)
  - Perennials (asparagus)
  - Winter Squash (butternut, acorn, winter squash, pumpkins)

### 🍽️ Recipe-Based Planning
- **11 pre-defined recipes** for different growing goals:
  - **Vegetarian** - Balanced plant-based diet
  - **Mediterranean** - Tomatoes, cucurbits, alliums focus
  - **High-Calorie** - Starchy vegetables for maximum calories
  - **Salad & Greens Focus** - Leafy greens emphasis
  - **Protein-Rich** - Legumes and protein vegetables
  - **Root Vegetable** - Root crops and storage vegetables
  - **Summer Harvest** - Peak summer warm-season crops
  - **Fall & Winter Storage** - Long-storing crops
  - **Spring Fresh Greens** - Early spring cool-season crops
  - **Diverse Garden Mix** - Balanced variety
  - **All - Maximum Variety** ⭐ - Plants everything (all 13 categories)

### 📊 Smart Calculations
- Automatic calorie-based plant selection
- Succession planting for continuous harvest
- Space requirements (outdoor vs greenhouse)
- Total yield predictions
- Percent of calorie needs met

### 📈 Visualizations
- **Summary Table**: Plant counts, calories, yields, space
- **Calorie Distribution Chart** ⭐ - Visual bar chart showing where calories come from
- **Gantt Chart**: All 52 weeks showing seed/transplant/grow/harvest phases
- **Garden Layout**: Visual plot allocation (outdoor vs greenhouse)
- **Greenhouse Status**: Clear indicator of outdoor-only vs greenhouse-extended mode

## Quick Start

### 1. Clone and Open
```bash
git clone <repo-url>
cd garden_planner
```

### 2. Start Local Server
```bash
python3 -m http.server 8000
```

### 3. Open in Browser
Navigate to `http://localhost:8000`

### 4. Select Your Parameters
- **Zone**: Your USDA hardiness zone (3-11)
- **Recipe**: Growing goal (try "All - Maximum Variety" first!)
- **Household Size**: Number of people
- **Greenhouse** (optional): Check if you have a greenhouse
  - Unchecked (default): Outdoor-only, realistic planting dates
  - Checked: Season extension in zones 3-6 (earlier starts, later harvests)

### 5. View Results
- Summary statistics with greenhouse status
- Calorie distribution chart (where calories come from)
- Detailed plant list with successions (2-3 varieties per category!)
- 52-week Gantt chart
- Garden space requirements

## Testing

### Run All Tests
```bash
# Comprehensive test suite
node test-final.js

# Test "All - Maximum Variety" recipe
node test-all-recipe.js

# Compare zones with "All" recipe
node test-all-zones.js

# Original zone verification
node verify-zones.js
```

### Test Output Example
```
Zone 7, Mediterranean, 4 People:
  Total Calories Needed:    1,022,000
  Total Calories Produced:  1,025,288
  Percent Filled:           100.3%
  Total Plants:             2,427
  Total Yield:              7,847 lbs
  Outdoor:                  57,363 sq ft (1.32 acres)
  Greenhouse:               0 sq ft
```

## Example Plans

### Zone 7 - "All - Maximum Variety" - 4 People
**Summary:**
- 8,443 plants across 13 categories
- 16,978 lbs total yield
- 2.77 acres outdoor space
- 0 acres greenhouse (zone 7 is warm enough)
- 100.2% of calorie needs met

**Selected Plants:**
| Category | Plant | Successions | Special |
|----------|-------|-------------|---------|
| Nightshade | Tomato | 4 | Every 2 weeks |
| Leafy Greens | Kale | 1 | - |
| Cruciferous | Cabbage | 8 | Every 2 weeks |
| Legume | Fava Beans | 2 | Spring & Fall |
| Cucurbit | Winter Squash | 1 | - |
| Root Veg | Rutabaga | 1 | - |
| Starchy Root | Potato | 5 | Every 3 weeks |
| Allium | Garlic | 1 | - |
| Herb | Parsley | 1 | - |
| Fruit | Watermelon | 1 | - |
| Grain | Corn | 5 | Every 2 weeks |
| Starchy | Winter Squash | 1 | - |
| Perennial | Strawberries | 1 | - |

### Zone Comparison (All Recipe)
| Zone | Plants | Yield | Acres | Outdoor | Greenhouse | Climate |
|------|--------|-------|-------|---------|------------|---------|
| 3 | 9,061 | 16,906 lbs | 2.79 | 0.00 | 2.79 | Coldest - needs protection |
| 5 | 8,443 | 16,978 lbs | 2.77 | 0.00 | 2.77 | Cool - uses season extension |
| 7 | 8,443 | 16,978 lbs | 2.77 | 2.77 | 0.00 | Moderate - all outdoor |
| 9 | 8,873 | 17,494 lbs | 3.56 | 3.56 | 0.00 | Warm - extended season |

## Architecture

### Data Files
- **`data/plants.json`** - 50 plants with zone schedules
- **`data/recipes.json`** - 11 category-based recipes

### Core Logic
- **`src/engine.js`** - Plant selection, scheduling, calculations
  - `getGrowingLocation()` - Determines outdoor/greenhouse/impossible
  - `shouldUseGreenhouseExtension()` - Zone 3-6 logic
  - `getPlantingSchedule()` - Week-based schedules
  - `calculateSuccessionPlantings()` - Multiple planting dates
  - `selectPlantsForZone()` - Best plant per category
  - `calculatePlan()` - Main planning function

### UI
- **`src/ui.js`** - Visualizations and tables
  - `renderSummary()` - Statistics display
  - `renderPlanTable()` - Plant list with totals
  - `renderGanttChart()` - 52-week timeline
  - `renderGardenPlot()` - Space allocation

### Web Interface
- **`index.html`** - Main application interface
- **`styles.css`** - Styling

## Key Concepts

### Zone-Aware Plant Selection
Plants have zone-specific growing conditions:
```json
{
  "name": "Tomato",
  "growing_conditions": {
    "outdoor_zones": { "min": 5, "max": 11 },
    "greenhouse_zones": { "min": 3, "max": 4 },
    "impossible_zones": [1, 2]
  }
}
```

System automatically selects:
- **Outdoor** if zone is within outdoor_zones
- **Greenhouse** if zone requires protection
- **Greenhouse-Extended** if zone 3-6 (season extension)

### Category-Based Recipes
Recipes specify plant categories, not specific plants:
```json
{
  "id": "mediterranean",
  "components": [
    { "category": "nightshade", "calorie_share": 0.45 },
    { "category": "cucurbit", "calorie_share": 0.20 }
  ]
}
```

System picks best plant from each category based on:
1. Zone compatibility (outdoor > greenhouse > impossible)
2. Calorie density (calories_per_lb × yield_per_plant)

### Week-Based Schedules
Each plant has zone-specific schedules:
```json
{
  "zone_range": [7, 9],
  "outdoor": {
    "seed_start_week": 10,
    "transplant_week": 16,
    "first_harvest_week": 27,
    "last_harvest_week": 42
  }
}
```

### Succession Planting
Plants with `succession_planting_weeks > 0` get multiple plantings:
```javascript
// Tomato: succession_planting_weeks = 2
// Zone 7: Weeks 10-42 growing window
// Results in 4 successions:
Succession #1: Seed W10, Harvest W27-37
Succession #2: Seed W12, Harvest W29-39
Succession #3: Seed W14, Harvest W31-41
Succession #4: Seed W16, Harvest W33-42
```

### Multiple Planting Windows
Cool-season crops (peas, fava beans) have spring and fall windows:
```json
{
  "name": "Peas",
  "multiple_windows": true,
  "zone_adjusted_schedules": [{
    "outdoor": [
      { "name": "Spring", "seed_start_week": 6, ... },
      { "name": "Fall", "seed_start_week": 32, ... }
    ]
  }]
}
```

## Documentation

- **`FIXES_SUMMARY.md`** - Details on greenhouse logic, succession planting, and multiple windows
- **`DATABASE_EXPANSION.md`** - Documentation of 30 new plants and 5 new recipes
- **`test-fixes.js`** - Tests for greenhouse and succession features
- **`test-final.js`** - Comprehensive test suite
- **`test-all-recipe.js`** - "All - Maximum Variety" recipe test
- **`test-all-zones.js`** - Zone comparison test

## Technical Details

### Plant Data Structure
```javascript
{
  "id": 1,
  "name": "Tomato",
  "category": ["nightshade", "fruit-vegetable"],
  "seed_per_sqft": 30,
  "yield_per_plant": 15,
  "calories_per_lb": 82,
  "days_to_maturity": 75,
  "harvest_period_weeks": 10,
  "succession_planting_weeks": 2,
  "multiple_windows": false,
  "growing_conditions": { ... },
  "zone_adjusted_schedules": [ ... ]
}
```

### Recipe Data Structure
```javascript
{
  "id": "mediterranean",
  "name": "Mediterranean",
  "recipe_percentage": 0.35,  // 35% of annual calories
  "components": [
    { "category": "nightshade", "calorie_share": 0.45 },
    { "category": "cucurbit", "calorie_share": 0.20 }
  ]
}
```

### Calculation Flow
1. Load plants and recipes
2. Select zone and recipe
3. Calculate annual calorie needs (household × 2000 cal/day × 365)
4. For each recipe component:
   - Find all plants matching category
   - Score by zone compatibility and calorie density
   - Select best plant
   - Get zone-specific schedule
   - Calculate succession plantings
   - Determine plant count needed
5. Sum totals and generate visualizations

## Browser Support

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

Requires JavaScript enabled.

## Contributing

### Adding New Plants
1. Add entry to `data/plants.json` with next ID
2. Include all required fields
3. Add zone_adjusted_schedules for multiple zone ranges
4. Test with `node test-final.js`

### Adding New Recipes
1. Add entry to `data/recipes.json`
2. Use category names (not plant IDs)
3. Ensure calorie_share values sum to 1.0
4. Test in browser and CLI

### Testing Changes
```bash
# Verify all tests pass
node test-final.js
node test-all-recipe.js
node test-all-zones.js
node verify-zones.js

# Test in browser
python3 -m http.server 8000
# Open http://localhost:8000
```

## Future Enhancements

- [ ] Frost date integration (instead of fixed weeks)
- [ ] Companion planting suggestions
- [ ] Pest/disease resistance data
- [ ] Water requirement calculations
- [ ] Soil pH preferences
- [ ] Mobile-responsive design
- [ ] Export to CSV/PDF
- [ ] Shopping list generation (seeds, supplies)
- [ ] Cost estimation
- [ ] Multi-year crop rotation planning

## License

MIT License - feel free to use and modify for your garden planning needs!

## Acknowledgments

- USDA Plant Hardiness Zone Map
- Calorie data from USDA FoodData Central
- Growing schedules based on regional gardening guides

---

**Happy Garden Planning! 🌱🍅🥕**
