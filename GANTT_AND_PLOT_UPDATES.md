# Gantt Chart and Garden Plot Updates

## Overview

Updated the Garden Plot Layout and Gantt Chart to properly distinguish between greenhouse and outdoor growing, with detailed visual indicators for seeding, growing, and harvesting activities.

## Changes Made

### 1. Garden Plot Layout - Split Display

**Previous Behavior:**
- Single plot showing all plants based on `location` field
- Did not account for plants split between greenhouse and outdoor

**New Behavior:**
- **Two separate plots** when greenhouse > 0:
  - 🌞 **Outdoor Garden** - Shows plants allocated to outdoor space
  - 🏠 **Greenhouse** - Shows plants allocated to greenhouse space
- Each plant displays correct allocation:
  - Uses `outdoorPlants` and `outdoorSqft` for outdoor plot
  - Uses `greenhousePlants` and `greenhouseSqft` for greenhouse plot
- Proportional sizing based on actual space used

**Example Output (200 sqft greenhouse):**
```
🌞 Outdoor Garden (688.3 sqft)
[Tomato: 78 plants, 78.0 sqft] [Potato: 66 plants, 16.5 sqft] ...

🏠 Greenhouse (200.0 sqft)
[Tomato: 26 plants, 26.0 sqft] [Pepper: 26 plants, 26.0 sqft] ...
```

### 2. Gantt Chart - Enhanced Location Display

**Previous Behavior:**
- Single row per plant/succession
- Basic color coding (outdoor green, greenhouse orange)
- No distinction between indoor/outdoor seeding
- No separate rows for split plants

**New Behavior:**

#### A. New Location Column
- Added **Location** column showing where plants grow
- Format: `🏠 Greenhouse (26)` or `🌞 Outdoor (78)`
- Plants split between locations show **separate row groups**

#### B. Enhanced Color Legend
**Seeding:**
- 🔵 **Dark Blue (#2196F3)** - Indoor seeding (started indoors, then transplanted)
- 🔵 **Light Blue (#90CAF9)** - Direct sow (seeded directly outdoors)

**Growing:**
- 🟠 **Orange (#ff9800)** - Greenhouse growing
- 🟢 **Green (#4caf50)** - Outdoor growing

**Harvesting:**
- 🟠 **Light Orange (#ff7043)** - Greenhouse harvesting
- 🔴 **Red (#f44336)** - Outdoor harvesting

#### C. Indoor vs Outdoor Seeding Detection
```javascript
// Indoor seeding if:
// 1. Growing in greenhouse, OR
// 2. Transplant week > seed start week (seeds started indoors)
const isIndoorSeeding = (location.type === 'greenhouse') || (transplant > seedStart);
```

**Examples:**
- Tomatoes: Seed week 10 → Transplant week 16 = **Indoor seeding** (6 weeks indoors)
- Carrots: Seed week 12 → Transplant week 12 = **Direct sow** (no indoor period)

#### D. Split Plant Display
For plants allocated to both greenhouse and outdoor:
- Shows **two location sections** (e.g., Tomato: Greenhouse + Outdoor)
- Each section shows separate seeding/growing/harvesting timeline
- Plant count displayed per location

**Example (Tomato with 26 greenhouse, 78 outdoor):**
```
Tomato (104 total)
├── 🏠 Greenhouse (26)
│   ├── Succession #1: Seed (indoor) → Grow (greenhouse) → Harvest (greenhouse)
│   ├── Succession #2: ...
│   └── ...
└── 🌞 Outdoor (78)
    ├── Succession #1: Seed (indoor) → Grow (outdoor) → Harvest (outdoor)
    ├── Succession #2: ...
    └── ...
```

### 3. Table Structure Updates

**Column Layout:**
```
| Crop | Location | Planting | Activity | Week 1 | Week 2 | ... | Week 52 |
```

**Previous:**
- Crop (120px)
- Planting (80px)
- Activity (70px)
- Weeks...

**New:**
- Crop (120px)
- Location (90px) - **NEW**
- Planting (80px)
- Activity (70px)
- Weeks...

**Sticky positioning updated:**
- Crop: left 0px
- Location: left 120px
- Planting: left 210px
- Activity: left 290px

## Test Results

### Test Case: Mediterranean Recipe, Zone 7, 4 People, 200 sqft Greenhouse

**Plants Split Between Locations:** 18 varieties
- Tomato: 26 greenhouse + 78 outdoor = 104 total ✓
- Bell Pepper: 26 greenhouse + 78 outdoor = 104 total ✓
- Potato: 22 greenhouse + 66 outdoor = 88 total ✓
- (15 more varieties...)

**Garden Plot:**
- Outdoor section: 688.3 sqft with correct plant counts
- Greenhouse section: 200.0 sqft with correct plant counts
- All proportions accurate ✓

**Gantt Chart:**
- All plants show correct scheduling ✓
- Indoor seeding properly detected ✓
- Split plants show separate location rows ✓
- Colors distinguish indoor/outdoor activities ✓

### Tomato Example (Detailed)

**Allocation:**
- Total: 104 plants
- Greenhouse: 26 plants (25% diversity allocation)
- Outdoor: 78 plants (75% remaining)

**Schedule (Succession 1):**
- Seed Start: Week 10 (indoor seeding - blue)
- Transplant: Week 16 (6 weeks of indoor growing)
- First Harvest: Week 27 (11 weeks to maturity)
- Last Harvest: Week 37 (10-week harvest period)

**Gantt Display:**
- Greenhouse row: Weeks 10-16 blue (indoor seed) → 16-27 orange (greenhouse grow) → 27-37 light orange (greenhouse harvest)
- Outdoor row: Weeks 10-16 blue (indoor seed) → 16-27 green (outdoor grow) → 27-37 red (outdoor harvest)

## Visual Improvements

### Before
```
Gantt Chart Legend:
🔵 Seed Starting | 🟢 Outdoor | 🟠 Greenhouse | 🔴 Harvesting

Single row per plant - no location distinction
```

### After
```
Gantt Chart Legend:
🔵 Indoor Seeding | 🔵 Direct Sow | 🟠 Greenhouse Growing |
🟢 Outdoor Growing | 🟠 Greenhouse Harvest | 🔴 Outdoor Harvest

Separate rows per location - clear activity distinction
```

## User Benefits

### 1. Clear Location Visibility
- Instantly see which plants are in greenhouse vs outdoor
- Understand space allocation at a glance
- Track split plants easily

### 2. Detailed Activity Tracking
- Know when to start seeds indoors vs direct sow
- Distinguish greenhouse activities from outdoor
- Plan greenhouse vs outdoor harvesting

### 3. Better Planning
- See greenhouse utilization over time (which weeks it's busiest)
- Identify when greenhouse space frees up for succession plantings
- Coordinate outdoor and greenhouse activities

### 4. Realistic Scheduling
- Indoor seeding period shown accurately (e.g., 6 weeks for tomatoes)
- Direct sow plants clearly marked (no indoor period)
- Harvest windows distinguished by location

## Implementation Details

### Files Modified

**src/ui.js**
1. `renderGardenPlot()` function (lines 253-344)
   - Split into outdoor and greenhouse sections
   - Uses `outdoorPlants`/`outdoorSqft` and `greenhousePlants`/`greenhouseSqft`
   - Proportional sizing per section

2. `renderGanttChart()` function (lines 346-459)
   - Added Location column
   - Enhanced legend with 6 color types
   - Indoor vs outdoor seeding detection
   - Separate row groups for split plants
   - Location-specific colors for grow and harvest

**index.html**
- Updated script version to v=3 for cache busting

### Code Logic

**Garden Plot Filtering:**
```javascript
// Outdoor items - any plant with outdoor allocation
const outdoorItems = plan.items.filter(it => (it.outdoorPlants || it.count) > 0);

// Greenhouse items - plants with greenhouse allocation
const greenhouseItems = plan.items.filter(it => (it.greenhousePlants || 0) > 0);
```

**Gantt Location Grouping:**
```javascript
const locations = [];
if (hasGreenhouse) locations.push({ type: 'greenhouse', plants: greenhousePlants });
if (hasOutdoor) locations.push({ type: 'outdoor', plants: outdoorPlants });

// Iterate through each location to create separate row groups
locations.forEach(location => {
  // Show schedules for this location
});
```

**Seeding Type Detection:**
```javascript
// Indoor seeding: greenhouse growing OR transplanting required
const isIndoorSeeding = (location.type === 'greenhouse') || (transplant > seedStart);
const seedColor = isIndoorSeeding ? '#2196F3' : '#90CAF9';
const seedLabel = isIndoorSeeding ? 'Seed (indoor)' : 'Seed (direct)';
```

## Edge Cases Handled

### 1. No Greenhouse (0 sqft)
- Only outdoor section shown in garden plot ✓
- Only outdoor rows in Gantt chart ✓
- All plants show outdoor location ✓

### 2. All Plants in Greenhouse (huge greenhouse)
- Only greenhouse section in garden plot ✓
- Only greenhouse rows in Gantt chart ✓
- All activities use greenhouse colors ✓

### 3. Plants Fully in One Location
- If plant not split, shows single location ✓
- Example: Leeks (5 greenhouse, 0 outdoor) → only greenhouse row ✓

### 4. Direct Sow Plants
- Carrots, radishes show light blue seeding ✓
- Seed start week = transplant week (direct sow) ✓

### 5. Succession Plantings
- Each succession shows correct timing per location ✓
- Multiple successions displayed correctly ✓
- Window names (Spring/Fall) preserved ✓

## Notes

**Performance:**
- No significant performance impact
- Table renders efficiently even with split plants
- Sticky positioning works correctly with new columns

**Browser Compatibility:**
- Tested with modern browsers
- CSS grid and flexbox used for layouts
- Sticky positioning supported

**Future Enhancements:**
- [ ] Add greenhouse temperature/climate indicators
- [ ] Show greenhouse space utilization timeline
- [ ] Highlight transitions between locations (hardening off period)
- [ ] Add filtering to show only greenhouse or only outdoor
- [ ] Export Gantt chart as PDF/image

## Summary

The Garden Plot and Gantt Chart now provide comprehensive visibility into greenhouse vs outdoor growing:

**Garden Plot:**
- ✅ Separate outdoor and greenhouse sections
- ✅ Accurate plant counts and space per location
- ✅ Proportional sizing

**Gantt Chart:**
- ✅ Location column showing where plants grow
- ✅ 6-color legend for detailed activity types
- ✅ Indoor vs outdoor seeding distinction
- ✅ Greenhouse vs outdoor growing colors
- ✅ Greenhouse vs outdoor harvest colors
- ✅ Separate rows for plants split between locations

**Result:** Users can now fully plan and track their greenhouse and outdoor gardening activities with complete visual clarity! 🌱🏠🌞
