// Claude vision calls: meal photo -> foods with gram estimates (oil included), and
// ingredient photo -> the most nutrient-efficient dishes the user can cook.
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';

import { FOODS } from '../../src/data/foods';

const MODEL = 'claude-opus-5-5';
const client = new Anthropic();

export type ImageInput = { data: string; mediaType: 'image/jpeg' | 'image/png' | 'image/webp' };

const CATALOGUE = FOODS.map((f) => `${f.id}: ${f.name}${f.aliases ? ` (${f.aliases.join(', ')})` : ''}`).join('\n');

const Per100g = z.object({
  kcal: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number(),
  sugar: z.number(),
  satFat: z.number(),
  sodium: z.number().describe('mg'),
});

const MealItem = z.object({
  name: z.string().describe('What the user would call this food, e.g. "Chicken biryani"'),
  catalogueId: z.string().nullable().describe('Matching id from the catalogue, or null if nothing fits'),
  grams: z.number().describe('Estimated edible weight on the plate, excluding added cooking fat'),
  per100g: Per100g.nullable().describe('Required when catalogueId is null: nutrition per 100 g of the food without added fat'),
  cookingFat: z
    .object({ catalogueId: z.string().describe('One of the fat ids, e.g. oil_sunflower, ghee'), grams: z.number() })
    .nullable()
    .describe('Oil, ghee or butter absorbed in or visible on this portion'),
  confidence: z.enum(['high', 'medium', 'low']),
});

const MealResult = z.object({
  items: z.array(MealItem),
  notes: z.string().describe('One short sentence the user should check, e.g. portion uncertainty'),
});
export type MealRecognition = z.infer<typeof MealResult>;

const MEAL_SYSTEM = `You are a dietitian estimating what is on a plate from a photo.
For each distinct food, estimate the edible weight in grams using visual cues (plate ~26 cm, katori ~150 ml, spoon sizes, hands).
Prefer a catalogue id when the food matches; composite dishes (biryani, curry, pasta with sauce) that are not in the catalogue get catalogueId null and your best per-100 g estimate for the dish without added fat.
Always account for cooking fat separately in cookingFat: fried, tempered (tadka), sautéed, restaurant-style or glossy foods carry oil; Indian curries typically have 1-3 tsp (4.5 g per tsp) per serving. Steamed, boiled, raw or plain grilled foods usually carry none.
If the photo shows no food, return an empty items list and say so in notes.

Catalogue (id: name):
${CATALOGUE}`;

export async function recognizeMeal(image: ImageInput): Promise<MealRecognition> {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: betaZodOutputFormat(MealResult) },
    system: MEAL_SYSTEM,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
          { type: 'text', text: 'Identify every food on this plate with gram estimates.' },
        ],
      },
    ],
  });
  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    throw new Error('Could not analyse this photo. Please try another one.');
  }
  return response.parsed_output;
}

const Dish = z.object({
  name: z.string(),
  cuisine: z.string(),
  why: z.string().describe('One sentence on why this dish is the most nutrient-efficient choice for the user right now'),
  servings: z.number(),
  minutes: z.number(),
  ingredients: z.array(z.object({ name: z.string(), grams: z.number(), fromPhoto: z.boolean() })),
  steps: z.array(z.string()).describe('Clear numbered-style cooking steps, one action each'),
  perServing: Per100g.describe('Estimated nutrition for ONE serving including cooking fat'),
});

const PantryResult = z.object({
  ingredients: z.array(z.string()).describe('Ingredients visible in the photo'),
  dishes: z.array(Dish).describe('Two or three dishes, best first'),
});
export type PantryIdeas = z.infer<typeof PantryResult>;

export type PantryContext = {
  diet: string;
  allergies: string[];
  cuisines: string[];
  meal: string;
  targetKcal: number;
  targetProtein: number;
  lowOn: string[];
};

export async function dishesFromIngredients(image: ImageInput, ctx: PantryContext): Promise<PantryIdeas> {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: betaZodOutputFormat(PantryResult) },
    system:
      'You are a practical home cook and dietitian. Suggest dishes that use mainly the ingredients in the photo plus common pantry staples (salt, spices, a little oil, water). Pick the dishes that best fit the nutrition target, keep oil modest, and write steps a beginner can follow.',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
          {
            type: 'text',
            text: `These are the ingredients I have. I'm cooking ${ctx.meal}.
Diet: ${ctx.diet}. Avoid: ${ctx.allergies.join(', ') || 'nothing'}. I enjoy: ${ctx.cuisines.join(', ')}.
Aim per serving: about ${Math.round(ctx.targetKcal)} kcal and ${Math.round(ctx.targetProtein)} g protein.
I'm low today on: ${ctx.lowOn.join(', ') || 'nothing in particular'}.`,
          },
        ],
      },
    ],
  });
  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    throw new Error('Could not suggest dishes from this photo. Please try another one.');
  }
  return response.parsed_output;
}
