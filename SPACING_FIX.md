# Plant Spacing Fix - Square Foot Gardening Standards

## The Problem

The garden planner was calculating space requirements incorrectly, resulting in gardens 10-40x too large.

**Example Issues:**
- 16 Peas plants → 128 sq ft (should be 2 sq ft)
- 88 Potato plants → 352 sq ft (should be 22 sq ft)
- Total garden for 4 people → ~32,000 sq ft / 0.75 acres (should be ~888 sq ft)

**Root Cause:**
1. Field was named `seed_per_sqft` but values were incorrect
2. Calculation was **multiplying** instead of **dividing**: `sqft = plants × spacing` (wrong!)
3. Should be: `sqft = plants ÷ plants_per_sqft` (correct!)

## The Solution

### 1. Updated Plant Database with Square Foot Gardening Standards

Referenced: https://squarefootgardening.org/2024/02/square-foot-spacing/

**Spacing Categories:**

| Spacing | Plants/sqft | Plant Size | Examples |
|---------|-------------|------------|----------|
| **Extra-Large** | 1 | 12" apart | Tomatoes, Peppers, Brassicas (13 plants) |
| **Large** | 4 | 6" apart | Lettuce, Potatoes, Herbs, Corn (13 plants) |
| **Medium** | 9 | 4" apart | Beans, Beets, Spinach, Turnips (8 plants) |
| **Small** | 16 | 3" apart | Carrots, Onions, Radish (7 plants) |
| **Vining Squash** | 0.5 | 2 sqft each | Squash, Melons, Cucumbers (8 plants) |
| **Special** | 8 | 1.5" apart | Peas (1 plant) |

**Total: 50 plants with correct spacing**

### 2. Fixed Calculation Formula

**Before (WRONG):**
```javascript
const sqft = it.plant.seed_per_sqft * it.count;
// Example: 16 peas × 8 = 128 sq ft ✗
```

**After (CORRECT):**
```javascript
const sqft = it.count / it.plant.plants_per_sqft;
// Example: 16 peas ÷ 8 = 2 sq ft ✓
```

### 3. Added Space Column to Planting Summary

Table now includes "Space (sq ft)" column showing space devoted to each plant variety.

## Test Results

### Mediterranean Recipe, Zone 7, 4 People, 100%

**Before Fix:**
```
Total Garden Size: ~32,706 sq ft (0.75 acres) ✗ WAY TOO BIG

Example Plants:
  - 88 Potatoes: 352 sq ft (4 × 88)
  - 126 Peas: 1,008 sq ft (8 × 126)
  - 104 Tomatoes: 104 sq ft (1 × 104)
```

**After Fix:**
```
Total Garden Size: 888.3 sq ft (0.02 acres) ✓ REALISTIC

Example Plants:
  - 88 Potatoes: 22.0 sq ft (88 ÷ 4)
  - 126 Peas: 15.8 sq ft (126 ÷ 8)
  - 104 Tomatoes: 104.0 sq ft (104 ÷ 1)
```

**Reduction: 97% smaller garden!** (32,706 → 888 sq ft)

### Detailed Spacing Verification

All 23 plant varieties in Mediterranean recipe:

| Crop | Plants | Spacing | Space (sqft) | Calculation |
|------|--------|---------|--------------|-------------|
| Potato | 88 | 4/sqft | 22.0 | 88 ÷ 4 ✓ |
| Sweet Potato | 88 | 4/sqft | 22.0 | 88 ÷ 4 ✓ |
| Tomato | 104 | 1/sqft | 104.0 | 104 ÷ 1 ✓ |
| Bell Pepper | 104 | 1/sqft | 104.0 | 104 ÷ 1 ✓ |
| Tomatillos | 104 | 1/sqft | 104.0 | 104 ÷ 1 ✓ |
| Winter Squash | 17 | 0.5/sqft | 34.0 | 17 ÷ 0.5 ✓ |
| Butternut Squash | 17 | 0.5/sqft | 34.0 | 17 ÷ 0.5 ✓ |
| Pumpkin | 17 | 0.5/sqft | 34.0 | 17 ÷ 0.5 ✓ |
| Fava Beans | 126 | 9/sqft | 14.0 | 126 ÷ 9 ✓ |
| Lima Beans | 126 | 9/sqft | 14.0 | 126 ÷ 9 ✓ |
| Peas | 126 | 8/sqft | 15.8 | 126 ÷ 8 ✓ |
| Kale | 110 | 1/sqft | 110.0 | 110 ÷ 1 ✓ |
| Collard Greens | 110 | 1/sqft | 110.0 | 110 ÷ 1 ✓ |
| Swiss Chard | 110 | 4/sqft | 27.5 | 110 ÷ 4 ✓ |
| Rutabaga | 139 | 16/sqft | 8.7 | 139 ÷ 16 ✓ |
| Parsnips | 139 | 4/sqft | 34.8 | 139 ÷ 4 ✓ |
| Beets | 139 | 9/sqft | 15.4 | 139 ÷ 9 ✓ |
| Garlic | 60 | 16/sqft | 3.8 | 60 ÷ 16 ✓ |
| Leeks | 60 | 9/sqft | 6.7 | 60 ÷ 9 ✓ |
| Shallots | 60 | 16/sqft | 3.8 | 60 ÷ 16 ✓ |
| Parsley | 88 | 4/sqft | 22.0 | 88 ÷ 4 ✓ |
| Basil | 88 | 4/sqft | 22.0 | 88 ÷ 4 ✓ |
| Cilantro | 88 | 4/sqft | 22.0 | 88 ÷ 4 ✓ |

**Total: 888.3 sq ft** ✓ All calculations verified correct!

## Impact on All Supplementation Levels

With the spacing fix, garden sizes are now realistic at all levels:

| Supplementation | Before (acres) | After (sq ft) | After (acres) | Reduction |
|----------------|----------------|---------------|---------------|-----------|
| 10% | 0.08 | 89 | 0.002 | 97% |
| 25% | 0.19 | 222 | 0.005 | 97% |
| 50% | 0.38 | 444 | 0.010 | 97% |
| 75% | 0.56 | 666 | 0.015 | 97% |
| 100% | 0.75 | 888 | 0.020 | 97% |

**All garden sizes reduced by ~97%** to realistic dimensions.

## UI Improvements

### New Column in Planting Summary

Table now includes "Space (sq ft)" showing space for each plant:

```
Crop          Category    Location    Plants   Space    Calories   ...
────────────────────────────────────────────────────────────────────
Tomato        nightshade  Outdoor      104     104.0    255,576
Potato        starchy     Outdoor       88      22.0    128,260
Peas          legume      Outdoor      126      15.8     54,540
Garlic        allium      Outdoor       60       3.8      8,136
...
────────────────────────────────────────────────────────────────────
TOTALS                                2,108     888.3   1,027,661
```

## Files Modified

### 1. data/plants.json
- Renamed field: `seed_per_sqft` → `plants_per_sqft`
- Updated all 50 plants with correct Square Foot Gardening spacing
- Values based on plant size categories (1, 4, 9, 16, 0.5, 8 plants/sqft)

### 2. src/engine.js
**Fixed calculation:**
```javascript
// Calculate space required (plants divided by plants_per_sqft)
const sqft = count / plant.plants_per_sqft;
```

**Store in item:**
```javascript
items.push({
  // ... other fields
  sqft,  // NEW: space for this plant variety
  // ...
});
```

**Fixed total calculation:**
```javascript
items.forEach(it => {
  // Use pre-calculated sqft instead of wrong formula
  if (it.location === "outdoor") {
    outdoorSqFt += it.sqft;
  } else {
    greenhouseSqFt += it.sqft;
  }
});
```

### 3. src/ui.js
**Added column header:**
```javascript
html += '<th>Space (sq ft)</th>';
```

**Added column data:**
```javascript
html += `<td>${it.sqft.toFixed(1)}</td>`;
```

**Updated summary row:**
```javascript
html += `<td>${plan.gardenSize.toFixed(1)}</td>`;
```

### 4. Test File
**test-spacing.js** - Comprehensive test verifying:
- All 23 plants calculate correctly
- Total space matches sum of individual plants
- Before/after comparison
- Examples of the fix

## Square Foot Gardening Reference

Based on Mel Bartholomew's Square Foot Gardening method:

**Philosophy:**
- Maximize space efficiency
- Dense planting in raised beds
- Grid system (12" squares)
- Proper spacing by plant size

**Spacing Rules:**
- 12" apart (Extra-Large): 1 per square
- 6" apart (Large): 4 per square (2×2 grid)
- 4" apart (Medium): 9 per square (3×3 grid)
- 3" apart (Small): 16 per square (4×4 grid)
- Special cases: Vining plants need 2+ squares

**Benefits:**
- No wasted space
- Better yields per square foot
- Easier to manage
- Less weeding (dense planting shades out weeds)

## Verification

### Manual Check
```bash
node test-spacing.js
```

Shows:
- ✓ All 23 plants with correct spacing
- ✓ Total matches calculated sum
- ✓ Before/after comparison
- ✓ Examples of each spacing category

### Browser Check
1. Open `http://localhost:8000`
2. Generate a plan
3. Check "Space (sq ft)" column
4. Verify total garden size is realistic
5. Confirm space requirements make sense

## Key Takeaways

### Before (Bug)
- Formula: `sqft = plants × spacing` ❌
- Gardens were 10-40x too large
- Unrealistic space requirements
- 0.75 acres for 4 people

### After (Fixed)
- Formula: `sqft = plants ÷ plants_per_sqft` ✅
- Follows Square Foot Gardening standards
- Realistic space requirements
- 888 sq ft (0.02 acres) for 4 people

### Impact
- **97% reduction** in garden size
- Gardens now match real-world layouts
- Space requirements are achievable
- Follows proven Square Foot Gardening method

### User Benefits
✅ **Realistic plans** - Gardens match available space
✅ **Clear visibility** - "Space (sq ft)" column shows allocation
✅ **Proven method** - Based on Square Foot Gardening standards
✅ **Achievable goals** - No more overwhelming space requirements

## Summary

The spacing fix transforms the garden planner from producing unrealistic mega-gardens to generating practical, achievable plans based on Square Foot Gardening standards:

**Before:** 2,108 plants = 32,706 sq ft = 0.75 acres ❌ Unrealistic!
**After:** 2,108 plants = 888 sq ft = 0.02 acres ✅ Perfect!

All 50 plants now have correct spacing, the calculation formula is fixed, and users can see exactly how much space each plant variety requires. The garden planner now produces professional, realistic plans! 🌱
