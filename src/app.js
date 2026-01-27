// src/app.js
import { loadData, calculatePlan } from './engine.js';
import { populateZoneOptions, populateRecipeOptions, showPlan } from './ui.js';

let plants = [], recipes = [];

// Load data when page loads
loadData().then(([p, r]) => {
  console.log('Plants loaded:', p.length);
  console.log('Recipes loaded:', r.length);
  plants = p;
  recipes = r;
  populateZoneOptions(plants);
  populateRecipeOptions(recipes);
});

// Handle form submission
document.getElementById('garden-form').addEventListener('submit', e => {
  e.preventDefault();

  const zone = parseInt(document.getElementById('zone').value, 10);
  const recipeId = document.getElementById('recipe').value;
  const household = parseInt(document.getElementById('household').value, 10);
  const gardenSizeInput = document.getElementById('garden-size').value;
  const gardenSize = gardenSizeInput ? parseFloat(gardenSizeInput) : null;
  const greenhouseSqft = parseInt(document.getElementById('greenhouse-sqft').value, 10) || 0;
  const foodSupplementationPercent = parseInt(document.getElementById('food-supplementation').value, 10);

  try {
    const plan = calculatePlan({
      zone,
      recipeId,
      household,
      gardenSize,
      plants,
      recipes,
      greenhouseSqft,
      foodSupplementationPercent
    });
    showPlan(plan);
  } catch (err) {
    alert(err.message);
  }
});
