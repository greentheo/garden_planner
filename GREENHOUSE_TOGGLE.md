# Greenhouse Toggle Feature

## Overview

Added a checkbox to toggle greenhouse availability, allowing users to generate plans based on their actual resources. When unchecked, the planner uses outdoor-only schedules with realistic planting dates.

## The Problem

Previously, the system automatically used greenhouse season extension in zones 3-6. This caused issues:

**Example - Zone 5, Potatoes:**
- System showed: "Start week 6 (mid-February)"
- Reality: Mid-February planting is impossible outdoors in zone 5
- Issue: User has no greenhouse, can't use this schedule

**Root Cause:**
No way for users to indicate they don't have a greenhouse available.

## The Solution

### 1. UI Checkbox (Default: OFF)

Added to `index.html`:
```html
<div style="margin: 15px 0;">
  <label style="display: flex; align-items: center; cursor: pointer;">
    <input type="checkbox" id="greenhouse-available" name="greenhouse-available">
    <span>I have a greenhouse available (for season extension)</span>
  </label>
  <small>If unchecked, plan will only include outdoor growing schedules</small>
</div>
```

**Default State:** Unchecked (outdoor-only)
**Reasoning:** Most home gardeners don't have greenhouses, so outdoor-only is the safest default.

### 2. Engine Updates

Modified `src/engine.js` to handle greenhouse toggle:

**getPlantingSchedule() function:**
```javascript
if (location === "greenhouse" || location === "impossible") {
  // Must use greenhouse - if greenhouse not available, can't grow this plant
  if (!useGreenhouseExtension) {
    return null; // Plant cannot be grown without greenhouse
  }
  selectedSchedule = scheduleSet.greenhouse_only;
  scheduleLocation = "greenhouse";
} else if (useGreenhouseExtension && shouldUseGreenhouseExtension(zone) && scheduleSet.greenhouse_extended) {
  // Use greenhouse for season extension (only in zones 3-6)
  selectedSchedule = scheduleSet.greenhouse_extended;
  scheduleLocation = "greenhouse-extended";
  isExtended = true;
} else {
  // Standard outdoor growing
  selectedSchedule = scheduleSet.outdoor;
  scheduleLocation = "outdoor";
}
```

**calculatePlan() function:**
```javascript
// Get planting schedule for this zone
const baseSchedule = getPlantingSchedule(plant, zone, useGreenhouseExtension);

// Skip this plant if it cannot be grown without greenhouse
if (!baseSchedule) {
  console.log(`Skipping ${plant.name} - requires greenhouse but greenhouse not available`);
  return;
}
```

### 3. UI Display Updates

Modified `src/ui.js` to show greenhouse status:
```javascript
const greenhouseStatus = plan.useGreenhouseExtension
  ? '✓ Greenhouse available for season extension'
  : '✗ No greenhouse - outdoor growing only';
const statusColor = plan.useGreenhouseExtension ? '#4caf50' : '#ff9800';
html += `<p style="color: ${statusColor}; font-weight: bold;">${greenhouseStatus}</p>`;
```

## Test Results: Zone 5, Mediterranean Recipe, 4 People

### WITH Greenhouse (Checkbox Checked)

```
Plan Summary:
  Greenhouse Available:     YES ✓
  Total Plants:             2,120
  Plant Varieties:          23
  Outdoor Space:            0 sq ft
  Greenhouse Space:         32,962 sq ft
  Total Space:              32,962 sq ft

Example - Potato Schedule:
  Location:        greenhouse-extended
  Seed Start:      Week 6 (mid-February)
  Transplant:      Week 6
  First Harvest:   Week 19
  Last Harvest:    Week 42
  Growing Period:  36 weeks total
```

### WITHOUT Greenhouse (Checkbox Unchecked) - DEFAULT

```
Plan Summary:
  Greenhouse Available:     NO ✗
  Total Plants:             2,120
  Plant Varieties:          23
  Outdoor Space:            32,962 sq ft
  Greenhouse Space:         0 sq ft
  Total Space:              32,962 sq ft

Example - Potato Schedule:
  Location:        outdoor
  Seed Start:      Week 10 (early March - realistic!)
  Transplant:      Week 10
  First Harvest:   Week 23
  Last Harvest:    Week 38
  Growing Period:  28 weeks total
```

### Comparison

| Metric | With Greenhouse | Without Greenhouse | Difference |
|--------|----------------|-------------------|------------|
| Plant Varieties | 23 | 23 | 0 |
| Total Plants | 2,120 | 2,120 | 0 |
| Greenhouse Space | 32,962 sq ft | 0 sq ft | -32,962 |
| Outdoor Space | 0 sq ft | 32,962 sq ft | +32,962 |
| Potato Start Week | 6 (mid-Feb) | 10 (early Mar) | +4 weeks |
| Potato Harvest Weeks | 19-42 (23 weeks) | 23-38 (15 weeks) | -8 weeks |

**Key Differences:**
- **Start Date:** 4 weeks later without greenhouse (more realistic)
- **Harvest Window:** 8 weeks shorter without greenhouse
- **Space Allocation:** All outdoor when no greenhouse
- **Same Varieties:** All plants still included (none require greenhouse in Zone 5)

## How It Works

### Decision Logic

```
For each plant in the plan:
  1. Check if user has greenhouse (checkbox state)
  2. Check if plant can grow outdoors in this zone

  IF greenhouse_only plant AND no greenhouse available:
    → Skip this plant (cannot grow)

  ELSE IF outdoor possible AND greenhouse available AND zone 3-6:
    → Use greenhouse-extended schedule (earlier start, later end)

  ELSE IF outdoor possible:
    → Use outdoor schedule (realistic timing)

  ELSE:
    → Skip plant (impossible to grow)
```

### Zone Behavior

| Zone | Without Greenhouse | With Greenhouse |
|------|-------------------|-----------------|
| 1-2 | Very limited plants, outdoor only | Some greenhouse-only plants possible |
| 3-6 | Outdoor schedules, shorter season | Greenhouse-extended (4-8 weeks longer) |
| 7+ | Outdoor schedules (long season) | Outdoor schedules (greenhouse too hot) |

## Usage

### In Browser

1. Open `http://localhost:8000`
2. Select your zone and recipe
3. **Check or uncheck** "I have a greenhouse available"
   - ✗ Unchecked (default): Outdoor-only schedules
   - ✓ Checked: Greenhouse season extension in zones 3-6
4. Generate plan
5. View results:
   - Status message shows greenhouse availability
   - Planting dates reflect your choice
   - Space breakdown shows outdoor vs greenhouse

### From Command Line

```javascript
// Without greenhouse (outdoor only)
const plan = calculatePlan({
  zone: 5,
  recipeId: 'mediterranean',
  household: 4,
  plants,
  recipes,
  useGreenhouseExtension: false  // ← KEY PARAMETER
});

// With greenhouse
const plan = calculatePlan({
  zone: 5,
  recipeId: 'mediterranean',
  household: 4,
  plants,
  recipes,
  useGreenhouseExtension: true
});
```

## Testing

```bash
# Test greenhouse toggle feature
node test-greenhouse-toggle.js

# Shows side-by-side comparison of:
# - Plant varieties
# - Planting dates
# - Space requirements
# - Harvest windows
```

## Benefits

### For Users Without Greenhouse

✓ **Realistic planting dates** - No more "plant potatoes in February" in zone 5
✓ **Accurate space requirements** - Outdoor space only
✓ **Achievable schedules** - Matches actual growing conditions
✓ **No confusion** - Plan matches their resources

### For Users With Greenhouse

✓ **Extended season** - Earlier starts, later harvests
✓ **More production** - Longer growing windows
✓ **Flexible planning** - Can toggle to compare options
✓ **Maximize investment** - Use greenhouse effectively

### For All Users

✓ **User control** - Choose based on actual resources
✓ **Clear communication** - Status message shows current mode
✓ **Flexible planning** - Can compare both scenarios
✓ **Better adoption** - Plans match real-world situations

## Examples by Zone

### Zone 3 (Coldest)

**Without Greenhouse:**
- Very short season (weeks 12-35)
- Limited plant selection
- All outdoor

**With Greenhouse:**
- Extended season (weeks 8-39)
- More plant varieties
- Some greenhouse-only crops possible

### Zone 5 (Cool)

**Without Greenhouse:**
- Spring start: Week 10-12
- Fall end: Week 38-40
- Outdoor only

**With Greenhouse:**
- Spring start: Week 6-8 (4 weeks earlier!)
- Fall end: Week 42-44 (4 weeks later!)
- Greenhouse-extended

### Zone 7 (Moderate)

**Without Greenhouse:**
- Long outdoor season (weeks 8-42)
- No greenhouse needed

**With Greenhouse:**
- Same as without (greenhouse too hot)
- System automatically uses outdoor

### Zone 9 (Warm)

**Without Greenhouse:**
- Very long season (weeks 6-45)
- All outdoor

**With Greenhouse:**
- Same as without (greenhouse too hot)
- Outdoor preferred

## Implementation Files

### Modified Files
1. **index.html** - Added checkbox UI element
2. **src/app.js** - Capture checkbox state, pass to engine
3. **src/engine.js** - Handle greenhouse toggle logic
4. **src/ui.js** - Display greenhouse status

### Test Files
5. **test-greenhouse-toggle.js** - NEW: Compare with/without greenhouse

## User Documentation

### Quick Guide

**I don't have a greenhouse:**
- Leave checkbox **unchecked** (default)
- Get realistic outdoor-only planting dates

**I have a greenhouse:**
- **Check** the checkbox
- Get season extension in zones 3-6
- Earlier starts, later harvests

**Not sure?**
- Try both options
- Compare planting dates and space requirements
- Choose what matches your setup

## Technical Notes

### Default State

**Checkbox default: UNCHECKED**

Reasoning:
1. Most home gardeners don't have greenhouses
2. Safer to assume outdoor-only
3. Prevents unrealistic planting dates by default
4. Users with greenhouses will actively enable it

### Parameter Flow

```
HTML Checkbox
  ↓
app.js captures state
  ↓
calculatePlan(useGreenhouseExtension: boolean)
  ↓
getPlantingSchedule(plant, zone, useGreenhouseExtension)
  ↓
Returns appropriate schedule or null
```

### Edge Cases Handled

1. **Plant requires greenhouse, user has none:** Plant is skipped
2. **Warm zone (7+):** Greenhouse ignored (too hot)
3. **Cool zone (3-6) with greenhouse:** Season extension applied
4. **All plants skipped:** Plan still generates with warning

## Summary

The greenhouse toggle feature allows users to:

✓ Match plans to their actual resources
✓ Get realistic planting dates for their situation
✓ Avoid confusion from impossible schedules
✓ Compare scenarios (with/without greenhouse)
✓ Plan accurately for their garden

**Default behavior:** Outdoor-only (unchecked) for maximum realism and broad applicability.

**Example Impact (Zone 5):**
- Potato planting: Week 6 → Week 10 (4 weeks more realistic!)
- No more mid-February outdoor planting recommendations
- Schedules match actual growing conditions
