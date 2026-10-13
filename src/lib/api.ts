// Client for the NutriWork backend (see server/). The app never holds an AI API key.
import * as ImagePicker from 'expo-image-picker';

export const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
export const apiConfigured = !!API_URL;

type Macro = { kcal: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number; satFat: number; sodium: number };

export type RecognizedItem = {
  name: string;
  catalogueId: string | null;
  grams: number;
  per100g: Macro | null;
  cookingFat: { catalogueId: string; grams: number } | null;
  confidence: 'high' | 'medium' | 'low';
};
export type MealRecognition = { items: RecognizedItem[]; notes: string };

export type PantryDish = {
  name: string;
  cuisine: string;
  why: string;
  servings: number;
  minutes: number;
  ingredients: { name: string; grams: number; fromPhoto: boolean }[];
  steps: string[];
  perServing: Macro;
};
export type PantryIdeas = { ingredients: string[]; dishes: PantryDish[] };

export type PantryContext = {
  diet: string;
  allergies: string[];
  cuisines: string[];
  meal: string;
  targetKcal: number;
  targetProtein: number;
  lowOn: string[];
};

export type PickedImage = { uri: string; data: string; mediaType: 'image/jpeg' | 'image/png' | 'image/webp' };

export async function pickImage(source: 'camera' | 'library'): Promise<PickedImage | undefined> {
  const perm =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error(source === 'camera' ? 'Camera access is needed to take a photo.' : 'Photo access is needed to pick a photo.');
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], base64: true, quality: 0.6, allowsEditing: false };
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset?.base64) return undefined;
  const mime = asset.mimeType === 'image/png' || asset.mimeType === 'image/webp' ? asset.mimeType : 'image/jpeg';
  return { uri: asset.uri, data: asset.base64, mediaType: mime };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  if (!API_URL) throw new Error('Photo features need the NutriWork server. Set EXPO_PUBLIC_API_URL (see README).');
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Server error ${res.status}`);
  return json as T;
}

export function recognizeMeal(image: PickedImage) {
  return post<MealRecognition>('/v1/recognize-meal', { image: { data: image.data, mediaType: image.mediaType } });
}

export function pantryDishes(image: PickedImage, context: PantryContext) {
  return post<PantryIdeas>('/v1/pantry-dishes', { image: { data: image.data, mediaType: image.mediaType }, context });
}
