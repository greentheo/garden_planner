# Zone-Aware Garden Planner - Implementation Summary

## Overview
Successfully implemented a zone-aware architecture that automatically selects plants based on USDA hardiness zones, adjusts planting schedules, and tracks outdoor vs. greenhouse space requirements.

## What Changed

### 1. Data Structure Updates

#### plants.json (data/plants.json)
- **Added `category` field**: Each plant now has one or more categories (e.g., "nightshade", "leafy-greens", "cucurbit")
- **Added `growing_conditions`**:
  - `outdoor_zones`: { min, max } zones where plant grows outdoors
  - `greenhouse_zones`: { min, max } zones where greenhouse is needed
  - `impossible_zones`: zones where plant won't grow even with greenhouse
- **Added `zone_adjusted_windows`**: Different planting windows for different zone ranges
  - Example: Tomatoes in Zone 9 grow Mar-Nov, but Zone 5 only Apr-Oct

#### recipes.json (data/recipes.json)
- **Changed from plant_id to category-based**: Recipes now specify categories instead of specific plants
- **Component structure**: `{ "category": "nightshade", "calorie_share": 0.45 }`
- This allows the engine to automatically select the best plant for each category based on zone

### 2. Engine Logic (src/engine.js)

#### New Functions:

**`getGrowingLocation(plant, zone)`**
- Determines if a plant can grow "outdoor", "greenhouse", or is "impossible" in a given zone
- Checks zone ranges in growing_conditions

**`getPlantingWindow(plant, zone)`**
- Returns the appropriate planting window for a plant in a specific zone
- Looks up zone_adjusted_windows and returns { start_month, end_month, needs_greenhouse }

**`selectPlantsForZone(category, zone, availablePlants)`**
- Finds all plants matching a category
- Scores each plant by:
  - Location priority: outdoor (3) > greenhouse (2) > impossible (0)
  - Calorie yield: calories_per_lb × yield_per_plant
- Returns sorted array of viable plants (best first)

**`calculatePlan()` - Updated**
- Now uses category-based selection instead of plant_ids
- Automatically selects best plant for each category based on zone
- Tracks outdoor and greenhouse space separately
- Includes zone-adjusted planting windows in output

### 3. UI Updates (src/ui.js)

#### Table Display:
- Added "Category" column showing plant category
- Added "Growing Location" column with icons:
  - 🌞 Outdoor (green background)
  - 🏠 Greenhouse (orange background)
  - ❌ Not Viable (red background with strikethrough)

#### Space Requirements Section:
- Shows outdoor space separately from greenhouse space
- Format: "🌞 Outdoor: X sq ft | 🏠 Greenhouse: Y sq ft | Total: Z sq ft"

#### Garden Plot Visualization:
- Separated into two sections: "🌞 Outdoor Garden" and "🏠 Greenhouse"
- Different border colors (green for outdoor, orange for greenhouse)
- Each section shows plants proportionally by space needed

#### Gantt Chart:
- Added legend showing outdoor (green) vs greenhouse (orange)
- Color-coded bars based on growing location
- Uses zone-adjusted planting windows
- Added "Location" column

### 4. HTML Updates (index.html)
- Changed zone input from number input to select dropdown
- Now populated with zones 1-11 via JavaScript

## How It Works

### Zone-Aware Plant Selection Algorithm:
1. Recipe specifies categories (e.g., "nightshade" needs 45% of calories)
2. Engine finds all plants matching category (Tomato, Bell Pepper, Eggplant)
3. For each plant, determines growing location in the specified zone
4. Scores plants: outdoor plants score higher than greenhouse
5. Among same-location plants, higher calorie yield wins
6. Selects best plant and calculates quantity needed

### Example: Mediterranean Recipe in Zone 3 vs Zone 9

**Zone 3 (Cold - Vermont)**
- Tomatoes: Greenhouse required (Zone 3 is below outdoor min of 5)
- Growing window: May-September
- Greenhouse space: 11,220 sq ft
- Outdoor space: 46,947 sq ft

**Zone 9 (Warm - California)**
- Tomatoes: All outdoor (Zone 9 is within outdoor range)
- Growing window: March-November (3 extra months!)
- Greenhouse space: 0 sq ft
- Outdoor space: 56,736 sq ft

## Categories Implemented

- **nightshade**: Tomato, Bell Pepper, Eggplant
- **leafy-greens**: Lettuce, Spinach, Kale
- **cruciferous**: Broccoli, Cabbage, Kale
- **root-vegetable**: Carrots, Radish, Beets
- **starchy-root**: Potato, Sweet Potato
- **cucurbit**: Cucumber, Zucchini, Butternut Squash
- **legume**: Green Beans, Peas
- **allium**: Onions, Garlic

## Testing

Run the included test script:
```bash
node test.js
```

This verifies:
- Growing location determination
- Planting window calculation
- Category-based plant selection
- Full plan calculation for different zones

## Running the Application

1. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```

2. Open browser to `http://localhost:8000`

3. Select:
   - USDA Zone (1-11)
   - Recipe type
   - Household size
   - Optional: Garden size

4. Click "Generate Plan" to see:
   - Plant selection table with growing locations
   - Space breakdown (outdoor vs greenhouse)
   - Garden plot visualization
   - Gantt chart with zone-adjusted schedules

## Key Features

✅ **Automatic plant substitution**: If a plant can't grow in a zone, automatically selects best alternative from same category

✅ **Zone-adjusted schedules**: Warmer zones get longer growing seasons

✅ **Greenhouse tracking**: Separates outdoor and greenhouse space requirements

✅ **Visual indicators**: Color-coded tables, charts, and plots show growing location at a glance

✅ **Category-based recipes**: Recipes remain flexible and aren't tied to specific plants

✅ **Smart plant selection**: Prioritizes outdoor over greenhouse, and higher-calorie plants over lower

## Files Modified

- `/data/plants.json` - Added categories, growing_conditions, zone_adjusted_windows
- `/data/recipes.json` - Changed from plant_id to category-based
- `/src/engine.js` - Implemented zone-aware selection logic
- `/src/ui.js` - Added visual indicators for growing locations
- `/index.html` - Changed zone input to select dropdown

## Files Added

- `/test.js` - Test script for verifying zone-aware functionality
- `/IMPLEMENTATION_SUMMARY.md` - This document
