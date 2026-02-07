# Seed Supplier Integration

## Overview
Added integration with 3 major seed suppliers to make it easy for users to purchase seeds for their garden plan.

## Suppliers Integrated
1. **Johnny's Selected Seeds** (johnnyseeds.com)
   - 50/50 plants covered
   - Vegetables, herbs, and fruits

2. **Burpee** (burpee.com)
   - 48/50 plants covered
   - Missing: Butternut Squash, Winter Squash

3. **Hoss Tools** (growhoss.com)
   - 49/50 plants covered
   - Missing: Strawberries

## Coverage Summary
- **47 plants** available from all 3 suppliers
- **3 plants** missing from 1 supplier each

## Data Structure
Each plant now has a `seed_sources` array:
```json
{
  "id": 1,
  "name": "Tomato",
  "seed_sources": [
    {
      "supplier": "Johnny's Selected Seeds",
      "category_url": "https://www.johnnyseeds.com/vegetables/tomatoes/",
      "category": "tomatoes"
    },
    {
      "supplier": "Burpee",
      "category_url": "https://www.burpee.com/vegetables/tomatoes/",
      "category": "tomatoes"
    },
    {
      "supplier": "Hoss Tools",
      "category_url": "https://growhoss.com/collections/tomatoes",
      "category": "tomatoes"
    }
  ]
}
```

## UI Features
1. **Supplier Selector** - Added to the garden planning form
   - Dropdown menu with 3 suppliers
   - Default: Johnny's Selected Seeds

2. **Clickable Plant Names** - In the planting summary table
   - Plant names become links to the selected supplier's seed category
   - Opens in new tab for easy shopping
   - Shows 🔗 icon to indicate link
   - Styled with green color and dashed underline

## Files Modified
- `data/plants.json` - Added seed_sources array to all 50 plants
- `index.html` - Added seed supplier selector form field
- `src/ui.js` - Updated showPlan() to accept supplier and create links
- `src/app.js` - Pass selected supplier to showPlan()

## Scripts Created
- `scripts/scrape-johnnys-seeds.js` - Scrapes Johnny's Seeds categories
- `scripts/scrape-multi-supplier.js` - Adds all 3 suppliers to plant data
- `scripts/cleanup-old-seed-source.js` - Removes deprecated singular field

## Backups
- `data/plants.json.backup` - Original file before Johnny's Seeds
- `data/plants.json.backup2` - Before multi-supplier integration

## How It Works
1. User selects preferred seed supplier in the form
2. Generates garden plan
3. Each plant name in the summary table links to that supplier's category page
4. User clicks plant name to browse and purchase seeds
5. Category pages typically contain 5-15 varieties to choose from

## Future Enhancements
- Add more suppliers (Baker Creek, High Mowing, etc.)
- Link to specific varieties instead of categories
- Include pricing information
- Show stock availability
- Compare prices across suppliers
