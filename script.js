// ========================================
// FITTRACK — Script
// ========================================

// ---- User Profile: Load / Save ----

function loadUserData() {
    const age = localStorage.getItem('age');
    const gender = localStorage.getItem('gender');
    const height = localStorage.getItem('height');
    const weight = localStorage.getItem('weight');
    const targetWeight = localStorage.getItem('targetWeight');
    const goal = localStorage.getItem('goal');
    const activity = localStorage.getItem('activity');
    const dietType = localStorage.getItem('dietType');

    if (age) document.getElementById('age').value = age;
    if (gender) document.getElementById('gender').value = gender;
    if (height) document.getElementById('height').value = height;
    if (weight) document.getElementById('weight').value = weight;
    if (targetWeight) document.getElementById('target-weight').value = targetWeight;
    if (goal) document.getElementById('goal').value = goal;
    if (activity) document.getElementById('activity').value = activity;

    let selectedDiet = dietType || 'veg';
    if (!dietType) {
        localStorage.setItem('dietType', 'veg');
    }
    const dietRadio = document.querySelector(`input[name="diet-type"][value="${selectedDiet}"]`);
    if (dietRadio) dietRadio.checked = true;
}

function saveUserData(event) {
    event.preventDefault();

    const formData = new FormData(document.getElementById('user-form'));
    const data = Object.fromEntries(formData);

    localStorage.setItem('age', data.age);
    localStorage.setItem('gender', data.gender);
    localStorage.setItem('height', data.height);
    localStorage.setItem('weight', data.weight);
    localStorage.setItem('targetWeight', data['target-weight']);
    localStorage.setItem('goal', data.goal);
    localStorage.setItem('activity', data.activity);
    localStorage.setItem('dietType', data['diet-type']);

    const msg = document.getElementById('save-message');
    msg.textContent = '✅ Profile saved successfully!';
    setTimeout(() => { msg.textContent = ''; }, 3000);

    runCalculations();
    runMacroCalculations();
}

// ---- Calculators ----

function calculateBMR(weight, height, age, gender) {
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
}

function getActivityMultiplier(activity) {
    const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725
    };
    return multipliers[activity] || 1.2;
}

function calculateMaintenanceCalories(bmr, activity) {
    return Math.round(bmr * getActivityMultiplier(activity));
}

function calculateGoalCalories(maintenance, goal) {
    if (goal === 'fat-loss') return maintenance - 500;
    if (goal === 'muscle-gain') return maintenance + 400;
    return maintenance;
}

function calculateBMI(weight, height) {
    const heightM = height / 100;
    return (weight / (heightM * heightM)).toFixed(1);
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

function calculateBodyFat(weight, height, age, gender) {
    const heightM = height / 100;
    if (gender === 'male') {
        return (86.010 * Math.log10(weight - (70.041 * heightM)) - 70.041 * Math.log10(heightM) + 36.76).toFixed(1);
    } else {
        return (163.205 * Math.log10(weight + height - 97.684) - 97.684 * Math.log10(height) - 78.387).toFixed(1);
    }
}

function getBodyFatCategory(bodyFat, gender) {
    if (gender === 'male') {
        if (bodyFat < 6) return 'Essential';
        if (bodyFat < 14) return 'Athletic';
        if (bodyFat < 18) return 'Fit';
        if (bodyFat < 25) return 'Average';
        return 'Obese';
    } else {
        if (bodyFat < 10) return 'Essential';
        if (bodyFat < 18) return 'Athletic';
        if (bodyFat < 22) return 'Fit';
        if (bodyFat < 31) return 'Average';
        return 'Obese';
    }
}

function estimateGoalTime(currentWeight, targetWeight, goal) {
    const weeklyLoss = goal === 'fat-loss' ? 0.5 : 0;
    const weeklyGain = goal === 'muscle-gain' ? 0.25 : 0;
    const weightDiff = Math.abs(targetWeight - currentWeight);
    let weeks;
    if (goal === 'fat-loss') {
        weeks = weightDiff / weeklyLoss;
    } else if (goal === 'muscle-gain') {
        weeks = weightDiff / weeklyGain;
    } else {
        weeks = 0;
    }
    const months = Math.round(weeks / 4.3);
    return weeks > 0 ? `${Math.round(weeks)} wks (${months} mo)` : 'At goal ✓';
}

function runCalculations() {
    const age = parseFloat(localStorage.getItem('age'));
    const gender = localStorage.getItem('gender');
    const height = parseFloat(localStorage.getItem('height'));
    const weight = parseFloat(localStorage.getItem('weight'));
    const targetWeight = parseFloat(localStorage.getItem('targetWeight'));
    const goal = localStorage.getItem('goal');
    const activity = localStorage.getItem('activity');

    if (!age || !gender || !height || !weight || !targetWeight || !goal || !activity) return;

    const bmr = calculateBMR(weight, height, age, gender);
    const maintenance = calculateMaintenanceCalories(bmr, activity);
    const goalCalories = calculateGoalCalories(maintenance, goal);
    const bmi = calculateBMI(weight, height);
    const bmiCategory = getBMICategory(bmi);
    const bodyFat = calculateBodyFat(weight, height, age, gender);
    const bodyFatCategory = getBodyFatCategory(bodyFat, gender);
    const timeEstimate = estimateGoalTime(weight, targetWeight, goal);

    document.getElementById('bmr-result').textContent = `${Math.round(bmr)} kcal`;
    document.getElementById('maintenance-result').textContent = `${maintenance} kcal`;
    document.getElementById('goal-result').textContent = `${goalCalories} kcal`;
    document.getElementById('bmi-result').textContent = `${bmi} · ${bmiCategory}`;
    document.getElementById('bodyfat-result').textContent = `${bodyFat}% · ${bodyFatCategory}`;
    document.getElementById('time-result').textContent = timeEstimate;
}

// ---- Macro Calculations ----

function calculateProtein(weight) {
    const proteinG = weight * 2;
    const proteinCal = proteinG * 4;
    return { grams: Math.round(proteinG), calories: Math.round(proteinCal) };
}

function calculateCarbs(goalCalories) {
    const carbsCal = goalCalories * 0.45;
    const carbsG = carbsCal / 4;
    return { grams: Math.round(carbsG), calories: Math.round(carbsCal) };
}

function calculateFats(goalCalories) {
    const fatsCal = goalCalories * 0.25;
    const fatsG = fatsCal / 9;
    return { grams: Math.round(fatsG), calories: Math.round(fatsCal) };
}

function calculateTotalMacroCalories(proteinCal, carbsCal, fatsCal) {
    return proteinCal + carbsCal + fatsCal;
}

function runMacroCalculations() {
    const weight = parseFloat(localStorage.getItem('weight'));
    const goal = localStorage.getItem('goal');
    const activity = localStorage.getItem('activity');
    const age = parseFloat(localStorage.getItem('age'));
    const gender = localStorage.getItem('gender');
    const height = parseFloat(localStorage.getItem('height'));

    if (!weight || !goal || !activity || !age || !gender || !height) return;

    const bmr = calculateBMR(weight, height, age, gender);
    const maintenance = calculateMaintenanceCalories(bmr, activity);
    const goalCalories = calculateGoalCalories(maintenance, goal);

    const protein = calculateProtein(weight);
    const carbs = calculateCarbs(goalCalories);
    const fats = calculateFats(goalCalories);
    const totalMacroCal = calculateTotalMacroCalories(protein.calories, carbs.calories, fats.calories);

    document.getElementById('protein-result').textContent = `${protein.grams}g · ${protein.calories} kcal`;
    document.getElementById('carbs-result').textContent = `${carbs.grams}g · ${carbs.calories} kcal`;
    document.getElementById('fats-result').textContent = `${fats.grams}g · ${fats.calories} kcal`;
    document.getElementById('donut-total-kcal').textContent = totalMacroCal;

    renderMacrosPieChart(protein.calories, carbs.calories, fats.calories);
}

// ========================================
// DONUT PIE CHART RENDERING
// ========================================

const DONUT_RADIUS = 80;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

function animateDonut(arcEl, segmentLength, offset, delay) {
    arcEl.style.strokeDasharray = `${segmentLength} ${DONUT_CIRCUMFERENCE}`;
    arcEl.style.strokeDashoffset = `${DONUT_CIRCUMFERENCE}`;
    arcEl.style.transition = 'none';

    // Force reflow
    arcEl.getBoundingClientRect();

    requestAnimationFrame(() => {
        arcEl.style.transition = `stroke-dashoffset 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s`;
        arcEl.style.strokeDashoffset = `${offset}`;
    });
}

function renderMacrosPieChart(proteinCal, carbsCal, fatsCal) {
    const total = proteinCal + carbsCal + fatsCal;
    if (total === 0) return;

    const proteinFrac = proteinCal / total;
    const carbsFrac = carbsCal / total;
    const fatsFrac = fatsCal / total;

    const gap = 10;
    const usable = DONUT_CIRCUMFERENCE - gap * 3;

    const proteinLen = usable * proteinFrac;
    const carbsLen = usable * carbsFrac;
    const fatsLen = usable * fatsFrac;

    // Protein arc
    const arcProtein = document.getElementById('arc-protein');
    const proteinOffset = DONUT_CIRCUMFERENCE - proteinLen;
    animateDonut(arcProtein, proteinLen, proteinOffset, 0);

    // Carbs arc
    const arcCarbs = document.getElementById('arc-carbs');
    const carbsRotation = proteinLen + gap;
    animateDonut(arcCarbs, carbsLen, DONUT_CIRCUMFERENCE - carbsLen, 0.15);
    arcCarbs.style.transform = `rotate(${(carbsRotation / DONUT_CIRCUMFERENCE) * 360}deg)`;
    arcCarbs.style.transformOrigin = '100px 100px';

    // Fats arc
    const arcFats = document.getElementById('arc-fats');
    const fatsRotation = proteinLen + carbsLen + gap * 2;
    animateDonut(arcFats, fatsLen, DONUT_CIRCUMFERENCE - fatsLen, 0.3);
    arcFats.style.transform = `rotate(${(fatsRotation / DONUT_CIRCUMFERENCE) * 360}deg)`;
    arcFats.style.transformOrigin = '100px 100px';
}

function renderMealPieChart(proteinG, carbsG, fatsG) {
    const total = proteinG + carbsG + fatsG;

    const arcProtein = document.getElementById('arc-meal-protein');
    const arcCarbs = document.getElementById('arc-meal-carbs');
    const arcFats = document.getElementById('arc-meal-fats');

    if (total === 0) {
        [arcProtein, arcCarbs, arcFats].forEach(arc => {
            arc.style.strokeDasharray = `0 ${DONUT_CIRCUMFERENCE}`;
            arc.style.strokeDashoffset = `${DONUT_CIRCUMFERENCE}`;
            arc.style.transform = '';
        });
        return;
    }

    const proteinFrac = proteinG / total;
    const carbsFrac = carbsG / total;
    const fatsFrac = fatsG / total;

    const gap = 10;
    const usable = DONUT_CIRCUMFERENCE - gap * 3;

    const proteinLen = usable * proteinFrac;
    const carbsLen = usable * carbsFrac;
    const fatsLen = usable * fatsFrac;

    animateDonut(arcProtein, proteinLen, DONUT_CIRCUMFERENCE - proteinLen, 0);

    const carbsRotation = proteinLen + gap;
    animateDonut(arcCarbs, carbsLen, DONUT_CIRCUMFERENCE - carbsLen, 0.1);
    arcCarbs.style.transform = `rotate(${(carbsRotation / DONUT_CIRCUMFERENCE) * 360}deg)`;
    arcCarbs.style.transformOrigin = '100px 100px';

    const fatsRotation = proteinLen + carbsLen + gap * 2;
    animateDonut(arcFats, fatsLen, DONUT_CIRCUMFERENCE - fatsLen, 0.2);
    arcFats.style.transform = `rotate(${(fatsRotation / DONUT_CIRCUMFERENCE) * 360}deg)`;
    arcFats.style.transformOrigin = '100px 100px';
}

// ---- Meal Calculator ----

let mealFoods = [];

function calculateScaledValue(per100g, quantity) {
    return (per100g * quantity / 100).toFixed(1);
}

function addFood(event) {
    event.preventDefault();

    const name = document.getElementById('food-name').value;
    const quantity = parseFloat(document.getElementById('quantity').value);
    const caloriesPer100 = parseFloat(document.getElementById('calories-per-100').value);
    const proteinPer100 = parseFloat(document.getElementById('protein-per-100').value);
    const carbsPer100 = parseFloat(document.getElementById('carbs-per-100').value);
    const fatsPer100 = parseFloat(document.getElementById('fats-per-100').value);
    const fiberPer100 = parseFloat(document.getElementById('fiber-per-100').value) || 0;
    const vitaminCPer100 = parseFloat(document.getElementById('vitamin-c-per-100').value) || 0;
    const ironPer100 = parseFloat(document.getElementById('iron-per-100').value) || 0;

    const food = {
        name,
        quantity,
        calories: parseFloat(calculateScaledValue(caloriesPer100, quantity)),
        protein: parseFloat(calculateScaledValue(proteinPer100, quantity)),
        carbs: parseFloat(calculateScaledValue(carbsPer100, quantity)),
        fats: parseFloat(calculateScaledValue(fatsPer100, quantity)),
        fiber: parseFloat(calculateScaledValue(fiberPer100, quantity)),
        vitaminC: parseFloat(calculateScaledValue(vitaminCPer100, quantity)),
        iron: parseFloat(calculateScaledValue(ironPer100, quantity))
    };

    mealFoods.push(food);
    updateMealDisplay();
    document.getElementById('food-form').reset();
}

function updateMealDisplay() {
    const foodItemsList = document.getElementById('food-items');
    foodItemsList.innerHTML = '';

    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0, totalFiber = 0, totalVitaminC = 0, totalIron = 0;

    mealFoods.forEach((food, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${food.name} (${food.quantity}g) — ${food.calories} kcal · ${food.protein}g P · ${food.carbs}g C · ${food.fats}g F</span>
            <button onclick="removeFood(${index})"><i class="fas fa-trash-alt"></i> Remove</button>
        `;
        foodItemsList.appendChild(li);

        totalCalories += food.calories;
        totalProtein += food.protein;
        totalCarbs += food.carbs;
        totalFats += food.fats;
        totalFiber += food.fiber;
        totalVitaminC += food.vitaminC;
        totalIron += food.iron;
    });

    document.getElementById('total-calories').textContent = `${totalCalories.toFixed(1)} kcal`;
    document.getElementById('total-protein').textContent = `${totalProtein.toFixed(1)}g`;
    document.getElementById('total-carbs').textContent = `${totalCarbs.toFixed(1)}g`;
    document.getElementById('total-fats').textContent = `${totalFats.toFixed(1)}g`;
    document.getElementById('total-fiber').textContent = `${totalFiber.toFixed(1)}g`;
    document.getElementById('total-vitamin-c').textContent = `${totalVitaminC.toFixed(1)}mg`;
    document.getElementById('total-iron').textContent = `${totalIron.toFixed(1)}mg`;
    document.getElementById('meal-donut-kcal').textContent = Math.round(totalCalories);

    renderMealPieChart(totalProtein, totalCarbs, totalFats);
}

function removeFood(index) {
    mealFoods.splice(index, 1);
    updateMealDisplay();
}

// ---- Food Database ----

const foodData = {
    'rolled oats': { cal: 379, pro: 13.2, carb: 66.3, fat: 6.9 },
    'apple': { cal: 52, pro: 0.3, carb: 13.8, fat: 0.2 },
    'banana': { cal: 89, pro: 1.1, carb: 22.8, fat: 0.3 },
    'papaya': { cal: 43, pro: 0.5, carb: 10.8, fat: 0.3 },
    'pineapple': { cal: 50, pro: 0.5, carb: 13.1, fat: 0.1 },
    'grapes': { cal: 69, pro: 0.7, carb: 18.1, fat: 0.2 },
    'paneer': { cal: 265, pro: 18.3, carb: 3.6, fat: 20.8 },
    'tofu': { cal: 76, pro: 8.1, carb: 1.9, fat: 4.8 },
    'eggs': { cal: 155, pro: 12.6, carb: 1.1, fat: 10.6 },
    'dal': { cal: 116, pro: 7.6, carb: 20.1, fat: 0.4 },
    'rice': { cal: 130, pro: 2.7, carb: 28.2, fat: 0.3 },
    'whole wheat bread': { cal: 247, pro: 12.6, carb: 41.3, fat: 3.2 },
    'chia seeds': { cal: 486, pro: 16.5, carb: 42.1, fat: 30.7 },
    'pumpkin seeds': { cal: 446, pro: 18.6, carb: 53.8, fat: 19.4 },
    'sunflower seeds': { cal: 584, pro: 20.8, carb: 20.0, fat: 51.5 },
    'almonds': { cal: 579, pro: 21.2, carb: 21.6, fat: 49.9 },
    'raisins': { cal: 299, pro: 3.1, carb: 79.2, fat: 0.5 },
    'dates': { cal: 282, pro: 2.5, carb: 75.0, fat: 0.4 },
    'milk': { cal: 61, pro: 3.2, carb: 4.8, fat: 3.3 },
    'buttermilk': { cal: 40, pro: 3.3, carb: 4.9, fat: 0.9 },
    'chicken': { cal: 165, pro: 25.0, carb: 0.0, fat: 3.6 },
    'salad': { cal: 15, pro: 1.4, carb: 3.0, fat: 0.2 },
    'turmeric milk': { cal: 70, pro: 3.5, carb: 5.5, fat: 3.5 },
    'ashwagandha': { cal: 10, pro: 0.5, carb: 2.0, fat: 0.1 },
    'fish oil': { cal: 40, pro: 0.0, carb: 0.0, fat: 4.5 }
};

// ---- Auto-fill macros ----

function autoFillMacros() {
    const foodName = document.getElementById('food-name').value.toLowerCase().trim();
    const data = foodData[foodName];

    if (data) {
        document.getElementById('calories-per-100').value = data.cal;
        document.getElementById('protein-per-100').value = data.pro;
        document.getElementById('carbs-per-100').value = data.carb;
        document.getElementById('fats-per-100').value = data.fat;
        document.getElementById('fiber-per-100').value = data.fiber || 0;
        document.getElementById('vitamin-c-per-100').value = data.vitaminC || 0;
        document.getElementById('iron-per-100').value = data.iron || 0;
    } else {
        document.getElementById('calories-per-100').value = '';
        document.getElementById('protein-per-100').value = '';
        document.getElementById('carbs-per-100').value = '';
        document.getElementById('fats-per-100').value = '';
        document.getElementById('fiber-per-100').value = '';
        document.getElementById('vitamin-c-per-100').value = '';
        document.getElementById('iron-per-100').value = '';
    }
}

function calculateRealTimeMacros() {
    // Values are already ready when reading from the form on submit
}

// ---- Diet Plan Generator ----

function generateDietPlan() {
    const goal = localStorage.getItem('goal');
    const dietType = localStorage.getItem('dietType');
    const weight = parseFloat(localStorage.getItem('weight'));
    const activity = localStorage.getItem('activity');
    const age = parseFloat(localStorage.getItem('age'));
    const gender = localStorage.getItem('gender');
    const height = parseFloat(localStorage.getItem('height'));

    if (!goal || !dietType || !weight || !activity || !age || !gender || !height) {
        document.getElementById('diet-plan-output').textContent = 'Please save your profile details first.';
        return;
    }

    const bmr = calculateBMR(weight, height, age, gender);
    const maintenance = calculateMaintenanceCalories(bmr, activity);
    const goalCalories = calculateGoalCalories(maintenance, goal);

    const mealCalories = {
        breakfast: goalCalories * 0.25,
        brunch: goalCalories * 0.15,
        lunch: goalCalories * 0.30,
        dinner: goalCalories * 0.25,
        beforeBed: goalCalories * 0.05
    };

    let plan = '';
    let totalCal = 0, totalPro = 0, totalCarb = 0, totalFat = 0;

    plan += '🌅 BREAKFAST\n';
    const breakfastFoods = dietType === 'non-veg' ? ['rolled oats', 'eggs', 'milk'] : ['rolled oats', 'banana', 'milk'];
    const breakfast = buildMeal(breakfastFoods, mealCalories.breakfast);
    plan += breakfast.items;
    plan += `→ Total: ${breakfast.total.cal} kcal · ${breakfast.total.pro}g P · ${breakfast.total.carb}g C · ${breakfast.total.fat}g F\n\n`;
    totalCal += breakfast.total.cal; totalPro += breakfast.total.pro; totalCarb += breakfast.total.carb; totalFat += breakfast.total.fat;

    plan += '🥤 BRUNCH\n';
    const brunchFoods = ['apple', 'paneer'];
    const brunch = buildMeal(brunchFoods, mealCalories.brunch);
    plan += brunch.items;
    plan += `→ Total: ${brunch.total.cal} kcal · ${brunch.total.pro}g P · ${brunch.total.carb}g C · ${brunch.total.fat}g F\n\n`;
    totalCal += brunch.total.cal; totalPro += brunch.total.pro; totalCarb += brunch.total.carb; totalFat += brunch.total.fat;

    plan += '🍛 LUNCH\n';
    const lunchFoods = dietType === 'non-veg' ? ['dal', 'rice', 'chicken', 'salad'] : ['dal', 'rice', 'tofu', 'salad'];
    const lunch = buildMeal(lunchFoods, mealCalories.lunch);
    plan += lunch.items;
    plan += `→ Total: ${lunch.total.cal} kcal · ${lunch.total.pro}g P · ${lunch.total.carb}g C · ${lunch.total.fat}g F\n\n`;
    totalCal += lunch.total.cal; totalPro += lunch.total.pro; totalCarb += lunch.total.carb; totalFat += lunch.total.fat;

    plan += '🥗 DINNER\n';
    const dinnerFoods = ['whole wheat bread', 'paneer', 'salad'];
    const dinner = buildMeal(dinnerFoods, mealCalories.dinner);
    plan += dinner.items;
    plan += `→ Total: ${dinner.total.cal} kcal · ${dinner.total.pro}g P · ${dinner.total.carb}g C · ${dinner.total.fat}g F\n\n`;
    totalCal += dinner.total.cal; totalPro += dinner.total.pro; totalCarb += dinner.total.carb; totalFat += dinner.total.fat;

    plan += '🌙 BEFORE BED\n';
    const beforeBedFoods = ['turmeric milk'];
    const beforeBed = buildMeal(beforeBedFoods, mealCalories.beforeBed);
    plan += beforeBed.items;
    plan += `→ Total: ${beforeBed.total.cal} kcal · ${beforeBed.total.pro}g P · ${beforeBed.total.carb}g C · ${beforeBed.total.fat}g F\n\n`;
    totalCal += beforeBed.total.cal; totalPro += beforeBed.total.pro; totalCarb += beforeBed.total.carb; totalFat += beforeBed.total.fat;

    plan += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    plan += `📊 DAILY TOTAL\n`;
    plan += `   Calories: ${Math.round(totalCal)} kcal\n`;
    plan += `   Protein: ${Math.round(totalPro)}g\n`;
    plan += `   Carbs: ${Math.round(totalCarb)}g\n`;
    plan += `   Fat: ${Math.round(totalFat)}g`;

    document.getElementById('diet-plan-output').textContent = plan;
}

function buildMeal(foods, targetCal) {
    let items = '';
    let total = { cal: 0, pro: 0, carb: 0, fat: 0 };
    const portions = foods.map(() => Math.max(50, targetCal / foods.length / 2));

    foods.forEach((food, i) => {
        const qty = Math.round(portions[i]);
        const data = foodData[food];
        const cal = (data.cal * qty / 100).toFixed(0);
        const pro = (data.pro * qty / 100).toFixed(1);
        const carb = (data.carb * qty / 100).toFixed(1);
        const fat = (data.fat * qty / 100).toFixed(1);
        items += `  • ${food.replace(/^\w/, c => c.toUpperCase())} (${qty}g) — ${cal} kcal, ${pro}g P, ${carb}g C, ${fat}g F\n`;
        total.cal += parseFloat(cal); total.pro += parseFloat(pro); total.carb += parseFloat(carb); total.fat += parseFloat(fat);
    });
    total.cal = Math.round(total.cal); total.pro = Math.round(total.pro); total.carb = Math.round(total.carb); total.fat = Math.round(total.fat);
    return { items, total };
}

// ---- Workout Plan Generator ----

function generateWorkoutPlan() {
    const goal = localStorage.getItem('goal');

    if (!goal) {
        document.getElementById('workout-plan-output').textContent = 'Please save your profile details first.';
        return;
    }

    let plan = '';

    if (goal === 'fat-loss') {
        plan = `🏃 WEEKLY PLAN — FAT LOSS (Home-Based)

Monday — Cardio Focus
  • 30 min brisk walking / jogging in place
  • 3 × 10 bodyweight squats
  • 3 × 10 push-ups (knee or wall if needed)

Tuesday — Strength
  • 3 × 12 lunges per leg
  • 3 × 15 plank holds (20-30s)
  • 3 × 10 burpees

Wednesday — Cardio Focus
  • 30 min running / jumping jacks
  • 3 × 10 mountain climbers
  • 3 × 15 bicycle crunches

Thursday — Strength
  • 3 × 12 glute bridges
  • 3 × 10 pull-ups (assisted / inverted rows)
  • 3 × 15 leg raises

Friday — HIIT
  • 30 min intervals (1 min high / 1 min rest)
  • 3 × 10 jumping squats
  • 3 × 20 arm circles

Saturday — Full Body
  • 3 × 10 push-ups
  • 3 × 12 squats
  • 3 × 15 planks
  • 20 min cardio

Sunday — Rest Day 🧘
  • Light walk or complete rest

💡 Warm up 5 min before each session. Cool down with stretching.`;
    } else if (goal === 'muscle-gain') {
        plan = `💪 WEEKLY PLAN — MUSCLE GAIN (Home-Based)

Monday — Upper Body
  • 3 × 10 push-ups
  • 3 × 12 pike push-ups
  • 3 × 15 wall sits

Tuesday — Lower Body
  • 3 × 12 squats
  • 3 × 10 lunges per leg
  • 3 × 15 calf raises

Wednesday — Core
  • 3 × 20 crunches
  • 3 × 15 leg raises
  • 3 × 30s planks

Thursday — Upper Body
  • 3 × 10 diamond push-ups
  • 3 × 12 tricep dips (chair)
  • 3 × 15 shoulder taps

Friday — Lower Body
  • 3 × 12 glute bridges
  • 3 × 10 step-ups (stairs)
  • 3 × 15 donkey kicks per leg

Saturday — Full Body
  • 3 × 10 burpees
  • 3 × 12 mountain climbers
  • 3 × 15 bicycle crunches
  • 10 min light cardio

Sunday — Rest Day 🧘
  • Light walk or complete rest

💡 Focus on form. Use weights if available. Eat protein post-workout.`;
    } else {
        plan = `⚖️ WEEKLY PLAN — MAINTENANCE (Home-Based)

Monday — Cardio + Light Strength
  • 20 min walking / jogging
  • 3 × 10 bodyweight squats
  • 3 × 10 push-ups

Tuesday — Strength
  • 3 × 12 lunges per leg
  • 3 × 15 plank holds

Wednesday — Cardio
  • 25 min running / jumping jacks
  • 3 × 10 burpees

Thursday — Strength
  • 3 × 12 glute bridges
  • 3 × 10 pull-ups (assisted)

Friday — Cardio + Core
  • 20 min interval training
  • 3 × 20 crunches
  • 3 × 15 leg raises

Saturday — Full Body
  • 3 × 10 push-ups
  • 3 × 12 squats
  • 3 × 15 planks
  • 15 min cardio

Sunday — Rest Day 🧘
  • Light walk or complete rest

💡 Maintain consistency. Adjust based on energy levels.`;
    }

    document.getElementById('workout-plan-output').textContent = plan;
}

// ========================================
// UI INTERACTIONS
// ========================================

// ---- Sidebar Navigation ----

function initSidebar() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    let overlay = document.querySelector('.sidebar-overlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.classList.add('sidebar-overlay');
        document.body.appendChild(overlay);
    }

    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
        });
    });
}

// ---- Scroll Spy ----

function initScrollSpy() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    });

    sections.forEach(section => observer.observe(section));
}

// ---- Scroll Reveal ----

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const grids = document.querySelectorAll('.stats-grid');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));

    const gridObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                gridObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    grids.forEach(el => gridObserver.observe(el));
}

// ========================================
// INIT
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    runCalculations();
    runMacroCalculations();

    document.getElementById('user-form').addEventListener('submit', saveUserData);
    document.getElementById('food-form').addEventListener('submit', addFood);
    document.getElementById('food-name').addEventListener('input', autoFillMacros);
    document.getElementById('quantity').addEventListener('input', calculateRealTimeMacros);
    document.getElementById('generate-plan-btn').addEventListener('click', generateDietPlan);
    document.getElementById('generate-workout-btn').addEventListener('click', generateWorkoutPlan);

    initSidebar();
    initScrollSpy();
    initScrollReveal();
});