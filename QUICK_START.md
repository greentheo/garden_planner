# Garden Planner - Quick Start Guide

## Recent Improvements ⭐

1. **More Variety** - Now selects 2-3 plants per category (was 1)
2. **Realistic Proportions** - Alliums now 0.5-3% (was 8-20%)
3. **Visual Calorie Chart** - Bar chart shows where calories come from

## Quick Start

### 1. Start the Server
```bash
cd garden_planner
python3 -m http.server 8000
```

### 2. Open in Browser
Navigate to: `http://localhost:8000`

### 3. Create Your Plan
- **Zone**: Select your USDA hardiness zone (3-11)
- **Recipe**: Choose your growing focus
- **Household Size**: Number of people

### 4. View Results

#### Planting Summary Table
- Shows all selected plants
- Multiple plants per category for variety
- Realistic quantities (not thousands of garlic plants!)
- Summary row with totals

#### Calorie Distribution Chart ⭐ NEW
- Visual bar chart showing calorie sources
- Category bars (darker colors)
- Individual plant bars (lighter colors)
- Percentages of total and by category

#### Garden Space Requirements
- Outdoor vs greenhouse space
- Total square footage
- Smart greenhouse decisions by zone

#### 52-Week Gantt Chart
- All planting and harvest schedules
- Succession plantings clearly shown
- Multiple windows (spring/fall) for cool-season crops

## Recommended Recipes to Try

### For Maximum Variety
**"All - Maximum Variety"** (Zone 7, 4 people)
- 35 different plant varieties
- All 13 categories represented
- 5,060 plants across 1.56 acres
- Perfect for seeing all features

### For Realism
**"Mediterranean"** (Zone 7, 4 people)
- 23 plant varieties
- Starchy base with nightshades and legumes
- 2,108 plants across 0.75 acres
- Practical and achievable

### For High Calories
**"High-Calorie"** (Any zone, 4 people)
- Focuses on potatoes, corn, squash
- Maximum calories per square foot
- Best for food security

## Testing from Command Line

```bash
# Test "All" recipe
node test-all-recipe.js

# Test Mediterranean recipe
node test-mediterranean.js

# Compare across zones
node test-all-zones.js

# Full test suite
node test-final.js
```

## Understanding the Calorie Chart

### Category Bars (Darker Colors)
Show total percentage and calories from each category:
```
Starchy-Root: 22% ████████████████████████
Legume:       18% ████████████████████
```

### Plant Bars (Lighter Colors)
Show individual plant contributions:
```
  Potato:       14.9% (14.9% of total, 67% of category)
  Sweet Potato: 10.0% (10.0% of total, 33% of category)
```

## Before vs After

### Before Improvements
```
Mediterranean Recipe (Zone 7):
  - 10 plant varieties
  - Garlic: 1,718 plants (20% of calories) ❌
  - No visual calorie breakdown
  - One plant per category
```

### After Improvements
```
Mediterranean Recipe (Zone 7):
  - 23 plant varieties ✓
  - Garlic: 60 plants (0.8% of calories) ✓
  - Visual calorie bar chart ✓
  - 2-3 plants per category ✓
```

## Key Features

### Smart Plant Selection
- Automatically selects best 2-3 plants per category
- Distributes calories based on calorie density
- More variety without overwhelming quantity

### Realistic Proportions
- Starchy crops (potatoes, corn, squash): 20-50% of calories
- Legumes (beans, peas): 15-40% of calories
- Alliums (garlic, onions): 0.5-3% (flavor, not calories)
- Herbs: 0.1-1% (flavor only)

### Zone-Aware Planning
- Zones 3-6: Uses greenhouse for season extension
- Zones 7+: Outdoor growing (greenhouse too hot)
- Automatic plant substitution based on zone

### Succession Planting
- Continuous harvest throughout season
- Week-level granularity (52 weeks)
- Multiple plantings for each crop

### Multiple Planting Windows
- Cool-season crops (peas, fava beans): Spring & Fall
- Gap during hot summer months
- Automatic scheduling

## Troubleshooting

### "Too much garlic!"
✓ Fixed! Garlic now 0.8% of calories (was 20%)

### "Not enough variety"
✓ Fixed! Now selects 2-3 plants per category (was 1)

### "Can't see where calories come from"
✓ Fixed! New bar chart shows exact breakdown

### "Unrealistic proportions"
✓ Fixed! All recipes updated with realistic percentages

## Tips

### For Best Results
1. Try "All - Maximum Variety" first to see full capabilities
2. Compare different zones to see greenhouse logic
3. Look at the calorie chart to understand your plan
4. Check succession plantings in Gantt chart

### Customization
- Start with a recipe that matches your goals
- Note which plants are selected
- Adjust household size to scale up/down
- Compare zones if moving or unsure

## Documentation

- **README.md** - Full project documentation
- **IMPROVEMENTS_SUMMARY.md** - Detailed improvement explanation
- **CHANGES_SUMMARY.md** - Before/after comparison
- **DATABASE_EXPANSION.md** - Plant database details
- **FIXES_SUMMARY.md** - Technical fixes

## Questions?

### "Why are some plants repeated in multiple categories?"
Some plants fit multiple categories (e.g., Winter Squash is both "cucurbit" and "starchy"). They're counted separately for calorie purposes.

### "Why only 2-3 plants per category?"
This balances variety with practicality. More would make plans too complex and require too much space.

### "Can I adjust the percentages?"
Not yet in the UI, but you can edit `data/recipes.json` to create custom recipes.

### "What if I don't like a selected plant?"
The system selects based on zone compatibility and calorie density. You can manually substitute plants of similar calorie content from the same category.

## Next Steps

1. ✓ Start server
2. ✓ Open browser
3. ✓ Select zone and recipe
4. ✓ Review calorie chart
5. ✓ Check plant varieties
6. ✓ View Gantt chart
7. ✓ Start planting!

Happy gardening! 🌱🍅🥕
