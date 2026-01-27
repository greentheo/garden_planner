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

export function showPlan(plan) {
  const section = document.getElementById('plan-section');
  const details = document.getElementById('plan-details');
  section.style.display = 'block';

  let html = '<h3>Planting Summary</h3>';
  html += '<table>';
  html += '<tr>';
  html += '<th>Crop</th>';
  html += '<th>Category</th>';
  html += '<th>Growing Location</th>';
  html += '<th>Calories Needed</th>';
  html += '<th>Calories per Pound</th>';
  html += '<th>Yield (lbs) per Plant</th>';
  html += '<th>Plants Needed</th>';
  html += '<th>Total Yield (lbs)</th>';
  html += '</tr>';

  plan.items.forEach(it => {
    // Determine row styling based on location
    let rowStyle = '';
    let locationDisplay = '';

    if (it.location === "outdoor") {
      rowStyle = 'background-color: #e8f5e9;'; // light green
      locationDisplay = '🌞 Outdoor';
    } else if (it.location === "greenhouse-extended") {
      rowStyle = 'background-color: #fff9c4;'; // light yellow
      locationDisplay = '🏠⭐ Greenhouse Extended';
    } else if (it.location === "greenhouse") {
      rowStyle = 'background-color: #fff3e0;'; // light orange
      locationDisplay = '🏠 Greenhouse';
    } else {
      rowStyle = 'background-color: #ffebee; text-decoration: line-through;'; // light red
      locationDisplay = '❌ Not Viable';
    }

    html += `<tr style="${rowStyle}">`;
    html += `<td><strong>${it.plant.name}</strong></td>`;
    html += `<td>${it.category}</td>`;
    html += `<td>${locationDisplay}</td>`;
    html += `<td>${it.plantCaloriesNeeded.toFixed(0)}</td>`;
    html += `<td>${it.plant.calories_per_lb}</td>`;
    html += `<td>${it.plant.yield_per_plant.toFixed(1)}</td>`;
    html += `<td>${it.count}</td>`;
    html += `<td>${it.totalPounds.toFixed(1)}</td>`;
    html += `</tr>`;
  });

  // Add summary row
  html += `<tr style="background-color: #e3f2fd; font-weight: bold; border-top: 3px solid #333;">`;
  html += `<td colspan="3">TOTALS</td>`;
  html += `<td>${plan.summary.totalCaloriesProduced.toFixed(0)} / ${plan.summary.totalCaloriesNeeded.toFixed(0)} (${plan.summary.percentFilled}%)</td>`;
  html += `<td>${plan.summary.avgCaloriesPerLb.toFixed(0)}</td>`;
  html += `<td>${(plan.summary.totalYield / plan.summary.totalPlants).toFixed(1)}</td>`;
  html += `<td>${plan.summary.totalPlants}</td>`;
  html += `<td>${plan.summary.totalYield.toFixed(1)}</td>`;
  html += `</tr>`;

  html += '</table>';

  // Add calorie distribution chart
  html += '<h3>Calorie Distribution</h3>';
  html += '<div id="calorie-chart"></div>';

  // Add space breakdown
  html += '<div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">';
  html += '<h4 style="margin-top: 0;">Garden Space Requirements</h4>';

  // Add greenhouse status message
  const greenhouseStatus = plan.useGreenhouseExtension
    ? '✓ Greenhouse available for season extension'
    : '✗ No greenhouse - outdoor growing only';
  const statusColor = plan.useGreenhouseExtension ? '#4caf50' : '#ff9800';
  html += `<p style="color: ${statusColor}; font-weight: bold; margin-bottom: 15px;">${greenhouseStatus}</p>`;

  html += `<p><strong>🌞 Outdoor Space:</strong> ${plan.outdoorSqFt.toFixed(1)} sq ft</p>`;
  html += `<p><strong>🏠 Greenhouse Space:</strong> ${plan.greenhouseSqFt.toFixed(1)} sq ft</p>`;
  html += `<p><strong>Total Space:</strong> ${plan.gardenSize.toFixed(1)} sq ft</p>`;
  html += '</div>';

  html += '<h3>Garden Plot Layout</h3>';
  html += '<div id="garden-plot"></div>';

  html += '<h3>Planting Schedule</h3>';
  html += '<div id="gantt-chart"></div>';

  details.innerHTML = html;

  // Render visualizations
  renderCalorieChart(plan);
  renderGardenPlot(plan);
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

  // Separate outdoor and greenhouse plants
  const outdoorItems = plan.items.filter(it => it.location === "outdoor");
  const greenhouseItems = plan.items.filter(it => it.location !== "outdoor");

  let html = '';

  // Outdoor section
  if (outdoorItems.length > 0) {
    html += '<h4 style="margin-top: 10px;">🌞 Outdoor Garden</h4>';
    html += '<div style="display: flex; flex-wrap: wrap; border: 2px solid #4caf50; max-width: 800px;">';

    const outdoorTotal = outdoorItems.reduce((sum, it) =>
      sum + (it.plant.seed_per_sqft * it.count), 0);

    outdoorItems.forEach((it, idx) => {
      const sqft = it.plant.seed_per_sqft * it.count;
      const percentage = (sqft / outdoorTotal * 100);
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
        <span style="font-size: 0.9em;">${it.count} plants</span><br>
        <span style="font-size: 0.85em;">${sqft.toFixed(1)} sq ft</span>
      </div>`;
    });

    html += '</div>';
  }

  // Greenhouse section
  if (greenhouseItems.length > 0) {
    html += '<h4 style="margin-top: 20px;">🏠 Greenhouse</h4>';
    html += '<div style="display: flex; flex-wrap: wrap; border: 2px solid #ff9800; max-width: 800px;">';

    const greenhouseTotal = greenhouseItems.reduce((sum, it) =>
      sum + (it.plant.seed_per_sqft * it.count), 0);

    greenhouseItems.forEach((it, idx) => {
      const sqft = it.plant.seed_per_sqft * it.count;
      const percentage = (sqft / greenhouseTotal * 100);
      const color = colors[(idx + outdoorItems.length) % colors.length];

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
        <span style="font-size: 0.9em;">${it.count} plants</span><br>
        <span style="font-size: 0.85em;">${sqft.toFixed(1)} sq ft</span>
      </div>`;
    });

    html += '</div>';
  }

  container.innerHTML = html;
}

function renderGanttChart(plan) {
  const container = document.getElementById('gantt-chart');

  // Add legend
  let html = '<div style="margin-bottom: 15px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">';
  html += '<strong>Legend:</strong> ';
  html += '<span style="display: inline-block; width: 20px; height: 20px; background-color: #2196F3; border: 1px solid #333; margin: 0 5px;"></span> Seed Starting ';
  html += '<span style="display: inline-block; width: 20px; height: 20px; background-color: #4caf50; border: 1px solid #333; margin: 0 5px;"></span> Transplant/Outdoor ';
  html += '<span style="display: inline-block; width: 20px; height: 20px; background-color: #ff9800; border: 1px solid #333; margin: 0 5px;"></span> Greenhouse ';
  html += '<span style="display: inline-block; width: 20px; height: 20px; background-color: #f44336; border: 1px solid #333; margin: 0 5px;"></span> Harvesting';
  html += '</div>';

  html += '<div style="overflow-x: auto;">';
  html += '<table style="min-width: 2600px; font-size: 0.75em; border-collapse: collapse;">';
  html += '<thead><tr>';
  html += '<th style="width: 120px; position: sticky; left: 0; background: white; z-index: 10; border: 1px solid #333;">Crop</th>';
  html += '<th style="width: 80px; position: sticky; left: 120px; background: white; z-index: 10; border: 1px solid #333;">Planting</th>';
  html += '<th style="width: 70px; position: sticky; left: 200px; background: white; z-index: 10; border: 1px solid #333;">Activity</th>';

  // Week headers (all 52 weeks)
  for (let w = 1; w <= 52; w++) {
    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Math.floor((w - 1) / 4.33)];
    html += `<th style="width: 30px; font-size: 0.7em; border: 1px solid #ddd; writing-mode: vertical-rl; text-orientation: mixed; padding: 2px;">${w}</th>`;
  }

  html += '</tr></thead><tbody>';

  plan.items.forEach(it => {
    if (!it.successionSchedules || it.successionSchedules.length === 0) return;

    const successions = it.successionSchedules;
    const rowsPerSuccession = 3; // seed, grow, harvest
    const totalRows = successions.length * rowsPerSuccession;

    successions.forEach((schedule, idx) => {
      const seedStart = schedule.seed_start_week;
      const transplant = schedule.transplant_week;
      const firstHarvest = schedule.first_harvest_week;
      const lastHarvest = schedule.last_harvest_week;
      const growColor = it.location === "outdoor" ? '#4caf50' : '#ff9800';

      // Label: show window name if available (Spring/Fall), otherwise succession number
      let successionLabel = '';
      if (schedule.name) {
        successionLabel = schedule.name;
      } else if (successions.length > 1) {
        successionLabel = `#${idx + 1}`;
      }

      // Seed starting row
      html += `<tr>`;
      if (idx === 0) {
        html += `<td rowspan="${totalRows}" style="position: sticky; left: 0; background: white; z-index: 5; border: 1px solid #333; vertical-align: top; padding: 5px;"><strong>${it.plant.name}</strong><br><span style="font-size: 0.9em;">(${it.count} plants)</span></td>`;
      }
      html += `<td rowspan="3" style="position: sticky; left: 120px; background: white; z-index: 5; border: 1px solid #333; vertical-align: middle; text-align: center;">${successionLabel}</td>`;
      html += `<td style="position: sticky; left: 200px; background: white; z-index: 5; border: 1px solid #333; padding: 2px;">Seed</td>`;
      for (let w = 1; w <= 52; w++) {
        const isSeedWeek = (w >= seedStart && w < transplant);
        html += `<td style="
          background-color: ${isSeedWeek ? '#2196F3' : '#f9f9f9'};
          border: 1px solid #e0e0e0;
          padding: 0;
          height: 18px;
          min-width: 30px;
        "></td>`;
      }
      html += '</tr>';

      // Transplant/Growing row
      html += `<tr>`;
      html += `<td style="position: sticky; left: 200px; background: white; z-index: 5; border: 1px solid #333; padding: 2px;">Grow</td>`;
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
      html += `<td style="position: sticky; left: 200px; background: white; z-index: 5; border: 1px solid #333; padding: 2px;">Harvest</td>`;
      for (let w = 1; w <= 52; w++) {
        let isHarvestWeek = false;

        // Handle year-wrap for garlic
        if (lastHarvest < firstHarvest) {
          isHarvestWeek = (w >= firstHarvest || w <= lastHarvest);
        } else {
          isHarvestWeek = (w >= firstHarvest && w <= lastHarvest);
        }

        html += `<td style="
          background-color: ${isHarvestWeek ? '#f44336' : '#f9f9f9'};
          border: 1px solid #e0e0e0;
          padding: 0;
          height: 18px;
          min-width: 30px;
        "></td>`;
      }
      html += '</tr>';
    });
  });

  html += '</tbody></table>';
  html += '</div>';
  html += '<p style="font-size: 0.85em; margin-top: 10px;"><em>Note: Each numbered planting represents a succession planting. All 52 weeks are shown for precise scheduling.</em></p>';

  container.innerHTML = html;
}
