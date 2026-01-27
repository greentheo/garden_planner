// src/engine.js
export async function loadData() {
  const [plantsRes, recipesRes] = await Promise.all([
    fetch('data/plants.json'),
    fetch('data/recipes.json')
  ]);
  return Promise.all([plantsRes.json(), recipesRes.json()]);
}

/**
 * Determines where a plant can grow in a given zone
 * @param {Object} plant - Plant object with growing_conditions
 * @param {number} zone - USDA hardiness zone
 * @returns {string} - "outdoor", "greenhouse", or "impossible"
 */
export function getGrowingLocation(plant, zone) {
  const { outdoor_zones, greenhouse_zones, impossible_zones } = plant.growing_conditions;

  // Check if impossible
  if (impossible_zones && impossible_zones.includes(zone)) {
    return "impossible";
  }

  // Check if outdoor
  if (zone >= outdoor_zones.min && zone <= outdoor_zones.max) {
    return "outdoor";
  }

  // Check if greenhouse
  if (zone >= greenhouse_zones.min && zone <= greenhouse_zones.max) {
    return "greenhouse";
  }

  return "impossible";
}

/**
 * Determines if greenhouse extension is beneficial for a zone
 * Greenhouse extension only makes sense in cooler zones (3-6)
 * In warm zones (7+), it's often too hot for greenhouse growing
 * @param {number} zone - USDA hardiness zone
 * @returns {boolean}
 */
export function shouldUseGreenhouseExtension(zone) {
  // Only use greenhouse extension in zones 3-6 where season is shorter
  // Zones 7+ have long enough growing seasons outdoors
  return zone >= 3 && zone <= 6;
}

/**
 * Gets the planting schedule for a plant in a given zone
 * @param {Object} plant - Plant object with zone_adjusted_schedules
 * @param {number} zone - USDA hardiness zone
 * @param {boolean} useGreenhouseExtension - Whether to use greenhouse for season extension
 * @returns {Object} - Schedule object with weeks
 */
export function getPlantingSchedule(plant, zone, useGreenhouseExtension = true) {
  const schedules = plant.zone_adjusted_schedules;

  for (const scheduleSet of schedules) {
    const [minZone, maxZone] = scheduleSet.zone_range;
    if (zone >= minZone && zone <= maxZone) {
      // Determine which schedule to use
      const location = getGrowingLocation(plant, zone);

      let selectedSchedule;
      let scheduleLocation;
      let isExtended = false;

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

      // Handle multiple windows (e.g., spring and fall peas)
      if (Array.isArray(selectedSchedule)) {
        return selectedSchedule.map(window => ({
          ...window,
          location: scheduleLocation,
          is_extended: isExtended
        }));
      } else {
        return {
          ...selectedSchedule,
          location: scheduleLocation,
          is_extended: isExtended
        };
      }
    }
  }

  // Fallback
  return null;
}

/**
 * Selects best plants for a category in a given zone
 * @param {string} category - Plant category (e.g., "nightshade", "leafy-greens")
 * @param {number} zone - USDA hardiness zone
 * @param {Array} availablePlants - Array of all plant objects
 * @returns {Array} - Plants sorted by suitability (best first)
 */
export function selectPlantsForZone(category, zone, availablePlants) {
  // Filter plants that match the category
  const categoryPlants = availablePlants.filter(plant =>
    plant.category.includes(category)
  );

  // Score and sort plants
  const scoredPlants = categoryPlants.map(plant => {
    const location = getGrowingLocation(plant, zone);

    // Location priority: outdoor = 3, greenhouse = 2, impossible = 0
    const locationScore = location === "outdoor" ? 3 : location === "greenhouse" ? 2 : 0;

    // Calorie yield (higher is better)
    const calorieYield = plant.calories_per_lb * plant.yield_per_plant;

    return {
      plant,
      location,
      locationScore,
      calorieYield,
      // Combined score: prioritize location, then calories
      totalScore: locationScore * 10000 + calorieYield
    };
  });

  // Sort by total score (descending)
  scoredPlants.sort((a, b) => b.totalScore - a.totalScore);

  // Filter out impossible plants
  const viablePlants = scoredPlants.filter(p => p.location !== "impossible");

  return viablePlants;
}

/**
 * Calculates succession planting schedules for a plant
 * @param {Object} plant - Plant object
 * @param {Object} baseSchedule - Base schedule for the plant
 * @returns {Array} - Array of succession planting schedules
 */
export function calculateSuccessionPlantings(plant, baseSchedule) {
  const successions = [];

  if (!plant.succession_planting_weeks || plant.succession_planting_weeks === 0) {
    // No succession planting, return single planting
    return [{
      ...baseSchedule,
      succession_number: 1,
      is_succession: false
    }];
  }

  const successionInterval = plant.succession_planting_weeks;
  const harvestDuration = plant.harvest_period_weeks;
  const daysToMaturity = plant.days_to_maturity;
  const maturityWeeks = Math.ceil(daysToMaturity / 7);

  // Calculate how many successions we can fit
  const growingWindowWeeks = baseSchedule.last_harvest_week - baseSchedule.seed_start_week;

  // Start from the first planting
  let currentSeedWeek = baseSchedule.seed_start_week;
  let successionNum = 1;

  while (currentSeedWeek <= baseSchedule.seed_start_week + growingWindowWeeks - maturityWeeks - harvestDuration) {
    const transplantWeek = currentSeedWeek + (baseSchedule.transplant_week - baseSchedule.seed_start_week);
    const firstHarvestWeek = transplantWeek + maturityWeeks;
    const lastHarvestWeek = firstHarvestWeek + harvestDuration;

    // Make sure we don't exceed the overall growing window
    if (lastHarvestWeek <= baseSchedule.last_harvest_week + 2) { // +2 for tolerance
      successions.push({
        ...baseSchedule,
        seed_start_week: currentSeedWeek,
        transplant_week: transplantWeek,
        first_harvest_week: firstHarvestWeek,
        last_harvest_week: Math.min(lastHarvestWeek, baseSchedule.last_harvest_week),
        succession_number: successionNum,
        is_succession: successionNum > 1
      });
    }

    currentSeedWeek += successionInterval;
    successionNum++;

    // Safety limit: max 15 successions
    if (successionNum > 15) break;
  }

  return successions.length > 0 ? successions : [{
    ...baseSchedule,
    succession_number: 1,
    is_succession: false
  }];
}

export function calculatePlan({
  zone,
  recipeId,
  household,
  gardenSize,
  plants,
  recipes,
  caloriesPerPerson = 2000,
  useGreenhouseExtension = true
}) {
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) throw new Error('Recipe not found');

  // Calculate annual calorie needs: household * 2000 calories/day * 365 days
  const totalCalories = caloriesPerPerson * household * 365;
  const recipeCalories = totalCalories * (recipe.recipe_percentage || 1);

  const items = [];

  recipe.components.forEach(comp => {
    // Select best plants for this category
    const viablePlants = selectPlantsForZone(comp.category, zone, plants);

    if (viablePlants.length === 0) {
      console.warn(`No viable plants found for category: ${comp.category} in zone ${zone}`);
      return;
    }

    // Select top 2-3 plants per category for variety (or all if fewer available)
    const numPlantsToSelect = Math.min(3, viablePlants.length);
    const selectedPlants = viablePlants.slice(0, numPlantsToSelect);

    // Distribute the calorie share across selected plants
    // Weight by calorie density (higher density = larger share)
    const totalCalorieYield = selectedPlants.reduce((sum, p) =>
      sum + (p.plant.yield_per_plant * p.plant.calories_per_lb), 0);

    selectedPlants.forEach(bestPlant => {
      const plant = bestPlant.plant;
      const plantLocation = bestPlant.location;
      const plantCalorieYield = plant.yield_per_plant * plant.calories_per_lb;

      // Distribute based on calorie density
      const plantShare = plantCalorieYield / totalCalorieYield;
      const plantCaloriesNeeded = recipeCalories * comp.calorie_share * plantShare;
      const plantCaloriesPerPlant = plantCalorieYield;
      const count = Math.ceil(plantCaloriesNeeded / plantCaloriesPerPlant);

      // Get planting schedule for this zone
      const baseSchedule = getPlantingSchedule(plant, zone, useGreenhouseExtension);

      // Skip this plant if it cannot be grown without greenhouse
      if (!baseSchedule) {
        console.log(`Skipping ${plant.name} - requires greenhouse but greenhouse not available`);
        return;
      }

      // Handle multiple windows (e.g., spring and fall)
      let allSuccessionSchedules = [];
      let scheduleLocation = "";

      if (Array.isArray(baseSchedule)) {
        // Multiple planting windows (e.g., spring and fall peas)
        baseSchedule.forEach(window => {
          const windowSuccessions = calculateSuccessionPlantings(plant, window);
          allSuccessionSchedules = allSuccessionSchedules.concat(windowSuccessions);
          scheduleLocation = window.location;
        });
      } else {
        // Single planting window
        allSuccessionSchedules = calculateSuccessionPlantings(plant, baseSchedule);
        scheduleLocation = baseSchedule.location;
      }

      // Calculate total calories that will be produced
      const totalCaloriesProduced = count * plantCaloriesPerPlant;

      // Calculate total pounds
      const totalPounds = count * plant.yield_per_plant;

      // Calculate plants per succession
      const plantsPerSuccession = Math.ceil(count / allSuccessionSchedules.length);

      items.push({
        plant,
        category: comp.category,
        location: scheduleLocation,
        plantCaloriesNeeded,
        plantCaloriesPerPlant,
        count,
        schedule: Array.isArray(baseSchedule) ? baseSchedule[0] : baseSchedule,
        successionSchedules: allSuccessionSchedules,
        plantsPerSuccession,
        totalCaloriesProduced,
        totalPounds,
        hasMultipleWindows: Array.isArray(baseSchedule)
      });
    });
  });

  // Calculate total square footage, separated by location
  let outdoorSqFt = 0;
  let greenhouseSqFt = 0;

  items.forEach(it => {
    const sqft = it.plant.seed_per_sqft * it.count;
    if (it.location === "outdoor") {
      outdoorSqFt += sqft;
    } else {
      greenhouseSqFt += sqft;
    }
  });

  const totalSqFt = outdoorSqFt + greenhouseSqFt;

  // Calculate totals for summary
  const totalCaloriesNeeded = items.reduce((sum, it) => sum + it.plantCaloriesNeeded, 0);
  const totalCaloriesProduced = items.reduce((sum, it) => sum + it.totalCaloriesProduced, 0);
  const totalPlants = items.reduce((sum, it) => sum + it.count, 0);
  const totalYield = items.reduce((sum, it) => sum + it.totalPounds, 0);
  const avgCaloriesPerLb = totalYield > 0 ? totalCaloriesProduced / totalYield : 0;
  const percentFilled = (totalCaloriesProduced / totalCaloriesNeeded * 100).toFixed(1);

  return {
    zone,
    recipe,
    household,
    gardenSize: totalSqFt,
    outdoorSqFt,
    greenhouseSqFt,
    useGreenhouseExtension,
    items,
    summary: {
      totalCaloriesNeeded,
      totalCaloriesProduced,
      totalPlants,
      totalYield,
      avgCaloriesPerLb,
      percentFilled
    }
  };
}
