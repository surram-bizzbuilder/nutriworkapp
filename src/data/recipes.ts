// Built-in recipes. Each ingredient maps to a food in foods.ts (in the form the food
// table describes, e.g. cooked dal) so nutrition per serving is computed, not guessed.
// Spices and water have no `food` and don't count toward nutrition.
import { allowedFor, FOOD_BY_ID } from './foods';
import { Nutrients, scaleNutrients, sumNutrients } from '../lib/nutrients';
import { Allergy, Cuisine, Diet, MealSlot } from '../lib/profile';

export type Ingredient = { text: string; food?: string; grams?: number };

export type Recipe = {
  id: string;
  name: string;
  cuisine: Cuisine;
  meals: MealSlot[];
  minutes: number;
  servings: number;
  emoji: string;
  ingredients: Ingredient[];
  steps: string[];
};

export const RECIPES: Recipe[] = [
  {
    id: 'palak-paneer',
    name: 'Palak paneer',
    cuisine: 'indian',
    meals: ['lunch', 'dinner'],
    minutes: 30,
    servings: 2,
    emoji: '🥬',
    ingredients: [
      { text: '300 g spinach, washed', food: 'spinach', grams: 300 },
      { text: '150 g paneer, cubed', food: 'paneer', grams: 150 },
      { text: '1 medium onion, chopped', food: 'onion', grams: 110 },
      { text: '1 medium tomato, chopped', food: 'tomato', grams: 120 },
      { text: '2 tsp oil', food: 'oil_sunflower', grams: 9 },
      { text: '½ tsp salt', food: 'salt', grams: 3 },
      { text: '1 tsp ginger-garlic paste, 1 green chilli, ½ tsp cumin seeds, ½ tsp garam masala' },
    ],
    steps: [
      'Bring a pot of water to a boil. Add the spinach and blanch for 2 minutes.',
      'Drain the spinach and plunge it into cold water so it stays bright green.',
      'Blend the spinach with the green chilli into a smooth purée. Set aside.',
      'Heat the oil in a pan on medium heat. Add the cumin seeds and let them sizzle for 30 seconds.',
      'Add the onion and cook for 5 minutes until golden. Stir in the ginger-garlic paste for 1 minute.',
      'Add the tomato and salt. Cook for 4 minutes until soft and jammy.',
      'Pour in the spinach purée with ¼ cup water. Simmer for 5 minutes, stirring now and then.',
      'Add the paneer and garam masala. Simmer 2 more minutes so the paneer warms through. Serve hot.',
    ],
  },
  {
    id: 'masoor-dal',
    name: 'Masoor dal tadka',
    cuisine: 'indian',
    meals: ['lunch', 'dinner'],
    minutes: 25,
    servings: 3,
    emoji: '🍲',
    ingredients: [
      { text: '150 g red lentils (masoor), rinsed — about 450 g cooked', food: 'dal_masoor', grams: 450 },
      { text: '½ onion, finely chopped', food: 'onion', grams: 60 },
      { text: '1 medium tomato, chopped', food: 'tomato', grams: 120 },
      { text: '2 tsp oil or ghee', food: 'oil_sunflower', grams: 9 },
      { text: '¾ tsp salt', food: 'salt', grams: 4 },
      { text: '½ tsp turmeric, 1 tsp cumin seeds, 2 garlic cloves, 1 dried red chilli, lemon' },
    ],
    steps: [
      'Put the lentils, turmeric and 3 cups of water in a pot (or pressure cooker).',
      'Cook for 15 minutes on the stove (or 2 whistles) until the lentils are completely soft.',
      'Whisk the dal smooth, add the salt and thin with hot water if it is too thick.',
      'For the tadka, heat the oil in a small pan. Add the cumin, sliced garlic and red chilli.',
      'When the garlic turns light golden, add the onion and cook for 3 minutes, then the tomato for 3 more.',
      'Pour the tadka into the dal, simmer for 2 minutes and finish with a squeeze of lemon.',
    ],
  },
  {
    id: 'chicken-tikka',
    name: 'Grilled chicken tikka',
    cuisine: 'indian',
    meals: ['lunch', 'dinner'],
    minutes: 35,
    servings: 2,
    emoji: '🍗',
    ingredients: [
      { text: '300 g boneless chicken breast, cubed (about 225 g cooked)', food: 'chicken_breast', grams: 225 },
      { text: '100 g thick curd', food: 'curd', grams: 100 },
      { text: '1 tsp oil', food: 'oil_mustard', grams: 4.5 },
      { text: '½ tsp salt', food: 'salt', grams: 2.5 },
      { text: '1 bell pepper and 1 onion in chunks', food: 'bell_pepper', grams: 120 },
      { text: '1 tsp ginger-garlic paste, 1 tsp chilli powder, 1 tsp garam masala, ½ tsp turmeric, lemon' },
    ],
    steps: [
      'Mix the curd, oil, salt, ginger-garlic paste and all the spices in a bowl.',
      'Add the chicken and coat well. Marinate for at least 20 minutes (overnight in the fridge is best).',
      'Thread the chicken, pepper and onion onto skewers, or spread them on a lined tray.',
      'Grill or bake at 220 °C for 15–18 minutes, turning once, until charred at the edges.',
      'Check the thickest piece is no longer pink inside. Squeeze over lemon and serve.',
    ],
  },
  {
    id: 'veg-poha',
    name: 'Vegetable poha',
    cuisine: 'indian',
    meals: ['breakfast', 'snack'],
    minutes: 20,
    servings: 2,
    emoji: '🍛',
    ingredients: [
      { text: '100 g thick poha', food: 'poha', grams: 100 },
      { text: '½ onion, chopped', food: 'onion', grams: 60 },
      { text: '½ cup green peas', food: 'peas', grams: 70 },
      { text: '2 tbsp peanuts', food: 'peanuts', grams: 20 },
      { text: '2 tsp oil', food: 'oil_sunflower', grams: 9 },
      { text: '½ tsp salt', food: 'salt', grams: 2 },
      { text: '½ tsp mustard seeds, curry leaves, ¼ tsp turmeric, 1 green chilli, lemon, coriander' },
    ],
    steps: [
      'Rinse the poha in a sieve under running water for 20 seconds, then leave it to soften for 5 minutes.',
      'Heat the oil in a pan. Add the peanuts and roast for 2 minutes until crunchy, then remove them.',
      'Add the mustard seeds to the same oil. When they pop, add the curry leaves and green chilli.',
      'Add the onion and cook for 3 minutes. Add the peas and turmeric and cook for 2 minutes.',
      'Add the poha and salt, toss gently, cover and steam on low heat for 2 minutes.',
      'Stir in the peanuts, lemon juice and coriander. Serve warm.',
    ],
  },
  {
    id: 'moong-chilla',
    name: 'Moong dal chilla',
    cuisine: 'indian',
    meals: ['breakfast', 'snack'],
    minutes: 25,
    servings: 2,
    emoji: '🥞',
    ingredients: [
      { text: '100 g yellow moong dal, soaked 2 hours (batter ≈ 250 g cooked dal)', food: 'dal_moong', grams: 250 },
      { text: '½ onion, finely chopped', food: 'onion', grams: 50 },
      { text: '1 small tomato, finely chopped', food: 'tomato', grams: 60 },
      { text: '1½ tsp oil for the pan', food: 'oil_sunflower', grams: 7 },
      { text: '½ tsp salt', food: 'salt', grams: 2 },
      { text: '1 green chilli, small piece ginger, coriander, ¼ tsp cumin' },
    ],
    steps: [
      'Drain the soaked moong dal and blend it with the ginger, chilli and a little water into a smooth, pourable batter.',
      'Stir in the salt, cumin, onion, tomato and coriander.',
      'Heat a non-stick pan on medium and brush with a few drops of oil.',
      'Pour a ladle of batter in the centre and spread it into a thin circle.',
      'Cook for 2 minutes until the edges lift, flip and cook 1 more minute.',
      'Repeat with the rest of the batter. Serve with curd or green chutney.',
    ],
  },
  {
    id: 'egg-bhurji',
    name: 'Egg bhurji with roti',
    cuisine: 'indian',
    meals: ['breakfast', 'dinner'],
    minutes: 15,
    servings: 1,
    emoji: '🍳',
    ingredients: [
      { text: '3 eggs', food: 'egg', grams: 150 },
      { text: '½ onion, chopped', food: 'onion', grams: 50 },
      { text: '½ tomato, chopped', food: 'tomato', grams: 60 },
      { text: '1 tsp oil', food: 'oil_sunflower', grams: 4.5 },
      { text: '2 whole wheat rotis', food: 'roti', grams: 80 },
      { text: 'pinch of salt', food: 'salt', grams: 1 },
      { text: '¼ tsp turmeric, ¼ tsp chilli powder, coriander' },
    ],
    steps: [
      'Beat the eggs with the salt, turmeric and chilli powder.',
      'Heat the oil in a pan and cook the onion for 3 minutes until soft.',
      'Add the tomato and cook for 2 minutes.',
      'Pour in the eggs and stir slowly on low heat for 2–3 minutes until just set.',
      'Sprinkle coriander and serve with warm rotis.',
    ],
  },
  {
    id: 'rajma-chawal',
    name: 'Rajma chawal',
    cuisine: 'indian',
    meals: ['lunch', 'dinner'],
    minutes: 45,
    servings: 2,
    emoji: '🫘',
    ingredients: [
      { text: '2 cups cooked kidney beans (from 120 g dry, soaked overnight)', food: 'rajma', grams: 340 },
      { text: '2 cups cooked rice', food: 'rice_white', grams: 320 },
      { text: '1 onion, chopped', food: 'onion', grams: 110 },
      { text: '2 tomatoes, puréed', food: 'tomato', grams: 240 },
      { text: '2 tsp oil', food: 'oil_sunflower', grams: 9 },
      { text: '¾ tsp salt', food: 'salt', grams: 3 },
      { text: '1 tsp ginger-garlic paste, 1 tsp rajma or garam masala, ½ tsp chilli powder, 1 tsp cumin seeds' },
    ],
    steps: [
      'Pressure-cook the soaked rajma with 3 cups of water for 6–7 whistles until very soft. Keep the cooking water.',
      'Heat the oil, add the cumin seeds, then the onion. Cook for 6 minutes until deep golden.',
      'Add the ginger-garlic paste for 1 minute, then the tomato purée, salt and spices.',
      'Cook the masala for 8 minutes until the oil separates.',
      'Add the rajma with 1 cup of its cooking water. Mash a few beans to thicken and simmer for 10 minutes.',
      'Serve over the rice.',
    ],
  },
  {
    id: 'fish-curry',
    name: 'Coconut fish curry',
    cuisine: 'indian',
    meals: ['lunch', 'dinner'],
    minutes: 30,
    servings: 2,
    emoji: '🐟',
    ingredients: [
      { text: '300 g firm white fish (rohu or tilapia) in pieces', food: 'fish_white', grams: 300 },
      { text: '1 onion, sliced', food: 'onion', grams: 110 },
      { text: '1 tomato, chopped', food: 'tomato', grams: 120 },
      { text: '2 tbsp grated coconut', food: 'coconut', grams: 20 },
      { text: '2 tsp mustard oil', food: 'oil_mustard', grams: 9 },
      { text: '½ tsp salt', food: 'salt', grams: 2.5 },
      { text: '1 cup cooked rice per person', food: 'rice_white', grams: 320 },
      { text: '½ tsp turmeric, 1 tsp chilli powder, curry leaves, tamarind' },
    ],
    steps: [
      'Rub the fish with half the salt and the turmeric. Set aside for 10 minutes.',
      'Blend the coconut with ½ cup water into a smooth paste.',
      'Heat the oil, add curry leaves and onion and cook for 5 minutes.',
      'Add the tomato, chilli powder and remaining salt. Cook for 4 minutes until soft.',
      'Stir in the coconut paste and a little tamarind with 1 cup water. Bring to a gentle simmer.',
      'Slide in the fish and simmer for 6–8 minutes without stirring hard, until it flakes. Serve with rice.',
    ],
  },
  {
    id: 'chickpea-bowl',
    name: 'Mediterranean chickpea bowl',
    cuisine: 'mediterranean',
    meals: ['lunch', 'dinner'],
    minutes: 15,
    servings: 1,
    emoji: '🥗',
    ingredients: [
      { text: '1 cup cooked chickpeas', food: 'chickpeas', grams: 160 },
      { text: '½ cucumber, diced', food: 'cucumber', grams: 100 },
      { text: '1 tomato, diced', food: 'tomato', grams: 100 },
      { text: 'Handful of salad greens', food: 'lettuce', grams: 60 },
      { text: '¼ red onion', food: 'onion', grams: 30 },
      { text: '1 tsp olive oil', food: 'oil_olive', grams: 4.5 },
      { text: '2 tbsp hummus', food: 'hummus', grams: 30 },
      { text: 'pinch of salt', food: 'salt', grams: 1 },
      { text: 'Lemon, dried oregano, black pepper' },
    ],
    steps: [
      'Rinse and drain the chickpeas.',
      'Dice the cucumber, tomato and onion.',
      'Whisk the olive oil with lemon juice, oregano, salt and pepper.',
      'Toss everything except the hummus with the dressing.',
      'Serve over the greens with the hummus on the side.',
    ],
  },
  {
    id: 'overnight-oats',
    name: 'Protein overnight oats',
    cuisine: 'american',
    meals: ['breakfast'],
    minutes: 5,
    servings: 1,
    emoji: '🥣',
    ingredients: [
      { text: '½ cup rolled oats', food: 'oats', grams: 40 },
      { text: '½ cup milk', food: 'milk_toned', grams: 120 },
      { text: '100 g Greek yogurt or hung curd', food: 'greek_yogurt', grams: 100 },
      { text: '1 tbsp chia seeds', food: 'chia', grams: 12 },
      { text: '½ banana, sliced', food: 'banana', grams: 60 },
      { text: 'Pinch of cinnamon' },
    ],
    steps: [
      'In a jar, stir together the oats, milk, yogurt, chia seeds and cinnamon.',
      'Cover and refrigerate overnight (at least 4 hours).',
      'In the morning, stir, top with the banana and eat cold.',
    ],
  },
  {
    id: 'tofu-stir-fry',
    name: 'Tofu and broccoli stir-fry',
    cuisine: 'eastAsian',
    meals: ['lunch', 'dinner'],
    minutes: 20,
    servings: 2,
    emoji: '🥦',
    ingredients: [
      { text: '200 g firm tofu, pressed and cubed', food: 'tofu', grams: 200 },
      { text: '2 cups broccoli florets', food: 'broccoli', grams: 180 },
      { text: '1 bell pepper, sliced', food: 'bell_pepper', grams: 120 },
      { text: '2 cups cooked rice', food: 'rice_white', grams: 320 },
      { text: '2 tsp oil', food: 'oil_sunflower', grams: 9 },
      { text: '1 tbsp low-sodium soy sauce (about 0.5 g salt)', food: 'salt', grams: 0.8 },
      { text: '2 garlic cloves, small piece ginger, 1 tsp cornflour, chilli flakes' },
    ],
    steps: [
      'Pat the tofu dry and toss it with the cornflour.',
      'Heat 1 tsp oil in a wok on high heat. Fry the tofu for 6 minutes until golden on all sides, then remove.',
      'Add the remaining oil, garlic and ginger. Stir for 30 seconds.',
      'Add the broccoli and pepper with 2 tbsp water. Stir-fry for 4 minutes until bright and just tender.',
      'Return the tofu, add the soy sauce and chilli flakes and toss for 1 minute.',
      'Serve over the rice.',
    ],
  },
  {
    id: 'bean-tacos',
    name: 'Black bean tacos',
    cuisine: 'mexican',
    meals: ['lunch', 'dinner'],
    minutes: 15,
    servings: 2,
    emoji: '🌮',
    ingredients: [
      { text: '4 corn tortillas', food: 'tortilla_corn', grams: 104 },
      { text: '1 cup cooked black beans', food: 'black_beans', grams: 170 },
      { text: '1 tomato, diced', food: 'tomato', grams: 80 },
      { text: '¼ onion, diced', food: 'onion', grams: 30 },
      { text: '½ avocado', food: 'avocado', grams: 70 },
      { text: '1 tsp oil', food: 'oil_sunflower', grams: 4.5 },
      { text: 'pinch of salt', food: 'salt', grams: 1 },
      { text: 'Cumin, chilli, lime, coriander' },
    ],
    steps: [
      'Heat the oil in a pan, add the beans, cumin and chilli and warm for 3 minutes. Mash lightly.',
      'Mix the tomato, onion, coriander, lime and salt for a quick salsa.',
      'Warm the tortillas in a dry pan for 30 seconds a side.',
      'Fill each tortilla with beans, salsa and sliced avocado.',
    ],
  },
  {
    id: 'salmon-plate',
    name: 'Salmon, sweet potato and greens',
    cuisine: 'american',
    meals: ['lunch', 'dinner'],
    minutes: 30,
    servings: 2,
    emoji: '🍣',
    ingredients: [
      { text: '2 salmon fillets', food: 'salmon', grams: 240 },
      { text: '2 sweet potatoes, cubed', food: 'sweet_potato', grams: 260 },
      { text: '2 cups broccoli', food: 'broccoli', grams: 180 },
      { text: '2 tsp olive oil', food: 'oil_olive', grams: 9 },
      { text: '½ tsp salt', food: 'salt', grams: 2 },
      { text: 'Black pepper, paprika, lemon' },
    ],
    steps: [
      'Heat the oven to 210 °C and line a tray.',
      'Toss the sweet potato with half the oil, half the salt and paprika. Roast for 15 minutes.',
      'Push the potato aside, add the salmon and broccoli and brush them with the remaining oil and salt.',
      'Roast for 10–12 minutes until the salmon flakes easily.',
      'Finish with lemon and pepper.',
    ],
  },
];

export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

export function recipeTotals(r: Recipe): Nutrients {
  return sumNutrients(
    r.ingredients
      .filter((i) => i.food && i.grams && FOOD_BY_ID[i.food])
      .map((i) => scaleNutrients(FOOD_BY_ID[i.food!].per100g, i.grams! / 100)),
  );
}

export function perServing(r: Recipe): Nutrients {
  return scaleNutrients(recipeTotals(r), 1 / r.servings);
}

export function servingGrams(r: Recipe): number {
  return r.ingredients.reduce((s, i) => s + (i.food ? i.grams ?? 0 : 0), 0) / r.servings;
}

export function recipeAllowed(r: Recipe, diet: Diet, allergies: Allergy[]): boolean {
  return r.ingredients.every((i) => !i.food || !FOOD_BY_ID[i.food] || allowedFor(FOOD_BY_ID[i.food], diet, allergies));
}
