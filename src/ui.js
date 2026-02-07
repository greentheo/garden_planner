// src/ui.js
export function populateZoneOptions(plants) {
  const zoneSelect = document.getElementById('zone');
  // Create zone options from 1-11
  const zones = Array.from({ length: 11 }, (_, i) => i + 1);
  zoneSelect.innerHTML = '';
  zones.forEach(z => {
    const opt = document.createElement('option');
    opt.value = z;
    opt.textContent = `Zone ${z}`;
    zoneSelect.appendChild(opt);
  });
  // Default to zone 5
  zoneSelect.value = '5';
}

export function populateRecipeOptions(recipes) {
  const recipeSelect = document.getElementById('recipe');
  recipeSelect.innerHTML = '';
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '-- select --';
  recipeSelect.appendChild(defaultOpt);
  recipes.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.name;
    recipeSelect.appendChild(opt);
  });
}

// Helper function to get seed URL for a plant based on selected supplier
function getSeedUrl(plant, supplierKey) {
  if (!plant.seed_sources || plant.seed_sources.length === 0) {
    return null;
  }

  const supplierNames = {
    'johnnys': "Johnny's Selected Seeds",
    'burpee': 'Burpee',
    'hoss': 'Hoss Tools'
  };

  const supplierName = supplierNames[supplierKey];
  const source = plant.seed_sources.find(s => s.supplier === supplierName);
  return source ? source.category_url : null;
}

export function showPlan(plan, supplierKey = 'johnnys') {
  const section = document.getElementById('plan-section');
  const details = document.getElementById('plan-details');
  section.style.display = 'block';

  // Sort items by seed start week (earliest first)
  const sortedItems = [...plan.items].sort((a, b) => {
    const aWeek = a.schedule?.seed_start_week || 999;
    const bWeek = b.schedule?.seed_start_week || 999;
    return aWeek - bWeek;
  });

  let html = '<h3>Planting Summary</h3>';
  html += '<table>';
  html += '<tr>';
  html += '<th>Crop</th>';
  html += '<th>Category</th>';
  html += '<th>📅 First Seed<br>Start Week</th>';
  html += '<th>🏠 Greenhouse<br>Plants</th>';
  html += '<th>🏠 Greenhouse<br>Space (sqft)</th>';
  html += '<th>🌞 Outdoor<br>Plants</th>';
  html += '<th>🌞 Outdoor<br>Space (sqft)</th>';
  html += '<th>Total<br>Plants</th>';
  html += '<th>Total<br>Space (sqft)</th>';
  html += '<th>Calories<br>Needed</th>';
  html += '<th>Total Yield<br>(lbs)</th>';
  html += '</tr>';

  sortedItems.forEach(it => {
    const greenhousePlants = it.greenhousePlants || 0;
    const outdoorPlants = it.outdoorPlants || it.count;
    const greenhouseSqft = it.greenhouseSqft || 0;
    const outdoorSqft = it.outdoorSqft || it.sqft;

    // Determine row styling based on greenhouse allocation
    let rowStyle = '';
    if (greenhousePlants > 0 && outdoorPlants > 0) {
      rowStyle = 'background-color: #fffbf0;'; // light yellow - split
    } else if (greenhousePlants > 0) {
      rowStyle = 'background-color: #fff3e0;'; // light orange - all greenhouse
    } else {
      rowStyle = 'background-color: #e8f5e9;'; // light green - all outdoor
    }

    html += `<tr style="${rowStyle}">`;

    // Make plant name a link if seed URL is available
    const seedUrl = getSeedUrl(it.plant, supplierKey);
    if (seedUrl) {
      html += `<td><strong><a href="${seedUrl}" target="_blank" style="color: #2e7d32; text-decoration: none; border-bottom: 1px dashed #2e7d32;" title="Buy seeds from selected supplier">${it.plant.name} 🔗</a></strong></td>`;
    } else {
      html += `<td><strong>${it.plant.name}</strong></td>`;
    }

    html += `<td>${it.category}</td>`;

    // Display seed start week
    const seedStartWeek = it.schedule?.seed_start_week;
    if (seedStartWeek) {
      html += `<td style="font-weight: bold; color: #1976d2;">Week ${seedStartWeek}</td>`;
    } else {
      html += `<td>-</td>`;
    }

    html += `<td>${greenhousePlants}</td>`;
    html += `<td>${greenhouseSqft.toFixed(1)}</td>`;
    html += `<td>${outdoorPlants}</td>`;
    html += `<td>${outdoorSqft.toFixed(1)}</td>`;
    html += `<td>${it.count}</td>`;
    html += `<td>${it.sqft.toFixed(1)}</td>`;
    html += `<td>${it.plantCaloriesNeeded.toFixed(0)}</td>`;
    html += `<td>${it.totalPounds.toFixed(1)}</td>`;
    html += `</tr>`;
  });

  // Calculate totals for greenhouse and outdoor
  const totalGreenhousePlants = plan.items.reduce((sum, it) => sum + (it.greenhousePlants || 0), 0);
  const totalOutdoorPlants = plan.items.reduce((sum, it) => sum + (it.outdoorPlants || it.count), 0);

  // Add summary row
  html += `<tr style="background-color: #e3f2fd; font-weight: bold; border-top: 3px solid #333;">`;
  html += `<td colspan="3">TOTALS</td>`;
  html += `<td>${totalGreenhousePlants}</td>`;
  html += `<td>${plan.greenhouseSqftUsed.toFixed(1)}</td>`;
  html += `<td>${totalOutdoorPlants}</td>`;
  html += `<td>${plan.outdoorSqFt.toFixed(1)}</td>`;
  html += `<td>${plan.summary.totalPlants}</td>`;
  html += `<td>${plan.gardenSize.toFixed(1)}</td>`;
  html += `<td>${plan.summary.totalCaloriesProduced.toFixed(0)} / ${plan.summary.totalCaloriesNeeded.toFixed(0)} (${plan.summary.percentFilled}%)</td>`;
  html += `<td>${plan.summary.totalYield.toFixed(1)}</td>`;
  html += `</tr>`;

  html += '</table>';

  // Add calorie distribution chart
  html += '<h3>Calorie Distribution</h3>';
  html += '<div id="calorie-chart"></div>';

  // Add space breakdown
  html += '<div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">';
  html += '<h4 style="margin-top: 0;">Garden Space Requirements</h4>';

  // Add food supplementation goal message
  const suppPercent = plan.foodSupplementationPercent || 100;
  let suppLabel = '';
  if (suppPercent === 100) {
    suppLabel = 'Full self-sufficiency';
  } else if (suppPercent >= 75) {
    suppLabel = 'Major food source';
  } else if (suppPercent >= 50) {
    suppLabel = 'Half your food needs';
  } else if (suppPercent >= 25) {
    suppLabel = 'Significant supplement';
  } else {
    suppLabel = 'Small supplement';
  }
  html += `<p style="color: #2196f3; font-weight: bold; margin-bottom: 15px;">🎯 Goal: ${suppPercent}% of annual food needs (${suppLabel})</p>`;

  // Add greenhouse status message
  if (plan.greenhouseSqftAvailable > 0) {
    const utilization = plan.greenhouseAllocation.utilization.toFixed(1);
    const utilized = plan.greenhouseSqftUsed.toFixed(1);
    const available = plan.greenhouseSqftAvailable.toFixed(1);
    html += `<p style="color: #4caf50; font-weight: bold; margin-bottom: 15px;">🏠 Greenhouse: ${utilized} sq ft used / ${available} sq ft available (${utilization}% utilization)</p>`;
  } else {
    html += `<p style="color: #ff9800; font-weight: bold; margin-bottom: 15px;">✗ No greenhouse - outdoor growing only</p>`;
  }

  html += `<p><strong>🌞 Outdoor Space:</strong> ${plan.outdoorSqFt.toFixed(1)} sq ft</p>`;
  if (plan.greenhouseSqftAvailable > 0) {
    html += `<p><strong>🏠 Greenhouse Space:</strong> ${plan.greenhouseSqftUsed.toFixed(1)} sq ft (${plan.greenhouseSqftAvailable.toFixed(1)} sq ft available)</p>`;
  }
  html += `<p><strong>Total Space:</strong> ${plan.gardenSize.toFixed(1)} sq ft</p>`;
  html += '</div>';

  html += '<h3>Garden Plot Layout</h3>';
  html += '<div id="garden-plot"></div>';

  html += '<h3>Planting & Harvest Schedule</h3>';
  html += '<div id="schedule-table"></div>';

  html += '<h3>Visual Timeline (Gantt Chart)</h3>';
  html += '<p style="font-size: 0.9em; color: #666; margin-bottom: 10px;"><em>Note: Best viewed on desktop/full-size screen. For mobile and printing, use the schedule table above.</em></p>';
  html += '<div id="gantt-chart"></div>';

  details.innerHTML = html;

  // Render visualizations
  renderCalorieChart(plan);
  renderGardenPlot(plan);
  renderScheduleTable(plan);
  renderGanttChart(plan);
}

function renderCalorieChart(plan) {
  const container = document.getElementById('calorie-chart');

  // Group items by category and calculate totals
  const categoryData = {};
  plan.items.forEach(item => {
    if (!categoryData[item.category]) {
      categoryData[item.category] = {
        totalCalories: 0,
        plants: []
      };
    }
    categoryData[item.category].totalCalories += item.totalCaloriesProduced;
    categoryData[item.category].plants.push({
      name: item.plant.name,
      calories: item.totalCaloriesProduced
    });
  });

  // Sort categories by total calories (descending)
  const sortedCategories = Object.entries(categoryData).sort((a, b) =>
    b[1].totalCalories - a[1].totalCalories
  );

  const totalCalories = plan.summary.totalCaloriesProduced;

  let html = '<div style="max-width: 1200px;">';

  sortedCategories.forEach(([category, data], idx) => {
    const categoryPercent = (data.totalCalories / totalCalories * 100).toFixed(1);
    const categoryColor = getCategoryColor(category);

    // Category header bar
    html += `<div style="margin-bottom: 20px;">`;
    html += `<div style="font-weight: bold; margin-bottom: 5px; text-transform: capitalize;">
      ${category.replace('-', ' ')} - ${categoryPercent}% (${data.totalCalories.toLocaleString()} cal)
    </div>`;
    html += `<div style="background-color: ${categoryColor}; height: 30px; width: ${categoryPercent}%;
      border-radius: 5px; position: relative; min-width: 50px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <span style="position: absolute; right: 5px; top: 5px; color: white; font-size: 12px; font-weight: bold;">
        ${categoryPercent}%
      </span>
    </div>`;

    // Individual plants within category
    data.plants.forEach(plant => {
      const plantPercent = (plant.calories / totalCalories * 100).toFixed(1);
      const plantPercentOfCategory = (plant.calories / data.totalCalories * 100).toFixed(0);
      const lighterColor = lightenColor(categoryColor, 40);

      html += `<div style="margin-left: 20px; margin-top: 3px;">`;
      html += `<div style="font-size: 13px; margin-bottom: 2px; color: #555;">
        ${plant.name} - ${plantPercent}% of total (${plantPercentOfCategory}% of category)
      </div>`;
      html += `<div style="background-color: ${lighterColor}; height: 20px; width: ${plantPercent}%;
        border-radius: 3px; min-width: 30px; border: 1px solid ${categoryColor};">
      </div>`;
      html += `</div>`;
    });

    html += `</div>`;
  });

  html += '</div>';
  container.innerHTML = html;
}

function getCategoryColor(category) {
  const colors = {
    'starchy-root': '#8B4513',    // brown
    'starchy': '#D2691E',          // chocolate
    'grain': '#DAA520',            // goldenrod
    'legume': '#228B22',           // forest green
    'nightshade': '#DC143C',       // crimson
    'cucurbit': '#FF8C00',         // dark orange
    'cruciferous': '#32CD32',      // lime green
    'root-vegetable': '#A0522D',   // sienna
    'leafy-greens': '#2E8B57',     // sea green
    'allium': '#9370DB',           // medium purple
    'herb': '#3CB371',             // medium sea green
    'fruit': '#FF1493',            // deep pink
    'perennial': '#4682B4'         // steel blue
  };
  return colors[category] || '#808080';
}

function lightenColor(color, percent) {
  const num = parseInt(color.replace('#',''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
    (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
    .toString(16).slice(1);
}

function renderGardenPlot(plan) {
  const container = document.getElementById('garden-plot');

  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
    '#dfe6e9', '#74b9ff', '#a29bfe', '#fd79a8', '#fdcb6e',
    '#e17055', '#00b894', '#00cec9', '#0984e3', '#6c5ce7',
    '#b2bec3', '#fab1a0', '#ff7675', '#55efc4', '#81ecec'
  ];

  let html = '';

  // Outdoor section - show plants with outdoorPlants > 0
  const outdoorItems = plan.items.filter(it => (it.outdoorPlants || it.count) > 0);
  const outdoorTotal = plan.outdoorSqFt;

  if (outdoorTotal > 0) {
    html += '<h4 style="margin-top: 10px;">🌞 Outdoor Garden</h4>';
    html += '<div style="display: flex; flex-wrap: wrap; border: 2px solid #4caf50; max-width: 800px;">';

    outdoorItems.forEach((it, idx) => {
      const outdoorPlants = it.outdoorPlants || it.count;
      const outdoorSqft = it.outdoorSqft || it.sqft;

      if (outdoorSqft > 0) {
        const percentage = (outdoorSqft / outdoorTotal * 100);
        const color = colors[idx % colors.length];

        html += `<div style="
          background-color: ${color};
          padding: 15px;
          margin: 2px;
          flex-basis: calc(${percentage}% - 4px);
          min-height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          border: 1px solid #333;
        ">
          <strong>${it.plant.name}</strong><br>
          <span style="font-size: 0.9em;">${outdoorPlants} plants</span><br>
          <span style="font-size: 0.85em;">${outdoorSqft.toFixed(1)} sq ft</span>
        </div>`;
      }
    });

    html += '</div>';
  }

  // Greenhouse section - show plants with greenhousePlants > 0
  const greenhouseItems = plan.items.filter(it => (it.greenhousePlants || 0) > 0);
  const greenhouseTotal = plan.greenhouseSqftUsed;

  if (greenhouseTotal > 0) {
    html += '<h4 style="margin-top: 20px;">🏠 Greenhouse</h4>';
    html += '<div style="display: flex; flex-wrap: wrap; border: 2px solid #ff9800; max-width: 800px;">';

    greenhouseItems.forEach((it, idx) => {
      const greenhousePlants = it.greenhousePlants || 0;
      const greenhouseSqft = it.greenhouseSqft || 0;

      if (greenhouseSqft > 0) {
        const percentage = (greenhouseSqft / greenhouseTotal * 100);
        const color = colors[idx % colors.length];

        html += `<div style="
          background-color: ${color};
          padding: 15px;
          margin: 2px;
          flex-basis: calc(${percentage}% - 4px);
          min-height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          border: 1px solid #333;
        ">
          <strong>${it.plant.name}</strong><br>
          <span style="font-size: 0.9em;">${greenhousePlants} plants</span><br>
          <span style="font-size: 0.85em;">${greenhouseSqft.toFixed(1)} sq ft</span>
        </div>`;
      }
    });

    html += '</div>';
  }

  container.innerHTML = html;
}

function getMonthAndWeek(weekNumber) {
  // Convert week number (1-52) to "Month - Week X" format
  // Assuming week 1 = first week of January
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  // Approximate: 4.33 weeks per month
  const monthIndex = Math.floor((weekNumber - 1) / 4.33);
  const weekInMonth = ((weekNumber - 1) % 4.33) + 1;

  const month = monthNames[Math.min(monthIndex, 11)];
  const week = Math.ceil(weekInMonth);

  return `${month} - Week ${week}`;
}

function renderScheduleTable(plan) {
  const container = document.getElementById('schedule-table');

  let html = '<div class="note-tip" style="background: #fff3cd; padding: 12px; border-radius: 5px; border-left: 4px solid #ffc107; margin-bottom: 15px;">';
  html += '💡 <strong>Tip:</strong> This schedule view is optimized for mobile and printing. For a visual timeline, see the Gantt chart below (best on desktop).';
  html += '</div>';

  html += '<div class="schedule-table-wrapper">';
  html += '<table class="schedule-table">';
  html += '<thead><tr>';
  html += '<th style="width: 20%;">Crop</th>';
  html += '<th style="width: 12%;">Location</th>';
  html += '<th style="width: 8%;">Plants</th>';
  html += '<th style="width: 30%;">Planting Schedule</th>';
  html += '<th style="width: 30%;">Harvest Period</th>';
  html += '</tr></thead><tbody>';

  plan.items.forEach(it => {
    if (!it.successionSchedules || it.successionSchedules.length === 0) return;

    const greenhousePlants = it.greenhousePlants || 0;
    const outdoorPlants = it.outdoorPlants || it.count;
    const hasGreenhouse = greenhousePlants > 0;
    const hasOutdoor = outdoorPlants > 0;

    // Create locations array
    const locations = [];
    if (hasGreenhouse) locations.push({ type: 'greenhouse', plants: greenhousePlants, label: '🏠 Greenhouse' });
    if (hasOutdoor) locations.push({ type: 'outdoor', plants: outdoorPlants, label: '🌞 Outdoor' });

    const successions = it.successionSchedules;

    locations.forEach(location => {
      html += '<tr>';
      html += `<td data-label="Crop"><span class="plant-name">${it.plant.name}</span></td>`;
      html += `<td data-label="Location"><span class="location-badge location-${location.type}">${location.label}</span></td>`;
      html += `<td data-label="Plants"><span class="plant-count">${location.plants}</span></td>`;

      // Planting schedule column
      html += '<td data-label="Planting Schedule">';
      successions.forEach((schedule, idx) => {
        const seedStart = getMonthAndWeek(schedule.seed_start_week);
        const transplant = schedule.transplant_week;
        const isDirectSow = (transplant === schedule.seed_start_week);

        // Determine succession label
        let successionLabel = '';
        if (schedule.name) {
          successionLabel = schedule.name;
        } else if (successions.length > 1) {
          successionLabel = `Succession #${idx + 1}`;
        } else {
          successionLabel = 'Planting';
        }

        html += '<div class="succession-item">';
        html += `<div class="succession-label">${successionLabel}</div>`;
        html += '<div class="date-range">';

        if (isDirectSow) {
          html += `<strong>Direct Sow:</strong> ${seedStart}`;
        } else {
          html += `<strong>Start Seeds:</strong> ${seedStart}<br>`;
          html += `<strong>Transplant:</strong> ${getMonthAndWeek(transplant)}`;
        }

        html += '</div></div>';
      });
      html += '</td>';

      // Harvest period column
      html += '<td data-label="Harvest Period">';

      // Group harvests by season if multiple successions
      if (successions.length > 1) {
        successions.forEach((schedule, idx) => {
          const firstHarvest = getMonthAndWeek(schedule.first_harvest_week);
          const lastHarvest = getMonthAndWeek(schedule.last_harvest_week);

          let successionLabel = '';
          if (schedule.name) {
            successionLabel = schedule.name;
          } else {
            successionLabel = `Succession #${idx + 1}`;
          }

          html += '<div class="date-range" style="margin-bottom: 8px;">';
          html += `<strong>${successionLabel}:</strong><br>`;
          html += `${firstHarvest} to ${lastHarvest}`;
          html += '</div>';
        });
      } else {
        // Single succession - simple format
        const firstHarvest = getMonthAndWeek(successions[0].first_harvest_week);
        const lastHarvest = getMonthAndWeek(successions[0].last_harvest_week);

        html += '<div class="date-range">';
        html += `<strong>First Harvest:</strong> ${firstHarvest}<br>`;
        html += `<strong>Last Harvest:</strong> ${lastHarvest}`;
        html += '</div>';
      }

      html += '</td>';
      html += '</tr>';
    });
  });

  html += '</tbody></table>';
  html += '</div>';

  container.innerHTML = html;
}

function renderGanttChart(plan) {
  const container = document.getElementById('gantt-chart');

  // Add legend
  let html = '<div style="margin-bottom: 15px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">';
  html += '<strong>Legend:</strong> ';
  html += '<span style="display: inline-block; width: 20px; height: 20px; background-color: #2196F3; border: 1px solid #333; margin: 0 5px;"></span> Indoor Seeding ';
  html += '<span style="display: inline-block; width: 20px; height: 20px; background-color: #90CAF9; border: 1px solid #333; margin: 0 5px;"></span> Direct Sow (Outdoor) ';
  html += '<span style="display: inline-block; width: 20px; height: 20px; background-color: #ff9800; border: 1px solid #333; margin: 0 5px;"></span> Greenhouse Growing ';
  html += '<span style="display: inline-block; width: 20px; height: 20px; background-color: #4caf50; border: 1px solid #333; margin: 0 5px;"></span> Outdoor Growing ';
  html += '<span style="display: inline-block; width: 20px; height: 20px; background-color: #ff7043; border: 1px solid #333; margin: 0 5px;"></span> Greenhouse Harvest ';
  html += '<span style="display: inline-block; width: 20px; height: 20px; background-color: #f44336; border: 1px solid #333; margin: 0 5px;"></span> Outdoor Harvest';
  html += '</div>';

  html += '<div style="overflow-x: auto;">';
  html += '<table style="min-width: 2600px; font-size: 0.75em; border-collapse: collapse;">';
  html += '<thead><tr>';
  html += '<th style="width: 120px; position: sticky; left: 0; background: white; z-index: 10; border: 1px solid #333;">Crop</th>';
  html += '<th style="width: 90px; position: sticky; left: 120px; background: white; z-index: 10; border: 1px solid #333;">Location</th>';
  html += '<th style="width: 80px; position: sticky; left: 210px; background: white; z-index: 10; border: 1px solid #333;">Planting</th>';
  html += '<th style="width: 70px; position: sticky; left: 290px; background: white; z-index: 10; border: 1px solid #333;">Activity</th>';

  // Week headers (all 52 weeks)
  for (let w = 1; w <= 52; w++) {
    html += `<th style="width: 30px; font-size: 0.7em; border: 1px solid #ddd; writing-mode: vertical-rl; text-orientation: mixed; padding: 2px;">${w}</th>`;
  }

  html += '</tr></thead><tbody>';

  plan.items.forEach(it => {
    if (!it.successionSchedules || it.successionSchedules.length === 0) return;

    const greenhousePlants = it.greenhousePlants || 0;
    const outdoorPlants = it.outdoorPlants || it.count;
    const hasGreenhouse = greenhousePlants > 0;
    const hasOutdoor = outdoorPlants > 0;

    // Determine how many location sections we need
    const locations = [];
    if (hasGreenhouse) locations.push({ type: 'greenhouse', plants: greenhousePlants, label: '🏠 Greenhouse' });
    if (hasOutdoor) locations.push({ type: 'outdoor', plants: outdoorPlants, label: '🌞 Outdoor' });

    const successions = it.successionSchedules;
    const rowsPerSuccession = 3; // seed, grow, harvest
    const totalRows = successions.length * rowsPerSuccession * locations.length;

    let firstRow = true;

    locations.forEach(location => {
      successions.forEach((schedule, idx) => {
        const seedStart = schedule.seed_start_week;
        const transplant = schedule.transplant_week;
        const firstHarvest = schedule.first_harvest_week;
        const lastHarvest = schedule.last_harvest_week;

        // Determine if this is indoor or outdoor seeding
        const isIndoorSeeding = (location.type === 'greenhouse') || (transplant > seedStart);
        const seedColor = isIndoorSeeding ? '#2196F3' : '#90CAF9';
        const seedLabel = isIndoorSeeding ? 'Seed (indoor)' : 'Seed (direct)';

        // Grow and harvest colors based on location
        const growColor = location.type === 'greenhouse' ? '#ff9800' : '#4caf50';
        const harvestColor = location.type === 'greenhouse' ? '#ff7043' : '#f44336';

        // Label: show window name if available (Spring/Fall), otherwise succession number
        let successionLabel = '';
        if (schedule.name) {
          successionLabel = schedule.name;
        } else if (successions.length > 1) {
          successionLabel = `#${idx + 1}`;
        }

        // Seed starting row
        html += `<tr>`;
        if (firstRow) {
          html += `<td rowspan="${totalRows}" style="position: sticky; left: 0; background: white; z-index: 5; border: 1px solid #333; vertical-align: top; padding: 5px;"><strong>${it.plant.name}</strong><br><span style="font-size: 0.9em;">(${it.count} total)</span></td>`;
          firstRow = false;
        }
        if (idx === 0) {
          const locationRows = successions.length * rowsPerSuccession;
          html += `<td rowspan="${locationRows}" style="position: sticky; left: 120px; background: white; z-index: 5; border: 1px solid #333; vertical-align: middle; text-align: center;">${location.label}<br><span style="font-size: 0.9em;">(${location.plants})</span></td>`;
        }
        html += `<td rowspan="3" style="position: sticky; left: 210px; background: white; z-index: 5; border: 1px solid #333; vertical-align: middle; text-align: center;">${successionLabel}</td>`;
        html += `<td style="position: sticky; left: 290px; background: white; z-index: 5; border: 1px solid #333; padding: 2px; font-size: 0.85em;">${seedLabel}</td>`;
        for (let w = 1; w <= 52; w++) {
          const isSeedWeek = (w >= seedStart && w < transplant);
          html += `<td style="
            background-color: ${isSeedWeek ? seedColor : '#f9f9f9'};
            border: 1px solid #e0e0e0;
            padding: 0;
            height: 18px;
            min-width: 30px;
          "></td>`;
        }
        html += '</tr>';

        // Transplant/Growing row
        html += `<tr>`;
        html += `<td style="position: sticky; left: 290px; background: white; z-index: 5; border: 1px solid #333; padding: 2px;">Grow</td>`;
        for (let w = 1; w <= 52; w++) {
          const isGrowWeek = (w >= transplant && w < firstHarvest);
          html += `<td style="
            background-color: ${isGrowWeek ? growColor : '#f9f9f9'};
            border: 1px solid #e0e0e0;
            padding: 0;
            height: 18px;
            min-width: 30px;
          "></td>`;
        }
        html += '</tr>';

        // Harvesting row
        html += `<tr>`;
        html += `<td style="position: sticky; left: 290px; background: white; z-index: 5; border: 1px solid #333; padding: 2px;">Harvest</td>`;
        for (let w = 1; w <= 52; w++) {
          let isHarvestWeek = false;

          // Handle year-wrap for overwintering crops
          if (lastHarvest < firstHarvest) {
            isHarvestWeek = (w >= firstHarvest || w <= lastHarvest);
          } else {
            isHarvestWeek = (w >= firstHarvest && w <= lastHarvest);
          }

          html += `<td style="
            background-color: ${isHarvestWeek ? harvestColor : '#f9f9f9'};
            border: 1px solid #e0e0e0;
            padding: 0;
            height: 18px;
            min-width: 30px;
          "></td>`;
        }
        html += '</tr>';
      });
    });
  });

  html += '</tbody></table>';
  html += '</div>';
  html += '<p style="font-size: 0.85em; margin-top: 10px;"><em>Note: Plants split between greenhouse and outdoor show separate location rows. Indoor seeding occurs when transplanting is needed; direct sow plants are seeded outdoors.</em></p>';

  container.innerHTML = html;
}
