// Built-in food table, values per 100 g, approximated from USDA FoodData Central
// (SR Legacy / Foundation) and the Indian Food Composition Tables. Cooked items are
// listed WITHOUT added oil or ghee: oil is logged separately so it is always counted.
// Online search (Open Food Facts / USDA) extends this list when the device is online.
import { NUTRIENT_KEYS, Nutrients } from '../lib/nutrients';
import { Allergy, Cuisine, Diet } from '../lib/profile';

export type FoodCategory =
  | 'grain'
  | 'legume'
  | 'dairy'
  | 'egg'
  | 'meat'
  | 'seafood'
  | 'vegetable'
  | 'fruit'
  | 'nut'
  | 'fat'
  | 'other';

export type Food = {
  id: string;
  name: string;
  aliases?: string[];
  category: FoodCategory;
  per100g: Nutrients;
  unit?: { name: string; grams: number };
  // Lowest diet level that may eat this: vegan < vegetarian < eggetarian < nonveg.
  diet: Diet;
  allergens?: Allergy[];
  cuisines?: Cuisine[];
  source: 'builtin' | 'openfoodfacts' | 'usda' | 'photo' | 'recipe';
};

// kcal, protein, carbs, fat, fiber, sugar, satFat, sodium, potassium, calcium, iron,
// magnesium, zinc, vitA(µg RAE), vitC, vitD(µg), b12(µg), folate(µg DFE)
type Row = [
  id: string,
  name: string,
  category: FoodCategory,
  diet: Diet,
  values: number[],
  extra?: Partial<Pick<Food, 'unit' | 'aliases' | 'allergens' | 'cuisines'>>,
];

const ROWS: Row[] = [
  // Grains and starches
  ['rice_white', 'White rice, cooked', 'grain', 'vegan', [130, 2.7, 28.2, 0.3, 0.4, 0.1, 0.1, 1, 35, 10, 0.2, 12, 0.5, 0, 0, 0, 0, 3], { unit: { name: 'cup', grams: 160 }, aliases: ['chawal', 'steamed rice'], cuisines: ['indian', 'eastAsian'] }],
  ['rice_brown', 'Brown rice, cooked', 'grain', 'vegan', [123, 2.7, 25.6, 1, 1.6, 0.2, 0.3, 4, 86, 3, 0.6, 39, 0.7, 0, 0, 0, 0, 9], { unit: { name: 'cup', grams: 160 } }],
  ['roti', 'Roti / chapati (whole wheat, no ghee)', 'grain', 'vegan', [264, 8.7, 52, 2.4, 7, 1.5, 0.4, 10, 250, 30, 2.7, 90, 1.9, 0, 0, 0, 0, 40], { unit: { name: 'roti', grams: 40 }, aliases: ['phulka', 'chapati'], allergens: ['gluten'], cuisines: ['indian'] }],
  ['naan', 'Naan', 'grain', 'vegetarian', [291, 9.6, 50.6, 5.7, 2.2, 3.6, 1.4, 465, 125, 76, 3.2, 21, 0.9, 0, 0, 0, 0, 82], { unit: { name: 'naan', grams: 90 }, allergens: ['gluten', 'dairy'], cuisines: ['indian'] }],
  ['oats', 'Rolled oats, dry', 'grain', 'vegan', [379, 13.2, 67.7, 6.5, 10.1, 1, 1.1, 6, 362, 52, 4.3, 138, 3.6, 0, 0, 0, 0, 32], { unit: { name: 'half cup', grams: 40 }, aliases: ['oatmeal', 'porridge'] }],
  ['bread_ww', 'Whole wheat bread', 'grain', 'vegan', [252, 12.4, 42.7, 3.5, 6, 4.4, 0.7, 450, 250, 160, 2.5, 76, 1.8, 0, 0, 0, 0, 42], { unit: { name: 'slice', grams: 32 }, allergens: ['gluten'], cuisines: ['american'] }],
  ['quinoa', 'Quinoa, cooked', 'grain', 'vegan', [120, 4.4, 21.3, 1.9, 2.8, 0.9, 0.2, 7, 172, 17, 1.5, 64, 1.1, 0, 0, 0, 0, 42], { unit: { name: 'cup', grams: 185 }, cuisines: ['mediterranean'] }],
  ['pasta', 'Pasta, cooked', 'grain', 'vegan', [158, 5.8, 30.9, 0.9, 1.8, 0.6, 0.2, 1, 44, 7, 0.5, 18, 0.5, 0, 0, 0, 0, 7], { unit: { name: 'cup', grams: 140 }, allergens: ['gluten'], cuisines: ['mediterranean'] }],
  ['poha', 'Poha (flattened rice), dry', 'grain', 'vegan', [346, 6.6, 77, 1.2, 2, 0, 0.2, 5, 100, 20, 8, 40, 1, 0, 0, 0, 0, 10], { unit: { name: 'cup', grams: 50 }, cuisines: ['indian'] }],
  ['idli', 'Idli', 'grain', 'vegan', [130, 4.5, 27, 0.4, 1.5, 0.3, 0.1, 250, 70, 15, 0.8, 20, 0.5, 0, 0, 0, 0, 15], { unit: { name: 'idli', grams: 40 }, cuisines: ['indian'] }],
  ['dosa', 'Dosa (no added oil)', 'grain', 'vegan', [140, 3.9, 29, 0.7, 1.5, 0.5, 0.1, 300, 90, 15, 0.9, 25, 0.6, 0, 0, 0, 0, 16], { unit: { name: 'dosa', grams: 80 }, cuisines: ['indian'] }],
  ['tortilla_corn', 'Corn tortilla', 'grain', 'vegan', [218, 5.7, 44.6, 2.9, 6.3, 0.9, 0.4, 45, 186, 81, 1.2, 72, 1.3, 0, 0, 0, 0, 5], { unit: { name: 'tortilla', grams: 26 }, cuisines: ['mexican'] }],
  ['potato', 'Potato, boiled', 'vegetable', 'vegan', [87, 1.9, 20.1, 0.1, 1.8, 0.9, 0, 4, 379, 5, 0.3, 22, 0.3, 0, 13, 0, 0, 10], { unit: { name: 'medium', grams: 150 }, aliases: ['aloo'] }],
  ['sweet_potato', 'Sweet potato, baked', 'vegetable', 'vegan', [90, 2, 20.7, 0.2, 3.3, 6.5, 0.1, 36, 475, 38, 0.7, 27, 0.3, 961, 19.6, 0, 0, 6], { unit: { name: 'medium', grams: 130 }, aliases: ['shakarkandi'] }],
  ['corn', 'Sweet corn, cooked', 'vegetable', 'vegan', [96, 3.4, 21, 1.5, 2.4, 4.5, 0.2, 1, 218, 3, 0.5, 26, 0.6, 13, 5.5, 0, 0, 23], { unit: { name: 'cup', grams: 150 }, aliases: ['bhutta'], cuisines: ['mexican', 'american'] }],

  // Legumes and plant proteins (cooked weights, unsalted unless noted)
  ['dal_toor', 'Toor dal, cooked (salted, no tadka)', 'legume', 'vegan', [121, 6.8, 23, 0.4, 6.7, 0, 0.1, 200, 384, 43, 1.1, 46, 0.9, 0, 0, 0, 0, 111], { unit: { name: 'katori', grams: 150 }, aliases: ['arhar dal', 'dal', 'lentil curry'], cuisines: ['indian'] }],
  ['dal_masoor', 'Masoor dal / red lentils, cooked', 'legume', 'vegan', [116, 9, 20.1, 0.4, 7.9, 1.8, 0.1, 2, 369, 19, 3.3, 36, 1.3, 8, 1.5, 0, 0, 181], { unit: { name: 'katori', grams: 150 }, aliases: ['lentils'], cuisines: ['indian', 'middleEastern'] }],
  ['dal_moong', 'Moong dal, cooked', 'legume', 'vegan', [105, 7, 19, 0.4, 7.6, 2, 0.1, 2, 266, 27, 1.4, 48, 0.8, 1, 1, 0, 0, 159], { unit: { name: 'katori', grams: 150 }, aliases: ['mung beans'], cuisines: ['indian'] }],
  ['chickpeas', 'Chickpeas, cooked', 'legume', 'vegan', [164, 8.9, 27.4, 2.6, 7.6, 4.8, 0.3, 7, 291, 49, 2.9, 48, 1.5, 1, 1.3, 0, 0, 172], { unit: { name: 'cup', grams: 160 }, aliases: ['chana', 'chole', 'garbanzo'], cuisines: ['indian', 'mediterranean', 'middleEastern'] }],
  ['rajma', 'Kidney beans, cooked', 'legume', 'vegan', [127, 8.7, 22.8, 0.5, 6.4, 0.3, 0.1, 2, 405, 35, 2.9, 45, 1, 0, 1.2, 0, 0, 130], { unit: { name: 'cup', grams: 170 }, aliases: ['rajma'], cuisines: ['indian', 'mexican'] }],
  ['black_beans', 'Black beans, cooked', 'legume', 'vegan', [132, 8.9, 23.7, 0.5, 8.7, 0.3, 0.1, 1, 355, 27, 2.1, 70, 1.1, 0, 0, 0, 0, 149], { unit: { name: 'cup', grams: 170 }, cuisines: ['mexican'] }],
  ['sprouts', 'Moong sprouts, raw', 'legume', 'vegan', [30, 3, 5.9, 0.2, 1.8, 4.1, 0, 6, 149, 13, 0.9, 21, 0.4, 1, 13.2, 0, 0, 61], { unit: { name: 'cup', grams: 100 }, cuisines: ['indian'] }],
  ['tofu', 'Tofu, firm', 'legume', 'vegan', [144, 17.3, 2.8, 8.7, 2.3, 0.6, 1.3, 14, 237, 683, 2.7, 58, 1.6, 0, 0, 0, 0, 29], { unit: { name: 'block slice', grams: 85 }, allergens: ['soy'], cuisines: ['eastAsian'] }],
  ['soy_chunks', 'Soya chunks, dry', 'legume', 'vegan', [345, 52, 33, 0.5, 13, 0, 0.1, 20, 2400, 240, 9.2, 290, 2.5, 0, 0, 0, 0, 300], { unit: { name: 'cup', grams: 30 }, aliases: ['nutrela', 'tvp'], allergens: ['soy'], cuisines: ['indian'] }],
  ['hummus', 'Hummus', 'legume', 'vegan', [166, 7.9, 14.3, 9.6, 6, 0.3, 1.4, 379, 228, 38, 2.4, 71, 1.8, 1, 0, 0, 0, 83], { unit: { name: 'tbsp', grams: 15 }, cuisines: ['middleEastern', 'mediterranean'] }],

  // Dairy and eggs
  ['milk_whole', 'Milk, whole', 'dairy', 'vegetarian', [61, 3.2, 4.8, 3.3, 0, 5.1, 1.9, 43, 132, 113, 0, 10, 0.4, 46, 0, 1.3, 0.45, 5], { unit: { name: 'glass', grams: 240 }, aliases: ['doodh'], allergens: ['dairy'] }],
  ['milk_toned', 'Milk, toned / 2%', 'dairy', 'vegetarian', [50, 3.3, 4.8, 2, 0, 5.1, 1.1, 47, 140, 120, 0, 11, 0.5, 55, 0.2, 1.2, 0.5, 5], { unit: { name: 'glass', grams: 240 }, allergens: ['dairy'] }],
  ['curd', 'Curd / plain yogurt', 'dairy', 'vegetarian', [61, 3.5, 4.7, 3.3, 0, 4.7, 2.1, 46, 155, 121, 0.1, 12, 0.6, 27, 0.5, 0.1, 0.4, 7], { unit: { name: 'katori', grams: 150 }, aliases: ['dahi', 'yoghurt'], allergens: ['dairy'], cuisines: ['indian', 'middleEastern'] }],
  ['greek_yogurt', 'Greek yogurt, nonfat', 'dairy', 'vegetarian', [59, 10.2, 3.6, 0.4, 0, 3.2, 0.1, 36, 141, 110, 0.1, 11, 0.5, 1, 0, 0, 0.75, 7], { unit: { name: 'cup', grams: 170 }, aliases: ['hung curd'], allergens: ['dairy'], cuisines: ['mediterranean'] }],
  ['paneer', 'Paneer', 'dairy', 'vegetarian', [296, 19.1, 3.6, 22.8, 0, 2.6, 14.6, 25, 130, 480, 0.2, 25, 2.7, 200, 0, 0.3, 0.8, 10], { unit: { name: 'cube (25 g)', grams: 25 }, aliases: ['cottage cheese'], allergens: ['dairy'], cuisines: ['indian'] }],
  ['cheddar', 'Cheddar cheese', 'dairy', 'vegetarian', [403, 24.9, 1.3, 33.1, 0, 0.5, 21, 621, 98, 721, 0.7, 28, 3.1, 265, 0, 0.6, 0.8, 18], { unit: { name: 'slice', grams: 20 }, allergens: ['dairy'], cuisines: ['american'] }],
  ['soy_milk', 'Soy milk, unsweetened (fortified)', 'dairy', 'vegan', [43, 2.9, 1.7, 2, 0.5, 1, 0.3, 48, 120, 123, 0.4, 16, 0.3, 60, 0, 1.1, 1.1, 10], { unit: { name: 'glass', grams: 240 }, allergens: ['soy'] }],
  ['whey', 'Whey protein powder (typical)', 'dairy', 'vegetarian', [400, 80, 8, 6, 0, 5, 3, 300, 500, 400, 1, 100, 2, 0, 0, 0, 1.5, 20], { unit: { name: 'scoop', grams: 30 }, allergens: ['dairy'] }],
  ['egg', 'Egg, whole (boiled)', 'egg', 'eggetarian', [155, 12.6, 1.1, 10.6, 0, 1.1, 3.3, 124, 126, 50, 1.2, 10, 1.1, 149, 0, 2.2, 1.1, 44], { unit: { name: 'egg', grams: 50 }, aliases: ['anda', 'omelette'], allergens: ['egg'] }],
  ['egg_white', 'Egg white', 'egg', 'eggetarian', [52, 10.9, 0.7, 0.2, 0, 0.7, 0, 166, 163, 7, 0.1, 11, 0, 0, 0, 0, 0.1, 4], { unit: { name: 'white', grams: 33 }, allergens: ['egg'] }],

  // Meat and seafood (cooked, no added fat)
  ['chicken_breast', 'Chicken breast, cooked', 'meat', 'nonveg', [165, 31, 0, 3.6, 0, 0, 1, 74, 256, 15, 1, 29, 1, 6, 0, 0.1, 0.3, 4], { unit: { name: 'palm-size piece', grams: 100 } }],
  ['chicken_thigh', 'Chicken thigh, cooked', 'meat', 'nonveg', [209, 26, 0, 10.9, 0, 0, 3, 95, 240, 12, 1.3, 23, 2.4, 20, 0, 0.1, 0.3, 8], { unit: { name: 'thigh', grams: 90 } }],
  ['mutton', 'Mutton / goat, cooked', 'meat', 'nonveg', [143, 27.1, 0, 3, 0, 0, 0.9, 86, 405, 17, 3.7, 25, 5.3, 0, 0, 0, 1.2, 5], { unit: { name: 'serving', grams: 100 }, cuisines: ['indian', 'middleEastern'] }],
  ['beef_lean', 'Lean beef, cooked', 'meat', 'nonveg', [217, 26.1, 0, 11.8, 0, 0, 4.6, 72, 359, 12, 2.7, 23, 6.3, 0, 0, 0.1, 2.6, 9], { unit: { name: 'serving', grams: 100 }, cuisines: ['american', 'mexican'] }],
  ['salmon', 'Salmon, cooked', 'seafood', 'nonveg', [206, 22.1, 0, 12.4, 0, 0, 2.5, 61, 384, 15, 0.3, 30, 0.4, 50, 3.7, 13.1, 2.8, 34], { unit: { name: 'fillet', grams: 120 }, allergens: ['seafood'] }],
  ['tuna', 'Tuna, canned in water', 'seafood', 'nonveg', [116, 25.5, 0, 0.8, 0, 0, 0.2, 338, 237, 11, 1.5, 27, 0.8, 17, 0, 1.7, 2.5, 4], { unit: { name: 'can', grams: 140 }, allergens: ['seafood'] }],
  ['fish_white', 'White fish (rohu/tilapia), cooked', 'seafood', 'nonveg', [128, 26.2, 0, 2.7, 0, 0, 0.9, 56, 380, 14, 0.7, 34, 0.4, 0, 0, 3.7, 1.9, 6], { unit: { name: 'piece', grams: 100 }, aliases: ['machli', 'fish curry fish'], allergens: ['seafood'], cuisines: ['indian'] }],
  ['shrimp', 'Shrimp / prawns, cooked', 'seafood', 'nonveg', [99, 24, 0.2, 0.3, 0, 0, 0.1, 224, 259, 70, 0.5, 39, 1.6, 54, 0, 0.1, 1.7, 19], { unit: { name: 'serving', grams: 100 }, aliases: ['jhinga'], allergens: ['seafood'] }],

  // Vegetables
  ['spinach', 'Spinach / palak', 'vegetable', 'vegan', [23, 2.9, 3.6, 0.4, 2.2, 0.4, 0.1, 79, 558, 99, 2.7, 79, 0.5, 469, 28.1, 0, 0, 194], { unit: { name: 'cup cooked', grams: 180 }, aliases: ['palak'] }],
  ['broccoli', 'Broccoli', 'vegetable', 'vegan', [34, 2.8, 6.6, 0.4, 2.6, 1.7, 0, 33, 316, 47, 0.7, 21, 0.4, 31, 89.2, 0, 0, 63], { unit: { name: 'cup', grams: 90 } }],
  ['tomato', 'Tomato', 'vegetable', 'vegan', [18, 0.9, 3.9, 0.2, 1.2, 2.6, 0, 5, 237, 10, 0.3, 11, 0.2, 42, 13.7, 0, 0, 15], { unit: { name: 'medium', grams: 120 }, aliases: ['tamatar'] }],
  ['onion', 'Onion', 'vegetable', 'vegan', [40, 1.1, 9.3, 0.1, 1.7, 4.2, 0, 4, 146, 23, 0.2, 10, 0.2, 0, 7.4, 0, 0, 19], { unit: { name: 'medium', grams: 110 }, aliases: ['pyaz'] }],
  ['carrot', 'Carrot', 'vegetable', 'vegan', [41, 0.9, 9.6, 0.2, 2.8, 4.7, 0, 69, 320, 33, 0.3, 12, 0.2, 835, 5.9, 0, 0, 19], { unit: { name: 'medium', grams: 60 }, aliases: ['gajar'] }],
  ['cucumber', 'Cucumber', 'vegetable', 'vegan', [15, 0.7, 3.6, 0.1, 0.5, 1.7, 0, 2, 147, 16, 0.3, 13, 0.2, 5, 2.8, 0, 0, 7], { unit: { name: 'medium', grams: 200 }, aliases: ['kheera'] }],
  ['cauliflower', 'Cauliflower', 'vegetable', 'vegan', [25, 1.9, 5, 0.3, 2, 1.9, 0.1, 30, 299, 22, 0.4, 15, 0.3, 0, 48.2, 0, 0, 57], { unit: { name: 'cup', grams: 100 }, aliases: ['gobi'] }],
  ['okra', 'Okra / bhindi', 'vegetable', 'vegan', [33, 1.9, 7.5, 0.2, 3.2, 1.5, 0, 7, 299, 82, 0.6, 57, 0.6, 36, 23, 0, 0, 60], { unit: { name: 'cup', grams: 100 }, aliases: ['bhindi', 'ladyfinger'] }],
  ['peas', 'Green peas', 'vegetable', 'vegan', [81, 5.4, 14.5, 0.4, 5.7, 5.7, 0.1, 5, 244, 25, 1.5, 33, 1.2, 38, 40, 0, 0, 65], { unit: { name: 'cup', grams: 145 }, aliases: ['matar'] }],
  ['bell_pepper', 'Bell pepper (red)', 'vegetable', 'vegan', [31, 1, 6, 0.3, 2.1, 4.2, 0, 4, 211, 7, 0.4, 12, 0.3, 157, 127.7, 0, 0, 46], { unit: { name: 'medium', grams: 120 }, aliases: ['capsicum'] }],
  ['mushroom', 'Mushrooms', 'vegetable', 'vegan', [22, 3.1, 3.3, 0.3, 1, 2, 0, 5, 318, 3, 0.5, 9, 0.5, 0, 2.1, 0.2, 0.04, 17], { unit: { name: 'cup', grams: 70 } }],
  ['lettuce', 'Salad greens', 'vegetable', 'vegan', [15, 1.4, 2.9, 0.2, 1.3, 0.8, 0, 28, 194, 36, 0.9, 13, 0.2, 370, 9.2, 0, 0, 38], { unit: { name: 'bowl', grams: 60 } }],
  ['beetroot', 'Beetroot, boiled', 'vegetable', 'vegan', [44, 1.7, 10, 0.2, 2, 8, 0, 77, 305, 16, 0.8, 23, 0.4, 2, 3.6, 0, 0, 80], { unit: { name: 'medium', grams: 80 }, aliases: ['chukandar'] }],
  ['avocado', 'Avocado', 'fruit', 'vegan', [160, 2, 8.5, 14.7, 6.7, 0.7, 2.1, 7, 485, 12, 0.6, 29, 0.6, 7, 10, 0, 0, 81], { unit: { name: 'half', grams: 70 }, cuisines: ['mexican', 'american'] }],

  // Fruit
  ['banana', 'Banana', 'fruit', 'vegan', [89, 1.1, 22.8, 0.3, 2.6, 12.2, 0.1, 1, 358, 5, 0.3, 27, 0.2, 3, 8.7, 0, 0, 20], { unit: { name: 'medium', grams: 118 }, aliases: ['kela'] }],
  ['apple', 'Apple', 'fruit', 'vegan', [52, 0.3, 13.8, 0.2, 2.4, 10.4, 0, 1, 107, 6, 0.1, 5, 0, 3, 4.6, 0, 0, 3], { unit: { name: 'medium', grams: 180 }, aliases: ['seb'] }],
  ['orange', 'Orange', 'fruit', 'vegan', [47, 0.9, 11.8, 0.1, 2.4, 9.4, 0, 0, 181, 40, 0.1, 10, 0.1, 11, 53.2, 0, 0, 30], { unit: { name: 'medium', grams: 130 }, aliases: ['santra'] }],
  ['mango', 'Mango', 'fruit', 'vegan', [60, 0.8, 15, 0.4, 1.6, 13.7, 0.1, 1, 168, 11, 0.2, 10, 0.1, 54, 36.4, 0, 0, 43], { unit: { name: 'cup', grams: 165 }, aliases: ['aam'] }],
  ['papaya', 'Papaya', 'fruit', 'vegan', [43, 0.5, 10.8, 0.3, 1.7, 7.8, 0.1, 8, 182, 20, 0.3, 21, 0.1, 47, 60.9, 0, 0, 37], { unit: { name: 'cup', grams: 145 } }],
  ['guava', 'Guava', 'fruit', 'vegan', [68, 2.6, 14.3, 1, 5.4, 8.9, 0.3, 2, 417, 18, 0.3, 22, 0.2, 31, 228.3, 0, 0, 49], { unit: { name: 'medium', grams: 100 }, aliases: ['amrood'] }],
  ['strawberries', 'Strawberries', 'fruit', 'vegan', [32, 0.7, 7.7, 0.3, 2, 4.9, 0, 1, 153, 16, 0.4, 13, 0.1, 1, 58.8, 0, 0, 24], { unit: { name: 'cup', grams: 150 }, aliases: ['berries'] }],

  // Nuts and seeds
  ['almonds', 'Almonds', 'nut', 'vegan', [579, 21.2, 21.6, 49.9, 12.5, 4.4, 3.8, 1, 733, 269, 3.7, 270, 3.1, 0, 0, 0, 0, 44], { unit: { name: '10 almonds', grams: 12 }, aliases: ['badam'], allergens: ['nuts'] }],
  ['peanuts', 'Peanuts, roasted', 'nut', 'vegan', [567, 25.8, 16.1, 49.2, 8.5, 4, 6.3, 18, 705, 92, 4.6, 168, 3.3, 0, 0, 0, 0, 240], { unit: { name: 'handful', grams: 28 }, aliases: ['moongphali'], allergens: ['nuts'] }],
  ['walnuts', 'Walnuts', 'nut', 'vegan', [654, 15.2, 13.7, 65.2, 6.7, 2.6, 6.1, 2, 441, 98, 2.9, 158, 3.1, 1, 1.3, 0, 0, 98], { unit: { name: 'handful', grams: 28 }, aliases: ['akhrot'], allergens: ['nuts'] }],
  ['peanut_butter', 'Peanut butter', 'nut', 'vegan', [588, 25, 20, 50, 6, 9, 10, 17, 649, 43, 1.9, 154, 2.5, 0, 0, 0, 0, 87], { unit: { name: 'tbsp', grams: 16 }, allergens: ['nuts'] }],
  ['chia', 'Chia seeds', 'nut', 'vegan', [486, 16.5, 42.1, 30.7, 34.4, 0, 3.3, 16, 407, 631, 7.7, 335, 4.6, 2, 1.6, 0, 0, 49], { unit: { name: 'tbsp', grams: 12 } }],
  ['pumpkin_seeds', 'Pumpkin seeds', 'nut', 'vegan', [559, 30.2, 10.7, 49, 6, 1.4, 8.7, 7, 809, 46, 8.8, 592, 7.8, 1, 1.9, 0, 0, 58], { unit: { name: 'tbsp', grams: 10 } }],
  ['coconut', 'Coconut, fresh', 'nut', 'vegan', [354, 3.3, 15.2, 33.5, 9, 6.2, 29.7, 20, 356, 14, 2.4, 32, 1.1, 0, 3.3, 0, 0, 26], { unit: { name: 'tbsp grated', grams: 10 }, aliases: ['nariyal'], cuisines: ['indian'] }],

  // Cooking fats (always log the oil used!)
  ['oil_sunflower', 'Sunflower / vegetable oil', 'fat', 'vegan', [884, 0, 0, 100, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], { unit: { name: 'tsp', grams: 4.5 }, aliases: ['refined oil', 'cooking oil'] }],
  ['oil_mustard', 'Mustard oil', 'fat', 'vegan', [884, 0, 0, 100, 0, 0, 11.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], { unit: { name: 'tsp', grams: 4.5 }, aliases: ['sarson'], cuisines: ['indian'] }],
  ['oil_olive', 'Olive oil', 'fat', 'vegan', [884, 0, 0, 100, 0, 0, 13.8, 2, 1, 1, 0.6, 0, 0, 0, 0, 0, 0, 0], { unit: { name: 'tsp', grams: 4.5 }, cuisines: ['mediterranean'] }],
  ['oil_coconut', 'Coconut oil', 'fat', 'vegan', [892, 0, 0, 99, 0, 0, 82.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], { unit: { name: 'tsp', grams: 4.5 }, cuisines: ['indian'] }],
  ['ghee', 'Ghee', 'fat', 'vegetarian', [900, 0, 0, 100, 0, 0, 62, 2, 5, 4, 0, 0, 0, 840, 0, 0, 0, 0], { unit: { name: 'tsp', grams: 5 }, allergens: ['dairy'], cuisines: ['indian'] }],
  ['butter', 'Butter, salted', 'fat', 'vegetarian', [717, 0.9, 0.1, 81, 0, 0.1, 51, 643, 24, 24, 0, 2, 0.1, 684, 0, 1.5, 0.2, 3], { unit: { name: 'tsp', grams: 5 }, allergens: ['dairy'] }],

  // Other
  ['sugar', 'Sugar', 'other', 'vegan', [387, 0, 100, 0, 0, 100, 0, 1, 2, 1, 0.1, 0, 0, 0, 0, 0, 0, 0], { unit: { name: 'tsp', grams: 4 }, aliases: ['cheeni'] }],
  ['jaggery', 'Jaggery', 'other', 'vegan', [383, 0.4, 98, 0.1, 0, 85, 0, 30, 1050, 85, 11, 70, 0.6, 0, 0, 0, 0, 0], { unit: { name: 'tsp', grams: 5 }, aliases: ['gur'], cuisines: ['indian'] }],
  ['honey', 'Honey', 'other', 'vegan', [304, 0.3, 82.4, 0, 0.2, 82.1, 0, 4, 52, 6, 0.4, 2, 0.2, 0, 0.5, 0, 0, 2], { unit: { name: 'tsp', grams: 7 } }],
  ['salt', 'Salt (added)', 'other', 'vegan', [0, 0, 0, 0, 0, 0, 0, 38758, 8, 24, 0.3, 1, 0.1, 0, 0, 0, 0, 0], { unit: { name: 'pinch', grams: 0.4 }, aliases: ['namak'] }],
  ['coffee', 'Coffee, black', 'other', 'vegan', [2, 0.3, 0, 0, 0, 0, 0, 2, 49, 2, 0, 3, 0, 0, 0, 0, 0, 2], { unit: { name: 'cup', grams: 240 } }],
  ['tea', 'Tea, plain', 'other', 'vegan', [1, 0, 0.3, 0, 0, 0, 0, 3, 37, 0, 0, 3, 0, 0, 0, 0, 0, 5], { unit: { name: 'cup', grams: 240 }, aliases: ['chai'] }],
];

function toNutrients(values: number[]): Nutrients {
  return Object.fromEntries(NUTRIENT_KEYS.map((k, i) => [k, values[i] ?? 0])) as Nutrients;
}

export const FOODS: Food[] = ROWS.map(([id, name, category, diet, values, extra]) => ({
  id,
  name,
  category,
  diet,
  per100g: toNutrients(values),
  source: 'builtin',
  ...extra,
}));

export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]));

export const COOKING_OILS = FOODS.filter((f) => f.category === 'fat');

const DIET_RANK: Record<Diet, number> = { vegan: 0, vegetarian: 1, eggetarian: 2, nonveg: 3 };

export function allowedFor(food: Food, diet: Diet, allergies: Allergy[]): boolean {
  if (DIET_RANK[food.diet] > DIET_RANK[diet]) return false;
  // Eggetarians eat eggs and dairy; vegetarians do not eat eggs.
  if (diet === 'vegetarian' && food.category === 'egg') return false;
  return !(food.allergens ?? []).some((a) => allergies.includes(a));
}

export function searchFoods(query: string, limit = 25): Food[] {
  const q = query.trim().toLowerCase();
  if (!q) return FOODS.slice(0, limit);
  const scored = FOODS.map((f) => {
    const names = [f.name, ...(f.aliases ?? [])].map((n) => n.toLowerCase());
    let score = 0;
    for (const n of names) {
      if (n === q) score = Math.max(score, 100);
      else if (n.startsWith(q)) score = Math.max(score, 60);
      else if (n.split(/[\s/,()]+/).some((w) => w.startsWith(q))) score = Math.max(score, 40);
      else if (n.includes(q)) score = Math.max(score, 20);
    }
    return { f, score };
  }).filter((s) => s.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.f);
}
